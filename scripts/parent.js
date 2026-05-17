// Parent mode: per-child quest management, star adjustment, shared rewards, daily reset.
// Quests are PER-PLAYER — each child's panel shows their own quest list with add/delete buttons.

window.showParentMode = function() {
  showScreen('parentScreen');
  renderParentMode();
};

function renderPlayerHeader(p) {
  // Pet preview is wrapped in a fixed-size container so that Lottie pets (web
  // component, ignores inline width/height) also stay 60×60. Don't add inline
  // width/height to <svg>, the CSS class handles it for both render paths.
  let pet = '';
  if (window.renderPetByPlayer) {
    pet = window.renderPetByPlayer(p, 'parent-pet-svg');
  } else if (p.petType && window.renderPetSvg) {
    const stage = getPetStageIndex(p.totalStars);
    pet = renderPetSvg(p.petType, stage, 'parent-pet-svg');
  }
  const profileLabel = (PLAYER_PROFILES[p.profile] || PLAYER_PROFILES.standard).label;
  return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
    '<div class="parent-pet-preview">' + pet + '</div>' +
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

// Dev hatch-test: replay the hatch animation without grinding. forcePetId
// pins the pet (handy for showing off a specific creature); leave null to roll
// from the pool. eggType (optional) flows through to the reveal modal so the
// egg badge matches what we're testing.
window.testHatchPet = function(playerId, forcePetId, eggType) {
  const p = state.players.find(x => x.id === playerId);
  if (!p) return;

  // Force pet (or roll random if null) and stamp it into the collection so the
  // post-hatch screen renders correctly even after the cinematic.
  let petId = forcePetId;
  if (!petId && window.rollRandomPet) {
    const rolled = rollRandomPet();
    if (rolled) petId = rolled.id;
  }
  if (petId) {
    if (!Array.isArray(p.pets)) p.pets = [];
    if (!p.pets.some(e => e.petId === petId)) {
      p.pets.push({ petId: petId, eggType: eggType || 'starter', hatchedAt: Date.now() });
    }
    p.activePetId = petId;
    p.petId = petId;
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

  // Pass eggType into the sequence so the reveal modal shows the right egg badge.
  setTimeout(() => runHatchSequence(p, eggType || null), 700);
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

  // "+ เพิ่มผู้เล่น" sits at the bottom of the per-child section.
  // Quests live inside each player panel, so the old #parentQuestList container
  // has been removed from index.html — don't reference it here.
  document.getElementById('parentPlayerList').innerHTML =
    '<button class="btn-primary" onclick="showAddPlayerModal()" style="width:100%">+ เพิ่มผู้เล่น</button>';

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
  // Phase 3.5: when a star bump crosses an egg milestone, queue the hatch.
  // Only triggers for positive adjustments — minus stars never claw back a pet.
  if (amt > 0 && window.checkHatchMilestones) {
    const eggType = checkHatchMilestones(p);
    if (eggType && window.runHatchSequence) {
      // Switch into the child's dashboard so the cinematic plays where they'll
      // see it, not stuck behind the Parent Mode screen.
      state.currentPlayer = p.id;
      saveState();
      showScreen('dashboard');
      if (typeof renderDashboard === 'function') renderDashboard();
      setTimeout(() => runHatchSequence(p, eggType), 500);
    }
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
  // Track which players hit a new streak tier — we'll celebrate after save.
  const earnedBonuses = [];
  state.players.forEach(p => {
    const prevStreak = p.streak || 0;
    if (p.lastActivity) {
      const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (p.lastActivity === y || p.lastActivity === today) {
        if (p.completedQuests.length > 0) p.streak += 1;
      } else {
        p.streak = p.completedQuests.length > 0 ? 1 : 0;
      }
    }
    p.completedQuests = [];
    // Phase 3.6 — daily counter resets at midnight too.
    if (window.refreshDailyEarned) refreshDailyEarned(p);
    // If the streak got broken (reset to 0/1), unclaim past bonuses so they
    // become available again on the next 7/14/30 run. Otherwise: did the new
    // streak land on a tier they haven't claimed yet?
    if (p.streak < prevStreak) p.streakBonusClaimed = {};
    p.streakBonusClaimed = p.streakBonusClaimed || {};
    if (window.STREAK_TIERS) {
      for (const tier of STREAK_TIERS) {
        if (p.streak >= tier.days && tier.bonus && !p.streakBonusClaimed[tier.days]) {
          earnedBonuses.push({ player: p, tier });
          p.streakBonusClaimed[tier.days] = true;
          break; // one bonus per reset — they can earn the next on a future day
        }
      }
    }
  });
  saveState();
  renderParentMode();
  // Celebrate the first earned bonus (if any) — chain the rest if more than one
  // child hit a milestone in the same reset.
  if (earnedBonuses.length) {
    grantStreakBonus(earnedBonuses[0], earnedBonuses.slice(1));
  } else {
    alert('รีเซ็ตเรียบร้อย!');
  }
};

// Grant a single streak bonus, then chain to the next queued one. Recursive so
// each celebration plays in order rather than stacking on top of each other.
function grantStreakBonus(entry, queue) {
  const { player, tier } = entry;
  const next = () => {
    if (queue.length) grantStreakBonus(queue[0], queue.slice(1));
  };

  if (tier.bonus === 'mysteryBox') {
    // Random 5–20 stars, parent-friendly surprise. Goes straight into the
    // dailyEarned counter so it still counts against the daily cap if any.
    const bonusStars = 5 + Math.floor(Math.random() * 16); // 5..20
    player.currentStars += bonusStars;
    player.totalStars   += bonusStars;
    saveState();
    showModal({
      iconText: '🎁',
      title: '🎁 Mystery Box! 🎁',
      text: tier.label + '\n' + player.name + ' ได้ ⭐ ' + bonusStars + ' ดาว เซอร์ไพรส์!',
      buttons: [{ text: 'เย้! 🎉', primary: true, onclick: () => { closeModal(); next(); } }]
    });
    if (typeof launchConfetti === 'function') launchConfetti();
    return;
  }

  if (tier.bonus === 'rainbowEgg' || tier.bonus === 'legendaryEgg') {
    // Reward = a hatch, not a stat dump. Switch to the kid's dashboard and play
    // the cinematic with the right drop table.
    const eggType = (tier.bonus === 'legendaryEgg') ? 'crown' : 'rainbow';
    state.currentPlayer = player.id;
    saveState();
    showModal({
      iconText: (tier.bonus === 'legendaryEgg') ? '🐉' : '🌈',
      title: tier.label,
      text: player.name + ' ได้ไข่พิเศษ! กดเพื่อฟัก ✨',
      buttons: [{
        text: 'ฟักเลย! ✨', primary: true,
        onclick: () => {
          closeModal();
          showScreen('dashboard');
          if (typeof renderDashboard === 'function') renderDashboard();
          setTimeout(() => {
            if (window.runHatchSequence) runHatchSequence(player, eggType);
            // Bonus-egg hatch shouldn't double-count against player.hatched
            // (those slots are for stars-earned milestones). runHatchSequence
            // increments them anyway, so roll it back here.
            setTimeout(() => {
              if (player.hatched && player.hatched[eggType] > 0) {
                player.hatched[eggType] -= 1;
                saveState();
              }
            }, 100);
            // Chain after the cinematic plus modal finish (~9s for legendary).
            setTimeout(next, 10000);
          }, 400);
        }
      }]
    });
    return;
  }

  next();
}
