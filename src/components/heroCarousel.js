import { el, svgEl } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { BagSvg } from "./media.js";

const SLIDES = [
  {
    tag: "Fermentasi anaerob",
    l1: "GAYO",
    l2: "ANAEROB",
    text: "Difermentasi tertutup 72 jam di dataran tinggi Takengon. Blackcurrant, buah beri matang, madu bunga.",
    to: "/toko",
    cta: "Belanja sekarang",
    bag: "dark",
    bg: "from-espresso-900 via-espresso-800 to-espresso-700",
    glow: "bg-terra-600/35",
    spots: [
      { x: 86, y: 22, side: "right", label: "Ketinggian", value: "1.500 mdpl" },
      { x: 14, y: 52, side: "left", label: "Sangrai", value: "Light" },
      { x: 88, y: 76, side: "right", label: "Kemasan", value: "200 g" },
    ],
  },
  {
    tag: "Petik merah",
    l1: "DARI",
    l2: "KEBUN",
    text: "Hanya buah merah matang yang dipetik tangan, bertahap. Dari situlah manis di cangkirmu berasal.",
    to: "/kenali-kopi",
    cta: "Kenali kopinya",
    bag: "olive",
    bg: "from-[#23301c] via-terra-700 to-terra-600",
    glow: "bg-terra-200/30",
    spots: [
      { x: 87, y: 26, side: "right", label: "Panen", value: "Petik merah" },
      { x: 13, y: 58, side: "left", label: "Kebun", value: "Takengon" },
    ],
  },
  {
    tag: "Catatan tiap batch",
    l1: "SANGRAI",
    l2: "TERUKUR",
    text: "Suhu dan waktu tiap batch kami catat, supaya rasa yang kamu suka selalu bisa diulang.",
    to: "/proses",
    cta: "Lihat prosesnya",
    bag: "light",
    bg: "from-espresso-800 via-espresso-600 to-espresso-500",
    glow: "bg-cream-200/25",
    spots: [
      { x: 86, y: 30, side: "right", label: "Suhu puncak", value: "210°C" },
      { x: 12, y: 62, side: "left", label: "Waktu", value: "11 menit" },
      { x: 88, y: 80, side: "right", label: "Istirahat", value: "3 - 7 hari" },
    ],
  },
];

const FLOATING_BEANS = [
  { x: 6, y: 18, s: 1.1, r: -24, d: 0 },
  { x: 16, y: 66, s: 0.75, r: 40, d: 1.3 },
  { x: 27, y: 36, s: 0.55, r: 12, d: 2.1 },
  { x: 74, y: 14, s: 0.9, r: 28, d: 0.6 },
  { x: 86, y: 44, s: 1.25, r: -16, d: 1.8 },
  { x: 92, y: 74, s: 0.65, r: 52, d: 2.6 },
  { x: 66, y: 82, s: 0.85, r: -38, d: 0.9 },
  { x: 54, y: 8, s: 0.6, r: 64, d: 2.3 },
  { x: 38, y: 88, s: 0.7, r: -8, d: 1.5 },
];

