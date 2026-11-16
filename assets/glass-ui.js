/* Shared GSAP helpers for the glass pages (home and study notebook). */
(() => {
  "use strict";

  /**
   * macOS-style dock magnify: icons near the pointer grow and pop out.
   * Works for the bottom dock (icons rise) and for the sidebar (icons pop out to the side): the
   * direction follows the bar's own flex-direction, so it stays right when the layout changes.
   * Uses gsap.quickTo (one reusable tween per property) as the gsap-performance skill recommends.
   * Returns a cleanup function.
   */
  function magnifyDock(dock, { selector = ".dock-item", range = 130, maxScale = 1.5, lift = 22, out = -1 } = {}) {
    const items = Array.from(dock.querySelectorAll(selector));
    const toScale = gsap.utils.pipe(
      gsap.utils.clamp(0, range),
      gsap.utils.mapRange(0, range, maxScale, 1)
    );
    // quickTo animates a single real property, so drive scaleX and scaleY separately.
    const quick = (el, prop) => gsap.quickTo(el, prop, { duration: 0.3, ease: "power3.out" });
    const setters = items.map((el) => {
      const sx = quick(el, "scaleX");
      const sy = quick(el, "scaleY");
      return { scale: (v) => { sx(v); sy(v); }, x: quick(el, "x"), y: quick(el, "y") };
    });
    let centers = [];
    let vertical = false;

    const measure = () => {
      // Untransformed offsets, read once, so the scaling itself does not feed back into the maths.
      vertical = getComputedStyle(dock).flexDirection.startsWith("column");
      const box = dock.getBoundingClientRect();
      centers = items.map((el) => (vertical
        ? box.top + dock.clientTop + el.offsetTop + el.offsetHeight / 2
        : box.left + dock.clientLeft + el.offsetLeft + el.offsetWidth / 2));
    };
    const onMove = (e) => {
      if (!centers.length) measure();
      const at = vertical ? e.clientY : e.clientX;
      items.forEach((_, i) => {
        const s = toScale(Math.abs(at - centers[i]));
        const shift = out * (s - 1) * lift;
        setters[i].scale(s);
        if (vertical) { setters[i].x(-shift); setters[i].y(0); }
        else { setters[i].y(shift); setters[i].x(0); }
      });
    };
    const onLeave = () => {
      setters.forEach((s) => { s.scale(1); s.x(0); s.y(0); });
      centers = [];
    };

    dock.addEventListener("mouseenter", measure);
    dock.addEventListener("mousemove", onMove);
    dock.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onLeave);
    return () => {
      dock.removeEventListener("mouseenter", measure);
      dock.removeEventListener("mousemove", onMove);
      dock.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onLeave);
      onLeave();
    };
  }

  /**
   * Subtle hover lift. Works with elements added later (event delegation on `root`).
   * Returns a cleanup function.
   */
  function hoverLift(root, selector, { y = -6, scale = 1 } = {}) {
    const over = (e) => {
      const el = e.target.closest(selector);
      if (!el || !root.contains(el) || (e.relatedTarget && el.contains(e.relatedTarget))) return;
      gsap.to(el, { y, scale, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    };
    const out = (e) => {
      const el = e.target.closest(selector);
      if (!el || !root.contains(el) || (e.relatedTarget && el.contains(e.relatedTarget))) return;
      gsap.to(el, { y: 0, scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    };
    root.addEventListener("mouseover", over);
    root.addEventListener("mouseout", out);
    return () => {
      root.removeEventListener("mouseover", over);
      root.removeEventListener("mouseout", out);
    };
  }

  window.GlassUI = { magnifyDock, hoverLift };
})();

/*
 * Full-screen button in the sidebar (#fsBtn). Hidden where the browser cannot do it (iPhone Safari).
 *
 * Browsers leave full screen whenever the page loads a new document. So while full screen is on,
 * a click on a link to another page of this site does not navigate the window: the page is opened
 * in a frame that covers the screen, and every later move happens inside that frame. Leaving full
 * screen loads the page that was showing in the frame normally. Music is handed over to the frame
 * (it picks up at the same second) so it never plays twice.
 */
(() => {
  const btn = document.getElementById("fsBtn");
  if (!btn) return;
  const ENTER = '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>';
  const LEAVE = '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>';
  function paint(on) {
    const text = on ? "Thoát toàn màn hình" : "Toàn màn hình";
    btn.dataset.label = text;
    btn.setAttribute("aria-label", text);
    btn.querySelector("svg").innerHTML = on ? LEAVE : ENTER;
  }

  // Inside the full-screen frame: the button only drives the window around it.
  let host = null;
  try { if (window.top !== window && window.top.NihongoFS) host = window.top.NihongoFS; } catch (e) {}
  if (host) {
    btn.hidden = false;
    paint(true);
    btn.addEventListener("click", () => host.toggle());
    return;
  }

  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  if (!request || !exit) return;
  const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const setWant = (on) => { try { sessionStorage.setItem("fs", on ? "1" : "0"); } catch (e) {} };
  const want = () => { try { return sessionStorage.getItem("fs") === "1"; } catch (e) { return false; } };
  let entering = false;
  const enter = () => {
    entering = true;
    try {
      const r = request.call(root);
      if (r && r.then) r.then(() => { entering = false; }, () => { entering = false; });
      else entering = false;
    } catch (e) { entering = false; }
  };
  const toggle = () => {
    const on = isFull();
    setWant(!on);
    if (on) exit.call(document); else enter();
  };

  /* ---------- The covering frame ---------- */
  let frame = null;
  function openInFrame(url) {
    if (!frame) {
      // Hand the music over: remember where it is, stop it here; the frame's player carries on.
      document.dispatchEvent(new CustomEvent("fs:handoff"));
      frame = document.createElement("iframe");
      frame.className = "fs-frame";
      frame.title = document.title;
      frame.setAttribute("allow", "fullscreen; microphone; autoplay");
      frame.addEventListener("load", () => {
        try { document.title = frame.contentDocument.title; } catch (e) {}
      });
      document.body.appendChild(frame);
      root.classList.add("fs-shell");
      if (window.gsap) gsap.globalTimeline.pause(); // nothing to animate underneath
    }
    frame.src = url;
  }
  function leaveFrame() {
    if (!frame) return;
    let url = location.href;
    try { url = frame.contentWindow.location.href; } catch (e) {}
    location.href = url; // load what the learner was looking at, normally
  }

  // While full screen, links to other pages of this site open in the frame.
  document.addEventListener("click", (e) => {
    if (!(isFull() || entering) || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page, just a #section
    e.preventDefault();
    openInFrame(url.href);
  });

  function onChange() {
    const on = isFull();
    paint(on);
    if (on) return;
    // Out of full screen. A tab switch (opening Mazii, a dock link…) is not the learner's choice:
    // keep the wish so the next click goes back to full screen. Esc or the button: they meant it.
    if (!document.hidden) setWant(false);
    leaveFrame();
  }
  document.addEventListener("fullscreenchange", onChange);
  document.addEventListener("webkitfullscreenchange", onChange);

  btn.hidden = false;
  btn.addEventListener("click", toggle);
  window.NihongoFS = { toggle };

  // Came back to the tab, or arrived on a new page, with full screen wished for:
  // go back to full screen on the first click or key press.
  function armAgain() {
    if (!want() || isFull()) return;
    const again = (e) => {
      document.removeEventListener("pointerup", again, true);
      document.removeEventListener("keydown", again, true);
      if (e.target && e.target.closest && e.target.closest("#fsBtn")) return;
      if (e.key === "Escape") { setWant(false); return; }
      if (want() && !isFull()) enter();
    };
    document.addEventListener("pointerup", again, true);
    document.addEventListener("keydown", again, true);
  }
  armAgain();
  paint(false);
})();
