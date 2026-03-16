// 音程练习模块

import {
  INTERVALS, INTERVAL_CODES, NOTE_TO_SEMITONE,
  getInterval, buildInterval, getChromaticForContext,
  pickRandom, shuffle,
} from './theory.js';
import { renderSingleSelect, showFeedback, updateScore } from './ui.js';

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'Eb', 'F#', 'Ab', 'Bb'];

let mode = 'identify';
let score = { correct: 0, total: 0 };
let container;

function storeKey() { return `ad-lib-interval-${mode}`; }
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(storeKey()));
    if (!data) return null;
    // 兼容旧格式 { q, score }
    return data.q !== undefined ? data.q : data;
  } catch { return null; }
}
function save(q) { localStorage.setItem(storeKey(), JSON.stringify(q)); }

export function init(el) {
  container = el;
}

export function setMode(m) {
  if (mode !== m) {
    mode = m;
    score = { correct: 0, total: 0 };
  }
  updateScore(score.correct, score.total);
  const q = load();
  if (q) {
    mode === 'identify' ? renderIdentify(q) : renderBuild(q);
  } else {
    newQuestion();
  }
}

function newQuestion() {
  if (mode === 'identify') {
    let note1, note2, intervalCode;
    do {
      note1 = pickRandom(ROOTS);
      note2 = pickRandom(getChromaticForContext(note1));
      intervalCode = getInterval(note1, note2);
    } while (!intervalCode || note1 === note2);
    const q = { note1, note2, intervalCode };
    save(q);
    renderIdentify(q);
  } else {
    const root = pickRandom(ROOTS);
    const intervalCode = pickRandom(INTERVAL_CODES);
    const answer = buildInterval(root, intervalCode);
    const answerSt = NOTE_TO_SEMITONE[answer] ?? semitoneOf(answer);
    const chromatic = getChromaticForContext(root);
    const distractors = new Set();
    for (const offset of [-2, -1, 1, 2, 3]) {
      const note = chromatic[((answerSt + offset) + 12) % 12];
      if (note !== answer && note !== root) distractors.add(note);
      if (distractors.size >= 4) break;
    }
    const options = shuffle([answer, ...distractors]);
    const q = { root, intervalCode, answer, options };
    save(q);
    renderBuild(q);
  }
}

function renderIdentify({ note1, note2, intervalCode }) {
  container.innerHTML = '';

  const prompt = document.createElement('div');
  prompt.className = 'question-prompt';
  prompt.textContent = `${note1} → ${note2} 的音程是？`;
  container.appendChild(prompt);

  const optionsDiv = document.createElement('div');
  container.appendChild(optionsDiv);

  const options = INTERVAL_CODES.map(
    (code) => `${INTERVALS[code].name}(${code})`
  );

  renderSingleSelect(optionsDiv, options, (selected) => {
    const selectedCode = selected.match(/\((.+)\)/)[1];
    const correct = selectedCode === intervalCode;
    score.total++;
    if (correct) score.correct++;
    save(null);
    updateScore(score.correct, score.total);

    for (const btn of optionsDiv.querySelectorAll('.btn-option')) {
      const code = btn.textContent.match(/\((.+)\)/)[1];
      if (code === intervalCode) btn.classList.add('correct');
      else if (code === selectedCode && !correct) btn.classList.add('wrong');
    }

    showFeedback(
      container, correct,
      correct ? '正确！' : `错误，正确答案是 ${INTERVALS[intervalCode].name}(${intervalCode})`,
      newQuestion
    );
  });
}

function renderBuild({ root, intervalCode, answer, options }) {
  container.innerHTML = '';

  const prompt = document.createElement('div');
  prompt.className = 'question-prompt';
  prompt.textContent = `${root} 的${INTERVALS[intervalCode].name}(${intervalCode})音是？`;
  container.appendChild(prompt);

  const optionsDiv = document.createElement('div');
  container.appendChild(optionsDiv);

  renderSingleSelect(optionsDiv, options, (selected) => {
    const selectedSt = NOTE_TO_SEMITONE[selected] ?? semitoneOf(selected);
    const correct = selectedSt === ((NOTE_TO_SEMITONE[root] + INTERVALS[intervalCode].semitones) % 12);
    score.total++;
    if (correct) score.correct++;
    save(null);
    updateScore(score.correct, score.total);

    for (const btn of optionsDiv.querySelectorAll('.btn-option')) {
      if (btn.textContent === answer) btn.classList.add('correct');
      else if (btn.textContent === selected && !correct) btn.classList.add('wrong');
    }

    showFeedback(
      container, correct,
      correct ? '正确！' : `错误，正确答案是 ${answer}`,
      newQuestion
    );
  });
}

function semitoneOf(name) {
  if (NOTE_TO_SEMITONE[name] !== undefined) return NOTE_TO_SEMITONE[name];
  let st = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[name[0]];
  for (const ch of name.slice(1)) { if (ch === '#') st++; else if (ch === 'b') st--; }
  return ((st % 12) + 12) % 12;
}
