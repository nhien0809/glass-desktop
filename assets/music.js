/*
 * Music player: plays audio files the learner picks from their own device (MP3, M4A, OGG, WAV…).
 * The files are kept in this browser only (IndexedDB) – nothing is uploaded – so the songs are
 * still there next time. No video, no window to keep open, no ads: just the player card.
 * What is playing (song + second) is kept in sessionStorage so the music carries on when the
 * learner moves between the home page and the study pages. Pages without the #player card get a
 * small round button that opens the song list.
 * Name files "Ca sĩ - Tên bài.mp3" to get the artist line filled in.
 */
(() => {
  "use strict";

  const card = document.getElementById("player");
  const hasGsap = typeof window.gsap !== "undefined";
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ---------------- Saved state ---------------- */
  let songs = []; // { id, title, artist, blob }
  let index = 0;
  let shuffle = false;
  try {
    const saved = JSON.parse(localStorage.getItem("music2") || "{}");
    if (Number.isInteger(saved.index)) index = saved.index;
    shuffle = !!saved.shuffle;
  } catch (e) {}
  const save = () => {
    try { localStorage.setItem("music2", JSON.stringify({ index, shuffle })); } catch (e) {}
  };
  let now = null;
  try { now = JSON.parse(sessionStorage.getItem("musicNow") || "null"); } catch (e) {}
  const saveNow = (on) => {
    try { sessionStorage.setItem("musicNow", JSON.stringify({ on, time: audio.currentTime || 0 })); } catch (e) {}
  };

  /* ---------------- Library (IndexedDB) ---------------- */
  let dbPromise = null;
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open("nihongo-music", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("songs", { keyPath: "id", autoIncrement: true });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  const tx = (mode, run) => db().then((d) => new Promise((resolve, reject) => {
    const t = d.transaction("songs", mode);
    const req = run(t.objectStore("songs"));
    t.oncomplete = () => resolve(req && req.result);
    t.onerror = t.onabort = () => reject(t.error);
  }));

  // "Hà Anh Tuấn - Tháng Tư Là Lời Nói Dối Của Em.mp3" -> artist + title
  function nameParts(fileName) {
    const base = fileName.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/_/g, " ").trim();
    const m = base.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    return m ? { artist: m[1].trim(), title: m[2].trim() } : { artist: "", title: base };
  }

  /* ---------------- Card controls (in the panel) ---------------- */
  const inCard = (s) => (card ? $(s, card) : null);
  const playBtn = inCard("#playBtn");
  const titleEl = inCard("#trackTitle");
  const artistEl = inCard("#trackArtist");
  const coverImg = inCard("#coverImg");
  const progress = inCard(".progress");
  const fill = inCard("#progressFill");
  const shuffleBtn = inCard("#shuffleBtn");
  if (shuffleBtn) shuffleBtn.setAttribute("aria-pressed", String(shuffle));
  if (coverImg) coverImg.hidden = true;

  /* ---------------- Song list window ---------------- */
  const win = document.createElement("section");
  win.className = "music-win";
  win.setAttribute("aria-label", "Nhạc");
  win.hidden = true;
  win.innerHTML = `
    <header class="mw-head">
      <b class="mw-title">Nhạc</b>
      <div class="mw-ctl">
        <button type="button" data-mw="prev" aria-label="Bài trước"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14M19 5 9 12l10 7V5Z"/></svg></button>
        <button type="button" data-mw="play" class="mw-play" aria-label="Phát" aria-pressed="false">
          <svg viewBox="0 0 24 24" class="i-play" aria-hidden="true"><path d="M7 4.5v15l12-7.5-12-7.5Z"/></svg>
          <svg viewBox="0 0 24 24" class="i-pause" aria-hidden="true"><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/></svg>
        </button>
        <button type="button" data-mw="next" aria-label="Bài tiếp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14M5 5l10 7-10 7V5Z"/></svg></button>
      </div>
      <button type="button" class="mw-x" aria-label="Đóng danh sách" title="Đóng (nhạc vẫn phát)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </header>
    <label class="mw-pick">
      <input type="file" accept="audio/*,.mp3,.m4a,.aac,.ogg,.opus,.wav,.flac" multiple>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      <span>Thêm nhạc từ máy</span>
    </label>
    <p class="mw-msg" role="status" hidden></p>
    <ol class="mw-list"></ol>`;
  document.body.appendChild(win);
  const listEl = $(".mw-list", win);
  const msgEl = $(".mw-msg", win);
  const picker = $('input[type="file"]', win);
  const winPlay = $('[data-mw="play"]', win);

  let fab = null;
  if (!card) {
    fab = document.createElement("button");
    fab.type = "button";
    fab.className = "music-fab";
    fab.setAttribute("aria-label", "Mở nhạc");
    fab.title = "Nhạc";
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>';
    document.body.appendChild(fab);
  }

  const EMPTY = "Chưa có bài nào. Bấm “Thêm nhạc từ máy” rồi chọn file MP3 của bạn (đặt tên “Ca sĩ - Tên bài” để hiện tên ca sĩ).";
  function say(text) {
    msgEl.textContent = text || "";
    msgEl.hidden = !text;
  }

  function renderList() {
    listEl.innerHTML = songs.map((t, i) => `
      <li class="${i === index ? "on" : ""}">
        <button type="button" class="mw-song no-thumb" data-i="${i}">
          <span class="mw-t">${esc(t.title)}</span>
          <span class="mw-a">${esc(t.artist || "Nhạc của bạn")}</span>
        </button>
        <button type="button" class="mw-del" data-del="${i}" aria-label="Xoá ${esc(t.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </li>`).join("");
    say(songs.length ? "" : EMPTY);
  }

  function showCard() {
    const t = songs[index];
    if (card) {
      titleEl.textContent = t ? t.title : "Chưa có nhạc";
      artistEl.textContent = t ? (t.artist || "Nhạc của bạn") : "Bấm ≡+ để thêm nhạc từ máy";
    }
    if (t && "mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist || "" });
    }
  }

  function openWin() {
    if (!win.hidden) return;
    win.hidden = false;
    if (fab) fab.hidden = true;
    renderList();
    if (hasGsap && !reduced()) gsap.fromTo(win, { autoAlpha: 0, y: 24, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)", clearProps: "transform,opacity,visibility" });
  }
  function closeWin() {
    win.hidden = true;
    if (hasGsap) { gsap.killTweensOf(win); gsap.set(win, { clearProps: "all" }); }
    if (fab) fab.hidden = false;
  }

  /* ---------------- Audio ---------------- */
  const audio = new Audio();
  audio.preload = "metadata";
  let url = null;
  let loaded = -1; // id of the song currently in the <audio>
  let playing = false;

  function load(i, autoplay, time) {
    if (!songs.length) return;
    index = (i + songs.length) % songs.length;
    save();
    showCard();
    if (!win.hidden) renderList();
    const t = songs[index];
    if (loaded !== t.id) {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(t.blob);
      audio.src = url;
      loaded = t.id;
      resetProgress();
      if (time > 1) audio.addEventListener("loadedmetadata", () => { audio.currentTime = time; }, { once: true });
    }
    if (autoplay) audio.play().catch(() => { setPlaying(false); });
  }

  function play() {
    if (!songs.length) { openWin(); return; }
    load(index, true);
  }
  function pause() {
    audio.pause();
    saveNow(false);
  }
  const toggle = () => (playing ? pause() : play());

  function step(dir, forcePlay) {
    if (!songs.length) { openWin(); return; }
    let next = index + dir;
    if (shuffle && songs.length > 1) {
      do { next = Math.floor(Math.random() * songs.length); } while (next === index);
    }
    load(next, playing || forcePlay);
  }

  /* ---------------- Progress + spinning cover ---------------- */
  let spin = null;
  if (hasGsap && card) spin = gsap.to("#cover", { rotation: 360, duration: 8, ease: "none", repeat: -1, paused: true });
  function setFill(p) {
    if (!card) return;
    if (hasGsap) gsap.set(fill, { scaleX: p });
    else fill.style.transform = `scaleX(${p})`;
    progress.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  }
  const resetProgress = () => setFill(0);
  function setPlaying(on) {
    playing = on;
    [playBtn, winPlay].filter(Boolean).forEach((b) => {
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", on ? "Tạm dừng" : "Phát");
    });
    if (spin && !reduced()) on ? spin.play() : spin.pause();
  }
  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("ended", () => { setPlaying(false); step(1, true); });
  audio.addEventListener("error", () => {
    if (loaded < 0) return;
    setPlaying(false);
    openWin();
    say("Trình duyệt không phát được file này. Thử file MP3 hoặc M4A nhé.");
  });
  let lastSaved = 0;
  audio.addEventListener("timeupdate", () => {
    const d = audio.duration || 0;
    setFill(d ? Math.min(1, audio.currentTime / d) : 0);
    if (playing && Date.now() - lastSaved > 1000) { lastSaved = Date.now(); saveNow(true); }
  });
  if (progress) progress.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const r = progress.getBoundingClientRect();
    audio.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * audio.duration;
  });
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("previoustrack", () => step(-1, true));
      navigator.mediaSession.setActionHandler("nexttrack", () => step(1, true));
    } catch (e) {}
  }

  /* ---------------- Adding / removing songs ---------------- */
  async function addFiles(files) {
    const picked = [...files].filter((f) => /^audio\//.test(f.type) || /\.(mp3|m4a|aac|ogg|opus|wav|flac)$/i.test(f.name));
    if (!picked.length) { say("Hãy chọn file nhạc (MP3, M4A, OGG, WAV…)."); return; }
    const first = songs.length;
    let failed = false;
    try {
      for (const f of picked) {
        const item = { ...nameParts(f.name), blob: f };
        item.id = await tx("readwrite", (s) => s.add(item));
        songs.push(item);
      }
    } catch (e) {
      failed = true;
    }
    renderList();
    if (failed) say("Không lưu được nhạc vào trình duyệt (hết chỗ trống hoặc đang ở chế độ ẩn danh).");
    if (songs.length > first && !playing) load(first, true);
    else showCard();
  }
  picker.addEventListener("change", () => { addFiles(picker.files); picker.value = ""; });

  function remove(i) {
    const t = songs[i];
    if (!t) return;
    tx("readwrite", (s) => s.delete(t.id)).catch(() => {});
    songs.splice(i, 1);
    if (index > i) index--;
    index = Math.max(0, Math.min(index, songs.length - 1));
    if (t.id === loaded) {
      const was = playing;
      loaded = -1;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      resetProgress();
      if (songs.length) load(index, was);
    }
    save();
    renderList();
    showCard();
  }

  /* ---------------- Events ---------------- */
  function pop(el) {
    if (!hasGsap || reduced()) return;
    gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: "back.out(3)", overwrite: "auto" });
  }
  const toggleWin = () => (win.hidden ? openWin() : closeWin());
  if (card) {
    playBtn.addEventListener("click", () => { toggle(); pop(playBtn); });
    $("#prevBtn", card).addEventListener("click", (e) => { step(-1); pop(e.currentTarget); });
    $("#nextBtn", card).addEventListener("click", (e) => { step(1); pop(e.currentTarget); });
    shuffleBtn.addEventListener("click", () => {
      shuffle = !shuffle;
      shuffleBtn.setAttribute("aria-pressed", String(shuffle));
      save();
      pop(shuffleBtn);
    });
    $("#listBtn", card).addEventListener("click", (e) => { toggleWin(); pop(e.currentTarget); });
    $("#cover", card).addEventListener("click", toggleWin);
  }
  if (fab) fab.addEventListener("click", openWin);
  $(".mw-x", win).addEventListener("click", closeWin);
  $(".mw-ctl", win).addEventListener("click", (e) => {
    const b = e.target.closest("[data-mw]");
    if (!b) return;
    if (b.dataset.mw === "play") toggle();
    else step(b.dataset.mw === "next" ? 1 : -1);
    pop(b);
  });
  listEl.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) { remove(Number(del.dataset.del)); return; }
    const song = e.target.closest("[data-i]");
    if (song) load(Number(song.dataset.i), true);
  });

  window.addEventListener("pagehide", () => { if (playing) saveNow(true); });

  // Speaking practice needs quiet: pause while it is open, carry on afterwards.
  let heldForSpeak = false;
  document.addEventListener("speak:open", () => {
    heldForSpeak = playing;
    if (heldForSpeak) audio.pause();
  });
  document.addEventListener("speak:close", () => {
    if (heldForSpeak) play();
    heldForSpeak = false;
  });

  /* ---------------- Start ---------------- */
  showCard();
  resetProgress();
  tx("readonly", (s) => s.getAll()).then((all) => {
    songs = (all || []).filter((t) => t && t.blob);
    if (index < 0 || index >= songs.length) index = 0;
    showCard();
    if (!songs.length) return;
    // Music was playing on the page we came from: carry on from the same second.
    load(index, !!(now && now.on), now ? now.time : 0);
  }).catch(() => { showCard(); });
})();
