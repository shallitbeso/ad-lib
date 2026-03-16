// 音级判断练习模块

import {
  MAJOR_KEYS, MINOR_KEYS, DEGREE_NAMES,
  getScaleNotes, getScaleDegree, getChromaticForContext,
  pickRandom,
} from './theory.js';
import { renderSingleSelect, showFeedback, updateScore } from './ui.js';

const STORE_KEY = 'ad-lib-degree';

let score = { correct: 0, total: 0 };
let container;

function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } }
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
  // 从调内随机选一个音
  const scaleNotes = getScaleNotes(root, scaleType);
  const degreeIndex = Math.floor(Math.random() * 7);
  const note = scaleNotes[degreeIndex];
  const chromatic = getChromaticForContext(root);
  // 找到 note 在色阶中对应的显示名
  const noteSt = getNoteSemitone(note);
  const displayNote = chromatic[noteSt] || note;
  const q = { root, scaleType, displayNote, answer: degreeIndex + 1 };
  save(q);
  renderQuestion(q);
}

function renderQuestion({ root, scaleType, displayNote, answer }) {
  container.innerHTML = '';
  const scaleLabel = scaleType === 'major' ? '大调' : '小调';

  const prompt = document.createElement('div');
  prompt.className = 'question-prompt';
  prompt.textContent = `在 ${root} ${scaleLabel}中，${displayNote} 是第几级音？`;
  container.appendChild(prompt);

  const optionsDiv = document.createElement('div');
  container.appendChild(optionsDiv);

  const options = DEGREE_NAMES.map((name, i) => `${name} (${i + 1})`);

  renderSingleSelect(optionsDiv, options, (selected) => {
    const selectedDegree = parseInt(selected.match(/\((\d)\)/)[1]);
    const correct = selectedDegree === answer;
    score.total++;
    if (correct) score.correct++;
    save(null);
    updateScore(score.correct, score.total);

    for (const btn of optionsDiv.querySelectorAll('.btn-option')) {
      const deg = parseInt(btn.textContent.match(/\((\d)\)/)[1]);
      if (deg === answer) btn.classList.add('correct');
      else if (deg === selectedDegree && !correct) btn.classList.add('wrong');
    }

    showFeedback(
      container, correct,
      correct ? '正确！' : `错误，正确答案是 ${DEGREE_NAMES[answer - 1]}级`,
      newQuestion
    );
  });
}

function getNoteSemitone(name) {
  const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let st = map[name[0]];
  for (const ch of name.slice(1)) { if (ch === '#') st++; else if (ch === 'b') st--; }
  return ((st % 12) + 12) % 12;
}
