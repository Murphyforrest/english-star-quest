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
  if (window.refreshDailyEarned) refreshDailyEarned(p);
  document.getElementById('starCount').textContent = p.currentStars;
  document.getElementById('streakDays').textContent = p.streak;

  // Phase 3.6 — streak multiplier badge + daily cap progress.
  // Only render when we have something interesting to show (mult > 1 or some
  // stars already earned today) — keep the dashboard clean for new players.
  const econ = document.getElementById('econBadges');
  if (econ) {
    const tier = window.getStreakTier ? getStreakTier(p.streak) : { mult: 1 };
    const earnedToday = (p.dailyEarned && p.dailyEarned.stars) || 0;
    const cap = window.STAR_DAILY_CAP || 30;
    let html = '';
    if (tier.mult > 1) {
      html += '<span class="econ-badge mult">🔥 x' + tier.mult + ' สตรีค</span>';
    }
    if (earnedToday > 0) {
      const pct = Math.min(100, (earnedToday / cap) * 100);
      const full = earnedToday >= cap;
      html += '<span class="econ-badge daily' + (full ? ' full' : '') + '">' +
                '⭐ ' + earnedToday + '/' + cap + ' วันนี้' +
                '<span class="econ-bar"><span class="econ-bar-fill" style="width:' + pct + '%"></span></span>' +
              '</span>';
    }
    econ.innerHTML = html;
  }

  const stageIdx = getPetStageIndex(p.totalStars);
  const stage = PET_STAGES[stageIdx];

  // Stage 0 = mystery egg. Stage 1+ reveals the active pet from the collection.
  document.getElementById('petDisplay').innerHTML = renderPetByPlayer(p);

  // Pet name/level: hide identity at stage 0 to preserve the surprise.
  const activeId = window.getActivePetId ? getActivePetId(p) : p.petId;
  if (stageIdx === 0) {
    document.getElementById('petName').textContent = '✨ ไข่ปริศนา ✨';
    document.getElementById('petLevel').textContent = 'ใกล้ฟักแล้ว... ลุ้นเลย!';
  } else {
    const petInfo = activeId && window.getPetById ? window.getPetById(activeId) : null;
    const displayName = petInfo ? 'น้อง' + petInfo.nameTh : (p.petName || 'น้อง');
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

  // Collection / Active Pet buttons — only shown once the kid has unlocked
  // anything. Switch button waits until they've hatched 2+ so it doesn't
  // sit there teasing an empty picker.
  const actions = document.getElementById('petActionButtons');
  if (actions) {
    const owned = (p.pets || []).length;
    const total = (window.PETS_POOL || []).length;
    const uniqueOwned = new Set((p.pets || []).map(e => e.petId)).size;
    let html = '';
    if (owned > 0) {
      html += '<button class="btn-secondary pet-action-btn" onclick="showCollectionBook()">📖 คอลเลกชั่น ' +
              uniqueOwned + '/' + total + '</button>';
    }
    if (uniqueOwned > 1) {
      html += '<button class="btn-secondary pet-action-btn" onclick="showActivePetPicker()">👁 เปลี่ยน Pet</button>';
    }
    actions.innerHTML = html;
  }

  renderQuests();
  renderRewards();
};

// Collection Book — every pet in the pool grouped by rarity. Owned pets show
// in full color with their Thai name + duplicate count; locked pets render as
// silhouettes with "???" so the child can see what's still out there to hunt.
window.showCollectionBook = function() {
  const p = getCurrentPlayer();
  if (!p) return;
  const ownedIds = new Set((p.pets || []).map(e => e.petId));
  const countById = {};
  (p.pets || []).forEach(e => { countById[e.petId] = (countById[e.petId] || 0) + 1; });

  const tiers = ['common', 'rare', 'superRare', 'legendary'];
  let html = '<h3 class="modal-title">📖 คอลเลกชั่นของหนู</h3>';
  html += '<div class="modal-text" style="margin-bottom:6px">เก็บได้ <strong style="color:#ffd700">' +
          ownedIds.size + ' / ' + PETS_POOL.length + '</strong> ตัว</div>';

  tiers.forEach(tier => {
    const tierPets = PETS_POOL.filter(pt => pt.rarity === tier);
    if (!tierPets.length) return;
    const rarity = RARITY[tier];
    html += '<div class="collection-tier-label" style="color:' + rarity.color + '">' +
              rarity.emoji + ' ' + rarity.label +
            '</div>';
    html += '<div class="collection-grid">';
    tierPets.forEach(pet => {
      const owned = ownedIds.has(pet.id);
      const cnt   = countById[pet.id] || 0;
      const dupBadge = cnt > 1 ? '<div class="collection-count">×' + cnt + '</div>' : '';
      const cls   = owned ? 'collection-item owned' : 'collection-item locked';
      const nm    = owned ? pet.nameTh : '???';
      html += '<div class="' + cls + '">' +
                '<div class="collection-pet-wrap">' + renderPetById(pet.id, 'collection-pet-svg') + '</div>' +
                '<div class="collection-name">' + nm + '</div>' +
                dupBadge +
              '</div>';
    });
    html += '</div>';
  });

  html += '<button class="btn-primary" id="closeColBook" style="width:100%;margin-top:14px">ปิด</button>';
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('closeColBook').onclick = closeModal;
  document.getElementById('modal').classList.add('active');
};

// Active Pet picker — only shows pets the child has actually hatched.
// Picking one writes activePetId and reloads the dashboard so the new pet
// appears on the pet platform.
window.showActivePetPicker = function() {
  const p = getCurrentPlayer();
  if (!p) return;
  const uniqueIds = [...new Set((p.pets || []).map(e => e.petId))];
  if (uniqueIds.length < 2) return;

  let html = '<h3 class="modal-title">👁 เลือก Pet ที่จะให้แสดง</h3>';
  html += '<div class="modal-text" style="margin-bottom:10px">แตะตัวที่อยากให้มาอยู่ด้วยบนหน้าหลัก</div>';
  html += '<div class="collection-grid">';
  uniqueIds.forEach(pid => {
    const pet = getPetById(pid);
    if (!pet) return;
    const isActive = (p.activePetId === pid);
    html += '<div class="collection-item picker' + (isActive ? ' active' : '') +
              '" onclick="pickActivePet(\'' + pid + '\')">' +
              '<div class="collection-pet-wrap">' + renderPetById(pid, 'collection-pet-svg') + '</div>' +
              '<div class="collection-name">' + pet.nameTh + '</div>' +
              (isActive ? '<div class="collection-active-tag">✓ ใช้อยู่</div>' : '') +
            '</div>';
  });
  html += '</div>';
  html += '<button class="btn-primary" id="closePicker" style="width:100%;margin-top:14px">ปิด</button>';
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('closePicker').onclick = closeModal;
  document.getElementById('modal').classList.add('active');
};

window.pickActivePet = function(petId) {
  const p = getCurrentPlayer();
  if (!p) return;
  if (window.setActivePet) setActivePet(p, petId);
  closeModal();
  renderDashboard();
  if (typeof showFloatingText === 'function') showFloatingText('✨ เปลี่ยน Pet แล้ว!');
};
