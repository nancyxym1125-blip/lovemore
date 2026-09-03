# LOVE MORE

一个写给 Yu Chen 的私人互动信件网页。页面以深酒红色 WebGL 丝绸背景贯穿三段体验：暗号入口、欢迎页和逐句点击播放的信件页。

## 当前功能

- 输入正确暗号后进入欢迎页；解锁状态仅保存在当前浏览器会话中。
- 背景音乐在解锁时缓慢淡入，跨页面连续播放，可用右上角按钮开关。
- 信件文字逐字模糊出现、从前往后消散，支持点击、`Enter`、空格和右方向键推进。
- “我爱的莫雨晨”页包含可弹出的彩蛋；结尾显示居中 LOVE MORE Logo 和返回首页按钮。
- 以 `2026-05-31` 为第 1 天，在第 99、100、999、9999 天及每年 5 月 31 日追加纪念日文案。
- 使用 `?preview-day=99#letter` 可预览指定天数的纪念日内容；预览仍需先输入暗号。

## 本地运行

需要 Node.js 18 或更高版本。

```bash
npm install
npm run dev
```

Vite 默认从 `http://127.0.0.1:5173/` 提供预览；端口被占用时以终端输出为准。

## 验证

```bash
npm test
npm run build
```

生产文件生成到 `dist/`。

## 结构

- `src/App.tsx`：页面状态、暗号、放映、纪念日、彩蛋及音乐控制。
- `src/ShaderBackground.tsx`：WebGL 丝绸背景及鼠标扰动。
- `src/styles.css`：布局、排版与动画。
- `src/assets/L-O-V-E.mp3`：网页背景音乐。
- `brand/vi-v2/assets/logos/`：页面实际使用的两张 Logo。

## 发布与隐私

源码位于公开仓库 [nancyxym1125-blip/lovemore](https://github.com/nancyxym1125-blip/lovemore)。目前没有配置 GitHub Pages，因此仓库更新不等于已经部署为公网网站。

暗号校验完全发生在浏览器中，公开源码可以看到暗号；它只用于体验流程，不是安全访问控制。公开部署前还应确认音乐文件具备相应的公开使用权限。
