/*
 * Music player: plays YouTube songs (a few Quân A.P official videos by default) and any YouTube link
 * the learner pastes (a video or a playlist). Uses the YouTube IFrame API, loaded only when the
 * player is first used. YouTube's terms require the video to stay visible while it plays, so the
 * music window (with the video) is shown whenever something is playing; closing it pauses.
 * The learner's own links are remembered in localStorage.
 */
(() => {
  "use strict";

  const card = document.getElementById("player");
  if (!card) return;

  const DEFAULTS = [
    { id: "fTXd-DpN3AI", title: "Bông Hoa Đẹp Nhất" },
    { id: "P_jk6caKnfA", title: "Ai Là Người Thương Em" },
    { id: "zHDECJy0p7k", title: "Có Ai Hẹn Hò Cùng Em Chưa" },
    { id: "LhTwcqI71n0", title: "Lời Xin Lỗi Vụng Về" },
    { id: "9i5m4RYNMMw", title: "You Are My Crush" },
    { id: "INJuqE_34eQ", title: "3 Phải 6 Đừng" },
  ].map((t) => ({ ...t, kind: "video", artist: "Quân A.P" }));

  const hasGsap = typeof window.gsap !== "undefined";
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ---------------- Saved state ---------------- */
  let mine = [];
  let index = 0;
  let shuffle = false;
  try {
    const saved = JSON.parse(localStorage.getItem("music") || "{}");
    if (Array.isArray(saved.mine)) mine = saved.mine.filter((t) => t && /^[\w-]+$/.test(t.id));
    if (Number.isInteger(saved.index)) index = saved.index;
    shuffle = !!saved.shuffle;
  } catch (e) {}
  const list = () => [...mine, ...DEFAULTS];
  const save = () => {
    try { localStorage.setItem("music", JSON.stringify({ mine, index, shuffle })); } catch (e) {}
  };
  if (index < 0 || index >= list().length) index = mine.length; // first default song

  /* ---------------- YouTube links ---------------- */
  function parseLink(text) {
    const raw = text.trim();
    if (/^[\w-]{11}$/.test(raw)) return { kind: "video", id: raw };
    let url;
    try { url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); } catch (e) { return null; }
    const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
    const listId = url.searchParams.get("list");
    let vid = null;
    if (host === "youtu.be") vid = url.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      vid = url.searchParams.get("v");
      const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
      if (!vid && m) vid = m[1];
    } else return null;
    if (vid && /^[\w-]{11}$/.test(vid)) return { kind: "video", id: vid };
    if (listId && /^[\w-]+$/.test(listId)) return { kind: "list", id: listId };
    return null;
  }

  /* ---------------- Card controls (in the panel) ---------------- */
  const playBtn = $("#playBtn", card);
  const titleEl = $("#trackTitle", card);
  const artistEl = $("#trackArtist", card);
  const coverImg = $("#coverImg", card);
  const progress = $(".progress", card);
  const fill = $("#progressFill", card);
  const shuffleBtn = $("#shuffleBtn", card);
  shuffleBtn.setAttribute("aria-pressed", String(shuffle));

  /* ---------------- Music window ---------------- */
  const win = document.createElement("section");
  win.className = "music-win";
  win.setAttribute("aria-label", "Nhạc");
  win.hidden = true;
  win.innerHTML = `
    <header class="mw-head">
      <b>Nhạc</b>
      <div class="mw-ctl">
        <button type="button" data-mw="prev" aria-label="Bài trước"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14M19 5 9 12l10 7V5Z"/></svg></button>
        <button type="button" data-mw="play" class="mw-play" aria-label="Phát" aria-pressed="false">
          <svg viewBox="0 0 24 24" class="i-play" aria-hidden="true"><path d="M7 4.5v15l12-7.5-12-7.5Z"/></svg>
          <svg viewBox="0 0 24 24" class="i-pause" aria-hidden="true"><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z"/></svg>
        </button>
        <button type="button" data-mw="next" aria-label="Bài tiếp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5v14M5 5l10 7-10 7V5Z"/></svg></button>
      </div>
      <button type="button" class="mw-x" aria-label="Đóng (dừng nhạc)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </header>
    <div class="mw-video"><div id="ytPlayer"></div></div>
    <p class="mw-msg" role="status" hidden></p>
    <form class="mw-add" novalidate>
      <input type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="Dán link YouTube (bài hát hoặc playlist)" aria-label="Link YouTube">
      <button type="submit">Thêm</button>
    </form>
    <ol class="mw-list"></ol>`;
  document.body.appendChild(win);
  const listEl = $(".mw-list", win);
  const msgEl = $(".mw-msg", win);
  const form = $(".mw-add", win);
  const input = $("input", form);
  const winPlay = $('[data-mw="play"]', win);

  function say(text) {
    msgEl.textContent = text || "";
    msgEl.hidden = !text;
  }

  function renderList() {
    const items = list();
    listEl.innerHTML = items.map((t, i) => `
      <li class="${i === index ? "on" : ""}">
        <button type="button" class="mw-song" data-i="${i}">
          <img src="https://i.ytimg.com/vi/${t.kind === "video" ? t.id : ""}/default.jpg" alt="" loading="lazy" ${t.kind === "list" ? "hidden" : ""}>
          <span class="mw-t">${esc(t.title || (t.kind === "list" ? "Playlist của bạn" : "Đang tải tên…"))}</span>
          <span class="mw-a">${esc(t.kind === "list" ? "Playlist YouTube" : t.artist || "YouTube")}</span>
        </button>
        ${i < mine.length ? `<button type="button" class="mw-del" data-del="${i}" aria-label="Xoá ${esc(t.title || "bài này")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>` : ""}
      </li>`).join("");
  }

  function showCard() {
    const t = list()[index];
    titleEl.textContent = t ? (t.title || "YouTube") : "Chưa có bài";
    artistEl.textContent = t ? (t.kind === "list" ? "Playlist YouTube" : t.artist || "YouTube") : "";
    if (t && t.kind === "video") {
      coverImg.src = `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`;
      coverImg.hidden = false;
    } else {
      coverImg.hidden = true;
    }
  }

  function openWin() {
    if (!win.hidden) return;
    win.hidden = false;
    renderList();
    if (hasGsap && !reduced()) gsap.fromTo(win, { autoAlpha: 0, y: 24, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)", clearProps: "transform,opacity,visibility" });
  }
  function closeWin() {
    if (player && ready) player.pauseVideo();
    if (hasGsap && !reduced()) gsap.to(win, { autoAlpha: 0, y: 16, duration: 0.2, onComplete: () => { win.hidden = true; gsap.set(win, { clearProps: "all" }); } });
    else win.hidden = true;
  }

  /* ---------------- YouTube player ---------------- */
  let player = null;
  let ready = false;
  let playing = false;
  let apiPromise = null;
  let pendingPlay = false;

  function loadApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => { apiPromise = null; reject(new Error("api")); };
      document.head.appendChild(s);
    });
    return apiPromise;
  }

  let playerPromise = null;
  function ensurePlayer() {
    if (playerPromise) return playerPromise;
    say("Đang mở YouTube…");
    playerPromise = loadApi().then(() => new Promise((resolve) => {
      const t = list()[index];
      player = new YT.Player("ytPlayer", {
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        // The API throws "Invalid video id" if the key is present but empty, so only add it for videos.
        ...(t && t.kind === "video" ? { videoId: t.id } : {}),
        playerVars: {
          playsinline: 1,
          rel: 0,
          origin: location.origin,
          ...(t && t.kind === "list" ? { listType: "playlist", list: t.id } : {}),
        },
        events: {
          onReady: () => { ready = true; say(""); resolve(); },
          onStateChange: onState,
          onError: onError,
        },
      });
    })).catch(() => {
      playerPromise = null;
      say("Không tải được YouTube. Kiểm tra mạng rồi thử lại.");
    });
    return playerPromise;
  }

  function cue(i, autoplay) {
    const items = list();
    if (!items.length) return;
    index = (i + items.length) % items.length;
    say("");
    save();
    showCard();
    renderList();
    resetProgress();
    if (!player || !ready) return;
    const t = items[index];
    if (t.kind === "list") {
      autoplay ? player.loadPlaylist({ list: t.id, listType: "playlist" }) : player.cuePlaylist({ list: t.id, listType: "playlist" });
    } else {
      autoplay ? player.loadVideoById(t.id) : player.cueVideoById(t.id);
    }
  }

  function play() {
    openWin();
    pendingPlay = true;
    ensurePlayer().then(() => {
      if (!pendingPlay || !player) return;
      pendingPlay = false;
      player.playVideo();
    });
  }
  function pause() {
    pendingPlay = false;
    if (player && ready) player.pauseVideo();
  }

  function step(dir) {
    const t = list()[index];
    if (t && t.kind === "list" && player && ready) {
      dir > 0 ? player.nextVideo() : player.previousVideo();
      return;
    }
    let next = index + dir;
    if (shuffle && list().length > 1) {
      do { next = Math.floor(Math.random() * list().length); } while (next === index);
    }
    const keepPlaying = playing || pendingPlay;
    cue(next, keepPlaying);
    if (keepPlaying && (!player || !ready)) play();
  }

  function onState(e) {
    const S = YT.PlayerState;
    if (e.data === S.PLAYING) setPlaying(true);
    else if (e.data === S.PAUSED || e.data === S.CUED) setPlaying(false);
    else if (e.data === S.ENDED) {
      setPlaying(false);
      step(1);
      if (player && ready) player.playVideo();
    }
    // Fill in titles of the learner's own links once YouTube tells us.
    const t = list()[index];
    const data = player.getVideoData && player.getVideoData();
    if (data && data.title && t) {
      if (t.kind === "video" && !t.title && index < mine.length) {
        mine[index].title = data.title;
        mine[index].artist = data.author || "YouTube";
        save();
        renderList();
        showCard();
      } else if (t.kind === "list") {
        titleEl.textContent = data.title;
      }
    }
  }

  function onError(e) {
    const blocked = e.data === 101 || e.data === 150 || e.data === 100;
    const t = list()[index];
    say(blocked
      ? `"${t && t.title ? t.title : "Bài này"}" không cho phát ngoài YouTube, chuyển bài tiếp…`
      : "Link YouTube không hợp lệ.");
    setPlaying(false);
    if (blocked) setTimeout(() => { cue(index + 1, true); }, 1500);
  }

  /* ---------------- Progress + spinning cover ---------------- */
  let spin = null;
  if (hasGsap) spin = gsap.to("#cover", { rotation: 360, duration: 8, ease: "none", repeat: -1, paused: true });
  let timer = null;
  function resetProgress() {
    if (hasGsap) gsap.set(fill, { scaleX: 0 });
    else fill.style.transform = "scaleX(0)";
    progress.setAttribute("aria-valuenow", "0");
  }
  function tickProgress() {
    if (!player || !ready || !player.getDuration) return;
    const d = player.getDuration() || 0;
    const p = d ? Math.min(1, player.getCurrentTime() / d) : 0;
    if (hasGsap) gsap.to(fill, { scaleX: p, duration: 0.5, ease: "none", overwrite: true });
    else fill.style.transform = `scaleX(${p})`;
    progress.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  }
  function setPlaying(on) {
    playing = on;
    [playBtn, winPlay].forEach((b) => {
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", on ? "Tạm dừng" : "Phát");
    });
    if (spin && !reduced()) on ? spin.play() : spin.pause();
    clearInterval(timer);
    if (on) timer = setInterval(tickProgress, 500);
  }
  progress.addEventListener("click", (e) => {
    if (!player || !ready) return;
    const r = progress.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    player.seekTo(p * (player.getDuration() || 0), true);
    tickProgress();
  });

  /* ---------------- Events ---------------- */
  function pop(el) {
    if (!hasGsap || reduced()) return;
    gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: "back.out(3)", overwrite: "auto" });
  }
  playBtn.addEventListener("click", () => { (playing || pendingPlay) ? pause() : play(); pop(playBtn); });
  $("#prevBtn", card).addEventListener("click", (e) => { step(-1); pop(e.currentTarget); });
  $("#nextBtn", card).addEventListener("click", (e) => { step(1); pop(e.currentTarget); });
  shuffleBtn.addEventListener("click", () => {
    shuffle = !shuffle;
    shuffleBtn.setAttribute("aria-pressed", String(shuffle));
    save();
    pop(shuffleBtn);
  });
  const toggleWin = () => (win.hidden ? openWin() : closeWin());
  $("#listBtn", card).addEventListener("click", (e) => { toggleWin(); pop(e.currentTarget); });
  $("#cover", card).addEventListener("click", toggleWin);

  $(".mw-x", win).addEventListener("click", closeWin);
  $(".mw-ctl", win).addEventListener("click", (e) => {
    const b = e.target.closest("[data-mw]");
    if (!b) return;
    if (b.dataset.mw === "play") (playing || pendingPlay) ? pause() : play();
    else step(b.dataset.mw === "next" ? 1 : -1);
    pop(b);
  });
  listEl.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      const i = Number(del.dataset.del);
      mine.splice(i, 1);
      if (index > i) index--;
      else if (index === i) { index = Math.min(index, list().length - 1); cue(index, playing); }
      save();
      renderList();
      showCard();
      return;
    }
    const song = e.target.closest("[data-i]");
    if (!song) return;
    cue(Number(song.dataset.i), true);
    play();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const link = parseLink(input.value);
    if (!link) { say("Link chưa đúng. Dán link dạng youtube.com/watch?v=… hoặc youtu.be/…"); return; }
    const dup = list().findIndex((t) => t.id === link.id);
    input.value = "";
    if (dup >= 0) { cue(dup, true); play(); say("Bài này đã có trong danh sách."); return; }
    mine.unshift({ ...link, title: "", artist: "" });
    index = 0;
    save();
    say("");
    cue(0, true);
    play();
  });

  showCard();
  resetProgress();
})();
