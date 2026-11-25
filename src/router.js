const routeListeners = new Set();

export function currentPath() {
  return window.location.pathname || "/";
}

export function navigate(to, { replace = false } = {}) {
  const target = to || "/";
  if (target === currentPath()) {
    window.scrollTo(0, 0);
    return;
  }
  if (replace) {
    window.history.replaceState({}, "", target);
  } else {
    window.history.pushState({}, "", target);
  }
  window.scrollTo(0, 0);
  for (const fn of routeListeners) {
    fn(currentPath());
  }
}

export function onRouteChange(fn) {
  routeListeners.add(fn);
  return () => routeListeners.delete(fn);
}

export function initRouterLinks() {
  window.addEventListener("popstate", () => {
    window.scrollTo(0, 0);
    for (const fn of routeListeners) {
      fn(currentPath());
    }
  });

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const anchor = e.target instanceof Element ? e.target.closest("a[data-link]") : null;
    if (!anchor) return;
    if (anchor.getAttribute("target") === "_blank") return;
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("/")) return;
    e.preventDefault();
    navigate(href);
  });
}

export function matchRoute(patterns, pathname) {
  const cleanPath = pathname.split("?")[0] || "/";
  for (const pass of [0, 1]) {
    for (const entry of patterns) {
      if (pass === 0 && entry.path === "*") continue;
      if (pass === 1 && entry.path !== "*") continue;
      if (entry.path === "*") {
        return { entry, params: {} };
      }
      const patternParts = entry.path.split("/").filter(Boolean);
      const pathParts = cleanPath.split("/").filter(Boolean);
      if (patternParts.length !== pathParts.length) continue;
      const params = {};
      let matched = true;
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(":")) {
          params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (patternParts[i] !== pathParts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) return { entry, params };
    }
  }
  return null;
}

export function routeLink(to, props, ...children) {
  const a = document.createElement("a");
  a.setAttribute("href", to);
  a.setAttribute("data-link", "true");
  if (props) {
    for (const [key, val] of Object.entries(props)) {
      if (val === undefined || val === null || val === false) continue;
      if (key === "className" || key === "class") {
        a.className = String(val);
      } else if (key.startsWith("on") && typeof val === "function") {
        a.addEventListener(key.slice(2).toLowerCase(), val);
      } else {
        a.setAttribute(key, String(val));
      }
    }
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    a.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return a;
}
