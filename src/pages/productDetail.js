import { el } from "../utils/dom.js";
import { navigate, routeLink } from "../router.js";
import { GRIND_OPTIONS } from "../data/constants.js";
import { beanPrice, formatShortDate, formatWeight, rupiah, whatsappBeanUrl } from "../utils/format.js";
import { store } from "../store/appStore.js";
import { BagSvg, ProductImage } from "../components/media.js";
import { RatingSummary, StarRatingDisplay, StarRatingInput } from "../components/rating.js";
import { showToast } from "../components/modal.js";
import { openCartDrawer } from "../components/cartDrawer.js";
import { CheckCircleSvg, GRIND_META, GrindOptionIcon, SensoryBars } from "../components/orderUi.js";

function stockColorClass(stock) {
  if (stock === "Habis") return "text-red-700";
  if (stock === "Stok Terbatas") return "text-amber-700";
  return "text-terra-700";
}

export function ProductDetailPage({ id }) {
  const bean = store.beans.find((b) => b.id === id);

  if (!bean) {
    return el(
      "div",
      { className: "container-x py-20 text-center" },
      el("h1", { className: "text-3xl" }, "Produk tidak ditemukan"),
      routeLink("/toko", { className: "btn-primary mt-6" }, "Kembali ke toko")
    );
  }

  let size = "200";
  let grind = GRIND_OPTIONS[0];
  let qty = 1;
  let visualMode = "photo";
  let ratingInput = 5;
  let addFeedbackTimer = null;

  const tone = bean.roast === "Dark" ? "dark" : bean.roast === "Light" ? "olive" : "light";
  const out = bean.stock === "Habis";

  const summarySlot = el("div", { className: "mt-3" });
  const visualStage = el("div");
  const visualTabs = el("div", { className: "inline-flex rounded-full border border-espresso-200 bg-white p-1" });
  const priceDisplay = el("p", { className: "font-display text-3xl tabular-nums text-espresso-700" });
  const unitHintDisplay = el("p", { className: "text-xs tabular-nums text-espresso-400" });
  const sizeButtonsWrap = el("div", { className: "grid grid-cols-2 gap-3" });
  const grindGridWrap = el("div", { className: "grid gap-2.5 sm:grid-cols-2" });
  const qtyDisplay = el("span", { className: "w-10 text-center text-sm font-semibold tabular-nums" }, "1");
  const totalWeightBadge = el("span", { className: "text-xs font-medium tabular-nums text-espresso-400" });
  const reviewsWrap = el("div", { className: "mt-6 space-y-4" });
  const reviewError = el("p", { className: "alert-error hidden" });
  const reviewerName = el("input", { id: "rev-name", className: "input", type: "text", required: true, placeholder: "Misal: Rizki" });
  const reviewerComment = el("textarea", {
    id: "rev-comment",
    rows: "3",
    className: "input",
    required: true,
    placeholder: "Bagaimana rasa dan aromanya?",
  });

  const savings500 = Math.max(0, Math.round(bean.price200 * 2.5 - bean.price500));

  const renderVisualStage = () => {
    visualTabs.replaceChildren(
      ...[
        { id: "photo", label: "Foto biji" },
        { id: "pouch", label: "Pratinjau kemasan" },
      ].map((tab) => {
        const active = visualMode === tab.id;
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              active ? "bg-espresso-700 text-cream-50" : "text-espresso-500 hover:text-espresso-800"
            }`,
            onClick: () => {
              visualMode = tab.id;
              renderVisualStage();
            },
          },
          tab.label
        );
      })
    );

    if (visualMode === "photo") {
      visualStage.replaceChildren(
        ProductImage({ bean, className: "aspect-square w-full rounded-[2rem]" })
      );
      return;
    }

    const batchText = store.batch?.date ? `Sangrai ${formatShortDate(store.batch.date)}` : `${bean.roast} roast`;
    visualStage.replaceChildren(
      el(
        "div",
        { className: "pop-in relative flex aspect-square w-full flex-col items-center justify-center rounded-[2rem] bg-cream-100 p-8 text-center" },
        el(
          "div",
          { className: "w-52 sm:w-60 drop-shadow-md transition-transform duration-300" },
          BagSvg({
            tone,
            title: bean.name,
            subtitle: `${size} g · ${grind}`,
            metaLine: batchText,
            className: "h-auto w-full",
          })
        ),
        el(
          "div",
          { className: "mt-4 space-y-0.5" },
          el("p", { className: "text-xs font-semibold text-espresso-700 tabular-nums" }, `${bean.name} · ${size} g`),
          el("p", { className: "text-xs text-espresso-500" }, `${grind} · ${batchText}`)
        )
      )
    );
  };

  const renderOrderControls = () => {
    const unit = beanPrice(bean, size);
    const total = unit * qty;
    const per100g = Math.round(unit / (Number(size) / 100));

    priceDisplay.textContent = rupiah(total);
    unitHintDisplay.textContent = `${rupiah(per100g)} / 100 g`;
    totalWeightBadge.textContent = `${formatWeight(Number(size) * qty)} total`;

    sizeButtonsWrap.replaceChildren(
      ...["200", "500"].map((s) => {
        const active = size === s;
        const unitPrice = beanPrice(bean, s);
        const unit100 = Math.round(unitPrice / (Number(s) / 100));
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `rounded-2xl border p-3.5 text-left transition ${
              active
                ? "border-espresso-700 bg-espresso-700 text-cream-50 shadow-sm"
                : "border-espresso-200 bg-white hover:border-espresso-400"
            }`,
            onClick: () => {
              size = s;
              renderOrderControls();
              if (visualMode === "pouch") renderVisualStage();
            },
          },
          el(
            "div",
            { className: "flex items-center justify-between gap-2" },
            el("span", { className: "text-xs font-semibold opacity-85 tabular-nums" }, `${s} gram`),
            CheckCircleSvg({ active, className: "h-4 w-4 shrink-0" })
          ),
          el("span", { className: "mt-1.5 block font-display text-lg tabular-nums" }, rupiah(unitPrice)),
          el(
            "span",
            { className: `mt-0.5 block text-[11px] tabular-nums ${active ? "text-terra-200" : "text-terra-600"}` },
            s === "500" && savings500 > 0 ? `Hemat ${rupiah(savings500)}` : `${rupiah(unit100)} / 100 g`
          )
        );
      })
    );

    grindGridWrap.replaceChildren(
      ...GRIND_OPTIONS.map((g) => {
        const active = grind === g;
        const meta = GRIND_META[g] || { hint: "", texture: g };
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
              active
                ? "border-espresso-700 bg-espresso-700 text-cream-50 shadow-sm"
                : "border-espresso-200 bg-white hover:border-espresso-400"
            }`,
            onClick: () => {
              grind = g;
              renderOrderControls();
              if (visualMode === "pouch") renderVisualStage();
            },
          },
          el(
            "span",
            {
              className: `mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                active ? "bg-espresso-600 text-cream-50" : "bg-cream-100 text-espresso-700"
              }`,
            },
            GrindOptionIcon({ grind: g, className: "h-5 w-5" })
          ),
          el(
            "span",
            { className: "min-w-0 flex-1" },
            el("span", { className: "block text-xs font-semibold" }, g),
            el("span", { className: `mt-0.5 block text-[11px] leading-snug ${active ? "text-cream-200" : "text-espresso-400"}` }, meta.hint)
          )
        );
      })
    );
  };

  const addBtn = el(
    "button",
    {
      type: "button",
      disabled: out,
      className: `btn flex-1 ${out ? "cursor-not-allowed bg-espresso-100 text-espresso-300" : "btn-primary"}`,
      onClick: () => {
        if (out) return;
        store.addToCart(bean.id, size, grind, qty);
        openCartDrawer();
        addBtn.textContent = "Masuk keranjang ✓";
        if (addFeedbackTimer) clearTimeout(addFeedbackTimer);
        addFeedbackTimer = setTimeout(() => {
          addBtn.textContent = "Tambah ke keranjang";
        }, 1600);
      },
    },
    out ? "Stok habis" : "Tambah ke keranjang"
  );

  const buyNowBtn = el(
    "button",
    {
      type: "button",
      disabled: out,
      className: `btn ${out ? "hidden" : "btn-accent"}`,
      onClick: () => {
        if (out) return;
        store.addToCart(bean.id, size, grind, qty);
        if (!store.customer) {
          showToast("Masuk akun dulu untuk lanjut ke checkout.");
          navigate("/masuk");
        } else {
          navigate("/checkout");
        }
      },
    },
    "Pesan langsung"
  );

  const renderReviews = () => {
    const { avg, count } = store.ratingOf(bean.id);
    summarySlot.replaceChildren(RatingSummary({ avg, count }));

    const list = store.reviews.filter((r) => r.beanId === bean.id);
    if (list.length === 0) {
      reviewsWrap.replaceChildren(el("p", { className: "text-sm text-espresso-400" }, "Belum ada ulasan untuk produk ini."));
      return;
    }

    reviewsWrap.replaceChildren(
      ...list.map((r) =>
        el(
          "article",
          { className: "card p-5" },
          el(
            "div",
            { className: "flex flex-wrap items-center justify-between gap-2" },
            el(
              "div",
              { className: "flex items-center gap-3" },
              el("span", { className: "font-semibold text-espresso-700" }, r.name),
              StarRatingDisplay({ value: r.rating, size: 14 })
            ),
            el("span", { className: "text-xs text-espresso-400" }, formatShortDate(r.date))
          ),
          el("p", { className: "mt-2 text-sm leading-relaxed text-espresso-600" }, r.comment)
        )
      )
    );
  };

  const submitBtn = el("button", { type: "submit", className: "btn-accent w-full" }, "Kirim ulasan");
  const reviewForm = el(
    "form",
    {
      className: "card space-y-4 p-6 lg:sticky lg:top-24 lg:self-start",
      onSubmit: async (e) => {
        e.preventDefault();
        reviewError.classList.add("hidden");
        const name = reviewerName.value.trim();
        const comment = reviewerComment.value.trim();
        if (!name || !comment) {
          reviewError.textContent = "Nama dan ulasan wajib diisi.";
          reviewError.classList.remove("hidden");
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim…";
        try {
          await store.addReview({ beanId: bean.id, name, rating: ratingInput, comment });
          reviewerName.value = "";
          reviewerComment.value = "";
          ratingInput = 5;
          showToast("Ulasan Anda telah ditambahkan.");
          renderReviews();
        } catch (err) {
          reviewError.textContent = err.message || "Gagal mengirim ulasan.";
          reviewError.classList.remove("hidden");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Kirim ulasan";
        }
      },
    },
    el("h3", { className: "text-xl" }, "Tulis ulasan"),
    reviewError,
    el("div", null, el("label", { className: "label", htmlFor: "rev-name" }, "Nama"), reviewerName),
    el(
      "div",
      null,
      el("span", { className: "label" }, "Rating"),
      StarRatingInput({
        initialValue: ratingInput,
        onChange: (n) => {
          ratingInput = n;
        },
      })
    ),
    el("div", null, el("label", { className: "label", htmlFor: "rev-comment" }, "Ulasan"), reviewerComment),
    submitBtn
  );

  renderVisualStage();
  renderOrderControls();
  renderReviews();

  return el(
    "div",
    { className: "page-in container-x py-10" },
    el(
      "nav",
      { className: "mb-8 text-sm text-espresso-400", "aria-label": "Breadcrumb" },
      routeLink("/", { className: "hover:text-espresso-700" }, "Beranda"),
      " / ",
      routeLink("/toko", { className: "hover:text-espresso-700" }, "Toko"),
      " / ",
      el("span", { className: "text-espresso-700" }, bean.name)
    ),
    el(
      "div",
      { className: "grid gap-10 lg:grid-cols-[0.95fr_1.05fr]" },
      el(
        "div",
        { className: "space-y-5 lg:sticky lg:top-24 lg:self-start" },
        visualStage,
        el("div", { className: "flex items-center justify-between gap-3" }, visualTabs, el("span", { className: "text-xs text-espresso-400" }, store.batch?.date ? `Batch ${formatShortDate(store.batch.date)}` : "Sangrai segar")),
        SensoryBars({ bean })
      ),
      el(
        "div",
        null,
        el(
          "p",
          { className: "text-xs font-semibold tracking-wide text-espresso-400" },
          el("span", null, bean.category),
          " · ",
          el("span", { className: stockColorClass(bean.stock) }, bean.stock)
        ),
        el("h1", { className: "mt-3 text-3xl sm:text-4xl" }, bean.name),
        summarySlot,
        el("p", { className: "mt-4 leading-relaxed text-espresso-500" }, bean.description),
        el(
          "dl",
          { className: "mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-espresso-100 py-5 text-sm sm:grid-cols-3" },
          ...[
            ["Asal", bean.region],
            ["Ketinggian", `${bean.altitude} mdpl`],
            ["Proses", bean.process],
            ["Sangrai", bean.roast],
            ["Rasa", bean.notes],
            ["Seduh", bean.brew.join(", ")],
          ].map(([k, v]) =>
            el(
              "div",
              null,
              el("dt", { className: "text-xs text-espresso-400" }, k),
              el("dd", { className: "mt-0.5 font-semibold text-espresso-700" }, v)
            )
          )
        ),
        el(
          "div",
          { className: "card mt-6 space-y-6 p-6" },
          el(
            "div",
            { className: "flex flex-wrap items-baseline justify-between gap-2 border-b border-espresso-100 pb-4" },
            el("div", null, el("span", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, "Total racikan"), priceDisplay),
            el("div", { className: "text-right" }, unitHintDisplay, totalWeightBadge)
          ),
          el("div", null, el("span", { className: "label" }, "1. Pilih berat kemasan"), sizeButtonsWrap),
          el("div", null, el("span", { className: "label" }, "2. Pilih jenis gilingan"), grindGridWrap),
          el(
            "div",
            { className: "space-y-3 border-t border-espresso-100 pt-4" },
            el(
              "div",
              { className: "flex flex-wrap items-center gap-3" },
              el(
                "div",
                { className: "flex items-center rounded-full border border-espresso-200 bg-white" },
                el(
                  "button",
                  {
                    type: "button",
                    className: "h-10 w-10 text-lg font-semibold",
                    "aria-label": "Kurangi jumlah",
                    onClick: () => {
                      qty = Math.max(1, qty - 1);
                      qtyDisplay.textContent = String(qty);
                      renderOrderControls();
                    },
                  },
                  "-"
                ),
                qtyDisplay,
                el(
                  "button",
                  {
                    type: "button",
                    className: "h-10 w-10 text-lg font-semibold",
                    "aria-label": "Tambah jumlah",
                    onClick: () => {
                      qty = Math.min(99, qty + 1);
                      qtyDisplay.textContent = String(qty);
                      renderOrderControls();
                    },
                  },
                  "+"
                )
              ),
              addBtn,
              buyNowBtn
            ),
            el(
              "a",
              {
                href: whatsappBeanUrl(bean),
                target: "_blank",
                rel: "noopener noreferrer",
                className: "btn-ghost w-full",
              },
              "Tanya stok lewat WhatsApp"
            )
          )
        )
      )
    ),
    el(
      "section",
      { className: "mt-16 border-t border-espresso-100 pt-12" },
      el(
        "div",
        { className: "grid gap-10 lg:grid-cols-[1.2fr_1fr]" },
        el(
          "div",
          null,
          el("h2", { className: "text-2xl sm:text-3xl" }, "Ulasan pembeli"),
          reviewsWrap
        ),
        reviewForm
      )
    )
  );
}
