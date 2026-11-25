import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { BrandWordmark } from "./brand.js";
import { whatsappGeneralUrl } from "../utils/format.js";

const FOOTER_LINKS = [
  ["/toko", "Toko"],
  ["/kenali-kopi", "Kenali Kopi"],
  ["/proses", "Dari Petani ke Cangkir"],
  ["/kalkulator", "Kalkulator Seduh"],
  ["/jurnal", "Jurnal Seduh"],
  ["/tentang", "Tentang & Lokasi"],
  ["/masuk", "Masuk pembeli"],
  ["/admin/login", "Masuk pemilik toko"],
];

export function createFooter() {
  return el(
    "footer",
    { className: "mt-24 bg-espresso-800 text-espresso-100" },
    el(
      "div",
      { className: "container-x grid gap-10 py-12 md:grid-cols-3" },
      el(
        "div",
        { className: "space-y-3" },
        BrandWordmark({ light: true }),
        el(
          "p",
          { className: "max-w-xs text-sm leading-relaxed text-espresso-200" },
          "Biji kopi Nusantara, dari Gayo dan Ulee Kareng sampai Papua. Disangrai dalam batch kecil dan dikemas di Banda Aceh."
        )
      ),
      el(
        "div",
        null,
        el("h3", { className: "mb-3 font-sans text-sm font-semibold tracking-wide text-cream-200" }, "Jelajahi"),
        el(
          "ul",
          { className: "space-y-2 text-sm" },
          ...FOOTER_LINKS.map(([to, label]) =>
            el("li", null, routeLink(to, { className: "hover:text-white transition" }, label))
          )
        )
      ),
      el(
        "div",
        null,
        el("h3", { className: "mb-3 font-sans text-sm font-semibold tracking-wide text-cream-200" }, "Hubungi kami"),
        el(
          "p",
          { className: "mb-4 text-sm leading-relaxed text-espresso-200" },
          "Tanya stok, ongkir, atau rekomendasi biji. Kami balas lewat WhatsApp."
        ),
        el(
          "a",
          {
            href: whatsappGeneralUrl(),
            target: "_blank",
            rel: "noopener noreferrer",
            className: "btn-accent",
          },
          "Chat WhatsApp"
        )
      )
    ),
    el(
      "div",
      { className: "border-t border-white/10 py-4 text-center text-xs text-espresso-300" },
      `© ${new Date().getFullYear()} KupiLab Aceh · Roastery & Ensiklopedia Kopi Nusantara, Banda Aceh.`
    )
  );
}
