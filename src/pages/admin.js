import { el } from "../utils/dom.js";
import { navigate, routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { CATEGORIES, FLAVORS, ORDER_STATUSES, ORIGINS, ROAST_LEVELS, STOCK_STATUSES } from "../data/constants.js";
import { formatLongDate, formatShortDate, rupiah, slugify, toIsoDate } from "../utils/format.js";
import { BrandWordmark } from "../components/brand.js";
import { StarRatingDisplay } from "../components/rating.js";
import { confirmDialog, showToast } from "../components/modal.js";

const TABS = [
  ["ringkasan", "Ringkasan"],
  ["produk", "Produk"],
  ["pesanan", "Pesanan"],
  ["ulasan", "Ulasan"],
  ["batch", "Jadwal Batch"],
  ["jurnal", "Jurnal Seduh"],
];

function stockColorClass(stock) {
  if (stock === "Habis") return "text-red-700";
  if (stock === "Stok Terbatas") return "text-amber-700";
  return "text-terra-700";
}

function emptyBean() {
  return {
    id: "",
    name: "",
    category: CATEGORIES[0],
    region: "",
    origin: ORIGINS[0],
    altitude: 1400,
    process: "",
    flavors: ["Chocolatey"],
    roast: "Medium",
    notes: "",
    brew: ["V60", "Sanger"],
    stock: "Tersedia",
    description: "",
    price200: 70000,
    price500: 155000,
    image: "",
  };
}

function emptyArticle() {
  return {
    id: "",
    slug: "",
    title: "",
    excerpt: "",
    author: "Tim KupiLab",
    date: toIsoDate(),
    readMinutes: 3,
    body: "",
  };
}

export function AdminPage() {
  if (!store.adminToken || !store.adminStatus.authenticated) {
    queueMicrotask(() => navigate("/admin/login", { replace: true }));
    return el("div");
  }

  let activeTab = "ringkasan";
  let editingBean = null;
  let isNewBean = false;
  let editingArticle = null;
  let isNewArticle = false;
  let orderFilter = "Semua";

  const tabsBar = el("div", { className: "flex flex-wrap gap-2", role: "tablist" });
  const contentArea = el("div", { className: "mt-8" });

  store.loadAdminOrders().catch(() => {
    if (!store.adminToken) {
      navigate("/admin/login", { replace: true });
    }
  });

  const renderTabs = () => {
    tabsBar.replaceChildren(
      ...TABS.map(([id, label]) =>
        el(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": String(activeTab === id),
            className: `rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === id ? "bg-espresso-700 text-white" : "bg-cream-200 text-espresso-600 hover:bg-cream-300"
            }`,
            onClick: () => {
              activeTab = id;
              renderTabs();
              renderContent();
            },
          },
          label
        )
      )
    );
  };

  const renderSummary = () => {
    const beans = store.beans;
    const articles = store.articles;
    const reviews = store.reviews;
    const orders = store.adminOrders;
    const avg = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0";
    const pendingOrders = orders.filter((o) => o.status === "Menunggu pembayaran" || o.status === "Dibayar");
    const revenue = orders
      .filter((o) => o.status !== "Batal")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const stats = [
      ["Produk kopi", String(beans.length)],
      ["Artikel jurnal", String(articles.length)],
      ["Pesanan tercatat", String(orders.length)],
      ["Nilai pesanan aktif", rupiah(revenue)],
      ["Ulasan pembeli", `${reviews.length} (rata-rata ${avg} ★)`],
    ];

    contentArea.replaceChildren(
      el(
        "div",
        { className: "space-y-8" },
        el(
          "div",
          { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-5" },
          ...stats.map(([label, val]) =>
            el(
              "div",
              { className: "card p-5" },
              el("p", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, label),
              el("p", { className: "mt-2 font-display text-2xl tabular-nums text-espresso-700" }, val)
            )
          )
        ),
        el(
          "div",
          { className: "grid gap-6 lg:grid-cols-2" },
          el(
            "div",
            { className: "card p-6" },
            el("p", { className: "eyebrow" }, "Batch sangrai berikutnya"),
            el("p", { className: "mt-2 font-display text-2xl tabular-nums" }, formatLongDate(store.batch.date)),
            el("p", { className: "mt-1 text-sm text-espresso-500" }, `Roaster: ${store.batch.roaster}`),
            el("p", { className: "mt-2 text-sm text-espresso-500" }, store.batch.note || "-"),
            el(
              "button",
              {
                type: "button",
                className: "btn-ghost mt-5",
                onClick: () => {
                  activeTab = "batch";
                  renderTabs();
                  renderContent();
                },
              },
              "Ubah jadwal batch"
            )
          ),
          el(
            "div",
            { className: "card p-6" },
            el("p", { className: "eyebrow" }, "Perlu perhatian"),
            el("p", { className: "mt-2 font-display text-2xl tabular-nums" }, `${pendingOrders.length} pesanan baru / dibayar`),
            el("p", { className: "mt-2 text-sm text-espresso-500" }, "Periksa pembayaran atau ubah status menjadi diproses / dikirim."),
            el(
              "button",
              {
                type: "button",
                className: "btn-primary mt-5",
                onClick: () => {
                  activeTab = "pesanan";
                  renderTabs();
                  renderContent();
                },
              },
              "Kelola pesanan"
            )
          )
        ),
        el(
          "div",
          { className: "card flex flex-wrap items-center justify-between gap-4 p-6" },
          el(
            "div",
            null,
            el("h2", { className: "text-xl" }, "Reset data katalog & ulasan"),
            el("p", { className: "mt-1 text-sm text-espresso-400" }, "Mengembalikan produk, artikel, ulasan, dan jadwal batch ke kondisi awal (akun dan kata sandi pengelola tetap terjaga).")
          ),
          el(
            "button",
            {
              type: "button",
              className: "btn-danger",
              onClick: async () => {
                const ok = await confirmDialog({
                  title: "Reset data bawaan?",
                  message: "Semua perubahan produk, artikel, ulasan, dan jadwal batch akan dikembalikan ke data awal.",
                  confirmLabel: "Ya, reset data",
                  danger: true,
                });
                if (!ok) return;
                try {
                  await store.resetDemoData();
                  showToast("Data berhasil dikembalikan ke kondisi awal.");
                  renderContent();
                } catch (err) {
                  showToast(err.message || "Gagal mereset data.");
                }
              },
            },
            "Reset ke data awal"
          )
        )
      )
    );
  };

  const renderBeanEditor = () => {
    const formState = { ...editingBean, brewText: (editingBean.brew || []).join(", ") };
    const errEl = el("p", { className: "alert-error hidden" });
    const nameIn = el("input", { className: "input", type: "text", value: formState.name, required: true });
    const regionIn = el("input", { className: "input", type: "text", value: formState.region, placeholder: "Misal: Takengon, Aceh Tengah", required: true });
    const altitudeIn = el("input", { className: "input tabular-nums", type: "number", value: String(formState.altitude || 1400), required: true });
    const processIn = el("input", { className: "input", type: "text", value: formState.process, placeholder: "Natural / Washed / Giling Basah" });
    const notesIn = el("input", { className: "input", type: "text", value: formState.notes, placeholder: "Cokelat, beri merah, rempah" });
    const brewIn = el("input", { className: "input", type: "text", value: formState.brewText, placeholder: "V60, Sanger, French press" });
    const p200In = el("input", { className: "input tabular-nums", type: "number", value: String(formState.price200 || 70000), required: true });
    const p500In = el("input", { className: "input tabular-nums", type: "number", value: String(formState.price500 || 155000), required: true });
    const descIn = el("textarea", { rows: "3", className: "input" });
    descIn.value = formState.description || "";

    const catSel = el("select", { className: "input" }, ...CATEGORIES.map((c) => el("option", { value: c }, c)));
    catSel.value = formState.category;

    const originSel = el("select", { className: "input" }, ...ORIGINS.map((o) => el("option", { value: o }, o)));
    originSel.value = formState.origin;

    const roastSel = el("select", { className: "input" }, ...ROAST_LEVELS.map((r) => el("option", { value: r }, r)));
    roastSel.value = formState.roast;

    const stockSel = el("select", { className: "input" }, ...STOCK_STATUSES.map((s) => el("option", { value: s }, s)));
    stockSel.value = formState.stock;

    const flavorButtonsWrap = el("div", { className: "flex flex-wrap gap-2" });
    const renderFlavors = () => {
      flavorButtonsWrap.replaceChildren(
        ...FLAVORS.map((f) => {
          const on = formState.flavors.includes(f);
          return el(
            "button",
            {
              type: "button",
              "aria-pressed": String(on),
              className: `filter-btn ${on ? "filter-btn-active" : ""}`,
              onClick: () => {
                formState.flavors = on
                  ? formState.flavors.filter((x) => x !== f)
                  : [...formState.flavors, f];
                renderFlavors();
              },
            },
            f
          );
        })
      );
    };
    renderFlavors();

    const saveBtn = el("button", { type: "submit", className: "btn-primary" }, "Simpan produk");

    contentArea.replaceChildren(
      el(
        "form",
        {
          className: "card max-w-3xl space-y-4 p-6",
          onSubmit: async (e) => {
            e.preventDefault();
            errEl.classList.add("hidden");
            const payload = {
              id: formState.id,
              name: nameIn.value.trim(),
              category: catSel.value,
              region: regionIn.value.trim(),
              origin: originSel.value,
              altitude: Number(altitudeIn.value),
              process: processIn.value.trim(),
              flavors: formState.flavors,
              roast: roastSel.value,
              notes: notesIn.value.trim(),
              brew: brewIn.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
              stock: stockSel.value,
              description: descIn.value.trim(),
              price200: Number(p200In.value),
              price500: Number(p500In.value),
              image: formState.image || "",
            };
            saveBtn.disabled = true;
            saveBtn.textContent = "Menyimpan…";
            try {
              await store.saveBean(payload, isNewBean);
              editingBean = null;
              isNewBean = false;
              showToast("Produk berhasil disimpan.");
              renderContent();
            } catch (err) {
              errEl.textContent = err.message || "Gagal menyimpan produk.";
              errEl.classList.remove("hidden");
              saveBtn.disabled = false;
              saveBtn.textContent = "Simpan produk";
            }
          },
        },
        el(
          "div",
          { className: "flex items-center justify-between gap-4" },
          el("h2", { className: "text-2xl" }, isNewBean ? "Tambah produk" : "Edit produk"),
          el(
            "button",
            {
              type: "button",
              className: "btn-ghost",
              onClick: () => {
                editingBean = null;
                isNewBean = false;
                renderContent();
              },
            },
            "Batal"
          )
        ),
        errEl,
        el(
          "div",
          { className: "grid gap-4 sm:grid-cols-2" },
          el("div", null, el("label", { className: "label" }, "Nama produk"), nameIn),
          el("div", null, el("label", { className: "label" }, "Kategori"), catSel),
          el("div", null, el("label", { className: "label" }, "Daerah tertulis"), regionIn),
          el("div", null, el("label", { className: "label" }, "Asal daerah (filter)"), originSel),
          el("div", null, el("label", { className: "label" }, "Ketinggian (mdpl)"), altitudeIn),
          el("div", null, el("label", { className: "label" }, "Proses"), processIn),
          el("div", null, el("label", { className: "label" }, "Tingkat sangrai"), roastSel),
          el("div", null, el("label", { className: "label" }, "Stok"), stockSel),
          el("div", null, el("label", { className: "label" }, "Harga 200 g (Rp)"), p200In),
          el("div", null, el("label", { className: "label" }, "Harga 500 g (Rp)"), p500In)
        ),
        el("div", null, el("span", { className: "label" }, "Profil rasa"), flavorButtonsWrap),
        el("div", null, el("label", { className: "label" }, "Catatan rasa"), notesIn),
        el("div", null, el("label", { className: "label" }, "Cocok untuk seduh (pisah koma)"), brewIn),
        el("div", null, el("label", { className: "label" }, "Deskripsi"), descIn),
        saveBtn
      )
    );
  };

  const renderProducts = () => {
    if (editingBean) {
      renderBeanEditor();
      return;
    }

    contentArea.replaceChildren(
      el(
        "div",
        { className: "space-y-4" },
        el(
          "div",
          { className: "flex flex-wrap items-center justify-between gap-3" },
          el("h2", { className: "text-2xl tabular-nums" }, `Daftar produk (${store.beans.length})`),
          el(
            "button",
            {
              type: "button",
              className: "btn-accent",
              onClick: () => {
                editingBean = emptyBean();
                isNewBean = true;
                renderContent();
              },
            },
            "+ Tambah produk"
          )
        ),
        el(
          "div",
          { className: "card overflow-x-auto" },
          el(
            "table",
            { className: "w-full min-w-[40rem] border-collapse text-sm" },
            el(
              "thead",
              null,
              el(
                "tr",
                { className: "border-b border-espresso-100 bg-cream-100/70 text-left text-xs font-semibold uppercase tracking-wide text-espresso-500" },
                el("th", { className: "px-4 py-3" }, "Nama"),
                el("th", { className: "px-4 py-3" }, "Kategori"),
                el("th", { className: "px-4 py-3" }, "200 g"),
                el("th", { className: "px-4 py-3" }, "Stok"),
                el("th", { className: "px-4 py-3 text-right" }, "Aksi")
              )
            ),
            el(
              "tbody",
              null,
              ...store.beans.map((b) =>
                el(
                  "tr",
                  { className: "border-b border-espresso-100 last:border-0" },
                  el(
                    "td",
                    { className: "px-4 py-3" },
                    el("p", { className: "font-semibold text-espresso-700" }, b.name),
                    el("p", { className: "text-xs text-espresso-400" }, `${b.region} · ${b.roast}`)
                  ),
                  el("td", { className: "px-4 py-3 text-espresso-500" }, b.category),
                  el("td", { className: "px-4 py-3 font-semibold tabular-nums" }, rupiah(b.price200)),
                  el("td", { className: `px-4 py-3 font-semibold ${stockColorClass(b.stock)}` }, b.stock),
                  el(
                    "td",
                    { className: "space-x-2 px-4 py-3 text-right" },
                    el(
                      "button",
                      {
                        type: "button",
                        className: "text-sm font-semibold text-terra-600 hover:underline",
                        onClick: () => {
                          editingBean = { ...b };
                          isNewBean = false;
                          renderContent();
                        },
                      },
                      "Edit"
                    ),
                    el(
                      "button",
                      {
                        type: "button",
                        className: "text-sm font-semibold text-red-700 hover:underline",
                        onClick: async () => {
                          const ok = await confirmDialog({
                            title: "Hapus produk",
                            message: `Yakin menghapus "${b.name}"? Ulasan produk ini juga akan terhapus.`,
                            confirmLabel: "Ya, hapus",
                            danger: true,
                          });
                          if (!ok) return;
                          try {
                            await store.removeBean(b.id);
                            showToast("Produk dihapus.");
                            renderContent();
                          } catch (err) {
                            showToast(err.message || "Gagal menghapus produk.");
                          }
                        },
                      },
                      "Hapus"
                    )
                  )
                )
              )
            )
          )
        )
      )
    );
  };

  const renderOrders = () => {
    const orders = store.adminOrders;
    const filtered = orderFilter === "Semua" ? orders : orders.filter((o) => o.status === orderFilter);

    const filterSelect = el(
      "select",
      {
        className: "input w-auto",
        "aria-label": "Filter status pesanan",
        onChange: (e) => {
          orderFilter = e.target.value;
          renderContent();
        },
      },
      el("option", { value: "Semua" }, `Semua (${orders.length})`),
      ...ORDER_STATUSES.map((s) =>
        el("option", { value: s }, `${s} (${orders.filter((o) => o.status === s).length})`)
      )
    );
    filterSelect.value = orderFilter;

    const listEl =
      filtered.length === 0
        ? el("div", { className: "card p-8 text-center text-sm text-espresso-400" }, "Belum ada pesanan.")
        : el(
            "div",
            { className: "space-y-4" },
            ...filtered.map((o) => {
              const statusSel = el(
                "select",
                {
                  className: "input w-auto py-1.5 text-xs font-semibold",
                  "aria-label": `Status pesanan ${o.id}`,
                  onChange: async (e) => {
                    try {
                      await store.updateAdminOrder(o.id, { status: e.target.value });
                      showToast(`Status pesanan #${o.id.slice(0, 8)} diperbarui.`);
                      renderContent();
                    } catch (err) {
                      showToast(err.message || "Gagal memperbarui status.");
                    }
                  },
                },
                ...ORDER_STATUSES.map((s) => el("option", { value: s }, s))
              );
              statusSel.value = o.status;

              const trackingIn = el("input", {
                type: "text",
                className: "input w-48 py-1.5 text-xs font-mono",
                placeholder: "Nomor resi pengiriman",
                value: o.tracking || "",
              });

              const saveTrackBtn = el(
                "button",
                {
                  type: "button",
                  className: "btn-ghost px-3 py-1.5 text-xs",
                  onClick: async () => {
                    try {
                      await store.updateAdminOrder(o.id, {
                        status: statusSel.value,
                        tracking: trackingIn.value.trim(),
                      });
                      showToast("Nomor resi disimpan.");
                      renderContent();
                    } catch (err) {
                      showToast(err.message || "Gagal menyimpan resi.");
                    }
                  },
                },
                "Simpan resi"
              );

              return el(
                "article",
                { className: "card space-y-4 p-6" },
                el(
                  "div",
                  { className: "flex flex-wrap items-start justify-between gap-4" },
                  el(
                    "div",
                    null,
                    el("p", { className: "font-display text-xl tabular-nums text-espresso-700" }, `#${o.id.slice(0, 8)}`),
                    el("p", { className: "mt-0.5 text-xs text-espresso-400" }, `${formatShortDate(o.createdAt)} · ${o.payment} · ${o.courier}`)
                  ),
                  el(
                    "div",
                    { className: "flex flex-wrap items-center gap-2" },
                    statusSel,
                    el(
                      "button",
                      {
                        type: "button",
                        className: "text-xs font-semibold text-red-700 hover:underline px-2",
                        onClick: async () => {
                          const ok = await confirmDialog({
                            title: "Hapus pesanan",
                            message: `Hapus pesanan #${o.id.slice(0, 8)} atas nama ${o.customer}?`,
                            confirmLabel: "Ya, hapus",
                            danger: true,
                          });
                          if (!ok) return;
                          try {
                            await store.removeAdminOrder(o.id);
                            showToast("Pesanan dihapus.");
                            renderContent();
                          } catch (err) {
                            showToast(err.message || "Gagal menghapus pesanan.");
                          }
                        },
                      },
                      "Hapus"
                    )
                  )
                ),
                el(
                  "div",
                  { className: "grid gap-4 text-sm sm:grid-cols-2" },
                  el(
                    "div",
                    null,
                    el("p", { className: "font-semibold text-espresso-700" }, `${o.customer} · ${o.phone}`),
                    el("p", { className: "mt-1 text-espresso-500" }, o.address),
                    o.note ? el("p", { className: "mt-1 text-xs text-espresso-400" }, `Catatan: ${o.note}`) : null
                  ),
                  el(
                    "div",
                    { className: "space-y-1 sm:text-right" },
                    ...o.items.map((item) =>
                      el("p", { className: "text-xs text-espresso-600" }, `${item.name} (${item.size} g · ${item.grind}) × ${item.qty}`)
                    ),
                    el("p", { className: "pt-1 font-display text-lg tabular-nums text-espresso-800" }, rupiah(o.total))
                  )
                ),
                el(
                  "div",
                  { className: "flex flex-wrap items-center gap-2 border-t border-espresso-100 pt-3" },
                  el("span", { className: "text-xs font-semibold text-espresso-400" }, "Resi:"),
                  trackingIn,
                  saveTrackBtn
                )
              );
            })
          );

    contentArea.replaceChildren(
      el(
        "div",
        { className: "space-y-4" },
        el(
          "div",
          { className: "flex flex-wrap items-center justify-between gap-3" },
          el("h2", { className: "text-2xl tabular-nums" }, `Pesanan (${filtered.length})`),
          filterSelect
        ),
        listEl
      )
    );
  };

  const renderReviews = () => {
    const reviews = store.reviews;
    const listEl =
      reviews.length === 0
        ? el("p", { className: "card p-8 text-center text-sm text-espresso-400" }, "Belum ada ulasan.")
        : el(
            "div",
            { className: "space-y-3" },
            ...reviews.map((r) => {
              const bean = store.beans.find((b) => b.id === r.beanId);
              return el(
                "article",
                { className: "card flex flex-wrap items-start justify-between gap-4 p-5" },
                el(
                  "div",
                  null,
                  el(
                    "div",
                    { className: "flex flex-wrap items-center gap-3" },
                    el("span", { className: "font-semibold text-espresso-700" }, r.name),
                    StarRatingDisplay({ value: r.rating, size: 14 }),
                    bean ? el("span", { className: "text-xs text-espresso-400" }, bean.name) : null,
                    r.demo ? el("span", { className: "text-xs font-semibold text-amber-700" }, "Contoh awal") : null
                  ),
                  el("p", { className: "mt-2 text-sm text-espresso-600" }, r.comment),
                  el("p", { className: "mt-1 text-xs text-espresso-400" }, formatShortDate(r.date))
                ),
                el(
                  "button",
                  {
                    type: "button",
                    className: "text-sm font-semibold text-red-700 hover:underline",
                    onClick: async () => {
                      const ok = await confirmDialog({
                        title: "Hapus ulasan",
                        message: `Hapus ulasan dari ${r.name}?`,
                        confirmLabel: "Ya, hapus",
                        danger: true,
                      });
                      if (!ok) return;
                      try {
                        await store.removeReview(r.id);
                        showToast("Ulasan dihapus.");
                        renderContent();
                      } catch (err) {
                        showToast(err.message || "Gagal menghapus ulasan.");
                      }
                    },
                  },
                  "Hapus"
                )
              );
            })
          );

    contentArea.replaceChildren(
      el(
        "div",
        { className: "space-y-4" },
        el(
          "div",
          { className: "flex flex-wrap items-center justify-between gap-3" },
          el("h2", { className: "text-2xl tabular-nums" }, `Ulasan (${reviews.length})`),
          reviews.some((r) => r.demo)
            ? el(
                "button",
                {
                  type: "button",
                  className: "btn-ghost",
                  onClick: async () => {
                    const ok = await confirmDialog({
                      title: "Hapus semua ulasan contoh",
                      message: "Ulasan contoh bawaan akan dihapus. Ulasan baru dari pembeli tetap tersimpan.",
                      confirmLabel: "Ya, bersihkan",
                      danger: true,
                    });
                    if (!ok) return;
                    try {
                      await store.clearDemoReviews();
                      showToast("Ulasan contoh dibersihkan.");
                      renderContent();
                    } catch (err) {
                      showToast(err.message || "Gagal menghapus ulasan contoh.");
                    }
                  },
                },
                "Hapus ulasan contoh"
              )
            : null
        ),
        listEl
      )
    );
  };

  const renderBatch = () => {
    const dateIn = el("input", { className: "input", type: "date", value: store.batch.date || toIsoDate(), required: true });
    const roasterIn = el("input", { className: "input", type: "text", value: store.batch.roaster || "", required: true });
    const noteIn = el("textarea", { rows: "3", className: "input" });
    noteIn.value = store.batch.note || "";
    const errEl = el("p", { className: "alert-error hidden" });
    const saveBtn = el("button", { type: "submit", className: "btn-primary" }, "Simpan jadwal");

    contentArea.replaceChildren(
      el(
        "form",
        {
          className: "card max-w-xl space-y-4 p-6",
          onSubmit: async (e) => {
            e.preventDefault();
            errEl.classList.add("hidden");
            saveBtn.disabled = true;
            saveBtn.textContent = "Menyimpan…";
            try {
              await store.saveBatch({
                date: dateIn.value,
                roaster: roasterIn.value.trim(),
                note: noteIn.value.trim(),
              });
              showToast("Jadwal batch sangrai disimpan.");
            } catch (err) {
              errEl.textContent = err.message || "Gagal menyimpan jadwal.";
              errEl.classList.remove("hidden");
            } finally {
              saveBtn.disabled = false;
              saveBtn.textContent = "Simpan jadwal";
            }
          },
        },
        el("h2", { className: "text-2xl" }, "Jadwal batch sangrai"),
        errEl,
        el("div", null, el("label", { className: "label" }, "Tanggal sangrai berikutnya"), dateIn),
        el("div", null, el("label", { className: "label" }, "Roaster"), roasterIn),
        el("div", null, el("label", { className: "label" }, "Catatan"), noteIn),
        saveBtn
      )
    );
  };

  const renderArticleEditor = () => {
    const errEl = el("p", { className: "alert-error hidden" });
    const titleIn = el("input", { className: "input", type: "text", value: editingArticle.title || "", required: true });
    const authorIn = el("input", { className: "input", type: "text", value: editingArticle.author || "Tim KupiLab" });
    const minsIn = el("input", { className: "input tabular-nums", type: "number", value: String(editingArticle.readMinutes || 3), required: true });
    const dateIn = el("input", { className: "input", type: "date", value: editingArticle.date || toIsoDate(), required: true });
    const excerptIn = el("textarea", { rows: "2", className: "input" });
    excerptIn.value = editingArticle.excerpt || "";
    const bodyIn = el("textarea", { rows: "12", className: "input font-mono text-xs", required: true });
    bodyIn.value = editingArticle.body || "";

    const saveBtn = el("button", { type: "submit", className: "btn-primary" }, "Simpan artikel");

    contentArea.replaceChildren(
      el(
        "form",
        {
          className: "card max-w-3xl space-y-4 p-6",
          onSubmit: async (e) => {
            e.preventDefault();
            errEl.classList.add("hidden");
            const payload = {
              id: editingArticle.id,
              slug: editingArticle.slug || slugify(titleIn.value),
              title: titleIn.value.trim(),
              author: authorIn.value.trim() || "Tim KupiLab",
              date: dateIn.value || toIsoDate(),
              readMinutes: Number(minsIn.value) || 1,
              excerpt: excerptIn.value.trim(),
              body: bodyIn.value.trim(),
            };
            saveBtn.disabled = true;
            saveBtn.textContent = "Menyimpan…";
            try {
              await store.saveArticle(payload, isNewArticle);
              editingArticle = null;
              isNewArticle = false;
              showToast("Artikel jurnal disimpan.");
              renderContent();
            } catch (err) {
              errEl.textContent = err.message || "Gagal menyimpan artikel.";
              errEl.classList.remove("hidden");
              saveBtn.disabled = false;
              saveBtn.textContent = "Simpan artikel";
            }
          },
        },
        el(
          "div",
          { className: "flex items-center justify-between gap-4" },
          el("h2", { className: "text-2xl" }, isNewArticle ? "Tulis artikel" : "Edit artikel"),
          el(
            "button",
            {
              type: "button",
              className: "btn-ghost",
              onClick: () => {
                editingArticle = null;
                isNewArticle = false;
                renderContent();
              },
            },
            "Batal"
          )
        ),
        errEl,
        el("div", null, el("label", { className: "label" }, "Judul"), titleIn),
        el(
          "div",
          { className: "grid gap-4 sm:grid-cols-3" },
          el("div", null, el("label", { className: "label" }, "Penulis"), authorIn),
          el("div", null, el("label", { className: "label" }, "Tanggal"), dateIn),
          el("div", null, el("label", { className: "label" }, "Menit baca"), minsIn)
        ),
        el("div", null, el("label", { className: "label" }, "Ringkasan"), excerptIn),
        el("div", null, el("label", { className: "label" }, "Isi (gunakan ## untuk subjudul)"), bodyIn),
        saveBtn
      )
    );
  };

  const renderJournal = () => {
    if (editingArticle) {
      renderArticleEditor();
      return;
    }

    contentArea.replaceChildren(
      el(
        "div",
        { className: "space-y-4" },
        el(
          "div",
          { className: "flex flex-wrap items-center justify-between gap-3" },
          el("h2", { className: "text-2xl tabular-nums" }, `Jurnal Seduh (${store.articles.length})`),
          el(
            "button",
            {
              type: "button",
              className: "btn-accent",
              onClick: () => {
                editingArticle = emptyArticle();
                isNewArticle = true;
                renderContent();
              },
            },
            "+ Tulis artikel"
          )
        ),
        el(
          "div",
          { className: "space-y-3" },
          ...store.articles.map((art) =>
            el(
              "article",
              { className: "card flex flex-wrap items-center justify-between gap-4 p-5" },
              el(
                "div",
                null,
                el("h3", { className: "text-xl" }, art.title),
                el("p", { className: "mt-1 text-xs tabular-nums text-espresso-400" }, `${art.author} · ${formatShortDate(art.date)} · ${art.readMinutes} menit baca`)
              ),
              el(
                "div",
                { className: "space-x-3" },
                el(
                  "button",
                  {
                    type: "button",
                    className: "text-sm font-semibold text-terra-600 hover:underline",
                    onClick: () => {
                      editingArticle = { ...art };
                      isNewArticle = false;
                      renderContent();
                    },
                  },
                  "Edit"
                ),
                el(
                  "button",
                  {
                    type: "button",
                    className: "text-sm font-semibold text-red-700 hover:underline",
                    onClick: async () => {
                      const ok = await confirmDialog({
                        title: "Hapus artikel",
                        message: `Yakin menghapus artikel "${art.title}"?`,
                        confirmLabel: "Ya, hapus",
                        danger: true,
                      });
                      if (!ok) return;
                      try {
                        await store.removeArticle(art.id);
                        showToast("Artikel dihapus.");
                        renderContent();
                      } catch (err) {
                        showToast(err.message || "Gagal menghapus artikel.");
                      }
                    },
                  },
                  "Hapus"
                )
              )
            )
          )
        )
      )
    );
  };

  const renderContent = () => {
    if (activeTab === "ringkasan") renderSummary();
    else if (activeTab === "produk") renderProducts();
    else if (activeTab === "pesanan") renderOrders();
    else if (activeTab === "ulasan") renderReviews();
    else if (activeTab === "batch") renderBatch();
    else renderJournal();
  };

  const unsub = store.subscribe((_s, reason) => {
    if (reason === "admin-orders" || reason === "beans" || reason === "articles" || reason === "batch" || reason === "reviews" || reason === "reset") {
      renderContent();
    }
  });

  renderTabs();
  renderContent();

  const element = el(
    "div",
    { className: "min-h-screen bg-cream-100/70" },
    el(
      "header",
      { className: "border-b border-espresso-100 bg-white" },
      el(
        "div",
        { className: "container-x flex h-16 items-center justify-between gap-6" },
        el(
          "div",
          { className: "flex items-center gap-3 shrink-0" },
          BrandWordmark({ light: false }),
          el("span", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, "Pengelola")
        ),
        el(
          "div",
          { className: "flex items-center gap-2 shrink-0" },
          routeLink("/", { className: "btn-ghost" }, "Lihat situs"),
          el(
            "button",
            {
              type: "button",
              className: "btn-primary",
              onClick: async () => {
                await store.logoutAdmin();
                navigate("/", { replace: true });
              },
            },
            "Keluar"
          )
        )
      )
    ),
    el("div", { className: "container-x py-8" }, tabsBar, contentArea)
  );

  return {
    element,
    cleanup: () => unsub(),
  };
}
