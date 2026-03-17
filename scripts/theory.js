// 乐理核心数据与计算

const LETTER_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_TO_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const NOTE_TO_SEMITONE = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3,
  E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8,
  Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

// 所有可用音名
export const ALL_NOTE_NAMES = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

// 升号色阶与降号色阶
export const SHARP_CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_CHROMATIC = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// ---- 音程 ----

// degree = 字母距离（0=同字母/一度, 1=二度, 2=三度, 3=四度, 4=五度, 5=六度, 6=七度）
export const INTERVALS = {
  m2:  { semitones: 1,  name: '小二度', degree: 1 },
  M2:  { semitones: 2,  name: '大二度', degree: 1 },
  A2:  { semitones: 3,  name: '增二度', degree: 1 },
  m3:  { semitones: 3,  name: '小三度', degree: 2 },
  M3:  { semitones: 4,  name: '大三度', degree: 2 },
  d4:  { semitones: 4,  name: '减四度', degree: 3 },
  P4:  { semitones: 5,  name: '纯四度', degree: 3 },
  A4:  { semitones: 6,  name: '增四度', degree: 3 },
  d5:  { semitones: 6,  name: '减五度', degree: 4 },
  P5:  { semitones: 7,  name: '纯五度', degree: 4 },
  A5:  { semitones: 8,  name: '增五度', degree: 4 },
  m6:  { semitones: 8,  name: '小六度', degree: 5 },
  M6:  { semitones: 9,  name: '大六度', degree: 5 },
  A6:  { semitones: 10, name: '增六度', degree: 5 },
  m7:  { semitones: 10, name: '小七度', degree: 6 },
  M7:  { semitones: 11, name: '大七度', degree: 6 },
};

export const INTERVAL_CODES = Object.keys(INTERVALS);

/** 根据半音差和字母距离返回音程代码，无匹配返回 null */
export function getInterval(note1, note2) {
  const st1 = NOTE_TO_SEMITONE[note1] !== undefined ? NOTE_TO_SEMITONE[note1] : noteToSemitone(note1);
  const st2 = NOTE_TO_SEMITONE[note2] !== undefined ? NOTE_TO_SEMITONE[note2] : noteToSemitone(note2);
  const semiDiff = ((st2 - st1) + 12) % 12;
  const letterDiff = ((LETTER_NAMES.indexOf(note2[0]) - LETTER_NAMES.indexOf(note1[0])) + 7) % 7;
  for (const [code, info] of Object.entries(INTERVALS)) {
    if (info.semitones === semiDiff && info.degree === letterDiff) return code;
  }
  return null;
}

/** 根据字母距离，计算目标音名（含升降号） */
function noteFromLetterAndSemitone(letter, semitone) {
  const natural = LETTER_TO_SEMITONE[letter];
  const diff = ((semitone - natural) + 12) % 12;
  if (diff === 0) return letter;
  if (diff === 1) return letter + '#';
  if (diff === 11) return letter + 'b';
  if (diff === 2) return letter + '##';
  if (diff === 10) return letter + 'bb';
  return letter;
}

/** 从根音构建指定音程，返回目标音名 */
export function buildInterval(root, intervalCode) {
  const rootSemitone = NOTE_TO_SEMITONE[root];
  const targetSemitone = (rootSemitone + INTERVALS[intervalCode].semitones) % 12;
  const rootLetterIndex = LETTER_NAMES.indexOf(root[0]);
  const degree = INTERVALS[intervalCode].degree;
  const targetLetter = LETTER_NAMES[(rootLetterIndex + degree) % 7];
  return noteFromLetterAndSemitone(targetLetter, targetSemitone);
}

// ---- 音程转位 ----

export const INVERSIONS = {
  m2: 'M7', M7: 'm2',
  M2: 'm7', m7: 'M2',
  m3: 'M6', M6: 'm3',
  M3: 'm6', m6: 'M3',
  P4: 'P5', P5: 'P4',
};

/** 返回音程的转位 */
export function getInversion(intervalCode) {
  return INVERSIONS[intervalCode];
}

// ---- 音级 ----

const DEGREE_NAMES = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ'];

export { DEGREE_NAMES };

/** 返回音在调中的级数 (1-7)，不在调内返回 null */
export function getScaleDegree(root, scaleType, note) {
  const scaleNotes = getScaleNotes(root, scaleType);
  const noteSt = NOTE_TO_SEMITONE[note] ?? noteToSemitone(note);
  for (let i = 0; i < scaleNotes.length; i++) {
    const st = NOTE_TO_SEMITONE[scaleNotes[i]] ?? noteToSemitone(scaleNotes[i]);
    if (st === noteSt) return i + 1;
  }
  return null;
}

function noteToSemitone(name) {
  let st = LETTER_TO_SEMITONE[name[0]];
  for (const ch of name.slice(1)) { if (ch === '#') st++; else if (ch === 'b') st--; }
  return ((st % 12) + 12) % 12;
}

// ---- 七和弦 ----

export const CHORD_TYPES = {
  Maj7: { name: '大七', semitones: [0, 4, 7, 11] },
  min7: { name: '小七', semitones: [0, 3, 7, 10] },
  dom7: { name: '属七', semitones: [0, 4, 7, 10] },
  m7b5: { name: '半减七', semitones: [0, 3, 6, 10] },
  dim7: { name: '减七', semitones: [0, 3, 6, 9] },
};

export const CHORD_TYPE_CODES = Object.keys(CHORD_TYPES);

/** 返回和弦组成音列表 */
export function getChordNotes(root, chordType) {
  const structure = CHORD_TYPES[chordType].semitones;
  const rootSemitone = NOTE_TO_SEMITONE[root];
  const rootLetterIndex = LETTER_NAMES.indexOf(root[0]);
  const letterSteps = [0, 2, 4, 6];

  return structure.map((st, i) => {
    if (i === 0) return root;
    const targetSemitone = (rootSemitone + st) % 12;
    const targetLetter = LETTER_NAMES[(rootLetterIndex + letterSteps[i]) % 7];
    return noteFromLetterAndSemitone(targetLetter, targetSemitone);
  });
}

// ---- 调性 ----

const SCALE_PATTERNS = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
};

/** 返回调内所有音名 */
export function getScaleNotes(root, scaleType) {
  const pattern = SCALE_PATTERNS[scaleType];
  const rootSemitone = NOTE_TO_SEMITONE[root];
  const rootLetterIndex = LETTER_NAMES.indexOf(root[0]);
  const notes = [root];
  let currentSemitone = rootSemitone;

  for (let i = 0; i < 6; i++) {
    currentSemitone = (currentSemitone + pattern[i]) % 12;
    const targetLetter = LETTER_NAMES[(rootLetterIndex + i + 1) % 7];
    notes.push(noteFromLetterAndSemitone(targetLetter, currentSemitone));
  }
  return notes;
}

// ---- 可用调性列表 ----

export const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Gb', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
export const MINOR_KEYS = ['A', 'E', 'B', 'F#', 'C#', 'D', 'G', 'C', 'F', 'Bb', 'Eb'];

// ---- 工具函数 ----

/** 判断根音是否偏向使用降号 */
export function prefersFlats(root) {
  return ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].includes(root);
}

/** 获取适合当前语境的12色阶音名 */
export function getChromaticForContext(root) {
  return prefersFlats(root) ? FLAT_CHROMATIC : SHARP_CHROMATIC;
}

/** 随机选取数组元素 */
export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 洗牌 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
