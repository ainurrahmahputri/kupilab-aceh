import { el } from "../utils/dom.js";
import { navigate, routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { calcShipping, COURIERS, PAYMENT_GROUPS, PAYMENT_METHODS, SHIPPING_ZONES } from "../data/shipping.js";
import { beanPrice, formatShortDate, formatWeight, rupiah } from "../utils/format.js";
import { CheckCircleSvg, CourierIcon, PaymentIcon } from "../components/orderUi.js";
import { BagSvg } from "../components/media.js";

const QUICK_NOTES = [
  "Titip di pos satpam",
  "Sertakan kartu resep seduh",
  "Kemas ekstra aman",
];

export function CheckoutPage() {
  if (!store.customer) {
    queueMicrotask(() => navigate("/masuk", { replace: true }));
    return el("div");
  }

  const lines = store.cart
    .map((line) => {
      const bean = store.beans.find((b) => b.id === line.beanId);
      return bean ? { line, bean } : null;
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return el(
      "div",
      { className: "container-x page-in py-20 text-center" },
      el("h1", { className: "text-3xl" }, "Keranjang kosong"),
      routeLink("/toko", { className: "btn-primary mt-6" }, "Lihat toko")
    );
  }

  const subtotal = lines.reduce((sum, { line, bean }) => sum + beanPrice(bean, line.size) * line.qty, 0);
  const weight = lines.reduce((sum, { line }) => sum + Number(line.size) * line.qty, 0);
  const chargeableKg = Math.max(1, Math.ceil(weight / 1000));

  let zoneId = SHIPPING_ZONES[0].id;
  let courierId = COURIERS[0].id;
  let paymentId = PAYMENT_METHODS[0].id;

  const recipientInput = el("input", {
    id: "co-name",
    className: "input",
    type: "text",
    value: store.customer.name || "",
    required: true,
  });
  const phoneInput = el("input", {
    id: "co-phone",
    className: "input",
    type: "tel",
    value: store.customer.phone || "",
    required: true,
  });
  const addressInput = el("textarea", {
    id: "co-addr",
    rows: "3",
    className: "input",
    placeholder: "Nama jalan, nomor rumah, kecamatan, kota, kode pos",
    required: true,
  });
  const noteInput = el("input", {
    id: "co-note",
    className: "input",
    type: "text",
    placeholder: "Misal: titip di pos satpam atau minta kartu resep seduh",
  });

  const notePresetWrap = el("div", { className: "mt-2 flex flex-wrap gap-2" });
  const renderNotePresets = () => {
    const activeNotes = noteInput.value
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean);

    notePresetWrap.replaceChildren(
      ...QUICK_NOTES.map((preset) => {
        const active = activeNotes.includes(preset);
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `rounded-full border px-3 py-1 text-xs font-medium transition ${
              active
                ? "border-terra-600 bg-terra-600 text-cream-50"
                : "border-espresso-200 bg-cream-50 text-espresso-600 hover:border-espresso-400"
            }`,
            onClick: () => {
              const parts = noteInput.value
                .split("·")
                .map((s) => s.trim())
                .filter(Boolean);
              const idx = parts.indexOf(preset);
              if (idx >= 0) {
                parts.splice(idx, 1);
              } else {
                parts.push(preset);
              }
              noteInput.value = parts.join(" · ");
              renderNotePresets();
            },
          },
          active ? `${preset} ✓` : `+ ${preset}`
        );
      })
    );
  };
  noteInput.addEventListener("input", renderNotePresets);
  renderNotePresets();

  const zoneSelect = el(
    "select",
    {
      id: "co-zone",
      className: "input",
      onChange: (e) => {
        zoneId = e.target.value;
        if (zoneId !== "bna" && paymentId === "cod") {
          paymentId = PAYMENT_METHODS[0].id;
        }
        renderShippingAndPayment();
        renderTotals();
      },
    },
    ...SHIPPING_ZONES.map((z) => el("option", { value: z.id }, z.name))
  );
  zoneSelect.value = zoneId;

  const courierGrid = el("div", { className: "grid gap-3 sm:grid-cols-2" });
  const paymentGroupsWrap = el("div", { className: "space-y-4" });
  const errEl = el("p", { className: "alert-error hidden" });
  const submitBtn = el("button", { type: "submit", className: "btn-accent w-full" }, "Buat pesanan sekarang");

  const shippingCell = el("dd", { className: "tabular-nums" });
  const feeRow = el("div", { className: "hidden flex justify-between" });
  const feeVal = el("dd", { className: "tabular-nums" });
  feeRow.append(el("dt", { className: "text-espresso-500" }, "Biaya pembayaran"), feeVal);
  const totalCell = el("dd", { className: "font-display text-2xl tabular-nums text-espresso-800" });

  const renderTotals = () => {
    const shipping = calcShipping(zoneId, courierId, weight);
    const payMethod = PAYMENT_METHODS.find((p) => p.id === paymentId) || PAYMENT_METHODS[0];
    const fee = payMethod.fee;
    const total = subtotal + shipping + fee;

    shippingCell.textContent = shipping === 0 ? "Gratis" : rupiah(shipping);
    if (fee > 0) {
      feeRow.classList.remove("hidden");
      feeVal.textContent = rupiah(fee);
    } else {
      feeRow.classList.add("hidden");
    }
    totalCell.textContent = rupiah(total);
  };

  const renderShippingAndPayment = () => {
    courierGrid.replaceChildren(
      ...COURIERS.map((c) => {
        const cost = calcShipping(zoneId, c.id, weight);
        const active = courierId === c.id;
        return el(
          "button",
          {
            type: "button",
            "aria-pressed": String(active),
            className: `flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
              active
                ? "border-espresso-700 bg-espresso-700 text-cream-50 shadow-sm"
                : "border-espresso-200 bg-white hover:border-espresso-400"
            }`,
            onClick: () => {
              courierId = c.id;
              renderShippingAndPayment();
              renderTotals();
            },
          },
          el(
            "span",
            {
              className: `mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                active ? "bg-espresso-600 text-cream-50" : "bg-cream-100 text-espresso-700"
              }`,
            },
            CourierIcon({ id: c.id })
          ),
          el(
            "span",
            { className: "min-w-0 flex-1" },
            el(
              "span",
              { className: "flex items-center justify-between gap-2" },
              el("span", { className: "font-semibold" }, c.name),
              CheckCircleSvg({ active, className: "h-4 w-4 shrink-0" })
            ),
            el("span", { className: "mt-0.5 block text-xs opacity-75" }, `${c.service} · ${c.eta}`),
            el("span", { className: "mt-1.5 block text-sm font-semibold tabular-nums" }, cost === 0 ? "Gratis" : rupiah(cost))
          )
        );
      })
    );

    paymentGroupsWrap.replaceChildren(
      ...PAYMENT_GROUPS.map((group) =>
        el(
          "div",
          null,
          el("p", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-espresso-400" }, group),
          el(
            "div",
            { className: "space-y-2.5" },
            ...PAYMENT_METHODS.filter((m) => m.group === group).map((m) => {
              const disabled = m.id === "cod" && zoneId !== "bna";
              const active = paymentId === m.id;
              return el(
                "button",
                {
                  type: "button",
                  disabled,
                  "aria-pressed": String(active),
                  className: `flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    disabled
                      ? "cursor-not-allowed border-espresso-100 bg-cream-50/50 opacity-50"
                      : active
                      ? "border-espresso-700 bg-espresso-700 text-cream-50 shadow-sm"
                      : "border-espresso-200 bg-white hover:border-espresso-400"
                  }`,
                  onClick: () => {
                    if (disabled) return;
                    paymentId = m.id;
                    renderShippingAndPayment();
                    renderTotals();
                  },
                },
                el(
                  "span",
                  {
                    className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      active ? "bg-espresso-600 text-cream-50" : "bg-cream-100 text-espresso-700"
                    }`,
                  },
                  PaymentIcon({ id: m.id })
                ),
                el(
                  "span",
                  { className: "min-w-0 flex-1" },
                  el("span", { className: "block font-semibold" }, m.name),
                  el("span", { className: "block text-xs opacity-75" }, m.hint)
                ),
                m.fee > 0
                  ? el("span", { className: "shrink-0 text-xs font-semibold tabular-nums" }, `+${rupiah(m.fee)}`)
                  : null,
                CheckCircleSvg({ active, className: "h-4 w-4 shrink-0" })
              );
            })
          )
        )
      )
    );
  };

  renderShippingAndPayment();
  renderTotals();

  const stepBar = el(
    "ol",
    { className: "mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-espresso-100 bg-cream-100/70 p-2 text-xs", "aria-label": "Tahap pemesanan" },
    ...[
      { num: "1", label: "Keranjang", state: "done" },
      { num: "2", label: "Pengiriman & bayar", state: "active" },
      { num: "3", label: "Konfirmasi & lacak", state: "next" },
    ].map((step) =>
      el(
        "li",
        {
          className: `flex items-center justify-center gap-2 rounded-xl px-3 py-2 font-semibold ${
            step.state === "active"
              ? "bg-white text-espresso-800 shadow-xs"
              : step.state === "done"
              ? "text-terra-700"
              : "text-espresso-400"
          }`,
        },
        el(
          "span",
          {
            className: `flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] tabular-nums ${
              step.state === "active"
                ? "bg-espresso-700 text-cream-50"
                : step.state === "done"
                ? "bg-terra-600 text-cream-50"
                : "bg-espresso-100 text-espresso-500"
            }`,
          },
          step.state === "done" ? "✓" : step.num
        ),
        el("span", { className: "truncate" }, step.label)
      )
    )
  );

  const form = el(
    "form",
    {
      className: "mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]",
      onSubmit: async (e) => {
        e.preventDefault();
        errEl.classList.add("hidden");
        const customerName = recipientInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();
        const note = noteInput.value.trim();

        if (!customerName || !phone || !address) {
          errEl.textContent = "Nama penerima, nomor HP, dan alamat wajib diisi.";
          errEl.classList.remove("hidden");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Memproses pesanan…";
        try {
          const order = await store.createOrder({
            customer: customerName,
            phone,
            address,
            note,
            zoneId,
            courierId,
            paymentId,
            items: lines.map(({ line }) => ({
              beanId: line.beanId,
              size: line.size,
              grind: line.grind,
              qty: line.qty,
            })),
          });
          navigate(`/pesanan/${order.id}`, { replace: true });
        } catch (err) {
          errEl.textContent = err.message || "Gagal membuat pesanan.";
          errEl.classList.remove("hidden");
          submitBtn.disabled = false;
          submitBtn.textContent = "Buat pesanan sekarang";
        }
      },
    },
    el(
      "div",
      { className: "space-y-8" },
      errEl,
      el(
        "section",
        { className: "card space-y-4 p-6" },
        el("h2", { className: "text-xl" }, "1. Alamat pengiriman"),
        el(
          "div",
          { className: "grid gap-4 sm:grid-cols-2" },
          el("div", null, el("label", { className: "label", htmlFor: "co-name" }, "Nama penerima"), recipientInput),
          el("div", null, el("label", { className: "label", htmlFor: "co-phone" }, "Nomor WhatsApp"), phoneInput)
        ),
        el("div", null, el("label", { className: "label", htmlFor: "co-addr" }, "Alamat lengkap"), addressInput),
        el(
          "div",
          null,
          el("label", { className: "label", htmlFor: "co-note" }, "Catatan untuk roastery"),
          noteInput,
          notePresetWrap
        )
      ),
      el(
        "section",
        { className: "card space-y-4 p-6" },
        el(
          "div",
          { className: "flex flex-wrap items-baseline justify-between gap-2" },
          el("h2", { className: "text-xl" }, "2. Pengiriman"),
          el("span", { className: "text-xs tabular-nums text-espresso-400" }, `${formatWeight(weight)} · tarif ${chargeableKg} kg`)
        ),
        el("div", null, el("label", { className: "label", htmlFor: "co-zone" }, "Wilayah tujuan"), zoneSelect),
        el("div", null, el("span", { className: "label" }, "Pilih layanan kurir"), courierGrid)
      ),
      el("section", { className: "card space-y-4 p-6" }, el("h2", { className: "text-xl" }, "3. Metode pembayaran"), paymentGroupsWrap)
    ),
    el(
      "aside",
      { className: "space-y-4 lg:sticky lg:top-24 lg:self-start" },
      el(
        "div",
        { className: "card space-y-4 p-6" },
        el("h2", { className: "text-xl" }, "Ringkasan pesanan"),
        el(
          "ul",
          { className: "divide-y divide-espresso-100 text-sm" },
          ...lines.map(({ line, bean }) => {
            const tone = bean.roast === "Dark" ? "dark" : bean.roast === "Light" ? "olive" : "light";
            return el(
              "li",
              { className: "flex items-center gap-3 py-2.5" },
              el(
                "div",
                { className: "h-12 w-9 shrink-0 rounded-lg bg-cream-100 p-1" },
                BagSvg({ tone, title: bean.name, subtitle: `${line.size} g`, className: "h-full w-full" })
              ),
              el(
                "span",
                { className: "min-w-0 flex-1" },
                el("span", { className: "block truncate font-semibold text-espresso-700" }, bean.name),
                el("span", { className: "block text-xs text-espresso-400 tabular-nums" }, `${line.size} g · ${line.grind} · ${line.qty}x`)
              ),
              el("span", { className: "shrink-0 font-semibold tabular-nums" }, rupiah(beanPrice(bean, line.size) * line.qty))
            );
          })
        ),
        el(
          "div",
          { className: "rounded-2xl bg-cream-100/75 p-3.5 text-xs leading-relaxed text-espresso-600" },
          el("p", { className: "font-semibold text-espresso-700" }, "Jaminan sangrai segar KupiLab"),
          el(
            "p",
            { className: "mt-0.5" },
            store.batch?.date
              ? `Pesanan disiapkan dari batch ${formatShortDate(store.batch.date)} dengan katup satu arah.`
              : "Dikemas dalam pouch katup satu arah segera setelah disangrai."
          )
        ),
        el(
          "dl",
          { className: "space-y-2 border-t border-espresso-100 pt-4 text-sm" },
          el("div", { className: "flex justify-between" }, el("dt", { className: "text-espresso-500" }, "Subtotal"), el("dd", { className: "tabular-nums" }, rupiah(subtotal))),
          el("div", { className: "flex justify-between" }, el("dt", { className: "text-espresso-500" }, `Ongkir (${formatWeight(weight)})`), shippingCell),
          feeRow,
          el(
            "div",
            { className: "flex justify-between border-t border-espresso-100 pt-3 text-base font-semibold" },
            el("dt", null, "Total"),
            totalCell
          )
        ),
        submitBtn
      )
    )
  );

  return el(
    "div",
    { className: "page-in container-x py-12" },
    routeLink("/keranjang", { className: "text-sm font-semibold text-terra-600 hover:underline" }, "← Kembali ke keranjang"),
    el("h1", { className: "mt-3 text-3xl sm:text-4xl" }, "Checkout"),
    stepBar,
    form
  );
}
