// UI utilities: screens, modals, tabs, and visual effects (sparkles, confetti, floating text).
// Pure helpers — no game logic.

window.showScreen = function(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
};

window.goBack = function() {
  showScreen('loginScreen');
  renderLogin();
};

window.switchTab = function(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById(tab + 'Tab').classList.add('active');
};

window.showModal = function(o) {
  let icon = '';
  if (o.iconHtml) icon = o.iconHtml;
  else if (o.iconText) icon = '<div class="modal-icon">' + o.iconText + '</div>';
  let html = icon +
    '<h3 class="modal-title">' + o.title + '</h3>' +
    '<p class="modal-text">' + o.text.replace(/\n/g, '<br>') + '</p>';
  o.buttons.forEach((b, i) => {
    html += '<button class="' + (b.primary ? 'btn-primary' : 'btn-secondary') +
            '" style="width:100%;margin-bottom:8px" data-bi="' + i + '">' + b.text + '</button>';
  });
  document.getElementById('modalContent').innerHTML = html;
  document.querySelectorAll('[data-bi]').forEach(btn => {
    btn.onclick = o.buttons[parseInt(btn.dataset.bi)].onclick;
  });
  document.getElementById('modal').classList.add('active');
};

window.closeModal = function() {
  document.getElementById('modal').classList.remove('active');
};

window.bumpCounter = function() {
  const c = document.getElementById('starCounter');
  if (!c) return;
  c.classList.add('bp');
  setTimeout(() => c.classList.remove('bp'), 500);
};

window.showFloatingText = function(text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = 'position:fixed;left:50%;top:40%;transform:translateX(-50%);' +
    'background:linear-gradient(135deg,#ffd700,#ff66c4);color:#0a0e27;' +
    'padding:12px 24px;border-radius:50px;font-weight:700;font-size:18px;' +
    'z-index:1000;pointer-events:none;animation:fu 2s ease-out forwards;' +
    'box-shadow:0 8px 24px rgba(0,0,0,.3)';
  document.body.appendChild(el);
  if (!document.getElementById('fuk')) {
    const s = document.createElement('style');
    s.id = 'fuk';
    s.textContent = '@keyframes fu{0%{transform:translate(-50%,0);opacity:1}' +
                    '100%{transform:translate(-50%,-100px);opacity:0}}';
    document.head.appendChild(s);
  }
  setTimeout(() => el.remove(), 2000);
};

window.showFloatingNumber = function(fromEl, text) {
  const r = fromEl.getBoundingClientRect();
  const n = document.createElement('div');
  n.className = 'float-number';
  n.textContent = text;
  n.style.left = (r.left + r.width / 2) + 'px';
  n.style.top = (r.top + r.height / 2) + 'px';
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 1500);
};

window.flyStarsToCounter = function(fromEl, count) {
  const r = fromEl.getBoundingClientRect();
  const counter = document.querySelector('.star-counter');
  if (!counter) return;
  const cr = counter.getBoundingClientRect();
  const tx = cr.left + cr.width / 2 - r.left - r.width / 2;
  const ty = cr.top + cr.height / 2 - r.top - r.height / 2;
  for (let i = 0; i < Math.min(count, 8); i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'star-particle';
      s.textContent = '⭐';
      s.style.left = (r.left + r.width / 2) + 'px';
      s.style.top = (r.top + r.height / 2) + 'px';
      s.style.setProperty('--mx', (Math.random() - 0.5) * 250 + 'px');
      s.style.setProperty('--my', (Math.random() - 0.5) * 250 - 80 + 'px');
      s.style.setProperty('--tx', tx + 'px');
      s.style.setProperty('--ty', ty + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }, i * 60);
  }
};

window.spawnSparkles = function(count) {
  count = count || 30;
  const sym = ['✨', '⭐', '🌟', '💫', '💖'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.textContent = sym[Math.floor(Math.random() * sym.length)];
      s.style.left = Math.random() * window.innerWidth + 'px';
      s.style.top = Math.random() * window.innerHeight + 'px';
      s.style.setProperty('--sx', (Math.random() - 0.5) * 200 + 'px');
      s.style.setProperty('--sy', (Math.random() - 0.5) * 200 + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }, i * 30);
  }
};

window.spawnSparklesAt = function(el, count) {
  count = count || 8;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const sym = ['✨', '⭐', '💖', '🌟'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.textContent = sym[Math.floor(Math.random() * sym.length)];
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.setProperty('--sx', (Math.random() - 0.5) * 250 + 'px');
      s.style.setProperty('--sy', (Math.random() - 0.5) * 250 + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }, i * 50);
  }
};

