/* Glass shell + GSAP motion for the study notebook. The notebook's own logic lives in index.html. */
(() => {
  "use strict";

  const hasGsap = typeof window.gsap !== "undefined";
  if (!hasGsap) document.documentElement.classList.add("no-anim");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");

  /* ---------- Mini clock in the header ---------- */
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function tick() {
    const now = new Date();
    $("#miniClock").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    $("#miniDate").innerHTML =
      `${WEEKDAYS[now.getDay()]} ${pad(now.getMonth() + 1)}/${pad(now.getDate())}` +
      `<span lang="ja">${now.getMonth() + 1}月${now.getDate()}日（${"日月火水木金土"[now.getDay()]}）</span>`;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Sidebar: highlight the current section ---------- */
  const views = { kanji: "#view-kanji", doc: "#view-doc", tranh: "#view-tranh" };
  const currentView = () => (location.hash === "#doc" ? "doc" : location.hash === "#tranh" ? "tranh" : "kanji");
  function markSidebar() {
    const v = currentView();
    $$(".sidebar [data-view]").forEach((a) => {
      if (a.dataset.view === v) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  markSidebar();
  window.addEventListener("hashchange", markSidebar);

  /* ---------- Lookup popup: reading + meaning for kanji / katakana in the passages ---------- */
  const D = JSON.parse($("#data").textContent);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const RB = /\{([^|}]+)\|([^}]+)\}/g;
  const kinfo = {};
  const examples = []; // [raw "{w|r}" string, meaning]
  D.kanji.forEach((L) => L.items.forEach((it) => {
    kinfo[it.k] = it;
    it.ex.forEach((x) => examples.push(x));
  }));
  const kataMeaning = {};
  D.passages.forEach((p) => p.kata.forEach(([w, m]) => { kataMeaning[w] = m; }));

  function lookupKanji(word, reading) {
    const key = `{${word}|${reading}}`;
    const exact = examples.find((x) => x[0] === key);
    const inside = exact || examples.find((x) => x[0].includes(key));
    const chars = Array.from(word).filter((c) => kinfo[c]).map((c) => kinfo[c]);
    let html = `<div class="lk-w" lang="ja">${esc(word)}</div><div class="lk-r" lang="ja">${esc(reading)}</div>`;
    if (chars.length) html += `<div class="lk-hv">${chars.map((it) => esc(it.hv.split(" / ")[0])).join(" ")}</div>`;
    if (exact) {
      html += `<div class="lk-m">${esc(exact[1])}</div>`;
    } else if (inside) {
      const form = inside[0].replace(RB, "$1");
      html += `<div class="lk-m">${esc(inside[1])}</div><div class="lk-src">trong từ <span lang="ja">${esc(form)}</span></div>`;
    }
    if (chars.length) {
      html += `<div class="lk-chars">${chars.map((it) =>
        `<div><b lang="ja">${esc(it.k)}</b>Âm Hán ${esc(it.on)} · Âm Nhật ${esc(it.kun)}</div>`).join("")}</div>`;
    }
    return html;
  }
  function lookupKata(word) {
    const m = kataMeaning[word];
    if (!m) return null;
    return `<div class="lk-w" lang="ja">${esc(word)}</div><div class="lk-hv">KATAKANA</div><div class="lk-m">${esc(m)}</div>`;
  }

  const pop = document.createElement("div");
  pop.className = "lookup";
  pop.setAttribute("role", "tooltip");
  pop.id = "lookup";
  document.body.appendChild(pop);
  let current = null;

  function showLookup(el) {
    const html = el.classList.contains("kt") ? lookupKata(el.textContent) : lookupKanji(el.textContent, el.dataset.r || "");
    if (!html) return;
    if (current && current !== el) current.classList.remove("lk-on");
    current = el;
    el.classList.add("lk-on");
    pop.innerHTML = html;
    // Measure, then place above the word (or below if there is no room), kept inside the viewport.
    pop.style.visibility = "hidden";
    pop.style.opacity = "1";
    const r = el.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    const left = Math.min(Math.max(12, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 12);
    const above = r.top - ph - 10;
    const top = above > 8 ? above : r.bottom + 10;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    if (window.gsap && !reducedMotion()) {
      gsap.fromTo(pop, { autoAlpha: 0, y: above > 8 ? 6 : -6 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out", overwrite: true });
    } else {
      pop.style.visibility = "visible";
    }
  }
  function hideLookup() {
    if (!current) return;
    current.classList.remove("lk-on");
    current = null;
    if (window.gsap) gsap.to(pop, { autoAlpha: 0, duration: 0.12, overwrite: true });
    else pop.style.visibility = "hidden";
  }
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const docOut = $("#doc-out");
  const wordOf = (t) => t.closest && t.closest("#doc-out .k[data-r], #doc-out .kt");

  docOut.addEventListener("mouseover", (e) => {
    if (!finePointer.matches) return;
    const w = wordOf(e.target);
    if (w && w !== current) showLookup(w);
  });
  docOut.addEventListener("mouseout", (e) => {
    if (!finePointer.matches) return;
    const w = wordOf(e.target);
    if (w && !(e.relatedTarget && w.contains(e.relatedTarget))) hideLookup();
  });
  // Touch / click: tap a word to toggle its popup; tap elsewhere to close.
  document.addEventListener("click", (e) => {
    const w = wordOf(e.target);
    if (w) {
      if (w === current && !finePointer.matches) hideLookup();
      else showLookup(w);
    } else if (!e.target.closest("#lookup")) {
      hideLookup();
    }
  });
  window.addEventListener("scroll", hideLookup, { passive: true });
  window.addEventListener("hashchange", hideLookup);

  if (!hasGsap) return;

  /* ---------- Motion ---------- */
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
        gsap.set(".reveal", { autoAlpha: 1 });
        return;
      }

      const cleanups = [];

      /* Staggered reveal of the cards/articles near the top of a section. */
      function revealIn(container) {
        const section = container.closest("section");
        if (!section || section.hidden) return;
        const limit = window.innerHeight * 1.2;
        const items = $$(".lesson-h, .card, article, .howto", section)
          .filter((el) => el.getBoundingClientRect().top < limit)
          .slice(0, 14);
        if (!items.length) return;
        gsap.from(items, {
          autoAlpha: 0,
          y: 26,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.045,
          clearProps: "opacity,visibility,transform",
        });
      }

      /* Entrance timeline */
      const intro = gsap.timeline({ defaults: { duration: 0.8, ease: "power3.out" } });
      intro
        .from(".wrap", { autoAlpha: 0, y: 40, scale: 0.98, duration: 1 })
        .from(".sidebar", { autoAlpha: 0, x: -50 }, "<0.25")
        .from(".side-btn", { autoAlpha: 0, scale: 0.4, duration: 0.5, ease: "back.out(2)", stagger: 0.06 }, "<0.15")
        .from("header.top > *", { autoAlpha: 0, y: 18, stagger: 0.1 }, 0.35)
        .from(".bar", { autoAlpha: 0, y: 16 }, "<0.2")
        .add(() => revealIn($(views[currentView()]).lastElementChild), "<0.1")
        .from(".dock", { autoAlpha: 0, y: 70 }, 0.5)
        .from(".dock-item", { autoAlpha: 0, y: 24, duration: 0.5, ease: "back.out(2)", stagger: 0.05 }, "<0.2");

      /* Re-reveal whenever the notebook re-renders a list (filters) or the tab changes. */
      const outs = ["#kanji-out", "#doc-out", "#tranh-out"].map((s) => $(s));
      const observer = new MutationObserver((records) => {
        const targets = new Set(records.map((r) => r.target));
        targets.forEach(revealIn);
      });
      outs.forEach((el) => observer.observe(el, { childList: true }));
      const onHash = () => {
        const section = $(views[currentView()]);
        revealIn(section.lastElementChild);
        gsap.from($$(".sub, .howto", section), { autoAlpha: 0, y: 12, duration: 0.4, stagger: 0.06, clearProps: "opacity,visibility,transform" });
      };
      window.addEventListener("hashchange", onHash);
      cleanups.push(() => observer.disconnect(), () => window.removeEventListener("hashchange", onHash));

      /* Answer / translation / hint boxes slide in when opened. */
      const onAct = (e) => {
        const b = e.target.closest("button.act");
        if (!b || b.getAttribute("aria-expanded") !== "true") return;
        const t = b.dataset.t;
        const box = t === "ans" ? b.nextElementSibling : (b.closest(".tq") || b.closest("article")).querySelector("." + t);
        if (box && !box.hidden) {
          gsap.fromTo(box, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "opacity,transform" });
        }
      };
      /* Self-test cards: answers fade up when a card is opened. */
      const onCard = (e) => {
        const card = e.target.closest("#view-kanji.quiz .card");
        if (!card || !card.classList.contains("open")) return;
        gsap.fromTo($$(".hide", card), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, clearProps: "opacity,transform" });
        gsap.fromTo($(".box", card), { scale: 0.92 }, { scale: 1, duration: 0.45, ease: "back.out(2.5)", clearProps: "transform" });
      };
      document.addEventListener("click", onAct);
      document.addEventListener("click", onCard);
      cleanups.push(() => document.removeEventListener("click", onAct), () => document.removeEventListener("click", onCard));

      if (hover) {
        const dock = $(".dock");
        const finishIntro = () => intro.progress(1);
        dock.addEventListener("mouseenter", finishIntro);
        cleanups.push(
          () => dock.removeEventListener("mouseenter", finishIntro),
          GlassUI.magnifyDock(dock),
          GlassUI.magnifyDock($(".sidebar"), { selector: ".side-btn", range: 110, maxScale: 1.35, lift: 14 }),
          GlassUI.hoverLift($("#kanji-out"), ".card", { y: -5 })
        );
      }

      return () => cleanups.forEach((fn) => fn());
    }
  );
})();
