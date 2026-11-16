/* Shared GSAP helpers for the glass pages (home and study notebook). */
(() => {
  "use strict";

  /**
   * macOS-style dock magnify: icons near the pointer grow and rise.
   * Uses gsap.quickTo (one reusable tween per property) as the gsap-performance skill recommends.
   * Returns a cleanup function.
   */
  function magnifyDock(dock, { range = 130, maxScale = 1.5, lift = 22 } = {}) {
    const items = Array.from(dock.querySelectorAll(".dock-item"));
    const toScale = gsap.utils.pipe(
      gsap.utils.clamp(0, range),
      gsap.utils.mapRange(0, range, maxScale, 1)
    );
    // quickTo animates a single real property, so drive scaleX and scaleY separately.
    const quick = (el, prop) => gsap.quickTo(el, prop, { duration: 0.3, ease: "power3.out" });
    const setters = items.map((el) => {
      const sx = quick(el, "scaleX");
      const sy = quick(el, "scaleY");
      return { scale: (v) => { sx(v); sy(v); }, y: quick(el, "y") };
    });
    let centers = [];

    const measure = () => {
      // Untransformed offsets, read once, so the scaling itself does not feed back into the maths.
      const left = dock.getBoundingClientRect().left + dock.clientLeft;
      centers = items.map((el) => left + el.offsetLeft + el.offsetWidth / 2);
    };
    const onMove = (e) => {
      if (!centers.length) measure();
      items.forEach((_, i) => {
        const s = toScale(Math.abs(e.clientX - centers[i]));
        setters[i].scale(s);
        setters[i].y(-(s - 1) * lift);
      });
    };
    const onLeave = () => {
      setters.forEach((s) => { s.scale(1); s.y(0); });
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
