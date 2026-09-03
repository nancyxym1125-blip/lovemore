# AGENTS.md

## 项目定位

LOVE MORE 是写给 Yu Chen 的纯前端私人互动信件：暗号入口、欢迎页、逐句放映、纪念日内容、彩蛋和背景音乐。

## 运行与门禁

- 安装：`npm install`
- 开发：`npm run dev`（默认 `http://127.0.0.1:5173/`，以终端输出为准）
- 测试：`npm test`
- 构建：`npm run build`
- 修改后至少运行测试和构建；用户流程变化还要在真实浏览器中验证。

## 技术栈

- React 18、TypeScript、Vite 5。
- 无后端、数据库或真实鉴权；状态只存在 React 与 `sessionStorage`。
- 背景为零依赖 WebGL shader；动效和音频淡入使用 CSS/浏览器 API。

## 目录与约定

- `src/App.tsx` 是当前体验和文案的权威入口。
- `src/ShaderBackground.tsx` 维护背景与鼠标扰动；修改后检查 WebGL 生命周期。
- `src/styles.css` 维护全部视觉与响应式样式。
- `src/assets/L-O-V-E.mp3` 是运行时音乐；不要提交原始 FLAC。
- 页面只使用 `brand/vi-v2/assets/logos/` 中已跟踪的两张 Logo。
- `dist/`、缓存、`tmp/` 和 `output/` 不进入 Git。

## 行为边界

- 保留 `#yu-chen`、`#letter` 和 `love-more-unlocked` 会话键。
- `2026-05-31` 计为第 1 天；纪念日是第 99、100、999、9999 天及每年 5 月 31 日。
- `?preview-day=<正整数>` 只用于纪念日预览，普通地址必须按真实日期判断。
- 背景音乐只能由用户手势触发，解锁后淡入，返回首页时淡出停止。
- 仓库公开；客户端暗号不是安全边界，不得在文档中声称为真实隐私保护。

## 当前状态与下一步

- 当前代码已推送到 GitHub `main`，但尚未配置公网部署。
- 下一步如获用户授权，可配置 GitHub Pages；发布后必须核对真实公网 URL。
