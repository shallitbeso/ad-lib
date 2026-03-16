// 调性练习模块

import {
  NOTE_TO_SEMITONE, MAJOR_KEYS, MINOR_KEYS,
  getScaleNotes, getChromaticForContext,
  pickRandom,
} from './theory.js';
import {
  renderMultiSelect, highlightMultiSelect, showFeedback, updateScore,
} from './ui.js';

const STORE_KEY = 'ad-lib-key';

let score = { correct: 0, total: 0 };
let container;

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!data) return null;
    return data.q !== undefined ? data.q : data;
  } catch { return null; }
}
function save(q) { localStorage.setItem(STORE_KEY, JSON.stringify(q)); }

export function init(el) {
  container = el;
  updateScore(score.correct, score.total);
  const q = load();
  if (q) {
    renderQuestion(q);
  } else {
    newQuestion();
  }
}

function newQuestion() {
  const isMajor = Math.random() < 0.5;
  const root = isMajor ? pickRandom(MAJOR_KEYS) : pickRandom(MINOR_KEYS);
  const scaleType = isMajor ? 'major' : 'minor';
  const q = { root, scaleType };
  save(q);
  renderQuestion(q);
}

function renderQuestion({ root, scaleType }) {
  container.innerHTML = '';

  const scaleLabel = scaleType === 'major' ? '大调' : '小调';
  const scaleNotes = getScaleNotes(root, scaleType);
  const correctSemitones = new Set(scaleNotes.map((n) => toSemitone(n)));

  const prompt = document.createElement('div');
  prompt.className = 'question-prompt';
  prompt.textContent = `${root} ${scaleLabel}包含哪些音？`;
  container.appendChild(prompt);

  const optionsDiv = document.createElement('div');
  container.appendChild(optionsDiv);

  const chromatic = getChromaticForContext(root);

  renderMultiSelect(optionsDiv, chromatic, (selected) => {
    const selectedSemitones = new Set(selected.map((n) => NOTE_TO_SEMITONE[n]));
    const correctDisplay = new Set(
      chromatic.filter((n) => correctSemitones.has(NOTE_TO_SEMITONE[n]))
    );
    const selectedDisplay = new Set(selected);

    const isCorrect =
      selectedSemitones.size === correctSemitones.size &&
      [...selectedSemitones].every((s) => correctSemitones.has(s));

    score.total++;
    if (isCorrect) score.correct++;
    save(null);
    updateScore(score.correct, score.total);

    highlightMultiSelect(optionsDiv, correctDisplay, selectedDisplay);

    showFeedback(
      container, isCorrect,
      isCorrect ? '正确！' : `正确答案：${scaleNotes.join(' ')}`,
      newQuestion
    );
  });
}

function toSemitone(name) {
  if (NOTE_TO_SEMITONE[name] !== undefined) return NOTE_TO_SEMITONE[name];
  let st = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[name[0]];
  for (const ch of name.slice(1)) { if (ch === '#') st++; else if (ch === 'b') st--; }
  return ((st % 12) + 12) % 12;
}
