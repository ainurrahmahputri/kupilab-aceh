import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { formatShortDate } from "../utils/format.js";

function renderArticleBody(body) {
  const blocks = String(body || "").split("\n\n");
  const nodes = [];

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    if (block.startsWith("## ")) {
      nodes.push(
        el(
          "div",
          { className: "pt-5" },
          el("div", { className: "mb-2 h-1 w-10 rounded-full bg-terra-600" }),
          el("h2", { className: "text-2xl text-espresso-700" }, block.slice(3))
        )
      );
      continue;
    }

    const lines = block.split("\n");
    if (lines.every((l) => l.startsWith("- "))) {
      nodes.push(
        el(
          "ul",
          { className: "list-disc space-y-1.5 rounded-2xl border border-terra-200 bg-terra-100/45 py-4 pr-5 pl-9 text-espresso-700" },
          ...lines.map((l) => el("li", null, l.slice(2)))
        )
      );
      continue;
    }

    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      nodes.push(
        el(
          "ol",
          { className: "list-decimal space-y-1.5 rounded-2xl border border-espresso-100 bg-cream-100/70 py-4 pr-5 pl-9 text-espresso-700" },
          ...lines.map((l) => el("li", null, l.replace(/^\d+\.\s/, "")))
        )
      );
      continue;
    }

    nodes.push(el("p", null, block));
  }

  return el("div", { className: "mt-8 space-y-5 leading-relaxed text-espresso-600" }, ...nodes);
}

export function ArticleDetailPage({ slug }) {
  const article = store.articles.find((a) => a.slug === slug);

  if (!article) {
    return el(
      "div",
      { className: "container-x py-20 text-center" },
      el("h1", { className: "text-3xl" }, "Artikel tidak ditemukan"),
      routeLink("/jurnal", { className: "btn-primary mt-6" }, "Kembali ke jurnal")
    );
  }

  return el(
    "article",
    { className: "page-in" },
    el(
      "header",
      { className: "border-b border-espresso-100 bg-gradient-to-br from-cream-100 via-cream-50 to-terra-100/50" },
      el(
        "div",
        { className: "container-x max-w-3xl py-10 sm:py-12" },
        routeLink("/jurnal", { className: "text-sm font-semibold text-terra-600 hover:underline" }, "← Kembali ke jurnal"),
        el("h1", { className: "mt-4 text-3xl leading-tight sm:text-5xl" }, article.title),
        el(
          "p",
          { className: "mt-4 text-sm font-medium tabular-nums text-espresso-500" },
          `${article.author} · ${formatShortDate(article.date)} · ${article.readMinutes} menit baca`
        ),
        el(
          "p",
          { className: "mt-5 rounded-2xl border border-espresso-200/80 bg-white/80 p-5 text-base leading-relaxed text-espresso-700 sm:text-lg" },
          article.excerpt
        )
      )
    ),
    el(
      "div",
      { className: "container-x max-w-3xl pb-12" },
      renderArticleBody(article.body),
      el(
        "div",
        { className: "mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-espresso-100 bg-cream-100/75 p-6" },
        el(
          "div",
          null,
          el("p", { className: "font-display text-xl text-espresso-800" }, "Ingin praktik langsung?"),
          el("p", { className: "mt-1 text-sm text-espresso-500" }, "Pilih biji sangrai segar atau hitung takaran seduhmu.")
        ),
        el(
          "div",
          { className: "flex flex-wrap gap-3" },
          routeLink("/toko", { className: "btn-primary" }, "Lihat biji di toko"),
          routeLink("/kalkulator", { className: "btn-accent" }, "Buka kalkulator seduh")
        )
      )
    )
  );
}
