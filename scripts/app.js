// 入口：导航逻辑 + Service Worker 注册

import { init as initInterval, setMode as setIntervalMode } from './interval.js';
import { init as initChord } from './chord.js';
import { init as initKey } from './key.js';

// ---- 导航 ----

const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.section');
const subTabs = document.querySelectorAll('.sub-tab');

function switchTab(tabName) {
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabName));
  sections.forEach((s) => s.classList.toggle('active', s.id === `${tabName}-section`));

  const content = document.getElementById(`${tabName}-content`);
  if (tabName === 'interval') {
    const activeMode = document.querySelector('.sub-tab.active')?.dataset.mode || 'identify';
    initInterval(content);
    setIntervalMode(activeMode);
  } else if (tabName === 'chord') {
    initChord(content);
  } else if (tabName === 'key') {
    initKey(content);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

subTabs.forEach((st) => {
  st.addEventListener('click', () => {
    subTabs.forEach((s) => s.classList.toggle('active', s === st));
    const content = document.getElementById('interval-content');
    initInterval(content);
    setIntervalMode(st.dataset.mode);
  });
});

// ---- 初始化 ----

switchTab('interval');

// ---- Service Worker ----

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service Worker 注册失败:', err);
    });
  });
}
