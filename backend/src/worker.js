// Cloudflare Worker — AI proxy for English Star Quest.
//
// Hides API keys, enforces daily cost cap, tracks combined spend across providers.
//
// Routes:
//   GET  /api/health        → { ok, spent_today_cents, cap_cents, providers: {...} }
//   POST /api/chat          → Anthropic Claude — { content, model, usage, cost_cents }
//   POST /api/tts           → OpenAI TTS — returns audio/mpeg bytes
//   POST /api/transcribe    → OpenAI Whisper — returns { transcript }
//
// Bindings required (configured in wrangler.toml):
//   ANTHROPIC_API_KEY   (secret) — Claude chat brain
//   OPENAI_API_KEY      (secret) — TTS + Whisper STT (voice in/out)
//   USAGE               (KV)     — daily spend tracker (all providers combined)
//   CACHE               (KV)     — chat reply cache for common prompts
//
// Vars in wrangler.toml [vars]:
//   DAILY_CAP_CENTS     — soft stop when reached (e.g. "200" = $2/day)
//   DEFAULT_MODEL       — Claude model id (e.g. "claude-sonnet-4-6")
//   ALLOWED_ORIGINS     — comma-separated list (or "*" for dev)

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const OPENAI_TTS_URL  = 'https://api.openai.com/v1/audio/speech';
const OPENAI_STT_URL  = 'https://api.openai.com/v1/audio/transcriptions';

// Token prices in micro-cents (1/1,000,000 of a cent).
// Claude: per-token. OpenAI TTS: per-char input. Whisper: per-minute.
const PRICING = {
  // Anthropic (per token)
  'claude-sonnet-4-6': { in: 300, out: 1500 },
  'claude-opus-4-7':   { in: 1500, out: 7500 },
  'claude-haiku-4-5':  { in: 80,   out: 400  },
  // OpenAI TTS (per 1M characters of input) — tts-1: $15/M, tts-1-hd: $30/M
  'tts-1':    { perChar: 15 },     // micro-cents per char (15 = $15 / 1M chars)
  'tts-1-hd': { perChar: 30 },
  // OpenAI Whisper (per minute of audio) — $0.006/min = 600 micro-cents
  'whisper-1': { perMinute: 600 }
};

function corsHeaders(origin, allowed) {
  const list = (allowed || '').split(',').map(s => s.trim()).filter(Boolean);
  const allow = list.length === 0 || list.includes('*') || (origin && list.includes(origin))
    ? (origin || '*')
    : list[0] || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, init, cors) {
  return new Response(JSON.stringify(data), {
    ...(init || {}),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(cors || {}),
      ...((init && init.headers) || {})
    }
  });
}

function todayKey() {
  return 'spend:' + new Date().toISOString().slice(0, 10);
}

async function getSpentCents(env) {
  if (!env.USAGE) return 0;
  const v = await env.USAGE.get(todayKey());
  return v ? parseInt(v, 10) || 0 : 0;
}

async function addSpentCents(env, cents) {
  if (!env.USAGE || !cents) return;
  const cur = await getSpentCents(env);
  const next = cur + Math.max(0, Math.round(cents));
  await env.USAGE.put(todayKey(), String(next), { expirationTtl: 60 * 60 * 48 });
}

// Cap check — returns true if over budget (caller should refuse).
async function isCapExceeded(env) {
  const cap = parseInt(env.DAILY_CAP_CENTS || '200', 10);
  const spent = await getSpentCents(env);
  return spent >= cap;
}

function costCentsClaude(model, usage) {
  const p = PRICING[model] || PRICING['claude-sonnet-4-6'];
  if (!usage) return 0;
  const microCents = (usage.input_tokens || 0) * p.in + (usage.output_tokens || 0) * p.out;
  return microCents / 1_000_000;
}

function costCentsTTS(model, charCount) {
  const p = PRICING[model] || PRICING['tts-1'];
  return (charCount * p.perChar) / 1_000_000;
}

function costCentsWhisper(model, minutes) {
  const p = PRICING[model] || PRICING['whisper-1'];
  return (minutes * p.perMinute) / 1_000_000;
}

// ───────────────────────── Routes ─────────────────────────

async function handleHealth(env, cors) {
  const spent = await getSpentCents(env);
  const cap = parseInt(env.DAILY_CAP_CENTS || '200', 10);
  return json({
    ok: true,
    spent_today_cents: spent,
    cap_cents: cap,
    remaining_cents: Math.max(0, cap - spent),
    model_default: env.DEFAULT_MODEL || 'claude-sonnet-4-6',
    providers: {
      anthropic: !!env.ANTHROPIC_API_KEY,
      openai_tts: !!env.OPENAI_API_KEY,
      openai_whisper: !!env.OPENAI_API_KEY
    }
  }, { status: 200 }, cors);
}

