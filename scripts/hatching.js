// Cinematic egg-hatching sequence — the big "wow" moment.
// Triggered when a player crosses from stage 0 to stage 1 (15 stars).
//
// Timeline (~7s total):
//   0.0s  silence + small heartbeat        → tension build
//   1.0s  shake + cracks + rainbow leaks   → escalation
//   2.5s  loud crack                       → break
//   3.5s  white flash + screen shake       → explosion
//   4.5s  pet reveal + spotlight + sparkles → joy
//   6.0s  rarity badge modal               → resolution
//
// Legendary (Rainbow Dragon) gets an extended sequence (~9s) with extra effects.

// runHatchSequence(player, eggType?)
//   eggType (optional): 'starter' | 'star' | 'rainbow' | 'crown' | 'mystic'.
//                       When provided, roll a pet using that egg's drop table
//                       and record it in player.pets / increment player.hatched.
//                       When omitted (legacy callers / dev test buttons), reveal
//                       the player's existing activePet — no collection update.
window.runHatchSequence = function(player, eggType) {
  const pc = document.getElementById('petContainer');
  const petDisplay = document.getElementById('petDisplay');
  if (!pc || !petDisplay) return;

  // Multi-egg path: roll a fresh pet with the right drop table and stamp it
  // into the collection. The reveal still surprises the child.
  if (eggType && window.rollPetForEggType) {
    const rolled = rollPetForEggType(eggType);
    if (rolled) {
      if (!Array.isArray(player.pets)) player.pets = [];
      player.pets.push({ petId: rolled.id, eggType: eggType, hatchedAt: Date.now() });
      player.activePetId = rolled.id;
      player.petId = rolled.id;
      player.hatched = player.hatched || {};
      player.hatched[eggType] = (player.hatched[eggType] || 0) + 1;
      saveState();
    }
  } else if (!player.petId && window.rollRandomPet) {
    // Safety net for legacy callers — should not fire during normal play.
    const fresh = rollRandomPet();
    if (fresh) {
      player.petId = fresh.id;
      player.activePetId = fresh.id;
      if (!Array.isArray(player.pets)) player.pets = [];
      if (!player.pets.some(e => e.petId === fresh.id)) {
        player.pets.push({ petId: fresh.id, eggType: 'starter', hatchedAt: Date.now() });
      }
      saveState();
    }
  }

  // Reveal: render the active pet.
  const activeId = window.getActivePetId ? getActivePetId(player) : player.petId;
  const pet = window.getPetById && activeId ? window.getPetById(activeId) : null;
  const isLegendary = pet && pet.rarity === 'legendary';
  const eggInfo = eggType ? (window.EGG_TYPES || {})[eggType] : null;

  // Resume audio context (may be needed if first sound of the session)
  if (window.Sound) Sound.resume();

  // Phase 1 — anticipation (silence + tiny shake)
  haptic(20);
  if (window.Sound) Sound.heartbeat(0.6);
  spawnRainbowAura(pc, 800);

  setTimeout(() => {
    haptic(30);
    if (window.Sound) Sound.heartbeat(0.8);
    pc.classList.add('h-shake');
    spawnSparklesAt(pc, 6);
  }, 800);

  // Phase 2 — rainbow cracks leaking light
  setTimeout(() => {
    haptic([40, 30, 40]);
    if (window.Sound) Sound.heartbeat(1.0);
    pc.classList.remove('h-shake');
    pc.classList.add('h-shake');
    spawnRainbowBeams(pc, 6);
    spawnSparklesAt(pc, 10);
  }, 1800);

  // Phase 3 — big crack
  setTimeout(() => {
    haptic([80, 40, 80]);
    if (window.Sound) Sound.crack();
    pc.classList.remove('h-shake');
    spawnRainbowBeams(pc, 12);
    spawnSparklesAt(pc, 16);
    document.body.classList.add('shake');
  }, 2800);

  // Phase 4 — burst + flash + brightness
  setTimeout(() => {
    document.body.classList.remove('shake');
    pc.classList.add('h-burst');
    spawnScreenFlash(isLegendary ? 1500 : 1000);
    spawnRainbowParticles(isLegendary ? 200 : 120);
    if (window.Sound) Sound.burst();
    haptic([120, 60, 120, 60, 180]);
  }, 3700);

  // Phase 5 — reveal the pet
  const revealDelay = isLegendary ? 5200 : 4700;
  setTimeout(() => {
    pc.classList.remove('h-burst');
    // Promote past the egg stage so the dashboard renders the pet on next refresh.
    // (Normal play already has the player at 15+ stars when this runs; test mode
    // jumps straight here from 0 stars, so this keeps both paths consistent.)
    if (player.totalStars < 15) {
      player.totalStars = 15;
      player.currentStars = Math.max(player.currentStars, 15);
      saveState();
    }
    petDisplay.innerHTML = renderPetByPlayer(player);
    pc.classList.add('h-reveal');
    if (isLegendary) pc.classList.add('h-legendary-aura');
    launchConfetti();
    spawnSparklesAt(pc, 20);
    if (window.Sound) {
      if (isLegendary)      Sound.fanfareLegendary();
      else if (pet && pet.rarity === 'superRare') Sound.fanfareBig();
      else                  Sound.fanfare();
    }
    // Update name + level now that the pet is revealed
    if (typeof renderDashboard === 'function') renderDashboard();
  }, revealDelay);

  // Phase 6 — celebration modal with rarity badge
  const modalDelay = revealDelay + 1500;
  setTimeout(() => {
    pc.classList.remove('h-reveal');
    showHatchRevealModal(player, pet, eggInfo);
  }, modalDelay);
};

