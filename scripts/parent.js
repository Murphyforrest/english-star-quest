// Parent mode: per-child quest management, star adjustment, shared rewards, daily reset.
// Quests are PER-PLAYER — each child's panel shows their own quest list with add/delete buttons.

window.showParentMode = function() {
  showScreen('parentScreen');
  renderParentMode();
};

function renderPlayerHeader(p) {
  // Try the new pet pool first; fall back to legacy petType svg if rendering it fails.
  let svg = '';
  if (window.renderPetByPlayer) {
    svg = window.renderPetByPlayer(p, '').replace('<svg', '<svg width="50" height="50"');
  } else if (p.petType && window.renderPetSvg) {
    const stage = getPetStageIndex(p.totalStars);
    svg = renderPetSvg(p.petType, stage, '').replace('<svg', '<svg width="50" height="50"');
  }
  const profileLabel = (PLAYER_PROFILES[p.profile] || PLAYER_PROFILES.standard).label;
  return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
    '<div style="width:50px;height:50px;flex-shrink:0">' + svg + '</div>' +
    '<div style="flex:1;min-width:0">' +
      '<div style="font-weight:700">' + p.name +
        ' <span style="opacity:.6;font-size:12px">— ' + profileLabel + '</span>' +
      '</div>' +
      '<div style="font-size:12px;opacity:.7">⭐ ' + p.currentStars + ' (รวม ' + p.totalStars + ') • 🔥 ' + p.streak + ' วัน</div>' +
    '</div>' +
    '<button class="btn-danger" onclick="deletePlayer(\'' + p.id + '\')">ลบ</button>' +
  '</div>';
}

function renderStarControls(p) {
  return '<div class="quick-add-stars">' +
    '<button class="quick-add-btn" onclick="adjustStars(\'' + p.id + '\',1)">+1 ⭐</button>' +
    '<button class="quick-add-btn" onclick="adjustStars(\'' + p.id + '\',3)">+3 ⭐</button>' +
    '<button class="quick-add-btn" onclick="adjustStars(\'' + p.id + '\',5)">+5 ⭐</button>' +
    '<button class="quick-add-btn" onclick="adjustStars(\'' + p.id + '\',10)">+10 ⭐</button>' +
    '<button class="quick-add-btn" onclick="customAddStars(\'' + p.id + '\')">📝 ระบุเอง</button>' +
    '<button class="quick-add-btn" style="background:rgba(255,51,102,.2);border-color:rgba(255,51,102,.4);color:#ff3366" onclick="adjustStars(\'' + p.id + '\',-1)">-1</button>' +
  '</div>';
}

function renderPlayerQuests(p) {
  const quests = getPlayerQuests(p);
  const items = quests.length === 0
    ? '<div style="text-align:center;opacity:.5;padding:12px;font-size:13px">ยังไม่มีภารกิจ — กด "+ เพิ่ม" เพื่อสร้าง</div>'
    : quests.map(q =>
      '<div class="editor-card" style="margin-bottom:8px;padding:12px">' +
        '<span style="font-size:28px">' + q.icon + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-weight:600;font-size:14px">' + q.title + '</div>' +
          '<div style="font-size:11px;opacity:.7;color:#ffd700">⭐ ' + q.stars + '</div>' +
        '</div>' +
        '<button class="btn-danger" onclick="deletePlayerQuest(\'' + p.id + '\',\'' + q.id + '\')">ลบ</button>' +
      '</div>'
    ).join('');
  return '<div style="margin-top:12px">' +
    '<div style="font-size:13px;opacity:.7;margin-bottom:8px">🎯 ภารกิจของ ' + p.name + '</div>' +
    items +
    '<button class="btn-primary" onclick="showAddQuestModal(\'' + p.id + '\')" style="width:100%;margin-top:6px;font-size:14px;padding:10px 20px">+ เพิ่มภารกิจ</button>' +
  '</div>';
}

