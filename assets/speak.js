/*
 * Speaking practice ("Luyện nói").
 * A character asks a JPD133 question (lessons 8–11) out loud, the learner records an answer,
 * hears it back, and (where the browser can transcribe Japanese) gets a quick check against key words.
 * Runs entirely in the browser: speechSynthesis + MediaRecorder + SpeechRecognition. Nothing is uploaded or stored.
 *
 * API: window.Speak.open({ name, avatar, pitch })   – avatar is HTML (an <img> or <svg>)
 * Any element with [data-speak] opens it too ([data-speak="hero"] uses the hero picture).
 */
(() => {
  "use strict";

  /* ---------------- Questions ----------------
   * q: question, "{漢字|かな}" marks furigana. vi: meaning. hint: answer pattern.
   * kw: key-word groups; each group is a list of accepted spellings and needs one match.
   * a: sample answer.
   */
  const QUESTIONS = [
    { l: 8, q: "ご{家族|かぞく}は {何人|なんにん}ですか。", vi: "Gia đình bạn có mấy người?",
      hint: "～{人|にん}です。", kw: [["人", "にん"]],
      a: "{四人|よにん}です。{父|ちち}と {母|はは}と {兄|あに}と わたしです。" },
    { l: 8, q: "お{母|かあ}さんは どんな {人|ひと}ですか。", vi: "Mẹ bạn là người như thế nào?",
      hint: "{母|はは}は ～くて、～{人|ひと}です。",
      kw: [["優しい", "やさしい", "優しく", "やさしく", "明るい", "あかるい", "明るく", "あかるく", "きれい", "綺麗", "面白い", "おもしろい", "元気", "げんき", "親切", "しんせつ"]],
      a: "{母|はは}は やさしくて、{明|あか}るい {人|ひと}です。" },
    { l: 8, q: "あなたの {大切|たいせつ}な {人|ひと}は だれですか。", vi: "Người quan trọng của bạn là ai?",
      hint: "わたしの {大切|たいせつ}な {人|ひと}は ～です。",
      kw: [["父", "母", "兄", "姉", "弟", "妹", "祖母", "祖父", "友達", "友だち", "ともだち", "家族", "かぞく", "先生", "せんせい", "ちち", "はは", "あに", "あね", "おとうと", "いもうと", "そぼ", "そふ", "お母さん", "お父さん", "おかあさん", "おとうさん"]],
      a: "わたしの {大切|たいせつ}な {人|ひと}は {祖母|そぼ}です。" },
    { l: 8, q: "お{父|とう}さんは せが {高|たか}いですか。", vi: "Bố bạn có cao không?",
      hint: "はい、{高|たか}いです。/ いいえ、{高|たか}くないです。",
      kw: [["高い", "たかい", "高く", "たかく", "低い", "ひくい"]],
      a: "いいえ、あまり {高|たか}くないです。" },
    { l: 9, q: "{趣味|しゅみ}は {何|なん}ですか。", vi: "Sở thích của bạn là gì?",
      hint: "{趣味|しゅみ}は ～ことです。", kw: [["こと", "事"]],
      a: "{趣味|しゅみ}は {音楽|おんがく}を {聞|き}く ことです。" },
    { l: 9, q: "どんな {音楽|おんがく}が {好|す}きですか。", vi: "Bạn thích loại nhạc nào?",
      hint: "～が {好|す}きです。", kw: [["好き", "すき"]],
      a: "J-POPが {好|す}きです。" },
    { l: 9, q: "{休|やす}みの {日|ひ}は {何|なに}を しますか。", vi: "Ngày nghỉ bạn làm gì?",
      hint: "～を します / ～ます。", kw: [["ます"]],
      a: "{友|とも}だちと {映画|えいが}を {見|み}ます。" },
    { l: 9, q: "スポーツが {好|す}きですか。", vi: "Bạn có thích thể thao không?",
      hint: "はい、{好|す}きです。/ いいえ、あまり…",
      kw: [["好き", "すき", "嫌い", "きらい"]],
      a: "はい、サッカーが {大好|だいす}きです。" },
    { l: 10, q: "どこへ {旅行|りょこう}に {行|い}きたいですか。", vi: "Bạn muốn đi du lịch ở đâu?",
      hint: "～へ {行|い}きたいです。", kw: [["行きたい", "いきたい"]],
      a: "{北海道|ほっかいどう}へ {行|い}きたいです。" },
    { l: 10, q: "バスツアーに {行|い}ったことが ありますか。", vi: "Bạn đã từng đi tour xe buýt chưa?",
      hint: "～たことが あります / ありません。",
      kw: [["あります", "ありません", "ある", "ない"]],
      a: "はい、{一度|いちど} {行|い}ったことが あります。" },
    { l: 10, q: "{旅行|りょこう}で {何|なに}を {食|た}べたいですか。", vi: "Đi du lịch bạn muốn ăn gì?",
      hint: "～を {食|た}べたいです。", kw: [["食べたい", "たべたい"]],
      a: "おすしを {食|た}べたいです。" },
    { l: 10, q: "{夏休|なつやす}みに どこへ {行|い}きましたか。", vi: "Kỳ nghỉ hè bạn đã đi đâu?",
      hint: "～へ {行|い}きました。", kw: [["行きました", "いきました", "行った", "いった"]],
      a: "{家族|かぞく}と {海|うみ}へ {行|い}きました。" },
    { l: 11, q: "{毎朝|まいあさ} {何時|なんじ}に {起|お}きますか。", vi: "Mỗi sáng bạn dậy lúc mấy giờ?",
      hint: "～{時|じ}に {起|お}きます。", kw: [["時", "じ"], ["起き", "おき"]],
      a: "6{時|じ}に {起|お}きます。" },
    { l: 11, q: "{朝|あさ}ごはんを {食|た}べますか。", vi: "Bạn có ăn sáng không?",
      hint: "はい、{食|た}べます。/ いいえ、{食|た}べません。", kw: [["食べ", "たべ"]],
      a: "はい、パンを {食|た}べます。" },
    { l: 11, q: "{寝|ね}る {前|まえ}に {何|なに}を しますか。", vi: "Trước khi ngủ bạn làm gì?",
      hint: "{寝|ね}る {前|まえ}に ～ます。", kw: [["ます"]],
      a: "{寝|ね}る {前|まえ}に {本|ほん}を {読|よ}みます。" },
    { l: 11, q: "{学校|がっこう}まで {何|なに}で {来|き}ますか。", vi: "Bạn đến trường bằng gì?",
      hint: "～で {来|き}ます。",
      kw: [["バス", "電車", "でんしゃ", "自転車", "じてんしゃ", "バイク", "車", "くるま", "歩いて", "あるいて", "地下鉄", "ちかてつ"]],
      a: "バイクで {来|き}ます。" },
  ];

  /* ---------------- Helpers ---------------- */
  const hasGsap = typeof window.gsap !== "undefined";
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const RB = /\{([^|}]+)\|([^}]+)\}/g;
  const ruby = (s) => esc(s).replace(RB, "<ruby>$1<rt>$2</rt></ruby>");
  const plain = (s) => s.replace(RB, "$1");
  // Compare in hiragana, without spaces or punctuation.
  const norm = (s) => String(s)
    .replace(/[\s、。！？!?,.・「」『』（）()〜～ー-]/g, "")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .toLowerCase();

  const ASSETS = (() => {
    const src = (document.currentScript && document.currentScript.src) || "";
    return src ? src.replace(/[^/]*$/, "") : "assets/";
  })();
  const HERO = { name: "先輩", avatar: `<img src="${ASSETS}hero.webp?v=9" alt="">`, pitch: 1.15, hero: true };

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const canSpeak = "speechSynthesis" in window;

  const I = {
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2.5"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  /* ---------------- Markup ---------------- */
  const dlg = document.createElement("dialog");
  dlg.className = "speak";
  dlg.setAttribute("aria-labelledby", "spQ");
  dlg.innerHTML = `
    <div class="sp-card">
      <header class="sp-head">
        <span class="sp-avatar" aria-hidden="true"></span>
        <div class="sp-who"><b class="sp-name"></b><span class="sp-lesson"></span></div>
        <div class="sp-lessons" role="group" aria-label="Chọn bài">
          <button type="button" data-l="0">Tất cả</button><button type="button" data-l="8">8</button><button type="button" data-l="9">9</button><button type="button" data-l="10">10</button><button type="button" data-l="11">11</button>
        </div>
        <button type="button" class="sp-x" data-act="close" aria-label="Đóng">${I.x}</button>
      </header>

      <div class="sp-bubble">
        <p class="sp-q" id="spQ" lang="ja"></p>
        <p class="sp-vi" hidden></p>
        <p class="sp-hint" lang="ja" hidden></p>
        <div class="sp-tools">
          <button type="button" class="sp-chip" data-act="listen">${I.speaker}<span>Nghe</span></button>
          <button type="button" class="sp-chip" data-act="vi" aria-pressed="false">Nghĩa</button>
          <button type="button" class="sp-chip" data-act="hint" aria-pressed="false">Gợi ý</button>
        </div>
      </div>

      <div class="sp-rec">
        <button type="button" class="sp-mic" data-act="rec" aria-pressed="false" aria-label="Ghi âm câu trả lời">
          <span class="sp-ring" aria-hidden="true"></span><span class="sp-ring" aria-hidden="true"></span>
          <span class="sp-mic-ico">${I.mic}</span><span class="sp-stop-ico">${I.stop}</span>
        </button>
        <p class="sp-status" role="status"></p>
        <p class="sp-live" lang="ja" aria-live="polite"></p>
      </div>

      <div class="sp-result" hidden>
        <p class="sp-verdict"></p>
        <p class="sp-heard" hidden><span>Bạn nói</span><q lang="ja"></q></p>
        <div class="sp-actions">
          <button type="button" class="sp-chip" data-act="replay">${I.play}<span>Nghe lại</span></button>
          <button type="button" class="sp-chip" data-act="sample">${I.speaker}<span>Câu mẫu</span></button>
        </div>
        <p class="sp-sample" lang="ja"></p>
      </div>

      <footer class="sp-foot">
        <button type="button" class="sp-next" data-act="next"><span>Câu khác</span>${I.next}</button>
      </footer>
    </div>`;
  document.body.appendChild(dlg);

  const $ = (s) => dlg.querySelector(s);
  const el = {
    card: $(".sp-card"), avatar: $(".sp-avatar"), name: $(".sp-name"), lesson: $(".sp-lesson"),
    q: $(".sp-q"), vi: $(".sp-vi"), hint: $(".sp-hint"), bubble: $(".sp-bubble"),
    mic: $(".sp-mic"), rings: dlg.querySelectorAll(".sp-ring"), status: $(".sp-status"), live: $(".sp-live"),
    result: $(".sp-result"), verdict: $(".sp-verdict"), heard: $(".sp-heard"), heardQ: $(".sp-heard q"), sample: $(".sp-sample"),
    viBtn: $('[data-act="vi"]'), hintBtn: $('[data-act="hint"]'),
  };
  const player = new Audio();

  /* ---------------- State ---------------- */
  let speaker = HERO;
  let lesson = 0;
  try { lesson = Number(localStorage.getItem("spL")) || 0; } catch (e) {}
  let current = null;
  let lastIndex = -1;
  let rec = null, stream = null, recog = null, chunks = [], transcript = "", interim = "";
  let recogDone = Promise.resolve();
  let timer = null, ringTl = null, startedAt = 0, audioUrl = null;
  const MAX_SECONDS = 20;

  const IDLE_TEXT = canRecord ? "Bấm micro rồi trả lời bằng tiếng Nhật" : "Trình duyệt này không ghi âm được. Hãy nói to theo câu mẫu nhé.";

  /* ---------------- Voice ---------------- */
  let jaVoice = null, jaMale = null;
  function pickVoice() {
    if (!canSpeak) return;
    const voices = speechSynthesis.getVoices().filter((v) => /^ja(-|_|$)/i.test(v.lang));
    const MALE = /ichiro|keita|otoya|daichi|naoki|male/i;
    const female = voices.filter((v) => !MALE.test(v.name));
    jaVoice = female.find((v) => /google|natural|online/i.test(v.name)) || female[0] || voices[0] || null;
    jaMale = voices.find((v) => MALE.test(v.name)) || null;
  }
  if (canSpeak) {
    pickVoice();
    speechSynthesis.addEventListener("voiceschanged", pickVoice);
  }
  function say(text, pitch = speaker.pitch || 1) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(plain(text));
    u.lang = "ja-JP";
    const voice = speaker.male && jaMale ? jaMale : jaVoice;
    if (voice) u.voice = voice;
    u.rate = 0.9;
    // A male voice already sounds low; keep its pitch natural.
    u.pitch = speaker.male && jaMale ? 1 : pitch;
    u.onstart = () => talkAnim(true);
    u.onend = u.onerror = () => talkAnim(false);
    speechSynthesis.speak(u);
  }
  let talkTween = null;
  function talkAnim(on) {
    if (!hasGsap || reduced()) return;
    if (talkTween) { talkTween.kill(); talkTween = null; }
    if (on) talkTween = gsap.to(el.avatar, { y: -3, scale: 1.06, duration: 0.18, yoyo: true, repeat: -1, ease: "sine.inOut" });
    else gsap.to(el.avatar, { y: 0, scale: 1, duration: 0.2 });
  }

  /* ---------------- Questions ---------------- */
  function pool() { return QUESTIONS.map((q, i) => i).filter((i) => !lesson || QUESTIONS[i].l === lesson); }
  function nextQuestion(speakIt) {
    const ids = pool();
    let i = ids[Math.floor(Math.random() * ids.length)];
    if (ids.length > 1) while (i === lastIndex) i = ids[Math.floor(Math.random() * ids.length)];
    lastIndex = i;
    current = QUESTIONS[i];
    resetAnswer();
    el.q.innerHTML = ruby(current.q);
    el.vi.textContent = current.vi;
    el.hint.innerHTML = ruby(current.hint);
    el.lesson.textContent = `Bài ${current.l}`;
    setToggle(el.viBtn, el.vi, false);
    setToggle(el.hintBtn, el.hint, false);
    if (hasGsap && !reduced()) {
      gsap.fromTo(el.bubble, { autoAlpha: 0, y: 10, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.8)", clearProps: "transform,opacity,visibility" });
    }
    if (speakIt) say(current.q);
  }
  function setToggle(btn, box, on) {
    btn.setAttribute("aria-pressed", String(on));
    box.hidden = !on;
    if (on && hasGsap && !reduced()) gsap.fromTo(box, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.25, clearProps: "opacity,transform" });
  }
  function markLessons() {
    dlg.querySelectorAll(".sp-lessons button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.l) === lesson)));
  }

  /* ---------------- Recording ---------------- */
  function resetAnswer() {
    stopRecording(true);
    el.result.hidden = true;
    el.status.textContent = IDLE_TEXT;
    el.live.textContent = "";
    transcript = "";
    interim = "";
  }
  function setStatus(t) { el.status.textContent = t; }

  async function startRecording() {
    if (!canRecord) { setStatus(IDLE_TEXT); return; }
    if (canSpeak) speechSynthesis.cancel();
    player.pause();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setStatus(e && e.name === "NotAllowedError"
        ? "Bạn chưa cho phép dùng micro. Bấm biểu tượng ổ khoá trên thanh địa chỉ để bật."
        : "Không mở được micro.");
      return;
    }
    chunks = [];
    transcript = "";
    interim = "";
    el.result.hidden = true;
    el.live.textContent = "";
    rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = onRecorded;
    rec.start();
    startRecognition();

    el.mic.setAttribute("aria-pressed", "true");
    el.mic.setAttribute("aria-label", "Dừng ghi âm");
    startedAt = Date.now();
    const tickTime = () => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      setStatus(`Đang ghi âm… 0:${String(s).padStart(2, "0")} · bấm lần nữa để dừng`);
      if (s >= MAX_SECONDS) stopRecording();
    };
    tickTime();
    timer = setInterval(tickTime, 250);
    if (hasGsap && !reduced()) {
      ringTl = gsap.timeline({ repeat: -1 })
        .fromTo(el.rings, { scale: 1, opacity: 0.55 }, { scale: 1.9, opacity: 0, duration: 1.3, ease: "power1.out", stagger: 0.65 });
    }
  }

  function startRecognition() {
    if (!SR) { recogDone = Promise.resolve(); return; }
    try {
      recog = new SR();
      recog.lang = "ja-JP";
      recog.continuous = true;
      recog.interimResults = true;
      recog.maxAlternatives = 1;
      recogDone = new Promise((resolve) => {
        recog.onend = resolve;
        recog.onerror = resolve;
      });
      recog.onresult = (e) => {
        let fin = "", mid = "";
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) fin += r[0].transcript;
          else mid += r[0].transcript;
        }
        transcript = fin;
        interim = mid;
        el.live.textContent = fin + mid;
      };
      recog.start();
    } catch (e) {
      recog = null;
      recogDone = Promise.resolve();
    }
  }

  function stopRecording(silent) {
    clearInterval(timer);
    timer = null;
    if (ringTl) { ringTl.kill(); ringTl = null; if (hasGsap) gsap.set(el.rings, { opacity: 0, scale: 1 }); }
    el.mic.setAttribute("aria-pressed", "false");
    el.mic.setAttribute("aria-label", "Ghi âm câu trả lời");
    if (recog) { try { recog.stop(); } catch (e) {} }
    if (rec && rec.state !== "inactive") {
      if (silent) rec.onstop = null;
      rec.stop();
      if (!silent) setStatus("Đang nghe lại câu trả lời…");
    }
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    if (silent) { recog = null; rec = null; }
  }

  async function onRecorded() {
    const type = (rec && rec.mimeType) || "audio/webm";
    rec = null;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = URL.createObjectURL(new Blob(chunks, { type }));
    player.src = audioUrl;
    // Give the recogniser a moment to deliver its final words.
    await Promise.race([recogDone, new Promise((r) => setTimeout(r, 1500))]);
    recog = null;
    showResult((transcript || interim).trim());
  }

  function check(text) {
    if (!text) return null;
    const t = norm(text);
    const hits = current.kw.filter((group) => group.some((w) => t.includes(norm(w)))).length;
    const japanese = /[぀-ヿ一-鿿]/.test(text);
    if (hits === current.kw.length) return 2;
    return hits > 0 || japanese ? 1 : 0;
  }

  function showResult(text) {
    const level = check(text);
    const V = {
      2: ["good", "よくできました！", "Trả lời đúng ý rồi."],
      1: ["ok", "いいですね！", "Gần đúng. Thử nói theo mẫu gợi ý nhé."],
      0: ["retry", "もう一度！", "Chưa nghe ra câu tiếng Nhật, thử lại nhé."],
      none: ["self", "聞いてみよう", SR ? "Không nghe rõ. Nghe lại bản ghi và so với câu mẫu." : "Nghe lại bản ghi và so với câu mẫu nhé."],
    }[level === null ? "none" : level];
    el.verdict.className = `sp-verdict v-${V[0]}`;
    el.verdict.innerHTML = `<b lang="ja">${V[1]}</b><span>${V[2]}</span>`;
    el.heard.hidden = !text;
    el.heardQ.textContent = text;
    el.sample.innerHTML = ruby(current.a);
    el.result.hidden = false;
    el.live.textContent = "";
    setStatus("Bấm micro để trả lời lại");
    if (hasGsap && !reduced()) {
      gsap.fromTo(el.result, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "opacity,visibility,transform" });
      gsap.fromTo(el.verdict.querySelector("b"), { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    }
  }

  /* ---------------- Open / close ---------------- */
  function open(who) {
    speaker = who && who.avatar ? who : HERO;
    el.avatar.innerHTML = speaker.avatar;
    el.avatar.classList.toggle("is-photo", !!speaker.hero);
    el.name.textContent = speaker.name;
    markLessons();
    if (!dlg.open) dlg.showModal();
    if (hasGsap && !reduced()) {
      gsap.fromTo(el.card, { autoAlpha: 0, y: 40, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)", clearProps: "transform,opacity,visibility" });
      gsap.fromTo(el.avatar, { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)", delay: 0.1 });
    }
    nextQuestion(true);
  }
  function close() {
    stopRecording(true);
    if (canSpeak) speechSynthesis.cancel();
    player.pause();
    if (!dlg.open) return;
    if (hasGsap && !reduced()) {
      gsap.to(el.card, { autoAlpha: 0, y: 30, scale: 0.96, duration: 0.25, ease: "power2.in", onComplete: () => { dlg.close(); gsap.set(el.card, { clearProps: "all" }); } });
    } else {
      dlg.close();
    }
  }

  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) { close(); return; } // backdrop
    const lb = e.target.closest(".sp-lessons button");
    if (lb) {
      lesson = Number(lb.dataset.l);
      try { localStorage.setItem("spL", String(lesson)); } catch (err) {}
      markLessons();
      nextQuestion(true);
      return;
    }
    const b = e.target.closest("[data-act]");
    if (!b) return;
    switch (b.dataset.act) {
      case "close": close(); break;
      case "listen": say(current.q); break;
      case "vi": setToggle(el.viBtn, el.vi, el.vi.hidden); break;
      case "hint": setToggle(el.hintBtn, el.hint, el.hint.hidden); break;
      case "rec": (rec && rec.state === "recording") ? stopRecording() : startRecording(); break;
      case "replay": if (canSpeak) speechSynthesis.cancel(); player.currentTime = 0; player.play().catch(() => {}); break;
      case "sample": say(current.a); break;
      case "next": nextQuestion(true); break;
    }
  });

  // Anything marked [data-speak] opens the practice (sidebar mic, hero picture, "Luyện nói" chip).
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-speak]");
    if (!t || dlg.contains(t)) return;
    e.preventDefault();
    open(HERO);
  });

  window.Speak = { open, close };
})();
