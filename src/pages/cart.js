import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { GRIND_OPTIONS } from "../data/constants.js";
import { store } from "../store/appStore.js";
import { beanPrice, formatWeight, rupiah } from "../utils/format.js";
import { BagSvg } from "../components/media.js";
import { ShippingTierBar } from "../components/orderUi.js";
import { showToast } from "../components/modal.js";

export function CartPage() {
  const wrapper = el("div", { className: "page-in container-x py-12" });

  const render = () => {
    const rows = store.cart
      .map((line) => {
        const bean = store.beans.find((b) => b.id === line.beanId);
        return bean ? { line, bean, unit: beanPrice(bean, line.size) } : null;
      })
      .filter(Boolean);

    const total = rows.reduce((sum, r) => sum + r.unit * r.line.qty, 0);
    const totalWeight = rows.reduce((sum, r) => sum + Number(r.line.size) * r.line.qty, 0);

    if (rows.length === 0) {
      wrapper.replaceChildren(
        el(
          "div",
          { className: "mx-auto max-w-md py-12 text-center" },
          el("div", { className: "mx-auto w-24" }, BagSvg({ tone: "light", subtitle: "Siap diisi" })),
          el("h1", { className: "mt-4 text-3xl sm:text-4xl" }, "Keranjang masih kosong"),
          el("p", { className: "mt-3 text-espresso-400" }, "Pilih biji kopi dulu dari toko untuk mulai meracik pesanan."),
          routeLink("/toko", { className: "btn-primary mt-6" }, "Jelajahi toko")
        )
      );
      return;
    }

    const inCartIds = new Set(rows.map((r) => r.bean.id));
    const pairBeans = store.beans.filter((b) => b.stock !== "Habis" && !inCartIds.has(b.id)).slice(0, 3);

    wrapper.replaceChildren(
      el("p", { className: "eyebrow" }, "Keranjang"),
      el(
        "div",
        { className: "mt-2 flex flex-wrap items-baseline justify-between gap-3" },
        el("h1", { className: "text-3xl sm:text-4xl" }, "Racikan pesanan kamu"),
        el("span", { className: "text-sm font-medium tabular-nums text-espresso-400" }, `${rows.length} baris · ${formatWeight(totalWeight)}`)
      ),
      el(
        "div",
        { className: "mt-8 grid gap-8 lg:grid-cols-[1.45fr_1fr]" },
        el(
          "div",
          { className: "space-y-6" },
          el(
            "div",
            { className: "space-y-4" },
            ...rows.map(({ line, bean, unit }) => {
              const tone = bean.roast === "Dark" ? "dark" : bean.roast === "Light" ? "olive" : "light";
              const grindSelect = el(
                "select",
                {
                  className: "rounded-lg border border-espresso-200 bg-cream-50 px-2.5 py-1 text-xs font-medium text-espresso-700 focus:border-terra-500 focus:outline-none",
                  "aria-label": `Gilingan untuk ${bean.name}`,
                  onChange: (e) => {
                    store.updateCartLine(line.beanId, line.size, line.grind, line.size, e.target.value);
                  },
                },
                ...GRIND_OPTIONS.map((g) => el("option", { value: g }, g))
              );
              grindSelect.value = line.grind;

              return el(
                "article",
                { className: "card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5" },
                routeLink(
                  `/produk/${bean.id}`,
                  { className: "h-24 w-20 shrink-0 rounded-2xl bg-cream-100 p-2 self-start sm:self-center" },
                  BagSvg({
                    tone,
                    title: bean.name,
                    subtitle: `${line.size} g · ${line.grind}`,
                    className: "h-full w-full",
                  })
                ),
                el(
                  "div",
                  { className: "min-w-0 flex-1 space-y-2.5" },
                  el(
                    "div",
                    { className: "flex flex-wrap items-baseline justify-between gap-2" },
                    routeLink(
                      `/produk/${bean.id}`,
                      { className: "font-display text-lg text-espresso-700 hover:text-terra-600" },
                      bean.name
                    ),
                    el("span", { className: "text-xs tabular-nums text-espresso-400" }, `${rupiah(unit)} / kemasan`)
                  ),
                  el(
                    "div",
                    { className: "flex flex-wrap items-center gap-2" },
                    el(
                      "div",
                      { className: "inline-flex rounded-lg border border-espresso-200 bg-cream-50 p-0.5" },
                      ...["200", "500"].map((s) => {
                        const active = line.size === s;
                        return el(
                          "button",
                          {
                            type: "button",
                            "aria-pressed": String(active),
                            className: `rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition ${
                              active ? "bg-espresso-700 text-cream-50" : "text-espresso-500 hover:text-espresso-800"
                            }`,
                            onClick: () => store.updateCartLine(line.beanId, line.size, line.grind, s, line.grind),
                          },
                          `${s} g`
                        );
                      })
                    ),
                    grindSelect
                  )
                ),
                el(
                  "div",
                  { className: "flex items-center justify-between gap-4 border-t border-espresso-100 pt-3 sm:border-t-0 sm:pt-0" },
                  el(
                    "div",
                    { className: "flex items-center rounded-full border border-espresso-200" },
                    el(
                      "button",
                      {
                        type: "button",
                        className: "h-9 w-9 font-semibold",
                        "aria-label": "Kurangi",
                        onClick: () => store.setCartQty(line.beanId, line.size, line.grind, line.qty - 1),
                      },
                      "-"
                    ),
                    el("span", { className: "w-8 text-center text-sm font-semibold tabular-nums" }, String(line.qty)),
                    el(
                      "button",
                      {
                        type: "button",
                        className: "h-9 w-9 font-semibold",
                        "aria-label": "Tambah",
                        onClick: () => store.setCartQty(line.beanId, line.size, line.grind, line.qty + 1),
                      },
                      "+"
                    )
                  ),
                  el(
                    "div",
                    { className: "text-right" },
                    el("p", { className: "font-semibold tabular-nums text-espresso-800" }, rupiah(unit * line.qty)),
                    el("p", { className: "text-[11px] tabular-nums text-espresso-400" }, formatWeight(Number(line.size) * line.qty)),
                    el(
                      "button",
                      {
                        type: "button",
                        className: "mt-1 text-xs text-red-700 hover:underline",
                        onClick: () => store.removeFromCart(line.beanId, line.size, line.grind),
                      },
                      "Hapus"
                    )
                  )
                )
              );
            })
          ),
          pairBeans.length > 0
            ? el(
                "section",
                { className: "rounded-3xl border border-espresso-100 bg-cream-100/60 p-5" },
                el("h2", { className: "text-lg" }, "Lengkapi seduhanmu"),
                el("p", { className: "mt-1 text-xs text-espresso-500" }, "Tambah satu varian lagi agar lebih hemat biaya pengiriman per kilogram."),
                el(
                  "div",
                  { className: "mt-4 grid gap-3 sm:grid-cols-3" },
                  ...pairBeans.map((b) =>
                    el(
                      "div",
                      { className: "flex flex-col justify-between rounded-2xl border border-espresso-100 bg-white p-3.5" },
                      el(
                        "div",
                        null,
                        el("p", { className: "text-xs font-semibold text-espresso-700" }, b.name),
                        el("p", { className: "mt-0.5 text-[11px] text-espresso-400" }, `${b.roast} · ${b.region}`)
                      ),
                      el(
                        "div",
                        { className: "mt-3 flex items-center justify-between gap-2" },
                        el("span", { className: "text-xs font-semibold tabular-nums text-espresso-700" }, rupiah(b.price200)),
                        el(
                          "button",
                          {
                            type: "button",
                            className: "rounded-full bg-espresso-700 px-3 py-1 text-[11px] font-semibold text-cream-50 transition hover:bg-terra-600",
                            onClick: () => {
                              store.addToCart(b.id, "200", "Biji utuh", 1);
                              showToast(`${b.name} (200 g) ditambahkan.`);
                            },
                          },
                          "+ 200 g"
                        )
                      )
                    )
                  )
                )
              )
            : null
        ),
        el(
          "aside",
          { className: "space-y-4 lg:sticky lg:top-24 lg:self-start" },
          ShippingTierBar({ totalWeight }),
          el(
            "div",
            { className: "card space-y-2 p-5" },
            el(
              "div",
              { className: "flex items-center justify-between text-sm text-espresso-500" },
              el("span", null, "Total berat"),
              el("span", { className: "font-semibold tabular-nums text-espresso-700" }, formatWeight(totalWeight))
            ),
            el(
              "div",
              { className: "flex items-center justify-between" },
              el("span", { className: "text-sm text-espresso-500" }, "Total barang"),
              el("span", { className: "font-display text-2xl tabular-nums text-espresso-800" }, rupiah(total))
            ),
            el("p", { className: "!mt-3 text-xs text-espresso-400" }, "Ongkir dan biaya metode pembayaran dihitung di halaman checkout.")
          ),
          store.customer
            ? el(
                "div",
                { className: "space-y-3" },
                routeLink("/checkout", { className: "btn-accent w-full" }, "Lanjut ke checkout"),
                routeLink("/toko", { className: "btn-ghost w-full" }, "Tambah biji lainnya")
              )
            : el(
                "div",
                { className: "card space-y-3 p-6 text-center" },
                el("h2", { className: "text-xl" }, "Masuk dulu untuk checkout"),
                el("p", { className: "text-sm text-espresso-500" }, "Pesananmu tercatat di akun dan bisa dilacak statusnya."),
                routeLink("/masuk", { className: "btn-primary w-full" }, "Masuk"),
                routeLink("/daftar", { className: "btn-ghost w-full" }, "Buat akun")
              )
        )
      )
    );
  };

  render();
  const unsub = store.subscribe((_s, reason) => {
    if (reason === "cart" || reason === "beans") {
      render();
    }
  });

  return {
    element: wrapper,
    cleanup: () => unsub(),
  };
}
