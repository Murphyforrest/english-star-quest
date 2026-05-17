// Sound effects via Web Audio API — no audio files, synthesized in browser.
// Safari/iOS requires the first AudioContext to be created after a user gesture;
// we lazily init on the first play call.

window.Sound = (function() {
  let ctx = null;
  let muted = false;

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) { ctx = null; }
    return ctx;
  }

  function tone(opts) {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    const { freq = 440, type = 'sine', dur = 0.2, vol = 0.18, attack = 0.005, release = 0.05, delay = 0, freqEnd, sweep } = opts || {};
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (typeof freqEnd === 'number') {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
    }
    if (sweep) {
      // sweep: { type: 'wobble', amount: 50, rate: 6 } — simple vibrato
      const lfo = c.createOscillator();
      const lfoGain = c.createGain();
      lfo.frequency.value = sweep.rate || 6;
      lfoGain.gain.value = sweep.amount || 30;
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(t0); lfo.stop(t0 + dur);
    }
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + attack);
    gain.gain.setValueAtTime(vol, t0 + dur - release);
    gain.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(opts) {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    const { dur = 0.3, vol = 0.15, delay = 0, color = 'pink' } = opts || {};
    const t0 = c.currentTime + delay;
    const bufSize = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      // Soft pink-ish noise (low-passed)
      data[i] = color === 'white' ? white : (last = last * 0.96 + white * 0.04) * 6;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    gain.gain.linearRampToValueAtTime(0, t0 + dur);
    src.connect(gain).connect(c.destination);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  // Sound recipes used by the game ──────────────────────────────────────────
  return {
    setMuted(v) { muted = !!v; },
    resume() { const c = ensureCtx(); if (c && c.state === 'suspended') c.resume(); },

    // A light "blip" for a star gained
    star() {
      tone({ freq: 880, freqEnd: 1320, type: 'triangle', dur: 0.18, vol: 0.16, release: 0.08 });
    },

    // Soft heartbeat for pre-hatch
    heartbeat(intensity = 1) {
      tone({ freq: 80, freqEnd: 50, type: 'sine', dur: 0.12, vol: 0.25 * intensity });
      tone({ freq: 80, freqEnd: 45, type: 'sine', dur: 0.14, vol: 0.22 * intensity, delay: 0.18 });
    },

    // The big crack right before the burst
    crack() {
      noise({ dur: 0.35, vol: 0.35 });
      tone({ freq: 280, freqEnd: 80, type: 'sawtooth', dur: 0.25, vol: 0.18 });
    },

    // Bright explosion / burst
    burst() {
      noise({ dur: 0.5, vol: 0.4 });
      tone({ freq: 200, freqEnd: 1600, type: 'square', dur: 0.4, vol: 0.12 });
      tone({ freq: 880, type: 'triangle', dur: 0.35, vol: 0.18, delay: 0.05 });
    },

    // Reveal fanfare for COMMON / RARE
    fanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.18, vol: 0.18, delay: i * 0.08 }));
    },

    // Bigger fanfare for SUPER RARE
    fanfareBig() {
      const notes = [523.25, 659.25, 783.99, 987.77, 1318.51];
      notes.forEach((f, i) => {
        tone({ freq: f, type: 'triangle', dur: 0.22, vol: 0.22, delay: i * 0.1 });
        tone({ freq: f * 1.5, type: 'sine', dur: 0.22, vol: 0.1, delay: i * 0.1 });
      });
    },

    // Duolingo-style "CORRECT!" ding — bright, happy, instant feedback
    correctDing() {
      tone({ freq: 880,  type: 'sine', dur: 0.08, vol: 0.22 });
      tone({ freq: 1318, type: 'sine', dur: 0.18, vol: 0.25, delay: 0.07, release: 0.06 });
      tone({ freq: 1760, type: 'triangle', dur: 0.14, vol: 0.18, delay: 0.14, release: 0.05 });
    },

    // Gentle "try again" boop — not harsh, encouraging
    wrongSoft() {
      tone({ freq: 280, type: 'sine', dur: 0.12, vol: 0.18, release: 0.06 });
      tone({ freq: 220, type: 'sine', dur: 0.18, vol: 0.16, delay: 0.1, release: 0.08 });
    },

    // Bonus star earned — sparkly upward shimmer
    starGet() {
      const notes = [523, 659, 784, 1046, 1318];
      notes.forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.1, vol: 0.16, delay: i * 0.05 }));
    },

    // Streak increased — escalating victorious 3 tones
    streakUp() {
      tone({ freq: 659,  type: 'triangle', dur: 0.12, vol: 0.2 });
      tone({ freq: 880,  type: 'triangle', dur: 0.12, vol: 0.22, delay: 0.1 });
      tone({ freq: 1318, type: 'triangle', dur: 0.22, vol: 0.25, delay: 0.2, release: 0.1 });
    },

    // EPIC fanfare for LEGENDARY (Rainbow Dragon) — extended, multi-layered
    fanfareLegendary() {
      // Rising arpeggio
      const arp = [392, 523.25, 659.25, 783.99, 1046.5, 1318.51];
      arp.forEach((f, i) => {
        tone({ freq: f, type: 'triangle', dur: 0.16, vol: 0.18, delay: i * 0.07 });
      });
      // Sustained chord
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach(f => {
        tone({ freq: f, type: 'triangle', dur: 1.6, vol: 0.13, delay: 0.5, release: 0.4 });
        tone({ freq: f * 0.5, type: 'sine', dur: 1.6, vol: 0.09, delay: 0.5, release: 0.4 });
      });
      // Sparkle on top
      tone({ freq: 2093, freqEnd: 2637, type: 'sine', dur: 0.3, vol: 0.1, delay: 0.6, sweep: { rate: 12, amount: 80 } });
      tone({ freq: 2637, freqEnd: 3135, type: 'sine', dur: 0.3, vol: 0.1, delay: 0.9, sweep: { rate: 12, amount: 80 } });
    }
  };
})();