function showHatchRevealModal(player, pet, eggInfo) {
  if (!pet) {
    showModal({
      iconText: '🎉',
      title: 'ฟักไข่สำเร็จ!',
      text: 'ไข่แตกแล้ว!',
      buttons: [{ text: 'เย้!', primary: true, onclick: closeModal }]
    });
    return;
  }
  const rarity = getRarity(pet.rarity);
  const isLegendary = pet.rarity === 'legendary';

  // Tell the kid which egg they hatched (Crown / Rainbow / etc.) so the
  // milestones feel like distinct achievements, not all "egg #2".
  const eggBadge = eggInfo
    ? '<div style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:11px;letter-spacing:1px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.18);margin-bottom:10px">' +
        eggInfo.emoji + ' ' + eggInfo.nameTh +
      '</div><br>'
    : '';

  const rarityBadge = isLegendary
    ? '<div style="display:inline-block;padding:8px 20px;border-radius:50px;font-weight:800;font-size:14px;letter-spacing:2px;background:linear-gradient(90deg,#ff66c4,#c490ff,#7dc8ff,#c490ff,#ff66c4);background-size:200% 100%;animation:gs 2s linear infinite;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.4);margin-bottom:14px">🌈 LEGENDARY 🌈</div>'
    : '<div style="display:inline-block;padding:6px 16px;border-radius:50px;font-weight:700;font-size:12px;letter-spacing:1.5px;background:' + rarity.color + '33;color:' + rarity.textColor + ';border:1.5px solid ' + rarity.color + ';margin-bottom:14px">' + rarity.emoji + ' ' + rarity.label + '</div>';

  const titleText = isLegendary
    ? '🌈 ตัวในตำนาน! 🌈'
    : '🎉 ฟักไข่สำเร็จ! 🎉';

  const subtext = isLegendary
    ? '<strong style="color:#ff66c4">ไม่อยากเชื่อเลย!</strong><br>' + pet.nameEn + ' / ' + pet.nameTh + '<br>หาเจอยากมาก ๆ (5%)<br>ลูกสุดยอด! ✨'
    : pet.nameEn + ' / ' + pet.nameTh + '<br>ออกมาจากไข่แล้ว 💖<br>เก็บดาวต่อไป จะได้โตขึ้นเรื่อยๆ';

  // Count the collection so the kid sees they're building up a roster.
  const owned = (player.pets || []).length;
  const total = (window.PETS_POOL || []).length;
  const collectionLine = (owned > 1)
    ? '<div style="margin-top:10px;font-size:12px;opacity:.7">📖 คอลเลกชั่น: ' + owned + ' / ' + total + ' ตัว</div>'
    : '';

  const html =
    eggBadge +
    rarityBadge +
    '<div style="margin:0 auto 12px;width:140px;height:140px">' + renderPetById(pet.id, 'modal-icon-svg') + '</div>' +
    '<h3 class="modal-title">' + titleText + '</h3>' +
    '<p class="modal-text">' + subtext + '</p>' +
    collectionLine +
    '<button class="btn-primary" id="hatchOk" style="width:100%;margin-bottom:8px;margin-top:12px">' +
      (isLegendary ? 'น่าทึ่งมาก! 🌈' : 'น่ารักมาก! 💖') +
    '</button>';

  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('hatchOk').onclick = closeModal;
  document.getElementById('modal').classList.add('active');

  if (isLegendary) {
    setTimeout(() => launchConfetti(), 200);
    setTimeout(() => launchConfetti(), 700);
  }
};

