// Math English Tutor — Phase B demo.
// Conversation-based math tutoring with:
//   - Voice in (Web Speech Recognition)
//   - Voice out (Web Speech Synthesis, iPad Siri)
//   - Emoji-based visual aids
//   - 5-tier scaffolding (rephrase → image → analogy → word-by-word → Thai)
//   - Stars awarded at end of session (integrates with existing game)
//
// Uses the deployed Cloudflare Worker (AI client at window.AI.chat).
// Hard daily cap enforced server-side; if exceeded, tutor shows friendly stop message.

window.MathTutor = (function () {
  // Conversation state for the current session.
  let messages = [];       // [{role:'user'|'assistant', content}]
  let starsThisSession = 0;
  let sessionActive = false;
  let recognition = null;
  let isListening = false;

  // Phase 4b — lesson mode. When set, systemPrompt() appends a strict lesson
  // section that pins the AI to a curriculum lesson; when null, the tutor
  // behaves in free-chat practice mode (its original behavior).
  let currentLesson = null;
  // Tutor character is always "Pixel" — kept consistent across pets/sessions
  // so the kid recognizes the same teacher every day.
  const TUTOR_NAME = 'Pixel';

  // Build a lesson-specific instructions block appended to the system prompt
  // when a Daily Lesson is in progress. The AI follows this rigidly instead of
  // free-form picking topics.
  function lessonInjection(lesson, name) {
    if (!lesson) return '';
    const fmtVocab = (lesson.newVocab || []).map(v =>
      `  - "${v.en}" (${v.th}) — ${v.example || ''}`
    ).join('\n') || '  (none — review-only lesson)';
    const fmtScript = (lesson.conceptScript || []).map((s, i) => `  ${i+1}. ${s}`).join('\n');
    const fmtGuided = (lesson.guidedProblems || []).map((p, i) =>
      `  ${i+1}. Q: "${p.q}"  ANSWER: ${p.a}  HINT: ${p.hint || '(work it through together)'}`
    ).join('\n');
    const fmtIndep = (lesson.independentProblems || []).map((p, i) =>
      `  ${i+1}. Q: "${p.q}"  ANSWER: ${p.a}`
    ).join('\n');
    return [
      ``,
      `━━━━━━━━━━━━━━━ ★★★ TODAY'S LESSON — FOLLOW EXACTLY ★★★ ━━━━━━━━━━━━━━━`,
      `This OVERRIDES the generic "DAILY FOCUS" section above. Stay on this lesson the entire session.`,
      ``,
      `📘 LESSON: ${lesson.nameEn} (${lesson.nameTh})`,
      `🎯 CONCEPT: ${lesson.concept}`,
      ``,
      `📖 NEW VOCAB to teach (introduce each word with English → Thai → example):`,
      fmtVocab,
      ``,
      `🔥 WARMUP (1-2 turns): ${lesson.warmupPrompt}`,
      ``,
      `💡 NEW CONCEPT — explain using these key points in order (CPA, with emoji visuals):`,
      fmtScript,
      ``,
      `🤝 GUIDED PRACTICE — use these EXACT problems (give hint freely if needed):`,
      fmtGuided,
      ``,
      `🦅 INDEPENDENT PRACTICE — same format, NO hint unless they ask 2x:`,
      fmtIndep,
      ``,
      `🎉 WRAP-UP (1 turn): celebrate, summarize the concept, list the new vocab they learned, end your message with the EXACT phrase "LESSON COMPLETE!" so the game knows to award stars and unlock the next lesson.`,
      ``,
      `RULES SPECIFIC TO THIS LESSON:`,
      `- Use the EXACT problems above — do NOT invent new ones. The parent has curated them.`,
      `- Move through phases in order: warmup → concept → guided → independent → wrap-up.`,
      `- After each correct answer, say "+1 star ⭐" (game tracks this).`,
      `- When all problems are done, say "LESSON COMPLETE!" — this signal ends the session.`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    ].join('\n');
  }

  // ───────────────────────── System prompt (the tutor's personality + pedagogy) ─────────────────────────
  function systemPrompt(player) {
    const name = (player && player.name) || 'friend';
    const tutorName = TUTOR_NAME || 'Pixel';
    return [
      `You are ${tutorName} ✨ — a world-class math tutor for ${name} (age 8, Grade 3, just starting international school where ALL lessons are in English). You combine the warmth of a great kindergarten teacher with the rigor of Singapore Math. Your job: make ${name} BOTH excellent at math AND fluent in English math vocabulary, so they never feel lost at school.`,
      ``,
      `━━━━━━━━━━━━━━━ PERSONALITY ━━━━━━━━━━━━━━━`,
      `- Excited and warm. Use "Wow!" "Yay!" "Look!" "Cool!" "Awesome!" "Amazing!"`,
      `- Tease lightly, kindly: "Oooh, tricky one!" "Don't tell anyone but I LOVE this one!"`,
      `- Use ${name}'s name often. Show emotion: !!! ??? ✨ <3`,
      `- Be silly sometimes: "Wait wait... let me count my fingers... 1, 2, 3..."`,
      `- Celebrate THINKING, not just right answers.`,
      ``,
      `━━━━━━━━━━━━━━━ FEEDBACK SIGNALS (CRITICAL) ━━━━━━━━━━━━━━━`,
      `When you EVALUATE ${name}'s answer to a problem, start your reply with EXACTLY one of these as the very first word(s) — the game watches for these to trigger sounds/animations:`,
      `   - "CORRECT!"     (fully right)`,
      `   - "ALMOST!"      (close, conceptually right but small error)`,
      `   - "TRY AGAIN!"   (wrong but keep encouraging)`,
      `   - "GREAT EFFORT!" (they tried but didn't know — needs teaching)`,
      `Do NOT use these signals on non-evaluation messages (greetings, questions, etc).`,
      ``,
      `━━━━━━━━━━━━━━━ LANGUAGE RULES ━━━━━━━━━━━━━━━`,
      `- Speak ~95% English. Use very simple words (Grade 2 level English).`,
      `- ONLY use Thai when:`,
      `  1) Teaching a NEW English word — show 1 short Thai equivalent in parens, immediately back to English.`,
      `  2) ${name} is stuck for 3+ messages despite your help.`,
      `  3) ${name} types "ไทย" or "ภาษาไทย".`,
      `- Return to English in the very next sentence after any Thai.`,
      ``,
      `━━━━━━━━━━━━━━━ SINGAPORE MATH METHOD (CORE PEDAGOGY) ━━━━━━━━━━━━━━━`,
      `Always teach new concepts in this order — DO NOT skip stages:`,
      ``,
      `  **1. CONCRETE** (physical objects you can imagine touching):`,
      `     - Use emojis as real objects: 🍪 cookies, 🍎 apples, 🟦 blocks, ⭐ stars`,
      `     - "Imagine you have 8 cookies in your hand: 🍪🍪🍪🍪🍪🍪🍪🍪"`,
      ``,
      `  **2. PICTORIAL** (drawings, bar models):`,
      `     - For word problems, use **Bar Models** — draw with text:`,
      `       Sarah's stars:  [████████████] = 12`,
      `       After giving 4: [████████]     = ?`,
      `     - Bars make relationships VISIBLE.`,
      ``,
      `  **3. ABSTRACT** (numbers and symbols):`,
      `     - Only after concrete + pictorial: "Now in symbols: 12 - 4 = 8"`,
      ``,
      `━━━━━━━━━━━━━━━ MATH VOCABULARY TEACHING (DELIBERATE) ━━━━━━━━━━━━━━━`,
      `${name} MUST learn these English math words. Weave them into every lesson naturally:`,
      ``,
      `  Operations:    plus, minus, times, divided by, equals`,
      `  Sums:          sum, total, altogether, in all`,
      `  Differences:   difference, less, fewer, more`,
      `  Products:      product, groups of, rows, columns`,
      `  Division:      quotient, share equally, split into`,
      `  Fractions:     fraction, half, third, quarter, whole, numerator, denominator`,
      `  Geometry:      shape, square, triangle, circle, rectangle, side, corner, perimeter, area`,
      `  Measurement:   length, weight, time, inch, foot, centimeter, meter, gram, kilogram, liter`,
      `  Money:         dollar, cent, change, total cost`,
      `  Time:          o'clock, half past, quarter past, quarter to, minute, hour`,
      `  Reasoning:     about, approximately, estimate, exactly, more than, less than`,
      ``,
      `When introducing a NEW vocab word:`,
      `  1) Say the word + show meaning with picture/example`,
      `  2) Brief Thai equivalent in parens if needed: "perimeter (เส้นรอบรูป)"`,
      `  3) Use it in a sentence`,
      `  4) Ask ${name} to say it back`,
      `  5) Mark it in your memory — bring it back next session for review`,
      ``,
      `━━━━━━━━━━━━━━━ TEACHING TECHNIQUES (USE OFTEN) ━━━━━━━━━━━━━━━`,
      `- **Estimation first:** Before solving, ask "Is the answer closer to 10 or 100?" — builds number sense.`,
      `- **Number bonds:** "10 splits into 6 + 4. Or 7 + 3. Or 5 + 5." — multiple ways to see numbers.`,
      `- **Multiple methods:** Show 2 ways to solve. "We can count up: 8, 9, 10, 11, 12. Or we can think: 12 minus 4 is the same as 12 take away 4."`,
      `- **Productive struggle:** Don't give answers fast. Ask guiding questions. Let ${name} TRY first. Only hint after they attempt.`,
      `- **Mistake celebration:** Wrong answers are GOLD. "Great mistake! Tell me how you got that — your brain is showing me your thinking 🧠"`,
      `- **Real-world connection:** "If you had 24 stickers and 3 friends wanted to share equally..."`,
      `- **Connection to interests:** ${name} loves dragons 🐲 and rainbows 🌈 — use them in problems! "A rainbow dragon collected 16 magic gems. She gave 4 to her dragon friend. How many left?"`,
      ``,
      `━━━━━━━━━━━━━━━ FULL-SENTENCE SPEAKING PRACTICE ━━━━━━━━━━━━━━━`,
      `After EVERY correct answer, have ${name} say the full English math sentence aloud:`,
      `  Wrong feel: ${name} says "5". You reply "CORRECT!" → DONE.`,
      `  Right feel: ${name} says "5". You reply "CORRECT! Twelve minus seven equals five. 🎤 Say it with me: 'Twelve minus seven equals five.'"`,
      `  → Builds spoken English fluency alongside math.`,
      ``,
      `━━━━━━━━━━━━━━━ NATIVE-TEACHER MODE — ENFORCED ━━━━━━━━━━━━━━━`,
      `You are an ESL teacher AS WELL AS a math tutor. Treat EVERY message from ${name} as a chance to teach English, not just math. Use these patterns EVERY time:`,
      ``,
      `**1. SOUND SPELLING — required for every new vocab word.**`,
      `When introducing or repeating any new math word, always include a sound spelling in CAPS:`,
      `   ✓ "hundred = HUN-dred"  (not "hundred")`,
      `   ✓ "three = thhhh-REE (tongue on teeth 🦷)"`,
      `   ✓ "quotient = KWO-shent"`,
      `   ✓ "perimeter = puh-RIM-uh-ter"`,
      `Tricky sounds get extra hint emoji: 🦷 (TH), 👄 (V/F), 🌬️ (P/B blow)`,
      ``,
      `**2. GENTLE CORRECTION — every wrong word, every time.**`,
      `If ${name}'s message has ANY pronunciation, spelling, or grammar issue, address it BEFORE replying to the math content. Format:`,
      `   "🎯 Quick fix first:`,
      `    ❌ '${name}'s text'`,
      `    ✅ 'corrected text'`,
      `    (1-line reason)`,
      `    🎤 Say it: 'corrected text'`,
      `    Now back to math! ..."`,
      `Examples of must-correct items: missing s ('apple' → 'apples'), wrong tense ('eated' → 'ate'), word order, 'a' vs 'an', TH/V/F/L sounds, dropped endings.`,
      ``,
      `**3. SPEAKING PRACTICE — required after every correct math answer.**`,
      `When ${name} answers correctly, model the FULL English sentence and ask them to echo:`,
      `   ${name}: "5"  →  You: "CORRECT! ⭐ Twelve minus seven equals five. 🎤 Say it with me: 'Twelve minus seven equals five.' (TWELVE rhymes with elf 🧝)"`,
      ``,
      `**4. VOICE-INPUT GUARDRAIL — interpret intent, but correct out loud.**`,
      `${name}'s voice messages go through speech-to-text, which mishears Thai-accented English: tree/three, tin/ten, fish/fifth, for/four, tirty/thirty, free/three. When math context makes the intent obvious, USE the intended word AND coach the sound:`,
      `   Heard: "I have tree apple"  →  You: "🎯 You mean THREE 🦷 (thhhh-REE) and APPLES (with s for more than one). Try: 'I have three apples.' Yes — three apples it is! Now..."`,
      ``,
      `**5. NEVER ignore an English mistake to move math forward.** Even if ${name}'s math is right, the language coaching is half the lesson.`,
      ``,
      `━━━━━━━━━━━━━━━ LESSON STRUCTURE (15-MIN SESSION) ━━━━━━━━━━━━━━━`,
      `Aim for this rhythm — adjust as needed:`,
      `  1) **Warm-up (1 turn):** Review 1 vocab word from last session: "Remember what 'sum' means?"`,
      `  2) **New concept (3-4 turns):** Use CPA — concrete first, then pictorial, then abstract`,
      `  3) **Guided practice (2-3 turns):** Easy problems with hints available`,
      `  4) **Independent practice (1-2 turns):** Slightly harder, less hints`,
      `  5) **Wrap-up (1 turn):** "Today you learned [X]. Tomorrow we'll explore [Y]!"`,
      ``,
      `━━━━━━━━━━━━━━━ DAILY FOCUS — PICK ONE TOPIC PER SESSION ━━━━━━━━━━━━━━━`,
      `Don't bounce around. Each session = ONE focus topic. Examples:`,
      `  - Today: subtraction within 20`,
      `  - Today: multiplication by 5`,
      `  - Today: half + quarter fractions`,
      `  - Today: perimeter of squares`,
      `Mention the topic in greeting: "Today we're going to play with fractions! 🍕"`,
      ``,
      `━━━━━━━━━━━━━━━ KEEP IT SHORT ━━━━━━━━━━━━━━━`,
      `- Max 5-6 lines per message. Kids' attention is precious.`,
      `- ONE question per turn.`,
      `- ONE concept at a time.`,
      ``,
      `━━━━━━━━━━━━━━━ VOICE INPUT NOTE ━━━━━━━━━━━━━━━`,
      `${name}'s messages often come from voice transcripts that mishear words. Common mishearings: "tree"/"three", "tirty"/"thirty", "fish"/"fifth", "tin"/"ten", "for"/"four". If the math context clearly indicates the intended word, USE THE INTENDED WORD and gently correct pronunciation: "Almost! It's 'three' (with TH sound 🦷), try saying 'thhhh-ree'."`,
      ``,
      `━━━━━━━━━━━━━━━ SESSION OPENING ━━━━━━━━━━━━━━━`,
      `Always greet by name + introduce today's ONE focus topic + start with an EASY warm-up question.`,
      `Example: "Hi ${name}! I'm Pixel ✨ Today we'll explore MULTIPLICATION — the magic of groups! 🎁`,
      ` Let's warm up: how many fingers on 2 hands? 🖐️🖐️"`,
      ``,
      `━━━━━━━━━━━━━━━ SESSION CLOSING ━━━━━━━━━━━━━━━`,
      `When ${name} types "stop"/"bye"/"done", or completes 3-5 problems, celebrate:`,
      `  - Tell them what they LEARNED (concept + new vocab word)`,
      `  - How many problems they solved`,
      `  - "+5 bonus stars ⭐⭐⭐⭐⭐"`,
      `  - Hint at tomorrow's lesson`,
      ``,
      `━━━━━━━━━━━━━━━ STAR REWARDS ━━━━━━━━━━━━━━━`,
      `After each CORRECT answer, mention "+1 star ⭐" so the game awards it.`,
      `After session closing, mention "+5 bonus stars ⭐⭐⭐⭐⭐".`,
      lessonInjection(currentLesson, name)
    ].join('\n');
  }

  // ───────────────────────── DOM rendering ─────────────────────────
  function el() { return document.getElementById('tutorMessages'); }

  function addMessage(role, text) {
    const m = el();
    if (!m) return;

    const div = document.createElement('div');
    div.className = 'tutor-msg tutor-msg-' + role;

    const body = document.createElement('div');
    body.className = 'tutor-msg-body';

    if (role === 'assistant') {
      // Wrap each sentence in a span — tap to replay, auto-highlight during TTS
      body.innerHTML = wrapSentences(text);

      // Click any sentence → speak just that sentence
      body.addEventListener('click', (e) => {
        const sent = e.target.closest('.sentence');
        if (!sent) return;
        const sentText = textForSpeech(sent.textContent);
        if (!sentText) return;
        if (AI.stopSpeak) AI.stopSpeak();
        body.querySelectorAll('.sentence.active').forEach(s => s.classList.remove('active'));
        sent.classList.add('active');
        AI.speak(sentText, { speed: window.AI_SPEED || 0.9 })
          .finally(() => sent.classList.remove('active'));
      });

      const speakable = textForSpeech(text);

      // Replay button — replays the WHOLE message
      const replayBtn = document.createElement('button');
      replayBtn.className = 'tutor-replay-btn';
      replayBtn.textContent = '🔊';
      replayBtn.setAttribute('aria-label', 'Replay all');
      replayBtn.onclick = () => {
        if (AI.stopSpeak) AI.stopSpeak();
        replayBtn.classList.add('tutor-replay-active');
        speakWithSentenceHighlight(speakable, body)
          .finally(() => replayBtn.classList.remove('tutor-replay-active'));
      };
      div.appendChild(body);
      div.appendChild(replayBtn);
    } else {
      body.innerHTML = text.replace(/\n/g, '<br>');
      div.appendChild(body);
    }

    m.appendChild(div);

    // Scroll so the NEW message's TOP is visible (not bottom) — kid sees from word 1
    requestAnimationFrame(() => {
      try {
        div.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        m.scrollTop = div.offsetTop - 8;
      }
    });
  }

  // Wrap each sentence in <span class="sentence"> so we can highlight + click.
  // Preserves newlines, emojis, all formatting — only splits at sentence punctuation.
  function wrapSentences(text) {
    // Split on sentence endings while keeping the punctuation with the sentence
    const parts = text.split(/(?<=[.!?])\s+/);
    return parts.map(s => {
      if (!s.trim()) return s;
      return '<span class="sentence">' + s.replace(/\n/g, '<br>') + '</span>';
    }).join(' ');
  }

  // Speak full text with sentence-level highlight that scrolls into view.
  // Timers START when audio actually begins playing (via onStart callback) so
  // highlight stays in sync with voice — no more "highlight ahead of voice".
  // If we know audio.duration, distribute timing proportionally for better accuracy.
  function speakWithSentenceHighlight(text, bodyEl) {
    const sentences = bodyEl ? bodyEl.querySelectorAll('.sentence') : [];
    if (!sentences.length) return AI.speak(text, { speed: window.AI_SPEED || 0.9 });

    const timers = [];

    const scheduleHighlights = (audioDurationSec) => {
      // If we know actual audio duration, distribute by word weight for accurate sync
      const totalWords = Array.from(sentences).reduce((sum, s) => {
        return sum + (s.textContent.match(/[A-Za-z฀-๿]+/g) || []).length;
      }, 0);

      const totalMs = audioDurationSec ? (audioDurationSec * 1000) : (totalWords * 500);
      const msPerWord = totalWords > 0 ? totalMs / totalWords : 500;

      let elapsed = 0;
      sentences.forEach((s) => {
        const wordCount = (s.textContent.match(/[A-Za-z฀-๿]+/g) || []).length;
        const startMs = elapsed;
        elapsed += Math.max(wordCount * msPerWord, 250);

        timers.push(setTimeout(() => {
          sentences.forEach(other => other.classList.remove('active'));
          s.classList.add('active');
          try { s.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        }, startMs));
      });
    };

    return AI.speak(text, {
      speed: window.AI_SPEED || 0.9,
      onStart: scheduleHighlights   // fires when audio actually starts playing
    }).finally(() => {
      timers.forEach(clearTimeout);
      sentences.forEach(s => s.classList.remove('active'));
    });
  }

  // Wrap English words in <span class="ko-word"> for karaoke. Leave Thai, emojis,
  // and punctuation untouched. Newlines → <br>.
  function wrapWordsInSpans(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/([A-Za-z][A-Za-z']*)/g, '<span class="ko-word">$1</span>');
  }

  // Speak text via TTS while highlighting each word in sequence.
  // Timing is estimated (no real timestamps from OpenAI TTS) but feels alive.
  function speakWithKaraoke(text, containerEl) {
    const words = containerEl ? containerEl.querySelectorAll('.ko-word') : [];
    const wordCount = words.length;
    if (!wordCount) return AI.speak(text, { rate: 0.85 });

    // Rough estimate: at OpenAI default speed and our rate=0.85, ~2 words per second
    // for child-friendly pacing. Adjust by word length.
    const baseMs = 440;
    let i = 0;
    let timer = null;

    const tick = () => {
      // Remove previous highlight
      words.forEach(w => w.classList.remove('ko-active'));
      if (i >= wordCount) return;
      const w = words[i];
      w.classList.add('ko-active');
      // Scroll into view if needed
      const rect = w.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 100) {
        w.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Longer words → slightly longer pause
      const wordLen = (w.textContent || '').length;
      const delay = baseMs + Math.min(wordLen * 20, 200);
      i++;
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 100);

    return AI.speak(text, { rate: 0.85 }).finally(() => {
      if (timer) clearTimeout(timer);
      words.forEach(w => w.classList.remove('ko-active'));
    });
  }

  // Strip emojis + signal prefix + Thai characters so OpenAI nova (English voice)
  // doesn't mangle Thai pronunciation. Kid still SEES Thai on screen, TTS only speaks English.
  function textForSpeech(text) {
    return text
      .replace(/^(CORRECT|ALMOST|TRY AGAIN|GREAT EFFORT)!?\s*/i, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')   // emojis
      .replace(/[฀-๿]+/g, '')                          // Thai characters
      .replace(/\([^)]*\)/g, '')                                 // (parenthetical asides, often Thai)
      .replace(/\*\*/g, '')
      .replace(/❌|✅|🦷|🎤/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Legacy global — replaced by closure-based onclick in addMessage.
  // Kept as no-op so old inline handlers don't error.
  window.tutorReplay = function() {};

  function setStatus(text, kind) {
    const s = document.getElementById('tutorStatus');
    if (!s) return;
    s.textContent = text || '';
    s.className = 'tutor-status' + (kind ? ' tutor-status-' + kind : '');
  }

  function updateStarCount() {
    const c = document.getElementById('tutorStarCount');
    if (c) c.textContent = starsThisSession;
  }

  // ───────────────────────── Star reward extraction ─────────────────────────
  // The system prompt asks Claude to add "+1 star ⭐" patterns; we count them and
  // award real stars to the current player at session end.
  function countStarsInReply(text) {
    const matches = text.match(/\+(\d+)\s*star/gi) || [];
    let total = 0;
    matches.forEach(m => {
      const n = parseInt(m.replace(/[^\d]/g, ''), 10);
      if (!isNaN(n)) total += n;
    });
    return total;
  }

  // ───────────────────────── Feedback signal detection ─────────────────────────
  // Claude starts answer-evaluations with: CORRECT! / ALMOST! / TRY AGAIN! / GREAT EFFORT!
  // We watch for those and trigger sound + visual celebrations like Duolingo.
  function detectSignal(text) {
    const t = (text || '').trim().toUpperCase();
    if (t.startsWith('CORRECT'))      return 'correct';
    if (t.startsWith('ALMOST'))       return 'almost';
    if (t.startsWith('TRY AGAIN'))    return 'wrong';
    if (t.startsWith('GREAT EFFORT')) return 'effort';
    return null;
  }

  function celebrate(kind) {
    const overlay = document.createElement('div');
    overlay.className = 'tutor-feedback-overlay tutor-feedback-' + kind;
    let text = '';
    if (kind === 'correct')      text = '🎉 CORRECT! 🎉';
    else if (kind === 'almost')  text = '✨ ALMOST! ✨';
    else if (kind === 'wrong')   text = '💪 TRY AGAIN! 💪';
    else if (kind === 'effort')  text = '⭐ GREAT EFFORT! ⭐';
    overlay.innerHTML = '<div class="tutor-feedback-text">' + text + '</div>';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1500);

    if (kind === 'correct') {
      if (window.Sound) Sound.correctDing();
      spawnSparkles(40);
      haptic([40, 30, 60]);
    } else if (kind === 'almost') {
      if (window.Sound) Sound.starGet();
      spawnSparkles(15);
      haptic(30);
    } else if (kind === 'wrong') {
      if (window.Sound) Sound.wrongSoft();
      haptic(20);
    } else if (kind === 'effort') {
      if (window.Sound) Sound.starGet();
      spawnSparkles(10);
      haptic(25);
    }
  }

  // ───────────────────────── AI call ─────────────────────────
  async function sendToAI(userText) {
    const player = getCurrentPlayer();
    if (!player) {
      setStatus('ไม่พบผู้เล่น — กลับไปเลือกผู้เล่นก่อน', 'error');
      return;
    }

    messages.push({ role: 'user', content: userText });
    addMessage('user', userText);
    setStatus('🤔 AI กำลังคิด...', 'thinking');

    try {
      const reply = await AI.chat(messages, {
        system: systemPrompt(player),
        maxTokens: 400,
        temperature: 0.7
      });

      const text = (reply && reply.content) || '...';
      messages.push({ role: 'assistant', content: text });

      // Detect feedback signal BEFORE rendering so celebration plays immediately
      const signal = detectSignal(text);
      if (signal) celebrate(signal);

      addMessage('assistant', text);

      // Phase 4b — let lesson mode detect "LESSON COMPLETE!" and auto-finish.
      if (currentLesson && /LESSON\s+COMPLETE/i.test(text)) {
        setTimeout(() => endSession(), 1800);
      }

      // Track stars Claude awarded in-message
      const newStars = countStarsInReply(text);
      if (newStars > 0) {
        starsThisSession += newStars;
        updateStarCount();
        if (window.Sound) Sound.starGet();
      }

      // Speak with sentence-level highlight on the just-rendered bubble
      const speakable = textForSpeech(text);
      if (speakable) {
        const lastBubble = el() ? el().lastElementChild : null;
        const bodyEl = lastBubble ? lastBubble.querySelector('.tutor-msg-body') : null;
        if (bodyEl) speakWithSentenceHighlight(speakable, bodyEl);
        else AI.speak(speakable, { speed: window.AI_SPEED || 0.9 });
      }

      setStatus('');

      // Auto-end session if Claude said something like "bye!" or "see you tomorrow"
      if (/see you|bye|tomorrow|great job today|that's all/i.test(text)) {
        setTimeout(endSession, 4000);
      }
    } catch (e) {
      const msg = (e && e.message) || 'connection error';
      if (/daily_cap_exceeded|429/.test(msg)) {
        addMessage('assistant', '⏸ Today\'s AI budget is full! Tomorrow we can play again. 💖');
        setStatus('งบ AI วันนี้หมดแล้ว (ทดสอบ $1/วัน) ลองพรุ่งนี้ได้ครับ', 'error');
      } else {
        addMessage('assistant', '😕 Oops, connection problem. Try again?');
        setStatus('Error: ' + msg, 'error');
      }
    }
  }

  // ───────────────────────── Voice (STT) ─────────────────────────
  function startListening() {
    if (isListening) return;
    setStatus('🎤 พูดได้เลย ฟังอยู่...', 'listening');
    isListening = true;

    AI.listen({
      lang: 'en-US',
      maxMs: 8000,                // shorter — kid's answers are usually 2-5 sec
      onPartial: (t) => setStatus('🎤 ' + t, 'listening'),
      onTranscribing: () => setStatus('✏️ กำลังแปลงเสียง...', 'thinking')
    })
    .then(({ transcript }) => {
      isListening = false;
      if (transcript && transcript.length > 0) {
        // Send straight to AI — no confirmation step. Faster + matches user's mental model.
        sendToAI(transcript);
      } else {
        setStatus('ไม่ได้ยินเสียง ลองพูดอีกที', 'error');
      }
    })
    .catch((e) => {
      isListening = false;
      setStatus('ไมโครโฟนใช้ไม่ได้: ' + (e.message || ''), 'error');
    });
  }

  // Tap mic again while recording = stop early
  window.tutorStopRec = function() {
    if (isListening && AI.stopListen) AI.stopListen();
  };

  // (Transcript preview was removed — auto-send for faster UX. Kept stub for compat.)
  function showTranscriptPreview(transcript) { sendToAI(transcript); }

  // ───────────────────────── Text input ─────────────────────────
  function sendTyped() {
    const input = document.getElementById('tutorTypeInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendToAI(text);
  }

  // ───────────────────────── Session lifecycle ─────────────────────────
  function startSession() {
    const player = getCurrentPlayer();
    if (!player) return;
    messages = [];
    starsThisSession = 0;
    sessionActive = true;
    updateStarCount();
    if (el()) el().innerHTML = '';
    // In lesson mode, kick off explicitly so the AI starts the warmup phase.
    // In free-chat mode, just say hi and let the AI pick a topic.
    const opener = currentLesson
      ? `Hi ${TUTOR_NAME || 'tutor'}! I'm ready for today's lesson: ${currentLesson.nameEn}. Please start the warm-up.`
      : "Hi! I'm ready to learn math today.";
    sendToAI(opener);
  }

  function endSession() {
    if (!sessionActive) return;
    sessionActive = false;
    const player = getCurrentPlayer();
    if (!player) return;

    // If this was a Daily Lesson, hand off to the lesson module so it can
    // save mastery + unlock the next lesson. Stars are still awarded below.
    if (currentLesson && window.DailyLesson && DailyLesson.finishLesson) {
      try { DailyLesson.finishLesson(player, currentLesson, starsThisSession); } catch (e) {}
    }

    // Award all earned stars to the real player
    if (starsThisSession > 0) {
      const wasStage = getPetStageIndex(player.totalStars);
      player.currentStars += starsThisSession;
      player.totalStars   += starsThisSession;
      player.lastActivity  = new Date().toISOString().split('T')[0];
      saveState();

      addMessage('system',
        '🎉 จบเซสชั่นแล้ว! ลูกได้ <strong>' + starsThisSession + ' ดาว</strong> เพิ่มในเกม ⭐'
      );

      // BIG dramatic celebration — kid sees stars fly + sound + confetti
      bigStarReward(starsThisSession, document.querySelector('.tutor-msg:last-child'));

      const newStage = getPetStageIndex(player.totalStars);
      if (newStage > wasStage) {
        setTimeout(() => triggerLevelUp(newStage, wasStage), 1800);
      }
    } else {
      addMessage('system', '👋 จบเซสชั่นแล้ว ลูกได้ฝึกแล้วเก่งขึ้น! ครั้งหน้าได้ดาวแน่ ⭐');
    }
    // Clear lesson context so the next free-chat session is not pinned to it.
    currentLesson = null;
  }

  // ───────────────────────── iOS audio unlock (covers BOTH paths) ─────────────────────────
  // iOS Safari requires audio output to be triggered from a user gesture.
  // We unlock TWO systems here so async TTS later (OpenAI mp3 OR Siri fallback) works:
  //   1. SpeechSynthesis (Siri fallback path)
  //   2. HTML5 Audio + Web Audio context (OpenAI TTS path)
  let speechUnlocked = false;
  function unlockAllAudio() {
    // SpeechSynthesis warmup
    if (!speechUnlocked && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0.01;
        u.rate   = 10;
        speechSynthesis.speak(u);
        speechUnlocked = true;
      } catch (e) {}
    }
    // HTML5 Audio + Web Audio context warmup (for OpenAI TTS mp3 playback)
    if (window.AI && AI.unlockAudio) AI.unlockAudio();
  }

  // ───────────────────────── Public ─────────────────────────
  return {
    open() {
      // CRITICAL: must run inside the user's click handler for iOS to permit speech later
      unlockAllAudio();
      // Free-chat mode — clear any pinned lesson. Tutor name (Pixel) is constant.
      currentLesson = null;
      showScreen('tutorScreen');
      const player = getCurrentPlayer();
      if (!player) {
        addMessage('system', 'เลือกผู้เล่นก่อนนะครับ');
        return;
      }
      if (!sessionActive) startSession();
    },
    // Lesson mode — pinned to a specific curriculum lesson. tutorName param is
    // accepted for back-compat but ignored: tutor character is always "Pixel".
    openWithLesson(lesson /*, tutorName ignored */) {
      unlockAllAudio();
      currentLesson = lesson || null;
      // Always start a fresh session — never resume mid free-chat into a lesson.
      sessionActive = false;
      showScreen('tutorScreen');
      const player = getCurrentPlayer();
      if (!player) {
        addMessage('system', 'เลือกผู้เล่นก่อนนะครับ');
        return;
      }
      startSession();
    },
    close() {
      if (sessionActive) endSession();
      goBack();
    },
    talk: startListening,
    send: sendTyped,
    end:  endSession,
    // Lets DailyLesson watch for the "LESSON COMPLETE!" signal from the AI.
    onAssistantMessage(text) {
      if (currentLesson && /LESSON COMPLETE/i.test(text)) {
        setTimeout(() => endSession(), 1500);
      }
    }
  };
})();

// Convenience globals so onclick handlers in HTML stay terse
window.openMathTutor = () => MathTutor.open();
window.tutorTalk    = () => MathTutor.talk();
window.tutorSend    = () => MathTutor.send();
window.tutorEnd     = () => MathTutor.end();

// Diagnostic — verify speech actually works on this device. Run from a user tap
// so iOS Safari's gesture requirement is satisfied. Shows voice info if silent.
window.tutorTestSound = function () {
  if (window.AI && AI.unlockAudio) AI.unlockAudio();
  addTutorSystemMsg('🔊 กำลังทดสอบเสียง (' + (window.AI_VOICE || 'openai') + ')...');
  AI.speak('Hello! Testing one, two, three. Can you hear me?', { lang: 'en-US' })
    .then(() => addTutorSystemMsg('✅ พูดจบแล้ว — ได้ยินไหม?'));
};

// Voice picker — cycle through 6 OpenAI voices + Siri. Tap to try next, kid hears sample.
const VOICE_OPTIONS = [
  { id: 'openai:nova',    label: 'Nova',    th: 'หญิงสาวอบอุ่น (ตอนนี้)' },
  { id: 'openai:shimmer', label: 'Shimmer', th: 'หญิงนุ่มใส' },
  { id: 'openai:alloy',   label: 'Alloy',   th: 'กลาง ๆ' },
  { id: 'openai:echo',    label: 'Echo',    th: 'ชายอบอุ่น' },
  { id: 'openai:fable',   label: 'Fable',   th: 'ชายอังกฤษ' },
  { id: 'openai:onyx',    label: 'Onyx',    th: 'ชายลึก' },
  { id: 'siri',           label: 'Siri',    th: 'หุ่นยนต์ ดังเสมอ' }
];

function applyVoiceId(id) {
  const opt = VOICE_OPTIONS.find(v => v.id === id) || VOICE_OPTIONS[0];
  window.AI_VOICE_FULL = opt.id;
  if (opt.id === 'siri') {
    window.AI_VOICE = 'siri';
  } else {
    window.AI_VOICE = 'openai';
    window.AI_OPENAI_VOICE = opt.id.split(':')[1];
  }
  try { localStorage.setItem('voicePref', opt.id); } catch (e) {}
  const btn = document.getElementById('voiceToggleBtn');
  if (btn) btn.textContent = '🎙 ' + opt.label + ' (' + opt.th + ')';
  return opt;
}

window.toggleVoice = function() {
  const current = window.AI_VOICE_FULL || 'openai:nova';
  const idx = VOICE_OPTIONS.findIndex(v => v.id === current);
  const next = VOICE_OPTIONS[(idx + 1) % VOICE_OPTIONS.length];
  const opt = applyVoiceId(next.id);
  addTutorSystemMsg('🎙 เสียงใหม่: ' + opt.label + ' — ' + opt.th);
  AI.speak('Hi! I am ' + opt.label + '. Do you like my voice?', { lang: 'en-US' });
};

// Restore saved preference on load + update button label
try {
  const saved = localStorage.getItem('voicePref');
  if (saved) applyVoiceId(saved);
  else applyVoiceId('openai:nova');
} catch (e) {
  applyVoiceId('openai:nova');
}
setTimeout(() => {
  const id = window.AI_VOICE_FULL || 'openai:nova';
  applyVoiceId(id);
}, 100);

// Floating STOP button — show while AI is speaking, hide otherwise.
// Polls AI.isSpeaking() because TTS state can change mid-playback (start/stop/abort).
setInterval(() => {
  const btn = document.getElementById('tutorStopSpeakBtn');
  if (!btn) return;
  // Only show in tutor screen
  const tutorActive = document.getElementById('tutorScreen') && document.getElementById('tutorScreen').classList.contains('active');
  const speaking = window.AI && AI.isSpeaking && AI.isSpeaking();
  btn.style.display = (tutorActive && speaking) ? 'block' : 'none';
}, 250);

window.addEventListener('ai-speak-stopped', () => {
  const btn = document.getElementById('tutorStopSpeakBtn');
  if (btn) btn.style.display = 'none';
});

// v15: Default OpenAI nova (premium voice)
window.AI_VOICE = window.AI_VOICE || 'openai';

// Restore user's saved preference if any
try {
  const saved = localStorage.getItem('voicePref');
  if (saved) window.AI_VOICE = saved;
} catch (e) {}

function addTutorSystemMsg(text) {
  const m = document.getElementById('tutorMessages');
  if (!m) return;
  const div = document.createElement('div');
  div.className = 'tutor-msg tutor-msg-system';
  div.innerHTML = '<div class="tutor-msg-body">' + text + '</div>';
  m.appendChild(div);
  m.scrollTop = m.scrollHeight;
}
