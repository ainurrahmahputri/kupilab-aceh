import { el, svgEl } from "../utils/dom.js";
import { navigate } from "../router.js";
import { store } from "../store/appStore.js";
import { beanPrice, formatWeight, rupiah } from "../utils/format.js";
import { BagSvg } from "./media.js";
import { ShippingTierBar } from "./orderUi.js";
import { showToast } from "./modal.js";

let activeDrawer = null;

export function isCartDrawerOpen() {
  return Boolean(activeDrawer);
}

export function closeCartDrawer() {
  if (!activeDrawer) return;
  activeDrawer.cleanup();
  activeDrawer = null;
}

export function openCartDrawer() {
  if (activeDrawer) {
    activeDrawer.render();
    return;
  }

  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const closeBtn = el(
    "button",
    {
      type: "button",
      className:
        "flex h-9 w-9 items-center justify-center rounded-full border border-espresso-200 text-espresso-700 transition hover:border-espresso-700 hover:bg-cream-100",
      "aria-label": "Tutup laci keranjang",
      onClick: () => closeCartDrawer(),
    },
    svgEl(
      "svg",
      { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" },
      svgEl("path", { d: "M6 6l12 12M18 6L6 18" })
    )
  );

  const countLabel = el("span", { className: "text-xs font-medium tabular-nums text-espresso-400" });
  const bodyEl = el("div", { className: "flex-1 space-y-5 overflow-y-auto px-5 py-5" });
  const footerEl = el("div", { className: "border-t border-espresso-100 bg-cream-50 px-5 py-4" });

  const panel = el(
    "aside",
    {
      className:
        "drawer-in flex h-full w-full max-w-md flex-col border-l border-espresso-100 bg-white shadow-2xl",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "cart-drawer-title",
    },
    el(
      "div",
      { className: "flex items-center justify-between gap-3 border-b border-espresso-100 px-5 py-4" },
      el(
        "div",
        null,
        el("h2", { id: "cart-drawer-title", className: "font-display text-xl text-espresso-800" }, "Keranjang seduh"),
        countLabel
      ),
      closeBtn
    ),
    bodyEl,
    footerEl
  );

  const overlay = el(
    "div",
    {
      id: "kupilab-cart-drawer",
      className: "fixed inset-0 z-50 flex justify-end bg-espresso-900/45 backdrop-blur-xs",
      onClick: (e) => {
        if (e.target === overlay) closeCartDrawer();
      },
    },
    panel
  );

  const go = (to) => {
    closeCartDrawer();
    navigate(to);
  };

  const render = () => {
    const rows = store.cart
      .map((line) => {
        const bean = store.beans.find((b) => b.id === line.beanId);
        return bean ? { line, bean, unit: beanPrice(bean, line.size) } : null;
      })
      .filter(Boolean);

    const totalQty = rows.reduce((sum, r) => sum + r.line.qty, 0);
    const totalWeight = rows.reduce((sum, r) => sum + Number(r.line.size) * r.line.qty, 0);
    const subtotal = rows.reduce((sum, r) => sum + r.unit * r.line.qty, 0);

    countLabel.textContent =
      rows.length === 0 ? "Belum ada barang" : `${totalQty} kemasan · ${formatWeight(totalWeight)}`;

    if (rows.length === 0) {
      const quickBeans = store.beans.filter((b) => b.stock !== "Habis").slice(0, 3);
      bodyEl.replaceChildren(
        el(
          "div",
          { className: "rounded-3xl bg-cream-100/70 p-6 text-center" },
          el("div", { className: "mx-auto w-20" }, BagSvg({ tone: "light", subtitle: "Siap disangrai" })),
          el("p", { className: "mt-3 font-display text-xl text-espresso-700" }, "Keranjang masih kosong"),
          el("p", { className: "mt-1 text-xs leading-relaxed text-espresso-500" }, "Tambahkan biji Aceh pilihan untuk mulai meracik pesanan.")
        ),
        quickBeans.length > 0
          ? el(
              "div",
              { className: "space-y-2.5" },
              el("p", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, "Pilihan populer 200 g"),
              ...quickBeans.map((b) =>
                el(
                  "div",
                  { className: "flex items-center justify-between gap-3 rounded-2xl border border-espresso-100 p-3" },
                  el(
                    "div",
                    { className: "min-w-0" },
                    el("p", { className: "truncate text-sm font-semibold text-espresso-700" }, b.name),
                    el("p", { className: "text-xs text-espresso-400 tabular-nums" }, `${b.roast} · ${rupiah(b.price200)}`)
                  ),
                  el(
                    "button",
                    {
                      type: "button",
                      className: "shrink-0 rounded-full bg-espresso-700 px-3 py-1.5 text-xs font-semibold text-cream-50 transition hover:bg-terra-600",
                      onClick: () => store.addToCart(b.id, "200", "Biji utuh", 1),
                    },
                    "+ 200 g"
                  )
                )
              )
            )
          : null
      );

      footerEl.replaceChildren(
        el(
          "button",
          {
            type: "button",
            className: "btn-primary w-full",
            onClick: () => go("/toko"),
          },
          "Jelajahi toko kopi"
        )
      );
      return;
    }

    const inCartIds = new Set(rows.map((r) => r.bean.id));
    const suggestions = store.beans.filter((b) => b.stock !== "Habis" && !inCartIds.has(b.id)).slice(0, 2);

    bodyEl.replaceChildren(
      ShippingTierBar({ totalWeight, compact: true }),
      el(
        "div",
        { className: "space-y-3" },
        ...rows.map(({ line, bean, unit }) => {
          const tone = bean.roast === "Dark" ? "dark" : bean.roast === "Light" ? "olive" : "light";
          return el(
            "article",
            { className: "rounded-2xl border border-espresso-100 bg-white p-3.5 transition hover:border-espresso-200" },
            el(
              "div",
              { className: "flex items-start gap-3" },
              el(
                "button",
                {
                  type: "button",
                  className: "h-16 w-12 shrink-0 rounded-xl bg-cream-100 p-1.5 transition hover:scale-105",
                  "aria-label": `Lihat ${bean.name}`,
                  onClick: () => go(`/produk/${bean.id}`),
                },
                BagSvg({
                  tone,
                  title: bean.name,
                  subtitle: `${line.size} g`,
                  className: "h-full w-full",
                })
              ),
              el(
                "div",
                { className: "min-w-0 flex-1" },
                el(
                  "div",
                  { className: "flex items-start justify-between gap-2" },
                  el(
                    "button",
                    {
                      type: "button",
                      className: "truncate text-left font-display text-base text-espresso-700 hover:text-terra-600",
                      onClick: () => go(`/produk/${bean.id}`),
                    },
                    bean.name
                  ),
                  el(
                    "button",
                    {
                      type: "button",
                      className: "shrink-0 text-xs text-espresso-300 hover:text-red-700",
                      "aria-label": `Hapus ${bean.name}`,
                      onClick: () => store.removeFromCart(line.beanId, line.size, line.grind),
                    },
                    "Hapus"
                  )
                ),
                el("p", { className: "mt-0.5 text-xs text-espresso-400" }, line.grind),
                el(
                  "div",
                  { className: "mt-2.5 flex flex-wrap items-center justify-between gap-2" },
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
                          className: `rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums transition ${
                            active ? "bg-espresso-700 text-cream-50" : "text-espresso-500 hover:text-espresso-800"
                          }`,
                          onClick: () => store.updateCartLine(line.beanId, line.size, line.grind, s, line.grind),
                        },
                        `${s}g`
                      );
                    })
                  ),
                  el(
                    "div",
                    { className: "flex items-center gap-2.5" },
                    el(
                      "div",
                      { className: "flex items-center rounded-full border border-espresso-200" },
                      el(
                        "button",
                        {
                          type: "button",
                          className: "h-7 w-7 text-sm font-semibold",
                          "aria-label": "Kurangi jumlah",
                          onClick: () => store.setCartQty(line.beanId, line.size, line.grind, line.qty - 1),
                        },
                        "-"
                      ),
                      el("span", { className: "w-6 text-center text-xs font-semibold tabular-nums" }, String(line.qty)),
                      el(
                        "button",
                        {
                          type: "button",
                          className: "h-7 w-7 text-sm font-semibold",
                          "aria-label": "Tambah jumlah",
                          onClick: () => store.setCartQty(line.beanId, line.size, line.grind, line.qty + 1),
                        },
                        "+"
                      )
                    ),
                    el("span", { className: "text-sm font-semibold tabular-nums text-espresso-700" }, rupiah(unit * line.qty))
                  )
                )
              )
            )
          );
        })
      ),
      suggestions.length > 0
        ? el(
            "div",
            { className: "space-y-2.5 border-t border-espresso-100 pt-4" },
            el("p", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, "Pasangan seduh sekalian"),
            ...suggestions.map((b) =>
              el(
                "div",
                { className: "flex items-center justify-between gap-3 rounded-2xl bg-cream-100/70 p-3" },
                el(
                  "div",
                  { className: "min-w-0" },
                  el("p", { className: "truncate text-xs font-semibold text-espresso-700" }, b.name),
                  el("p", { className: "text-[11px] text-espresso-400 tabular-nums" }, `${b.roast} · ${rupiah(b.price200)}`)
                ),
                el(
                  "button",
                  {
                    type: "button",
                    className: "shrink-0 rounded-full border border-espresso-300 bg-white px-3 py-1 text-[11px] font-semibold text-espresso-700 transition hover:border-espresso-700 hover:bg-espresso-700 hover:text-white",
                    onClick: () => {
                      store.addToCart(b.id, "200", "Biji utuh", 1);
                      showToast(`${b.name} ditambahkan.`);
                    },
                  },
                  "+ 200 g"
                )
              )
            )
          )
        : null
    );

    footerEl.replaceChildren(
      el(
        "div",
        { className: "flex items-baseline justify-between gap-2" },
        el("span", { className: "text-sm text-espresso-500" }, `Subtotal (${formatWeight(totalWeight)})`),
        el("span", { className: "font-display text-2xl tabular-nums text-espresso-800" }, rupiah(subtotal))
      ),
      el("p", { className: "mt-0.5 text-[11px] text-espresso-400" }, "Ongkir & metode bayar dihitung di checkout."),
      el(
        "div",
        { className: "mt-3 grid gap-2 sm:grid-cols-2" },
        el(
          "button",
          {
            type: "button",
            className: "btn-ghost w-full text-xs",
            onClick: () => go("/keranjang"),
          },
          "Atur di keranjang"
        ),
        el(
          "button",
          {
            type: "button",
            className: "btn-accent w-full text-xs",
            onClick: () => go(store.customer ? "/checkout" : "/masuk"),
          },
          store.customer ? "Checkout sekarang" : "Masuk untuk checkout"
        )
      )
    );
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeCartDrawer();
    }
  };

  const unsub = store.subscribe((_s, reason) => {
    if (reason === "cart" || reason === "auth" || reason === "beans") {
      render();
    }
  });

  const cleanup = () => {
    unsub();
    document.removeEventListener("keydown", onKeyDown);
    overlay.remove();
    if (previousFocus) previousFocus.focus();
  };

  activeDrawer = { render, cleanup };
  document.addEventListener("keydown", onKeyDown);
  document.body.appendChild(overlay);
  render();
  closeBtn.focus();
}
