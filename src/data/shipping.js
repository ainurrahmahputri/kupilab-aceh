export const SHIPPING_ZONES = [
  { id: "bna", name: "Banda Aceh & Aceh Besar", base: 9000, perKg: 4000 },
  { id: "aceh", name: "Aceh (luar Banda Aceh)", base: 15000, perKg: 7000 },
  { id: "sumatera", name: "Sumatera", base: 22000, perKg: 10000 },
  { id: "jawa", name: "Jawa & Bali", base: 30000, perKg: 13000 },
  { id: "lainnya", name: "Kalimantan, Sulawesi, dan lainnya", base: 42000, perKg: 18000 },
];

export const COURIERS = [
  { id: "reg", name: "Kurir Reguler", service: "Reguler", eta: "3 - 5 hari", factor: 1 },
  { id: "cepat", name: "Kurir Cepat", service: "Express", eta: "1 - 2 hari", factor: 1.6 },
  { id: "hemat", name: "Kurir Hemat", service: "Kargo", eta: "5 - 8 hari", factor: 0.75 },
  { id: "ambil", name: "Ambil di tempat", service: "Ruang Seduh Banda Aceh", eta: "Siap 1 hari", factor: 0 },
];

export const PAYMENT_METHODS = [
  { id: "va-bsi", group: "Transfer bank", name: "BSI Virtual Account", hint: "Kode bayar muncul setelah pesanan dibuat", fee: 2500 },
  { id: "va-bri", group: "Transfer bank", name: "BRI Virtual Account", hint: "Kode bayar muncul setelah pesanan dibuat", fee: 2500 },
  { id: "transfer", group: "Transfer bank", name: "Transfer manual", hint: "Unggah bukti lewat WhatsApp setelah bayar", fee: 0 },
  { id: "ewallet", group: "E-wallet", name: "E-wallet", hint: "Bayar lewat aplikasi dompet digital", fee: 1500 },
  { id: "cod", group: "Bayar di tempat", name: "COD (bayar saat barang sampai)", hint: "Hanya untuk Banda Aceh & Aceh Besar", fee: 5000 },
];

export const PAYMENT_GROUPS = ["Transfer bank", "E-wallet", "Bayar di tempat"];

export function calcShipping(zoneId, courierId, weightGrams) {
  const zone = SHIPPING_ZONES.find((z) => z.id === zoneId);
  const courier = COURIERS.find((c) => c.id === courierId);
  if (!zone || !courier || courier.factor === 0) return 0;
  const kg = Math.max(1, Math.ceil(weightGrams / 1000));
  const raw = (zone.base + (kg - 1) * zone.perKg) * courier.factor;
  return Math.round(raw / 500) * 500;
}
