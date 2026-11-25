import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { COFFEE_FORMS, NUSANTARA_ORIGINS, SPECIES_COMPARISON } from "../data/origins.js";
import { revealWrap } from "../utils/reveal.js";
import { CoffeeWheel } from "../components/coffeeWheel.js";
import { CoffeeFormSvg, EditorialImage } from "../components/media.js";
import { CarouselRow } from "../components/carouselRow.js";

export function KnowCoffeePage() {
  return el(
    "div",
    { className: "page-in" },
    el(
      "section",
      { className: "border-b border-espresso-100 bg-cream-100/70" },
      el(
        "div",
        { className: "container-x grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr]" },
        el(
          "div",
          null,
          el("p", { className: "eyebrow" }, "Kenali kopi Indonesia"),
          el("h1", { className: "mt-3 text-4xl leading-tight sm:text-5xl" }, "Kopi dari ujung Sumatera sampai Papua"),
          el(
            "p",
            { className: "mt-5 max-w-xl leading-relaxed text-espresso-500" },
            "Indonesia menanam kopi di ratusan lereng gunung. Ketinggian, tanah, varietas, dan cara olah membuat tiap daerah punya rasa sendiri. Berikut delapan yang paling sering kami bahas di KupiLab."
          ),
          routeLink("/toko", { className: "btn-primary mt-7" }, "Lihat biji di toko")
        ),
        CoffeeWheel()
      )
    ),
    el(
      "section",
      { className: "container-x grid gap-8 py-14 lg:grid-cols-[1fr_1.1fr] lg:items-center" },
      revealWrap(
        el(
          "div",
          null,
          el("h2", { className: "text-3xl sm:text-4xl" }, "Arabika dan robusta"),
          el(
            "p",
            { className: "mt-3 max-w-2xl text-espresso-500" },
            "Dua spesies ini menentukan karakter dasar. Hampir semua kopi spesialti Indonesia adalah arabika; robusta kuat di Lampung, Jawa, dan Sumatera bagian selatan."
          ),
          el(
            "div",
            { className: "mt-6 overflow-x-auto" },
            el(
              "table",
              { className: "w-full min-w-[32rem] border-collapse text-sm" },
              el(
                "thead",
                null,
                el(
                  "tr",
                  { className: "border-b border-espresso-300 text-left" },
                  el("th", { className: "py-2 pr-4 font-semibold" }, el("span", { className: "sr-only" }, "Aspek")),
                  el("th", { className: "py-2 pr-4 font-display text-lg font-normal" }, "Arabika"),
                  el("th", { className: "py-2 font-display text-lg font-normal" }, "Robusta")
                )
              ),
              el(
                "tbody",
                null,
                ...SPECIES_COMPARISON.map(([aspect, arabika, robusta]) =>
                  el(
                    "tr",
                    { className: "border-b border-espresso-200/70" },
                    el("th", { scope: "row", className: "py-3 pr-4 text-left font-semibold text-espresso-400" }, aspect),
                    el("td", { className: "py-3 pr-4" }, arabika),
                    el("td", { className: "py-3" }, robusta)
                  )
                )
              )
            )
          )
        ),
        0,
        "order-2 lg:order-1"
      ),
      revealWrap(
        EditorialImage({
          name: "greenBeans",
          alt: "Biji kopi hijau sebelum disangrai",
          className: "group aspect-[4/3] w-full rounded-[2rem]",
        }),
        120,
        "order-1 lg:order-2"
      )
    ),
    el(
      "section",
      { className: "border-y border-espresso-100 bg-cream-100/70" },
      el(
        "div",
        { className: "container-x py-14" },
        el("p", { className: "eyebrow" }, "Delapan bentuk"),
        el("h2", { className: "mt-2 text-3xl sm:text-4xl" }, "Dari buah sampai bubuk"),
        el(
          "p",
          { className: "mt-3 max-w-2xl text-espresso-500" },
          "Sebutir kopi berganti bentuk beberapa kali sebelum sampai ke cangkir. Ini wujudnya di tiap tahap."
        ),
        el(
          "div",
          { className: "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" },
          ...COFFEE_FORMS.map((form, i) =>
            revealWrap(
              el(
                "article",
                { className: "flex h-full flex-col rounded-[2rem] bg-white p-6" },
                el("div", { className: "h-20 w-20 rounded-2xl bg-cream-100 p-1.5" }, CoffeeFormSvg({ kind: form.kind })),
                el("h3", { className: "mt-4 text-xl leading-snug" }, form.name),
                el("p", { className: "mt-2 text-sm leading-relaxed text-espresso-500" }, form.text)
              ),
              Math.min(i, 4) * 80
            )
          )
        )
      )
    ),
    el(
      "section",
      { className: "container-x py-14 pb-10" },
      el(
        "div",
        { className: "mb-10" },
        el("p", { className: "eyebrow" }, "Delapan asal"),
        el("h2", { className: "mt-2 text-3xl sm:text-4xl" }, "Daerah penghasil")
      ),
      CarouselRow({
        label: "daerah penghasil kopi",
        children: NUSANTARA_ORIGINS.map((origin) =>
          el(
            "article",
            { className: "card lift flex w-[17rem] shrink-0 snap-start flex-col p-5 sm:w-[19rem]" },
            el("div", { className: "h-20 w-20 rounded-2xl bg-cream-100 p-1.5" }, CoffeeFormSvg({ kind: origin.item })),
            el("p", { className: "eyebrow mt-4 !text-[11px]" }, origin.province),
            el("h3", { className: "mt-1 text-xl leading-snug" }, origin.name),
            el("p", { className: "mt-1 text-sm text-espresso-400" }, origin.place),
            el("p", { className: "mt-3 text-sm leading-relaxed text-espresso-500" }, origin.about),
            el(
              "dl",
              { className: "mt-4 space-y-1 border-t border-espresso-200/70 pt-3 text-xs" },
              el(
                "div",
                { className: "flex justify-between gap-3" },
                el("dt", { className: "text-espresso-400" }, "Jenis"),
                el("dd", { className: "font-semibold" }, origin.species)
              ),
              el(
                "div",
                { className: "flex justify-between gap-3" },
                el("dt", { className: "text-espresso-400" }, "Ketinggian"),
                el("dd", { className: "text-right font-semibold tabular-nums" }, origin.altitude)
              ),
              el(
                "div",
                { className: "flex justify-between gap-3" },
                el("dt", { className: "text-espresso-400" }, "Olah"),
                el("dd", { className: "text-right font-semibold" }, origin.process)
              )
            ),
            el("p", { className: "mt-3 text-xs font-medium text-terra-600" }, origin.flavors.join(" · "))
          )
        ),
      }),
      el(
        "p",
        { className: "mt-6 text-xs text-espresso-400" },
        "Ketinggian dan karakter rasa adalah rentang umum, bisa berbeda antar kebun dan panen."
      )
    )
  );
}
