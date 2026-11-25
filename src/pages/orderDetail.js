import { el } from "../utils/dom.js";
import { navigate, routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { ORDER_PROGRESS_STEPS } from "../data/constants.js";
import { formatLongDate, formatWeight, rupiah, virtualAccountCode, whatsappOrderUrl } from "../utils/format.js";
import { confirmDialog, showToast } from "../components/modal.js";
import { OrderStepIcon } from "../components/orderUi.js";

const STATUS_DESCRIPTIONS = {
  "Menunggu pembayaran": "Selesaikan pembayaran sesuai instruksi di bawah agar biji pilihanmu segera masuk antrean sangrai atau kemas.",
  Dibayar: "Konfirmasi pembayaran sudah kami terima dan sedang dicek tim KupiLab Aceh.",
  Diproses: "Pesanan sedang disiapkan, digiling sesuai permintaan, dan dikemas dalam pouch katup satu arah.",
  Dikirim: "Paket sudah diserahkan ke kurir. Gunakan nomor resi di bawah untuk melacak perjalanan paketmu.",
  Selesai: "Pesanan sudah tiba. Selamat menyeduh, dan jangan ragu bagikan ulasan rasa di halaman produk.",
};

function copyText(text, btn, defaultLabel) {
  const finish = () => {
    btn.textContent = "Tersalin ✓";
    showToast("Berhasil disalin ke clipboard.");
    setTimeout(() => {
      btn.textContent = defaultLabel;
    }, 1800);
  };
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    navigator.clipboard.writeText(text).then(finish).catch(() => showToast("Salin manual kode di layar."));
  } else {
    showToast("Salin manual kode di layar.");
  }
}

