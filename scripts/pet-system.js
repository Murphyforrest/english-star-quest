// Pet system: tap interaction + player creation.
// Pet selection is GONE — pets are rolled randomly at creation and revealed only
// at hatching (15 stars). Hatching animation lives in hatching.js.

window.pickedProfile = 'standard';

window.petTap = function() {
  const pet = document.getElementById('petContainer');
  pet.classList.add('happy');
  setTimeout(() => pet.classList.remove('happy'), 600);
  spawnSparklesAt(pet, 8);
  haptic(20);
  const p = getCurrentPlayer();
  const stage = getPetStageIndex(p.totalStars);
  const msgs = stage === 0
    ? ['ฟักไข่ๆ! 🥚', 'ใกล้แล้ว... ✨', 'อบอุ่น! 💖', 'มีอะไรอยู่ข้างใน? 👀']
    : ['สู้ๆ! 💪', 'รักหนู ❤️', 'เก่งมาก! ⭐'];
  showFloatingText(msgs[Math.floor(Math.random() * msgs.length)]);
};

window.triggerLevelUp = function(newStage, oldStage) {
  const p = getCurrentPlayer();
  if (oldStage === 0 && newStage >= 1) {
    runHatchSequence(p);
    return;
  }
  runLevelUpSequence(newStage, oldStage, p);
};

window.pickProfile = function(p) {
  window.pickedProfile = p;
  document.querySelectorAll('.profile-pick-card').forEach(el => {
    el.classList.toggle('selected', el.dataset.profile === p);
  });
};

window.showAddPlayerModal = function() {
  window.pickedProfile = 'standard';

  // The egg preview — same mystery egg every player gets. Builds anticipation.
  // Uses a dedicated CSS class so the SVG doesn't pick up the 220px default sizing.
  const eggPreview = window.renderEgg
    ? '<div class="creation-egg-preview">' + window.renderEgg('creation-egg-svg') + '</div>'
    : '';

  let profileHtml = '<div class="profile-picker" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:8px 0 16px">';
  Object.keys(PLAYER_PROFILES).forEach(k => {
    const pr = PLAYER_PROFILES[k];
    profileHtml +=
      '<div class="profile-pick-card pet-pick-card ' + (k === 'standard' ? 'selected' : '') +
      '" data-profile="' + k + '" onclick="pickProfile(\'' + k + '\')" style="text-align:left;padding:14px">' +
        '<div style="font-weight:700;font-size:15px;margin-bottom:4px">' +
          (k === 'gentle' ? '💛 ' : '⭐ ') + pr.label +
        '</div>' +
        '<div style="font-size:12px;opacity:.7;line-height:1.4">' + pr.description + '</div>' +
      '</div>';
  });
  profileHtml += '</div>';

  document.getElementById('modalContent').innerHTML =
    '<h3 class="modal-title">เริ่มผจญภัยใหม่!</h3>' +
    '<p class="modal-text">ไข่ปริศนาของหนูพร้อมแล้ว ✨<br>ข้างในเป็นตัวอะไร? ฟักดูสิ!</p>' +
    eggPreview +
    '<input type="text" class="setup-input" id="newPlayerName" placeholder="ชื่อของหนู" maxlength="15" />' +
    '<div style="font-size:14px;opacity:.8;text-align:left;margin:8px 4px 4px">รูปแบบภารกิจ</div>' +
    profileHtml +
    '<button class="btn-primary"   id="confAddP" style="width:100%;margin-bottom:8px">เริ่ม! 🚀</button>' +
    '<button class="btn-secondary" id="canAddP" style="width:100%">ยกเลิก</button>';
  document.getElementById('confAddP').onclick = confirmAddPlayer;
  document.getElementById('canAddP').onclick = closeModal;
  document.getElementById('modal').classList.add('active');
  setTimeout(() => document.getElementById('newPlayerName').focus(), 100);
};

window.confirmAddPlayer = function() {
  const name = document.getElementById('newPlayerName').value.trim();
  if (!name) {
    document.getElementById('newPlayerName').style.borderColor = '#ff3366';
    return;
  }
  // Roll the pet NOW (at creation). Child won't see it until hatch reveals it at 15 stars.
  const rolled = (window.rollRandomPet && rollRandomPet()) || null;

  state.players.push({
    id: 'p' + Date.now(),
    name: name,
    petId: rolled ? rolled.id : null,
    petName: 'น้อง' + name,
    profile: pickedProfile,
    quests: questsForProfile(pickedProfile),
    totalStars: 0,
    currentStars: 0,
    streak: 0,
    lastActivity: null,
    completedQuests: [],
    claimedRewards: []
  });
  saveState();
  closeModal();
  renderLogin();
  if (document.getElementById('parentScreen').classList.contains('active')) {
    renderParentMode();
  }
};

// Resume the audio context on the first tap anywhere on the dashboard.
// Safari/iOS requires a user gesture before any sound can play.
document.addEventListener('click', function audioUnlock() {
  if (window.Sound) Sound.resume();
  document.removeEventListener('click', audioUnlock);
}, { once: true });
