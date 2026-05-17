// Pet pool with rarity tiers + mystery egg.
// Child never sees the pets before hatching — all SVGs live here, server-side reveal only.
// Rainbow Dragon (legendary) is the daughter's centerpiece — extra care on the SVG.

window.RARITY = {
  common:    { weight: 50, label: 'Common',     emoji: '🟢',
               color: '#4cd964', textColor: '#4cd964' },
  rare:      { weight: 30, label: 'Rare',       emoji: '🔵',
               color: '#66ccff', textColor: '#66ccff' },
  superRare: { weight: 15, label: 'Super Rare', emoji: '🟣',
               color: '#9b6dff', textColor: '#9b6dff' },
  legendary: { weight: 5,  label: 'LEGENDARY',  emoji: '🌈',
               color: 'rainbow', textColor: '#ff66c4' }
};

// Order roughly by rarity (rarer toward the end) — only used for the collection book.
window.PETS_POOL = [
  // ────────────────────── COMMON (50% total, 4 pets) ──────────────────────
  {
    id: 'pink-kitten', rarity: 'common',
    nameEn: 'Pink Kitten', nameTh: 'แมวชมพู',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="pkB" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#ffd6ec"/><stop offset="100%" stop-color="#ff8fc3"/></radialGradient></defs><ellipse cx="100" cy="120" rx="55" ry="50" fill="url(#pkB)" stroke="#d6478f" stroke-width="3"/><polygon points="55,80 65,40 85,75" fill="url(#pkB)" stroke="#d6478f" stroke-width="3"/><polygon points="145,80 135,40 115,75" fill="url(#pkB)" stroke="#d6478f" stroke-width="3"/><polygon points="60,72 68,52 78,72" fill="#ff66c4"/><polygon points="140,72 132,52 122,72" fill="#ff66c4"/><ellipse cx="80" cy="115" rx="9" ry="11" fill="#fff"/><ellipse cx="120" cy="115" rx="9" ry="11" fill="#fff"/><ellipse cx="80" cy="117" rx="5" ry="7" fill="#1a1740"/><ellipse cx="120" cy="117" rx="5" ry="7" fill="#1a1740"/><circle cx="82" cy="114" r="2.5" fill="#fff"/><circle cx="122" cy="114" r="2.5" fill="#fff"/><polygon points="100,130 95,134 100,136 105,134" fill="#ff3366"/><path d="M 95 138 Q 100 143 105 138" stroke="#a8235c" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M 60 125 L 50 122 M 60 130 L 48 130 M 60 135 L 50 138" stroke="#a8235c" stroke-width="1.5" stroke-linecap="round"/><path d="M 140 125 L 150 122 M 140 130 L 152 130 M 140 135 L 150 138" stroke="#a8235c" stroke-width="1.5" stroke-linecap="round"/><path d="M 150 95 Q 175 70 165 50 Q 162 65 145 80" fill="url(#pkB)" stroke="#d6478f" stroke-width="2.5" stroke-linejoin="round"/><circle cx="73" cy="35" r="4" fill="#ff66c4"/><circle cx="68" cy="32" r="2" fill="#ff66c4"/><circle cx="78" cy="32" r="2" fill="#ff66c4"/></svg>`
  },
  {
    id: 'sky-bunny', rarity: 'common',
    nameEn: 'Sky Bunny', nameTh: 'กระต่ายฟ้า',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="sbB" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#dff1ff"/><stop offset="100%" stop-color="#7dc8ff"/></radialGradient></defs><ellipse cx="80" cy="50" rx="13" ry="38" fill="url(#sbB)" stroke="#3a8cd6" stroke-width="3" transform="rotate(-10 80 50)"/><ellipse cx="120" cy="50" rx="13" ry="38" fill="url(#sbB)" stroke="#3a8cd6" stroke-width="3" transform="rotate(10 120 50)"/><ellipse cx="80" cy="55" rx="6" ry="22" fill="#ffb3d9" transform="rotate(-10 80 55)"/><ellipse cx="120" cy="55" rx="6" ry="22" fill="#ffb3d9" transform="rotate(10 120 55)"/><ellipse cx="100" cy="130" rx="55" ry="48" fill="url(#sbB)" stroke="#3a8cd6" stroke-width="3"/><ellipse cx="100" cy="140" rx="32" ry="28" fill="#f0faff"/><ellipse cx="78" cy="120" rx="10" ry="12" fill="#fff"/><ellipse cx="122" cy="120" rx="10" ry="12" fill="#fff"/><ellipse cx="78" cy="122" rx="6" ry="8" fill="#1a1740"/><ellipse cx="122" cy="122" rx="6" ry="8" fill="#1a1740"/><circle cx="80" cy="119" r="3" fill="#fff"/><circle cx="124" cy="119" r="3" fill="#fff"/><ellipse cx="100" cy="138" rx="6" ry="4" fill="#ff66c4"/><path d="M 90 144 Q 100 150 110 144" stroke="#3a8cd6" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="100" cy="152" r="2" fill="#fff"/><circle cx="65" cy="140" r="5" fill="#ff9ec7" opacity=".6"/><circle cx="135" cy="140" r="5" fill="#ff9ec7" opacity=".6"/><circle cx="35" cy="30" r="3" fill="#fff" opacity=".8"/><circle cx="170" cy="40" r="2" fill="#ffd700" opacity=".8"/></svg>`
  },
  {
    id: 'purple-owl', rarity: 'common',
    nameEn: 'Purple Owl', nameTh: 'นกฮูกม่วง',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="poB" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#e8d5ff"/><stop offset="100%" stop-color="#9b6dff"/></radialGradient></defs><ellipse cx="100" cy="115" rx="60" ry="65" fill="url(#poB)" stroke="#5a2eb8" stroke-width="3"/><ellipse cx="100" cy="125" rx="35" ry="40" fill="#f0e0ff"/><polygon points="50,70 70,90 60,55" fill="url(#poB)" stroke="#5a2eb8" stroke-width="2.5"/><polygon points="150,70 130,90 140,55" fill="url(#poB)" stroke="#5a2eb8" stroke-width="2.5"/><circle cx="78" cy="105" r="18" fill="#fff" stroke="#5a2eb8" stroke-width="2.5"/><circle cx="122" cy="105" r="18" fill="#fff" stroke="#5a2eb8" stroke-width="2.5"/><circle cx="78" cy="105" r="10" fill="#1a1740"/><circle cx="122" cy="105" r="10" fill="#1a1740"/><circle cx="80" cy="102" r="3.5" fill="#fff"/><circle cx="124" cy="102" r="3.5" fill="#fff"/><polygon points="100,118 92,128 108,128" fill="#ffd700" stroke="#a87800" stroke-width="1.5"/><path d="M 85 165 Q 90 170 100 170 Q 110 170 115 165" stroke="#ffd700" stroke-width="2" fill="none"/><path d="M 70 145 Q 75 152 80 145 M 85 150 Q 90 157 95 150 M 105 150 Q 110 157 115 150 M 120 145 Q 125 152 130 145" stroke="#5a2eb8" stroke-width="1.5" fill="none"/><circle cx="60" cy="60" r="2" fill="#ffd700"/><circle cx="140" cy="60" r="2" fill="#ffd700"/></svg>`
  },
  {
    id: 'mint-frog', rarity: 'common',
    nameEn: 'Mint Frog', nameTh: 'กบมิ้น',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="mfB" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#d9ffe9"/><stop offset="100%" stop-color="#5acd92"/></radialGradient></defs><circle cx="75" cy="75" r="22" fill="url(#mfB)" stroke="#2a8a5a" stroke-width="2.5"/><circle cx="125" cy="75" r="22" fill="url(#mfB)" stroke="#2a8a5a" stroke-width="2.5"/><circle cx="75" cy="75" r="14" fill="#fff"/><circle cx="125" cy="75" r="14" fill="#fff"/><circle cx="75" cy="78" r="9" fill="#1a1740"/><circle cx="125" cy="78" r="9" fill="#1a1740"/><circle cx="77" cy="75" r="3" fill="#fff"/><circle cx="127" cy="75" r="3" fill="#fff"/><ellipse cx="100" cy="125" rx="62" ry="50" fill="url(#mfB)" stroke="#2a8a5a" stroke-width="3"/><ellipse cx="100" cy="138" rx="38" ry="28" fill="#eaffea"/><path d="M 70 135 Q 100 165 130 135" stroke="#2a8a5a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="148" rx="6" ry="3" fill="#ff66c4"/><ellipse cx="50" cy="160" rx="14" ry="8" fill="url(#mfB)" stroke="#2a8a5a" stroke-width="2"/><ellipse cx="150" cy="160" rx="14" ry="8" fill="url(#mfB)" stroke="#2a8a5a" stroke-width="2"/><circle cx="80" cy="120" r="4" fill="#fff" opacity=".7"/><circle cx="120" cy="130" r="3" fill="#fff" opacity=".7"/><polygon points="100,40 105,55 100,50 95,55" fill="#ffd700" stroke="#a87800" stroke-width="1"/></svg>`
  },

  // ────────────────────── RARE (30% total, 2 pets) ──────────────────────
  {
    id: 'crystal-fox', rarity: 'rare',
    nameEn: 'Crystal Fox', nameTh: 'จิ้งจอกคริสตัล',
    svg: `<svg viewBox="0 0 200 200"><defs><linearGradient id="cfB" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e0faff"/><stop offset="50%" stop-color="#a8e8ff"/><stop offset="100%" stop-color="#ff9ec7"/></linearGradient><linearGradient id="cfT" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffb3d9"/><stop offset="100%" stop-color="#fff"/></linearGradient></defs><path d="M 130 150 Q 175 130 180 80 Q 178 110 165 130 Q 170 145 155 155" fill="url(#cfT)" stroke="#6b88b8" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="100" cy="120" rx="50" ry="48" fill="url(#cfB)" stroke="#6b88b8" stroke-width="3"/><polygon points="55,75 70,40 85,72" fill="url(#cfB)" stroke="#6b88b8" stroke-width="2.5"/><polygon points="145,75 130,40 115,72" fill="url(#cfB)" stroke="#6b88b8" stroke-width="2.5"/><polygon points="62,72 70,52 78,72" fill="#ff9ec7"/><polygon points="138,72 130,52 122,72" fill="#ff9ec7"/><ellipse cx="80" cy="115" rx="9" ry="11" fill="#fff"/><ellipse cx="120" cy="115" rx="9" ry="11" fill="#fff"/><ellipse cx="80" cy="117" rx="5" ry="7" fill="#1a1740"/><ellipse cx="120" cy="117" rx="5" ry="7" fill="#1a1740"/><circle cx="82" cy="114" r="2.5" fill="#fff"/><circle cx="122" cy="114" r="2.5" fill="#fff"/><polygon points="100,128 94,132 100,136 106,132" fill="#1a1740"/><path d="M 92 138 Q 100 144 108 138" stroke="#3a4f78" stroke-width="2" fill="none" stroke-linecap="round"/><polygon points="100,90 95,95 100,98 105,95" fill="#fff" opacity=".7"/><polygon points="60,130 55,135 60,138 65,135" fill="#fff" opacity=".5"/><circle cx="40" cy="40" r="2.5" fill="#fff"/><circle cx="160" cy="50" r="2" fill="#ff66c4"/><circle cx="30" cy="120" r="2" fill="#66ccff"/></svg>`
  },
  {
    id: 'galaxy-whale', rarity: 'rare',
    nameEn: 'Galaxy Whale', nameTh: 'ปลาวาฬกาแล็กซี่',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="gwB" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="#5a3aa8"/><stop offset="60%" stop-color="#3a1a78"/><stop offset="100%" stop-color="#1a0a3a"/></radialGradient></defs><path d="M 100 30 Q 95 18 90 25 Q 85 14 80 22 M 100 30 Q 105 18 110 25 Q 115 14 120 22" stroke="#a8e0ff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="85" cy="22" r="2.5" fill="#a8e0ff"/><circle cx="115" cy="22" r="2.5" fill="#a8e0ff"/><circle cx="95" cy="14" r="1.5" fill="#fff"/><path d="M 145 130 Q 180 110 188 80 Q 178 110 168 120 Q 178 132 172 150 Q 170 132 158 130 Q 150 138 145 145 Z" fill="url(#gwB)" stroke="#7a5ad8" stroke-width="2.5"/><ellipse cx="100" cy="125" rx="62" ry="50" fill="url(#gwB)" stroke="#7a5ad8" stroke-width="3"/><ellipse cx="100" cy="140" rx="38" ry="28" fill="#3a1a78" opacity=".5"/><ellipse cx="55" cy="138" rx="14" ry="9" fill="url(#gwB)" stroke="#7a5ad8" stroke-width="2" transform="rotate(-30 55 138)"/><circle cx="60" cy="105" r="2" fill="#fff"/><circle cx="80" cy="90" r="1.5" fill="#a8e0ff"/><circle cx="140" cy="110" r="2" fill="#ffd700"/><circle cx="120" cy="155" r="1.5" fill="#fff"/><circle cx="80" cy="160" r="1.5" fill="#ff9ec7"/><polygon points="50,120 53,123 50,126 47,123" fill="#fff"/><polygon points="155,90 158,93 155,96 152,93" fill="#ff9ec7"/><polygon points="130,80 133,83 130,86 127,83" fill="#a8e0ff"/><ellipse cx="80" cy="110" rx="11" ry="14" fill="#fff"/><ellipse cx="120" cy="110" rx="11" ry="14" fill="#fff"/><ellipse cx="80" cy="112" rx="7" ry="10" fill="#1a1740"/><ellipse cx="120" cy="112" rx="7" ry="10" fill="#1a1740"/><circle cx="82" cy="108" r="3" fill="#fff"/><circle cx="122" cy="108" r="3" fill="#fff"/><circle cx="78" cy="115" r="1.5" fill="#a8e0ff"/><circle cx="118" cy="115" r="1.5" fill="#a8e0ff"/><path d="M 85 145 Q 100 155 115 145" stroke="#a8e0ff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  },

  // ────────────────────── SUPER RARE (15% total, 1 pet) ──────────────────────
  {
    id: 'fairy-deer', rarity: 'superRare',
    nameEn: 'Fairy Deer', nameTh: 'กวางนางฟ้า',
    svg: `<svg viewBox="0 0 200 200"><defs><linearGradient id="fdB" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff8fc"/><stop offset="100%" stop-color="#ffd9ec"/></linearGradient><linearGradient id="fdA" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffe892"/><stop offset="100%" stop-color="#d49a30"/></linearGradient></defs><path d="M 65 35 Q 55 15 70 8 Q 72 25 80 30 M 60 50 Q 40 38 50 20 Q 55 35 70 42 M 70 40 Q 65 25 78 20" stroke="url(#fdA)" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M 135 35 Q 145 15 130 8 Q 128 25 120 30 M 140 50 Q 160 38 150 20 Q 145 35 130 42 M 130 40 Q 135 25 122 20" stroke="url(#fdA)" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="70" cy="10" r="3" fill="#ffd700"/><circle cx="130" cy="10" r="3" fill="#ffd700"/><circle cx="50" cy="22" r="2" fill="#fff"/><circle cx="150" cy="22" r="2" fill="#fff"/><ellipse cx="80" cy="70" rx="10" ry="14" fill="url(#fdB)" stroke="#b87a9c" stroke-width="2" transform="rotate(-20 80 70)"/><ellipse cx="120" cy="70" rx="10" ry="14" fill="url(#fdB)" stroke="#b87a9c" stroke-width="2" transform="rotate(20 120 70)"/><ellipse cx="78" cy="72" rx="5" ry="9" fill="#ff9ec7" transform="rotate(-20 78 72)"/><ellipse cx="122" cy="72" rx="5" ry="9" fill="#ff9ec7" transform="rotate(20 122 72)"/><ellipse cx="100" cy="80" rx="40" ry="36" fill="url(#fdB)" stroke="#b87a9c" stroke-width="2.5"/><ellipse cx="100" cy="135" rx="50" ry="40" fill="url(#fdB)" stroke="#b87a9c" stroke-width="2.5"/><ellipse cx="100" cy="145" rx="28" ry="22" fill="#fff"/><circle cx="115" cy="125" r="2" fill="#ff9ec7" opacity=".8"/><circle cx="85" cy="130" r="2" fill="#ff9ec7" opacity=".8"/><circle cx="125" cy="140" r="1.5" fill="#9b6dff" opacity=".8"/><circle cx="75" cy="145" r="1.5" fill="#9b6dff" opacity=".8"/><ellipse cx="80" cy="75" rx="9" ry="11" fill="#fff"/><ellipse cx="120" cy="75" rx="9" ry="11" fill="#fff"/><ellipse cx="80" cy="77" rx="5" ry="7" fill="#1a1740"/><ellipse cx="120" cy="77" rx="5" ry="7" fill="#1a1740"/><circle cx="82" cy="74" r="2.5" fill="#fff"/><circle cx="122" cy="74" r="2.5" fill="#fff"/><polygon points="100,90 96,93 100,96 104,93" fill="#1a1740"/><path d="M 95 100 Q 100 104 105 100" stroke="#b87a9c" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M 130 165 Q 145 160 155 170 Q 145 175 138 170 Z" fill="url(#fdB)" stroke="#b87a9c" stroke-width="1.5"/><circle cx="30" cy="40" r="2" fill="#ffd700"/><circle cx="170" cy="50" r="2" fill="#ff9ec7"/><circle cx="40" cy="100" r="1.5" fill="#9b6dff"/><circle cx="160" cy="120" r="1.5" fill="#66ccff"/></svg>`
  },

  // ────────────────────── LEGENDARY (5% total, split across pets) ──────────────────────
  // Rainbow Axolotl — Lottie animation (rich cartoon-style movement) + rainbow hue-cycle.
  // The .lottie file is a ZIP containing JSON + raster images; rendered via the
  // <dotlottie-player> web component loaded in index.html.
  {
    id: 'rainbow-axolotl', rarity: 'legendary',
    nameEn: 'Rainbow Axolotl', nameTh: 'แอกโซลอเทิลสายรุ้ง',
    type: 'lottie',
    src: 'assets/lottie/dragon.lottie',
    rainbow: true,
    svg: null
  },
  // Rainbow Dragon — custom SVG with element-level animations (kept as the other
  // legendary so the daughter who loves dragons can still hatch one).
  {
    id: 'rainbow-dragon', rarity: 'legendary',
    nameEn: 'Rainbow Dragon', nameTh: 'มังกรสายรุ้ง',
    svg: `<svg viewBox="0 0 200 200"><defs>
<linearGradient id="rdBody" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffb8d6"/><stop offset="25%" stop-color="#ff66c4"/><stop offset="50%" stop-color="#c490ff"/><stop offset="75%" stop-color="#7dc8ff"/><stop offset="100%" stop-color="#ff9ec7"/></linearGradient>
<linearGradient id="rdBodyDark" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#d4669f"/><stop offset="50%" stop-color="#8854b8"/><stop offset="100%" stop-color="#3a8bcc"/></linearGradient>
<linearGradient id="rdBelly" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff8fc"/><stop offset="100%" stop-color="#ffd4ec"/></linearGradient>
<linearGradient id="rdWingOuter" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff66c4" stop-opacity="0.95"/><stop offset="40%" stop-color="#c490ff" stop-opacity="0.9"/><stop offset="80%" stop-color="#7dc8ff" stop-opacity="0.95"/><stop offset="100%" stop-color="#fff" stop-opacity="0.8"/></linearGradient>
<linearGradient id="rdWingInner" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff" stop-opacity="0.7"/><stop offset="100%" stop-color="#ffd4ec" stop-opacity="0.4"/></linearGradient>
<linearGradient id="rdHorn" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff8d5"/><stop offset="50%" stop-color="#ffd700"/><stop offset="100%" stop-color="#a87800"/></linearGradient>
<radialGradient id="rdGlowOuter" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(255,150,210,0.45)"/><stop offset="60%" stop-color="rgba(180,140,255,0.25)"/><stop offset="100%" stop-color="rgba(125,200,255,0)"/></radialGradient>
<radialGradient id="rdGlowInner" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(255,255,255,0.55)"/><stop offset="60%" stop-color="rgba(255,200,255,0.25)"/><stop offset="100%" stop-color="rgba(255,200,255,0)"/></radialGradient>
<radialGradient id="rdEyeIris" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="#7dc8ff"/><stop offset="70%" stop-color="#9b6dff"/><stop offset="100%" stop-color="#3d1f6b"/></radialGradient>
<linearGradient id="rdSp1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff"/><stop offset="50%" stop-color="#ff66c4"/><stop offset="100%" stop-color="#c490ff"/></linearGradient>
<linearGradient id="rdSp2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff"/><stop offset="50%" stop-color="#c490ff"/><stop offset="100%" stop-color="#7dc8ff"/></linearGradient>
<linearGradient id="rdSp3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff"/><stop offset="50%" stop-color="#7dc8ff"/><stop offset="100%" stop-color="#ff9ec7"/></linearGradient>
</defs>

<!-- Triple-layer aura -->
<circle class="rd-aura-outer" cx="100" cy="100" r="95" fill="url(#rdGlowOuter)"/>
<circle class="rd-aura-inner" cx="100" cy="105" r="65" fill="url(#rdGlowInner)"/>

<!-- Tail with rainbow stripes (sways) -->
<g class="rd-tail" style="transform-origin:155px 145px">
  <path d="M 155 145 Q 188 142 192 110 Q 195 88 178 82 Q 188 102 178 118 Q 188 134 180 152 Q 175 138 165 138" fill="url(#rdBody)" stroke="#5a2eb8" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 170 100 Q 180 105 185 110" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.5"/>
  <path d="M 173 120 Q 183 122 187 128" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.5"/>
  <polygon points="180,80 196,75 188,98" fill="url(#rdHorn)" stroke="#5a2eb8" stroke-width="2"/>
  <circle cx="186" cy="84" r="1.5" fill="#fff"/>
</g>

<!-- Left wing (flaps) -->
<g class="rd-wing-left" style="transform-origin:62px 92px">
  <path d="M 60 90 Q 22 60 8 22 Q 12 50 30 70 Q 18 55 22 80 Q 30 75 42 88 Q 38 60 52 65 Q 50 80 60 100 Z" fill="url(#rdWingOuter)" stroke="#5a2eb8" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 60 90 Q 35 78 25 60 Q 35 75 50 85" fill="url(#rdWingInner)" stroke="none"/>
  <path d="M 18 32 Q 25 50 40 70 M 12 50 Q 28 65 45 78 M 22 75 Q 35 82 50 90" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.6"/>
  <circle cx="14" cy="28" r="1.5" fill="#fff"/>
  <circle cx="22" cy="65" r="1.2" fill="#fff"/>
</g>

<!-- Right wing (flaps, delayed) -->
<g class="rd-wing-right" style="transform-origin:138px 92px">
  <path d="M 140 90 Q 178 60 192 22 Q 188 50 170 70 Q 182 55 178 80 Q 170 75 158 88 Q 162 60 148 65 Q 150 80 140 100 Z" fill="url(#rdWingOuter)" stroke="#5a2eb8" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M 140 90 Q 165 78 175 60 Q 165 75 150 85" fill="url(#rdWingInner)" stroke="none"/>
  <path d="M 182 32 Q 175 50 160 70 M 188 50 Q 172 65 155 78 M 178 75 Q 165 82 150 90" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.6"/>
  <circle cx="186" cy="28" r="1.5" fill="#fff"/>
  <circle cx="178" cy="65" r="1.2" fill="#fff"/>
</g>

<!-- Body group (breathes) -->
<g class="rd-body" style="transform-origin:100px 135px">
  <!-- Main body -->
  <ellipse cx="100" cy="132" rx="54" ry="50" fill="url(#rdBody)" stroke="#5a2eb8" stroke-width="3"/>
  <!-- Belly highlight -->
  <ellipse cx="100" cy="143" rx="32" ry="30" fill="url(#rdBelly)"/>
  <!-- Scale rows (subtle texture) -->
  <g opacity="0.4">
    <ellipse cx="78" cy="115" rx="5" ry="3" fill="#fff" transform="rotate(-20 78 115)"/>
    <ellipse cx="68" cy="125" rx="5" ry="3" fill="#fff" transform="rotate(-15 68 125)"/>
    <ellipse cx="72" cy="138" rx="5" ry="3" fill="#fff" transform="rotate(-10 72 138)"/>
    <ellipse cx="65" cy="150" rx="5" ry="3" fill="#fff" transform="rotate(-5 65 150)"/>
    <ellipse cx="125" cy="118" rx="5" ry="3" fill="#fff" transform="rotate(15 125 118)"/>
    <ellipse cx="135" cy="128" rx="5" ry="3" fill="#fff" transform="rotate(10 135 128)"/>
    <ellipse cx="130" cy="143" rx="5" ry="3" fill="#fff" transform="rotate(5 130 143)"/>
  </g>
  <!-- Belly accent stripes -->
  <path d="M 82 138 Q 100 143 118 138" stroke="#ff9ec7" stroke-width="1.2" fill="none" opacity="0.6"/>
  <path d="M 80 152 Q 100 157 120 152" stroke="#c490ff" stroke-width="1.2" fill="none" opacity="0.6"/>
  <path d="M 84 165 Q 100 168 116 165" stroke="#7dc8ff" stroke-width="1.2" fill="none" opacity="0.6"/>
</g>

<!-- Back spikes (rainbow, gentle wobble) -->
<g class="rd-spikes">
  <polygon points="74,90 78,72 84,90" fill="url(#rdSp1)" stroke="#5a2eb8" stroke-width="1.5"/>
  <polygon points="86,85 92,64 100,85" fill="url(#rdSp2)" stroke="#5a2eb8" stroke-width="1.5"/>
  <polygon points="104,82 112,58 120,82" fill="url(#rdSp3)" stroke="#5a2eb8" stroke-width="1.5"/>
  <polygon points="122,85 130,64 136,85" fill="url(#rdSp1)" stroke="#5a2eb8" stroke-width="1.5"/>
  <polygon points="138,90 144,72 148,90" fill="url(#rdSp2)" stroke="#5a2eb8" stroke-width="1.5"/>
</g>

<!-- Head group (subtle tilt) -->
<g class="rd-head" style="transform-origin:100px 100px">
  <!-- Head -->
  <ellipse cx="100" cy="76" rx="50" ry="46" fill="url(#rdBody)" stroke="#5a2eb8" stroke-width="3"/>
  <!-- Forehead highlight -->
  <ellipse cx="92" cy="58" rx="22" ry="14" fill="#fff" opacity="0.25"/>
  <!-- Cheek scales -->
  <g opacity="0.35">
    <ellipse cx="65" cy="85" rx="4" ry="2.5" fill="#fff" transform="rotate(-20 65 85)"/>
    <ellipse cx="60" cy="95" rx="4" ry="2.5" fill="#fff" transform="rotate(-10 60 95)"/>
    <ellipse cx="135" cy="85" rx="4" ry="2.5" fill="#fff" transform="rotate(20 135 85)"/>
    <ellipse cx="140" cy="95" rx="4" ry="2.5" fill="#fff" transform="rotate(10 140 95)"/>
  </g>
  <!-- Horns (gold) -->
  <path d="M 68 45 Q 56 18 76 14 Q 80 32 86 50 Z" fill="url(#rdHorn)" stroke="#5a2eb8" stroke-width="2" stroke-linejoin="round"/>
  <path d="M 132 45 Q 144 18 124 14 Q 120 32 114 50 Z" fill="url(#rdHorn)" stroke="#5a2eb8" stroke-width="2" stroke-linejoin="round"/>
  <path d="M 72 35 Q 76 38 80 35" stroke="#a87800" stroke-width="1" fill="none"/>
  <path d="M 70 28 Q 76 30 82 28" stroke="#a87800" stroke-width="1" fill="none"/>
  <path d="M 128 35 Q 124 38 120 35" stroke="#a87800" stroke-width="1" fill="none"/>
  <path d="M 130 28 Q 124 30 118 28" stroke="#a87800" stroke-width="1" fill="none"/>
  <circle cx="74" cy="16" r="2" fill="#fff"/>
  <circle cx="126" cy="16" r="2" fill="#fff"/>
  <!-- Crown — 3 jeweled spikes (centerpiece) -->
  <polygon points="84,18 88,4 92,18" fill="url(#rdHorn)" stroke="#5a2eb8" stroke-width="1.5"/>
  <polygon points="94,12 100,-4 106,12" fill="url(#rdHorn)" stroke="#5a2eb8" stroke-width="1.5"/>
  <polygon points="108,18 112,4 116,18" fill="url(#rdHorn)" stroke="#5a2eb8" stroke-width="1.5"/>
  <circle cx="88" cy="14" r="2.5" fill="#ff66c4" stroke="#fff" stroke-width="0.5"/>
  <circle cx="100" cy="6" r="3" fill="#c490ff" stroke="#fff" stroke-width="0.5"/>
  <circle cx="112" cy="14" r="2.5" fill="#7dc8ff" stroke="#fff" stroke-width="0.5"/>
  <!-- Eyes (each wrapped in a group so they scaleY around their own center to "blink").
       transform-origin uses SVG-coordinate units (default view-box mode), pointing at
       the actual eye center. Do NOT add transform-box: fill-box — it'd reinterpret
       the origin as bbox-relative and the eye would "drop" off-screen during blink. -->
  <g class="rd-eye-l" style="transform-origin:78px 80px">
    <ellipse cx="78" cy="78" rx="15" ry="18" fill="#fff" stroke="#5a2eb8" stroke-width="1.5"/>
    <ellipse cx="79" cy="80" rx="11" ry="14" fill="url(#rdEyeIris)"/>
    <ellipse cx="80" cy="82" rx="6" ry="9" fill="#3d1f6b"/>
    <circle cx="82" cy="77" r="4" fill="#fff"/>
    <circle cx="76" cy="86" r="2" fill="#fff"/>
  </g>
  <g class="rd-eye-r" style="transform-origin:122px 80px">
    <ellipse cx="122" cy="78" rx="15" ry="18" fill="#fff" stroke="#5a2eb8" stroke-width="1.5"/>
    <ellipse cx="123" cy="80" rx="11" ry="14" fill="url(#rdEyeIris)"/>
    <ellipse cx="124" cy="82" rx="6" ry="9" fill="#3d1f6b"/>
    <circle cx="126" cy="77" r="4" fill="#fff"/>
    <circle cx="120" cy="86" r="2" fill="#fff"/>
  </g>
  <!-- Cheeks -->
  <ellipse cx="60" cy="100" rx="10" ry="6" fill="#ff66c4" opacity="0.6"/>
  <ellipse cx="140" cy="100" rx="10" ry="6" fill="#ff66c4" opacity="0.6"/>
  <!-- Smile + tongue -->
  <path d="M 88 108 Q 100 117 112 108" stroke="#5a2eb8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M 92 109 Q 100 115 108 109 Q 100 119 92 109" fill="#ff3366"/>
  <path d="M 96 111 Q 100 116 104 111" stroke="#ff66c4" stroke-width="1" fill="none"/>
  <!-- Tiny fangs -->
  <polygon points="93,109 94,113 95,109" fill="#fff"/>
  <polygon points="105,109 106,113 107,109" fill="#fff"/>
</g>

<!-- Feet -->
<ellipse cx="76" cy="176" rx="14" ry="7" fill="#5a2eb8"/>
<ellipse cx="124" cy="176" rx="14" ry="7" fill="#5a2eb8"/>
<ellipse cx="76" cy="175" rx="10" ry="4" fill="#8c4fa8"/>
<ellipse cx="124" cy="175" rx="10" ry="4" fill="#8c4fa8"/>
<circle cx="72" cy="178" r="1.5" fill="#5a2eb8"/>
<circle cx="76" cy="178" r="1.5" fill="#5a2eb8"/>
<circle cx="80" cy="178" r="1.5" fill="#5a2eb8"/>
<circle cx="120" cy="178" r="1.5" fill="#5a2eb8"/>
<circle cx="124" cy="178" r="1.5" fill="#5a2eb8"/>
<circle cx="128" cy="178" r="1.5" fill="#5a2eb8"/>

<!-- Floating magical sparkles (drift continuously) -->
<g class="rd-sparkle rd-sparkle-1"><polygon points="22,48 26,55 22,51 18,55" fill="#ff66c4"/><circle cx="22" cy="44" r="2" fill="#fff"/></g>
<g class="rd-sparkle rd-sparkle-2"><polygon points="178,52 182,59 178,55 174,59" fill="#7dc8ff"/><circle cx="178" cy="48" r="2" fill="#fff"/></g>
<g class="rd-sparkle rd-sparkle-3"><polygon points="14,135 18,142 14,138 10,142" fill="#c490ff"/></g>
<g class="rd-sparkle rd-sparkle-4"><circle cx="190" cy="125" r="2.5" fill="#ffd700"/><polygon points="188,118 192,125 188,121 184,125" fill="#fff"/></g>
<g class="rd-sparkle rd-sparkle-5"><polygon points="32,185 36,192 32,188 28,192" fill="#ff9ec7"/></g>
<g class="rd-sparkle rd-sparkle-6"><circle cx="172" cy="188" r="2" fill="#fff"/><polygon points="168,182 172,189 168,185 164,189" fill="#7dc8ff"/></g>
</svg>`
  }
];

// ──────────────────────── Mystery Egg (rainbow, no preview) ────────────────────────
// Shown for every player at stage 0. Designed to POP on dark background —
// vivid pink/purple/blue gradient, strong glow, floating sparkles.
// Never reveals what's inside.
window.MYSTERY_EGG_SVG = `<svg viewBox="0 0 200 200"><defs>
<linearGradient id="egShell" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#ff9ec7"/>
<stop offset="30%" stop-color="#ff66c4"/>
<stop offset="55%" stop-color="#c490ff"/>
<stop offset="80%" stop-color="#7dc8ff"/>
<stop offset="100%" stop-color="#ffb3e0"/>
</linearGradient>
<radialGradient id="egShine" cx="32%" cy="28%" r="38%">
<stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
<stop offset="60%" stop-color="rgba(255,255,255,0.25)"/>
<stop offset="100%" stop-color="rgba(255,255,255,0)"/>
</radialGradient>
<radialGradient id="egGlow" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="rgba(255,150,220,0.55)"/>
<stop offset="55%" stop-color="rgba(180,140,255,0.35)"/>
<stop offset="100%" stop-color="rgba(125,200,255,0)"/>
</radialGradient>
</defs>

<!-- Outer aura -->
<circle cx="100" cy="115" r="92" fill="url(#egGlow)"/>

<!-- Egg shell -->
<ellipse cx="100" cy="115" rx="64" ry="80" fill="url(#egShell)" stroke="#fff" stroke-width="2.5" opacity="0.98"/>
<ellipse cx="100" cy="115" rx="64" ry="80" fill="none" stroke="#9b6dff" stroke-width="1"/>

<!-- Decorative band 1 -->
<path d="M 45 130 Q 100 122 155 130" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.85"/>
<polygon points="60,124 65,131 60,138 55,131" fill="#fff" stroke="#ff3399" stroke-width="1.5"/>
<polygon points="100,117 105,125 100,133 95,125" fill="#fff" stroke="#9b6dff" stroke-width="1.5"/>
<polygon points="140,124 145,131 140,138 135,131" fill="#fff" stroke="#3a9bff" stroke-width="1.5"/>

<!-- Decorative band 2 -->
<path d="M 50 160 Q 100 152 150 160" stroke="#fff" stroke-width="2" fill="none" opacity="0.75"/>
<circle cx="70" cy="158" r="3.5" fill="#fff" stroke="#ff66c4" stroke-width="1.5"/>
<circle cx="100" cy="154" r="3.5" fill="#fff" stroke="#9b6dff" stroke-width="1.5"/>
<circle cx="130" cy="158" r="3.5" fill="#fff" stroke="#3a9bff" stroke-width="1.5"/>

<!-- Top crown -->
<polygon points="90,42 100,24 110,42" fill="#ffd700" stroke="#a87800" stroke-width="2"/>
<circle cx="100" cy="28" r="3.5" fill="#fff"/>

<!-- Highlight (shine) -->
<ellipse cx="80" cy="78" rx="20" ry="30" fill="url(#egShine)"/>

<!-- Floating sparkles -->
<polygon points="30,55 34,62 30,58 26,62" fill="#ff66c4"/>
<circle cx="35" cy="48" r="2.5" fill="#fff"/>
<polygon points="170,55 174,62 170,58 166,62" fill="#7dc8ff"/>
<circle cx="167" cy="48" r="2.5" fill="#fff"/>
<polygon points="22,168 26,175 22,171 18,175" fill="#c490ff"/>
<circle cx="178" cy="168" r="3" fill="#ffd700"/>
<polygon points="45,192 49,199 45,195 41,199" fill="#ff9ec7"/>
<circle cx="155" cy="190" r="2.5" fill="#fff"/>
<polygon points="100,5 103,12 100,9 97,12" fill="#fff"/>
</svg>`;

// ──────────────────────── Helpers ────────────────────────

window.getPetById = function(id) {
  return PETS_POOL.find(p => p.id === id) || null;
};

window.getRarity = function(key) {
  return RARITY[key] || RARITY.common;
};

// Weighted random pet from the pool. Picks a rarity tier first (by weight),
// then a uniform random pet within that tier. This gives clean, predictable odds.
window.rollRandomPet = function() {
  const tierKeys = Object.keys(RARITY);
  const totalWeight = tierKeys.reduce((s, k) => s + RARITY[k].weight, 0);
  let r = Math.random() * totalWeight;
  let chosenTier = tierKeys[0];
  for (const k of tierKeys) {
    r -= RARITY[k].weight;
    if (r <= 0) { chosenTier = k; break; }
  }
  const candidates = PETS_POOL.filter(p => p.rarity === chosenTier);
  if (candidates.length === 0) {
    // Tier has no pets defined — fall back to commons so we never roll null.
    const commons = PETS_POOL.filter(p => p.rarity === 'common');
    return commons[Math.floor(Math.random() * commons.length)];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
};

// Uniquify gradient/filter IDs so multiple instances of the same SVG on one page
// don't reuse each other's `url(#id)` references (which silently breaks fills).
function _uniquifySvgIds(svg) {
  const suffix = '_' + Math.random().toString(36).slice(2, 9);
  return svg
    .replace(/id="([a-zA-Z][\w-]*)"/g, (m, id) => `id="${id}${suffix}"`)
    .replace(/url\(#([a-zA-Z][\w-]*)\)/g, (m, id) => `url(#${id}${suffix})`);
}

window.renderEgg = function(className) {
  className = className || 'pet-svg';
  return _uniquifySvgIds(MYSTERY_EGG_SVG).replace('<svg', `<svg class="${className}"`);
};

window.renderPetById = function(id, className) {
  className = className || 'pet-svg';
  const pet = getPetById(id);
  if (!pet) return renderEgg(className);
  // Lottie-type pets render via the <dotlottie-player> web component.
  // Rainbow variant gets a hue-cycle filter (CSS animation in animations.css).
  if (pet.type === 'lottie') {
    const extraCls = pet.rainbow ? ' lottie-rainbow' : '';
    // Wrapper div carries the rainbow filter (web component shadow DOM is finicky
    // about filter inheritance, so we apply it on a regular DOM ancestor).
    // No inline width/height — let CSS .lottie-pet.<size-class> control size.
    return '<div class="lottie-wrap' + extraCls + '">' +
             '<dotlottie-player class="' + className + ' lottie-pet" autoplay loop src="' + pet.src + '" style="display:block;background:transparent" speed="1"></dotlottie-player>' +
           '</div>';
  }
  return _uniquifySvgIds(pet.svg).replace('<svg', `<svg class="${className}"`);
};

// Player-aware render: stage 0 always shows the mystery egg (no spoilers).
// Stage 1+ reveals the rolled pet. Falls back to legacy petType rendering
// for any old player data imported from before Phase 2.
window.renderPetByPlayer = function(player, className) {
  className = className || 'pet-svg';
  if (!player) return '';
  const stage = getPetStageIndex(player.totalStars);
  if (stage === 0) return renderEgg(className);
  if (player.petId) return renderPetById(player.petId, className);
  if (player.petType && window.renderPetSvg) {
    return window.renderPetSvg(player.petType, stage, className);
  }
  return renderEgg(className);
};
