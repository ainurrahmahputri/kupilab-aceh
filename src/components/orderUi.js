import { el, svgEl } from "../utils/dom.js";
import { formatWeight } from "../utils/format.js";

export const GRIND_META = {
  "Biji utuh": {
    hint: "Segar paling lama · giling sendiri",
    texture: "Utuh",
  },
  "Giling V60": {
    hint: "Sedang-halus · pour over & drip",
    texture: "Sedang halus",
  },
  "Giling sanger": {
    hint: "Halus merata · saring kain & mokapot",
    texture: "Halus",
  },
  "Giling French press": {
    hint: "Kasar · rendam tekan 4 menit",
    texture: "Kasar",
  },
  "Giling cold brew": {
    hint: "Sangat kasar · seduh dingin 14 jam",
    texture: "Sangat kasar",
  },
};

export function GrindOptionIcon({ grind, className = "h-6 w-6" }) {
  if (grind === "Biji utuh") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "aria-hidden": "true" },
      svgEl("ellipse", { cx: "12", cy: "12", rx: "6.5", ry: "8.5", transform: "rotate(-22 12 12)" }),
      svgEl("path", { d: "M9.5 5.2c2.8 4.4-0.8 9.2 4.8 13.6" })
    );
  }
  if (grind === "Giling V60") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("path", { d: "M4 6h16l-6.2 8.5V19h-3.6v-4.5L4 6z" }),
      svgEl("path", { d: "M7 20h10" })
    );
  }
  if (grind === "Giling sanger") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("circle", { cx: "10", cy: "7", r: "3.5" }),
      svgEl("path", { d: "M13.5 7H20" }),
      svgEl("path", { d: "M6.8 8.2C7 14 8.2 19 10 19s3-5 3.2-10.8" }),
      svgEl("path", { d: "M10 21v-2" })
    );
  }
  if (grind === "Giling French press") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("rect", { x: "7", y: "7", width: "10", height: "13", rx: "2" }),
      svgEl("path", { d: "M12 3v9M9 3h6M7 13h10M17 10h2a1.5 1.5 0 0 1 0 3h-2" })
    );
  }
  return svgEl(
    "svg",
    { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
    svgEl("path", { d: "M8 4h8l-1 4H9L8 4z" }),
    svgEl("path", { d: "M9 8l-2 9.5A2.5 2.5 0 0 0 9.4 20h5.2a2.5 2.5 0 0 0 2.4-2.5L15 8" }),
    svgEl("circle", { cx: "11", cy: "14", r: "0.9", fill: "currentColor" }),
    svgEl("circle", { cx: "13.5", cy: "16", r: "0.9", fill: "currentColor" })
  );
}

export function CheckCircleSvg({ active, className = "h-4 w-4 shrink-0" }) {
  return svgEl(
    "svg",
    { viewBox: "0 0 20 20", className, fill: "none", "aria-hidden": "true" },
    svgEl("circle", {
      cx: "10",
      cy: "10",
      r: "8.5",
      stroke: "currentColor",
      "stroke-width": "1.6",
      opacity: active ? "1" : "0.4",
    }),
    active
      ? svgEl("path", {
          d: "M6.5 10.3l2.2 2.2 4.8-5",
          stroke: "currentColor",
          "stroke-width": "1.8",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        })
      : null
  );
}

export function computeSensoryProfile(bean) {
  const roast = bean?.roast || "Medium";
  const flavors = Array.isArray(bean?.flavors) ? bean.flavors : [];
  const isRobusta = String(bean?.category || "").toLowerCase().includes("robusta");

  let body = roast === "Dark" ? 4.4 : roast === "Medium" ? 3.5 : 2.6;
  let acidity = roast === "Light" ? 4.4 : roast === "Medium" ? 3.2 : 1.9;
  let sweetness = roast === "Medium" ? 4.1 : roast === "Light" ? 3.8 : 3.1;

  if (flavors.includes("Fruity") || flavors.includes("Floral")) {
    acidity = Math.min(5, acidity + 0.5);
    sweetness = Math.min(5, sweetness + 0.3);
  }
  if (flavors.includes("Chocolatey") || flavors.includes("Nutty")) {
    body = Math.min(5, body + 0.4);
    sweetness = Math.min(5, sweetness + 0.3);
  }
  if (flavors.includes("Spicy")) {
    body = Math.min(5, body + 0.3);
  }
  if (isRobusta) {
    body = Math.min(5, body + 0.5);
    acidity = Math.max(1.5, acidity - 0.5);
  }

  const clampScore = (v) => Math.round(Math.min(5, Math.max(1, v)) * 10) / 10;

  return [
    { label: "Body / Kekentalan", score: clampScore(body) },
    { label: "Keasaman Cerah", score: clampScore(acidity) },
    { label: "Kemanisan Alami", score: clampScore(sweetness) },
  ];
}

