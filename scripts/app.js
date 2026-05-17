// App entry point: load saved state, seed defaults on first run, render login,
// register service worker (PWA), set up speech voice preloading.

(function init() {
  if (!loadState()) {
    // Fresh install — seed the shop. Quests are per-player and assigned at player creation.
    state.rewards = DEFAULT_REWARDS.slice();
    saveState();
  }
  renderLogin();

  // Register service worker for offline support + iPad home-screen install.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // iOS Safari loads voices asynchronously — prime them once.
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => {});
  }
})();