export function OrderDetailPage({ id }) {
  if (!store.customer) {
    queueMicrotask(() => navigate("/masuk", { replace: true }));
    return el("div");
  }

  const container = el("div", { className: "page-in container-x max-w-3xl py-12" });

  const renderOrder = () => {
    const order = store.customerOrders.find((o) => o.id === id);
    if (!order) {
      container.replaceChildren(
        el(
          "div",
          { className: "py-10 text-center" },
          el("h1", { className: "text-3xl" }, "Pesanan tidak ditemukan"),
          routeLink("/akun", { className: "btn-primary mt-6" }, "Kembali ke akun")
        )
      );
      return;
    }

    const cancelled = order.status === "Batal";
    const stepIndex = ORDER_PROGRESS_STEPS.indexOf(order.status);

    const progressSection = cancelled
      ? el("div", { className: "mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" }, "Pesanan ini dibatalkan.")
      : el(
          "section",
          { className: "card mt-8 p-5 sm:p-6" },
          el(
            "ol",
            { className: "grid grid-cols-5 gap-2", "aria-label": "Status pesanan" },
            ...ORDER_PROGRESS_STEPS.map((step, idx) => {
              const done = idx <= stepIndex;
              const current = idx === stepIndex;
              return el(
                "li",
                { className: "flex flex-col items-center text-center" },
                el(
                  "div",
                  {
                    className: `flex h-9 w-9 items-center justify-center rounded-full border transition ${
                      current
                        ? "border-terra-600 bg-terra-600 text-cream-50 ring-4 ring-terra-100"
                        : done
                        ? "border-espresso-700 bg-espresso-700 text-cream-50"
                        : "border-espresso-200 bg-cream-50 text-espresso-300"
                    }`,
                  },
                  OrderStepIcon({ step, className: "h-4 w-4" })
                ),
                el("div", { className: `mt-2.5 h-1.5 w-full rounded-full ${done ? "bg-terra-600" : "bg-espresso-100"}` }),
                el(
                  "span",
                  { className: `mt-2 block text-[11px] font-semibold leading-tight ${done ? "text-espresso-700" : "text-espresso-300"}` },
                  step
                )
              );
            })
          ),
          STATUS_DESCRIPTIONS[order.status]
            ? el("p", { className: "mt-4 border-t border-espresso-100 pt-3.5 text-xs leading-relaxed text-espresso-500" }, STATUS_DESCRIPTIONS[order.status])
            : null
        );

    const vaCode = order.payment.includes("Virtual Account") ? virtualAccountCode(order.id) : null;
    const vaCopyBtn = vaCode
      ? el(
          "button",
          {
            type: "button",
            className: "shrink-0 rounded-full border border-espresso-200 bg-cream-50 px-3.5 py-1.5 text-xs font-semibold text-espresso-700 transition hover:border-espresso-700",
            onClick: (e) => copyText(vaCode, e.currentTarget, "Salin kode"),
          },
          "Salin kode"
        )
      : null;

    const paymentGuide = vaCode
      ? "Buka aplikasi m-banking atau ATM, pilih menu Virtual Account, lalu masukkan kode bayar di atas."
      : order.payment.includes("Transfer manual")
      ? "Transfer sesuai nominal total ke rekening roastery, lalu kirim bukti lewat tombol konfirmasi WhatsApp."
      : order.payment.includes("E-wallet")
      ? "Selesaikan pembayaran lewat aplikasi dompet digital sesuai total tagihan, lalu tekan 'Saya sudah bayar'."
      : "Siapkan uang pas saat kurir kami tiba di alamatmu di Banda Aceh / Aceh Besar.";

    const paymentSection =
      order.status === "Menunggu pembayaran"
        ? el(
            "section",
            { className: "mt-8 rounded-[2rem] border border-espresso-200 bg-cream-100/70 p-6 sm:p-8" },
            el("h2", { className: "text-xl" }, "Menunggu pembayaran"),
            el("p", { className: "mt-2 text-sm text-espresso-600" }, `Metode: ${order.payment}`),
            vaCode
              ? el(
                  "div",
                  { className: "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5" },
                  el(
                    "div",
                    null,
                    el("p", { className: "text-xs font-semibold uppercase tracking-wide text-espresso-400" }, "Kode bayar Virtual Account"),
                    el("p", { className: "mt-1 font-mono text-2xl tracking-wider text-espresso-700 tabular-nums" }, vaCode)
                  ),
                  vaCopyBtn
                )
              : null,
            el(
              "div",
              { className: "mt-4 flex items-baseline justify-between rounded-2xl bg-white p-5" },
              el("span", { className: "text-sm text-espresso-500" }, "Jumlah yang dibayar"),
              el("span", { className: "font-display text-2xl tabular-nums text-espresso-700" }, rupiah(order.total))
            ),
            el(
              "div",
              { className: "mt-4 rounded-2xl border border-espresso-100 bg-white/70 p-4 text-xs leading-relaxed text-espresso-600" },
              el("p", { className: "font-semibold text-espresso-700" }, "Panduan singkat"),
              el("p", { className: "mt-1" }, paymentGuide)
            ),
            el(
              "div",
              { className: "mt-5 flex flex-wrap gap-3" },
              el(
                "button",
                {
                  type: "button",
                  className: "btn-accent",
                  onClick: async (e) => {
                    const btn = e.currentTarget;
                    btn.disabled = true;
                    try {
                      await store.markOrderPaid(order.id);
                      showToast("Konfirmasi pembayaran dikirim ke roastery.");
                      renderOrder();
                    } catch (err) {
                      showToast(err.message || "Gagal memperbarui status pembayaran.");
                      btn.disabled = false;
                    }
                  },
                },
                "Saya sudah bayar"
              ),
              el(
                "a",
                {
                  href: whatsappOrderUrl(order),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "btn-ghost",
                },
                "Konfirmasi lewat WhatsApp"
              ),
              el(
                "button",
                {
                  type: "button",
                  className: "btn-danger",
                  onClick: async () => {
                    const ok = await confirmDialog({
                      title: "Batalkan pesanan",
                      message: "Yakin ingin membatalkan pesanan ini?",
                      confirmLabel: "Ya, batalkan",
                      danger: true,
                    });
                    if (!ok) return;
                    try {
                      await store.cancelCustomerOrder(order.id);
                      showToast("Pesanan berhasil dibatalkan.");
                      renderOrder();
                    } catch (err) {
                      showToast(err.message || "Gagal membatalkan pesanan.");
                    }
                  },
                },
                "Batalkan pesanan"
              )
            ),
            el(
              "p",
              { className: "mt-4 text-xs leading-relaxed text-espresso-400" },
              "Menekan 'Saya sudah bayar' akan menandai pesanan sebagai dibayar untuk dicek tim roastery kami."
            )
          )
        : null;

    const trackingSection = order.tracking
      ? el(
          "section",
          { className: "mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-cream-100/70 p-6" },
          el(
            "div",
            null,
            el("h2", { className: "text-xl" }, "Nomor resi"),
            el("p", { className: "mt-2 font-mono text-2xl tracking-wide text-espresso-700" }, order.tracking),
            el("p", { className: "mt-1 text-sm text-espresso-500" }, order.courier)
          ),
          el(
            "button",
            {
              type: "button",
              className: "btn-ghost text-xs",
              onClick: (e) => copyText(order.tracking, e.currentTarget, "Salin resi"),
            },
            "Salin resi"
          )
        )
      : null;

    container.replaceChildren(
      routeLink("/akun", { className: "text-sm font-semibold text-terra-600 hover:underline" }, "← Kembali ke akun"),
      el(
        "div",
        { className: "mt-4 flex flex-wrap items-baseline justify-between gap-4" },
        el(
          "div",
          null,
          el("p", { className: "eyebrow" }, "Pesanan"),
          el("h1", { className: "mt-1 text-3xl tabular-nums" }, `#${order.id.slice(0, 8)}`)
        ),
        el("p", { className: "text-sm text-espresso-400" }, formatLongDate(order.createdAt))
      ),
      progressSection,
      paymentSection,
      trackingSection,
      el(
        "section",
        { className: "mt-8" },
        el("h2", { className: "text-xl" }, "Rincian pesanan"),
        el(
          "ul",
          { className: "mt-4 divide-y divide-espresso-100" },
          ...order.items.map((item) =>
            el(
              "li",
              { className: "flex justify-between gap-4 py-3 text-sm" },
              el(
                "span",
                null,
                el("span", { className: "block font-semibold text-espresso-700" }, item.name),
                el("span", { className: "block text-xs text-espresso-400" }, `${item.size} g · ${item.roast} roast · ${item.grind} · ${item.qty}x`)
              ),
              el("span", { className: "whitespace-nowrap font-semibold tabular-nums" }, rupiah(item.price * item.qty))
            )
          )
        ),
        el(
          "dl",
          { className: "mt-4 space-y-2 border-t border-espresso-100 pt-4 text-sm" },
          el("div", { className: "flex justify-between" }, el("dt", { className: "text-espresso-500" }, "Subtotal"), el("dd", { className: "tabular-nums" }, rupiah(order.subtotal))),
          el("div", { className: "flex justify-between" }, el("dt", { className: "text-espresso-500" }, `Ongkir (${formatWeight(order.weight)})`), el("dd", { className: "tabular-nums" }, order.shipping === 0 ? "Gratis" : rupiah(order.shipping))),
          order.fee > 0
            ? el("div", { className: "flex justify-between" }, el("dt", { className: "text-espresso-500" }, "Biaya pembayaran"), el("dd", { className: "tabular-nums" }, rupiah(order.fee)))
            : null,
          el("div", { className: "flex justify-between border-t border-espresso-100 pt-2 text-base font-semibold" }, el("dt", null, "Total"), el("dd", { className: "tabular-nums" }, rupiah(order.total)))
        )
      ),
      el(
        "section",
        { className: "mt-8 border-t border-espresso-100 pt-6 text-sm" },
        el("h2", { className: "text-xl" }, "Pengiriman"),
        el("p", { className: "mt-2 font-semibold text-espresso-700" }, `${order.customer} · ${order.phone}`),
        el("p", { className: "text-espresso-500" }, order.address),
        el("p", { className: "mt-1 text-espresso-400" }, `${order.zone} · ${order.courier} · Perkiraan ${order.eta}`),
        order.note ? el("p", { className: "mt-2 text-espresso-500" }, `Catatan: ${order.note}`) : null
      )
    );
  };

  if (store.customerOrders.length > 0) {
    renderOrder();
  } else {
    container.replaceChildren(el("p", { className: "text-sm text-espresso-400" }, "Memuat rincian pesanan…"));
    store.loadCustomerOrders().then(renderOrder).catch(() => renderOrder());
  }

  return container;
}
