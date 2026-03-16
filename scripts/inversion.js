// 音程转位练习模块

import {
  INTERVALS, INTERVAL_CODES, INVERSIONS, getInversion,
  pickRandom,
} from './theory.js';
import { renderSingleSelect, showFeedback, updateScore } from './ui.js';

const STORE_KEY = 'ad-lib-inversion';

let score = { correct: 0, total: 0 };
let container;

function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } }
function save(q) { localStorage.setItem(STORE_KEY, JSON.stringify({ q, score })); }

export function init(el) {
  container = el;
  const s = load();
  score = s?.score ?? { correct: 0, total: 0 };
  updateScore(score.correct, score.total);
  if (s?.q) {
    renderQuestion(s.q);
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

  const options = INTERVAL_CODES.map(
    (code) => `${INTERVALS[code].name}(${code})`
  );

  renderSingleSelect(optionsDiv, options, (selected) => {
    const selectedCode = selected.match(/\((.+)\)/)[1];
    const correct = selectedCode === answer;
    score.total++;
    if (correct) score.correct++;
    save(null);
    updateScore(score.correct, score.total);

    for (const btn of optionsDiv.querySelectorAll('.btn-option')) {
      const code = btn.textContent.match(/\((.+)\)/)[1];
      if (code === answer) btn.classList.add('correct');
      else if (code === selectedCode && !correct) btn.classList.add('wrong');
    }

    showFeedback(
      container, correct,
      correct ? '正确！' : `错误，正确答案是 ${INTERVALS[answer].name}(${answer})`,
      newQuestion
    );
  });
}
