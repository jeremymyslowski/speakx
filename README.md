# SpeakX

Text-to-speech for X. A Manifest V3 Chrome extension plus this site — live demo, install steps, and the full source.

## Chrome extension

The loadable package lives in [`public/extension`](public/extension). No build step.

1. Download `public/speakx-extension.zip` from the site, or copy `public/extension`.
2. Open `chrome://extensions` and enable Developer mode.
3. Load unpacked and select the `speakx` folder (the one that contains `manifest.json`).
4. Open [x.com](https://x.com). Each post gets a Listen control. `Alt+S` speaks the post in view; `Alt+Shift+S` stops.

Speech runs in the tab via the Web Speech API. Nothing is uploaded. Host access is limited to `x.com` and `twitter.com`.

## Site

This repo is the production TanStack Start app (demo timeline, voice settings, source browser).

```bash
npm install
npm run dev
```
