import { el, svgEl, safeHref } from "../utils/dom.js";

export const LOCAL_PHOTOS = {
  roaster: "/src/assets/images/coffee_roaster_drum_1795589077793.jpg",
  roastedBowl: "/src/assets/images/coffee_beans_light_1795589078841.jpg",
  beanLot: "/src/assets/images/coffee_beans_light_1795589078841.jpg",
  darkBowl: "/src/assets/images/coffee_beans_dark_1795589079334.jpg",
  pile: "/src/assets/images/coffee_beans_dark_1795589079334.jpg",
  pourOver: "/src/assets/images/coffee_pourover_brew_1795589079606.jpg",
  plantation: "/src/assets/images/coffee_plantation_gayo_1795589079536.jpg",
  cherries: "/src/assets/images/coffee_cherries_green_1795589080663.jpg",
  greenBeans: "/src/assets/images/coffee_cherries_green_1795589080663.jpg",
};

const PHOTO_BY_ROAST = {
  Light: ["pourOver", "roastedBowl", "plantation"],
  Medium: ["roastedBowl", "roaster", "pourOver"],
  Dark: ["darkBowl", "roaster", "pile"],
};

function hashIndex(id, length) {
  let h = 0;
  for (const ch of String(id || "")) {
    h = (h * 31 + ch.charCodeAt(0)) % length;
  }
  return Math.abs(h) % length;
}

export function resolveBeanPhotoSrc(bean) {
  if (bean?.image && typeof bean.image === "string") {
    const safe = safeHref(bean.image);
    if (safe !== "#") return safe;
  }
  const pool = PHOTO_BY_ROAST[bean?.roast] || PHOTO_BY_ROAST.Medium;
  const key = pool[hashIndex(bean?.id || bean?.name, pool.length)];
  return LOCAL_PHOTOS[key] || LOCAL_PHOTOS.roastedBowl;
}

export function BagSvg({
  tone = "light",
  title = "KupiLab Aceh",
  subtitle = "200 g · whole bean",
  metaLine = "",
  className = "w-full h-auto",
}) {
  const tones = {
    dark: { bag: "#2c1a0e", label: "#f7f4ed", ink: "#2c1a0e", accent: "#656436" },
    olive: { bag: "#3d3c21", label: "#fffefc", ink: "#2c1a0e", accent: "#7e7d4b" },
    light: { bag: "#ebe4d8", label: "#3d2615", ink: "#fffefc", accent: "#a08065" },
  };
  const c = tones[tone] || tones.light;
  const primaryCaption = title === "KupiLab Aceh" ? subtitle : title.slice(0, 20);
  const secondaryCaption = metaLine ? metaLine.slice(0, 26) : title === "KupiLab Aceh" ? "" : subtitle.slice(0, 24);

  return svgEl(
    "svg",
    { viewBox: "0 0 300 400", className, "aria-hidden": "true" },
    svgEl("path", { d: "M64 82 H236 L252 356 Q252 374 234 374 H66 Q48 374 48 356 Z", fill: c.bag }),
    svgEl("path", { d: "M64 82 L80 42 H220 L236 82 Z", fill: c.bag, opacity: "0.9" }),
    svgEl("rect", { x: "78", y: "36", width: "144", height: "14", rx: "4", fill: c.accent }),
    svgEl("rect", { x: "76", y: "146", width: "148", height: "172", rx: "12", fill: c.label }),
    svgEl("rect", { x: "120", y: "100", width: "60", height: "18", rx: "9", fill: c.ink, opacity: "0.2" }),
    svgEl(
      "text",
      {
        x: "150",
        y: "194",
        "text-anchor": "middle",
        "font-family": "'Young Serif', Georgia, serif",
        "font-size": "21",
        fill: c.ink,
      },
      "KupiLab"
    ),
    svgEl(
      "text",
      {
        x: "150",
        y: "218",
        "text-anchor": "middle",
        "font-family": "Figtree, sans-serif",
        "font-size": "11",
        "letter-spacing": "5",
        fill: c.ink,
      },
      "ACEH"
    ),
    svgEl("rect", { x: "104", y: "236", width: "92", height: "1.5", fill: c.ink, opacity: "0.45" }),
    svgEl(
      "text",
      {
        x: "150",
        y: "264",
        "text-anchor": "middle",
        "font-family": "Figtree, sans-serif",
        "font-size": "12",
        "font-weight": "700",
        fill: c.ink,
      },
      primaryCaption
    ),
    secondaryCaption
      ? svgEl(
          "text",
          {
            x: "150",
            y: "288",
            "text-anchor": "middle",
            "font-family": "Figtree, sans-serif",
            "font-size": "10",
            "font-weight": "600",
            fill: c.accent,
          },
          secondaryCaption
        )
      : null
  );
}

