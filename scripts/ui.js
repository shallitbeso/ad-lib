// 通用 UI 工具函数

/**
 * 渲染单选按钮组
 * @param {HTMLElement} container
 * @param {string[]} options - 选项文本
 * @param {(selected: string) => void} onSelect - 选择回调
 */
export function renderSingleSelect(container, options, onSelect) {
  container.innerHTML = '';
  const group = document.createElement('div');
  group.className = 'btn-group';

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      // 禁用所有按钮防止重复点击
      for (const b of group.querySelectorAll('.btn-option')) {
        b.disabled = true;
      }
      onSelect(opt);
    });
    group.appendChild(btn);
  }

  container.appendChild(group);
}

/**
 * 渲染多选按钮组 + 提交按钮
 * @param {HTMLElement} container
 * @param {string[]} options
 * @param {(selected: string[]) => void} onSubmit
 */
export function renderMultiSelect(container, options, onSubmit) {
  container.innerHTML = '';
  const group = document.createElement('div');
  group.className = 'btn-group';
  const selected = new Set();

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      if (selected.has(opt)) {
        selected.delete(opt);
        btn.classList.remove('selected');
      } else {
        selected.add(opt);
        btn.classList.add('selected');
      }
    });
    group.appendChild(btn);
  }

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-submit';
  submitBtn.textContent = '提交';
  submitBtn.addEventListener('click', () => {
    // 禁用所有按钮
    for (const b of group.querySelectorAll('.btn-option')) {
      b.disabled = true;
    }
    submitBtn.disabled = true;
    onSubmit([...selected]);
  });

  container.appendChild(group);
  container.appendChild(submitBtn);
}

/**
 * 高亮多选按钮的正确/错误状态
 * @param {HTMLElement} container
 * @param {Set<string>} correctSet - 正确答案集合
 * @param {Set<string>} selectedSet - 用户选择集合
 */
export function highlightMultiSelect(container, correctSet, selectedSet) {
  for (const btn of container.querySelectorAll('.btn-option')) {
    const text = btn.textContent;
    const isCorrect = correctSet.has(text);
    const isSelected = selectedSet.has(text);

    if (isCorrect && isSelected) {
      btn.classList.add('correct');
    } else if (isCorrect && !isSelected) {
      btn.classList.add('missed');
    } else if (!isCorrect && isSelected) {
      btn.classList.add('wrong');
    }
  }
}

/**
 * 显示反馈信息 + 下一题按钮
 * @param {HTMLElement} container
 * @param {boolean} correct
 * @param {string} message
 * @param {() => void} onNext - 点击下一题的回调
 */
export function showFeedback(container, correct, message, onNext) {
  const div = document.createElement('div');
  div.className = `feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}`;
  div.textContent = message;
  container.appendChild(div);

  if (onNext) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-next';
    nextBtn.textContent = '下一题';
    nextBtn.addEventListener('click', onNext);
    container.appendChild(nextBtn);
  }
}

/**
 * 更新得分显示
 */
export function updateScore(correct, total) {
  const el = document.getElementById('score');
  if (el) el.textContent = `${correct} / ${total}`;
}
