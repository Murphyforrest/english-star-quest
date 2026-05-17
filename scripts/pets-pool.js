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
  // ────────────────────── COMMON (50% total, 2 pets — 25% each) ──────────────────────
  // Snow Fox — pure white fur with ice-blue ear/tail tips, snowflake sparkles.
  // Magic accents (snowflakes, ice-blue eyes) keep the daughter engaged despite a
  // simple common-tier roll.
  {
    id: 'snow-fox', rarity: 'common',
    nameEn: 'Snow Fox', nameTh: 'จิ้งจอกหิมะ',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="sfB" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#dff1ff"/></radialGradient><linearGradient id="sfTail" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#b3e5ff"/></linearGradient></defs><path d="M 145 145 Q 178 130 185 100 Q 188 80 175 75 Q 178 92 170 105 Q 178 120 168 138 Q 162 128 152 130" fill="url(#sfTail)" stroke="#6ab5d6" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="100" cy="125" rx="50" ry="48" fill="url(#sfB)" stroke="#6ab5d6" stroke-width="3"/><polygon points="55,75 70,38 85,72" fill="url(#sfB)" stroke="#6ab5d6" stroke-width="2.5"/><polygon points="145,75 130,38 115,72" fill="url(#sfB)" stroke="#6ab5d6" stroke-width="2.5"/><polygon points="62,72 70,52 78,72" fill="#b3e5ff"/><polygon points="138,72 130,52 122,72" fill="#b3e5ff"/><polygon points="66,55 70,42 74,55" fill="#7dc8ff"/><polygon points="134,55 130,42 126,55" fill="#7dc8ff"/><ellipse cx="80" cy="115" rx="10" ry="12" fill="#fff" stroke="#6ab5d6" stroke-width="1.5"/><ellipse cx="120" cy="115" rx="10" ry="12" fill="#fff" stroke="#6ab5d6" stroke-width="1.5"/><ellipse cx="80" cy="117" rx="6" ry="8" fill="#66ccff"/><ellipse cx="120" cy="117" rx="6" ry="8" fill="#66ccff"/><ellipse cx="80" cy="119" rx="3" ry="5" fill="#1a1740"/><ellipse cx="120" cy="119" rx="3" ry="5" fill="#1a1740"/><circle cx="82" cy="114" r="2.5" fill="#fff"/><circle cx="122" cy="114" r="2.5" fill="#fff"/><polygon points="100,130 95,134 100,137 105,134" fill="#1a1740"/><path d="M 95 140 Q 100 145 105 140" stroke="#6ab5d6" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="65" cy="130" rx="7" ry="5" fill="#b3e5ff" opacity=".7"/><ellipse cx="135" cy="130" rx="7" ry="5" fill="#b3e5ff" opacity=".7"/><ellipse cx="80" cy="170" rx="11" ry="6" fill="#dff1ff" stroke="#6ab5d6" stroke-width="2"/><ellipse cx="120" cy="170" rx="11" ry="6" fill="#dff1ff" stroke="#6ab5d6" stroke-width="2"/><g stroke="#7dc8ff" stroke-width="1.2" stroke-linecap="round"><path d="M 30 50 L 30 60 M 25 55 L 35 55 M 27 52 L 33 58 M 27 58 L 33 52"/><path d="M 170 60 L 170 70 M 165 65 L 175 65 M 167 62 L 173 68 M 167 68 L 173 62"/><path d="M 25 145 L 25 153 M 21 149 L 29 149 M 22 146 L 28 152 M 22 152 L 28 146"/></g><circle cx="40" cy="35" r="2" fill="#fff"/><circle cx="165" cy="40" r="2" fill="#fff"/><circle cx="22" cy="175" r="1.5" fill="#fff"/></svg>`
  },
  // Sunset Fox — warm orange body, cream belly, gold ear tips, blue eyes, pink flower
  // accessory by the right ear (girlie touch the daughter will love).
  {
    id: 'sunset-fox', rarity: 'common',
    nameEn: 'Sunset Fox', nameTh: 'จิ้งจอกตะวันลับฟ้า',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="sxB" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#ffd29c"/><stop offset="100%" stop-color="#ff6f1f"/></radialGradient><linearGradient id="sxTail" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ff8c3f"/><stop offset="80%" stop-color="#ffd700"/><stop offset="100%" stop-color="#fff5e0"/></linearGradient></defs><path d="M 145 145 Q 178 130 188 95 Q 192 72 175 70 Q 180 90 170 105 Q 180 120 170 140 Q 162 128 152 132" fill="url(#sxTail)" stroke="#a8430f" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="100" cy="125" rx="50" ry="48" fill="url(#sxB)" stroke="#a8430f" stroke-width="3"/><ellipse cx="100" cy="140" rx="30" ry="22" fill="#fff5e0"/><polygon points="55,75 68,35 82,72" fill="url(#sxB)" stroke="#a8430f" stroke-width="2.5"/><polygon points="145,75 132,35 118,72" fill="url(#sxB)" stroke="#a8430f" stroke-width="2.5"/><polygon points="62,72 68,50 76,72" fill="#fff5e0"/><polygon points="138,72 132,50 124,72" fill="#fff5e0"/><polygon points="65,42 68,35 71,42" fill="#ffd700"/><polygon points="135,42 132,35 129,42" fill="#ffd700"/><g transform="translate(40 62)"><ellipse cx="0" cy="-4" rx="3" ry="4" fill="#ff66c4"/><ellipse cx="-4" cy="0" rx="4" ry="3" fill="#ff66c4"/><ellipse cx="4" cy="0" rx="4" ry="3" fill="#ff66c4"/><ellipse cx="0" cy="4" rx="3" ry="4" fill="#ff9ec7"/><circle cx="0" cy="0" r="2" fill="#ffd700"/></g><ellipse cx="80" cy="115" rx="10" ry="12" fill="#fff" stroke="#a8430f" stroke-width="1.5"/><ellipse cx="120" cy="115" rx="10" ry="12" fill="#fff" stroke="#a8430f" stroke-width="1.5"/><ellipse cx="80" cy="117" rx="6" ry="8" fill="#66ccff"/><ellipse cx="120" cy="117" rx="6" ry="8" fill="#66ccff"/><ellipse cx="80" cy="119" rx="3" ry="5" fill="#1a1740"/><ellipse cx="120" cy="119" rx="3" ry="5" fill="#1a1740"/><circle cx="82" cy="114" r="2.5" fill="#fff"/><circle cx="122" cy="114" r="2.5" fill="#fff"/><polygon points="100,130 95,134 100,137 105,134" fill="#1a1740"/><path d="M 95 140 Q 100 145 105 140" stroke="#a8430f" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="65" cy="128" rx="6" ry="4" fill="#ff9ec7" opacity=".7"/><ellipse cx="135" cy="128" rx="6" ry="4" fill="#ff9ec7" opacity=".7"/><ellipse cx="80" cy="170" rx="11" ry="6" fill="#a8430f"/><ellipse cx="120" cy="170" rx="11" ry="6" fill="#a8430f"/><circle cx="30" cy="40" r="2.5" fill="#ffd700"/><polygon points="170,55 174,62 170,58 166,62" fill="#ff66c4"/><circle cx="170" cy="48" r="1.5" fill="#fff"/><polygon points="22,170 26,175 22,172 18,175" fill="#ffd700"/><circle cx="178" cy="170" r="2" fill="#ff66c4"/></svg>`
  },

  // ────────────────────── RARE (30% total, 1 pet) ──────────────────────
  // Jewel Jaguar — golden body with black rosette spots; a few spots are tiny
  // purple/pink gems that catch the light. Emerald eyes with cat-slit pupils.
  {
    id: 'jewel-jaguar', rarity: 'rare',
    nameEn: 'Jewel Jaguar', nameTh: 'เสือจากัวร์อัญมณี',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="jjB" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#ffe066"/><stop offset="100%" stop-color="#d4a017"/></radialGradient><linearGradient id="jjTail" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#e8b020"/><stop offset="100%" stop-color="#a87800"/></linearGradient></defs><path d="M 150 150 Q 185 140 188 100 Q 188 78 172 78 Q 178 96 172 110 Q 182 128 172 148" fill="url(#jjTail)" stroke="#7a5a08" stroke-width="2.5" stroke-linejoin="round"/><circle cx="183" cy="92" r="3" fill="#1a1740"/><circle cx="180" cy="115" r="3" fill="#1a1740"/><circle cx="178" cy="135" r="2.5" fill="#1a1740"/><ellipse cx="100" cy="128" rx="52" ry="48" fill="url(#jjB)" stroke="#7a5a08" stroke-width="3"/><ellipse cx="100" cy="142" rx="32" ry="22" fill="#fff5b8"/><ellipse cx="100" cy="88" rx="44" ry="40" fill="url(#jjB)" stroke="#7a5a08" stroke-width="2.5"/><ellipse cx="66" cy="58" rx="12" ry="14" fill="url(#jjB)" stroke="#7a5a08" stroke-width="2"/><ellipse cx="134" cy="58" rx="12" ry="14" fill="url(#jjB)" stroke="#7a5a08" stroke-width="2"/><ellipse cx="66" cy="61" rx="6" ry="8" fill="#ff9ec7" opacity=".55"/><ellipse cx="134" cy="61" rx="6" ry="8" fill="#ff9ec7" opacity=".55"/><g fill="#1a1740"><circle cx="65" cy="110" r="2"/><circle cx="71" cy="106" r="1.5"/><circle cx="73" cy="113" r="1.5"/><circle cx="67" cy="116" r="1.5"/><circle cx="135" cy="110" r="2"/><circle cx="129" cy="106" r="1.5"/><circle cx="127" cy="113" r="1.5"/><circle cx="133" cy="116" r="1.5"/><circle cx="60" cy="135" r="2"/><circle cx="66" cy="131" r="1.5"/><circle cx="68" cy="138" r="1.5"/><circle cx="62" cy="141" r="1.5"/><circle cx="140" cy="135" r="2"/><circle cx="134" cy="131" r="1.5"/><circle cx="132" cy="138" r="1.5"/><circle cx="138" cy="141" r="1.5"/><circle cx="75" cy="155" r="1.5"/><circle cx="125" cy="155" r="1.5"/><circle cx="70" cy="78" r="1.5"/><circle cx="130" cy="78" r="1.5"/><circle cx="82" cy="66" r="1.5"/><circle cx="118" cy="66" r="1.5"/></g><circle cx="80" cy="120" r="3" fill="#c490ff" stroke="#fff" stroke-width="0.8"/><circle cx="120" cy="125" r="3" fill="#ff66c4" stroke="#fff" stroke-width="0.8"/><circle cx="100" cy="158" r="2.5" fill="#c490ff" stroke="#fff" stroke-width="0.8"/><ellipse cx="85" cy="86" rx="9" ry="11" fill="#fff" stroke="#7a5a08" stroke-width="1.5"/><ellipse cx="115" cy="86" rx="9" ry="11" fill="#fff" stroke="#7a5a08" stroke-width="1.5"/><ellipse cx="85" cy="88" rx="5.5" ry="8.5" fill="#50e3a4"/><ellipse cx="115" cy="88" rx="5.5" ry="8.5" fill="#50e3a4"/><ellipse cx="85" cy="89" rx="1.5" ry="6.5" fill="#1a1740"/><ellipse cx="115" cy="89" rx="1.5" ry="6.5" fill="#1a1740"/><circle cx="87" cy="85" r="2" fill="#fff"/><circle cx="117" cy="85" r="2" fill="#fff"/><polygon points="100,100 95,105 100,108 105,105" fill="#1a1740"/><path d="M 92 112 Q 100 118 108 112" stroke="#7a5a08" stroke-width="2" fill="none" stroke-linecap="round"/><polygon points="96,111 97,116 98,111" fill="#fff"/><polygon points="102,111 103,116 104,111" fill="#fff"/><ellipse cx="78" cy="172" rx="12" ry="6" fill="#7a5a08"/><ellipse cx="122" cy="172" rx="12" ry="6" fill="#7a5a08"/><polygon points="22,50 26,57 22,53 18,57" fill="#c490ff"/><circle cx="22" cy="46" r="1.5" fill="#fff"/><polygon points="175,50 179,57 175,53 171,57" fill="#ff66c4"/><circle cx="175" cy="46" r="1.5" fill="#fff"/><circle cx="30" cy="170" r="2" fill="#ffd700"/><polygon points="170,178 174,185 170,181 166,185" fill="#c490ff"/></svg>`
  },

  // ────────────────────── SUPER RARE (15% total, 1 pet) ──────────────────────
  // Shadow Tiger — pitch-black body with purple shimmer stripes, glowing blue eyes,
  // soft purple aura. Mysterious vibe to amp up the "rare" feeling.
  {
    id: 'shadow-tiger', rarity: 'superRare',
    nameEn: 'Shadow Tiger', nameTh: 'เสือเงามนตรา',
    svg: `<svg viewBox="0 0 200 200"><defs><radialGradient id="stB" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#2a1f4f"/><stop offset="100%" stop-color="#0a0820"/></radialGradient><linearGradient id="stStripe" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#9b6dff"/><stop offset="100%" stop-color="#5a2eb8"/></linearGradient><radialGradient id="stAura" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="rgba(155,109,255,0.35)"/><stop offset="100%" stop-color="rgba(155,109,255,0)"/></radialGradient><radialGradient id="stEye" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff"/><stop offset="40%" stop-color="#66ccff"/><stop offset="100%" stop-color="#1a4f88"/></radialGradient></defs><circle cx="100" cy="110" r="92" fill="url(#stAura)"/><path d="M 150 150 Q 185 140 188 100 Q 188 78 172 78 Q 178 96 172 110 Q 182 128 172 148" fill="url(#stB)" stroke="#5a2eb8" stroke-width="2.5" stroke-linejoin="round"/><path d="M 180 90 Q 184 92 186 95" stroke="url(#stStripe)" stroke-width="2.5" fill="none" opacity="0.8"/><path d="M 178 115 Q 184 117 186 120" stroke="url(#stStripe)" stroke-width="2.5" fill="none" opacity="0.8"/><ellipse cx="100" cy="128" rx="52" ry="48" fill="url(#stB)" stroke="#5a2eb8" stroke-width="3"/><ellipse cx="100" cy="142" rx="32" ry="22" fill="#1a1235" opacity=".85"/><g stroke="url(#stStripe)" stroke-width="3" fill="none" opacity="0.75" stroke-linecap="round"><path d="M 60 115 Q 68 110 76 115"/><path d="M 124 115 Q 132 110 140 115"/><path d="M 55 135 Q 65 130 75 135"/><path d="M 125 135 Q 135 130 145 135"/><path d="M 60 160 Q 70 155 80 160"/><path d="M 120 160 Q 130 155 140 160"/></g><ellipse cx="100" cy="90" rx="44" ry="40" fill="url(#stB)" stroke="#5a2eb8" stroke-width="2.5"/><polygon points="60,60 70,28 84,62" fill="url(#stB)" stroke="#5a2eb8" stroke-width="2.5"/><polygon points="140,60 130,28 116,62" fill="url(#stB)" stroke="#5a2eb8" stroke-width="2.5"/><polygon points="65,60 70,42 78,60" fill="#5a2eb8" opacity=".7"/><polygon points="135,60 130,42 122,60" fill="#5a2eb8" opacity=".7"/><g stroke="url(#stStripe)" stroke-width="2.5" fill="none" opacity="0.8" stroke-linecap="round"><path d="M 68 78 Q 75 75 82 80"/><path d="M 118 80 Q 125 75 132 78"/><path d="M 75 65 L 80 70"/><path d="M 125 65 L 120 70"/></g><circle cx="84" cy="90" r="14" fill="none" stroke="#66ccff" stroke-width="0.8" opacity=".4"/><circle cx="116" cy="90" r="14" fill="none" stroke="#66ccff" stroke-width="0.8" opacity=".4"/><ellipse cx="84" cy="88" rx="11" ry="13" fill="#fff" stroke="#5a2eb8" stroke-width="1.5"/><ellipse cx="116" cy="88" rx="11" ry="13" fill="#fff" stroke="#5a2eb8" stroke-width="1.5"/><ellipse cx="84" cy="90" rx="8" ry="10" fill="url(#stEye)"/><ellipse cx="116" cy="90" rx="8" ry="10" fill="url(#stEye)"/><ellipse cx="84" cy="91" rx="1.8" ry="7" fill="#0a0820"/><ellipse cx="116" cy="91" rx="1.8" ry="7" fill="#0a0820"/><circle cx="87" cy="86" r="2.5" fill="#fff"/><circle cx="119" cy="86" r="2.5" fill="#fff"/><polygon points="100,102 95,107 100,110 105,107" fill="#9b6dff"/><path d="M 90 115 Q 100 122 110 115" stroke="#5a2eb8" stroke-width="2.5" fill="none" stroke-linecap="round"/><polygon points="95,114 96,120 97,114" fill="#fff"/><polygon points="103,114 104,120 105,114" fill="#fff"/><ellipse cx="78" cy="172" rx="12" ry="6" fill="#0a0820" stroke="#5a2eb8" stroke-width="1.5"/><ellipse cx="122" cy="172" rx="12" ry="6" fill="#0a0820" stroke="#5a2eb8" stroke-width="1.5"/><polygon points="22,52 26,59 22,55 18,59" fill="#9b6dff"/><circle cx="22" cy="48" r="2" fill="#fff"/><polygon points="175,55 179,62 175,58 171,62" fill="#c490ff"/><circle cx="175" cy="51" r="1.5" fill="#fff"/><circle cx="30" cy="170" r="2" fill="#9b6dff"/><polygon points="170,178 174,185 170,181 166,185" fill="#c490ff"/><circle cx="170" cy="174" r="1.5" fill="#fff"/></svg>`
  },

  // ────────────────────── LEGENDARY (5%, 1 pet — the daughter's centerpiece) ──────────────────────
  // Rainbow Dragon — custom SVG with element-level animations (wing flap, blink,
  // breathe, tail sway, sparkles). Class names below are hooked up by animations.css.
  // DO NOT modify this SVG without checking the animation classes still match.
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
  if (!PETS_POOL.length) return null;
  const tierKeys = Object.keys(RARITY);
  const totalWeight = tierKeys.reduce((s, k) => s + RARITY[k].weight, 0);
  let r = Math.random() * totalWeight;
  let chosenTier = tierKeys[0];
  for (const k of tierKeys) {
    r -= RARITY[k].weight;
    if (r <= 0) { chosenTier = k; break; }
  }
  const candidates = PETS_POOL.filter(p => p.rarity === chosenTier);
  if (candidates.length) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  // Tier has no pets defined — fall back to commons.
  const commons = PETS_POOL.filter(p => p.rarity === 'common');
  if (commons.length) {
    return commons[Math.floor(Math.random() * commons.length)];
  }
  // Last-resort fallback so a dev removing tiers can never produce a null pet
  // (a null pet would render the post-hatch screen as a plain egg again).
  return PETS_POOL[Math.floor(Math.random() * PETS_POOL.length)];
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
//
// Auto re-roll: if a player has a saved petId that no longer exists in the pool
// (e.g. after we removed pets in Phase 3.1), roll a new one and persist it.
// Without this, those players would see the post-hatch screen render as a plain
// egg forever.
window.renderPetByPlayer = function(player, className) {
  className = className || 'pet-svg';
  if (!player) return '';
  const stage = getPetStageIndex(player.totalStars);
  if (stage === 0) return renderEgg(className);
  if (player.petId) {
    if (!getPetById(player.petId) && window.rollRandomPet) {
      const fresh = rollRandomPet();
      if (fresh) {
        player.petId = fresh.id;
        if (typeof saveState === 'function') saveState();
      }
    }
    return renderPetById(player.petId, className);
  }
  if (player.petType && window.renderPetSvg) {
    return window.renderPetSvg(player.petType, stage, className);
  }
  return renderEgg(className);
};
