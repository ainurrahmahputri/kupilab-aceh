const WHATSAPP_NUMBER = "6281234567890";

export function rupiah(amount) {
  return "Rp " + Math.round(Number(amount) || 0).toLocaleString("id-ID");
}

export function beanPrice(bean, size) {
  return size === "500" ? bean.price500 : bean.price200;
}

export function formatWeight(grams) {
  const g = Number(grams) || 0;
  return g >= 1000 ? `${(g / 1000).toFixed(1).replace(".", ",")} kg` : `${g} g`;
}

export function formatLongDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function toIsoDate(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysUntil(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function batchCountdownLabel(dateStr) {
  const diff = daysUntil(dateStr);
  if (Number.isNaN(diff)) return "Belum dijadwalkan";
  if (diff === 0) return "Hari ini";
  if (diff > 0) return `${diff} hari lagi`;
  return "Sudah disangrai";
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

export function whatsappBeanUrl(bean) {
  const msg = `Halo KupiLab Aceh, saya mau tanya stok biji kopi "${bean.name}" (${bean.roast} roast). Apakah masih tersedia? Terima kasih.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function whatsappGeneralUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo KupiLab Aceh, saya ingin bertanya seputar biji kopi.")}`;
}

export function whatsappOrderUrl(order) {
  const shortId = String(order.id || "").slice(0, 8);
  const msg = `Halo KupiLab Aceh, saya ingin konfirmasi pembayaran pesanan #${shortId} sebesar ${rupiah(order.total)} (${order.payment}).`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function virtualAccountCode(orderId) {
  let hash = 0;
  for (const ch of String(orderId)) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 100000000;
  }
  return `8810${String(hash).padStart(8, "0")}`;
}