window.launchConfetti = function() {
  const colors = ['#ffd700', '#ff66c4', '#66ccff', '#4cd964', '#ff6b35', '#9b6dff'];
  for (let i = 0; i < 80; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = Math.random() * 0.5 + 's';
    c.style.animationDuration = (2 + Math.random() * 2) + 's';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
};

// Haptic feedback for iPad — vibrates briefly on important moments.
// Safari requires user gesture before first vibrate; degrades silently.
window.haptic = function(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern || 30); } catch (e) {}
  }
};

// Big dramatic star reward — used when kid earns stars from quest/tutor.
// Massive star burst + confetti + counter shake + sound + pet reaction + haptic.
// Pass count (how many stars earned) and optional sourceEl (where stars fly from).
window.bigStarReward = function(count, sourceEl) {
  count = count || 1;

  // Find anchor points
  const counter = document.querySelector('.star-counter');
  if (!counter) return;
  const cr = counter.getBoundingClientRect();
  const cx = cr.left + cr.width / 2;
  const cy = cr.top + cr.height / 2;

  // Source — center of element, or center of screen
  let sx = window.innerWidth / 2;
  let sy = window.innerHeight / 2;
  if (sourceEl && sourceEl.getBoundingClientRect) {
    const r = sourceEl.getBoundingClientRect();
    sx = r.left + r.width / 2;
    sy = r.top + r.height / 2;
  }

  // BIG floating number at source
  const float = document.createElement('div');
  float.className = 'float-number';
  float.textContent = '+' + count + ' ⭐';
  float.style.cssText = 'position:fixed;left:' + sx + 'px;top:' + sy + 'px;' +
    'transform:translate(-50%,-50%);font-size:80px;color:#ffd700;' +
    'text-shadow:0 0 30px #ffd700, 0 0 60px #ff66c4;' +
    'z-index:1100;pointer-events:none;animation:bigStarPop 2s cubic-bezier(.34,1.56,.64,1) forwards';
  document.body.appendChild(float);
  setTimeout(() => float.remove(), 2000);

  // Inject animation CSS once
  if (!document.getElementById('bigStarStyles')) {
    const s = document.createElement('style');
    s.id = 'bigStarStyles';
    s.textContent =
      '@keyframes bigStarPop {' +
      '  0%   { transform: translate(-50%,-50%) scale(0)   rotate(-20deg); opacity: 0; }' +
      '  30%  { transform: translate(-50%,-50%) scale(1.5) rotate( 10deg); opacity: 1; }' +
      '  60%  { transform: translate(-50%,-50%) scale(1.2) rotate(  0deg); opacity: 1; }' +
      '  100% { transform: translate(-50%,-150%) scale(0.8); opacity: 0; }' +
      '}';
    document.head.appendChild(s);
  }

  // Stars fly from source to counter
  const numFlying = Math.min(Math.max(count * 2, 8), 20);
  for (let i = 0; i < numFlying; i++) {
    setTimeout(() => {
      const s = document.createElement('div');
      s.className = 'star-particle';
      s.textContent = '⭐';
      s.style.left = sx + 'px';
      s.style.top = sy + 'px';
      s.style.fontSize = (28 + Math.random() * 20) + 'px';
      s.style.setProperty('--mx', (Math.random() - 0.5) * 300 + 'px');
      s.style.setProperty('--my', (Math.random() - 0.5) * 300 - 100 + 'px');
      s.style.setProperty('--tx', (cx - sx) + 'px');
      s.style.setProperty('--ty', (cy - sy) + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1100);
    }, i * 50);
  }

  // Counter pop animation
  counter.classList.add('bp');
  setTimeout(() => counter.classList.remove('bp'), 500);

  // Confetti
  launchConfetti();

  // Sound + haptic
  if (window.Sound) {
    Sound.starGet();
    setTimeout(() => Sound.streakUp(), 300);
  }
  haptic([80, 50, 80, 50, 120]);

  // Pet reaction if visible
  const petContainer = document.getElementById('petContainer');
  if (petContainer && document.getElementById('dashboard').classList.contains('active')) {
    petContainer.classList.add('happy');
    setTimeout(() => petContainer.classList.remove('happy'), 600);
    spawnSparklesAt(petContainer, 12);
  }
};
