// Math curriculum (G3 Singapore Math, English-medium).
// Single source of truth for Daily Lessons. Lesson IDs are 'U-L' strings ("1-3"
// = Unit 1 Lesson 3) so player.curriculum.completedLessons can use them as keys.
//
// Each lesson is a 15-min flow with 5 phases driven by math-lesson.js:
//   warmup → newConcept → guidedPractice → independentPractice → wrapup
//
// AI receives the lesson object as context for the conversation, so it stays
// on the day's topic and uses the listed vocab — no free-form drift.

window.MATH_CURRICULUM = {
  // Order matters — units are taken in sequence. Lessons inside a unit also unlock
  // sequentially once the prior one hits 80% mastery.
  units: [
    {
      id: 1,
      nameEn: 'Place Value',
      nameTh: 'ค่าประจำหลัก',
      emoji: '🔢',
      description: 'เลข 1-1000 — เข้าใจค่าของแต่ละหลัก (hundreds, tens, ones) ก่อนเริ่มบวกลบเลขใหญ่',
      lessons: [
        {
          id: '1-1',
          nameEn: 'Numbers 1 to 100',
          nameTh: 'เลข 1 ถึง 100',
          concept: 'Counting 1-100, recognizing number patterns, place names "tens" and "ones".',
          newVocab: [
            { en: 'number',  th: 'ตัวเลข',     example: '7 is a number' },
            { en: 'count',   th: 'นับ',        example: 'Count to 10' },
            { en: 'tens',    th: 'สิบ (หลัก)', example: '30 has 3 tens' },
            { en: 'ones',    th: 'หน่วย',      example: '7 has 7 ones' }
          ],
          warmupPrompt: 'Ask Lin to count by 10s up to 100 (10, 20, 30...).',
          conceptScript: [
            'Numbers from 1 to 100 are built from TENS and ONES.',
            'Example: 34 = 3 tens + 4 ones',
            'Show 34 with blocks: 🟦🟦🟦 (3 tens) + 🟧🟧🟧🟧 (4 ones) = 34'
          ],
          guidedProblems: [
            { q: 'What number is 5 tens + 2 ones?',  a: '52', hint: '5 tens means 50. 50 + 2 = ?' },
            { q: 'How many tens are in 70?',         a: '7',  hint: '70 = ? tens + 0 ones' },
            { q: 'How many ones are in 28?',         a: '8',  hint: '28 = 2 tens + ? ones' }
          ],
          independentProblems: [
            { q: 'Write 46 as tens + ones',  a: '4 tens + 6 ones' },
            { q: 'Write 81 as tens + ones',  a: '8 tens + 1 ones' }
          ]
        },
        {
          id: '1-2',
          nameEn: 'Tens and Ones',
          nameTh: 'สิบและหน่วย',
          concept: 'Decompose any 2-digit number into tens and ones; recompose to get the number back.',
          newVocab: [
            { en: 'digit',    th: 'ตัวเลขหลัก', example: '34 has 2 digits' },
            { en: 'place',    th: 'หลัก/ตำแหน่ง', example: 'The tens place' },
            { en: 'value',    th: 'ค่า',         example: 'The value of 3 in 34 is 30' }
          ],
          warmupPrompt: 'Quick review: How many tens in 60? How many ones in 47?',
          conceptScript: [
            'Every 2-digit number has a TENS digit and a ONES digit.',
            'In 47: the digit 4 is in the TENS place, value = 40.',
            'In 47: the digit 7 is in the ONES place, value = 7.',
            '47 = 40 + 7'
          ],
          guidedProblems: [
            { q: 'In 63, what is the value of the digit 6?', a: '60', hint: '6 is in the tens place' },
            { q: 'In 89, which digit is in the ones place?', a: '9',  hint: 'The right-most digit' },
            { q: 'What is 70 + 5?',                          a: '75', hint: '7 tens + 5 ones' }
          ],
          independentProblems: [
            { q: 'Break 92 into tens place + ones place',  a: '90 + 2' },
            { q: 'What number is 80 + 4?',                 a: '84' }
          ]
        },
        {
          id: '1-3',
          nameEn: 'Hundreds',
          nameTh: 'หลักร้อย',
          concept: 'Introduce the hundreds place. 100 = 10 tens. Numbers from 100 to 999 have 3 digits.',
          newVocab: [
            { en: 'hundred',  th: 'ร้อย', example: '100 is one hundred' },
            { en: 'three-digit number', th: 'เลข 3 หลัก', example: '345 is a three-digit number' }
          ],
          warmupPrompt: 'Count by 10s: 10, 20, 30... up to 100. Then say "100 = ten tens!"',
          conceptScript: [
            'A HUNDRED is ten tens packed together: 10 × 10 = 100',
            'Show 100 as a big square: ⬛ (10 rows of 10)',
            'Three-digit numbers have HUNDREDS, TENS, and ONES.',
            'Example: 234 = 2 hundreds + 3 tens + 4 ones'
          ],
          guidedProblems: [
            { q: 'How many tens are in 100?',          a: '10', hint: '100 = ? tens' },
            { q: 'What is 2 hundreds + 0 tens + 0 ones?', a: '200', hint: '2 × 100' },
            { q: 'How many hundreds are in 500?',      a: '5',  hint: '500 = ? × 100' }
          ],
          independentProblems: [
            { q: 'Write 347 as hundreds + tens + ones', a: '3 hundreds + 4 tens + 7 ones' },
            { q: 'What number is 6 hundreds + 2 tens + 5 ones?', a: '625' }
          ]
        },
        {
          id: '1-4',
          nameEn: 'Three-digit Numbers',
          nameTh: 'เลข 3 หลัก',
          concept: 'Read and write any 3-digit number (100-999). Identify the value of each digit.',
          newVocab: [
            { en: 'expanded form', th: 'รูปกระจาย', example: '347 = 300 + 40 + 7' },
            { en: 'standard form', th: 'รูปย่อ',     example: '347 in standard form is 347' }
          ],
          warmupPrompt: 'Quick: how many hundreds in 400? How many tens in 90?',
          conceptScript: [
            'Standard form: 347 (the regular way)',
            'Expanded form: 300 + 40 + 7 (shows the value of each digit)',
            'The digit 3 in 347 has VALUE 300 because it is in the hundreds place.'
          ],
          guidedProblems: [
            { q: 'Write 528 in expanded form', a: '500 + 20 + 8', hint: 'hundreds value + tens value + ones value' },
            { q: 'What is the value of 7 in 472?', a: '70', hint: '7 is in the tens place' },
            { q: 'In standard form, what is 600 + 30 + 9?', a: '639', hint: 'Just put the digits together' }
          ],
          independentProblems: [
            { q: 'Write 815 in expanded form', a: '800 + 10 + 5' },
            { q: 'What is the value of 9 in 296?', a: '90' }
          ]
        },
        {
          id: '1-5',
          nameEn: 'Comparing Numbers',
          nameTh: 'เปรียบเทียบเลข',
          concept: 'Compare two 3-digit numbers using "greater than", "less than", "equal to" and the symbols > < =.',
          newVocab: [
            { en: 'greater than', th: 'มากกว่า',   example: '50 is greater than 30' },
            { en: 'less than',    th: 'น้อยกว่า', example: '20 is less than 50' },
            { en: 'equal to',     th: 'เท่ากับ',  example: '45 is equal to 45' }
          ],
          warmupPrompt: 'Which is bigger: 60 or 80? Why?',
          conceptScript: [
            'To compare numbers, look at the HUNDREDS place first.',
            'If hundreds are equal, look at TENS. If tens are equal, look at ONES.',
            '347 vs 528 → 3 hundreds < 5 hundreds → so 347 < 528',
            'Symbols: > means greater than, < means less than, = means equal to'
          ],
          guidedProblems: [
            { q: 'Which is greater: 234 or 432?', a: '432', hint: 'Compare the hundreds digit first' },
            { q: 'Fill in: 567 ___ 576', a: '<', hint: 'Hundreds equal, compare tens: 6 vs 7' },
            { q: 'Is 999 greater than 1000?', a: 'no', hint: '999 has 3 digits, 1000 has 4' }
          ],
          independentProblems: [
            { q: 'Which is less: 705 or 750?', a: '705' },
            { q: 'Fill in: 481 ___ 481', a: '=' }
          ]
        },
        {
          id: '1-6',
          nameEn: 'Number Patterns',
          nameTh: 'รูปแบบของเลข',
          concept: 'Recognize and continue patterns: count by 2s, 5s, 10s, 100s.',
          newVocab: [
            { en: 'pattern',    th: 'รูปแบบ',  example: '2, 4, 6, 8 is a pattern' },
            { en: 'skip count', th: 'นับข้าม', example: 'Skip count by 5: 5, 10, 15, 20' }
          ],
          warmupPrompt: 'Count by 5s up to 30: 5, 10, 15...',
          conceptScript: [
            'Patterns help us count faster.',
            'Skip count by 2: 2, 4, 6, 8, 10... (add 2 each time)',
            'Skip count by 5: 5, 10, 15, 20, 25... (add 5 each time)',
            'Skip count by 10: 10, 20, 30, 40... (add 10 each time)',
            'Skip count by 100: 100, 200, 300, 400... (add 100 each time)'
          ],
          guidedProblems: [
            { q: 'Continue: 10, 20, 30, ___', a: '40', hint: 'Skip by 10' },
            { q: 'Continue: 25, 30, 35, ___', a: '40', hint: 'Skip by 5' },
            { q: 'Continue: 200, 300, 400, ___', a: '500', hint: 'Skip by 100' }
          ],
          independentProblems: [
            { q: 'Continue: 14, 16, 18, ___', a: '20' },
            { q: 'Continue: 700, 600, 500, ___', a: '400' }
          ]
        },
        {
          id: '1-7',
          nameEn: 'Rounding to the Nearest 10',
          nameTh: 'ปัดเศษถึงสิบที่ใกล้ที่สุด',
          concept: 'Round 2-digit and 3-digit numbers to the nearest 10. Use the ones digit: 0-4 round down, 5-9 round up.',
          newVocab: [
            { en: 'round',         th: 'ปัด',            example: 'Round 47 to the nearest 10' },
            { en: 'nearest',       th: 'ใกล้ที่สุด',     example: '47 is nearest to 50' },
            { en: 'round up',      th: 'ปัดขึ้น',        example: '47 rounds up to 50' },
            { en: 'round down',    th: 'ปัดลง',          example: '43 rounds down to 40' }
          ],
          warmupPrompt: 'Is 47 closer to 40 or 50?',
          conceptScript: [
            'Look at the ONES digit:',
            '  0, 1, 2, 3, 4 → round DOWN (keep the tens, drop to 0)',
            '  5, 6, 7, 8, 9 → round UP (add 1 to the tens, ones becomes 0)',
            'Example: 47 → ones is 7 → round UP → 50',
            'Example: 43 → ones is 3 → round DOWN → 40'
          ],
          guidedProblems: [
            { q: 'Round 38 to the nearest 10', a: '40', hint: 'Ones digit is 8 → round up' },
            { q: 'Round 62 to the nearest 10', a: '60', hint: 'Ones digit is 2 → round down' },
            { q: 'Round 85 to the nearest 10', a: '90', hint: '5 always rounds up' }
          ],
          independentProblems: [
            { q: 'Round 74 to the nearest 10', a: '70' },
            { q: 'Round 159 to the nearest 10', a: '160' }
          ]
        },
        {
          id: '1-8',
          nameEn: 'Rounding to the Nearest 100',
          nameTh: 'ปัดเศษถึงร้อยที่ใกล้ที่สุด',
          concept: 'Round 3-digit numbers to the nearest 100. Use the tens digit: 0-4 round down, 5-9 round up.',
          newVocab: [
            { en: 'estimate', th: 'ประมาณ', example: 'Estimate 234 to the nearest 100 = 200' }
          ],
          warmupPrompt: 'Round 47 and 85 to the nearest 10 (review).',
          conceptScript: [
            'For nearest 100, look at the TENS digit (not ones):',
            '  Tens 0-4 → round DOWN (hundreds stays, tens & ones become 0)',
            '  Tens 5-9 → round UP (add 1 to hundreds, rest become 0)',
            'Example: 347 → tens is 4 → round DOWN → 300',
            'Example: 372 → tens is 7 → round UP → 400'
          ],
          guidedProblems: [
            { q: 'Round 234 to the nearest 100', a: '200', hint: 'Tens digit is 3 → round down' },
            { q: 'Round 567 to the nearest 100', a: '600', hint: 'Tens digit is 6 → round up' },
            { q: 'Round 850 to the nearest 100', a: '900', hint: 'Tens digit is 5 → round up' }
          ],
          independentProblems: [
            { q: 'Round 419 to the nearest 100', a: '400' },
            { q: 'Round 783 to the nearest 100', a: '800' }
          ]
        },
        {
          id: '1-9',
          nameEn: 'Ordering Numbers',
          nameTh: 'เรียงลำดับเลข',
          concept: 'Put 3 or more numbers in order from least to greatest, or greatest to least.',
          newVocab: [
            { en: 'order',         th: 'เรียงลำดับ',      example: 'Put in order from smallest' },
            { en: 'least',         th: 'น้อยที่สุด',      example: '5 is the least of 5, 10, 20' },
            { en: 'greatest',      th: 'มากที่สุด',       example: '20 is the greatest' },
            { en: 'ascending',     th: 'เพิ่มขึ้น',        example: '1, 2, 3 is ascending' },
            { en: 'descending',    th: 'ลดลง',           example: '5, 4, 3 is descending' }
          ],
          warmupPrompt: 'Which is greater: 234, 432, or 342?',
          conceptScript: [
            'ASCENDING = small to big (least → greatest)',
            'DESCENDING = big to small (greatest → least)',
            'Always compare HUNDREDS first, then TENS, then ONES.',
            'Example: order 432, 234, 342',
            '  Compare hundreds: 4, 2, 3 → 234 < 342 < 432',
            '  Ascending: 234, 342, 432'
          ],
          guidedProblems: [
            { q: 'Order ascending: 76, 67, 75', a: '67, 75, 76', hint: 'Smallest first' },
            { q: 'Order descending: 234, 423, 342', a: '423, 342, 234', hint: 'Largest first' },
            { q: 'Which is the greatest: 567, 576, 657?', a: '657', hint: 'Compare hundreds' }
          ],
          independentProblems: [
            { q: 'Order ascending: 815, 581, 851', a: '581, 815, 851' },
            { q: 'Which is the least: 234, 243, 324?', a: '234' }
          ]
        },
        {
          id: '1-10',
          nameEn: 'Place Value Review',
          nameTh: 'ทบทวนค่าประจำหลัก',
          concept: 'Mixed practice on everything in Unit 1 — place value, comparing, rounding, ordering.',
          newVocab: [],
          warmupPrompt: 'Quick review: name the place of each digit in 528.',
          conceptScript: [
            'Today we review everything from Unit 1:',
            '• Tens and ones, hundreds',
            '• Expanded form and standard form',
            '• Comparing with > < =',
            '• Rounding to nearest 10 and 100',
            '• Ordering numbers'
          ],
          guidedProblems: [
            { q: 'Write 472 in expanded form',                a: '400 + 70 + 2' },
            { q: 'Round 567 to the nearest 100',              a: '600' },
            { q: 'Which is greater: 815 or 851?',             a: '851' }
          ],
          independentProblems: [
            { q: 'Order ascending: 234, 432, 324',            a: '234, 324, 432' },
            { q: 'Write the number: 7 hundreds + 0 tens + 3 ones', a: '703' }
          ]
        }
      ]
    }
    // Future units (3.2 phases, not built yet):
    // Unit 2: Addition & Subtraction within 1000
    // Unit 3: Multiplication 1-10
    // Unit 4: Division basics
    // Unit 5: Fractions
    // Unit 6: Measurement
    // Unit 7: Geometry
    // Unit 8: Word Problems Mastery
  ]
};

