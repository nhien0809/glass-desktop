/*
 * Guided tour ("Hướng dẫn"): runs once on the first visit to each page, and again whenever the
 * learner presses the "Hướng dẫn" button (#helpBtn) in the sidebar.
 * A spotlight moves from one part of the page to the next, with a short note beside it.
 * Steps whose element is missing or hidden on this page / screen size are skipped.
 */
(() => {
  "use strict";

  const STEPS = [
    // Home page
    { page: "home", title: "Chào mừng đến Nihongo Desk 👋", text: "Góc học tiếng Nhật JPD133 (Dekiru Nihongo bài 8–11). Bấm Tiếp để xem nhanh từng phần nhé." },
    { page: "home", el: ".sidebar", title: "Thanh menu", text: "Tra từ, Trang chủ, Học chữ Hán, Bài đọc, Tranh kiểm tra, Luyện nói, bật/tắt nhân vật và toàn màn hình. Rê chuột lên nút để xem tên." },
    { page: "home", el: "#kcard", title: "Chữ Hán hôm nay", text: "Mỗi ngày một chữ: Hán Việt, âm Nhật, âm Hán và ví dụ. Nút ‹ › để đổi chữ, nút con mắt để che đáp án tự kiểm tra." },
    { page: "home", el: "#hero", title: "Luyện nói", text: "Bấm vào nhân vật (hoặc nút Luyện nói): nhân vật hỏi một câu tiếng Nhật, bạn bấm micro để trả lời và nghe lại." },
    { page: "home", el: ".gallery", title: "Bài 8 – 11", text: "Mở sổ học của từng bài: chữ Hán, bài đọc và tranh kiểm tra." },
    { page: "home", el: "#player", title: "Nghe nhạc khi học", text: "Bấm nút danh sách (≡+) rồi “Thêm nhạc từ máy” để chọn file nhạc của bạn. Nhạc vẫn phát khi bạn chuyển trang." },
    { page: "home", el: ".dock", title: "Công cụ tra cứu", text: "Mazii, Google Dịch, Jisho, NHK Easy, YouTube, Spotify: mở trong tab mới." },
    // Study pages
    { page: "hoc", title: "Sổ học", text: "Mọi thứ của bài 8–11 ở đây. Xem nhanh các phần nhé." },
    { page: "hoc", el: ".tabs", title: "Năm phần học", text: "Từ mới, Ngữ pháp (bài 8–10), Chữ Hán, Bài đọc và Tranh kiểm tra." },
    { page: "hoc", el: "#view-tu:not([hidden]) #tu-mode", title: "Ba cách học từ mới", text: "Danh sách theo chủ đề (bấm loa để nghe), Thẻ ghi nhớ để lật thẻ, và Kiểm tra trắc nghiệm 10 câu. Từ nào đã nhớ thì đánh dấu lại." },
    { page: "hoc", el: "#view-tu:not([hidden]) .tu-opts", title: "Tự kiểm tra", text: "Che nghĩa để tự đoán, chỉ học các từ chưa nhớ, hoặc đổi chiều hỏi Nhật → Việt / Việt → Nhật." },
    { page: "hoc", el: "#view-kanji:not([hidden]) #lesson-filter", title: "Chọn bài", text: "Lọc chữ Hán theo bài 8, 9, 10, 11 hoặc xem tất cả." },
    { page: "hoc", el: "#view-kanji:not([hidden]) #t-quiz", title: "Tự kiểm tra", text: "Che cách đọc và ví dụ. Nhìn chữ, tự nói rồi bấm vào thẻ để xem đáp án." },
    { page: "hoc", el: "#t-hl", title: "Tô màu chữ", text: "Trong bài đọc, chữ Hán và katakana được tô màu. Rê chuột (hoặc chạm) vào chữ để xem cách đọc và nghĩa." },
    { page: "hoc", el: ".music-fab:not([hidden])", title: "Nhạc", text: "Mở danh sách nhạc. Nhạc đang phát ở trang chủ vẫn phát tiếp ở đây." },
    // Both
    { el: "#helpBtn", title: "Xem lại hướng dẫn", text: "Bấm nút này bất cứ lúc nào để xem lại các bước. Chúc bạn học vui! 🌸", last: true },
  ];

  const page = document.body.classList.contains("home") ? "home" : "hoc";
  const KEY = `tour-${page}`;
  const hasGsap = typeof window.gsap !== "undefined";
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return true; } };
  const markSeen = () => { try { localStorage.setItem(KEY, "1"); } catch (e) {} };

  const visible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    // Size only: during the entrance animation parts are still faded out but already in place.
    return r.width > 0 && r.height > 0;
  };

  /* ---------------- Markup ---------------- */
  const root = document.createElement("div");
  root.className = "tour";
  root.hidden = true;
  root.innerHTML = `
    <div class="tour-shade"></div>
    <div class="tour-spot" aria-hidden="true"></div>
    <div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle" aria-describedby="tourText">
      <div class="tour-step"></div>
      <h2 class="tour-title" id="tourTitle"></h2>
      <p class="tour-text" id="tourText"></p>
      <div class="tour-dots" aria-hidden="true"></div>
      <div class="tour-ctl">
        <button type="button" class="tour-skip">Bỏ qua</button>
        <span></span>
        <button type="button" class="tour-prev">Trước</button>
        <button type="button" class="tour-next">Tiếp</button>
      </div>
    </div>`;
  document.body.appendChild(root);
  const shade = root.querySelector(".tour-shade");
  const spot = root.querySelector(".tour-spot");
  const card = root.querySelector(".tour-card");
  const stepEl = root.querySelector(".tour-step");
  const titleEl = root.querySelector(".tour-title");
  const textEl = root.querySelector(".tour-text");
  const dots = root.querySelector(".tour-dots");
  const prevBtn = root.querySelector(".tour-prev");
  const nextBtn = root.querySelector(".tour-next");

  let steps = [];
  let at = 0;
  let lastFocus = null;

  /* ---------------- Placement ---------------- */
  const PAD = 8;
  function targetOf(s) { return s.el ? document.querySelector(s.el) : null; }
  function place(animate) {
    const s = steps[at];
    const el = targetOf(s);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let box;
    if (el && visible(el)) {
      const r = el.getBoundingClientRect();
      box = { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2, r: 22 };
    } else {
      // No target: a small invisible spot in the middle, card centred.
      box = { x: vw / 2, y: vh / 2, w: 0, h: 0, r: 0 };
    }
    const dur = animate && hasGsap && !reduced() ? 0.45 : 0;
    const set = { left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: box.r };
    if (hasGsap) gsap.to(spot, { ...set, duration: dur, ease: "power3.inOut", overwrite: true });
    else Object.assign(spot.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` });

    // Card: beside the spot where there is room (right, left, below, above), else centred.
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const gap = 14;
    let x, y;
    if (!box.w) { x = (vw - cw) / 2; y = (vh - ch) / 2; }
    else if (box.x + box.w + gap + cw <= vw - 12) { x = box.x + box.w + gap; y = box.y; }
    else if (box.x - gap - cw >= 12) { x = box.x - gap - cw; y = box.y; }
    else if (box.y + box.h + gap + ch <= vh - 12) { x = box.x + box.w / 2 - cw / 2; y = box.y + box.h + gap; }
    else if (box.y - gap - ch >= 12) { x = box.x + box.w / 2 - cw / 2; y = box.y - gap - ch; }
    else { x = (vw - cw) / 2; y = vh - ch - 16; }
    x = Math.min(Math.max(12, x), vw - cw - 12);
    y = Math.min(Math.max(12, y), vh - ch - 12);
    if (hasGsap) gsap.to(card, { left: x, top: y, duration: dur, ease: "power3.inOut", overwrite: "auto" });
    else Object.assign(card.style, { left: `${x}px`, top: `${y}px` });
  }

  function show(i, animate = true) {
    at = i;
    const s = steps[at];
    const el = targetOf(s);
    if (el && visible(el)) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "center", behavior: "instant" });
    }
    stepEl.textContent = `${at + 1} / ${steps.length}`;
    titleEl.textContent = s.title;
    textEl.textContent = s.text;
    dots.innerHTML = steps.map((_, k) => `<i class="${k === at ? "on" : ""}"></i>`).join("");
    prevBtn.hidden = at === 0;
    nextBtn.textContent = at === steps.length - 1 ? "Xong" : "Tiếp";
    place(animate);
    if (hasGsap && !reduced() && animate) {
      gsap.fromTo([titleEl, textEl], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05, delay: 0.15, overwrite: true });
    }
  }

  /* ---------------- Start / stop ---------------- */
  function start() {
    steps = STEPS.filter((s) => (!s.page || s.page === page) && (!s.el || visible(document.querySelector(s.el))));
    if (!steps.length) return;
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add("touring");
    if (hasGsap) gsap.set(spot, { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 });
    show(0, false);
    if (hasGsap && !reduced()) {
      gsap.fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(card, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)" });
    }
    nextBtn.focus();
  }
  function stop() {
    markSeen();
    const done = () => {
      root.hidden = true;
      document.documentElement.classList.remove("touring");
      if (hasGsap) gsap.set([shade, card, spot], { clearProps: "opacity,visibility,transform" });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    if (hasGsap && !reduced()) gsap.to([card, spot, shade], { autoAlpha: 0, duration: 0.2, onComplete: done });
    else done();
  }
  const next = () => (at < steps.length - 1 ? show(at + 1) : stop());
  const prev = () => { if (at > 0) show(at - 1); };

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);
  root.querySelector(".tour-skip").addEventListener("click", stop);
  shade.addEventListener("click", next);
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); stop(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (e.key === "Tab") {
      // Keep focus inside the tour card.
      const f = [...card.querySelectorAll("button:not([hidden])")];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  let raf = 0;
  const follow = () => {
    if (root.hidden) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => place(false));
  };
  window.addEventListener("resize", follow);
  window.addEventListener("scroll", follow, true);

  const help = document.getElementById("helpBtn");
  if (help) help.addEventListener("click", start);

  // First visit: wait for the page's entrance animation, then start.
  // Not inside the full-screen frame's parent (it starts in the frame) and not if a dialog is open.
  if (!seen()) {
    setTimeout(() => {
      if (root.hidden && !document.querySelector("dialog[open]")) start();
    }, 1800);
  }

  window.Tour = { start, stop };
})();