// ── Hidden dev buttons: jump straight to a hatch animation without grinding 15 stars.
// Use sparingly with kids around — these reveal the pet identity.
function renderHatchTestButtons(p) {
  return '<div style="margin-top:14px;padding:12px;background:rgba(155,109,255,.08);border:1px dashed rgba(155,109,255,.25);border-radius:14px">' +
    '<div style="font-size:11px;opacity:.55;margin-bottom:8px;letter-spacing:.5px">🧪 ปุ่มลับ — ทดสอบแอนิเมชั่นฟัก (รีเซ็ตดาวของลูกคนนี้)</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
      '<button class="quick-add-btn" style="background:linear-gradient(90deg,rgba(196,144,255,.3),rgba(255,102,196,.3));border-color:rgba(255,102,196,.5);font-size:13px" onclick="testHatchPet(\'' + p.id + '\',\'rainbow-dragon\')">🐉 Dragon (LGD)</button>' +
      '<button class="quick-add-btn" style="background:rgba(155,109,255,.2);border-color:rgba(155,109,255,.4);font-size:13px" onclick="testHatchPet(\'' + p.id + '\',\'shadow-tiger\')">🐯 Shadow Tiger (SR)</button>' +
      '<button class="quick-add-btn" style="background:rgba(212,160,23,.18);border-color:rgba(212,160,23,.4);font-size:13px" onclick="testHatchPet(\'' + p.id + '\',\'jewel-jaguar\')">🐆 Jewel Jaguar (R)</button>' +
      '<button class="quick-add-btn" style="font-size:13px" onclick="testHatchPet(\'' + p.id + '\',null)">🎲 สุ่ม</button>' +
    '</div>' +
  '</div>';
}

window.testHatchPet = function(playerId, forcePetId) {
  const p = state.players.find(x => x.id === playerId);
  if (!p) return;

  // Force pet (or roll random if null)
  if (forcePetId) {
    p.petId = forcePetId;
  } else if (window.rollRandomPet) {
    const rolled = rollRandomPet();
    if (rolled) p.petId = rolled.id;
  }
  // Reset to egg state so the hatch sequence runs cleanly from the beginning
  p.totalStars = 0;
  p.currentStars = 0;
  p.completedQuests = [];

  state.currentPlayer = playerId;
  saveState();
  closeModal();
  showScreen('dashboard');
  renderDashboard();

  // Give the dashboard a moment to render the egg, then trigger the cinematic sequence.
  setTimeout(() => runHatchSequence(p), 700);
};

window.renderParentMode = function() {
  const container = document.getElementById('parentStarManager');
  if (state.players.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👶</div>เพิ่มผู้เล่นด้านล่าง</div>';
  } else {
    container.innerHTML = state.players.map(p =>
      '<div class="editor-card" style="flex-direction:column;align-items:stretch;padding:16px;margin-bottom:16px">' +
        renderPlayerHeader(p) +
        renderStarControls(p) +
        renderPlayerQuests(p) +
        renderHatchTestButtons(p) +
      '</div>'
    ).join('');
  }

  // The old "Player" and "Quest" sections are now folded into the per-player panel above.
  // Keep these containers empty so the page doesn't show duplicate UI.
  document.getElementById('parentPlayerList').innerHTML =
    '<button class="btn-primary" onclick="showAddPlayerModal()" style="width:100%">+ เพิ่มผู้เล่น</button>';

  document.getElementById('parentQuestList').innerHTML =
    '<div style="text-align:center;opacity:.6;font-size:13px;padding:8px">ภารกิจของแต่ละคนอยู่ในส่วนด้านบน — เพิ่มได้ที่นั่น</div>';

  const rl = document.getElementById('parentRewardList');
  rl.innerHTML = state.rewards.map(r =>
    '<div class="editor-card">' +
      '<span style="font-size:32px">' + r.icon + '</span>' +
      '<div style="flex:1">' +
        '<div style="font-weight:700">' + r.name + '</div>' +
        '<div style="font-size:12px;opacity:.7;color:#ffd700">⭐ ' + r.cost + '</div>' +
      '</div>' +
      '<button class="btn-danger" onclick="deleteReward(\'' + r.id + '\')">ลบ</button>' +
    '</div>'
  ).join('') +
  '<button class="btn-primary" onclick="showAddRewardModal()" style="width:100%;margin-top:12px">+ เพิ่มรางวัล</button>';
};

