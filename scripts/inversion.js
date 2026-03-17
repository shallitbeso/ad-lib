// 音程转位练习模块

import {
  INTERVALS, INTERVAL_CODES, INVERSIONS, getInversion,
  pickRandom,
} from './theory.js';
import { renderSingleSelect, showFeedback, updateScore } from './ui.js';

const STORE_KEY = 'ad-lib-inversion';

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
  const intervalCode = pickRandom(Object.keys(INVERSIONS));
  const answer = getInversion(intervalCode);
  const q = { intervalCode, answer };
  save(q);
  renderQuestion(q);
}

function renderQuestion({ intervalCode, answer }) {
  container.innerHTML = '';

  const prompt = document.createElement('div');
  prompt.className = 'question-prompt';
  prompt.textContent = `${INTERVALS[intervalCode].name}(${intervalCode})的转位是？`;
  container.appendChild(prompt);

  const optionsDiv = document.createElement('div');
  container.appendChild(optionsDiv);

  const options = [...new Set(Object.values(INVERSIONS))];

  renderSingleSelect(optionsDiv, options, (selected) => {
    const correct = selected === answer;
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
  }, 4);
}
