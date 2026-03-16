// 七和弦练习模块

import {
  CHORD_TYPES, CHORD_TYPE_CODES, NOTE_TO_SEMITONE,
  getChordNotes, getChromaticForContext,
  pickRandom,
} from './theory.js';
import {
  renderMultiSelect, highlightMultiSelect, showFeedback, updateScore,
} from './ui.js';

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Db', 'Eb', 'F#', 'Ab', 'Bb'];

let score = { correct: 0, total: 0 };
let container;

export function init(el) {
  container = el;
  score = { correct: 0, total: 0 };
  updateScore(score.correct, score.total);
  generateQuestion();
}

export function generateQuestion() {
  container.innerHTML = '';

  const root = pickRandom(ROOTS);
  const chordType = pickRandom(CHORD_TYPE_CODES);
  const chordNotes = getChordNotes(root, chordType);

  // 将正确答案转为半音集合用于比较
  const correctSemitones = new Set(chordNotes.map((n) => toSemitone(n)));

  const prompt = document.createElement('div');
  prompt.className = 'question-prompt';
  prompt.textContent = `${root} ${chordType}（${CHORD_TYPES[chordType].name}）的组成音是？`;
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
    updateScore(score.correct, score.total);

    highlightMultiSelect(optionsDiv, correctDisplay, selectedDisplay);

    showFeedback(
      container,
      isCorrect,
      isCorrect ? '正确！' : `正确答案：${chordNotes.join(' ')}`,
      generateQuestion
    );
  });
}

function toSemitone(name) {
  if (NOTE_TO_SEMITONE[name] !== undefined) return NOTE_TO_SEMITONE[name];
  const letter = name[0];
  let st = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter];
  for (const ch of name.slice(1)) {
    if (ch === '#') st++;
    else if (ch === 'b') st--;
  }
  return ((st % 12) + 12) % 12;
}
