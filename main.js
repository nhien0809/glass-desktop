(() => {
  "use strict";

  const hasGsap = typeof window.gsap !== "undefined";
  if (!hasGsap) document.documentElement.classList.add("no-anim");

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canAnimate = () => hasGsap && !reducedQuery.matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------- Clock ---------------- */
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  const pad = (n) => String(n).padStart(2, "0");

  const digitSlots = $$("#clock .digit");
  const dateEl = $("#date");
  const clockEl = $("#clock");

  function setDigit(slot, value, animate) {
    const current = slot.lastElementChild;
    if (current && current.textContent === value) return;

    if (!animate || !current) {
      slot.innerHTML = "";
      const span = document.createElement("span");
      span.textContent = value;
      slot.appendChild(span);
      return;
    }

    const next = document.createElement("span");
    next.textContent = value;
    slot.appendChild(next);

    // Old digit rolls up and out, new digit rolls in from below.
    const tl = gsap.timeline({
      defaults: { duration: 0.5, ease: "power3.out" },
      onComplete: () => current.remove(),
    });
    tl.to(current, { yPercent: -100, autoAlpha: 0 }, 0)
      .fromTo(next, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1 }, 0);
  }

  let lastDay = null;
  function tick(animate) {
    const now = new Date();
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const chars = (hh + mm).split("");
    digitSlots.forEach((slot, i) => setDigit(slot, chars[i], animate && canAnimate()));
    clockEl.setAttribute("aria-label", `Current time ${hh}:${mm}`);

    const dayKey = now.toDateString();
    if (dayKey !== lastDay) {
      lastDay = dayKey;
      dateEl.textContent = `${WEEKDAYS[now.getDay()]} ${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
      renderCalendar(now);
    }
  }

  /* ---------------- Calendar ---------------- */
  function renderCalendar(now) {
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    $("#calMonth").textContent = MONTHS[month];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement("span");
      blank.className = "muted";
      blank.setAttribute("aria-hidden", "true");
      frag.appendChild(blank);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("span");
      cell.textContent = d;
      if (d === now.getDate()) {
        cell.className = "today";
        cell.setAttribute("aria-current", "date");
      }
      frag.appendChild(cell);
    }
    const days = $("#calDays");
    days.replaceChildren(frag);
  }

  tick(false);
  setInterval(() => tick(true), 1000);

  /* ---------------- Search button ---------------- */
  $("#searchBtn").addEventListener("click", () => {
    window.open("https://www.google.com/", "_blank", "noopener");
  });

  /* ---------------- Music player ---------------- */
  const playBtn = $("#playBtn");
  const progressBar = $(".progress");
  const fill = $("#progressFill");
  const TRACK_SECONDS = 184;
  let playing = false;

  let progressTween = null;
  if (hasGsap) {
    progressTween = gsap.to(fill, {
      scaleX: 1,
      duration: TRACK_SECONDS,
      ease: "none",
      paused: true,
      onUpdate() {
        progressBar.setAttribute("aria-valuenow", Math.round(this.progress() * 100));
      },
      onComplete() {
        this.progress(0).play();
      },
    });
  }

  // Spinning vinyl cover (motion only, created inside matchMedia below).
  let spin = null;

  function setPlaying(state) {
    playing = state;
    playBtn.setAttribute("aria-pressed", String(state));
    playBtn.setAttribute("aria-label", state ? "Pause" : "Play");
    if (progressTween) state ? progressTween.play() : progressTween.pause();
    if (spin) state ? spin.play() : spin.pause();
  }

  function pop(el) {
    if (!canAnimate()) return;
    gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: "back.out(3)", overwrite: "auto" });
  }

  playBtn.addEventListener("click", () => {
    setPlaying(!playing);
    pop(playBtn);
  });
  ["#prevBtn", "#nextBtn"].forEach((id) => {
    $(id).addEventListener("click", (e) => {
      if (progressTween) progressTween.progress(0);
      if (progressTween && !playing) progressTween.pause();
      progressBar.setAttribute("aria-valuenow", "0");
      pop(e.currentTarget);
    });
  });
  ["#shuffleBtn", "#likeBtn"].forEach((id) => {
    $(id).addEventListener("click", (e) => {
      const btn = e.currentTarget;
      btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
      pop(btn);
    });
  });

  /* ---------------- Japanese study card (Kanji hôm nay) ---------------- */
  const study = $("#study");
  const kBody = $("#kBody");
  const quizBtn = $("#kQuiz");
  let kanji = [];
  let kIndex = 0;

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
  // "{家族|かぞく}" -> <ruby>家族<rt>かぞく</rt></ruby>
  const toRuby = (s) => escapeHtml(s).replace(/\{([^|}]+)\|([^}]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>");

  function fillKanji(i) {
    const it = kanji[i];
    $("#kChar").textContent = it.k;
    $("#kHv").textContent = it.hv;
    $("#kOn").textContent = it.on;
    $("#kKun").textContent = it.kun;
    $("#kTip").textContent = it.tip || "";
    $("#kLesson").textContent = `Bài ${it.l}`;
    $("#kCount").textContent = `${i + 1} / ${kanji.length}`;
    $("#kEx").innerHTML = it.ex.map(([w, m, note]) =>
      `<li><span class="w" lang="ja">${toRuby(w)}</span><span class="m">${escapeHtml(m)}${note ? `<span class="note">${escapeHtml(note)}</span>` : ""}</span></li>`
    ).join("");
    $$(".quizable", study).forEach((el) => el.classList.remove("shown"));
  }

  function showKanji(i, dir) {
    kIndex = (i + kanji.length) % kanji.length;
    if (!canAnimate() || !dir) {
      fillKanji(kIndex);
      return;
    }
    // Slide the old card out, swap content, slide the new one in.
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(kBody, { x: -24 * dir, autoAlpha: 0, duration: 0.18, ease: "power2.in", overwrite: "auto" })
      .call(() => fillKanji(kIndex))
      .fromTo(kBody, { x: 24 * dir }, { x: 0, autoAlpha: 1, duration: 0.35 })
      .fromTo("#kChar", { scale: 0.7, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.2)" }, "<");
  }

  $("#kPrev").addEventListener("click", () => kanji.length && showKanji(kIndex - 1, -1));
  $("#kNext").addEventListener("click", () => kanji.length && showKanji(kIndex + 1, 1));
  quizBtn.addEventListener("click", () => {
    const on = quizBtn.getAttribute("aria-pressed") !== "true";
    quizBtn.setAttribute("aria-pressed", String(on));
    study.classList.toggle("quiz", on);
    $("#kHint").hidden = !on;
    $$(".quizable", study).forEach((el) => el.classList.remove("shown"));
  });
  study.addEventListener("click", (e) => {
    if (!study.classList.contains("quiz")) return;
    const part = e.target.closest(".quizable");
    if (part) part.classList.add("shown");
  });

  fetch("assets/kanji.json")
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((list) => {
      kanji = list;
      // Same "kanji of the day" for the whole day, rotating through all 41.
      const now = new Date();
      const dayNumber = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
      showKanji(dayNumber % kanji.length, 0);
    })
    .catch(() => {
      $("#kTip").textContent = "Không tải được danh sách chữ Hán.";
    });

  if (!hasGsap) return;

  /* ---------------- GSAP animation ---------------- */
  const mm = gsap.matchMedia();

  mm.add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)",
      hover: "(hover: hover) and (pointer: fine)",
    },
    (context) => {
      const { motion, hover } = context.conditions;

      if (!motion) {
        // Reduced motion: just show everything, no movement.
        gsap.set(".reveal, .widget", { autoAlpha: 1 });
        return;
      }

      /* Entrance timeline */
      const intro = gsap.timeline({ defaults: { duration: 0.8, ease: "power3.out" } });
      intro
        .addLabel("panel")
        .from(".panel", { autoAlpha: 0, y: 40, scale: 0.96, duration: 1.1 }, "panel")
        .from(".sidebar", { autoAlpha: 0, x: -50 }, "panel+=0.35")
        .from(".side-btn", { autoAlpha: 0, scale: 0.4, duration: 0.5, ease: "back.out(2)", stagger: 0.06 }, "<0.15")
        .addLabel("widgets", "panel+=0.5")
        .from(".clock-wrap", { autoAlpha: 0, y: 30 }, "widgets")
        .from(".calendar", { autoAlpha: 0, y: 40, rotationX: -15, transformOrigin: "50% 0%" }, "widgets+=0.12")
        .from(".top-row, .greet", { autoAlpha: 0, y: -20, stagger: 0.1 }, "widgets")
        .from(".card", { autoAlpha: 0, y: 30, scale: 0.9, stagger: 0.08 }, "widgets+=0.15")
        .from(".player", { autoAlpha: 0, y: 24 }, "widgets+=0.4")
        .from(".study", { autoAlpha: 0, y: 40, scale: 0.95, duration: 1 }, "widgets+=0.2")
        .from(".study-links a", { autoAlpha: 0, y: 10, stagger: 0.08, duration: 0.4 }, "<0.5")
        .from(".orb", { autoAlpha: 0, scale: 0.6, duration: 1.4, stagger: 0.2 }, "widgets")
        .addLabel("dock", "widgets+=0.3")
        .from(".dock", { autoAlpha: 0, y: 70 }, "dock")
        .from(".dock-item", { autoAlpha: 0, y: 24, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, "dock+=0.2");

      /* Ambient float for the centre orbs */
      gsap.to(".orb-a", { x: 18, y: -22, duration: 6, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".orb-b", { x: -14, y: 16, duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1 });

      /* Spinning cover while music plays */
      spin = gsap.to("#cover", { rotation: 360, duration: 6, ease: "none", repeat: -1, paused: !playing });

      const cleanups = [() => { spin = null; }];

      if (hover) {
        /* Hover lift on gallery cards */
        $$(".card").forEach((card) => {
          const enter = () => gsap.to(card, { y: -8, scale: 1.04, duration: 0.35, ease: "power2.out", overwrite: "auto" });
          const leave = () => gsap.to(card, { y: 0, scale: 1, duration: 0.45, ease: "power2.out", overwrite: "auto" });
          card.addEventListener("mouseenter", enter);
          card.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            card.removeEventListener("mouseenter", enter);
            card.removeEventListener("mouseleave", leave);
          });
        });

        /* Subtle lift for the widgets */
        $$(".calendar, .player, .study").forEach((el) => {
          const enter = () => gsap.to(el, { y: -4, duration: 0.3, ease: "power2.out", overwrite: "auto" });
          const leave = () => gsap.to(el, { y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          el.addEventListener("mouseenter", enter);
          el.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            el.removeEventListener("mouseenter", enter);
            el.removeEventListener("mouseleave", leave);
          });
        });

        /* Dock magnify (macOS-style) */
        const dock = $(".dock");
        const items = $$(".dock-item");
        const RANGE = 130;
        const MAX_SCALE = 1.5;
        const toScale = gsap.utils.pipe(
          gsap.utils.clamp(0, RANGE),
          gsap.utils.mapRange(0, RANGE, MAX_SCALE, 1)
        );
        // quickTo animates a single real property, so drive scaleX and scaleY separately.
        const quick = (item, prop) => gsap.quickTo(item, prop, { duration: 0.3, ease: "power3.out" });
        const setters = items.map((item) => {
          const sx = quick(item, "scaleX");
          const sy = quick(item, "scaleY");
          return { scale: (v) => { sx(v); sy(v); }, y: quick(item, "y") };
        });
        let centers = [];

        const measure = () => {
          // Read layout once (untransformed offsets) to avoid feedback from the scaling itself.
          const left = dock.getBoundingClientRect().left + dock.clientLeft;
          centers = items.map((item) => left + item.offsetLeft + item.offsetWidth / 2);
        };
        const onEnter = () => {
          intro.progress(1);
          measure();
        };
        const onMove = (e) => {
          if (!centers.length) measure();
          items.forEach((_, i) => {
            const s = toScale(Math.abs(e.clientX - centers[i]));
            setters[i].scale(s);
            setters[i].y(-(s - 1) * 22);
          });
        };
        const onLeave = () => {
          setters.forEach((s) => { s.scale(1); s.y(0); });
          centers = [];
        };
        dock.addEventListener("mouseenter", onEnter);
        dock.addEventListener("mousemove", onMove);
        dock.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", onLeave);
        cleanups.push(() => {
          dock.removeEventListener("mouseenter", onEnter);
          dock.removeEventListener("mousemove", onMove);
          dock.removeEventListener("mouseleave", onLeave);
          window.removeEventListener("resize", onLeave);
        });
      }

      return () => cleanups.forEach((fn) => fn());
    }
  );
})();
