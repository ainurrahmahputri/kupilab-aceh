import { el, svgEl } from "../utils/dom.js";
import { revealWrap } from "../utils/reveal.js";
import { whatsappGeneralUrl } from "../utils/format.js";
import { CoffeeFormSvg, EditorialImage } from "../components/media.js";
import { StarRatingDisplay } from "../components/rating.js";

const HOURS = [
  ["Senin - Kamis", "08.00 - 21.00"],
  ["Jumat", "13.30 - 22.00"],
  ["Sabtu - Minggu", "08.00 - 22.00"],
];

const STATS = [
  ["8", "daerah asal"],
  ["5 kg", "per batch sangrai"],
  ["13", "varian biji"],
  ["2018", "mulai menyangrai"],
];

const QUOTES = [
  {
    name: "Rizki",
    role: "mahasiswa",
    rating: 5,
    text: "Akhirnya paham kenapa Gayo Natural terasa manis buah. Panduan V60-nya mudah diikuti, hasilnya langsung beda.",
  },
  {
    name: "Cut Nurul",
    role: "pekerja kantoran",
    rating: 5,
    text: "Sanger buatan sendiri sekarang rasanya mirip warung langganan. Kalkulator takarannya sangat membantu.",
  },
  {
    name: "Bang Hafiz",
    role: "pemilik kedai",
    rating: 4,
    text: "Katalognya jelas: asal, proses, dan rasa tertulis lengkap. Memudahkan saya memilih biji untuk kedai.",
  },
];

function centeredEyebrow(text) {
  return el(
    "p",
    { className: "flex items-center justify-center gap-3 text-sm font-semibold text-terra-600" },
    el("span", { className: "h-px w-10 bg-terra-400/60", "aria-hidden": "true" }),
    el("span", null, text),
    el("span", { className: "h-px w-10 bg-terra-400/60", "aria-hidden": "true" })
  );
}

function beanDivider() {
  return el(
    "div",
    { className: "my-2 flex items-center justify-center gap-4", "aria-hidden": "true" },
    el("span", { className: "h-px w-16 bg-gradient-to-r from-transparent to-espresso-200 sm:w-28" }),
    svgEl(
      "svg",
      { viewBox: "0 0 40 56", className: "h-5 w-4 text-espresso-300" },
      svgEl("ellipse", { cx: "20", cy: "28", rx: "18", ry: "26", fill: "currentColor" }),
      svgEl("path", { d: "M14 5c12 10 -12 34 4 46", stroke: "#fff", "stroke-width": "4", fill: "none", "stroke-linecap": "round", opacity: "0.7" })
    ),
    el("span", { className: "h-px w-16 bg-gradient-to-l from-transparent to-espresso-200 sm:w-28" })
  );
}