// ──────────────────────── Helpers ────────────────────────

window.getLessonById = function(lessonId) {
  if (!lessonId) return null;
  for (const unit of MATH_CURRICULUM.units) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
};

// Returns the lesson the player should do today.
// - If they haven't started anything → first lesson of unit 1.
// - If they've completed their current lesson at 80%+ → next lesson.
// - Otherwise → re-do the current lesson (mastery threshold not met).
window.getNextLessonForPlayer = function(player) {
  if (!player) return null;
  const curr = player.curriculum || { currentUnit: 1, currentLesson: 1, completedLessons: {} };
  const completed = curr.completedLessons || {};

  // Walk units in order, find first lesson with no completion (or score < 80).
  for (const unit of MATH_CURRICULUM.units) {
    for (const lesson of unit.lessons) {
      const record = completed[lesson.id];
      if (!record || (record.score || 0) < 80) {
        return { unit, lesson, isReview: !!record };
      }
    }
  }
  // Player finished everything available — return last lesson for re-practice.
  const lastUnit = MATH_CURRICULUM.units[MATH_CURRICULUM.units.length - 1];
  const lastLesson = lastUnit.lessons[lastUnit.lessons.length - 1];
  return { unit: lastUnit, lesson: lastLesson, isReview: true, allDone: true };
};

// Count lessons completed at ≥80% (for the progress badge on the dashboard).
window.countMasteredLessons = function(player) {
  const completed = (player && player.curriculum && player.curriculum.completedLessons) || {};
  return Object.values(completed).filter(r => (r.score || 0) >= 80).length;
};

window.countTotalLessons = function() {
  return MATH_CURRICULUM.units.reduce((n, u) => n + u.lessons.length, 0);
};
