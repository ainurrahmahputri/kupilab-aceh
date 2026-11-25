import { el, svgEl } from "../utils/dom.js";
import { NUSANTARA_ORIGINS } from "../data/origins.js";
import { CoffeeFormSvg } from "./media.js";

const CX = 300;
const CY = 300;
const POPOVER_W = 272;
const POPOVER_H = 214;

function handItemSvg(origin) {
  const color =
    origin.item === "cherry"
      ? "#b3402c"
      : origin.item === "green"
      ? "#8b9a5b"
      : origin.item === "dark"
      ? "#2c1a0e"
      : origin.item === "parchment"
      ? "#d6c6a6"
      : origin.item === "leaf"
      ? "#6b6a3a"
      : origin.item === "medium"
      ? "#8a5a36"
      : origin.item === "peaberry"
      ? "#6e4a2e"
      : "#5a3a24";

  let heldNode;
  if (origin.item === "cherry") {
    heldNode = svgEl(
      "g",
      { transform: "translate(0 -182)" },
      svgEl("path", { d: "M-7 -2c-3-12 2-20 7-24M7 -2c3-12-2-20-7-24", stroke: "#504f2c", "stroke-width": "2.6", fill: "none", "stroke-linecap": "round" }),
      svgEl("circle", { cx: "-9", cy: "4", r: "11", fill: "#b3402c" }),
      svgEl("circle", { cx: "9", cy: "6", r: "11", fill: "#c4533a" }),
      svgEl("circle", { cx: "0", cy: "6", r: "8", fill: "#b3402c" })
    );
  } else {
    heldNode = svgEl(
      "g",
      { transform: "translate(0 -182)" },
      svgEl(
        "g",
        { transform: "translate(-10 2) rotate(-18)" },
        svgEl("ellipse", { rx: "10", ry: "14", fill: color }),
        svgEl("path", { d: "M-2 -12c6 5 -6 18 2 24", stroke: "#00000055", "stroke-width": "2.4", fill: "none", "stroke-linecap": "round" })
      ),
      svgEl(
        "g",
        { transform: "translate(11 5) rotate(16)" },
        svgEl("ellipse", { rx: "10", ry: "14", fill: color }),
        svgEl("path", { d: "M-2 -12c6 5 -6 18 2 24", stroke: "#00000055", "stroke-width": "2.4", fill: "none", "stroke-linecap": "round" })
      )
    );
  }

  return svgEl(
    "g",
    { className: "held" },
    svgEl("ellipse", { cx: "0", cy: "-166", rx: "26", ry: "9", fill: "#00000022" }),
    heldNode
  );
}

function armSvg(origin, flip) {
  const strokeTone = "#3d261530";
  return svgEl(
    "g",
    { transform: flip ? "scale(-1 1)" : undefined },
    svgEl("rect", { x: "-40", y: "-298", width: "80", height: "62", rx: "8", fill: origin.cuff }),
    svgEl("rect", { x: "-40", y: "-246", width: "80", height: "10", fill: "#ffffff26" }),
    svgEl("rect", { x: "-23", y: "-240", width: "46", height: "52", rx: "6", fill: origin.skin }),
    svgEl("path", { d: "M-24 -198 Q-46 -178 -38 -142", stroke: origin.skin, "stroke-width": "15", "stroke-linecap": "round", fill: "none" }),
    svgEl("ellipse", { cx: "-38", cy: "-139", rx: "3.4", ry: "2.6", fill: "#ffffff66" }),
    svgEl("path", { d: "M-28 -208 C-33 -184 -31 -164 -27 -146 L27 -146 C31 -164 33 -184 28 -208 Z", fill: origin.skin }),
    svgEl("path", { d: "M-13 -180 Q0 -170 13 -180", stroke: strokeTone, "stroke-width": "2", fill: "none", "stroke-linecap": "round" }),
    svgEl(
      "g",
      { stroke: origin.skin, "stroke-width": "15", "stroke-linecap": "round", fill: "none" },
      svgEl("path", { d: "M-19.5 -154 Q-22 -128 -21 -100" }),
      svgEl("path", { d: "M-6.5 -152 Q-7 -124 -7 -90" }),
      svgEl("path", { d: "M6.5 -152 Q7 -124 7 -92" }),
      svgEl("path", { d: "M19.5 -154 Q21 -132 20 -106" })
    ),
    svgEl(
      "g",
      { stroke: strokeTone, "stroke-width": "1.5", "stroke-linecap": "round" },
      svgEl("path", { d: "M-13 -148 V-116" }),
      svgEl("path", { d: "M0 -146 V-110" }),
      svgEl("path", { d: "M13 -148 V-118" })
    ),
    svgEl(
      "g",
      { fill: "#ffffff70" },
      svgEl("ellipse", { cx: "-21", cy: "-103", rx: "4.6", ry: "3.2" }),
      svgEl("ellipse", { cx: "-7", cy: "-93", rx: "4.6", ry: "3.2" }),
      svgEl("ellipse", { cx: "7", cy: "-95", rx: "4.6", ry: "3.2" }),
      svgEl("ellipse", { cx: "20", cy: "-109", rx: "4.2", ry: "3" })
    )
  );
}

