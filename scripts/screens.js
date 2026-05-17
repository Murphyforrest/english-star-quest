// Login screen (player selection) + Dashboard screen (pet display + tabs).

window.renderLogin = function() {
  const c = document.getElementById('playerCards');
  c.innerHTML = '';
  state.players.forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.onclick = () => selectPlayer(p.id);
    // renderPetByPlayer auto-handles: stage 0 → mystery egg, stage 1+ → revealed pet.
    card.innerHTML =
      renderPetByPlayer(p, 'player-avatar') +
      '<div class="player-name">' + p.name + '</div>' +
      '<div class="player-stats">⭐ ' + p.totalStars + ' • 🔥 ' + p.streak + '</div>';
    c.appendChild(card);
  });
  if (state.players.length < 4) {
    const b = document.createElement('button');
    b.className = 'add-player-btn';
    b.onclick = showAddPlayerModal;
    b.innerHTML = '<span>+</span><span>เพิ่มผู้เล่น</span>';
    c.appendChild(b);
  }
};

window.selectPlayer = function(id) {
  state.currentPlayer = id;
  saveState();
  showScreen('dashboard');
  renderDashboard();
};

window.renderDashboard = function() {
  const p = getCurrentPlayer();
  if (!p) return;
  document.getElementById('starCount').textContent = p.currentStars;
  document.getElementById('streakDays').textContent = p.streak;
  const stageIdx = getPetStageIndex(p.totalStars);
  const stage = PET_STAGES[stageIdx];

  // Stage 0 = mystery egg. Stage 1+ reveals the rolled pet.
  document.getElementById('petDisplay').innerHTML = renderPetByPlayer(p);

  // Pet name/level: hide identity at stage 0 to preserve the surprise.
  if (stageIdx === 0) {
    document.getElementById('petName').textContent = '✨ ไข่ปริศนา ✨';
    document.getElementById('petLevel').textContent = 'ใกล้ฟักแล้ว... ลุ้นเลย!';
  } else {
    const petInfo = p.petId && window.getPetById ? window.getPetById(p.petId) : null;
    const displayName = p.petName || (petInfo ? 'น้อง' + petInfo.nameTh : 'น้อง');
    document.getElementById('petName').textContent = displayName;
    document.getElementById('petLevel').textContent =
      'เลเวล ' + (stageIdx + 1) + ' — ' + stage.name +
      (stageIdx > 1 ? ' (กำลังพัฒนา)' : '');
  }

  const next = PET_STAGES[stageIdx + 1];
  if (next) {
    const prog = ((p.totalStars - stage.threshold) / (next.threshold - stage.threshold)) * 100;
    document.getElementById('petProgress').style.width = prog + '%';
    document.getElementById('petProgressText').textContent = p.totalStars + ' / ' + next.threshold + ' ⭐';
  } else {
    document.getElementById('petProgress').style.width = '100%';
    document.getElementById('petProgressText').textContent = '🏆 LEGENDARY! 🏆';
  }
  renderQuests();
  renderRewards();
};
