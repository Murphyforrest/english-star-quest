// Data layer: state shape, persistence, defaults, helpers.
// Storage key 'starQuest_v1' is preserved from the original — do not rename or kids lose progress.
//
// Schema (v3):
//   state.players[i] = {
//     id, name, petName, profile,
//     totalStars, currentStars, streak, lastActivity,
//     completedQuests, claimedRewards,
//     quests: [...],
//
//     // v3 — multi-pet collection (Phase 3.5)
//     pets: [{ petId, eggType, hatchedAt }, ...],
//     activePetId: 'snow-fox',                 // which pet shows on dashboard
//     hatched: { starter:0|1, star:0|1, rainbow:0|1, crown:0|1, mystic:N },
//
//     // Deprecated mirror — kept so old screens that read player.petId still work.
//     // Always equals activePetId after migration.
//     petId: 'snow-fox'
//   }
//   state.rewards = [...]      // shared across players (the shop)
//   state.currentPlayer        // id of the player currently logged in
//   state.version              // schema version (3 = multi-pet collection)
//
// Migration:
//   v1 → v2: shared state.quests → per-player quests.
//   v2 → v3: single petId → pets[] array + activePetId + hatched milestones.

window.state = {
  players: [],
  rewards: [],
  currentPlayer: null,
  version: 3
};

// Star economy (Phase 3.6) — anti-grinding cap + streak multipliers + milestone bonuses.
// Tweak these here if the balance turns out wrong; quests-rewards.js and parent.js
// both read from this single source of truth.
window.STAR_DAILY_CAP = 30;
window.STREAK_TIERS = [
  { days: 30, mult: 2.5, bonus: 'legendaryEgg', label: 'ไฟผจญภัย 30 วัน!'  },
  { days: 14, mult: 2.0, bonus: 'rainbowEgg',   label: 'ไฟผจญภัย 14 วัน!'  },
  { days: 7,  mult: 2.0, bonus: 'mysteryBox',   label: 'ไฟผจญภัย 7 วัน!'   },
  { days: 3,  mult: 1.5, bonus: null,           label: 'ไฟผจญภัย 3 วัน!'   }
];
window.getStreakTier = function(streak) {
  for (const t of STREAK_TIERS) if ((streak || 0) >= t.days) return t;
  return { days: 0, mult: 1, bonus: null, label: '' };
};
window.getTodayKey = function() {
  return new Date().toISOString().split('T')[0];
};

// Egg types and their drop tables. Order matters — checkHatchMilestones walks
// this in order, so the lowest threshold is awarded first when a player crosses
// multiple at once (rare during normal play, common when a parent dumps stars
// via "ระบุเอง" in Parent Mode).
window.EGG_TYPES = {
  starter: {
    nameTh: 'ไข่เริ่มต้น', emoji: '🥚', threshold: 15,
    tint: '#7dc8ff',
    drops: { common: 95, rare: 5 }
  },
  star: {
    nameTh: 'ไข่ดาว', emoji: '✨', threshold: 50,
    tint: '#ffd700',
    drops: { common: 60, rare: 35, superRare: 5 }
  },
  rainbow: {
    nameTh: 'ไข่สายรุ้ง', emoji: '🌈', threshold: 120,
    tint: 'rainbow',
    drops: { rare: 50, superRare: 40, legendary: 10 }
  },
  crown: {
    nameTh: 'ไข่มงกุฎ', emoji: '👑', threshold: 250,
    tint: '#c490ff',
    drops: { superRare: 50, legendary: 50 }
  },
  // Endless replay loop: first appears at 500 stars, then every +250 after.
  mystic: {
    nameTh: 'ไข่ลึกลับ', emoji: '🐉', threshold: 500,
    tint: '#9b6dff',
    drops: { common: 30, rare: 30, superRare: 25, legendary: 15 },
    repeating: true,
    repeatInterval: 250
  }
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
//   v2 → v3: single player.petId → pets[] array + activePetId + hatched milestones.
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

    // v2 → v3: turn the single saved pet into a one-entry collection.
    // We don't try to infer which higher-tier eggs they "should have" hatched,
    // we just give them credit for the starter milestone if they already had a
    // pet — they can earn the rest the normal way going forward.
    if (!Array.isArray(p.pets)) {
      if (p.petId) {
        p.pets = [{ petId: p.petId, eggType: 'starter', hatchedAt: Date.now() }];
        p.activePetId = p.petId;
      } else {
        p.pets = [];
        p.activePetId = null;
      }
    } else if (p.pets.length && !p.activePetId) {
      p.activePetId = p.pets[0].petId;
    }
    if (!p.hatched || typeof p.hatched !== 'object') {
      // If they already crossed a threshold, mark starter as claimed so they
      // don't get a duplicate hatch animation for stars they already earned.
      p.hatched = {
        starter: p.totalStars >= 15 ? 1 : 0,
        star: 0, rainbow: 0, crown: 0, mystic: 0
      };
    }
    // Phase 3.6 — daily cap tracking + per-streak-run milestone tracking.
    if (!p.dailyEarned || typeof p.dailyEarned !== 'object') {
      p.dailyEarned = { date: getTodayKey(), stars: 0 };
    }
    if (!p.streakBonusClaimed || typeof p.streakBonusClaimed !== 'object') {
      p.streakBonusClaimed = {};
    }
    // Keep p.petId as a deprecated mirror of activePetId so legacy reads don't break.
    if (p.activePetId) p.petId = p.activePetId;
  });

  // Drop the legacy global quests field after migration.
  delete s.quests;
  s.version = 3;
  return s;
};

// Active pet helpers — every screen that used to read player.petId should
// switch to these so the dashboard reflects whichever pet the child has picked.
window.getActivePetEntry = function(player) {
  if (!player || !Array.isArray(player.pets) || !player.pets.length) return null;
  if (player.activePetId) {
    const found = player.pets.find(e => e.petId === player.activePetId);
    if (found) return found;
  }
  return player.pets[0];
};
window.getActivePetId = function(player) {
  const e = getActivePetEntry(player);
  return e ? e.petId : (player ? player.petId : null);
};
window.setActivePet = function(player, petId) {
  if (!player || !petId) return;
  if (!Array.isArray(player.pets) || !player.pets.some(e => e.petId === petId)) return;
  player.activePetId = petId;
  player.petId = petId; // keep deprecated mirror in sync
  saveState();
};

// Roll over the daily-earned counter when the calendar date changes. Safe to
// call any time — no-op when we're still on the same day.
window.refreshDailyEarned = function(player) {
  if (!player) return;
  const today = getTodayKey();
  if (!player.dailyEarned || player.dailyEarned.date !== today) {
    player.dailyEarned = { date: today, stars: 0 };
  }
};

// Returns how many of the requested base stars the player can actually earn
// right now, after applying the streak multiplier and clamping by the
// remaining headroom under STAR_DAILY_CAP. Returns { effective, multiplier,
// capped } so callers can show "30 / 30 today" feedback.
//
// Daily cap only applies to quest completions — Parent Mode "+ดาว" buttons
// skip this on purpose so parents can always grant bonus stars manually.
window.calcQuestStars = function(player, baseStars) {
  refreshDailyEarned(player);
  const tier = getStreakTier(player.streak);
  const boosted = Math.round(baseStars * tier.mult);
  const remaining = Math.max(0, STAR_DAILY_CAP - player.dailyEarned.stars);
  const effective = Math.min(boosted, remaining);
  return { effective, multiplier: tier.mult, capped: effective < boosted };
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