export function AboutPage() {
  const gallery = [
    {
      name: "beanLot",
      cap: "Roastery",
      sub: "Batch kecil 5 kg, tiap profil dicatat",
      alt: "Biji kopi di mesin sangrai roastery",
      up: false,
    },
    {
      name: "pourOver",
      cap: "Meja seduh",
      sub: "Air dituang perlahan dari teko leher angsa",
      alt: "Menuang air dari teko leher angsa ke dripper",
      up: true,
    },
    {
      name: "plantation",
      cap: "Kebun dataran tinggi",
      sub: "Lereng berkabut tempat kopi tumbuh",
      alt: "Kebun kopi berkabut di perbukitan",
      up: false,
    },
  ];

  const transparencies = [
    {
      kind: "cherry",
      title: "Asal pasokan",
      text: "Biji arabika kami ambil dari kebun rakyat di Aceh Tengah dan Bener Meriah lewat pengumpul setempat, dan robusta dari Pidie serta sangrai tradisi Ulee Kareng. Nama kebun dan tanggal panen tiap lot kami catat, dan bisa ditanyakan lewat WhatsApp.",
    },
    {
      kind: "green",
      title: "Status sertifikasi halal",
      text: "Kopi sangrai tanpa campuran bahan hewani. Sertifikasi halal BPJPH sedang kami urus dan nomornya akan dicantumkan di halaman ini begitu terbit. Sampai saat itu, halaman ini tidak mengklaim status bersertifikat.",
    },
  ];

  return el(
    "div",
    { className: "page-in" },
    el(
      "section",
      { className: "relative overflow-hidden" },
      el("div", { className: "dotted absolute inset-0 opacity-60", "aria-hidden": "true" }),
      el("div", { className: "soft-glow absolute inset-0", "aria-hidden": "true" }),
      el(
        "div",
        { className: "container-x relative py-16 text-center" },
        centeredEyebrow("Tentang roastery"),
        el("h1", { className: "mx-auto mt-5 max-w-3xl text-4xl leading-[1.08] sm:text-6xl" }, "Dari dataran tinggi Gayo ke ruang seduh Banda Aceh"),
        el(
          "p",
          { className: "mx-auto mt-6 max-w-xl leading-relaxed text-espresso-500" },
          "Kami menyangrai dalam batch kecil, mencatat tiap rasa yang muncul, lalu menuliskannya supaya kamu bisa memilih dengan yakin."
        ),
        el(
          "div",
          { className: "mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 text-left sm:grid-cols-3" },
          ...gallery.map((g, i) =>
            revealWrap(
              el(
                "figure",
                { className: "group" },
                EditorialImage({
                  name: g.name,
                  alt: g.alt,
                  eager: i === 0,
                  className: "aspect-[3/4] w-full rounded-[2rem]",
                }),
                el(
                  "figcaption",
                  { className: "mt-4 px-1" },
                  el("span", { className: "block font-display text-lg text-espresso-700" }, g.cap),
                  el("span", { className: "mt-0.5 block text-sm leading-snug text-espresso-400" }, g.sub)
                )
              ),
              i * 130,
              g.up ? "sm:-mt-8" : ""
            )
          )
        )
      )
    ),
    el(
      "section",
      { className: "container-x" },
      revealWrap(
        el(
          "dl",
          { className: "mx-auto grid max-w-4xl grid-cols-2 gap-y-8 border-y border-espresso-100 py-10 text-center sm:grid-cols-4" },
          ...STATS.map(([num, label]) =>
            el(
              "div",
              null,
              el("dt", { className: "font-display text-4xl tabular-nums text-espresso-700 sm:text-5xl" }, num),
              el("dd", { className: "mt-1.5 text-sm text-espresso-400" }, label)
            )
          )
        )
      )
    ),
    el(
      "section",
      { className: "container-x py-16 text-center" },
      revealWrap(
        el(
          "div",
          { className: "mx-auto max-w-xl" },
          centeredEyebrow("Cerita kami"),
          el("h2", { className: "mt-4 text-3xl sm:text-4xl" }, "Menjembatani kebun dan meja seduh"),
          el(
            "p",
            { className: "mt-6 text-left leading-relaxed text-espresso-500 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-5xl first-letter:leading-none first-letter:text-espresso-700" },
            "Aceh punya tradisi warung kopi yang kuat dan kebun arabika di Gayo yang dikenal luas. Namun tidak banyak tulisan sederhana yang menjelaskan kenapa rasa tiap proses bisa berbeda, atau bagaimana cara menyeduhnya di rumah tanpa alat rumit."
          ),
          el(
            "p",
            { className: "mt-4 text-left leading-relaxed text-espresso-500" },
            "Di KupiLab Aceh, setiap lot kami catat tanggal sangrai, ketinggian kebun, hingga resep seduhnya agar pembeli selalu tahu karakter kopi yang masuk ke cangkirnya."
          )
        )
      )
    ),
    el(
      "section",
      { className: "border-y border-espresso-100 bg-cream-100/70" },
      el(
        "div",
        { className: "container-x grid items-center gap-10 py-16 lg:grid-cols-2" },
        revealWrap(
          EditorialImage({
            name: "roaster",
            alt: "Mesin sangrai di ruang seduh KupiLab",
            className: "aspect-[4/3] w-full rounded-[2.5rem]",
          })
        ),
        revealWrap(
          el(
            "div",
            { className: "text-center lg:text-left" },
            el(
              "div",
              { className: "flex justify-center lg:justify-start" },
              el("p", { className: "eyebrow" }, "Ruang seduh")
            ),
            el("h2", { className: "mt-4 text-3xl sm:text-4xl" }, "Mampir dan cicip langsung"),
            el("p", { className: "mt-2 text-espresso-500" }, "Banda Aceh, Aceh · Kawasan Ulee Kareng"),
            el(
              "dl",
              { className: "mx-auto mt-7 max-w-sm space-y-3 lg:mx-0" },
              ...HOURS.map(([day, hours]) =>
                el(
                  "div",
                  { className: "flex items-baseline gap-3" },
                  el("dt", { className: "whitespace-nowrap text-sm text-espresso-500" }, day),
                  el("span", { className: "h-px flex-1 border-b border-dashed border-espresso-200", "aria-hidden": "true" }),
                  el("dd", { className: "whitespace-nowrap text-sm font-semibold tabular-nums text-espresso-700" }, hours)
                )
              )
            ),
            el("p", { className: "mt-4 text-xs text-espresso-400" }, "Jam buka dapat berubah saat hari libur atau ada batch sangrai khusus."),
            el(
              "div",
              { className: "mt-7 flex flex-wrap justify-center gap-3 lg:justify-start" },
              el(
                "a",
                { href: whatsappGeneralUrl(), target: "_blank", rel: "noopener noreferrer", className: "btn-accent" },
                "Tanya via WhatsApp"
              ),
              el(
                "a",
                {
                  href: "https://www.google.com/maps/search/?api=1&query=Ulee+Kareng%2C+Banda+Aceh",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "btn-ghost",
                },
                "Buka di Google Maps"
              )
            )
          ),
          120
        )
      )
    ),
    el(
      "section",
      { className: "container-x py-16" },
      el(
        "div",
        { className: "mx-auto grid max-w-4xl gap-12 sm:grid-cols-2" },
        ...transparencies.map((item, i) =>
          revealWrap(
            el(
              "div",
              { className: "text-center" },
              el("div", { className: "mx-auto h-20 w-20 rounded-full bg-cream-100 p-3" }, CoffeeFormSvg({ kind: item.kind })),
              el("h2", { className: "mt-5 text-2xl" }, item.title),
              el("p", { className: "mt-3 text-sm leading-relaxed text-espresso-500" }, item.text)
            ),
            i * 120
          )
        )
      )
    ),
    el(
      "section",
      { className: "border-y border-espresso-100 bg-cream-100/60" },
      el(
        "div",
        { className: "container-x py-16 text-center" },
        centeredEyebrow("Kata penikmat kopi"),
        el("h2", { className: "mt-4 text-3xl sm:text-4xl" }, "Dari meja mereka"),
        el(
          "div",
          { className: "mt-10 grid gap-6 md:grid-cols-3" },
          ...QUOTES.map((q, i) =>
            revealWrap(
              el(
                "figure",
                { className: "relative h-full rounded-[2rem] border border-espresso-100 bg-white px-7 pb-7 pt-12 text-center" },
                el("span", { className: "absolute left-1/2 top-4 -translate-x-1/2 font-display text-5xl leading-none text-terra-200", "aria-hidden": "true" }, "“"),
                el("blockquote", { className: "text-sm leading-relaxed text-espresso-600" }, q.text),
                el(
                  "figcaption",
                  { className: "mt-5" },
                  el("span", { className: "mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-espresso-700 font-display text-lg text-cream-50" }, q.name.charAt(0)),
                  el("span", { className: "mt-3 block text-sm font-semibold text-espresso-700" }, q.name),
                  el("span", { className: "block text-xs text-espresso-400" }, q.role),
                  el("span", { className: "mt-2 inline-flex" }, StarRatingDisplay({ value: q.rating, size: 14 }))
                )
              ),
              i * 110
            )
          )
        )
      )
    ),
    el("section", { className: "container-x py-12" }, beanDivider())
  );
}