function FloatingBeansLayer() {
  return el(
    "div",
    { className: "pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70", "aria-hidden": "true" },
    ...FLOATING_BEANS.map((b) =>
      svgEl(
        "svg",
        {
          viewBox: "0 0 40 56",
          className: "float-bean absolute",
          style: {
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.s * 46}px`,
            animationDelay: `${b.d}s`,
            "--r": `${b.r}deg`,
          },
        },
        svgEl(
          "defs",
          null,
          svgEl(
            "linearGradient",
            { id: "heroBeanGrad", x1: "0", y1: "0", x2: "1", y2: "1" },
            svgEl("stop", { offset: "0", "stop-color": "#8a5a36" }),
            svgEl("stop", { offset: "1", "stop-color": "#1d1109" })
          )
        ),
        svgEl("ellipse", { cx: "20", cy: "28", rx: "18", ry: "26", fill: "#43291d" }),
        svgEl("ellipse", { cx: "20", cy: "28", rx: "18", ry: "26", fill: "url(#heroBeanGrad)", opacity: "0.35" }),
        svgEl("path", { d: "M14 5c12 10 -12 34 4 46", stroke: "#1d1109", "stroke-width": "4", fill: "none", "stroke-linecap": "round" }),
        svgEl("ellipse", { cx: "12", cy: "14", rx: "4", ry: "7", fill: "#ffffff", opacity: "0.18", transform: "rotate(-20 12 14)" })
      )
    )
  );
}

function renderSpots(spots) {
  const container = el("div", { className: "pointer-events-none absolute inset-0 hidden sm:block", "aria-hidden": "true" });
  const timers = [];

  spots.forEach((spot, i) => {
    const isRight = spot.side === "right";
    const line = el("span", {
      className: "h-px bg-white/55 transition-all duration-700 ease-out",
      style: { width: "0px" },
    });
    const textBox = el(
      "span",
      {
        className: "whitespace-nowrap rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm transition-all duration-500",
        style: { opacity: "0", transform: `translateX(${isRight ? -10 : 10}px)` },
      },
      el("span", { className: "block text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-300" }, spot.label),
      el("span", { className: "block text-sm font-semibold tabular-nums text-white" }, spot.value)
    );

    const row = el(
      "div",
      {
        className: "absolute flex items-center gap-0 transition-all duration-500",
        style: {
          left: `${spot.x}%`,
          top: `${spot.y}%`,
          transform: `translate(${isRight ? "0" : "-100%"}, -50%)`,
          opacity: "0",
          flexDirection: isRight ? "row" : "row-reverse",
        },
      },
      el("span", { className: "h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white bg-cream-300" }),
      line,
      textBox
    );

    container.appendChild(row);
    const t = window.setTimeout(() => {
      row.style.opacity = "1";
      line.style.width = "44px";
      textBox.style.opacity = "1";
      textBox.style.transform = "none";
    }, 650 + i * 320);
    timers.push(t);
  });

  return { container, stopTimers: () => timers.forEach(clearTimeout) };
}

export function HeroCarousel() {
  let index = 0;
  let paused = false;
  let pointerStart = null;
  let autoTimer = null;
  let stopSpotTimers = () => {};

  const bgLayer = el("div", { className: `absolute inset-0 -z-10 bg-gradient-to-br transition-colors duration-700 ${SLIDES[0].bg}` });
  const glowLayer = el("div", {
    className: `absolute -right-24 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700 ${SLIDES[0].glow}`,
  });

  const textSlot = el("div");
  const bagSlot = el("div");
  const dotsSlot = el("div", { className: "ml-2 flex gap-2" });
  const counterEl = el("span", { className: "ml-auto font-display text-sm tabular-nums text-cream-200", "aria-hidden": "true" });

  const renderSlide = () => {
    stopSpotTimers();
    const s = SLIDES[index];
    bgLayer.className = `absolute inset-0 -z-10 bg-gradient-to-br transition-colors duration-700 ${s.bg}`;
    glowLayer.className = `absolute -right-24 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700 ${s.glow}`;

    textSlot.replaceChildren(
      el(
        "div",
        { className: "hero-text relative z-10" },
        el("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-cream-300" }, s.tag),
        el(
          "h1",
          { className: "mt-4 font-display text-[3.4rem] leading-[0.92] !text-white sm:text-7xl lg:text-8xl" },
          el("span", { className: "block" }, s.l1),
          el("span", { className: "block text-cream-300" }, s.l2)
        ),
        el("p", { className: "mt-5 max-w-sm leading-relaxed text-cream-200" }, s.text),
        el(
          "div",
          { className: "mt-8 flex flex-wrap items-center gap-3" },
          routeLink(s.to, { className: "btn bg-white px-7 text-espresso-700 hover:bg-cream-100" }, s.cta),
          routeLink("/proses", { className: "btn border border-white/35 text-white hover:bg-white/10" }, "Dari petani ke cangkir")
        )
      )
    );

    const { container: spotsEl, stopTimers } = renderSpots(s.spots);
    stopSpotTimers = stopTimers;

    bagSlot.replaceChildren(
      el(
        "div",
        { className: "relative z-10 mx-auto w-52 sm:w-64 lg:w-72" },
        el(
          "div",
          { className: "hero-bag bag-float" },
          BagSvg({ tone: s.bag, className: "w-full h-auto drop-shadow-[0_30px_50px_rgba(0,0,0,.45)]" })
        ),
        spotsEl
      )
    );

    dotsSlot.replaceChildren(
      ...SLIDES.map((item, i) =>
        el("button", {
          type: "button",
          onClick: () => goTo(i),
          "aria-label": `Ke sorotan ${i + 1}: ${item.l1} ${item.l2}`,
          "aria-current": i === index ? "true" : undefined,
          className: `h-2.5 rounded-full transition-all duration-300 ${i === index ? "w-10 bg-white" : "w-2.5 bg-white/45 hover:bg-white/80"}`,
        })
      )
    );

    counterEl.textContent = `0${index + 1} / 0${SLIDES.length}`;
  };

  const resetTimer = () => {
    if (autoTimer) clearInterval(autoTimer);
    if (paused) return;
    autoTimer = setInterval(() => {
      index = (index + 1) % SLIDES.length;
      renderSlide();
    }, 7000);
  };

  const goTo = (nextIdx) => {
    const n = SLIDES.length;
    index = ((nextIdx % n) + n) % n;
    renderSlide();
    resetTimer();
  };

  const arrowSvg = (right) =>
    svgEl(
      "svg",
      {
        viewBox: "0 0 24 24",
        className: "h-5 w-5",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2.2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      svgEl("path", { d: right ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7" })
    );

  const section = el(
    "section",
    {
      className: "relative isolate overflow-hidden",
      "aria-roledescription": "carousel",
      "aria-label": "Sorotan KupiLab Aceh",
      onMouseEnter: () => {
        paused = true;
        resetTimer();
      },
      onMouseLeave: () => {
        paused = false;
        resetTimer();
      },
      onFocusIn: () => {
        paused = true;
        resetTimer();
      },
      onFocusOut: () => {
        paused = false;
        resetTimer();
      },
      onKeyDown: (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goTo(index + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          goTo(index - 1);
        }
      },
      onPointerDown: (e) => {
        pointerStart = e.clientX;
      },
      onPointerUp: (e) => {
        if (pointerStart === null) return;
        const delta = e.clientX - pointerStart;
        pointerStart = null;
        if (Math.abs(delta) > 60) {
          goTo(index + (delta < 0 ? 1 : -1));
        }
      },
    },
    bgLayer,
    glowLayer,
    FloatingBeansLayer(),
    el(
      "div",
      { className: "container-x grid min-h-[32rem] items-center gap-6 py-14 sm:min-h-[36rem] lg:grid-cols-[1.15fr_1fr] lg:py-20" },
      textSlot,
      bagSlot
    ),
    el(
      "div",
      { className: "container-x relative z-10 flex items-center gap-4 pb-8" },
      el(
        "button",
        {
          type: "button",
          onClick: () => goTo(index - 1),
          "aria-label": "Sorotan sebelumnya",
          className: "flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition hover:bg-white hover:text-espresso-700",
        },
        arrowSvg(false)
      ),
      el(
        "button",
        {
          type: "button",
          onClick: () => goTo(index + 1),
          "aria-label": "Sorotan berikutnya",
          className: "flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition hover:bg-white hover:text-espresso-700",
        },
        arrowSvg(true)
      ),
      dotsSlot,
      counterEl
    )
  );

  renderSlide();
  resetTimer();

  const cleanup = () => {
    if (autoTimer) clearInterval(autoTimer);
    stopSpotTimers();
  };

  return { element: section, cleanup };
}
