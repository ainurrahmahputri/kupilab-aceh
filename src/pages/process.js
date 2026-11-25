import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { PROCESS_STAGES, ProcessStageSvg } from "../components/processStages.js";

function renderBottomCta() {
  return el(
    "div",
    { className: "mt-6 rounded-[2rem] bg-espresso-700 p-8 text-cream-50 sm:p-10" },
    el("h2", { className: "text-3xl !text-white" }, "Sekarang giliran kamu"),
    el("p", { className: "mt-2 max-w-xl text-cream-200" }, "Pilih biji yang baru disangrai, lalu seduh dengan takaran yang pas."),
    el(
      "div",
      { className: "mt-6 flex flex-wrap gap-3" },
      routeLink("/toko", { className: "btn bg-white text-espresso-700 hover:bg-cream-100" }, "Ke toko"),
      routeLink("/kalkulator", { className: "btn border border-cream-400 text-white hover:bg-white/10" }, "Kalkulator seduh")
    )
  );
}

export function ProcessPage() {
  const mq = typeof window !== "undefined" ? window.matchMedia?.("(prefers-reduced-motion: reduce)") : null;
  const reduced = Boolean(mq?.matches);

  const intro = el(
    "div",
    { className: "container-x pt-8 pb-2" },
    el("p", { className: "eyebrow" }, "Dari petani ke cangkir"),
    el("h1", { className: "mt-2 max-w-3xl text-4xl leading-tight sm:text-6xl" }, "Perjalanan sebiji kopi"),
    el(
      "p",
      { className: "mt-4 max-w-2xl leading-relaxed text-espresso-500" },
      "Gulir halaman untuk mengikuti sembilan tahapnya, dari kebun sampai seduhan. Lama tiap tahap adalah perkiraan umum dan berbeda di tiap daerah."
    )
  );

  if (reduced) {
    const element = el(
      "div",
      { className: "page-in" },
      intro,
      el(
        "ol",
        { className: "container-x space-y-10 pb-10" },
        ...PROCESS_STAGES.map((stage, i) =>
          el(
            "li",
            { className: "grid items-center gap-6 md:grid-cols-2" },
            el("div", { className: "aspect-square max-h-72 rounded-[2rem] bg-terra-100/60 p-4" }, ProcessStageSvg({ index: i, t: 1 })),
            el(
              "div",
              null,
              el("p", { className: "eyebrow" }, `${i + 1}. ${stage.who}`),
              el("h2", { className: "mt-2 text-2xl sm:text-3xl" }, stage.title),
              el("p", { className: "mt-1 text-sm font-semibold text-terra-600" }, stage.time),
              el("p", { className: "mt-3 leading-relaxed text-espresso-500" }, stage.text)
            )
          )
        )
      ),
      el("div", { className: "container-x pb-10" }, renderBottomCta())
    );
    return { element, cleanup: () => {} };
  }

  let activeIdx = -1;
  let rafId = 0;

  const scrollyTrack = el("div", {
    className: "relative",
    style: { height: `${PROCESS_STAGES.length * 95}vh` },
  });

  const stageSvgSlot = el("div", { className: "h-full w-full" });
  const counterLabel = el("p", { className: "eyebrow tabular-nums" });
  const stageTitle = el("h2", { className: "mt-2 text-3xl leading-tight sm:text-5xl" });
  const stageTime = el("p", { className: "mt-2 text-sm font-semibold tabular-nums text-espresso-500" });
  const stageText = el("p", { className: "mt-4 max-w-lg text-base leading-relaxed text-espresso-600 sm:text-lg" });
  const textSwapWrap = el("div", { className: "step-in" }, counterLabel, stageTitle, stageTime, stageText);
  const progressBar = el("div", { className: "h-full rounded-full bg-terra-600 transition-all duration-150" });

  const jumpTo = (i) => {
    const rect = scrollyTrack.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const travel = Math.max(1, scrollyTrack.offsetHeight - (window.innerHeight - 64));
    window.scrollTo({
      top: docTop - 64 + ((i + 0.5) / PROCESS_STAGES.length) * travel,
      behavior: "smooth",
    });
  };

  const stepDotsWrap = el("div", { className: "mt-5 flex flex-wrap items-center gap-2" });
  const dotButtons = PROCESS_STAGES.map((stage, i) =>
    el("button", {
      type: "button",
      onClick: () => jumpTo(i),
      "aria-label": `Loncat ke tahap ${i + 1}: ${stage.title}`,
      className: "h-2.5 w-2.5 rounded-full bg-espresso-200 transition-all hover:bg-espresso-400",
    })
  );
  stepDotsWrap.append(...dotButtons);

  const updateStage = (progress) => {
    const total = PROCESS_STAGES.length;
    const idx = Math.min(total - 1, Math.floor(progress * total));
    const localT = progress * total - idx;
    const stage = PROCESS_STAGES[idx];

    stageSvgSlot.replaceChildren(ProcessStageSvg({ index: idx, t: localT }));
    progressBar.style.width = `${Math.max(4, localT * 100)}%`;

    if (idx !== activeIdx) {
      activeIdx = idx;
      counterLabel.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")} · ${stage.who}`;
      stageTitle.textContent = stage.title;
      stageTime.textContent = stage.time;
      stageText.textContent = stage.text;

      textSwapWrap.classList.remove("step-in");
      void textSwapWrap.offsetWidth;
      textSwapWrap.classList.add("step-in");

      dotButtons.forEach((btn, di) => {
        if (di === idx) {
          btn.className = "h-2.5 w-8 rounded-full bg-espresso-700 transition-all";
          btn.setAttribute("aria-current", "true");
        } else if (di < idx) {
          btn.className = "h-2.5 w-2.5 rounded-full bg-terra-500 transition-all hover:bg-espresso-400";
          btn.removeAttribute("aria-current");
        } else {
          btn.className = "h-2.5 w-2.5 rounded-full bg-espresso-200 transition-all hover:bg-espresso-400";
          btn.removeAttribute("aria-current");
        }
      });
    }
  };

  const computeScroll = () => {
    rafId = 0;
    const rect = scrollyTrack.getBoundingClientRect();
    const travel = Math.max(1, rect.height - (window.innerHeight - 64));
    const progress = Math.max(0, Math.min(0.9999, (64 - rect.top) / travel));
    updateStage(progress);
  };

  const onScroll = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(computeScroll);
    }
  };

  scrollyTrack.appendChild(
    el(
      "div",
      { className: "sticky top-16 overflow-hidden py-6 sm:py-8" },
      el(
        "div",
        { className: "container-x grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-14" },
        el(
          "div",
          { className: "relative mx-auto aspect-square w-full max-w-[25rem] rounded-[2rem] bg-terra-100/60 p-6" },
          stageSvgSlot
        ),
        el(
          "div",
          null,
          textSwapWrap,
          el(
            "div",
            { className: "mt-7 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-espresso-100" },
            progressBar
          ),
          stepDotsWrap
        )
      )
    )
  );

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateStage(0);

  const element = el(
    "div",
    { className: "page-in" },
    intro,
    scrollyTrack,
    el("div", { className: "container-x pb-10 pt-8" }, renderBottomCta())
  );

  return {
    element,
    cleanup: () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    },
  };
}
