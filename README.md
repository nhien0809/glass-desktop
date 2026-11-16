# Glass Desktop

A glassmorphism "desktop" dashboard built with plain HTML, CSS and JavaScript, animated with [GSAP](https://gsap.com/).

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
