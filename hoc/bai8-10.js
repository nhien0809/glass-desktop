/*
 * Từ mới và Ngữ pháp bài 8–10 (dữ liệu: bai8-10-data.js).
 *  - Từ mới: danh sách theo chủ đề (che nghĩa, nghe đọc, đánh dấu đã nhớ), thẻ ghi nhớ, kiểm tra trắc nghiệm.
 *  - Ngữ pháp: mẫu câu, cách ghép, ví dụ có furigana, và bài luyện tập chọn đáp án cho từng bài.
 */
(() => {
  "use strict";
  const D = window.BAI810;
  if (!D) return;

  const store = (k, v) => {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) {}
    return null;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ruby = (s) => esc(s).replace(/\{([^|}]+)\|([^}]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>");
  const plain = (s) => s.replace(/\{([^|}]+)\|([^}]+)\}/g, "$2"); // kana only, for speaking
  const shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const LESSONS = ["8", "9", "10"]; // ngữ pháp
  const VLESSONS = ["8", "9", "10", "11"]; // từ mới

  /* ---------- Reading words aloud (Japanese voice of the browser) ---------- */
  const canSpeak = "speechSynthesis" in window;
  let voice = null;
  const pickVoice = () => {
    const v = speechSynthesis.getVoices().filter((x) => /^ja(-|_|$)/i.test(x.lang));
    voice = v.find((x) => /google|kyoko|nanami|haruka|ayumi/i.test(x.name)) || v[0] || null;
  };
  if (canSpeak) {
    pickVoice();
    speechSynthesis.addEventListener("voiceschanged", pickVoice);
  }
  function say(text) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[～〜（）()]/g, " "));
    u.lang = "ja-JP";
    if (voice) u.voice = voice;
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }
  const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  const spkBtn = (text, label) => (canSpeak ? `<button type="button" class="vc-say" data-say="${esc(text)}" aria-label="Nghe ${esc(label)}">${SPK}</button>` : "");

  /* ================================================================
     Từ mới
     ================================================================ */
  const words = [];
  D.vocab.forEach((g) => g.w.forEach((w) => words.push({
    l: g.l, topic: g.t, topicVi: g.vi,
    jp: w[0], kana: w[1] || "", vi: w[2], dict: w[3] || "", ex: w[4] || null,
    id: `${g.l}|${g.t}|${w[0]}`,
  })));
  const readOf = (w) => (w.kana || w.jp);

  let known = new Set();
  try { known = new Set(JSON.parse(store("vocab-known") || "[]")); } catch (e) {}
  const saveKnown = () => store("vocab-known", JSON.stringify([...known]));

  const view = document.getElementById("view-tu");
  const out = document.getElementById("tu-out");
  const lf = document.getElementById("tu-lesson");
  const mf = document.getElementById("tu-mode");
  const hideBtn = document.getElementById("tu-hide");
  const onlyBtn = document.getElementById("tu-only");
  const dirBtn = document.getElementById("tu-dir");

  let lesson = store("vl");
  if (!VLESSONS.includes(lesson) && lesson !== "all") lesson = "8";
  let mode = store("vm") || "list";
  let hideMeaning = store("vh") === "1";
  let onlyNew = store("vo") === "1";
  let jpFirst = store("vd") !== "vi"; // Nhật → Việt

  const pool = () => words.filter((w) => (lesson === "all" || w.l === lesson) && (!onlyNew || !known.has(w.id)));

  function chips(box, opts, cur) {
    box.innerHTML = opts.map(([v, t]) => `<button class="chip" data-v="${v}" aria-pressed="${v === cur}">${t}</button>`).join("");
  }
  const count = (l) => words.filter((w) => l === "all" || w.l === l).length;
  function paintFilters() {
    chips(lf, [["all", `Tất cả (${count("all")})`], ...VLESSONS.map((l) => [l, `Bài ${l} (${count(l)})`])], lesson);
    chips(mf, [["list", "Danh sách"], ["card", "Thẻ ghi nhớ"], ["quiz", "Kiểm tra"]], mode);
    hideBtn.setAttribute("aria-pressed", hideMeaning);
    hideBtn.hidden = mode !== "list";
    onlyBtn.setAttribute("aria-pressed", onlyNew);
    dirBtn.textContent = jpFirst ? "Nhật → Việt" : "Việt → Nhật";
    dirBtn.hidden = mode === "list";
  }

  /* ----- List ----- */
  function wordTile(w) {
    const isKnown = known.has(w.id);
    return `<div class="vc${isKnown ? " known" : ""}" data-id="${esc(w.id)}">
      <div class="vc-top">
        <div class="vc-w" lang="ja">${esc(w.jp)}</div>
        ${spkBtn(readOf(w), w.jp)}
      </div>
      ${w.kana ? `<div class="vc-k" lang="ja">${esc(w.kana)}</div>` : ""}
      <div class="vc-m">${esc(w.vi)}</div>
      ${w.dict ? `<div class="vc-d"><span>Thể từ điển</span> <b lang="ja">${esc(w.dict.split(" · ")[0])}</b> · ${esc(w.dict.split(" · ")[1] || "")}</div>` : ""}
      ${w.ex ? `<div class="vc-ex"><span lang="ja">${ruby(w.ex[0])}</span><small>${esc(w.ex[1])}</small></div>` : ""}
      <button type="button" class="vc-know" aria-pressed="${isKnown}">${isKnown ? "Đã nhớ ✓" : "Đánh dấu đã nhớ"}</button>
    </div>`;
  }
  function renderList() {
    const list = pool();
    if (!list.length) { out.innerHTML = '<p class="vc-empty">Bạn đã nhớ hết từ ở đây rồi! Tắt “Chỉ từ chưa nhớ” để xem lại.</p>'; return; }
    let html = "";
    let curL = "", curT = "";
    list.forEach((w) => {
      if (w.l !== curL) {
        if (curL) html += "</div>";
        curL = w.l; curT = "";
        const all = words.filter((x) => x.l === w.l);
        const k = all.filter((x) => known.has(x.id)).length;
        html += `<div class="lesson-h" data-l="${w.l}"><h2>Bài ${w.l}</h2><span class="count">Đã nhớ ${k}/${all.length} từ</span></div><div>`;
      }
      if (w.topic !== curT) {
        if (curT) html += "</div>";
        curT = w.topic;
        html += `<h3 class="vt"><span lang="ja">${esc(w.topic)}</span> <small>${esc(w.topicVi)}</small></h3><div class="vgrid">`;
      }
      html += wordTile(w);
    });
    html += "</div></div>";
    out.innerHTML = html;
    view.classList.toggle("vhide", hideMeaning);
  }

  /* ----- Flashcards ----- */
  let deck = [];
  let at = 0;
  let flipped = false;
  function newDeck() { deck = shuffle(pool()); at = 0; flipped = false; }
  function renderCard() {
    if (!deck.length) { out.innerHTML = '<p class="vc-empty">Không còn từ nào. Tắt “Chỉ từ chưa nhớ” hoặc chọn bài khác.</p>'; return; }
    if (at >= deck.length) {
      const k = deck.filter((w) => known.has(w.id)).length;
      out.innerHTML = `<div class="fc-done"><p class="fc-big">Xong ${deck.length} thẻ!</p><p>Đã nhớ ${k}/${deck.length} từ.</p>
        <div class="fc-ctl"><button type="button" class="act" data-fc="again">Học lại từ đầu</button>
        ${k < deck.length ? '<button type="button" class="act" data-fc="weak">Chỉ học từ chưa nhớ</button>' : ""}</div></div>`;
      return;
    }
    const w = deck[at];
    const front = jpFirst
      ? `<div class="fc-w" lang="ja">${esc(w.jp)}</div>`
      : `<div class="fc-m">${esc(w.vi)}</div>`;
    const back = `<div class="fc-w" lang="ja">${esc(w.jp)}</div>
      ${w.kana ? `<div class="fc-k" lang="ja">${esc(w.kana)}</div>` : ""}
      <div class="fc-m">${esc(w.vi)}</div>
      ${w.dict ? `<div class="vc-d"><span>Thể từ điển</span> <b lang="ja">${esc(w.dict.split(" · ")[0])}</b> · ${esc(w.dict.split(" · ")[1] || "")}</div>` : ""}
      ${w.ex ? `<div class="vc-ex"><span lang="ja">${ruby(w.ex[0])}</span><small>${esc(w.ex[1])}</small></div>` : ""}`;
    out.innerHTML = `<div class="fc-wrap">
      <div class="fc-meta"><span>Thẻ ${at + 1} / ${deck.length}</span><span lang="ja">${esc(w.topic)} · Bài ${w.l}</span></div>
      <div class="fc-bar"><i style="width:${(at / deck.length) * 100}%"></i></div>
      <button type="button" class="fc${flipped ? " flipped" : ""}${known.has(w.id) ? " known" : ""}" aria-label="Lật thẻ">
        <span class="fc-face">${flipped ? back : front}</span>
        <span class="fc-tip">${flipped ? "" : "Bấm để lật thẻ (phím cách)"}</span>
      </button>
      <div class="fc-ctl">
        <button type="button" class="act" data-fc="prev" ${at ? "" : "disabled"}>← Trước</button>
        ${spkBtn(readOf(w), w.jp)}
        <button type="button" class="act fc-no" data-fc="no">Chưa nhớ</button>
        <button type="button" class="act fc-yes" data-fc="yes">Đã nhớ ✓</button>
      </div>
      <p class="fc-help">Phím: cách = lật · → = đã nhớ · ← = thẻ trước · ↓ = chưa nhớ</p>
    </div>`;
    if (flipped && window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(out.querySelector(".fc"), { rotationY: -90 }, { rotationY: 0, duration: 0.35, ease: "power2.out" });
    }
  }
  function fcAnswer(ok) {
    const w = deck[at];
    if (!w) return;
    if (ok) known.add(w.id); else known.delete(w.id);
    saveKnown();
    at++; flipped = false; renderCard();
  }

  /* ----- Quiz ----- */
  let quiz = null;
  function newQuiz() {
    const list = shuffle(pool()).slice(0, 10);
    quiz = { qs: list.map((w) => {
      // Wrong choices: other words from the same lesson with a different meaning (and a different spelling).
      const others = shuffle(words.filter((x) => x.l === w.l && x.vi !== w.vi && x.jp !== w.jp)).slice(0, 3);
      return { w, opts: shuffle([w, ...others]) };
    }), i: 0, score: 0, picked: null, wrong: [] };
  }
  function renderQuiz() {
    if (!quiz || !quiz.qs.length) { out.innerHTML = '<p class="vc-empty">Không còn từ nào để kiểm tra. Tắt “Chỉ từ chưa nhớ” hoặc chọn bài khác.</p>'; return; }
    if (quiz.i >= quiz.qs.length) {
      const n = quiz.qs.length;
      out.innerHTML = `<div class="fc-done"><p class="fc-big">${quiz.score}/${n} câu đúng</p>
        <p>${quiz.score === n ? "Xuất sắc! 🎉" : quiz.score >= n * 0.7 ? "Tốt lắm, ôn thêm vài từ nữa nhé." : "Ôn lại các từ dưới đây rồi làm lại nhé."}</p>
        ${quiz.wrong.length ? `<div class="vgrid qz-wrong">${quiz.wrong.map(wordTile).join("")}</div>` : ""}
        <div class="fc-ctl"><button type="button" class="act" data-qz="again">Làm 10 câu khác</button></div></div>`;
      return;
    }
    const q = quiz.qs[quiz.i];
    const ask = jpFirst
      ? `<div class="fc-w" lang="ja">${esc(q.w.jp)}</div>${q.w.kana ? `<div class="fc-k" lang="ja">${esc(q.w.kana)}</div>` : ""}<p class="qz-ask">Nghĩa là gì?</p>`
      : `<div class="fc-m">${esc(q.w.vi)}</div><p class="qz-ask">Tiếng Nhật là gì?</p>`;
    out.innerHTML = `<div class="fc-wrap">
      <div class="fc-meta"><span>Câu ${quiz.i + 1} / ${quiz.qs.length}</span><span>Đúng ${quiz.score}</span></div>
      <div class="fc-bar"><i style="width:${(quiz.i / quiz.qs.length) * 100}%"></i></div>
      <div class="qz-card">${ask}</div>
      <div class="qz-opts">${q.opts.map((o, k) => {
        let cls = "";
        if (quiz.picked !== null) cls = o === q.w ? " right" : k === quiz.picked ? " wrong" : "";
        return `<button type="button" class="qz-opt${cls}" data-k="${k}" ${quiz.picked !== null ? "disabled" : ""}${jpFirst ? "" : ' lang="ja"'}><b>${k + 1}</b>${esc(jpFirst ? o.vi : o.jp)}</button>`;
      }).join("")}</div>
      ${quiz.picked !== null ? `<div class="fc-ctl">${spkBtn(readOf(q.w), q.w.jp)}<button type="button" class="act fc-yes" data-qz="next">${quiz.i + 1 < quiz.qs.length ? "Câu tiếp →" : "Xem kết quả"}</button></div>` : '<p class="fc-help">Phím 1–4 để chọn</p>'}
    </div>`;
    if (quiz.picked !== null) out.querySelector('[data-qz="next"]').focus();
  }
  function qzPick(k) {
    const q = quiz.qs[quiz.i];
    if (quiz.picked !== null || !q.opts[k]) return;
    quiz.picked = k;
    if (q.opts[k] === q.w) quiz.score++; else quiz.wrong.push(q.w);
    renderQuiz();
  }

  function renderTu() {
    paintFilters();
    view.classList.toggle("vhide", mode === "list" && hideMeaning);
    if (mode === "card") renderCard();
    else if (mode === "quiz") renderQuiz();
    else renderList();
  }
  function restart() {
    if (mode === "card") newDeck();
    if (mode === "quiz") newQuiz();
    renderTu();
  }

  lf.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    lesson = b.dataset.v; store("vl", lesson); restart();
  });
  mf.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    mode = b.dataset.v; store("vm", mode); restart();
  });
  hideBtn.addEventListener("click", () => { hideMeaning = !hideMeaning; store("vh", hideMeaning ? "1" : "0"); renderTu(); });
  onlyBtn.addEventListener("click", () => { onlyNew = !onlyNew; store("vo", onlyNew ? "1" : "0"); restart(); });
  dirBtn.addEventListener("click", () => { jpFirst = !jpFirst; store("vd", jpFirst ? "jp" : "vi"); restart(); });

  out.addEventListener("click", (e) => {
    const s = e.target.closest("[data-say]");
    if (s) { say(s.dataset.say); return; }
    const kb = e.target.closest(".vc-know");
    if (kb) {
      const id = kb.closest(".vc").dataset.id;
      if (known.has(id)) known.delete(id); else known.add(id);
      saveKnown();
      // Update just this tile and its lesson count (a full redraw would replay the entrance animation).
      const on = known.has(id);
      kb.closest(".vc").classList.toggle("known", on);
      kb.setAttribute("aria-pressed", on);
      kb.textContent = on ? "Đã nhớ ✓" : "Đánh dấu đã nhớ";
      const l = id.split("|")[0];
      const all = words.filter((x) => x.l === l);
      out.querySelectorAll(`.lesson-h[data-l="${l}"] .count`).forEach((c) => {
        c.textContent = `Đã nhớ ${all.filter((x) => known.has(x.id)).length}/${all.length} từ`;
      });
      return;
    }
    const vc = e.target.closest(".vc");
    if (vc && mode === "list" && hideMeaning) { vc.classList.toggle("open"); return; }
    if (e.target.closest(".fc")) { flipped = !flipped; renderCard(); if (flipped) say(readOf(deck[at])); return; }
    const f = e.target.closest("[data-fc]");
    if (f) {
      const a = f.dataset.fc;
      if (a === "yes") fcAnswer(true);
      else if (a === "no") fcAnswer(false);
      else if (a === "prev" && at > 0) { at--; flipped = false; renderCard(); }
      else if (a === "again") { at = 0; deck = shuffle(deck); flipped = false; renderCard(); }
      else if (a === "weak") { deck = shuffle(deck.filter((w) => !known.has(w.id))); at = 0; flipped = false; renderCard(); }
      return;
    }
    const o = e.target.closest(".qz-opt");
    if (o) { qzPick(+o.dataset.k); return; }
    const q = e.target.closest("[data-qz]");
    if (q) {
      if (q.dataset.qz === "next") { quiz.i++; quiz.picked = null; renderQuiz(); }
      else { newQuiz(); renderQuiz(); }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (view.hidden || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable], .tour, .sp-card, .music-win")) return;
    if (mode === "card" && deck[at]) {
      if (e.key === " " || e.key === "Enter") { if (e.target.closest("button:not(.fc)")) return; e.preventDefault(); flipped = !flipped; renderCard(); if (flipped) say(readOf(deck[at])); }
      else if (e.key === "ArrowRight") { e.preventDefault(); fcAnswer(true); }
      else if (e.key === "ArrowDown") { e.preventDefault(); fcAnswer(false); }
      else if (e.key === "ArrowLeft" && at > 0) { e.preventDefault(); at--; flipped = false; renderCard(); }
    } else if (mode === "quiz" && quiz && quiz.i < quiz.qs.length) {
      if (/^[1-4]$/.test(e.key) && quiz.picked === null) { e.preventDefault(); qzPick(+e.key - 1); }
    }
  });

  if (mode === "card") newDeck();
  if (mode === "quiz") newQuiz();
  renderTu();

  /* ================================================================
     Ngữ pháp
     ================================================================ */
  const gOut = document.getElementById("np-out");
  const gf = document.getElementById("np-lesson");
  let gl = store("gl");
  if (!LESSONS.includes(gl) && gl !== "all") gl = gl === "11" ? "all" : "8";

  function gCard(g, n) {
    let body = `<p class="gp-m">${esc(g.m)}</p>`;
    if (g.how) body += `<div class="gp-how">${g.how.split(" · ").map((s) => `<span>${esc(s)}</span>`).join("")}</div>`;
    if (g.table) {
      body += `<table class="gp-table"><tbody>${g.table.map((r) => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td><td lang="ja">${r[2].split(" · ").map(esc).join("<br>")}</td></tr>`).join("")}</tbody></table>`;
    }
    if (g.ex) {
      body += `<ul class="gp-ex">${g.ex.map((x) => `<li><div class="gp-jp"><span lang="ja">${ruby(x[0])}</span>${spkBtn(plain(x[0]).replace(/[AB]：/g, ""), "câu ví dụ")}</div><div class="gp-vi">${esc(x[1])}</div></li>`).join("")}</ul>`;
    }
    if (g.note) body += `<p class="gp-note"><b>Chú ý</b> <span lang="ja">${esc(g.note)}</span></p>`;
    return `<article class="gp"><div class="gp-h"><span class="gp-n">${n}</span><h3 lang="ja">${esc(g.p)}</h3></div>${body}</article>`;
  }
  function practice(l) {
    const qs = D.practice[l] || [];
    return `<section class="pr" data-l="${l}">
      <div class="pr-h"><h3>Luyện tập bài ${l}</h3><span class="pr-score" aria-live="polite">0/${qs.length}</span>
        <button type="button" class="act" data-pr="reset">Làm lại</button></div>
      <ol class="pr-list">${qs.map((q, i) => {
        // Shuffle the choices once per render; remember which one is right.
        const order = shuffle(q[1].map((_, k) => k));
        return `<li class="pr-q" data-a="${order.indexOf(q[2])}">
          <div class="pr-s" lang="ja">${ruby(q[0]).replace("___", '<span class="pr-gap">？</span>')}</div>
          <div class="pr-opts">${order.map((k, j) => `<button type="button" class="pr-opt" data-j="${j}" lang="ja">${ruby(q[1][k])}</button>`).join("")}</div>
          <p class="pr-why" hidden></p>
        </li>`;
      }).join("")}</ol></section>`;
  }
  function renderNp() {
    chips(gf, [["all", "Tất cả"], ...LESSONS.map((l) => [l, `Bài ${l}`])], gl);
    let html = "";
    LESSONS.forEach((l) => {
      if (gl !== "all" && gl !== l) return;
      const gs = D.grammar.filter((g) => g.l === l);
      let n = 0;
      html += `<div class="lesson-h"><h2>Bài ${l}</h2><span class="count">${gs.filter((g) => !g.table).length} mẫu câu</span></div>
        <div class="gp-list">${gs.map((g) => gCard(g, g.table ? "★" : ++n)).join("")}</div>${practice(l)}`;
    });
    gOut.innerHTML = html;
  }
  gf.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    gl = b.dataset.v; store("gl", gl); renderNp();
  });
  gOut.addEventListener("click", (e) => {
    const s = e.target.closest("[data-say]");
    if (s) { say(s.dataset.say); return; }
    const r = e.target.closest('[data-pr="reset"]');
    if (r) {
      const l = r.closest(".pr").dataset.l;
      r.closest(".pr").outerHTML = practice(l);
      return;
    }
    const o = e.target.closest(".pr-opt");
    if (!o) return;
    const li = o.closest(".pr-q");
    if (li.classList.contains("done")) return;
    const right = +li.dataset.a;
    const j = +o.dataset.j;
    const sec = li.closest(".pr");
    const q = D.practice[sec.dataset.l][[...li.parentNode.children].indexOf(li)];
    li.classList.add("done", j === right ? "ok" : "ng");
    li.querySelectorAll(".pr-opt").forEach((b, k) => {
      b.disabled = true;
      if (k === right) b.classList.add("right");
      else if (k === j) b.classList.add("wrong");
    });
    const gap = li.querySelector(".pr-gap");
    gap.innerHTML = li.querySelectorAll(".pr-opt")[right].innerHTML;
    const why = li.querySelector(".pr-why");
    why.hidden = false;
    why.innerHTML = `${j === right ? "✓ Đúng." : "✗ Chưa đúng."} <span lang="ja">${esc(q[3])}</span>`;
    const done = sec.querySelectorAll(".pr-q.done").length;
    const ok = sec.querySelectorAll(".pr-q.ok").length;
    const total = sec.querySelectorAll(".pr-q").length;
    sec.querySelector(".pr-score").textContent = done === total ? `${ok}/${total} câu đúng${ok === total ? " 🎉" : ""}` : `${ok}/${total}`;
  });
  renderNp();
})();
