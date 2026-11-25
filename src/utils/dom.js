const SVG_NS = "http://www.w3.org/2000/svg";

export function safeHref(url) {
  if (typeof url !== "string") return "#";
  const trimmed = url.trim();
  if (!trimmed) return "#";
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    return "#";
  }
  return "#";
}

function appendChildSafe(parent, child) {
  if (child === null || child === undefined || child === false || child === true) return;
  if (Array.isArray(child)) {
    for (const item of child) appendChildSafe(parent, item);
    return;
  }
  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }
  parent.appendChild(document.createTextNode(String(child)));
}

function applyProps(node, props, isSvg) {
  if (!props) return;
  for (const [key, val] of Object.entries(props)) {
    if (val === undefined || val === null || val === false) continue;
    if (key === "className" || key === "class") {
      if (isSvg) {
        node.setAttribute("class", String(val));
      } else {
        node.className = String(val);
      }
    } else if (key === "htmlFor") {
      node.setAttribute("for", String(val));
    } else if (key === "style" && typeof val === "object") {
      for (const [sk, sv] of Object.entries(val)) {
        if (sv === undefined || sv === null) continue;
        if (sk.startsWith("--")) {
          node.style.setProperty(sk, String(sv));
        } else {
          node.style[sk] = String(sv);
        }
      }
    } else if (key === "dataset" && typeof val === "object") {
      for (const [dk, dv] of Object.entries(val)) {
        if (dv !== undefined && dv !== null) {
          node.dataset[dk] = String(dv);
        }
      }
    } else if (key.startsWith("on") && typeof val === "function") {
      const eventName = key.slice(2).toLowerCase();
      node.addEventListener(eventName, val);
    } else if (key === "href" || key === "src") {
      node.setAttribute(key, safeHref(String(val)));
    } else if (key === "value" && !isSvg && ("value" in node)) {
      node.value = String(val);
    } else if (key === "checked" && !isSvg && ("checked" in node)) {
      node.checked = Boolean(val);
    } else if (key === "disabled" || key === "required" || key === "readOnly" || key === "multiple" || key === "autoFocus" || key === "noValidate") {
      if (val) {
        node.setAttribute(key.toLowerCase(), "");
        if (key in node) node[key] = true;
      }
    } else if (val === true) {
      node.setAttribute(key, "");
    } else {
      node.setAttribute(key, String(val));
    }
  }
}

export function el(tag, props, ...children) {
  const node = document.createElement(tag);
  applyProps(node, props, false);
  for (const child of children) {
    appendChildSafe(node, child);
  }
  return node;
}

export function svgEl(tag, props, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  applyProps(node, props, true);
  for (const child of children) {
    appendChildSafe(node, child);
  }
  return node;
}

export function frag(...children) {
  const f = document.createDocumentFragment();
  for (const child of children) {
    appendChildSafe(f, child);
  }
  return f;
}

export function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
