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

/* Full-screen button in the sidebar (#fsBtn). Hidden where the browser cannot do it (iPhone Safari). */
(() => {
  const btn = document.getElementById("fsBtn");
  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  if (!btn || !request || !exit) return;
  const ENTER = '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>';
  const LEAVE = '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>';
  const isFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const want = () => { try { return sessionStorage.getItem("fs") === "1"; } catch (e) { return false; } };
  const enter = () => {
    try { const r = request.call(root); if (r && r.catch) r.catch(() => {}); } catch (e) {}
  };
  function show() {
    const on = isFull();
    const text = on ? "Thoát toàn màn hình" : "Toàn màn hình";
    btn.dataset.label = text;
    btn.setAttribute("aria-label", text);
    btn.querySelector("svg").innerHTML = on ? LEAVE : ENTER;
  }
  btn.hidden = false;
  btn.addEventListener("click", () => {
    const on = isFull();
    try { sessionStorage.setItem("fs", on ? "0" : "1"); } catch (e) {}
    if (on) exit.call(document); else enter();
  });
  document.addEventListener("fullscreenchange", show);
  document.addEventListener("webkitfullscreenchange", show);
  // Browsers leave full screen when a new page loads. If the learner had it on, go back
  // to full screen on their first click or key press on the new page.
  if (want()) {
    const again = (e) => {
      document.removeEventListener("pointerup", again, true);
      document.removeEventListener("keydown", again, true);
      if (e.target && e.target.closest && e.target.closest("#fsBtn")) return;
      if (e.key === "Escape") { try { sessionStorage.setItem("fs", "0"); } catch (err) {} return; }
      if (want() && !isFull()) enter();
    };
    document.addEventListener("pointerup", again, true);
    document.addEventListener("keydown", again, true);
  }
  show();
})();
