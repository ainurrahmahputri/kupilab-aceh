import { el } from "../utils/dom.js";
import { BREW_METHODS } from "../data/brews.js";

export function CalculatorPage() {
  let methodId = "v60";
  let mode = "cups";
  let cups = 1;
  let grams = 15;

  const methodsGrid = el("div", { className: "grid gap-2.5 sm:grid-cols-2" });
  const modeWrap = el("div", { className: "flex gap-2" });
  const sliderLabel = el("label", { className: "label tabular-nums", htmlFor: "calc-range" });
  const sliderMin = el("span");
  const sliderMax = el("span");
  const slider = el("input", {
    id: "calc-range",
    type: "range",
    className: "mt-2 w-full accent-espresso-700",
    onInput: (e) => {
      const val = Number(e.target.value);
      if (mode === "cups") cups = val;
      else grams = val;
      renderResult();
    },
  });

  const primaryStatLabel = el("p", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" });
  const primaryStatVal = el("p", { className: "mt-1 font-display text-4xl tabular-nums text-espresso-700" });
  const waterVal = el("p", { className: "mt-1 font-display text-4xl tabular-nums text-espresso-700" });
  const ratioNote = el("p", { className: "mt-1 text-sm tabular-nums text-espresso-400" });
  const recipeTitle = el("h2", { className: "text-2xl !text-white" });
  const recipeBody = el("dl", { className: "mt-5 space-y-3 text-sm" });
  const recipeTip = el("p", { className: "mt-6 rounded-xl bg-white/10 p-4 text-sm leading-relaxed text-cream-100" });

  const renderResult = () => {
    const m = BREW_METHODS.find((b) => b.id === methodId) || BREW_METHODS[0];
    const targetWater = mode === "cups" ? cups * m.cupMl : Math.round(grams * m.ratio);
    const targetCoffee = mode === "cups" ? Math.round(targetWater / m.ratio) : grams;

    sliderLabel.textContent = mode === "cups" ? `Jumlah cangkir: ${cups} (${m.cupMl} ml / cangkir)` : `Berat kopi: ${grams} gram`;

    if (mode === "cups") {
      slider.min = "1";
      slider.max = "6";
      slider.step = "1";
      slider.value = String(cups);
      sliderMin.textContent = "1 cangkir";
      sliderMax.textContent = "6 cangkir";
    } else {
      slider.min = "10";
      slider.max = "80";
      slider.step = "1";
      slider.value = String(grams);
      sliderMin.textContent = "10 g";
      sliderMax.textContent = "80 g";
    }

    primaryStatLabel.textContent = mode === "cups" ? "Kopi yang dibutuhkan" : "Cangkir (perkiraan)";
    primaryStatVal.textContent = mode === "cups" ? `${targetCoffee} g` : `${(targetWater / m.cupMl).toFixed(1).replace(".", ",")}x`;
    waterVal.textContent = `${targetWater} ml`;
    ratioNote.textContent = `Rasio 1 : ${m.ratio}`;

    recipeTitle.textContent = m.name;
    recipeBody.replaceChildren(
      ...[
        ["Suhu air", m.temp],
        ["Gilingan", m.grind],
        ["Waktu seduh", m.time],
        ["Rasio", `1 : ${m.ratio}`],
      ].map(([k, v]) =>
        el(
          "div",
          { className: "flex justify-between gap-4 border-b border-white/10 pb-2" },
          el("dt", { className: "text-espresso-300" }, k),
          el("dd", { className: "text-right font-semibold tabular-nums text-white" }, v)
        )
      )
    );
    recipeTip.textContent = m.tip;
  };

  const renderControls = () => {
    methodsGrid.replaceChildren(
      ...BREW_METHODS.map((m) => {
        const active = m.id === methodId;
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `rounded-xl border p-3 text-left transition ${
              active ? "border-espresso-700 bg-espresso-700 text-white" : "border-espresso-200 hover:border-espresso-400"
            }`,
            onClick: () => {
              methodId = m.id;
              renderControls();
              renderResult();
            },
          },
          el("span", { className: "block font-semibold" }, m.name),
          el("span", { className: "text-xs opacity-75 tabular-nums" }, `1 : ${m.ratio} · ${m.temp}`)
        );
      })
    );

    modeWrap.replaceChildren(
      ...[
        ["cups", "Dari jumlah cangkir"],
        ["grams", "Dari gram kopi"],
      ].map(([key, label]) => {
        const active = mode === key;
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `filter-btn ${active ? "filter-btn-active" : ""}`,
            onClick: () => {
              mode = key;
              renderControls();
              renderResult();
            },
          },
          label
        );
      })
    );
  };

  renderControls();
  renderResult();

  return el(
    "div",
    { className: "page-in container-x py-12" },
    el("p", { className: "eyebrow" }, "Kalkulator seduh"),
    el("h1", { className: "mt-2 text-3xl sm:text-5xl" }, "Hitung takaran kopi"),
    el("p", { className: "mt-3 max-w-2xl text-espresso-500" }, "Pilih metode seduh, tentukan jumlah cangkir atau berat kopi yang kamu punya."),
    el(
      "div",
      { className: "mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr]" },
      el(
        "div",
        { className: "space-y-6" },
        el("div", { className: "card p-6" }, el("span", { className: "label" }, "Metode seduh"), methodsGrid),
        el(
          "div",
          { className: "card space-y-5 p-6" },
          el("div", null, el("span", { className: "label" }, "Hitung berdasarkan"), modeWrap),
          el(
            "div",
            null,
            sliderLabel,
            slider,
            el("div", { className: "mt-1 flex justify-between text-xs tabular-nums text-espresso-400" }, sliderMin, sliderMax)
          )
        ),
        el(
          "div",
          { className: "grid gap-4 rounded-[2rem] border border-espresso-100 bg-terra-100/70 p-6 sm:grid-cols-2" },
          el("div", null, primaryStatLabel, primaryStatVal),
          el("div", null, el("p", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, "Air yang dibutuhkan"), waterVal, ratioNote)
        )
      ),
      el(
        "aside",
        { className: "rounded-[2rem] bg-espresso-700 p-8 text-cream-50 lg:sticky lg:top-24 lg:self-start" },
        recipeTitle,
        recipeBody,
        recipeTip
      )
    )
  );
}