export function ProductImage({ bean, className = "" }) {
  const tone = bean?.roast === "Dark" ? "dark" : bean?.roast === "Light" ? "olive" : "light";
  const fallbackBox = el(
    "div",
    { className: "hidden h-full w-full items-center justify-center p-4" },
    BagSvg({ tone, title: bean?.name || "KupiLab Aceh", className: "h-full w-auto max-w-full" })
  );

  const img = el("img", {
    src: resolveBeanPhotoSrc(bean),
    alt: bean?.name ? `Foto biji kopi ${bean.name}` : "Biji kopi KupiLab Aceh",
    loading: "lazy",
    decoding: "async",
    referrerPolicy: "no-referrer",
    className: "img-zoom h-full w-full object-cover opacity-0 transition-opacity duration-500",
    onLoad: () => {
      img.classList.remove("opacity-0");
    },
    onError: () => {
      img.classList.add("hidden");
      fallbackBox.classList.remove("hidden");
      fallbackBox.classList.add("flex");
    },
  });

  if (img.complete && img.naturalWidth > 0) {
    img.classList.remove("opacity-0");
  }

  const posClass = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";
  return el("div", { className: `${posClass} overflow-hidden bg-cream-100 ${className}`.trim() }, fallbackBox, img);
}

export function EditorialImage({ name, alt = "", className = "", eager = false }) {
  const src = LOCAL_PHOTOS[name] || LOCAL_PHOTOS.roastedBowl;
  const fallbackBox = el(
    "div",
    { className: "hidden h-full w-full items-center justify-center bg-espresso-100 p-4" },
    BagSvg({ tone: "light", className: "h-3/4 w-auto" })
  );

  const img = el("img", {
    src,
    alt,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    referrerPolicy: "no-referrer",
    className: "img-zoom h-full w-full object-cover opacity-0 transition-opacity duration-500",
    onLoad: () => {
      img.classList.remove("opacity-0");
    },
    onError: () => {
      img.classList.add("hidden");
      fallbackBox.classList.remove("hidden");
      fallbackBox.classList.add("flex");
    },
  });

  if (img.complete && img.naturalWidth > 0) {
    img.classList.remove("opacity-0");
  }

  const posClass = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";
  return el("div", { className: `${posClass} overflow-hidden bg-cream-100 ${className}`.trim() }, fallbackBox, img);
}

function miniBean(x, y, r, color, s = 1) {
  return svgEl(
    "g",
    { transform: `translate(${x} ${y}) rotate(${r}) scale(${s})` },
    svgEl("ellipse", { rx: "15", ry: "21", fill: color }),
    svgEl("path", {
      d: "M-3 -18c9 8 -9 28 3 36",
      stroke: "#00000055",
      "stroke-width": "3",
      fill: "none",
      "stroke-linecap": "round",
    })
  );
}

