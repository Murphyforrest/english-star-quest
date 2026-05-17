// Quest completion + reward redemption flows, plus add-quest / add-reward modals.
//
// Quests are PER-PLAYER (state.players[i].quests). Rewards are shared (state.rewards).
// showAddQuestModal targets either the currently logged-in player (dashboard) or
// a specific player passed as targetPlayerId (parent mode).

window.renderQuests = function() {
  const p = getCurrentPlayer();
  if (!p) return;
  const g = document.getElementById('questGrid');
  g.innerHTML = '';
  getPlayerQuests(p).forEach(q => {
    const done = p.completedQuests.indexOf(q.id) !== -1;
    const c = document.createElement('div');
    c.className = 'quest-card' + (done ? ' completed' : '');
    c.onclick = function() { completeQuest(q.id, this); };
    c.innerHTML =
      '<div class="quest-icon">' + q.icon + '</div>' +
      '<div class="quest-info">' +
        '<div class="quest-title">' + q.title + '</div>' +
        '<div class="quest-reward">⭐ ' + q.stars + ' ดวง</div>' +
      '</div>' +
      '<div class="quest-check"></div>';
    g.appendChild(c);
  });
};

window.renderRewards = function() {
  const p = getCurrentPlayer();
  const g = document.getElementById('rewardGrid');
  g.innerHTML = '';
  state.rewards.forEach(r => {
    const can = p.currentStars >= r.cost;
    const c = document.createElement('div');
    c.className = 'reward-card' + (can ? '' : ' locked');
    if (can) c.onclick = () => claimReward(r.id);
    c.innerHTML =
      '<div class="reward-icon">' + r.icon + '</div>' +
      '<div class="reward-name">' + r.name + '</div>' +
      '<div class="reward-cost">⭐ ' + r.cost + '</div>';
    g.appendChild(c);
  });
};

window.completeQuest = function(qid, cardEl) {
  const p = getCurrentPlayer();
  if (!p) return;
  const q = getPlayerQuests(p).find(x => x.id === qid);
  if (!q || p.completedQuests.indexOf(qid) !== -1) return;

  // Phase 3.6 — apply streak multiplier AND clamp by daily cap so a kid can't
  // grind 200 stars in one afternoon. calcQuestStars also resets dailyEarned
  // when the calendar day changes.
  const calc = (window.calcQuestStars
    ? calcQuestStars(p, q.stars)
    : { effective: q.stars, multiplier: 1, capped: false });

  if (calc.effective <= 0) {
    // Hit the daily cap — gentle nudge instead of silently giving 0 stars.
    if (typeof showFloatingText === 'function') {
      showFloatingText('🌙 วันนี้พอแล้ว — พรุ่งนี้มาเก็บใหม่!');
    }
    return;
  }

  p.completedQuests.push(qid);
  p.dailyEarned.stars += calc.effective;
  const wasStage = getPetStageIndex(p.totalStars);
  p.currentStars += calc.effective;
  p.totalStars   += calc.effective;
  p.lastActivity  = new Date().toISOString().split('T')[0];
  saveState();
  if (cardEl) bigStarReward(calc.effective, cardEl);
  // If the multiplier kicked in OR we got clipped by the cap, show a tiny note
  // so the kid understands why they earned more (or less) than the card said.
  if (calc.multiplier > 1 && !calc.capped && typeof showFloatingText === 'function') {
    setTimeout(() => showFloatingText('🔥 ' + calc.multiplier + 'x จากสตรีค!'), 600);
  } else if (calc.capped && typeof showFloatingText === 'function') {
    setTimeout(() => showFloatingText('🌙 ใกล้เต็มวัน — รอพรุ่งนี้นะ'), 600);
  }
  setTimeout(() => {
    const newStage = getPetStageIndex(p.totalStars);
    if (newStage > wasStage) triggerLevelUp(newStage, wasStage);
    // Phase 3.5 hatch — if this star bump crossed an egg milestone,
    // play the cinematic right after the level-up settles.
    if (window.checkHatchMilestones) {
      const eggType = checkHatchMilestones(p);
      if (eggType && window.runHatchSequence) {
        setTimeout(() => runHatchSequence(p, eggType), 400);
      }
    }
    renderDashboard();
  }, 500);
};

