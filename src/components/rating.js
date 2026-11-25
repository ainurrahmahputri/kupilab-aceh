import { el, svgEl } from "../utils/dom.js";

function StarSvg(filled, size) {
  return svgEl(
    "svg",
    {
      width: String(size),
      height: String(size),
      viewBox: "0 0 24 24",
      fill: filled ? "#7e7d4b" : "none",
      stroke: "#7e7d4b",
      "stroke-width": "1.8",
      "aria-hidden": "true",
    },
    svgEl("path", {
      d: "M12 2.8l2.85 5.78 6.38.93-4.61 4.5 1.09 6.35L12 17.36l-5.71 3 1.09-6.35-4.61-4.5 6.38-.93z",
    })
  );
}

export function StarRatingDisplay({ value = 0, size = 16 }) {
  const rounded = Math.round(Number(value) || 0);
  return el(
    "span",
    {
      className: "inline-flex items-center gap-0.5",
      role: "img",
      "aria-label": `${rounded} dari 5 bintang`,
    },
    ...[1, 2, 3, 4, 5].map((i) => StarSvg(i <= rounded, size))
  );
}

export function RatingSummary({ avg = 0, count = 0 }) {
  if (!count) {
    return el("span", { className: "text-xs text-espresso-400" }, "Belum ada ulasan");
  }
  return el(
    "span",
    { className: "inline-flex items-center gap-1.5 text-sm" },
    StarRatingDisplay({ value: avg, size: 15 }),
    el("span", { className: "font-semibold tabular-nums text-espresso-700" }, avg.toFixed(1)),
    el("span", { className: "text-xs tabular-nums text-espresso-400" }, `(${count})`)
  );
}

export function StarRatingInput({ initialValue = 5, onChange }) {
  let value = initialValue;
  const group = el("div", { className: "flex items-center gap-1", role: "radiogroup", "aria-label": "Pilih rating bintang" });

  const renderButtons = () => {
    group.replaceChildren(
      ...[1, 2, 3, 4, 5].map((n) =>
        el(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": String(value === n),
            "aria-label": `${n} bintang`,
            className: "rounded-lg p-1 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-terra-400",
            onClick: () => {
              value = n;
              renderButtons();
              onChange?.(n);
            },
          },
          StarSvg(n <= value, 24)
        )
      )
    );
  };

  renderButtons();
  return group;
}