window.deletePlayerQuest = function(playerId, questId) {
  const p = state.players.find(x => x.id === playerId);
  if (!p) return;
  p.quests = getPlayerQuests(p).filter(q => q.id !== questId);
  saveState();
  renderParentMode();
};

// Legacy global deleteQuest — no-op now (quests are per-player). Kept for safety.
window.deleteQuest = function(id) {
  // No-op; quests are managed per player via deletePlayerQuest.
};

// Nukes localStorage and reloads. Asks twice — losing kids' progress would be sad.
window.resetAllData = function() {
  if (!confirm('⚠️ ลบข้อมูลทั้งหมด?\n\nผู้เล่น ดาว ภารกิจ ทั้งหมดจะหายไป\n(แนะนำให้สำรองก่อน)')) return;
  if (!confirm('แน่ใจมาก ๆ ใช่ไหม?\nลูกจะต้องเริ่มต้นใหม่จากศูนย์')) return;
  try { localStorage.removeItem('starQuest_v1'); } catch (e) {}
  try { delete window._sq; } catch (e) {}
  location.reload();
};

window.adjustStars = function(pid, amt) {
  const p = state.players.find(x => x.id === pid);
  if (!p) return;
  const wasStage = getPetStageIndex(p.totalStars);
  p.currentStars = Math.max(0, p.currentStars + amt);
  if (amt > 0) p.totalStars += amt;
  saveState();
  renderParentMode();
  const newStage = getPetStageIndex(p.totalStars);
  if (newStage > wasStage) {
    launchConfetti();
    showFloatingText('🎉 ' + p.name + ' เลเวลอัพ!');
  }
};

window.customAddStars = function(pid) {
  document.getElementById('modalContent').innerHTML =
    '<div class="modal-icon">⭐</div>' +
    '<h3 class="modal-title">ระบุดาวเอง</h3>' +
    '<input type="number" class="setup-input" id="csa" placeholder="จำนวนดาว (- เพื่อลด)" />' +
    '<button class="btn-primary"   id="ccs"    style="width:100%;margin-bottom:8px">ยืนยัน</button>' +
    '<button class="btn-secondary" id="cancCs" style="width:100%">ยกเลิก</button>';
  document.getElementById('ccs').onclick = function() {
    const a = parseInt(document.getElementById('csa').value);
    if (isNaN(a) || a === 0) return;
    adjustStars(pid, a);
    closeModal();
  };
  document.getElementById('cancCs').onclick = closeModal;
  document.getElementById('modal').classList.add('active');
  setTimeout(() => document.getElementById('csa').focus(), 100);
};

window.deleteReward = function(id) {
  state.rewards = state.rewards.filter(r => r.id !== id);
  saveState();
  renderParentMode();
};

window.deleteQuest = function(id) {
  state.quests = state.quests.filter(q => q.id !== id);
  saveState();
  renderParentMode();
};

window.deletePlayer = function(id) {
  if (!confirm('ลบผู้เล่นนี้?')) return;
  state.players = state.players.filter(p => p.id !== id);
  saveState();
  renderParentMode();
  renderLogin();
};

window.resetDailyQuests = function() {
  if (!confirm('รีเซ็ตภารกิจวันนี้?')) return;
  const today = new Date().toISOString().split('T')[0];
  state.players.forEach(p => {
    if (p.lastActivity) {
      const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (p.lastActivity === y || p.lastActivity === today) {
        if (p.completedQuests.length > 0) p.streak += 1;
      } else {
        p.streak = p.completedQuests.length > 0 ? 1 : 0;
      }
    }
    p.completedQuests = [];
  });
  saveState();
  renderParentMode();
  alert('รีเซ็ตเรียบร้อย!');
};