window.claimReward = function(rid) {
  const p = getCurrentPlayer();
  const r = state.rewards.find(x => x.id === rid);
  if (!r || p.currentStars < r.cost) return;
  showModal({
    iconText: r.icon,
    title: 'ยินดีด้วย!',
    text: 'หนูได้ "' + r.name + '" แล้ว!\nไปบอกพ่อแม่เพื่อรับรางวัลเลย 🎉',
    buttons: [
      { text: '✅ รับรางวัล', primary: true, onclick: () => {
          p.currentStars -= r.cost;
          p.claimedRewards.push({ id: rid, date: new Date().toISOString() });
          saveState();
          closeModal();
          renderDashboard();
          launchConfetti();
          haptic([60, 40, 60]);
      }},
      { text: 'ยกเลิก', primary: false, onclick: closeModal }
    ]
  });
};

window.showAddQuestModal = function(targetPlayerId) {
  // targetPlayerId is used by parent mode to add to a specific child;
  // omitted on dashboard, where it defaults to the currently logged-in player.
  const target = targetPlayerId
    ? state.players.find(p => p.id === targetPlayerId)
    : getCurrentPlayer();
  if (!target) { alert('ไม่พบผู้เล่น'); return; }

  document.getElementById('modalContent').innerHTML =
    '<div class="modal-icon">🎯</div>' +
    '<h3 class="modal-title">เพิ่มภารกิจให้ ' + target.name + '</h3>' +
    '<input type="text"   class="setup-input" id="nqi" placeholder="emoji"        maxlength="2" value="🎯" />' +
    '<input type="text"   class="setup-input" id="nqt" placeholder="ชื่อภารกิจ"   maxlength="50" />' +
    '<input type="number" class="setup-input" id="nqs" placeholder="ดาว" min="1" value="3" />' +
    '<button class="btn-primary"   id="cnq"  style="width:100%;margin-bottom:8px">เพิ่ม</button>' +
    '<button class="btn-secondary" id="canq" style="width:100%">ยกเลิก</button>';
  document.getElementById('cnq').onclick = function() {
    const i = document.getElementById('nqi').value.trim() || '🎯';
    const t = document.getElementById('nqt').value.trim();
    const s = parseInt(document.getElementById('nqs').value);
    if (!t || !s || s < 1) {
      document.getElementById('nqt').style.borderColor = '#ff3366';
      return;
    }
    getPlayerQuests(target).push({ id: 'q' + Date.now(), icon: i, title: t, stars: s });
    saveState();
    closeModal();
    if (document.getElementById('dashboard').classList.contains('active'))    renderDashboard();
    if (document.getElementById('parentScreen').classList.contains('active')) renderParentMode();
  };
  document.getElementById('canq').onclick = closeModal;
  document.getElementById('modal').classList.add('active');
};

window.showAddRewardModal = function() {
  document.getElementById('modalContent').innerHTML =
    '<div class="modal-icon">🎁</div>' +
    '<h3 class="modal-title">เพิ่มรางวัล</h3>' +
    '<input type="text"   class="setup-input" id="nri" placeholder="emoji"        maxlength="2" value="🎁" />' +
    '<input type="text"   class="setup-input" id="nrn" placeholder="ชื่อรางวัล" maxlength="30" />' +
    '<input type="number" class="setup-input" id="nrc" placeholder="ราคา (ดาว)" min="1" value="50" />' +
    '<button class="btn-primary"   id="cnr"  style="width:100%;margin-bottom:8px">เพิ่ม</button>' +
    '<button class="btn-secondary" id="canr" style="width:100%">ยกเลิก</button>';
  document.getElementById('cnr').onclick = function() {
    const i = document.getElementById('nri').value.trim() || '🎁';
    const n = document.getElementById('nrn').value.trim();
    const c = parseInt(document.getElementById('nrc').value);
    if (!n || !c || c < 1) return;
    state.rewards.push({ id: 'r' + Date.now(), icon: i, name: n, cost: c });
    saveState();
    closeModal();
    renderParentMode();
  };
  document.getElementById('canr').onclick = closeModal;
  document.getElementById('modal').classList.add('active');
};
