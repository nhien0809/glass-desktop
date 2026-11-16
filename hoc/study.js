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
          GlassUI.hoverLift($("#kanji-out"), ".card", { y: -5 })
        );
      }

      return () => cleanups.forEach((fn) => fn());
    }
  );
})();