export function CoffeeWheel() {
  let activeId = null;
  const container = el("div", { className: "relative mx-auto w-full max-w-[560px] select-none" });
  const handGroups = new Map();
  const popover = el("div", {
    role: "status",
    className: "pop-in pointer-events-none hidden absolute z-10 rounded-3xl border border-espresso-100 bg-white p-4 shadow-2xl",
    style: { width: `${POPOVER_W}px` },
  });

  const positionPopover = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();
    let left = clientX - rect.left + 18;
    let top = clientY - rect.top + 18;
    if (left + POPOVER_W > rect.width - 4) {
      left = clientX - rect.left - POPOVER_W - 18;
    }
    left = Math.max(4, Math.min(left, rect.width - POPOVER_W - 4));
    top = Math.max(4, Math.min(top, rect.height - POPOVER_H - 4));
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  };

  const setActive = (id, x, y) => {
    activeId = id;
    for (const [oid, group] of handGroups.entries()) {
      const isMatch = oid === activeId;
      group.setAttribute("aria-pressed", String(isMatch));
      group.setAttribute("data-active", String(isMatch));
    }

    const origin = NUSANTARA_ORIGINS.find((o) => o.id === activeId);
    if (!origin) {
      popover.classList.add("hidden");
      return;
    }

    if (typeof x === "number" && typeof y === "number") {
      positionPopover(x, y);
    }

    popover.replaceChildren(
      el(
        "div",
        { className: "flex items-center gap-3" },
        el("div", { className: "h-16 w-16 shrink-0 rounded-2xl bg-cream-100 p-1" }, CoffeeFormSvg({ kind: origin.item })),
        el(
          "div",
          { className: "min-w-0" },
          el("p", { className: "font-display text-lg leading-tight text-espresso-700" }, origin.name),
          el("p", { className: "mt-0.5 text-xs text-espresso-400" }, `${origin.province} · ${origin.species}`)
        )
      ),
      el("p", { className: "mt-3 line-clamp-3 text-[13px] leading-relaxed text-espresso-500" }, origin.about),
      el("p", { className: "mt-2.5 text-xs font-medium text-terra-600" }, origin.flavors.join(" · "))
    );
    popover.classList.remove("hidden");
  };

  const svg = svgEl(
    "svg",
    {
      viewBox: "0 0 600 600",
      className: "block h-auto w-full",
      role: "group",
      "aria-label": "Delapan tangan mengelilingi secangkir kopi. Tiap tangan mewakili satu jenis kopi Nusantara.",
    },
    svgEl("circle", { cx: String(CX), cy: String(CY), r: "252", fill: "#f7f4ed" }),
    svgEl("circle", {
      cx: String(CX),
      cy: String(CY),
      r: "252",
      fill: "none",
      stroke: "#b7a69355",
      "stroke-width": "2",
      "stroke-dasharray": "2 9",
      "stroke-linecap": "round",
    }),
    svgEl("circle", { className: "ripple", cx: String(CX), cy: String(CY), r: "150", fill: "none", stroke: "#b7a693", "stroke-width": "2" }),
    ...NUSANTARA_ORIGINS.map((origin, index) => {
      const hand = svgEl(
        "g",
        {
          className: "hand",
          role: "button",
          tabIndex: "0",
          "aria-label": `${origin.name}, ${origin.place}. Tekan untuk melihat keterangan.`,
          "aria-pressed": "false",
          "data-active": "false",
        },
        svgEl("rect", { x: "-52", y: "-300", width: "104", height: "206", fill: "transparent" }),
        svgEl("path", { className: "hand-ring", d: "M-34 -96 A102 102 0 0 1 34 -96", stroke: "#504f2c", "stroke-width": "5", "stroke-linecap": "round", fill: "none" }),
        svgEl("g", { className: "hand-inner hand-enter", style: { "--i": String(index) } }, armSvg(origin, index % 2 === 1), handItemSvg(origin))
      );

      hand.addEventListener("pointerenter", (e) => setActive(origin.id, e.clientX, e.clientY));
      hand.addEventListener("pointermove", (e) => {
        if (e.pointerType === "mouse") setActive(origin.id, e.clientX, e.clientY);
      });
      hand.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "mouse") setActive(null);
      });
      hand.addEventListener("click", (e) => {
        const rect = hand.getBoundingClientRect();
        setActive(origin.id, rect.left + rect.width / 2 - 60, rect.top + rect.height / 2);
      });
      hand.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const rect = hand.getBoundingClientRect();
          setActive(origin.id, rect.left + rect.width / 2 - 60, rect.top + rect.height / 2);
        } else if (e.key === "Escape") {
          setActive(null);
        }
      });
      hand.addEventListener("blur", () => {
        if (activeId === origin.id) setActive(null);
      });

      handGroups.set(origin.id, hand);
      return svgEl("g", { transform: `translate(${CX} ${CY}) rotate(${origin.angle})` }, hand);
    }),
    svgEl("circle", { cx: String(CX), cy: String(CY), r: "104", fill: "#00000012", transform: "translate(0 4)" }),
    svgEl("circle", { cx: String(CX), cy: String(CY), r: "102", fill: "#f0e9dc", stroke: "#b7a693", "stroke-width": "3" }),
    svgEl("circle", { cx: String(CX), cy: String(CY), r: "84", fill: "#f8f4ec", stroke: "#cfc2ae", "stroke-width": "2" }),
    svgEl(
      "g",
      { transform: `translate(${CX} ${CY}) rotate(22.5)` },
      svgEl("path", { d: "M-10 -62 V-82 a10 10 0 0 1 20 0 V-62", fill: "none", stroke: "#b7a693", "stroke-width": "15" }),
      svgEl("path", { d: "M-10 -62 V-82 a10 10 0 0 1 20 0 V-62", fill: "none", stroke: "#ffffff", "stroke-width": "9" })
    ),
    svgEl("circle", { cx: String(CX), cy: String(CY), r: "68", fill: "#ffffff", stroke: "#b7a693", "stroke-width": "3" }),
    svgEl("circle", { cx: String(CX), cy: String(CY), r: "56", fill: "#3d2615" }),
    svgEl("circle", { cx: String(CX), cy: String(CY), r: "56", fill: "none", stroke: "#5a3a24", "stroke-width": "5" }),
    svgEl(
      "g",
      { transform: `translate(${CX} ${CY})` },
      svgEl("path", { d: "M0 -30 C22 -15 22 15 0 30 C-22 15 -22 -15 0 -30Z", className: "latte", fill: "#e4dbce" }),
      svgEl("path", {
        d: "M0 -24 V26 M0 -10 L-9 -17 M0 0 L-11 -8 M0 10 L-9 3 M0 -10 L9 -17 M0 0 L11 -8 M0 10 L9 3",
        stroke: "#3d2615",
        "stroke-width": "2",
        "stroke-linecap": "round",
        fill: "none",
      })
    )
  );

  container.appendChild(svg);
  container.appendChild(popover);
  return container;
}
