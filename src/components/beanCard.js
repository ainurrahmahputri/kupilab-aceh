import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { beanPrice, rupiah } from "../utils/format.js";
import { store } from "../store/appStore.js";
import { ProductImage } from "./media.js";
import { RatingSummary } from "./rating.js";
import { showToast } from "./modal.js";
import { openCartDrawer } from "./cartDrawer.js";

function stockColorClass(stock) {
  if (stock === "Habis") return "text-red-700";
  if (stock === "Stok Terbatas") return "text-amber-700";
  return "text-terra-700";
}

export function BeanCard({ bean }) {
  const { avg, count } = store.ratingOf(bean.id);
  const out = bean.stock === "Habis";
  let selectedSize = "200";
  let timer = null;

  const priceEl = el("span", { className: "font-semibold tabular-nums text-espresso-700" }, rupiah(beanPrice(bean, selectedSize)));
  const sizeWrap = el("div", { className: "inline-flex rounded-lg border border-espresso-200 bg-cream-50 p-0.5" });

  const renderSizeSelector = () => {
    priceEl.textContent = rupiah(beanPrice(bean, selectedSize));
    sizeWrap.replaceChildren(
      ...["200", "500"].map((s) => {
        const active = selectedSize === s;
        return el(
          "button",
          {
            type: "button",
            disabled: out,
            "aria-pressed": String(active),
            className: `rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums transition ${
              active ? "bg-espresso-700 text-cream-50" : "text-espresso-500 hover:text-espresso-800"
            }`,
            onClick: () => {
              selectedSize = s;
              renderSizeSelector();
            },
          },
          `${s}g`
        );
      })
    );
  };

  renderSizeSelector();

  const btn = el(
    "button",
    {
      type: "button",
      disabled: out,
      className: `shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
        out
          ? "cursor-not-allowed bg-espresso-100 text-espresso-300"
          : "bg-espresso-700 text-cream-50 hover:bg-terra-600"
      }`,
      onClick: () => {
        if (out) return;
        store.addToCart(bean.id, selectedSize, "Biji utuh", 1);
        showToast(`${bean.name} (${selectedSize} g) masuk keranjang.`, {
          actionLabel: "Lihat keranjang",
          onAction: () => openCartDrawer(),
        });
        btn.textContent = "Masuk ✓";
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          btn.textContent = "+ Keranjang";
        }, 1400);
      },
    },
    out ? "Habis" : "+ Keranjang"
  );

  return el(
    "article",
    { className: "card lift group flex h-full flex-col overflow-hidden" },
    routeLink(
      `/produk/${bean.id}`,
      { className: "block aspect-[4/3] w-full overflow-hidden bg-cream-100" },
      ProductImage({ bean, className: "h-full w-full" })
    ),
    el(
      "div",
      { className: "flex flex-1 flex-col p-5" },
      el(
        "p",
        { className: "text-[11px] font-semibold tracking-wide text-espresso-400" },
        el("span", null, bean.category),
        " · ",
        el("span", { className: stockColorClass(bean.stock) }, bean.stock)
      ),
      el(
        "h3",
        { className: "mt-1.5 text-lg leading-snug" },
        routeLink(`/produk/${bean.id}`, { className: "transition hover:text-terra-600" }, bean.name)
      ),
      el("p", { className: "mt-1 text-xs text-espresso-400" }, `${bean.region} · ${bean.roast} roast`),
      el("p", { className: "mt-2 line-clamp-2 text-xs leading-relaxed text-espresso-500" }, bean.notes),
      el("div", { className: "mt-3" }, RatingSummary({ avg, count })),
      el(
        "div",
        { className: "mt-auto flex items-end justify-between gap-2 pt-4" },
        el("div", { className: "space-y-1.5" }, sizeWrap, el("div", null, priceEl)),
        btn
      )
    )
  );
}