export function CoffeeFormSvg({ kind, className = "h-full w-full" }) {
  let content = null;
  if (kind === "cherry") {
    content = svgEl(
      "g",
      null,
      svgEl("path", { d: "M60 18c-4 18-14 28-26 40M60 18c6 18 16 28 28 40", stroke: "#504f2c", "stroke-width": "4", fill: "none", "stroke-linecap": "round" }),
      svgEl("path", { d: "M60 18c14-12 30-8 36 2-14 6-26 4-36-2z", fill: "#6b6a3a" }),
      svgEl("circle", { cx: "34", cy: "76", r: "22", fill: "#b3402c" }),
      svgEl("circle", { cx: "88", cy: "76", r: "22", fill: "#c4533a" }),
      svgEl("circle", { cx: "27", cy: "69", r: "5", fill: "#ffffff55" }),
      svgEl("circle", { cx: "81", cy: "69", r: "5", fill: "#ffffff55" }),
      svgEl("circle", { cx: "34", cy: "56", r: "3", fill: "#3d2615" }),
      svgEl("circle", { cx: "88", cy: "56", r: "3", fill: "#3d2615" })
    );
  } else if (kind === "green") {
    content = svgEl(
      "g",
      null,
      miniBean(42, 62, -25, "#8b9a5b"),
      miniBean(78, 56, 20, "#7a8a4c"),
      miniBean(60, 88, 5, "#98a766", 0.9)
    );
  } else if (kind === "medium") {
    content = svgEl(
      "g",
      null,
      miniBean(44, 58, -20, "#8a5a36"),
      miniBean(78, 64, 25, "#7a4c2c"),
      miniBean(56, 92, 0, "#946141", 0.85)
    );
  } else if (kind === "dark") {
    content = svgEl(
      "g",
      null,
      miniBean(42, 60, -30, "#3d2615"),
      miniBean(80, 58, 15, "#2c1a0e"),
      miniBean(60, 90, -5, "#4a2e1c", 0.9)
    );
  } else if (kind === "ground") {
    content = svgEl(
      "g",
      null,
      svgEl("path", { d: "M14 98c8-34 24-58 46-58s38 24 46 58z", fill: "#5a3a24" }),
      svgEl("path", { d: "M30 98c6-22 16-36 30-36s24 14 30 36z", fill: "#77543a" }),
      ...[34, 52, 70, 88, 46, 76].map((cx, i) => svgEl("circle", { cx, cy: 90 - (i % 3) * 10, r: "2.4", fill: "#3d2615" })),
      svgEl("ellipse", { cx: "60", cy: "100", rx: "52", ry: "6", fill: "#3d261522" })
    );
  } else if (kind === "parchment") {
    content = svgEl(
      "g",
      null,
      svgEl("ellipse", { cx: "42", cy: "62", rx: "17", ry: "24", transform: "rotate(-25 42 62)", fill: "#d6c6a6" }),
      svgEl("ellipse", { cx: "78", cy: "58", rx: "17", ry: "24", transform: "rotate(20 78 58)", fill: "#e0d2b4" }),
      svgEl("path", { d: "M38 44c8 10 6 28 8 36M82 40c-6 12-2 26-4 36", stroke: "#a8946d", "stroke-width": "3", fill: "none", "stroke-linecap": "round" }),
      svgEl("ellipse", { cx: "60", cy: "92", rx: "15", ry: "11", fill: "#cdbb98" })
    );
  } else if (kind === "leaf") {
    content = svgEl(
      "g",
      null,
      svgEl("path", { d: "M20 100C40 70 70 40 100 22", stroke: "#504f2c", "stroke-width": "4", fill: "none", "stroke-linecap": "round" }),
      svgEl("path", { d: "M44 78c-16 0-26-12-28-26 16-2 28 6 28 26z", fill: "#6b6a3a" }),
      svgEl("path", { d: "M60 60c14 2 26-8 28-22-16-4-28 6-28 22z", fill: "#7e7d4b" }),
      svgEl("path", { d: "M72 44c-12-4-20-16-18-28 14 2 22 12 18 28z", fill: "#8a8a58" }),
      svgEl("circle", { cx: "86", cy: "86", r: "9", fill: "#b3402c" }),
      svgEl("circle", { cx: "102", cy: "76", r: "9", fill: "#c4533a" })
    );
  } else {
    content = svgEl(
      "g",
      { transform: "translate(60 60)" },
      svgEl("circle", { r: "26", fill: "#6e4a2e" }),
      svgEl("path", { d: "M0 -26c14 10 -14 30 0 52", stroke: "#00000055", "stroke-width": "3.5", fill: "none", "stroke-linecap": "round" }),
      svgEl("ellipse", { cx: "-10", cy: "-10", rx: "6", ry: "9", fill: "#ffffff22", transform: "rotate(25)" })
    );
  }

  return svgEl("svg", { viewBox: "0 0 120 120", className, "aria-hidden": "true" }, content);
}
