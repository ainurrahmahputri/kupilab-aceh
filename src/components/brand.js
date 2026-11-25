import { el } from "../utils/dom.js";

export function BrandWordmark({ light = false }) {
  return el(
    "span",
    {
      className: `font-display text-xl tracking-tight whitespace-nowrap shrink-0 ${
        light ? "text-cream-50" : "text-espresso-800"
      }`,
    },
    "KupiLab Aceh"
  );
}