// Generic level-up (stage 2+) — keep simple for now; Phase 2.5 will add evolution art.
window.runLevelUpSequence = function(newStage, oldStage, player) {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
  spawnSparkles(60);
  launchConfetti();
  haptic([40, 60, 40]);
  if (window.Sound) Sound.fanfare();
  setTimeout(() => {
    showModal({
      iconText: '🎉',
      title: '🎉 LEVEL UP! 🎉',
      text: (player.petName || 'น้อง') + ' ก้าวเข้าสู่ ' + PET_STAGES[newStage].name + '!\n(รูปร่างใหม่กำลังพัฒนา — เร็วๆ นี้)',
      buttons: [{ text: 'เย้! 🚀', primary: true, onclick: closeModal }]
    });
  }, 800);
};

// ───────────────────────── Visual effects ─────────────────────────

function spawnRainbowAura(el, duration) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const aura = document.createElement('div');
  aura.className = 'hatch-aura';
  aura.style.left = (cx - 150) + 'px';
  aura.style.top  = (cy - 150) + 'px';
  document.body.appendChild(aura);
  setTimeout(() => aura.remove(), duration);
}

function spawnRainbowBeams(el, count) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const colors = ['#ff66c4', '#c490ff', '#7dc8ff', '#ff9ec7', '#9b6dff', '#ffd700'];
  for (let i = 0; i < count; i++) {
    const beam = document.createElement('div');
    beam.className = 'hatch-beam';
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5);
    beam.style.left = cx + 'px';
    beam.style.top = cy + 'px';
    beam.style.background = `linear-gradient(180deg, ${colors[i % colors.length]}, transparent)`;
    beam.style.transform = `translate(-50%, -100%) rotate(${angle}rad)`;
    document.body.appendChild(beam);
    setTimeout(() => beam.remove(), 1100);
  }
}

function spawnScreenFlash(duration) {
  const f = document.createElement('div');
  f.className = 'screen-flash';
  f.style.animationDuration = (duration / 1000) + 's';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), duration);
}

function spawnRainbowParticles(count) {
  const colors = ['#ff66c4', '#c490ff', '#7dc8ff', '#ff9ec7', '#9b6dff', '#ffd700', '#fff'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'rainbow-particle';
      const size = 6 + Math.random() * 14;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = (50 + (Math.random() - 0.5) * 30) + 'vw';
      p.style.top = '50vh';
      p.style.setProperty('--dx', ((Math.random() - 0.5) * 200) + 'vw');
      p.style.setProperty('--dy', ((Math.random() - 0.5) * 200) + 'vh');
      p.style.setProperty('--rot', (Math.random() * 720) + 'deg');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2500);
    }, i * 8);
  }
}