async function handleChat(request, env, cors) {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'Server is missing ANTHROPIC_API_KEY' }, { status: 500 }, cors);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, { status: 400 }, cors); }

  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return json({ error: 'messages array required' }, { status: 400 }, cors);
  }

  const model = body.model || env.DEFAULT_MODEL || 'claude-sonnet-4-6';
  const maxTokens = Math.min(parseInt(body.max_tokens, 10) || 600, 2000);
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
  const system = body.system || '';
  const cacheKey = body.cache_key || null;

  if (await isCapExceeded(env)) {
    return json({
      error: 'daily_cap_exceeded',
      message: 'Daily AI budget reached — please try again tomorrow.'
    }, { status: 429 }, cors);
  }

  if (cacheKey && env.CACHE) {
    const cached = await env.CACHE.get('reply:' + cacheKey, 'json');
    if (cached) return json({ ...cached, cached: true }, { status: 200 }, cors);
  }

  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature, system, messages })
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '');
    return json({ error: 'upstream_error', status: upstream.status, detail: errText.slice(0, 1000) }, { status: 502 }, cors);
  }

  const data = await upstream.json();
  const cents = costCentsClaude(model, data.usage);
  await addSpentCents(env, cents);

  const content = Array.isArray(data.content)
    ? data.content.filter(b => b.type === 'text').map(b => b.text).join('')
    : '';

  const reply = {
    content,
    model: data.model || model,
    usage: data.usage,
    cost_cents: Number(cents.toFixed(4)),
    stop_reason: data.stop_reason
  };

  if (cacheKey && env.CACHE) {
    await env.CACHE.put('reply:' + cacheKey, JSON.stringify(reply), { expirationTtl: 60 * 60 * 24 * 60 });
  }

  return json(reply, { status: 200 }, cors);
}

// OpenAI TTS — returns raw audio/mpeg bytes that the frontend plays via <audio>.
async function handleTTS(request, env, cors) {
  if (!env.OPENAI_API_KEY) {
    return json({ error: 'Server is missing OPENAI_API_KEY' }, { status: 500 }, cors);
  }
  if (await isCapExceeded(env)) {
    return json({ error: 'daily_cap_exceeded' }, { status: 429 }, cors);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, { status: 400 }, cors); }

  const text = (body.text || '').toString().slice(0, 4000); // hard cap input length
  if (!text) return json({ error: 'text required' }, { status: 400 }, cors);

  const model = body.model || 'tts-1';                // tts-1 = cheaper, tts-1-hd = better
  const voice = body.voice || 'nova';                 // nova = warm female, kid-friendly
  const speed = Math.max(0.25, Math.min(parseFloat(body.speed) || 1.0, 4.0));
  const format = body.format || 'mp3';

  const upstream = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + env.OPENAI_API_KEY
    },
    body: JSON.stringify({ model, input: text, voice, speed, response_format: format })
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '');
    return json({ error: 'tts_upstream_error', status: upstream.status, detail: errText.slice(0, 500) }, { status: 502 }, cors);
  }

  const cents = costCentsTTS(model, text.length);
  await addSpentCents(env, cents);

  const audio = await upstream.arrayBuffer();
  return new Response(audio, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      'X-Cost-Cents': Number(cents.toFixed(4)).toString(),
      ...cors
    }
  });
}

// OpenAI Whisper — accepts audio multipart upload, returns transcript text.
async function handleTranscribe(request, env, cors) {
  if (!env.OPENAI_API_KEY) {
    return json({ error: 'Server is missing OPENAI_API_KEY' }, { status: 500 }, cors);
  }
  if (await isCapExceeded(env)) {
    return json({ error: 'daily_cap_exceeded' }, { status: 429 }, cors);
  }

  // Forward the incoming multipart body straight to OpenAI.
  // Worker streams the FormData through — we reconstruct it to inject model + language.
  let formData;
  try { formData = await request.formData(); }
  catch { return json({ error: 'multipart form-data required' }, { status: 400 }, cors); }

  const audio = formData.get('audio') || formData.get('file');
  if (!audio) return json({ error: 'audio field required' }, { status: 400 }, cors);

  const language = formData.get('language') || 'en';  // 'en' or 'th' or auto if blank
  const model    = formData.get('model')    || 'whisper-1';

  const out = new FormData();
  out.append('file', audio, audio.name || 'audio.webm');
  out.append('model', model);
  if (language) out.append('language', language);
  out.append('response_format', 'json');
  out.append('temperature', '0');  // deterministic transcription

  const upstream = await fetch(OPENAI_STT_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.OPENAI_API_KEY },
    body: out
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '');
    return json({ error: 'whisper_upstream_error', status: upstream.status, detail: errText.slice(0, 500) }, { status: 502 }, cors);
  }

  const data = await upstream.json();

  // Estimate duration for cost — Whisper doesn't return duration in basic response,
  // so we estimate ~150 chars/minute (rough English speaking rate) as a safety upper bound.
  // Actual cost ≈ $0.006/min. For typical 5-15 sec voice messages: ~$0.001-0.002.
  const charCount = (data.text || '').length;
  const estimatedMinutes = Math.max(0.05, charCount / 150);  // floor 3 sec
  const cents = costCentsWhisper(model, estimatedMinutes);
  await addSpentCents(env, cents);

  return json({
    transcript: data.text || '',
    cost_cents: Number(cents.toFixed(4))
  }, { status: 200 }, cors);
}

// ───────────────────────── Entry ─────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const path = url.pathname.replace(/^\/api/, '') || '/';

    if (path === '/health'     && request.method === 'GET')  return handleHealth(env, cors);
    if (path === '/chat'       && request.method === 'POST') return handleChat(request, env, cors);
    if (path === '/tts'        && request.method === 'POST') return handleTTS(request, env, cors);
    if (path === '/transcribe' && request.method === 'POST') return handleTranscribe(request, env, cors);

    return json({ error: 'not_found', path: url.pathname }, { status: 404 }, cors);
  }
};
