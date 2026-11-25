import { el, svgEl } from "../utils/dom.js";

function chevronIcon(right) {
  return svgEl(
    "svg",
    {
      viewBox: "0 0 24 24",
      className: "h-5 w-5",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    svgEl("path", { d: right ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6" })
  );
}

export function CarouselRow({ label, children }) {
  const track = el(
    "div",
    {
      role: "region",
      "aria-label": label,
      className: "flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    },
    ...children
  );

  const prevBtn = el(
    "button",
    {
      type: "button",
      className: "btn-arrow",
      "aria-label": `Geser ${label} ke kiri`,
      onClick: () => track.scrollBy({ left: -Math.round(track.clientWidth * 0.78), behavior: "smooth" }),
    },
    chevronIcon(false)
  );

  const nextBtn = el(
    "button",
    {
      type: "button",
      className: "btn-arrow",
      "aria-label": `Geser ${label} ke kanan`,
      onClick: () => track.scrollBy({ left: Math.round(track.clientWidth * 0.78), behavior: "smooth" }),
    },
    chevronIcon(true)
  );

  const syncButtons = () => {
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };

  track.addEventListener("scroll", syncButtons, { passive: true });
  requestAnimationFrame(syncButtons);

  return el(
    "div",
    { className: "relative" },
    track,
    el("div", { className: "mt-4 flex justify-end gap-2" }, prevBtn, nextBtn)
  );
}
