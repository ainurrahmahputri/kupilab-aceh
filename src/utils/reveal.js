export function revealWrap(child, delay = 0, className = "") {
  const wrapper = document.createElement("div");
  wrapper.className = `reveal ${className}`.trim();
  if (delay) {
    wrapper.style.setProperty("--d", `${delay}ms`);
  }
  if (child) {
    wrapper.appendChild(child);
  }
  return wrapper;
}

export function observeReveals(root = document) {
  const nodes = root.querySelectorAll(".reveal:not(.in)");
  if (nodes.length === 0) return () => {};
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (reduced || typeof IntersectionObserver === "undefined") {
    nodes.forEach((n) => n.classList.add("in"));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  nodes.forEach((n) => observer.observe(n));
  return () => observer.disconnect();
}
