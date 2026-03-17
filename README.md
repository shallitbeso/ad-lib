# Ad-Lib 乐理练习

纯前端乐理练习 PWA，HTML/CSS/JS 实现。

## 在线访问

https://shallitbeso.github.io/ad-lib/

## 练习模块

| 模块 | 说明 |
|------|------|
| 音程 — 判断 | 给两个音，选出音程名称 |
| 音程 — 构建 | 给根音和音程，选出目标音 |
| 七和弦 | 给根音和和弦类型，选出所有组成音 |
| 调性 | 给调名，选出调内所有音 |
| 转位 | 给一个音程，选出它的转位 |
| 音级 | 给调和音，判断是第几级音 |

## 覆盖范围

- **音程**：m2, M2, A2, m3, M3, d4, P4, A4, d5, P5, A5, m6, M6, A6, m7, M7
- **七和弦**：Maj7, min7, dom7, m7b5, dim7
- **调性**：大调 / 自然小调，覆盖常见调号

## 项目结构

```
index.html              主页面
styles/main.css         样式
scripts/
  theory.js             乐理数据与计算
  ui.js                 通用 UI 工具
  interval.js           音程练习
  chord.js              七和弦练习
  key.js                调性练习
  inversion.js          转位练习
  degree.js             音级练习
  app.js                导航与入口
sw.js                   Service Worker
manifest.json           PWA 配置
```
