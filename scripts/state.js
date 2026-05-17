// Data layer: state shape, persistence, defaults, helpers.
// Storage key 'starQuest_v1' is preserved from the original — do not rename or kids lose progress.
//
// Schema:
//   state.players[i] = {
//     id, name, petType, petName,
//     totalStars, currentStars, streak, lastActivity,
//     completedQuests, claimedRewards,
//     quests: [...],           // per-player quest list (independent per child)
//     profile: 'standard' | 'gentle'  // drives default quests + future AI tone
//   }
//   state.rewards = [...]      // shared across players (the shop)
//   state.currentPlayer        // id of the player currently logged in
//   state.version              // schema version (2 = per-player quests)
//
// Migration: v1 (shared state.quests) → v2 (state.players[i].quests). See migrateState().

window.state = {
  players: [],
  rewards: [],
  currentPlayer: null,
  version: 2
};

window.PLAYER_PROFILES = {
  standard: { label: 'มาตรฐาน', description: 'ภารกิจอังกฤษ + กิจวัตรเข้มข้น' },
  gentle:   { label: 'อ่อนโยน',  description: 'กิจวัตรพื้นฐาน ดูแลตัวเอง — ทำได้คือชนะ' }
};

window.PET_STAGES = [
  { name: 'ไข่',       threshold: 0   },
  { name: 'ลูกน้อย',   threshold: 15  },
  { name: 'วัยเด็ก',   threshold: 50  },
  { name: 'วัยรุ่น',   threshold: 120 },
  { name: 'ในตำนาน',   threshold: 250 }
];

window.DEFAULT_QUESTS = [
  { id: 'q1', icon: '🎬', title: 'ดู YouTube ภาษาอังกฤษ 30 นาที', stars: 2 },
  { id: 'q2', icon: '📚', title: 'อ่านหนังสือภาษาอังกฤษ 10 นาที', stars: 3 },
  { id: 'q3', icon: '🎤', title: 'เรียนกับครูภาษาอังกฤษ',         stars: 5 },
  { id: 'q4', icon: '🗣️', title: 'เล่าวันนี้เป็นภาษาอังกฤษ',       stars: 4 },
  { id: 'q5', icon: '🎵', title: 'ฟังเพลงอังกฤษ + ร้องตาม',        stars: 1 },
  { id: 'q6', icon: '🛏️', title: 'พับผ้าปูที่นอน',                stars: 2 },
  { id: 'q7', icon: '🧹', title: 'เก็บของในห้อง',                  stars: 2 }
];

// Gentle starter quests for children for whom self-care is the meaningful win.
// Crafted to celebrate the small daily victories — every line should be achievable
// and worth a star. Parent edits any of these in Parent Mode.
window.GENTLE_QUESTS = [
  { id: 'g1', icon: '🦷', title: 'แปรงฟันเอง',                stars: 2 },
  { id: 'g2', icon: '👕', title: 'ใส่เสื้อเอง',                stars: 3 },
  { id: 'g3', icon: '🧦', title: 'ใส่ถุงเท้าเอง',              stars: 2 },
  { id: 'g4', icon: '🥄', title: 'กินข้าวเสร็จเรียบร้อย',     stars: 2 },
  { id: 'g5', icon: '🛏️', title: 'จัดที่นอน',                  stars: 2 },
  { id: 'g6', icon: '🚶', title: 'เดินไปห้องน้ำเอง',           stars: 1 },
  { id: 'g7', icon: '🧹', title: 'ช่วยเก็บของเล่น',           stars: 2 },
  { id: 'g8', icon: '👋', title: 'ทักทาย "Hi!" / "Hello!"',   stars: 3 },
  { id: 'g9', icon: '🤗', title: 'กอดพ่อแม่ / พี่น้อง',         stars: 1 },
  { id: 'g10', icon: '😊', title: 'ยิ้มทักทายคนในบ้าน',         stars: 1 }
];

window.questsForProfile = function(profile) {
  if (profile === 'gentle') return GENTLE_QUESTS.map(q => ({ ...q }));
  return DEFAULT_QUESTS.map(q => ({ ...q }));
};

