import { el } from "../utils/dom.js";
import { navigate, routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { formatShortDate, rupiah } from "../utils/format.js";

function statusColorClass(status) {
  if (status === "Batal") return "text-red-700";
  if (status === "Selesai") return "text-terra-700";
  if (status === "Dikirim") return "text-espresso-700";
  return "text-amber-700";
}

export function AccountPage() {
  if (!store.customer) {
    queueMicrotask(() => navigate("/masuk", { replace: true }));
    return el("div");
  }

  const ordersWrap = el("div", { className: "mt-10" });

  const renderOrders = () => {
    const orders = store.customerOrders;
    if (orders.length === 0) {
      ordersWrap.replaceChildren(
        el("h2", { className: "text-2xl" }, "Riwayat pesanan"),
        el(
          "div",
          { className: "card mt-4 p-8 text-center" },
          el("p", { className: "text-espresso-500" }, "Belum ada pesanan atas akun ini."),
          routeLink("/toko", { className: "btn-primary mt-5" }, "Belanja biji kopi")
        )
      );
      return;
    }

    ordersWrap.replaceChildren(
      el("h2", { className: "text-2xl" }, "Riwayat pesanan"),
      el(
        "div",
        { className: "mt-4 space-y-4" },
        ...orders.map((order) =>
          routeLink(
            `/pesanan/${order.id}`,
            { className: "card lift flex flex-wrap items-center justify-between gap-4 p-5" },
            el(
              "div",
              null,
              el("p", { className: "font-display text-lg tabular-nums text-espresso-700" }, `#${order.id.slice(0, 8)}`),
              el("p", { className: "text-xs text-espresso-400" }, `${formatShortDate(order.createdAt)} · ${order.courier}`),
              el(
                "p",
                { className: "mt-1 text-sm text-espresso-500" },
                order.items.map((i) => `${i.name} (${i.qty}x)`).join(", ")
              )
            ),
            el(
              "div",
              { className: "text-right" },
              el("p", { className: `text-xs font-semibold ${statusColorClass(order.status)}` }, order.status),
              el("p", { className: "mt-1 font-semibold tabular-nums text-espresso-700" }, rupiah(order.total))
            )
          )
        )
      )
    );
  };

  ordersWrap.replaceChildren(
    el("h2", { className: "text-2xl" }, "Riwayat pesanan"),
    el("p", { className: "mt-3 text-sm text-espresso-400" }, "Memuat daftar pesanan…")
  );
  store.loadCustomerOrders().then(renderOrders).catch(() => renderOrders());

  return el(
    "div",
    { className: "page-in container-x max-w-4xl py-12" },
    el(
      "div",
      { className: "flex flex-wrap items-start justify-between gap-4" },
      el(
        "div",
        null,
        el("p", { className: "eyebrow" }, "Akun pembeli"),
        el("h1", { className: "mt-2 text-3xl sm:text-4xl" }, store.customer.name),
        el("p", { className: "mt-1 text-sm text-espresso-400" }, `${store.customer.email} · ${store.customer.phone}`)
      ),
      el(
        "button",
        {
          type: "button",
          className: "btn-ghost",
          onClick: async () => {
            await store.logoutCustomer();
            navigate("/", { replace: true });
          },
        },
        "Keluar"
      )
    ),
    ordersWrap
  );
}