export function SensoryBars({ bean }) {
  const metrics = computeSensoryProfile(bean);
  return el(
    "div",
    { className: "card space-y-3.5 p-5" },
    el(
      "div",
      { className: "flex items-baseline justify-between gap-2" },
      el("p", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, "Profil Rasa Cangkir"),
      el("span", { className: "text-xs text-espresso-400" }, `${bean.roast} roast`)
    ),
    ...metrics.map((m) =>
      el(
        "div",
        { className: "space-y-1.5" },
        el(
          "div",
          { className: "flex items-center justify-between text-xs" },
          el("span", { className: "font-medium text-espresso-700" }, m.label),
          el("span", { className: "font-semibold tabular-nums text-espresso-500" }, `${m.score.toFixed(1)} / 5`)
        ),
        el(
          "div",
          { className: "h-2 w-full overflow-hidden rounded-full bg-cream-200" },
          el("div", {
            className: "h-full rounded-full bg-terra-600 transition-all duration-300",
            style: `width:${(m.score / 5) * 100}%`,
          })
        )
      )
    )
  );
}

export function ShippingTierBar({ totalWeight, compact = false }) {
  const kgTier = Math.max(1, Math.ceil(totalWeight / 1000));
  const tierCap = kgTier * 1000;
  const remaining = Math.max(0, tierCap - totalWeight);
  const pct = totalWeight === 0 ? 0 : Math.min(100, Math.round((totalWeight / tierCap) * 100));

  const hintText =
    totalWeight === 0
      ? "Kapasitas ongkir dasar 1 kg untuk hemat biaya kirim."
      : remaining === 0
      ? `Pas di batas ${kgTier} kg — efisiensi ongkir maksimal.`
      : `Muat ${formatWeight(remaining)} lagi tanpa tambahan ongkir ${kgTier} kg.`;

  return el(
    "div",
    {
      className: compact
        ? "rounded-2xl border border-terra-200 bg-terra-100/70 p-3.5"
        : "rounded-2xl border border-terra-200 bg-terra-100/60 p-4",
    },
    el(
      "div",
      { className: "flex items-baseline justify-between gap-2 text-xs" },
      el("span", { className: "font-semibold text-espresso-700" }, "Kapasitas ongkir"),
      el("span", { className: "font-semibold tabular-nums text-terra-700" }, `${formatWeight(totalWeight)} / ${kgTier} kg`)
    ),
    el(
      "div",
      { className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-white" },
      el("div", {
        className: "h-full rounded-full bg-terra-600 transition-all duration-300",
        style: `width:${pct}%`,
      })
    ),
    el("p", { className: "mt-2 text-xs leading-relaxed text-espresso-600" }, hintText)
  );
}

export function CourierIcon({ id, className = "h-5 w-5 shrink-0" }) {
  if (id === "cepat") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("path", { d: "M13 3L4 14h7l-1 7 9-11h-7l1-7z" })
    );
  }
  if (id === "hemat") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("path", { d: "M3 7l9-4 9 4-9 4-9-4z" }),
      svgEl("path", { d: "M3 7v10l9 4 9-4V7M12 11v10" })
    );
  }
  if (id === "ambil") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("path", { d: "M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9z" }),
      svgEl("path", { d: "M3 10l2-5h14l2 5" }),
      svgEl("path", { d: "M9 20v-6h6v6" })
    );
  }
  return svgEl(
    "svg",
    { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
    svgEl("path", { d: "M3 7h11v9H3zM14 10h4l3 3v3h-7v-6z" }),
    svgEl("circle", { cx: "7.5", cy: "17.5", r: "1.8" }),
    svgEl("circle", { cx: "17.5", cy: "17.5", r: "1.8" })
  );
}

export function PaymentIcon({ id, className = "h-5 w-5 shrink-0" }) {
  if (id === "ewallet") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("rect", { x: "3", y: "6", width: "18", height: "13", rx: "2.5" }),
      svgEl("path", { d: "M15 12h6v3h-6a1.5 1.5 0 0 1 0-3z" })
    );
  }
  if (id === "cod") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("rect", { x: "3", y: "7", width: "18", height: "10", rx: "2" }),
      svgEl("circle", { cx: "12", cy: "12", r: "2.2" })
    );
  }
  return svgEl(
    "svg",
    { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
    svgEl("path", { d: "M3 9l9-5 9 5H3z" }),
    svgEl("path", { d: "M5 10v7M10 10v7M14 10v7M19 10v7M3 19h18" })
  );
}

export function OrderStepIcon({ step, className = "h-4 w-4" }) {
  if (step === "Menunggu pembayaran") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("circle", { cx: "12", cy: "12", r: "9" }),
      svgEl("path", { d: "M12 7v5l3 2" })
    );
  }
  if (step === "Dibayar") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("rect", { x: "3", y: "6", width: "18", height: "12", rx: "2" }),
      svgEl("path", { d: "M3 10h18" })
    );
  }
  if (step === "Diproses") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("path", { d: "M4 13h16M7 13a5 5 0 0 1 10 0" }),
      svgEl("path", { d: "M8 17h8M12 13v4" })
    );
  }
  if (step === "Dikirim") {
    return svgEl(
      "svg",
      { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
      svgEl("path", { d: "M3 7h11v9H3zM14 10h4l3 3v3h-7v-6z" }),
      svgEl("circle", { cx: "7.5", cy: "17.5", r: "1.6" }),
      svgEl("circle", { cx: "17.5", cy: "17.5", r: "1.6" })
    );
  }
  return svgEl(
    "svg",
    { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
    svgEl("path", { d: "M5 13l4 4L19 7" })
  );
}
