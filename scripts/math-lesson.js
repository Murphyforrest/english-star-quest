// Daily Lesson player — thin wrapper around MathTutor that pins the session
// to a specific curriculum lesson and tracks mastery on completion.
//
// Flow:
//   1) Player clicks "🎓 บทเรียนวันนี้" on dashboard.
//   2) startDailyLesson() picks the next lesson from getNextLessonForPlayer().
//   3) Shows a preview modal (lesson name + vocab count + "เริ่ม!" button).
//   4) On Start: MathTutor.openWithLesson(lesson, petName) — system prompt
//      injects the lesson script so the AI follows it phase-by-phase.
//   5) AI ends with "LESSON COMPLETE!" → tutor auto-calls endSession() →
//      math-tutor.js calls DailyLesson.finishLesson() → mastery saved.

window.DailyLesson = (function () {

  // Tutor is always "Pixel" — the kids built a relationship with that name
  // and the parent prefers a consistent character across pet changes.
  // The pet still appears as an avatar in the tutor UI, but the *name* is
  // always Pixel for continuity.
  function tutorNameFor(/* player */) {
    return 'Pixel';
  }

  // Build the preview modal shown before the lesson starts. Gives the parent
  // a quick look at what's about to be taught + lets them back out.
  function showLessonPreview(player, unit, lesson, isReview) {
    const tutor = tutorNameFor(player);
    const vocabCount = (lesson.newVocab || []).length;
    const guidedCount = (lesson.guidedProblems || []).length;
    const indepCount = (lesson.independentProblems || []).length;
    const mastered = (window.countMasteredLessons && countMasteredLessons(player)) || 0;
    const total = (window.countTotalLessons && countTotalLessons()) || 0;

    const reviewBadge = isReview
      ? '<div style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:11px;background:rgba(255,215,0,.18);color:#ffd700;border:1px solid rgba(255,215,0,.4);margin-bottom:8px">🔄 ทบทวน — ยังไม่ผ่าน 80%</div><br>'
      : '';

    const html =
      reviewBadge +
      '<div style="display:inline-block;padding:6px 16px;border-radius:50px;font-size:12px;letter-spacing:1px;background:rgba(125,200,255,.18);color:#7dc8ff;border:1px solid rgba(125,200,255,.4);margin-bottom:14px">' +
        unit.emoji + ' UNIT ' + unit.id + ' — ' + unit.nameTh +
      '</div>' +
      '<h3 class="modal-title">' + lesson.nameTh + '</h3>' +
      '<p class="modal-text" style="margin-bottom:14px">' +
        '<strong style="color:#c490ff">' + lesson.nameEn + '</strong><br>' +
        '<span style="opacity:.8;font-size:13px">' + lesson.concept + '</span>' +
      '</p>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;font-size:12px">' +
        '<div style="padding:8px;background:rgba(155,109,255,.1);border-radius:10px"><div style="font-weight:700;color:#c490ff">📖</div>' + vocabCount + ' คำใหม่</div>' +
        '<div style="padding:8px;background:rgba(125,200,255,.1);border-radius:10px"><div style="font-weight:700;color:#7dc8ff">🤝</div>' + guidedCount + ' ข้อ (มี hint)</div>' +
        '<div style="padding:8px;background:rgba(255,102,196,.1);border-radius:10px"><div style="font-weight:700;color:#ff66c4">🦅</div>' + indepCount + ' ข้อ (เอง)</div>' +
      '</div>' +
      '<div style="font-size:12px;opacity:.7;margin-bottom:14px">' +
        '🐾 ครูวันนี้: <strong>' + tutor + '</strong> &nbsp;&nbsp;⏱ ประมาณ 15 นาที<br>' +
        '📊 ความคืบหน้ารวม: ' + mastered + ' / ' + total + ' บทเรียน' +
      '</div>' +
      '<button class="btn-primary"   id="startLessonBtn" style="width:100%;margin-bottom:8px;background:linear-gradient(135deg,#7dc8ff,#c490ff,#ff66c4);background-size:200% 100%;animation:gs 4s linear infinite;font-size:16px;padding:14px">✨ เริ่มเรียนเลย!</button>' +
      '<button class="btn-secondary" id="cancelLessonBtn" style="width:100%">ยังก่อน</button>';

    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.add('active');
    document.getElementById('startLessonBtn').onclick = function () {
      closeModal();
      // openWithLesson MUST be triggered inside this click — iOS audio unlock requires user gesture
      if (window.MathTutor && MathTutor.openWithLesson) {
        MathTutor.openWithLesson(lesson, tutor);
      } else {
        alert('Math Tutor ไม่พร้อม กรุณา reload หน้า');
      }
    };
    document.getElementById('cancelLessonBtn').onclick = closeModal;
  }

  return {
    // Called by the "🎓 บทเรียนวันนี้" button on the dashboard.
    start() {
      const player = getCurrentPlayer();
      if (!player) return;
      const next = (window.getNextLessonForPlayer && getNextLessonForPlayer(player));
      if (!next) {
        alert('ยังไม่มีบทเรียนพร้อมสอน — รอเซสชั่นหน้าครับ');
        return;
      }
      showLessonPreview(player, next.unit, next.lesson, next.isReview);
    },

    // Called by math-tutor.js endSession() when a lesson session wraps up.
    // For Phase 4b.1 we score by stars-earned vs total-possible. Phase 4b.2
    // will replace this with proper per-question accuracy from the chat log.
    finishLesson(player, lesson, starsEarned) {
      if (!player || !lesson) return;
      const totalProblems = ((lesson.guidedProblems || []).length) +
                            ((lesson.independentProblems || []).length);
      // Simple heuristic: if they earned at least 1 star per problem (the AI
      // gives +1 per correct answer), treat as full mastery. Otherwise scale.
      const expectedStars = totalProblems > 0 ? totalProblems : 1;
      const ratio = Math.min(1, starsEarned / expectedStars);
      const scorePercent = Math.round(ratio * 100);

      // Init curriculum container if first lesson ever
      if (!player.curriculum || typeof player.curriculum !== 'object') {
        player.curriculum = { currentUnit: 1, currentLesson: 1, completedLessons: {} };
      }
      if (!player.curriculum.completedLessons) player.curriculum.completedLessons = {};

      // Only overwrite if this attempt scored higher than the previous best
      const prev = player.curriculum.completedLessons[lesson.id];
      if (!prev || scorePercent > (prev.score || 0)) {
        player.curriculum.completedLessons[lesson.id] = {
          score: scorePercent,
          completedAt: Date.now(),
          starsEarned: starsEarned
        };
      }

      // Advance current pointer if mastered
      if (scorePercent >= 80 && window.MATH_CURRICULUM) {
        const allLessons = [];
        MATH_CURRICULUM.units.forEach(u =>
          u.lessons.forEach(l => allLessons.push({ unitId: u.id, lessonId: l.id }))
        );
        const idx = allLessons.findIndex(x => x.lessonId === lesson.id);
        if (idx >= 0 && idx + 1 < allLessons.length) {
          player.curriculum.currentUnit = allLessons[idx + 1].unitId;
          // Lesson number within the unit (1-based) for display
          const nextLessonObj = allLessons[idx + 1];
          const nextUnit = MATH_CURRICULUM.units.find(u => u.id === nextLessonObj.unitId);
          const nextLessonIdx = nextUnit.lessons.findIndex(l => l.id === nextLessonObj.lessonId);
          player.curriculum.currentLesson = nextLessonIdx + 1;
        }
      }
      saveState();

      // Refresh dashboard so the progress badge updates if user returns
      if (typeof renderDashboard === 'function') {
        try { renderDashboard(); } catch (e) {}
      }
    }
  };
})();

// Convenience global for the dashboard onclick handler
window.openDailyLesson = function () {
  if (window.DailyLesson && DailyLesson.start) DailyLesson.start();
};
