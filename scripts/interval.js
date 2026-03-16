// 音程练习模块

import {
  INTERVALS, INTERVAL_CODES, NOTE_TO_SEMITONE,
  getInterval, buildInterval, getChromaticForContext,
  pickRandom, shuffle,
} from './theory.js';
import { renderSingleSelect, showFeedback, updateScore } from './ui.js';

// 练习用根音候选
const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'Eb', 'F#', 'Ab', 'Bb'];

let mode = 'identify'; // 'identify' | 'build'
let score = { correct: 0, total: 0 };
let container;

export function init(el) {
  container = el;
  score = { correct: 0, total: 0 };
  updateScore(score.correct, score.total);
  generateQuestion();
}

export function setMode(m) {
  mode = m;
  score = { correct: 0, total: 0 };
  updateScore(score.correct, score.total);
  generateQuestion();
}

export function generateQuestion() {
  if (mode === 'identify') {
    generateIdentify();
  } else {
    generateBuild();
  }
}

function generateIdentify() {
  container.innerHTML = '';

  // 随机选两个音，确保音程在练习范围内（排除纯一度和三全音）
  let note1, note2, intervalCode;
  do {
    note1 = pickRandom(ROOTS);
    const chromatic = getChromaticForContext(note1);
    note2 = pickRandom(chromatic);
    intervalCode = getInterval(note1, note2);
  } while (!intervalCode || note1 === note2);

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
    updateScore(score.correct, score.total);

    // 高亮正确答案
    for (const btn of optionsDiv.querySelectorAll('.btn-option')) {
      const code = btn.textContent.match(/\((.+)\)/)[1];
      if (code === intervalCode) btn.classList.add('correct');
      else if (code === selectedCode && !correct) btn.classList.add('wrong');
    }

    showFeedback(
      container,
      correct,
      correct
        ? '正确！'
        : `错误，正确答案是 ${INTERVALS[intervalCode].name}(${intervalCode})`,
      generateQuestion
    );
  });
}

function generateBuild() {
  container.innerHTML = '';

  const root = pickRandom(ROOTS);
  const intervalCode = pickRandom(INTERVAL_CODES);
  const answer = buildInterval(root, intervalCode);

  const prompt = document.createElement('div');
  prompt.className = 'question-prompt';
  prompt.textContent = `${root} 的${INTERVALS[intervalCode].name}(${intervalCode})音是？`;
  container.appendChild(prompt);

  // 生成干扰项：答案附近的音
  const answerSemitone = NOTE_TO_SEMITONE[answer] ?? semitoneOf(answer);
  const chromatic = getChromaticForContext(root);
  const distractors = new Set();
  for (const offset of [-2, -1, 1, 2, 3]) {
    const st = ((answerSemitone + offset) + 12) % 12;
    const note = chromatic[st];
    if (note !== answer && note !== root) {
      distractors.add(note);
    }
    if (distractors.size >= 4) break;
  }

  const options = shuffle([answer, ...distractors]);

  const optionsDiv = document.createElement('div');
  container.appendChild(optionsDiv);

  renderSingleSelect(optionsDiv, options, (selected) => {
    // 按半音值比较（处理异名同音）
    const selectedSemitone = NOTE_TO_SEMITONE[selected] ?? semitoneOf(selected);
    const correct = selectedSemitone === ((NOTE_TO_SEMITONE[root] + INTERVALS[intervalCode].semitones) % 12);
    score.total++;
    if (correct) score.correct++;
    updateScore(score.correct, score.total);

    for (const btn of optionsDiv.querySelectorAll('.btn-option')) {
      if (btn.textContent === answer) btn.classList.add('correct');
      else if (btn.textContent === selected && !correct) btn.classList.add('wrong');
    }

    showFeedback(
      container,
      correct,
      correct ? '正确！' : `错误，正确答案是 ${answer}`,
      generateQuestion
    );
  });
}

/** 处理可能含双升降号的音名 */
function semitoneOf(name) {
  if (NOTE_TO_SEMITONE[name] !== undefined) return NOTE_TO_SEMITONE[name];
  const letter = name[0];
  const acc = name.slice(1);
  let st = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter];
  for (const ch of acc) {
    if (ch === '#') st++;
    else if (ch === 'b') st--;
  }
  return ((st % 12) + 12) % 12;
}
