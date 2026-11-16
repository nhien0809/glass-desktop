/*
 * Characters that stroll along the bottom of the page. Two are illustrations the site owner supplied
 * (cut out to transparent WebP in assets/cast/): they walk with a side or three-quarter pose that is
 * mirrored to face the walking direction, and turn to the front pose (when there is one) on stopping.
 * The dog is Pochita from "Chainsaw Man" (fan drawing, SVG, made here).
 * They say a JPD133 sentence now and then; click / tap one and it asks you a question to answer out loud
 * (speaking practice in assets/speak.js). #castToggle in the sidebar shows or hides them; the choice is remembered.
 */
(() => {
  "use strict";
  if (typeof window.gsap === "undefined") return;

  const ASSETS = (() => {
    const src = (document.currentScript && document.currentScript.src) || "";
    return src ? src.replace(/[^/]*$/, "") : "assets/";
  })();
  const LINE = "#3a2a2e";
  const SK = `stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"`;

  /* ---------------- Drawing ---------------- */
  function dogSVG() {
    const O = "#f28a30";
    const D = "#d9701f";
    const leg = (x, cls) => `
      <g class="${cls}">
        <rect x="${x}" y="58" width="11" height="22" rx="5.5" fill="${O}" ${SK}/>
      </g>`;
    return `
      <svg viewBox="0 0 120 90" aria-hidden="true" focusable="false">
        <ellipse cx="60" cy="85" rx="38" ry="3.6" fill="#12151c" opacity="0.18"/>
        <g class="body">
          <g class="tail">
            <path d="M24 56 Q13 52 11 40" fill="none" stroke="${LINE}" stroke-width="2.4" stroke-linecap="round"/>
            <rect x="5" y="32" width="12" height="7" rx="3.5" fill="#e9e9ee" ${SK}/>
          </g>
          ${leg(36, "dLegB")}${leg(74, "dLegA")}
          <path d="M34 38 Q46 18 62 34" fill="none" stroke="${LINE}" stroke-width="9.5" stroke-linecap="round"/>
          <path d="M34 38 Q46 18 62 34" fill="none" stroke="${D}" stroke-width="6" stroke-linecap="round"/>
          <ellipse cx="54" cy="56" rx="33" ry="20" fill="${O}" ${SK}/>
          <ellipse cx="56" cy="66" rx="20" ry="6" fill="#ffd9a8" opacity="0.6"/>
          ${leg(27, "dLegA")}${leg(65, "dLegB")}
          <g class="head">
            <g data-keep transform="rotate(-38 92 24)">
              <rect x="90" y="16" width="34" height="13" rx="6.5" fill="#cfd4dc" ${SK}/>
              <rect x="95" y="20.5" width="24" height="4" rx="2" fill="#9aa1ad"/>
              <path d="M93 16 l2 -3.4 l2 3.4 l2 -3.4 l2 3.4 l2 -3.4 l2 3.4 l2 -3.4 l2 3.4 l2 -3.4 l2 3.4 l2 -3.4 l2 3.4 l2 -3.4 l2 3.4" fill="#9aa1ad" stroke="${LINE}" stroke-width="1" stroke-linejoin="round"/>
            </g>
            <circle cx="86" cy="42" r="21" fill="${O}" ${SK}/>
            <path d="M76 25 Q86 17 97 25 L94 31 Q86 26 79 31 Z" fill="${D}" ${SK}/>
            <g class="eyes">
              <circle cx="82" cy="40" r="5.6" fill="#fff" ${SK}/><circle cx="83.2" cy="40.6" r="2.9" fill="#2a1d1d"/><circle cx="82.2" cy="39.2" r="1" fill="#fff"/>
              <circle cx="98" cy="38" r="5.6" fill="#fff" ${SK}/><circle cx="99.2" cy="38.6" r="2.9" fill="#2a1d1d"/><circle cx="98.2" cy="37.2" r="1" fill="#fff"/>
            </g>
            <ellipse cx="74" cy="48" rx="4" ry="2" fill="#ff8fa3" opacity="0.55"/>
            <path d="M82 50 Q92 60 103 48 Q92 52 82 50 Z" fill="#fff" stroke="${LINE}" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M85 51.4 l2 2.6 l2 -2.4 l2 2.6 l2 -2.8 l2 2.4 l2 -2.8 l2 2" fill="none" stroke="${LINE}" stroke-width="0.9" stroke-linejoin="round"/>
          </g>
        </g>
      </svg>`;
  }

  /* ---------------- Cast ---------------- */
  // faces: which way the walking picture looks (-1 = left), so it can be mirrored to the walking direction.
  const CAST = [
    {
      name: "モカ", label: "Moka", kind: "img", pitch: 1.35, speed: 46, step: 0.3,
      side: "cast/moss-side.webp", front: "cast/moss-front.webp", faces: -1, w: 74, h: 124, frontW: 76,
      lines: [
        ["こんにちは！モカです。", "Xin chào! Mình là Moka."],
        ["{海外旅行|かいがいりょこう}が {好|す}きです！", "Mình thích du lịch nước ngoài!"],
        ["バスツアーに {行|い}きたいです。", "Mình muốn đi tour xe buýt."],
        ["{駅|えき}は どこですか。", "Nhà ga ở đâu vậy?"],
      ],
    },
    {
      name: "リン", label: "Rin", kind: "img", pitch: 1.1, speed: 58, step: 0.34,
      side: "cast/elf.webp", faces: -1, w: 54, h: 158,
      lines: [
        ["リンです。よろしく。", "Mình là Rin. Rất vui được gặp."],
        ["{毎朝|まいあさ} 7{時|じ}に {起|お}きます。", "Mỗi sáng mình dậy lúc 7 giờ."],
        ["{趣味|しゅみ}は {音楽|おんがく}を {聞|き}く ことです。", "Sở thích của mình là nghe nhạc."],
        ["{夜|よる}は {何|なに}を しますか。", "Buổi tối bạn làm gì?"],
      ],
    },
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ruby = (s) => esc(s).replace(/\{([^|}]+)\|([^}]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>");
  const rand = gsap.utils.random;
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const layer = document.createElement("div");
  layer.className = "cast";
  document.body.appendChild(layer);

  const actors = CAST.map((c, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = `actor actor-${c.kind}`;
    el.setAttribute("aria-label", `${c.label}: bấm để luyện nói`);
    el.innerHTML = `
      <span class="bubble" role="status"></span>
      <span class="sprite">${c.kind === "dog" ? dogSVG() : `<span class="body">
        <img class="pose side" src="${ASSETS}${c.side}" alt="" draggable="false">
        ${c.front ? `<img class="pose front" src="${ASSETS}${c.front}" alt="" draggable="false">` : ""}
      </span>`}</span>`;
    if (c.kind === "img") {
      el.style.setProperty("--w", `${c.w}px`);
      el.style.setProperty("--h", `${c.h}px`);
      if (c.front) el.classList.add("has-front");
    }
    layer.appendChild(el);

    const a = {
      c, el, i,
      sprite: el.querySelector(".sprite"),
      bubble: el.querySelector(".bubble"),
      q: (s) => el.querySelectorAll(s),
      x: 0, dir: 1, line: Math.floor(Math.random() * c.lines.length),
      move: null, wait: null, walk: null, blink: null, hideBubble: null,
    };
    gsap.set(a.bubble, { xPercent: -50, autoAlpha: 0 });

    // Walk cycle (paused until the character moves)
    const s = c.step;
    const loop = { duration: s, repeat: -1, yoyo: true, ease: "sine.inOut" };
    a.walk = gsap.timeline({ paused: true });
    if (c.kind === "dog") {
      a.walk
        .fromTo(a.q(".dLegA"), { rotation: -24 }, { rotation: 24, transformOrigin: "50% 10%", ...loop }, 0)
        .fromTo(a.q(".dLegB"), { rotation: 24 }, { rotation: -24, transformOrigin: "50% 10%", ...loop }, 0)
        .fromTo(a.q(".head"), { y: 0 }, { y: -2, ...loop, duration: s / 2 }, 0);
    } else {
      // A still picture: bob and sway a little with each step.
      a.walk
        .fromTo(a.q(".body"), { rotation: -2.5 }, { rotation: 2.5, transformOrigin: "50% 100%", ...loop }, 0)
        .fromTo(a.q(".body"), { y: 0 }, { y: -4, ...loop, duration: s / 2 }, 0);
    }
    el.addEventListener("click", () => {
      talkNow(a);
      if (window.Speak) {
        let avatar;
        if (c.kind === "dog") {
          // Same drawing, framed on the face, as the avatar in the practice window.
          const svg = a.sprite.querySelector("svg").cloneNode(true);
          svg.setAttribute("viewBox", "60 0 60 64");
          // Drop the walk-cycle pose (GSAP writes it as transform attributes / inline styles).
          svg.querySelectorAll("[style], [data-svg-origin]").forEach((n) => {
            n.removeAttribute("style");
            n.removeAttribute("data-svg-origin");
            if (!n.hasAttribute("data-keep")) n.removeAttribute("transform");
          });
          avatar = svg.outerHTML;
        } else {
          avatar = `<img class="cast-face" src="${ASSETS}${c.front || c.side}" alt="">`;
        }
        Speak.open({ name: c.name, avatar, pitch: c.pitch, male: !!c.male });
      }
    });
    return a;
  });

  // Dog's tail always wags a little, everyone blinks now and then.
  let ambient = [];
  function startAmbient() {
    stopAmbient();
    if (reduced()) return;
    actors.forEach((a) => {
      if (a.c.kind === "dog") {
        ambient.push(gsap.fromTo(a.q(".tail"), { rotation: -14 }, { rotation: 14, transformOrigin: "100% 100%", duration: 0.22, repeat: -1, yoyo: true, ease: "sine.inOut" }));
      }
      if (a.c.kind !== "dog") return;
      const blink = () => {
        gsap.to(a.q(".eyes"), { scaleY: 0.1, transformOrigin: "50% 60%", duration: 0.07, yoyo: true, repeat: 1, repeatDelay: 0.05 });
        a.blink = gsap.delayedCall(rand(2.2, 5.5), blink);
      };
      a.blink = gsap.delayedCall(rand(1, 4), blink);
    });
  }
  function stopAmbient() {
    ambient.forEach((t) => t.kill());
    ambient = [];
    actors.forEach((a) => a.blink && a.blink.kill());
  }

  /* ---------------- Behaviour ---------------- */
  const bounds = (a) => [6, Math.max(6, window.innerWidth - a.el.offsetWidth - 6)];

  function faceDir(a, dir) {
    a.dir = dir;
    gsap.set(a.sprite, { scaleX: dir * (a.c.faces || 1) });
  }
  function stopWalking(a) {
    a.walk.pause();
    a.el.classList.remove("walking");
    if (a.c.kind === "dog") {
      gsap.to(a.q(".dLegA, .dLegB"), { rotation: 0, duration: 0.25, overwrite: "auto" });
      gsap.to(a.q(".body, .head"), { y: 0, duration: 0.25, overwrite: "auto" });
    } else {
      gsap.to(a.q(".body"), { y: 0, rotation: 0, duration: 0.25, overwrite: "auto" });
      if (a.c.front) gsap.set(a.sprite, { scaleX: 1 }); // the front pose is not mirrored
    }
  }
  function wander(a) {
    if (!enabled) return;
    const [lo, hi] = bounds(a);
    let target = rand(lo, hi);
    if (Math.abs(target - a.x) < 120) target = a.x < (lo + hi) / 2 ? Math.min(hi, a.x + rand(140, 320)) : Math.max(lo, a.x - rand(140, 320));
    const dist = Math.abs(target - a.x);
    faceDir(a, target > a.x ? 1 : -1);
    a.el.classList.add("walking");
    a.walk.restart();
    a.move = gsap.to(a, {
      x: target,
      duration: dist / a.c.speed,
      ease: "none",
      onUpdate: () => gsap.set(a.el, { x: a.x }),
      onComplete: () => arrive(a),
    });
  }
  function arrive(a) {
    stopWalking(a);
    if (Math.random() < 0.35) say(a);
    a.wait = gsap.delayedCall(rand(1.6, 4.8), () => wander(a));
  }
  function say(a) {
    const [jp, vi] = a.c.lines[a.line];
    a.line = (a.line + 1) % a.c.lines.length;
    a.bubble.innerHTML = `<span class="jp" lang="ja">${ruby(jp)}</span><span class="vi">${esc(vi)}</span>`;
    // Keep the bubble on screen near the edges.
    gsap.set(a.bubble, { x: 0 });
    const r = a.bubble.getBoundingClientRect();
    const shift = r.left < 8 ? 8 - r.left : r.right > window.innerWidth - 8 ? window.innerWidth - 8 - r.right : 0;
    gsap.set(a.bubble, { x: shift });
    if (a.hideBubble) a.hideBubble.kill();
    if (reduced()) {
      gsap.set(a.bubble, { autoAlpha: 1 });
    } else {
      gsap.fromTo(a.bubble, { autoAlpha: 0, scale: 0.6, y: 8, transformOrigin: "50% 100%" },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2.2)", overwrite: true });
    }
    a.hideBubble = gsap.delayedCall(3.6, () => gsap.to(a.bubble, { autoAlpha: 0, duration: 0.25 }));
  }
  function talkNow(a) {
    if (a.move) a.move.kill();
    if (a.wait) a.wait.kill();
    stopWalking(a);
    if (!window.Speak) say(a);
    if (!reduced()) {
      gsap.fromTo(a.sprite, { y: 0 }, { y: -16, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
      a.wait = gsap.delayedCall(3.4, () => wander(a));
    }
  }

  function placeAll() {
    const w = window.innerWidth;
    actors.forEach((a, i) => {
      const [lo, hi] = bounds(a);
      a.x = gsap.utils.clamp(lo, hi, (w / (actors.length + 1)) * (i + 1) - a.el.offsetWidth / 2);
      gsap.set(a.el, { x: a.x });
      faceDir(a, i % 2 ? -1 : 1);
      if (a.c.front) gsap.set(a.sprite, { scaleX: 1 });
    });
  }
  function stopAll() {
    actors.forEach((a) => {
      if (a.move) a.move.kill();
      if (a.wait) a.wait.kill();
      stopWalking(a);
    });
    stopAmbient();
  }
  function startAll() {
    stopAll();
    placeAll();
    startAmbient();
    if (reduced()) return; // stand still, still clickable
    actors.forEach((a, i) => { a.wait = gsap.delayedCall(0.6 + i * 0.7, () => wander(a)); });
  }

  /* ---------------- On/off: floating switch + sidebar 人 button, kept in sync ---------------- */
  const sideToggle = document.getElementById("castToggle");
  const sw = document.createElement("button");
  sw.type = "button";
  sw.className = "cast-switch";
  sw.setAttribute("role", "switch");
  sw.innerHTML = `
    <span class="cs-ico" lang="ja" aria-hidden="true">人</span>
    <span class="cs-label">Nhân vật</span>
    <span class="cs-state" aria-hidden="true"></span>
    <span class="cs-track" aria-hidden="true"><span class="cs-thumb"></span></span>`;
  document.body.appendChild(sw);
  const thumb = sw.querySelector(".cs-thumb");
  const stateText = sw.querySelector(".cs-state");

  let enabled = true;
  try { enabled = localStorage.getItem("cast") !== "0"; } catch (e) {}
  function setEnabled(on, animate) {
    enabled = on;
    layer.hidden = !on;
    sw.setAttribute("aria-checked", String(on));
    sw.title = on ? "Bấm để ẩn nhân vật" : "Bấm để hiện nhân vật";
    stateText.textContent = on ? "Bật" : "Tắt";
    const travel = thumb.parentElement.clientWidth - thumb.offsetWidth - 4;
    gsap.to(thumb, { x: on ? travel : 0, duration: animate && !reduced() ? 0.25 : 0, ease: "back.out(2)" });
    if (sideToggle) {
      sideToggle.setAttribute("aria-pressed", String(on));
      sideToggle.title = sw.title;
    }
    try { localStorage.setItem("cast", on ? "1" : "0"); } catch (e) {}
    if (on) {
      startAll();
      if (animate && !reduced()) {
        gsap.from(actors.map((a) => a.sprite), { autoAlpha: 0, y: 30, duration: 0.6, stagger: 0.12, ease: "back.out(1.8)" });
      }
    } else {
      stopAll();
      actors.forEach((a) => gsap.set(a.bubble, { autoAlpha: 0 }));
    }
  }
  sw.addEventListener("click", () => setEnabled(!enabled, true));
  if (sideToggle) sideToggle.addEventListener("click", () => setEnabled(!enabled, true));

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { setEnabled(enabled, false); }, 250);
  });
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (enabled) startAll(); });

  setEnabled(enabled, false);
  if (enabled && !reduced()) {
    gsap.from(actors.map((a) => a.sprite), { autoAlpha: 0, y: 30, duration: 0.6, stagger: 0.12, delay: 1, ease: "back.out(1.8)" });
  }
  if (!reduced()) gsap.from(sw, { autoAlpha: 0, y: 20, duration: 0.5, delay: 1.2, ease: "power3.out" });
})();
