export interface Bean {
  id: string;
  name: string;
  category: string;
  region: string;
  origin: string;
  altitude: number;
  process: string;
  flavors: string[];
  roast: "Light" | "Medium" | "Dark";
  notes: string;
  brew: string[];
  stock: "Tersedia" | "Stok Terbatas" | "Habis";
  description: string;
  price200: number;
  price500: number;
  image?: string;
}

export interface Review {
  id: string;
  beanId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  demo?: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMinutes: number;
  body: string;
}

export interface RoastBatch {
  date: string;
  roaster: string;
  note: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

export interface OrderItem {
  beanId: string;
  name: string;
  size: "200" | "500";
  grind: string;
  roast: string;
  qty: number;
  price: number;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  paidAt?: string;
  customerId: string;
  customer: string;
  phone: string;
  address: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  fee: number;
  total: number;
  weight: number;
  zone: string;
  courier: string;
  eta: string;
  payment: string;
  status: string;
  tracking?: string;
}

export interface DbState {
  beans: Bean[];
  articles: Article[];
  batch: RoastBatch;
  reviews: Review[];
  orders: OrderRecord[];
  customers: CustomerRecord[];
  adminPassHash: string | null;
}

export const SHIPPING_ZONES = [
  { id: "bna", name: "Banda Aceh & Aceh Besar", base: 9000, perKg: 4000 },
  { id: "aceh", name: "Aceh (luar Banda Aceh)", base: 15000, perKg: 7000 },
  { id: "sumatera", name: "Sumatera", base: 22000, perKg: 10000 },
  { id: "jawa", name: "Jawa & Bali", base: 30000, perKg: 13000 },
  { id: "lainnya", name: "Kalimantan, Sulawesi, dan lainnya", base: 42000, perKg: 18000 },
] as const;

export const COURIERS = [
  { id: "reg", name: "Kurir Reguler", service: "Reguler", eta: "3 - 5 hari", factor: 1 },
  { id: "cepat", name: "Kurir Cepat", service: "Express", eta: "1 - 2 hari", factor: 1.6 },
  { id: "hemat", name: "Kurir Hemat", service: "Kargo", eta: "5 - 8 hari", factor: 0.75 },
  { id: "ambil", name: "Ambil di tempat", service: "Ruang Seduh Banda Aceh", eta: "Siap 1 hari", factor: 0 },
] as const;

export const PAYMENT_METHODS = [
  { id: "va-bsi", group: "Transfer bank", name: "BSI Virtual Account", hint: "Kode bayar muncul setelah pesanan dibuat", fee: 2500 },
  { id: "va-bri", group: "Transfer bank", name: "BRI Virtual Account", hint: "Kode bayar muncul setelah pesanan dibuat", fee: 2500 },
  { id: "transfer", group: "Transfer bank", name: "Transfer manual", hint: "Unggah bukti lewat WhatsApp setelah bayar", fee: 0 },
  { id: "ewallet", group: "E-wallet", name: "E-wallet", hint: "Bayar lewat aplikasi dompet digital", fee: 1500 },
  { id: "cod", group: "Bayar di tempat", name: "COD (bayar saat barang sampai)", hint: "Hanya untuk Banda Aceh & Aceh Besar", fee: 5000 },
] as const;

export const ORDER_STATUSES = [
  "Menunggu pembayaran",
  "Dibayar",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Batal",
] as const;

function toDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function calcShipping(zoneId: string, courierId: string, weightGrams: number): number {
  const zone = SHIPPING_ZONES.find((z) => z.id === zoneId);
  const courier = COURIERS.find((c) => c.id === courierId);
  if (!zone || !courier || courier.factor === 0) return 0;
  const kg = Math.max(1, Math.ceil(weightGrams / 1000));
  const raw = (zone.base + (kg - 1) * zone.perKg) * courier.factor;
  return Math.round(raw / 500) * 500;
}

const RAW_BEANS: Array<Omit<Bean, "origin" | "price200" | "price500">> = [
  {
    id: "b01",
    name: "Gayo Anaerob 72 Jam",
    category: "Single Origin Arabika",
    region: "Takengon, Aceh Tengah",
    altitude: 1500,
    process: "Fermentasi anaerob 72 jam dalam wadah tertutup, dijemur perlahan",
    flavors: ["Fruity", "Floral"],
    roast: "Light",
    notes: "Blackcurrant, buah beri matang, madu bunga, aftertaste manis seperti sirup.",
    brew: ["V60 Pour Over", "Cold Brew"],
    stock: "Tersedia",
    description:
      "Biji pilihan dari kebun dataran tinggi Takengon yang difermentasi tertutup agar gula alami buah kopi meresap. Karakternya ekspresif, cocok untuk kamu yang ingin pengalaman rasa berbeda dari kopi harian.",
  },
  {
    id: "b02",
    name: "Gayo Natural",
    category: "Single Origin Arabika",
    region: "Pegasing, Aceh Tengah",
    altitude: 1450,
    process: "Natural, dijemur utuh bersama kulit buah 21 hari",
    flavors: ["Fruity", "Chocolatey"],
    roast: "Light",
    notes: "Stroberi, mangga matang, cokelat susu, tekstur body medium.",
    brew: ["V60 Pour Over", "AeroPress"],
    stock: "Tersedia",
    description:
      "Proses natural memberi manis buah yang jelas dengan keasaman lembut. Pilihan favorit untuk belajar menyeduh V60 karena rasanya mudah dibaca.",
  },
  {
    id: "b03",
    name: "Gayo Honey",
    category: "Single Origin Arabika",
    region: "Ketol, Aceh Tengah",
    altitude: 1400,
    process: "Honey, sebagian lendir buah dipertahankan saat penjemuran",
    flavors: ["Chocolatey", "Fruity"],
    roast: "Medium",
    notes: "Karamel, apel merah, cokelat, manis bersih dan seimbang.",
    brew: ["V60 Pour Over", "French Press"],
    stock: "Tersedia",
    description:
      "Jalan tengah antara washed yang bersih dan natural yang fruity. Manis, seimbang, dan ramah untuk lidah yang baru mengenal kopi spesialti.",
  },
  {
    id: "b04",
    name: "Peaberry Takengon",
    category: "Single Origin Arabika",
    region: "Takengon, Aceh Tengah",
    altitude: 1550,
    process: "Full washed, biji peaberry dipilah manual",
    flavors: ["Floral", "Nutty"],
    roast: "Medium",
    notes: "Bunga melati, almond, teh hitam, aftertaste bersih.",
    brew: ["V60 Pour Over", "AeroPress"],
    stock: "Stok Terbatas",
    description:
      "Peaberry adalah biji tunggal bulat hasil mutasi alami, jumlahnya hanya sekitar 5% dari panen. Dipilah satu per satu sehingga stoknya selalu terbatas.",
  },
  {
    id: "b05",
    name: "Arabika Bener Meriah",
    category: "Single Origin Arabika",
    region: "Bener Meriah",
    altitude: 1350,
    process: "Giling basah (semi-washed) khas Gayo",
    flavors: ["Chocolatey", "Spicy"],
    roast: "Medium",
    notes: "Cokelat hitam, kayu manis, tembakau manis, body tebal dengan acidity rendah.",
    brew: ["French Press", "Kopi Sanger"],
    stock: "Tersedia",
    description:
      "Karakter klasik Gayo giling basah: body tebal, earthy, dan manis rempah. Enak diminum hitam maupun dengan susu.",
  },
  {
    id: "b06",
    name: "Robusta Ulee Kareng Klasik",
    category: "Robusta Ulee Kareng",
    region: "Sangrai tradisi Ulee Kareng, Banda Aceh",
    altitude: 600,
    process: "Natural, sangrai gelap ala kopi Ulee Kareng",
    flavors: ["Spicy", "Chocolatey"],
    roast: "Dark",
    notes: "Cokelat pahit, rempah, kacang panggang, body berat dan crema tebal.",
    brew: ["Kopi Sanger", "Kopi Tarik"],
    stock: "Tersedia",
    description:
      "Robusta bertubuh kuat dengan sangrai gelap yang menjadi ciri kopi warung Aceh. Dasar yang pas untuk sanger dan kopi tarik.",
  },
  {
    id: "b07",
    name: "Robusta Ulee Kareng Halus Saring",
    category: "Robusta Ulee Kareng",
    region: "Sangrai tradisi Ulee Kareng, Banda Aceh",
    altitude: 550,
    process: "Natural, digiling halus untuk saringan kain",
    flavors: ["Nutty", "Spicy"],
    roast: "Dark",
    notes: "Kacang panggang, gula merah, rempah hangat, pahit yang bersih.",
    brew: ["Kopi Sanger", "Saringan Kain"],
    stock: "Stok Terbatas",
    description:
      "Digiling khusus untuk saringan kain (kopi tarik tradisional) sehingga ekstraksinya pekat tanpa terasa gosong.",
  },
  {
    id: "b08",
    name: "Robusta Pidie Natural",
    category: "Robusta Ulee Kareng",
    region: "Pidie",
    altitude: 500,
    process: "Natural, dijemur di atas para-para",
    flavors: ["Chocolatey", "Nutty"],
    roast: "Medium",
    notes: "Cokelat susu, hazelnut, karamel gosong, pahit lembut.",
    brew: ["Kopi Sanger", "French Press"],
    stock: "Tersedia",
    description:
      "Robusta dataran rendah Pidie yang disangrai medium agar pahitnya halus. Alternatif lembut untuk penikmat robusta pemula.",
  },
  {
    id: "b09",
    name: "House Blend Meuligoe",
    category: "House Blend",
    region: "Blend Gayo dan robusta Aceh (70:30)",
    altitude: 1000,
    process: "Campuran giling basah dan natural",
    flavors: ["Chocolatey", "Nutty"],
    roast: "Medium",
    notes: "Cokelat gelap, kacang almond, karamel, body penuh.",
    brew: ["Kopi Sanger", "French Press"],
    stock: "Tersedia",
    description:
      "Racikan andalan ruang seduh KupiLab. Arabika Gayo memberi aroma, robusta memberi body, hasilnya serasi untuk diminum setiap hari.",
  },
  {
    id: "b10",
    name: "House Blend Pagi Serambi",
    category: "House Blend",
    region: "Blend Gayo honey dan natural",
    altitude: 1400,
    process: "Campuran honey dan natural",
    flavors: ["Fruity", "Chocolatey"],
    roast: "Light",
    notes: "Jeruk manis, cokelat susu, madu, ringan dan segar.",
    brew: ["V60 Pour Over", "Cold Brew"],
    stock: "Tersedia",
    description:
      "Blend ringan dan segar untuk teman pagi. Manisnya ramah sehingga nyaman diminum tanpa gula.",
  },
  {
    id: "b11",
    name: "House Blend Sanger Signature",
    category: "House Blend",
    region: "Blend Gayo dan robusta Aceh (50:50)",
    altitude: 900,
    process: "Campuran giling basah dan natural, sangrai gelap",
    flavors: ["Spicy", "Chocolatey"],
    roast: "Dark",
    notes: "Cokelat pahit, rempah, gula aren, tahan ditemani susu kental manis.",
    brew: ["Kopi Sanger", "Kopi Tarik"],
    stock: "Habis",
    description:
      "Racikan khusus untuk sanger: kuat menembus susu, tetap punya aroma. Sedang dalam antrean sangrai berikutnya.",
  },
  {
    id: "b12",
    name: "Gayo Giling Basah Dark",
    category: "Single Origin Arabika",
    region: "Bener Meriah",
    altitude: 1300,
    process: "Giling basah, sangrai gelap",
    flavors: ["Spicy", "Nutty"],
    roast: "Dark",
    notes: "Cengkeh, cokelat pekat, kacang panggang, body berat.",
    brew: ["French Press", "Kopi Sanger"],
    stock: "Tersedia",
    description:
      "Arabika Gayo yang disangrai gelap untuk kamu yang suka kopi pekat tanpa harus beralih ke robusta.",
  },
  {
    id: "b13",
    name: "Gayo Floral Washed",
    category: "Single Origin Arabika",
    region: "Timang Gajah, Bener Meriah",
    altitude: 1600,
    process: "Full washed, fermentasi 36 jam, dijemur di rak tinggi",
    flavors: ["Floral", "Fruity"],
    roast: "Light",
    notes: "Bunga jeruk, lemon manis, teh melati, tubuh ringan dan bersih.",
    brew: ["V60 Pour Over", "AeroPress"],
    stock: "Habis",
    description:
      "Washed ringan dengan aroma bunga yang menonjol. Lot kecil yang cepat habis, sedang menunggu panen berikutnya.",
  },
];

const PRICES_200: Record<string, number> = {
  b01: 95000,
  b02: 82000,
  b03: 78000,
  b04: 88000,
  b05: 68000,
  b06: 38000,
  b07: 42000,
  b08: 36000,
  b09: 52000,
  b10: 56000,
  b11: 48000,
  b12: 65000,
  b13: 92000,
};

function inferOrigin(region: string): string {
  if (region.startsWith("Blend")) return "Blend Aceh";
  if (region.includes("Ulee Kareng")) return "Ulee Kareng, Banda Aceh";
  if (region.includes("Bener Meriah")) return "Bener Meriah";
  if (region.includes("Pidie")) return "Pidie";
  return "Aceh Tengah";
}

export function createInitialBeans(): Bean[] {
  return RAW_BEANS.map((b) => {
    const p200 = PRICES_200[b.id] ?? 90000;
    return {
      ...b,
      origin: inferOrigin(b.region),
      price200: p200,
      price500: Math.round((p200 * 2.3) / 1000) * 1000,
    };
  });
}

export function createInitialReviews(): Review[] {
  return [
    {
      id: "r01",
      beanId: "b01",
      name: "Rizki",
      rating: 5,
      comment: "Aromanya seperti buah beri, beda dari kopi biasa. Seduh V60 hasilnya manis.",
      date: "2026-11-08",
      demo: true,
    },
    {
      id: "r02",
      beanId: "b01",
      name: "Dina",
      rating: 4,
      comment: "Enak, tapi cukup asam buat yang belum terbiasa. Saya suka.",
      date: "2026-11-12",
      demo: true,
    },
    {
      id: "r03",
      beanId: "b02",
      name: "Hafiz",
      rating: 5,
      comment: "Manis stroberi jelas. Kemasan rapi dan biji segar.",
      date: "2026-11-10",
      demo: true,
    },
    {
      id: "r04",
      beanId: "b05",
      name: "Cut Nurul",
      rating: 4,
      comment: "Bodynya tebal, cocok dengan susu. Tidak terlalu asam.",
      date: "2026-11-14",
      demo: true,
    },
    {
      id: "r05",
      beanId: "b06",
      name: "Bang Ari",
      rating: 5,
      comment: "Rasa warung kopi Aceh banget, pas buat sanger.",
      date: "2026-11-16",
      demo: true,
    },
    {
      id: "r06",
      beanId: "b06",
      name: "Maya",
      rating: 4,
      comment: "Pekat dan wangi. Untuk saya agak pahit kalau tanpa gula.",
      date: "2026-11-18",
      demo: true,
    },
    {
      id: "r07",
      beanId: "b09",
      name: "Taufik",
      rating: 5,
      comment: "Racikan harian yang aman. Pahit seimbang, enak diminum pagi.",
      date: "2026-11-20",
      demo: true,
    },
  ];
}

export function createInitialArticles(): Article[] {
  return [
    {
      id: "a01",
      slug: "cara-menyeduh-kopi-sanger-autentik-di-rumah",
      title: "Cara Menyeduh Kopi Sanger Autentik di Rumah",
      excerpt:
        "Sanger adalah kopi Aceh yang manis, pekat, dan lembut. Begini cara meniru rasa warung kopi di dapurmu.",
      author: "Tim KupiLab",
      date: "2026-10-12",
      readMinutes: 5,
      body: `Sanger adalah singkatan dari "sama-sama ngerti": kopi pekat dicampur susu kental manis dalam takaran yang disesuaikan selera. Rasanya manis, creamy, dan masih menyisakan karakter kopinya.

## Bahan dan alat

- 20 gram bubuk robusta sangrai gelap (giling halus)
- 200 ml air panas (±95°C)
- 1-2 sendok makan susu kental manis
- Saringan kain atau French press

## Langkah menyeduh

1. Panaskan air hingga mendidih, diamkan sekitar 30 detik agar suhunya turun ke kisaran 95°C.
2. Masukkan bubuk kopi ke saringan kain atau French press.
3. Tuang air secara perlahan hingga semua bubuk basah, tunggu 30 detik agar kopi mengembang.
4. Tuang sisa air, lalu seduh total 3 sampai 4 menit.
5. Saring ke gelas yang sudah berisi susu kental manis, aduk rata.

## Tips agar rasanya mirip warung

Gunakan robusta dengan sangrai gelap dan jangan terlalu halus supaya tidak pahit berlebihan. Takaran 1:10 (satu bagian kopi, sepuluh bagian air) memberi kepekatan yang pas untuk dicampur susu. Tambahkan es batu jika ingin versi dingin.`,
    },
    {
      id: "a02",
      slug: "panduan-v60-untuk-gayo-natural",
      title: "Panduan V60 untuk Gayo Natural",
      excerpt:
        "Resep V60 sederhana untuk menonjolkan manis buah Gayo Natural tanpa membuatnya terlalu asam.",
      author: "Tim KupiLab",
      date: "2026-10-26",
      readMinutes: 6,
      body: `Gayo Natural punya manis buah yang jelas. Tujuan seduhan V60 adalah menjaga manis itu tetap bulat, bukan tajam.

## Resep dasar

- 15 gram kopi, giling medium-halus (seperti garam meja)
- 225 ml air bersuhu 92 sampai 94°C (rasio 1:15)
- Waktu total sekitar 2 menit 30 detik

## Langkah

1. Bilas kertas filter dengan air panas, buang airnya.
2. Masukkan kopi, ratakan permukaannya.
3. Bloom: tuang 45 ml air, tunggu 40 detik.
4. Tuang sampai 140 ml dengan gerakan melingkar, lalu jeda sebentar.
5. Tuang sisanya sampai 225 ml.
6. Biarkan turun hingga habis. Putar dripper pelan agar bed kopi rata.

## Menyesuaikan rasa

- Terlalu asam atau tipis: gilingan lebih halus, atau suhu air dinaikkan sedikit.
- Terlalu pahit atau kering: gilingan lebih kasar, atau suhu diturunkan.
- Kurang manis: perpanjang bloom 10 detik dan tuang lebih perlahan.

Catat tiap percobaan. Perubahan kecil satu per satu lebih mudah dipelajari daripada mengubah semuanya sekaligus.`,
    },
    {
      id: "a03",
      slug: "rahasia-kopi-tarik-ulee-kareng",
      title: "Rahasia Kopi Tarik Ulee Kareng",
      excerpt:
        "Mengapa kopi dari kawasan Ulee Kareng begitu dikenal? Dari sangrai hingga cara menyaring dengan kain.",
      author: "Tim KupiLab",
      date: "2026-11-02",
      readMinutes: 4,
      body: `Ulee Kareng adalah kawasan di Banda Aceh yang namanya identik dengan kopi. Warung-warungnya terkenal dengan seduhan pekat yang disaring memakai kain.

## Sangrai tradisional

Biji, terutama robusta, disangrai cukup gelap sehingga menghasilkan rasa cokelat pahit dan rempah. Sangrai gelap membuat kopi tetap terasa kuat saat dicampur susu atau gula.

## Saringan kain

Bubuk kopi diseduh dalam kantong kain panjang. Air panas dituang, lalu kopi dipindahkan dari satu wadah ke wadah lain dengan gerakan menarik. Gerakan ini mendinginkan seduhan sedikit, memberi aerasi, dan menghasilkan buih tipis di permukaan.

## Mencobanya di rumah

- Gunakan kopi giling halus-medium.
- Rasio mulai dari 1:10.
- Tuang air 95°C, tunggu 3 sampai 4 menit.
- Tuang bolak-balik antar dua gelas atau teko beberapa kali.

Hasilnya lebih lembut di lidah dan menyimpan aroma yang tidak hilang.`,
    },
    {
      id: "a04",
      slug: "mengenal-fermentasi-anaerob-kopi-gayo",
      title: "Mengenal Fermentasi Anaerob pada Kopi Gayo",
      excerpt:
        "Fermentasi anaerob membuat kopi berasa seperti buah matang. Apa bedanya dengan natural dan washed?",
      author: "Tim KupiLab",
      date: "2026-11-15",
      readMinutes: 5,
      body: `Setelah dipetik, buah kopi harus diolah sebelum bijinya bisa disangrai. Cara mengolahnya sangat memengaruhi rasa di cangkir.

## Tiga proses utama

- Washed: kulit dan lendir dibersihkan sebelum penjemuran. Rasa bersih, asam jernih.
- Natural: buah dijemur utuh. Rasa manis buah, body lebih berat.
- Honey: sebagian lendir dibiarkan menempel. Manis, seimbang.

## Apa itu fermentasi anaerob?

Pada fermentasi anaerob, buah kopi difermentasi tanpa oksigen dalam wadah tertutup selama beberapa hari. Mikroba memecah gula buah dan menghasilkan senyawa aroma seperti buah beri dan rempah manis. Tidak ada alkohol dalam produk akhirnya: biji dicuci, dijemur, lalu disangrai di atas 200°C.

## Yang perlu dijaga

Fermentasi terlalu lama dapat memunculkan rasa asam cuka atau terlalu menyengat. Karena itu petani mengatur waktu dan suhu dengan hati-hati, lalu menjemur perlahan agar rasa stabil.

## Cara menikmatinya

Seduh dengan V60 pada suhu 92°C atau cold brew. Hindari sangrai gelap karena akan menutupi karakter buahnya.`,
    },
  ];
}

export function createInitialBatch(): RoastBatch {
  const d = new Date();
  const diff = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return {
    date: toDateStr(d),
    roaster: "Roaster KupiLab",
    note: "Batch kecil 5 kg: Gayo Anaerob 72 Jam, Gayo Natural, dan House Blend Meuligoe. Biji segar siap diambil 2 hari setelah sangrai.",
  };
}

export function createInitialDb(adminPassHash: string | null = null): DbState {
  return {
    beans: createInitialBeans(),
    articles: createInitialArticles(),
    batch: createInitialBatch(),
    reviews: createInitialReviews(),
    orders: [],
    customers: [],
    adminPassHash,
  };
}
