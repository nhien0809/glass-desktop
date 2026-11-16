# Glass Desktop

A glassmorphism "desktop" dashboard built with plain HTML, CSS and JavaScript, animated with [GSAP](https://gsap.com/).

## Học tiếng Nhật (JPD133)

- **Kanji hôm nay** (giữa màn hình): mỗi ngày một chữ trong 41 chữ Hán bài 8–11, có âm Hán Việt, On, Kun, từ ví dụ có furigana và mẹo nhớ. Có nút ‹ › để xem chữ khác và nút "Che đáp án" để tự kiểm tra.
- **Sổ học** ở [`hoc/`](hoc/): Học chữ Hán, 10 bài đọc hiểu và Tranh kiểm tra. Mở từ các nút dưới thẻ Kanji hoặc ô 日 trên dock.

## Features

- Frosted-glass panel over a blurred city scene (hand-drawn SVG, no third-party artwork)
- Live clock with rolling digit transitions, and the weekday and date
- Calendar for the current month, with today highlighted
- Social sidebar (search, TikTok, YouTube, Facebook, Instagram, X)
- Greeting, a 2×2 gallery of gradient cards with hover lift
- Music player: play/pause, prev/next, shuffle and like toggles, animated progress and a spinning cover
- App dock with a macOS-style hover magnify (`gsap.quickTo` + `gsap.utils.mapRange`)
- Staggered entrance timeline
- Respects `prefers-reduced-motion` via `gsap.matchMedia()`
- Responsive: widgets stack on phones

## Run locally

Any static server works, for example:

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Credits

- Brand icons: [Simple Icons](https://simpleicons.org/) (CC0). See `assets/icons/SIMPLE-ICONS-LICENSE.md`.
- Animation: GSAP 3, loaded from cdnjs.