// Returns the active quest list for a player. Falls back to DEFAULT_QUESTS if
// somehow missing (defensive — should not happen after migration).
window.getPlayerQuests = function(player) {
  if (!player) return [];
  if (!Array.isArray(player.quests)) {
    player.quests = questsForProfile(player.profile);
  }
  return player.quests;
};

window.DEFAULT_REWARDS = [
  { id: 'r1', icon: '🍭', name: 'ขนมพิเศษ',          cost: 30 },
  { id: 'r2', icon: '🎮', name: 'เล่นเกม 1 ชั่วโมง', cost: 50 },
  { id: 'r3', icon: '🎬', name: 'ดูหนัง 1 เรื่อง',   cost: 80 },
  { id: 'r4', icon: '🧸', name: 'ของเล่นเล็ก',       cost: 150 },
  { id: 'r5', icon: '🍕', name: 'พิซซ่า',            cost: 200 },
  { id: 'r6', icon: '🎢', name: 'ไปสวนสนุก',         cost: 500 },
  { id: 'r7', icon: '🎁', name: 'ของขวัญพิเศษ',      cost: 1000 }
];

window.saveState = function() {
  try {
    localStorage.setItem('starQuest_v1', JSON.stringify(state));
  } catch (e) {
    try { window._sq = JSON.stringify(state); } catch (e2) {}
  }
};

// Migrate older saves to the current schema. Always safe to call.
//   v1 → v2: copy top-level state.quests into each player.quests (or use defaults).
window.migrateState = function(s) {
  if (!s || typeof s !== 'object') return s;
  if (!Array.isArray(s.players))  s.players  = [];
  if (!Array.isArray(s.rewards))  s.rewards  = [];

  // v1 had a shared state.quests; migrate it into each player.
  const sharedQuests = Array.isArray(s.quests) ? s.quests : null;

  s.players.forEach(p => {
    if (!p.profile) p.profile = 'standard';
    if (!Array.isArray(p.quests)) {
      if (sharedQuests && sharedQuests.length) {
        p.quests = sharedQuests.map(q => ({ ...q }));
      } else {
        p.quests = questsForProfile(p.profile);
      }
    }
    if (!Array.isArray(p.completedQuests)) p.completedQuests = [];
    if (!Array.isArray(p.claimedRewards))  p.claimedRewards  = [];
    if (typeof p.totalStars   !== 'number') p.totalStars   = 0;
    if (typeof p.currentStars !== 'number') p.currentStars = 0;
    if (typeof p.streak       !== 'number') p.streak       = 0;
  });

  // Drop the legacy global quests field after migration.
  delete s.quests;
  s.version = 2;
  return s;
};

window.loadState = function() {
  let raw = null;
  try { raw = localStorage.getItem('starQuest_v1'); } catch (e) {}
  if (!raw) {
    try { raw = window._sq || null; } catch (e) {}
  }
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    window.state = migrateState(parsed);
    return true;
  } catch (e) {
    return false;
  }
};

window.getCurrentPlayer = function() {
  return state.players.find(p => p.id === state.currentPlayer);
};

window.getPetStageIndex = function(stars) {
  let idx = 0;
  for (let i = 0; i < PET_STAGES.length; i++) {
    if (stars >= PET_STAGES[i].threshold) idx = i;
  }
  return idx;
};

window.exportData = function() {
  try {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'StarQuest_Backup_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFloatingText('✅ สำรองสำเร็จ!');
  } catch (e) {
    alert('ไม่สามารถสำรอง: ' + e.message);
  }
};

window.importData = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imp = JSON.parse(e.target.result);
      // Accept v1 (had global quests) and v2 (per-player quests).
      if (!imp.players || !imp.rewards) {
        alert('ไฟล์ไม่ถูกต้อง');
        return;
      }
      if (confirm('แทนที่ข้อมูลปัจจุบัน?')) {
        window.state = migrateState(imp);
        saveState();
        renderParentMode();
        renderLogin();
        showFloatingText('✅ กู้คืนสำเร็จ!');
      }
    } catch (err) {
      alert('ไฟล์เสีย: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};
