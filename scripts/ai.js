// AI client — talks to the Cloudflare Worker proxy (never to Anthropic directly,
// API key must stay on the server). Browser-native Web Speech API for STT/TTS.
//
// Phase 1 ships skeleton + connectivity test. Phase 4 uses these in real lessons.

window.AI = (function() {
  // The Worker URL is set by app.js at boot from window.AI_ENDPOINT.
  // Defaults to same-origin '/api' so it Just Works on Cloudflare Pages + bound Worker.
  function endpoint() {
    return (window.AI_ENDPOINT || '/api').replace(/\/$/, '');
  }

  // Calls the Worker's /chat route. Worker handles the Claude call, caching, and cost cap.
  // messages: [{ role: 'user'|'assistant', content: '...' }]
  // opts: { system, model, maxTokens, temperature, cacheKey }
  async function chat(messages, opts) {
    opts = opts || {};
    const res = await fetch(endpoint() + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        system: opts.system,
        model: opts.model,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        cache_key: opts.cacheKey
      })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error('AI request failed (' + res.status + '): ' + text);
    }
    return res.json();
  }

  // Simple connectivity check — calls Worker's /health route.
  async function health() {
    try {
      const res = await fetch(endpoint() + '/health', { method: 'GET' });
      if (!res.ok) return { ok: false, status: res.status };
      return await res.json();
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // ───────────────────────── OpenAI TTS (preferred) ─────────────────────────
  // Fetches mp3 from the Worker /tts route and plays via <audio>. Falls back to
  // browser SpeechSynthesis if Worker is offline or TTS isn't configured.

  // Track ALL concurrent activity — single-var tracking lost references when
  // multiple speak() calls overlapped, causing zombie audio. Sets fix this.
  const _activeSources = new Set();    // Web Audio AudioBufferSourceNode currently playing
  const _activeAudios  = new Set();    // HTML5 Audio elements currently playing
  const _pendingAborts = new Set();    // AbortControllers for in-flight TTS fetches
  let _audioContext = null;
  let _audioUnlocked = false;
  // Legacy aliases for old code paths
  let _currentAudio = null;
  let _currentSource = null;

  // iOS Safari unlock — MUST be called inside a user gesture (button click).
  // Creates a persistent AudioContext that bypasses HTML5 Audio's quiet "ambient"
  // session and routes through full-volume "playback" session.
  function unlockAudio() {
    if (_audioUnlocked) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        _audioContext = new AC();
        const buffer = _audioContext.createBuffer(1, 1, 22050);
        const src = _audioContext.createBufferSource();
        src.buffer = buffer;
        src.connect(_audioContext.destination);
        src.start(0);
        if (_audioContext.state === 'suspended') _audioContext.resume();
      }
      _audioUnlocked = true;
    } catch (e) {
      _audioUnlocked = true;
    }
  }

  function _ensureAudioContext() {
    if (_audioContext && _audioContext.state !== 'closed') {
      if (_audioContext.state === 'suspended') _audioContext.resume();
      return _audioContext;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _audioContext = new AC();
    return _audioContext;
  }

  // Platform-aware audio boost — iOS needs heavy compressor + 4.5x gain to be loud,
  // desktop needs much less (1.4x, no compressor) to avoid clipping/distortion.
  const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
               || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  async function speakOpenAI(text, opts) {
    opts = opts || {};

    // STOP every previous playback + fetch before starting new one — no overlap
    stopSpeak();

    const aborter = new AbortController();
    _pendingAborts.add(aborter);

    let res;
    try {
      res = await fetch(endpoint() + '/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: aborter.signal,
        body: JSON.stringify({
          text: text,
          voice: opts.voice || window.AI_OPENAI_VOICE || 'nova',
          speed: opts.speed || 1.0,
          model: opts.model || 'tts-1'
        })
      });
    } catch (e) {
      _pendingAborts.delete(aborter);
      if (e.name === 'AbortError') return;
      throw e;
    }
    _pendingAborts.delete(aborter);
    if (!res.ok) throw new Error('tts failed: ' + res.status);
    if (aborter.signal.aborted) return;
    const arrayBuffer = await res.arrayBuffer();
    if (aborter.signal.aborted) return;

    const ctx = _ensureAudioContext();
    if (!ctx) throw new Error('no audio context');

    return new Promise((resolve) => {
      const onDecoded = (audioBuffer) => {
        const src = ctx.createBufferSource();
        src.buffer = audioBuffer;

        const gainValue = opts.gain || (_isIOS ? 4.5 : 1.3);

        const gain = ctx.createGain();
        gain.gain.value = gainValue;

        if (_isIOS) {
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.value = -24;
          compressor.knee.value      = 30;
          compressor.ratio.value     = 12;
          compressor.attack.value    = 0.003;
          compressor.release.value   = 0.25;
          src.connect(compressor);
          compressor.connect(gain);
        } else {
          src.connect(gain);
        }
        gain.connect(ctx.destination);
        // If aborted between decode and start, don't actually play
        if (aborter.signal.aborted) { resolve(); return; }
        src.start(0);
        _activeSources.add(src);
        _currentSource = src;
        if (opts.onStart) try { opts.onStart(audioBuffer.duration); } catch (e) {}
        src.onended = () => {
          _activeSources.delete(src);
          if (_currentSource === src) _currentSource = null;
          resolve();
        };
      };
      const onErr = () => resolve();
      try {
        const result = ctx.decodeAudioData(arrayBuffer, onDecoded, onErr);
        if (result && typeof result.then === 'function') {
          result.then(onDecoded).catch(onErr);
        }
      } catch (e) {
        resolve();
      }
    });
  }

  // ───────────────────────── Browser SpeechSynthesis (fallback) ─────────────────────────
  function _pickVoice(voices, lang) {
    if (!voices || !voices.length) return null;
    // Prefer Apple voices on iOS, Google voices on Android/Chrome
    const langPrefix = (lang || 'en').slice(0, 2);
    return (
      voices.find(v => v.lang.startsWith(langPrefix) && /samantha|karen|moira|tessa/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith(langPrefix) && /premium|enhanced|natural/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith(langPrefix) && v.localService) ||
      voices.find(v => v.lang.startsWith(langPrefix)) ||
      null
    );
  }

  function _speakOnce(text, opts) {
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = opts.lang || 'en-US';
      u.rate = opts.rate || 1.0;
      u.pitch = opts.pitch || 1.0;
      u.volume = opts.volume || 1.0;
      const v = _pickVoice(speechSynthesis.getVoices(), u.lang);
      if (v) u.voice = v;
      u.onstart = () => { if (opts.onStart) try { opts.onStart(); } catch (e) {} };
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  // Main speak() — selects voice source based on user preference.
  //   AI_VOICE = 'openai' (default — premium nova) | 'siri' (loud iPad Siri) | 'auto' (openai with siri fallback)
  // User can switch via window.AI_VOICE = 'siri' if OpenAI volume is unsatisfying.
  async function speak(text, opts) {
    opts = opts || {};
    if (!text) return;
    const pref = window.AI_VOICE || 'openai';

    if (pref === 'siri') {
      return speakSiri(text, opts);
    }
    // openai or auto: try OpenAI first
    try {
      await speakOpenAI(text, opts);
      return;
    } catch (e) {}
    if (pref === 'openai') return;  // strict openai — don't fall back
    if (!('speechSynthesis' in window)) return;

    return speakSiri(text, opts);
  }

  function speakSiri(text, opts) {
    if (!('speechSynthesis' in window)) return Promise.resolve();
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      return new Promise(resolve => {
        let resolved = false;
        const onLoaded = () => {
          if (resolved) return;
          resolved = true;
          speechSynthesis.removeEventListener('voiceschanged', onLoaded);
          _speakOnce(text, opts).then(resolve);
        };
        speechSynthesis.addEventListener('voiceschanged', onLoaded);
        setTimeout(onLoaded, 400);
      });
    }
    return _speakOnce(text, opts);
  }

  function stopSpeak() {
    // Abort EVERY in-flight fetch
    _pendingAborts.forEach(a => { try { a.abort(); } catch (e) {} });
    _pendingAborts.clear();
    // Stop EVERY active Web Audio source
    _activeSources.forEach(s => { try { s.stop(); } catch (e) {} });
    _activeSources.clear();
    _currentSource = null;
    // Pause EVERY active HTML5 audio element
    _activeAudios.forEach(a => { try { a.pause(); a.src = ''; } catch (e) {} });
    _activeAudios.clear();
    _currentAudio = null;
    // Cancel SpeechSynthesis (Siri path)
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch (e) {}
    }
    try { window.dispatchEvent(new CustomEvent('ai-speak-stopped')); } catch (e) {}
  }

  function isSpeaking() {
    if (_activeSources.size > 0) return true;
    if (_activeAudios.size > 0) {
      for (const a of _activeAudios) if (!a.paused) return true;
    }
    if ('speechSynthesis' in window && speechSynthesis.speaking) return true;
    return false;
  }

  // Diagnostic — returns info about available voices (useful for debugging iOS).
  function voiceInfo() {
    if (!('speechSynthesis' in window)) return { supported: false };
    const voices = speechSynthesis.getVoices();
    return {
      supported: true,
      count: voices.length,
      english: voices.filter(v => v.lang.startsWith('en')).map(v => v.name + ' (' + v.lang + ')')
    };
  }

  // ───────────────────────── OpenAI Whisper (preferred) ─────────────────────────
  // Records mic audio via MediaRecorder, uploads to Worker /transcribe, returns text.
  // Falls back to browser Web Speech API if mic permission denied or Worker offline.

  let _activeRecorder = null;

  async function recordAudio(opts) {
    opts = opts || {};
    const maxMs = opts.maxMs || 12000;  // hard stop after 12 sec
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Pick best supported mime — iOS Safari prefers audio/mp4, Chrome prefers webm
    const mimeCandidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    let mime = '';
    for (const m of mimeCandidates) {
      if (MediaRecorder.isTypeSupported(m)) { mime = m; break; }
    }
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    _activeRecorder = rec;
    const chunks = [];
    return new Promise((resolve, reject) => {
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        _activeRecorder = null;
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        resolve(blob);
      };
      rec.onerror = (e) => {
        stream.getTracks().forEach(t => t.stop());
        _activeRecorder = null;
        reject(e.error || new Error('recording error'));
      };
      try { rec.start(); } catch (e) { reject(e); return; }
      if (opts.onStart) opts.onStart(rec);
      // Auto-stop after maxMs
      setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, maxMs);
    });
  }

  function stopRecording() {
    if (_activeRecorder && _activeRecorder.state === 'recording') {
      try { _activeRecorder.stop(); } catch (e) {}
    }
  }

  async function transcribe(blob, lang) {
    // Pick file extension based on actual blob type so Whisper accepts it
    const type = blob.type || '';
    let ext = 'webm';
    if (type.includes('mp4'))  ext = 'm4a';
    if (type.includes('ogg'))  ext = 'ogg';
    if (type.includes('wav'))  ext = 'wav';
    if (type.includes('mpeg')) ext = 'mp3';

    const form = new FormData();
    form.append('audio', blob, 'voice.' + ext);
    if (lang) form.append('language', lang);

    const res = await fetch(endpoint() + '/transcribe', { method: 'POST', body: form });
    if (!res.ok) throw new Error('transcribe failed: ' + res.status);
    const data = await res.json();
    return data.transcript || '';
  }

  // Main listen() — STRATEGY based on window.AI_STT:
  //   'web'     (default) = Web Speech only. Live preview as kid speaks. Instant.
  //                         Less accurate but feels responsive.
  //   'whisper' = Whisper only. Wait for upload + process. Very accurate but delayed.
  //   'hybrid'  = Web Speech for live preview + Whisper for accurate final transcript.
  //               Only works if browser allows both (iOS may not).
  async function listen(opts) {
    opts = opts || {};
    // v15: Default to hybrid = Web Speech live preview + Whisper accurate final.
    const mode = window.AI_STT || 'hybrid';

    if (mode === 'whisper') return _listenWhisperOnly(opts);
    if (mode === 'hybrid')  return _listenHybrid(opts);
    return _listenWebSpeech(opts);   // default
  }

  function _listenWebSpeech(opts) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // No Web Speech (rare) → fall back to Whisper
      return _listenWhisperOnly(opts);
    }
    return new Promise((resolve, reject) => {
      const rec = new SR();
      rec.lang = opts.lang || 'en-US';
      rec.continuous = false;
      rec.interimResults = true;     // show text as kid speaks (LIVE)
      let finalTranscript = '';
      rec.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalTranscript += r[0].transcript;
          else interim += r[0].transcript;
        }
        // Always send the latest live text (final + interim)
        if (opts.onPartial) opts.onPartial(finalTranscript + interim);
      };
      rec.onerror = (e) => reject(new Error('Speech recognition error: ' + e.error));
      rec.onend = () => resolve({ transcript: finalTranscript.trim() });
      try { rec.start(); } catch (e) { reject(e); }
      if (opts.onStart) opts.onStart(rec);
    });
  }

  async function _listenWhisperOnly(opts) {
    if (opts.onStart) opts.onStart(null);
    const blob = await recordAudio({ maxMs: opts.maxMs || 8000, onStart: opts.onRecorderStart });
    if (opts.onTranscribing) opts.onTranscribing();
    const transcript = await transcribe(blob, opts.lang === 'en-US' ? 'en' : opts.lang);
    return { transcript };
  }

  // Hybrid: Web Speech shows live text. After mic stops, send audio to Whisper
  // for the accurate transcript (used by AI). Best of both feel + accuracy.
  // NOTE: iOS may not allow both mic uses simultaneously — falls back to web-only.
  async function _listenHybrid(opts) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return _listenWhisperOnly(opts);

    let liveText = '';
    let rec = null;
    let recorder = null;

    // Start MediaRecorder for Whisper (separate mic stream)
    const recorderPromise = recordAudio({ maxMs: opts.maxMs || 8000 }).catch(() => null);

    // Start Web Speech for live preview
    try {
      rec = new SR();
      rec.lang = opts.lang || 'en-US';
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) liveText += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (opts.onPartial) opts.onPartial(liveText + interim);
      };
      rec.start();
    } catch (e) {
      rec = null;
    }

    // Wait for MediaRecorder to finish (mic released)
    const blob = await recorderPromise;
    try { if (rec) rec.stop(); } catch (e) {}

    if (!blob) return { transcript: liveText.trim() };
    // Send audio to Whisper for accurate transcript
    try {
      if (opts.onTranscribing) opts.onTranscribing();
      const accurate = await transcribe(blob, opts.lang === 'en-US' ? 'en' : opts.lang);
      return { transcript: accurate || liveText.trim() };
    } catch (e) {
      return { transcript: liveText.trim() };
    }
  }

  function stopListen() {
    stopRecording();
  }

  return { chat, health, speak, listen, endpoint, stopSpeak, stopListen, voiceInfo, unlockAudio, isSpeaking };
})();
