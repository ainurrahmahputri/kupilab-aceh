import { el } from "../utils/dom.js";
import { CATEGORIES, FLAVORS, ORIGINS, ROAST_LEVELS } from "../data/constants.js";
import { store } from "../store/appStore.js";
import { BeanCard } from "../components/beanCard.js";
import { EditorialImage } from "../components/media.js";

function toggleInList(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function ShopPage() {
  const state = {
    query: "",
    category: "",
    flavors: [],
    roasts: [],
    origins: [],
    sort: "default",
  };

  const countLabel = el("p", { className: "text-sm tabular-nums text-espresso-500" });
  const resetTopBtn = el("button", { type: "button", className: "btn-ghost hidden w-full text-xs" }, "Reset semua filter");
  const gridContainer = el("div");
  const flavorWrap = el("div", { className: "flex flex-wrap gap-2" });
  const roastWrap = el("div", { className: "flex flex-wrap gap-2" });
  const originWrap = el("div", { className: "flex flex-wrap gap-2" });

  const searchInput = el("input", {
    id: "cari",
    className: "input",
    type: "search",
    placeholder: "Gayo, natural, cokelat…",
    value: "",
    onInput: (e) => {
      state.query = e.target.value;
      renderProducts();
    },
  });

  const categorySelect = el(
    "select",
    {
      id: "kategori",
      className: "input",
      onChange: (e) => {
        state.category = e.target.value;
        renderProducts();
      },
    },
    el("option", { value: "" }, "Semua"),
    ...CATEGORIES.map((c) => el("option", { value: c }, c))
  );
  categorySelect.value = state.category;

  const sortSelect = el(
    "select",
    {
      id: "urutkan",
      className: "input w-auto",
      onChange: (e) => {
        state.sort = e.target.value;
        renderProducts();
      },
    },
    el("option", { value: "default" }, "Bawaan"),
    el("option", { value: "murah" }, "Harga terendah"),
    el("option", { value: "mahal" }, "Harga tertinggi"),
    el("option", { value: "rating" }, "Rating tertinggi")
  );
  sortSelect.value = state.sort;

  const resetAll = () => {
    state.query = "";
    state.category = "";
    state.flavors = [];
    state.roasts = [];
    state.origins = [];
    searchInput.value = "";
    categorySelect.value = "";
    renderFilterButtons();
    renderProducts();
  };

  resetTopBtn.addEventListener("click", resetAll);

  const renderToggleGroup = (container, items, listKey) => {
    container.replaceChildren(
      ...items.map((item) => {
        const active = state[listKey].includes(item);
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `filter-btn ${active ? "filter-btn-active" : ""}`,
            onClick: () => {
              state[listKey] = toggleInList(state[listKey], item);
              renderFilterButtons();
              renderProducts();
            },
          },
          item
        );
      })
    );
  };

  const renderFilterButtons = () => {
    renderToggleGroup(flavorWrap, FLAVORS, "flavors");
    renderToggleGroup(roastWrap, ROAST_LEVELS, "roasts");
    renderToggleGroup(originWrap, ORIGINS, "origins");
  };

  const renderProducts = () => {
    const q = state.query.trim().toLowerCase();
    const list = store.beans.filter((b) => {
      if (state.category && b.category !== state.category) return false;
      if (state.flavors.length && !state.flavors.some((f) => b.flavors.includes(f))) return false;
      if (state.roasts.length && !state.roasts.includes(b.roast)) return false;
      if (state.origins.length && !state.origins.includes(b.origin)) return false;
      if (q && !`${b.name} ${b.region} ${b.process} ${b.notes}`.toLowerCase().includes(q)) return false;
      return true;
    });

    if (state.sort === "murah") list.sort((a, b) => a.price200 - b.price200);
    if (state.sort === "mahal") list.sort((a, b) => b.price200 - a.price200);
    if (state.sort === "rating") list.sort((a, b) => store.ratingOf(b.id).avg - store.ratingOf(a.id).avg);

    const hasFilters = Boolean(
      state.query || state.category || state.flavors.length || state.roasts.length || state.origins.length
    );
    resetTopBtn.classList.toggle("hidden", !hasFilters);

    countLabel.textContent = `Menampilkan ${list.length} dari ${store.beans.length} produk`;

    if (list.length === 0) {
      gridContainer.replaceChildren(
        el(
          "div",
          { className: "card p-12 text-center" },
          el("p", { className: "font-display text-2xl text-espresso-700" }, "Tidak ada biji yang cocok"),
          el("p", { className: "mt-2 text-sm text-espresso-400" }, "Coba kurangi filter atau cari kata kunci lain."),
          el("button", { type: "button", className: "btn-primary mt-5", onClick: resetAll }, "Reset filter")
        )
      );
      return;
    }

    gridContainer.replaceChildren(
      el(
        "div",
        { className: "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" },
        ...list.map((bean) => BeanCard({ bean }))
      )
    );
  };

  renderFilterButtons();
  renderProducts();

  return el(
    "div",
    { className: "page-in" },
    el(
      "section",
      { className: "overflow-hidden bg-espresso-800" },
      el(
        "div",
        { className: "relative h-24 w-full overflow-hidden bg-espresso-900 sm:h-28" },
        EditorialImage({
          name: "roaster",
          alt: "Biji kopi sangrai di mesin roaster KupiLab Aceh",
          eager: true,
          className: "h-full w-full !bg-transparent opacity-50",
        }),
        el("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-espresso-800/80" })
      ),
      el(
        "div",
        { className: "container-x py-10 sm:py-12" },
        el("p", { className: "eyebrow !text-cream-200 before:!bg-cream-300" }, "Toko"),
        el("h1", { className: "mt-3 text-4xl !text-white sm:text-5xl" }, "Biji kopi sangrai"),
        el(
          "p",
          { className: "mt-3 max-w-xl leading-relaxed text-cream-200" },
          "Pilih biji pilihan dari dataran tinggi Aceh, atur berat dan gilingan sesuai alat seduhmu, lalu selesaikan pemesanan langsung."
        )
      )
    ),
    el(
      "div",
      { className: "container-x py-10" },
      el(
        "div",
        { className: "grid gap-8 lg:grid-cols-[16rem_1fr]" },
        el(
          "aside",
          {
            className: "space-y-6 rounded-[2rem] bg-cream-100/70 p-6 lg:sticky lg:top-24 lg:self-start",
            "aria-label": "Filter produk",
          },
          el("div", null, el("label", { className: "label", htmlFor: "cari" }, "Cari"), searchInput),
          el("div", null, el("label", { className: "label", htmlFor: "kategori" }, "Kategori"), categorySelect),
          el("div", null, el("span", { className: "label" }, "Profil rasa"), flavorWrap),
          el("div", null, el("span", { className: "label" }, "Tingkat sangrai"), roastWrap),
          el("div", null, el("span", { className: "label" }, "Asal daerah"), originWrap),
          resetTopBtn
        ),
        el(
          "div",
          null,
          el(
            "div",
            { className: "mb-6 flex flex-wrap items-center justify-between gap-3" },
            countLabel,
            el(
              "div",
              { className: "flex items-center gap-2" },
              el("label", { htmlFor: "urutkan", className: "text-xs font-semibold text-espresso-400" }, "Urutkan"),
              sortSelect
            )
          ),
          gridContainer
        )
      )
    )
  );
}
