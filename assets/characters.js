/*
 * Walking chibi characters (original designs, drawn here as SVG) that stroll along the bottom of the page.
 * Click / tap one to hear a JPD133 sentence (with furigana + Vietnamese).
 * The sidebar button #castToggle (人 · Nhân vật) shows or hides them; the choice is remembered.
 */
(() => {
  "use strict";
  if (typeof window.gsap === "undefined") return;

  const LINE = "#3a2a2e";
  const SK = `stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"`;

  /* ---------------- Drawing ---------------- */
  function eyes(color, light, dx, lashes) {
    const one = (cx) => {
      const cy = 61;
      return `
        <ellipse cx="${cx}" cy="${cy}" rx="7" ry="8.5" fill="#fff"/>
        <ellipse cx="${cx}" cy="${cy + 0.5}" rx="5.6" ry="7.4" fill="${color}"/>
        <ellipse cx="${cx}" cy="${cy + 3.5}" rx="4" ry="3" fill="${light}" opacity="0.7"/>
        <ellipse cx="${cx}" cy="${cy}" rx="2.8" ry="3.8" fill="#1d1420"/>
        <circle cx="${cx - 2}" cy="${cy - 3}" r="2.3" fill="#fff"/>
        <circle cx="${cx + 2.2}" cy="${cy + 3.2}" r="1" fill="#fff"/>
        <path d="M${cx - 8} ${cy - 5.5} Q${cx} ${cy - 11.5} ${cx + 8} ${cy - 5.5}" fill="none" stroke="#1d1420" stroke-width="${lashes ? 2.8 : 2.2}" stroke-linecap="round"/>
        ${lashes ? `<path d="M${cx + 7} ${cy - 6} l3 -2.5" stroke="#1d1420" stroke-width="1.8" stroke-linecap="round"/>` : ""}`;
    };
    return `<g class="eyes">${one(47 + dx)}${one(73 + dx)}</g>`;
  }

  function face(o) {
    const dx = 3; // face turned slightly toward the walking direction
    return `
      <rect x="55" y="80" width="10" height="13" fill="${o.skinShade}"/>
      <path d="M30 56 Q30 24 60 24 Q90 24 90 56 Q90 74 72 84 Q60 90 48 84 Q30 74 30 56 Z" fill="${o.skin}" ${SK}/>
      ${o.ears ? `<ellipse cx="30" cy="62" rx="4" ry="6" fill="${o.skin}" ${SK}/><ellipse cx="90" cy="62" rx="4" ry="6" fill="${o.skin}" ${SK}/>` : ""}
      ${eyes(o.eye, o.eyeLight, dx, o.lashes)}
      <ellipse cx="${41 + dx}" cy="72" rx="5" ry="2.4" fill="#ff8fa3" opacity="0.5"/>
      <ellipse cx="${79 + dx}" cy="72" rx="5" ry="2.4" fill="#ff8fa3" opacity="0.5"/>
      <path class="mouth" d="M${57 + dx} 77 Q${60 + dx} 80 ${63 + dx} 77" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linecap="round"/>`;
  }

  function legs(o) {
    const leg = (c, cls) => `
      <g class="${cls}">
        <rect x="${c - 6.5}" y="134" width="13" height="50" rx="6.5" fill="${o.leg}" ${SK}/>
        ${o.sock ? `<rect x="${c - 6.5}" y="164" width="13" height="20" rx="4" fill="${o.sock}" ${SK}/>` : ""}
        <ellipse cx="${c + 2}" cy="186" rx="9" ry="5" fill="${o.shoe}" ${SK}/>
      </g>`;
    return leg(68, "legR") + leg(52, "legL");
  }

  function arms(o) {
    const arm = (x, cls) => `
      <g class="${cls}">
        <rect x="${x}" y="93" width="10" height="31" rx="5" fill="${o.sleeve}" ${SK}/>
        <circle cx="${x + 5}" cy="127" r="5" fill="${o.skin}" ${SK}/>
      </g>`;
    return arm(33, "armL") + arm(77, "armR");
  }

  const HAIR = {
    twintails: (c) => ({
      back: `
        <path d="M31 46 Q12 82 21 130 Q26 144 35 134 Q30 100 39 60 Z" fill="${c}" ${SK}/>
        <path d="M89 46 Q108 82 99 130 Q94 144 85 134 Q90 100 81 60 Z" fill="${c}" ${SK}/>
        <ellipse cx="60" cy="50" rx="33" ry="30" fill="${c}" ${SK}/>`,
      front: `
        <path d="M27 60 Q25 21 60 19 Q95 21 93 60 Q89 45 82 40 L80 53 Q74 42 68 40 L64 53 Q60 40 54 41 L50 54 Q46 42 40 44 Q33 48 32 62 Z" fill="${c}" ${SK}/>
        <path d="M30 50 Q25 70 32 86 L37 64 Z" fill="${c}" ${SK}/>
        <path d="M90 50 Q95 70 88 86 L83 64 Z" fill="${c}" ${SK}/>
        <circle cx="33" cy="48" r="4.5" fill="#e8344e" ${SK}/>
        <circle cx="87" cy="48" r="4.5" fill="#e8344e" ${SK}/>`,
    }),
    spiky: (c) => ({
      back: `<ellipse cx="60" cy="48" rx="32" ry="28" fill="${c}" ${SK}/>`,
      front: `
        <path d="M27 60 Q23 30 43 22 L45 12 L54 21 L60 10 L67 21 L77 13 L77 24 Q97 31 93 60 Q88 46 80 42 L78 55 L71 42 L64 53 L58 42 L51 54 L46 43 Q36 48 32 63 Z" fill="${c}" ${SK}/>`,
    }),
    bob: (c) => ({
      back: `<path d="M26 56 Q24 19 60 17 Q96 19 94 56 Q97 83 86 93 L75 89 Q84 70 82 56 L38 56 Q36 70 45 89 L34 93 Q23 83 26 56 Z" fill="${c}" ${SK}/>`,
      front: `
        <path d="M28 57 Q27 21 60 19 Q93 21 92 57 L86 55 Q84 45 78 42 Q70 49 60 48 Q50 49 42 42 Q36 45 34 55 Z" fill="${c}" ${SK}/>
        <path d="M74 33 l3 -6 l3 6 l6 1 l-5 4 l2 6 l-6 -3 l-6 3 l2 -6 l-5 -4 Z" fill="#ffd166" ${SK}/>`,
    }),
  };

  const OUTFIT = {
    sailor: (o) => `
      <path d="M40 118 H80 L89 150 H31 Z" fill="${o.bottom}" ${SK}/>
      <path d="M49 122 L44 149 M60 121 V149 M71 122 L76 149" stroke="${LINE}" stroke-width="1.1" opacity="0.45"/>
      <path d="M42 96 Q42 89 50 88 H70 Q78 89 78 96 L81 122 H39 Z" fill="${o.top}" ${SK}/>
      <path d="M47 88 L60 106 L73 88 L80 94 L67 113 H53 L40 94 Z" fill="${o.collar}" ${SK}/>
      <path d="M60 107 L51 101 L51 114 Z M60 107 L69 101 L69 114 Z" fill="#e8344e" ${SK}/>
      <circle cx="60" cy="107" r="2.6" fill="#e8344e" ${SK}/>`,
    hoodie: (o) => `
      <path d="M41 116 H79 L81 142 H39 Z" fill="${o.bottom}" ${SK}/>
      <ellipse cx="60" cy="90" rx="17" ry="6" fill="${o.collar}" ${SK}/>
      <path d="M42 96 Q42 89 50 88 H70 Q78 89 78 96 L80 124 H40 Z" fill="${o.top}" ${SK}/>
      <path d="M55 92 V104 M65 92 V104" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M48 110 H72 L70 121 H50 Z" fill="${o.collar}" opacity="0.7" ${SK}/>`,
    cardigan: (o) => `
      <rect x="34" y="94" width="52" height="38" rx="9" fill="#5aa9e6" ${SK}/>
      <path d="M40 118 H80 L88 148 H32 Z" fill="${o.bottom}" ${SK}/>
      <path d="M38 132 H82 M47 120 L42 148 M73 120 L78 148" stroke="#fff" stroke-width="1.2" opacity="0.5"/>
      <path d="M42 96 Q42 89 50 88 H70 Q78 89 78 96 L81 122 H39 Z" fill="${o.top}" ${SK}/>
      <path d="M53 88 L60 104 L67 88 Z" fill="#fff" ${SK}/>
      <path d="M47 89 V121 M73 89 V121" stroke="#2f6fb0" stroke-width="3"/>
      <circle cx="60" cy="110" r="1.6" fill="${LINE}"/><circle cx="60" cy="117" r="1.6" fill="${LINE}"/>`,
  };

  function humanSVG(o) {
    const hair = HAIR[o.hairStyle](o.hair);
    return `
      <svg viewBox="0 0 120 200" aria-hidden="true" focusable="false">
        <ellipse cx="60" cy="192" rx="26" ry="4" fill="#12151c" opacity="0.18"/>
        <g class="body">
          ${hair.back}
          ${legs(o)}
          ${OUTFIT[o.outfit](o)}
          ${arms(o)}
          <g class="head">
            ${face(o)}
            ${hair.front}
          </g>
        </g>
      </svg>`;
  }

  function dogSVG() {
    const O = "#e3934a";
    const C = "#fff3df";
    const leg = (x, cls) => `
      <g class="${cls}">
        <rect x="${x}" y="54" width="10" height="26" rx="5" fill="${O}" ${SK}/>
        <ellipse cx="${x + 6}" cy="80" rx="6.5" ry="3.6" fill="${C}" ${SK}/>
      </g>`;
    return `
      <svg viewBox="0 0 120 90" aria-hidden="true" focusable="false">
        <ellipse cx="60" cy="85" rx="40" ry="3.6" fill="#12151c" opacity="0.18"/>
        <g class="body">
          <g class="tail"><circle cx="24" cy="34" r="9" fill="${O}" ${SK}/><circle cx="24" cy="34" r="3.8" fill="${C}"/></g>
          ${leg(36, "dLegB")}${leg(80, "dLegA")}
          <ellipse cx="57" cy="52" rx="34" ry="18" fill="${O}" ${SK}/>
          <ellipse cx="62" cy="61" rx="21" ry="7" fill="${C}"/>
          ${leg(28, "dLegA")}${leg(72, "dLegB")}
          <g class="head">
            <path d="M75 25 L77 6 L89 19 Z" fill="${O}" ${SK}/><path d="M78 20 L79 11 L85 18 Z" fill="#f6a5a5"/>
            <path d="M93 18 L102 5 L105 23 Z" fill="${O}" ${SK}/><path d="M96 18 L101 10 L102 20 Z" fill="#f6a5a5"/>
            <circle cx="89" cy="34" r="18" fill="${O}" ${SK}/>
            <ellipse cx="99" cy="41" rx="11" ry="8" fill="${C}" ${SK}/>
            <ellipse cx="108" cy="37" rx="3.4" ry="2.8" fill="#2a1d1d"/>
            <g class="eyes"><ellipse cx="92" cy="29" rx="2.8" ry="3.4" fill="#2a1d1d"/><circle cx="91" cy="27.8" r="1" fill="#fff"/></g>
            <ellipse cx="83" cy="40" rx="4" ry="2" fill="#ff8fa3" opacity="0.6"/>
            <path d="M99 45 q2.5 2.5 5 0" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M74 44 Q86 54 100 50" fill="none" stroke="#e8344e" stroke-width="4" stroke-linecap="round"/>
          </g>
        </g>
      </svg>`;
  }

  /* ---------------- Cast ---------------- */
  const CAST = [
    {
      name: "Hana", kind: "human", speed: 52, step: 0.32,
      look: { hairStyle: "twintails", hair: "#7a4a2e", skin: "#ffe3cf", skinShade: "#f2c9ae", eye: "#3f9b6e", eyeLight: "#9be0b7", lashes: true,
        outfit: "sailor", top: "#fdfdfd", collar: "#26346b", bottom: "#26346b", sleeve: "#fdfdfd", leg: "#ffe3cf", sock: "#fdfdfd", shoe: "#5b3a2a" },
      lines: [
        ["こんにちは！ハナです。", "Xin chào! Mình là Hana."],
        ["わたしは {音楽|おんがく}が {好|す}きです。", "Mình thích âm nhạc."],
        ["{駅|えき}は どこですか。", "Nhà ga ở đâu vậy?"],
        ["{姉|あね}は せが {高|たか}いです。", "Chị gái mình cao lắm."],
      ],
    },
    {
      name: "Ken", kind: "human", speed: 60, step: 0.3,
      look: { hairStyle: "spiky", hair: "#23262f", skin: "#f8d9bf", skinShade: "#e8bf9f", eye: "#8a5a32", eyeLight: "#d9a066", lashes: false, ears: true,
        outfit: "hoodie", top: "#f08a3c", collar: "#c9682a", bottom: "#3b4252", sleeve: "#f08a3c", leg: "#3b4252", shoe: "#f4f4f4" },
      lines: [
        ["{毎朝|まいあさ} 7{時|じ}に {起|お}きます。", "Mỗi sáng mình dậy lúc 7 giờ."],
        ["いっしょに {映画|えいが}を {見|み}ませんか。", "Cùng đi xem phim không?"],
        ["{図書館|としょかん}で {勉強|べんきょう}します。", "Mình học ở thư viện."],
        ["{右|みぎ}に まがって ください。", "Hãy rẽ phải nhé."],
      ],
    },
    {
      name: "Momo", kind: "human", speed: 46, step: 0.34,
      look: { hairStyle: "bob", hair: "#f2a1c0", skin: "#ffe6d6", skinShade: "#f4cbb6", eye: "#8a5cd8", eyeLight: "#c9b0ff", lashes: true,
        outfit: "cardigan", top: "#f5cd5b", collar: "#f5cd5b", bottom: "#6a7fd6", sleeve: "#f5cd5b", leg: "#3b3f52", shoe: "#8a4b3a" },
      lines: [
        ["{海外旅行|かいがいりょこう}が {好|す}きです！", "Mình thích du lịch nước ngoài!"],
        ["バスツアーに {行|い}きたいです。", "Mình muốn đi tour xe buýt."],
        ["{夜|よる}は {何|なに}を しますか。", "Buổi tối bạn làm gì?"],
        ["{車|くるま}で {海|うみ}へ {行|い}きました。", "Mình đã đi biển bằng ô tô."],
      ],
    },
    {
      name: "Pochi", kind: "dog", speed: 80, step: 0.17,
      lines: [
        ["ワン！ワン！", "Gâu! Gâu!"],
        ["ポチです。よろしく！", "Mình là Pochi. Rất vui được gặp!"],
        ["{犬|いぬ}は {短|みじか}い {足|あし}が かわいい！", "Chó chân ngắn thật đáng yêu!"],
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
    el.setAttribute("aria-label", `${c.name}: bấm để nghe một câu tiếng Nhật`);
    el.innerHTML = `
      <span class="bubble" role="status"></span>
      <span class="sprite">${c.kind === "dog" ? dogSVG() : humanSVG(c.look)}</span>`;
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
      a.walk
        .fromTo(a.q(".legL"), { rotation: -20 }, { rotation: 20, transformOrigin: "50% 3%", ...loop }, 0)
        .fromTo(a.q(".legR"), { rotation: 20 }, { rotation: -20, transformOrigin: "50% 3%", ...loop }, 0)
        .fromTo(a.q(".armL"), { rotation: 16 }, { rotation: -16, transformOrigin: "50% 8%", ...loop }, 0)
        .fromTo(a.q(".armR"), { rotation: -16 }, { rotation: 16, transformOrigin: "50% 8%", ...loop }, 0)
        .fromTo(a.q(".body"), { y: 0 }, { y: -3, ...loop, duration: s / 2 }, 0);
    }
    el.addEventListener("click", () => talkNow(a));
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
    gsap.set(a.sprite, { scaleX: dir });
  }
  function stopWalking(a) {
    a.walk.pause();
    const limbs = a.q(".legL, .legR, .armL, .armR, .dLegA, .dLegB");
    gsap.to(limbs, { rotation: 0, duration: 0.25, overwrite: "auto" });
    gsap.to(a.q(".body, .head"), { y: 0, duration: 0.25, overwrite: "auto" });
  }
  function wander(a) {
    if (!enabled) return;
    const [lo, hi] = bounds(a);
    let target = rand(lo, hi);
    if (Math.abs(target - a.x) < 120) target = a.x < (lo + hi) / 2 ? Math.min(hi, a.x + rand(140, 320)) : Math.max(lo, a.x - rand(140, 320));
    const dist = Math.abs(target - a.x);
    faceDir(a, target > a.x ? 1 : -1);
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
    say(a);
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

  /* ---------------- Toggle (sidebar 人 · Nhân vật) ---------------- */
  const toggle = document.getElementById("castToggle");
  let enabled = true;
  try { enabled = localStorage.getItem("cast") !== "0"; } catch (e) {}
  function setEnabled(on) {
    enabled = on;
    layer.hidden = !on;
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(on));
      toggle.title = on ? "Ẩn nhân vật" : "Hiện nhân vật";
    }
    try { localStorage.setItem("cast", on ? "1" : "0"); } catch (e) {}
    if (on) {
      startAll();
      gsap.from(actors.map((a) => a.sprite), { autoAlpha: 0, y: 30, duration: 0.6, stagger: 0.12, ease: "back.out(1.8)" });
    } else {
      stopAll();
    }
  }
  if (toggle) toggle.addEventListener("click", () => setEnabled(!enabled));

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (enabled) startAll(); }, 250);
  });
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (enabled) startAll(); });

  setEnabled(enabled);
})();
