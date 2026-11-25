import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { revealWrap } from "../utils/reveal.js";
import { batchCountdownLabel, formatLongDate, formatShortDate } from "../utils/format.js";
import { HeroCarousel } from "../components/heroCarousel.js";
import { JourneyShowcase } from "../components/journeyShowcase.js";
import { CarouselRow } from "../components/carouselRow.js";
import { BeanCard } from "../components/beanCard.js";
import { CoffeeWheel } from "../components/coffeeWheel.js";
import { EditorialImage } from "../components/media.js";
import { StarRatingDisplay } from "../components/rating.js";

export function HomePage() {
  const hero = HeroCarousel();
  const journey = JourneyShowcase();

  const beans = store.beans;
  const topRated = [...beans].sort((a, b) => store.ratingOf(b.id).avg - store.ratingOf(a.id).avg).slice(0, 6);
  const recentArticles = [...store.articles]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 3);
  const latestReviews = store.reviews.slice(0, 3);
  const batch = store.batch;

  const element = el(
    "div",
    null,
    hero.element,
    journey.element,
    el(
      "section",
      { className: "container-x py-16" },
      revealWrap(
        el(
          "div",
          { className: "mb-8 flex flex-wrap items-end justify-between gap-4" },
          el(
            "div",
            null,
            el("p", { className: "eyebrow" }, "Pilihan pembeli"),
            el("h2", { className: "mt-2 text-3xl sm:text-4xl" }, "Rating tertinggi")
          ),
          routeLink("/toko", { className: "btn-ghost" }, "Semua produk")
        )
      ),
      CarouselRow({
        label: "produk rating tertinggi",
        children: topRated.map((bean) =>
          el("div", { className: "w-[17rem] shrink-0 snap-start sm:w-[19rem]" }, BeanCard({ bean }))
        ),
      })
    ),
    el(
      "section",
      { className: "border-y border-espresso-100 bg-cream-100/70" },
      el(
        "div",
        { className: "container-x grid items-center gap-10 py-16 lg:grid-cols-[1fr_1.05fr]" },
        revealWrap(
          el(
            "div",
            null,
            el("p", { className: "eyebrow" }, "Kenali kopi Indonesia"),
            el("h2", { className: "mt-3 text-3xl leading-tight sm:text-5xl" }, "Delapan tangan, delapan rasa"),
            el("p", { className: "mt-4 max-w-md leading-relaxed text-espresso-500" }, "Sentuh salah satu tangan untuk melihat kopinya."),
            routeLink("/kenali-kopi", { className: "btn-primary mt-7" }, "Lihat semua daerah")
          )
        ),
        revealWrap(CoffeeWheel(), 120)
      )
    ),
    el(
      "section",
      { className: "container-x grid gap-6 py-16 lg:grid-cols-[1.25fr_1fr]" },
      revealWrap(
        routeLink(
          "/proses",
          { className: "lift group relative flex h-80 items-end overflow-hidden rounded-[2rem]" },
          EditorialImage({ name: "roaster", alt: "Mesin sangrai KupiLab Aceh", className: "absolute inset-0 h-full w-full" }),
          el("span", { className: "absolute inset-0 bg-gradient-to-t from-espresso-900/90 via-espresso-900/40 to-transparent" }),
          el(
            "div",
            { className: "relative p-8" },
            el("p", { className: "eyebrow !text-cream-200 before:!bg-cream-300" }, "Dari petani ke cangkir"),
            el("h2", { className: "mt-2 text-3xl !text-white sm:text-4xl" }, "Sembilan tahap, sambil digulir")
          )
        )
      ),
      revealWrap(
        el(
          "div",
          { className: "flex h-full flex-col gap-6" },
          el(
            "div",
            { className: "rounded-[2rem] border border-espresso-100 p-7" },
            el(
              "div",
              { className: "flex items-center justify-between gap-3" },
              el("p", { className: "eyebrow" }, "Batch sangrai"),
              el("span", { className: "text-xs font-semibold tabular-nums text-terra-600" }, batchCountdownLabel(batch.date))
            ),
            el("p", { className: "mt-3 font-display text-2xl tabular-nums text-espresso-700" }, formatLongDate(batch.date)),
            batch.note ? el("p", { className: "mt-1.5 text-sm text-espresso-500" }, batch.note) : null
          ),
          el(
            "div",
            { className: "flex flex-1 flex-col rounded-[2rem] bg-espresso-700 p-7 text-white" },
            el("h2", { className: "text-2xl !text-white" }, "Kalkulator takaran seduh"),
            el("p", { className: "mt-2 text-sm tabular-nums text-cream-200" }, "V60 1:15 · sanger 1:10 · French press 1:12 · cold brew 1:8"),
            routeLink("/kalkulator", { className: "btn mt-auto w-fit bg-white text-espresso-700 hover:bg-cream-100" }, "Hitung sekarang")
          )
        ),
        120
      )
    ),
    el(
      "section",
      { className: "container-x pb-16" },
      revealWrap(
        el(
          "div",
          { className: "mb-6 flex flex-wrap items-end justify-between gap-4" },
          el(
            "div",
            null,
            el("p", { className: "eyebrow" }, "Jurnal seduh"),
            el("h2", { className: "mt-2 text-3xl sm:text-4xl" }, "Panduan terbaru")
          ),
          routeLink("/jurnal", { className: "btn-ghost" }, "Semua tulisan")
        )
      ),
      el(
        "div",
        { className: "grid gap-5 md:grid-cols-3" },
        ...recentArticles.map((art, i) =>
          revealWrap(
            routeLink(
              `/jurnal/${art.slug}`,
              { className: "card lift block h-full p-7" },
              el("p", { className: "text-xs font-semibold tracking-wide text-espresso-400" }, formatShortDate(art.date)),
              el("h3", { className: "mt-2 text-xl leading-snug" }, art.title),
              el("p", { className: "mt-2 line-clamp-2 text-sm leading-relaxed text-espresso-500" }, art.excerpt),
              el("span", { className: "mt-4 inline-block text-sm font-semibold text-terra-600" }, "Baca →")
            ),
            i * 110
          )
        )
      )
    ),
    latestReviews.length > 0
      ? el(
          "section",
          { className: "border-t border-espresso-100 bg-cream-100/70" },
          el(
            "div",
            { className: "container-x py-16" },
            revealWrap(
              el(
                "div",
                null,
                el("p", { className: "eyebrow" }, "Kata pembeli"),
                el("h2", { className: "mt-2 text-3xl sm:text-4xl" }, "Ulasan terbaru")
              )
            ),
            el(
              "div",
              { className: "mt-8 grid gap-5 md:grid-cols-3" },
              ...latestReviews.map((rev, i) => {
                const bean = beans.find((b) => b.id === rev.beanId);
                return revealWrap(
                  el(
                    "figure",
                    { className: "h-full rounded-[2rem] border border-espresso-100 bg-white p-7" },
                    StarRatingDisplay({ value: rev.rating, size: 16 }),
                    el("blockquote", { className: "mt-3 text-sm leading-relaxed text-espresso-600" }, `“${rev.comment}”`),
                    el(
                      "figcaption",
                      { className: "mt-4 text-sm" },
                      el("span", { className: "font-semibold text-espresso-700" }, rev.name),
                      bean ? el("span", { className: "text-espresso-400" }, ` · ${bean.name}`) : null
                    )
                  ),
                  i * 110
                );
              })
            )
          )
        )
      : null
  );

  return {
    element,
    cleanup: () => {
      hero.cleanup();
      journey.cleanup();
    },
  };
}
