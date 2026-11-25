import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { revealWrap } from "../utils/reveal.js";
import { formatShortDate } from "../utils/format.js";
import { CoffeeFormSvg } from "../components/media.js";

const CARD_STYLES = [
  {
    card: "border-espresso-700 bg-espresso-800 text-cream-50 hover:border-terra-400",
    bar: "bg-terra-400",
    meta: "text-terra-200",
    title: "!text-white",
    excerpt: "text-cream-200",
    divider: "border-espresso-600/80",
    author: "text-cream-300",
    cta: "text-terra-200 group-hover:text-white",
    iconWrap: "bg-espresso-700/80 border border-espresso-600",
    iconKind: "cherry",
  },
  {
    card: "border-terra-200 bg-terra-100/65 text-espresso-700 hover:border-terra-400",
    bar: "bg-terra-600",
    meta: "text-terra-700",
    title: "text-espresso-800",
    excerpt: "text-espresso-600",
    divider: "border-terra-200",
    author: "text-espresso-500",
    cta: "text-terra-700 group-hover:text-espresso-800",
    iconWrap: "bg-white/85 border border-terra-200",
    iconKind: "dark",
  },
  {
    card: "border-espresso-200 bg-cream-100/80 text-espresso-700 hover:border-espresso-400",
    bar: "bg-espresso-700",
    meta: "text-espresso-500",
    title: "text-espresso-800",
    excerpt: "text-espresso-600",
    divider: "border-espresso-200/80",
    author: "text-espresso-500",
    cta: "text-espresso-700 group-hover:text-terra-600",
    iconWrap: "bg-white/85 border border-espresso-100",
    iconKind: "leaf",
  },
  {
    card: "border-terra-200 bg-terra-100/50 text-espresso-700 hover:border-terra-400",
    bar: "bg-terra-600",
    meta: "text-terra-700",
    title: "text-espresso-800",
    excerpt: "text-espresso-600",
    divider: "border-terra-200",
    author: "text-espresso-500",
    cta: "text-terra-700 group-hover:text-espresso-800",
    iconWrap: "bg-white/85 border border-terra-200",
    iconKind: "ground",
  },
];

export function JournalPage() {
  const articles = [...store.articles].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return el(
    "div",
    { className: "page-in" },
    el(
      "section",
      { className: "border-b border-espresso-100 bg-cream-100/70" },
      el(
        "div",
        { className: "container-x py-9 sm:py-10" },
        el("p", { className: "eyebrow" }, "Jurnal seduh"),
        el("h1", { className: "mt-2 text-3xl sm:text-5xl" }, "Catatan rasa dan seduhan"),
        el(
          "p",
          { className: "mt-2.5 max-w-2xl text-espresso-500" },
          "Panduan singkat dari roastery tentang proses, gilingan, air, dan cara menyeduh."
        )
      )
    ),
    el(
      "div",
      { className: "container-x py-10" },
      el(
        "div",
        { className: "grid gap-5 md:grid-cols-2" },
        ...articles.map((art, i) => {
          const s = CARD_STYLES[i % CARD_STYLES.length];
          return revealWrap(
            routeLink(
              `/jurnal/${art.slug}`,
              { className: `lift group flex h-full flex-col rounded-[1.75rem] border p-6 transition ${s.card}` },
              el(
                "div",
                { className: "flex items-center justify-between gap-3" },
                el("span", { className: `h-1 w-10 rounded-full ${s.bar}` }),
                el("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-1 ${s.iconWrap}` }, CoffeeFormSvg({ kind: s.iconKind }))
              ),
              el(
                "p",
                { className: `mt-4 text-xs font-semibold tabular-nums ${s.meta}` },
                `${formatShortDate(art.date)} · ${art.readMinutes} menit baca`
              ),
              el("h2", { className: `mt-2 text-xl leading-snug sm:text-2xl ${s.title}` }, art.title),
              el("p", { className: `mt-2.5 flex-1 text-sm leading-relaxed ${s.excerpt}` }, art.excerpt),
              el(
                "div",
                { className: `mt-5 flex items-center justify-between border-t pt-3.5 text-sm ${s.divider}` },
                el("span", { className: s.author }, art.author),
                el("span", { className: `font-semibold transition ${s.cta}` }, "Baca artikel →")
              )
            ),
            Math.min(i, 3) * 80
          );
        })
      )
    )
  );
}
