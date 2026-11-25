import { el, svgEl } from "../utils/dom.js";

const DURATION_MS = 5200;

const PALETTE = {
  ink: "#3d2615",
  dark: "#4a2e1c",
  mid: "#77543a",
  tan: "#b7a693",
  sand: "#e4dbce",
  paper: "#f7f4ed",
  olive: "#504f2c",
  olive2: "#6b6a3a",
  olive3: "#7e7d4b",
  red: "#b3402c",
  sun: "#e8d9a8",
};

const STAGES = [
  {
    scene: "plantation",
    tag: "Kebun",
    title: "Lereng sejuk menumbuhkan asam yang bersih.",
    text: "Dataran tinggi Gayo, 1.200 sampai 1.600 mdpl. Udara dingin memperlambat pematangan buah, dan gula dalam biji menumpuk lebih lama.",
    metrics: [
      ["Ketinggian", "1.500 mdpl"],
      ["Suhu rata-rata", "18°C"],
      ["Naungan", "62%"],
    ],
  },
  {
    scene: "panen",
    tag: "Panen",
    title: "Hanya yang merah yang dipetik.",
    text: "Buah dipilih satu per satu dengan tangan, bertahap. Buah hijau menghasilkan rasa sepat, jadi pohon yang sama didatangi beberapa kali dalam satu musim.",
    metrics: [
      ["Petik merah", "98%"],
      ["Lewat per pohon", "4 kali"],
      ["Per hari", "60 kg"],
    ],
  },
  {
    scene: "roastery",
    tag: "Sangrai",
    title: "Sebelas menit menentukan rasanya.",
    text: "Biji dipanaskan sampai mengembang dan berubah warna, lalu didinginkan cepat di cooling tray supaya profilnya berhenti tepat di titik yang kami catat.",
    metrics: [
      ["Suhu puncak", "210°C"],
      ["Durasi", "11 menit"],
      ["Batch", "5 kg"],
    ],
  },
  {
    scene: "brewbar",
    tag: "Seduh",
    title: "Air pelan, rasa keluar utuh.",
    text: "Rasio 1:15, air 92 sampai 94 derajat, dituang bertahap dari teko leher angsa. Bloom dulu empat puluh detik supaya gas keluar sebelum ekstraksi.",
    metrics: [
      ["Rasio", "1 : 15"],
      ["Suhu air", "93°C"],
      ["Waktu", "2:45"],
    ],
  },
  {
    scene: "cangkir",
    tag: "Cangkir",
    title: "Sampai juga di mejamu.",
    text: "Manis buah beri, cokelat, dan madu bunga. Semua yang terjadi di hulu baru terasa di tegukan pertama.",
    metrics: [
      ["Skor cupping", "86,5"],
      ["Kesegaran", "3 hari"],
      ["Varian", "13"],
    ],
  },
];

const SCENE_LABELS = {
  roastery: "Ilustrasi mesin sangrai dan cooling tray di roastery",
  brewbar: "Ilustrasi meja seduh manual dengan teko leher angsa dan dripper V60",
  plantation: "Ilustrasi kebun kopi dataran tinggi berkabut dengan petani memetik buah ceri",
  panen: "Ilustrasi tangan memetik buah ceri kopi merah dari ranting",
  cangkir: "Ilustrasi secangkir kopi tampak atas dengan uap mengepul",
};

function smallBean(x, y, r = 0, s = 1, fill = PALETTE.dark) {
  return svgEl(
    "g",
    { transform: `translate(${x} ${y}) rotate(${r}) scale(${s})` },
    svgEl("ellipse", { rx: "7", ry: "10", fill }),
    svgEl("path", { d: "M-1.5 -8c4 4 -4 13 1.5 17", stroke: "#00000055", "stroke-width": "1.8", fill: "none", "stroke-linecap": "round" })
  );
}

function scenePlantation() {
  const rows = [
    { y: 232, k: 14, c: PALETTE.olive3 },
    { y: 258, k: 16, c: PALETTE.olive2 },
    { y: 288, k: 18, c: PALETTE.olive },
  ];

  return svgEl(
    "g",
    null,
    svgEl(
      "defs",
      null,
      svgEl(
        "linearGradient",
        { id: "jsSkyGrad", x1: "0", y1: "0", x2: "0", y2: "1" },
        svgEl("stop", { offset: "0", "stop-color": "#f7f4ed" }),
        svgEl("stop", { offset: "1", "stop-color": "#e7e9d8" })
      )
    ),
    svgEl("rect", { width: "300", height: "400", fill: "#eef0e6" }),
    svgEl("rect", { width: "300", height: "220", fill: "url(#jsSkyGrad)" }),
    svgEl("circle", { cx: "214", cy: "56", r: "30", fill: PALETTE.sun, opacity: "0.75" }),
    svgEl("path", { d: "M0 150 Q70 104 140 142 Q210 180 300 128 V220 H0z", fill: "#9aa37e", opacity: "0.55" }),
    svgEl("path", { d: "M0 176 Q80 134 150 172 Q220 210 300 162 V240 H0z", fill: PALETTE.olive3, opacity: "0.75" }),
    svgEl("path", { d: "M0 206 Q90 168 168 204 Q238 236 300 198 V260 H0z", fill: PALETTE.olive2 }),
    ...[150, 182, 120].map((y, i) =>
      svgEl("path", {
        className: "mist",
        d: `M-30 ${y} q60 -12 130 0 t170 -4`,
        stroke: PALETTE.paper,
        "stroke-width": i === 2 ? "10" : "14",
        fill: "none",
        "stroke-linecap": "round",
        opacity: i === 2 ? "0.45" : "0.6",
        style: { animationDelay: `${i * 2.4}s` },
      })
    ),
    ...rows.map((row, rIdx) =>
      svgEl(
        "g",
        null,
        svgEl("path", { d: `M-10 ${row.y + 12} Q150 ${row.y - 16} 310 ${row.y + 10}`, stroke: row.c, "stroke-width": "3", fill: "none", opacity: "0.5" }),
        ...Array.from({ length: row.k }, (_, i) => {
          const p = i / (row.k - 1);
          const x = -10 + p * 320;
          const y = row.y + 12 - Math.sin(p * Math.PI) * 26;
          const s = 0.7 + rIdx * 0.22;
          return svgEl(
            "g",
            { transform: `translate(${x} ${y}) scale(${s})` },
            svgEl("path", { d: "M0 0v-14", stroke: PALETTE.olive, "stroke-width": "2.5" }),
            svgEl("ellipse", { cx: "-7", cy: "-17", rx: "8", ry: "5", transform: "rotate(-24 -7 -17)", fill: row.c }),
            svgEl("ellipse", { cx: "7", cy: "-17", rx: "8", ry: "5", transform: "rotate(24 7 -17)", fill: PALETTE.olive2 }),
            svgEl("ellipse", { cx: "0", cy: "-26", rx: "7", ry: "5", fill: row.c }),
            i % 3 === 0 ? svgEl("circle", { cx: "2", cy: "-14", r: "2.6", fill: PALETTE.red }) : null
          );
        })
      )
    ),
    svgEl(
      "g",
      { transform: "translate(96 296)" },
      svgEl("ellipse", { cx: "0", cy: "34", rx: "26", ry: "6", fill: "#00000018" }),
      svgEl("path", { d: "M-16 34 h32 l-5 -26 h-22z", fill: "#a8946d" }),
      svgEl("path", { d: "M-14 22 h28", stroke: "#8d7a55", "stroke-width": "2.5" }),
      svgEl("circle", { cx: "-4", cy: "14", r: "3", fill: PALETTE.red }),
      svgEl("circle", { cx: "5", cy: "16", r: "3", fill: PALETTE.red }),
      svgEl("path", { d: "M-10 8 q10 -30 20 -2", stroke: PALETTE.olive, "stroke-width": "11", fill: "none", "stroke-linecap": "round" }),
      svgEl("rect", { x: "-9", y: "-22", width: "20", height: "26", rx: "8", fill: PALETTE.olive }),
      svgEl("path", { d: "M11 -16 q14 -6 18 -18", stroke: "#c98f62", "stroke-width": "7", fill: "none", "stroke-linecap": "round" }),
      svgEl("circle", { cx: "1", cy: "-30", r: "9", fill: "#c98f62" }),
      svgEl("path", { d: "M-14 -32 q15 -12 30 0z", fill: "#a8946d" }),
      svgEl("ellipse", { cx: "1", cy: "-32", rx: "19", ry: "4", fill: "#a8946d" })
    ),
    svgEl(
      "g",
      { transform: "translate(228 330)" },
      svgEl("path", { d: "M-80 46 C-40 22 -10 4 36 -24", stroke: PALETTE.olive, "stroke-width": "6", fill: "none", "stroke-linecap": "round" }),
      svgEl(
        "g",
        null,
        svgEl("path", { d: "M-42 20 q-20 -16 -16 -34 18 4 22 30z", fill: PALETTE.olive2 }),
        svgEl("path", { d: "M-12 2 q4 -24 24 -30 2 20 -18 32z", fill: PALETTE.olive3 }),
        svgEl("path", { d: "M14 -12 q-20 -14 -18 -32 18 6 22 28z", fill: PALETTE.olive2 })
      ),
      svgEl("circle", { cx: "-56", cy: "34", r: "11", fill: PALETTE.red }),
      svgEl("circle", { cx: "-34", cy: "42", r: "10", fill: "#c4533a" }),
      svgEl("circle", { cx: "-6", cy: "24", r: "11", fill: PALETTE.red }),
      svgEl("circle", { cx: "18", cy: "12", r: "9", fill: "#c4533a" }),
      svgEl("circle", { cx: "-59", cy: "30", r: "3", fill: "#ffffff66" }),
      svgEl("circle", { cx: "-9", cy: "20", r: "3", fill: "#ffffff66" })
    )
  );
}

function sceneHarvest() {
  return svgEl(
    "g",
    null,
    svgEl(
      "defs",
      null,
      svgEl(
        "linearGradient",
        { id: "jsHarvestGrad", x1: "0", y1: "0", x2: "0", y2: "1" },
        svgEl("stop", { offset: "0", "stop-color": "#f7f4ed", "stop-opacity": "0.9" }),
        svgEl("stop", { offset: "1", "stop-color": "#dfe3cf", "stop-opacity": "0.7" })
      )
    ),
    svgEl("rect", { width: "300", height: "400", fill: "#eef0e6" }),
    svgEl("rect", { width: "300", height: "400", fill: "url(#jsHarvestGrad)" }),
    ...[[40, 70, -30, 1.4], [250, 110, 24, 1.2], [70, 330, 18, 1.1], [240, 330, -16, 1.3]].map(([x, y, r, s]) =>
      svgEl(
        "g",
        { transform: `translate(${x} ${y}) rotate(${r}) scale(${s})`, opacity: "0.35" },
        svgEl("path", { d: "M0 0c-20 -10 -26 -32 -14 -48 24 8 24 32 14 48z", fill: PALETTE.olive2 })
      )
    ),
    svgEl("path", { d: "M-10 118 C70 132 140 150 300 142", stroke: PALETTE.olive, "stroke-width": "9", fill: "none", "stroke-linecap": "round" }),
    svgEl("path", { d: "M86 140 C96 180 92 220 72 252", stroke: PALETTE.olive, "stroke-width": "6", fill: "none", "stroke-linecap": "round" }),
    ...[[38, 126, -34], [128, 150, 22], [196, 146, -18], [262, 140, 28]].map(([x, y, r], i) =>
      svgEl(
        "g",
        { transform: `translate(${x} ${y}) rotate(${r})` },
        svgEl("path", { d: "M0 0c-22 -12 -28 -36 -15 -52 26 9 26 36 15 52z", fill: i % 2 ? PALETTE.olive2 : PALETTE.olive3 }),
        svgEl("path", { d: "M-13 -50 C-8 -34 -4 -16 0 -2", stroke: PALETTE.olive, "stroke-width": "2", fill: "none" })
      )
    ),
    ...[
      [56, 160, PALETTE.red, 15],
      [92, 176, "#c4533a", 13],
      [150, 170, PALETTE.red, 16],
      [184, 186, "#8f3222", 12],
      [228, 164, PALETTE.red, 14],
      [120, 208, "#c4533a", 11],
      [76, 220, PALETTE.red, 12],
    ].map(([cx, cy, fill, r]) =>
      svgEl(
        "g",
        null,
        svgEl("path", { d: `M${cx} ${cy - r - 2} v-12`, stroke: PALETTE.olive, "stroke-width": "2.5" }),
        svgEl("circle", { cx: String(cx), cy: String(cy), r: String(r), fill }),
        svgEl("circle", { cx: String(cx - r / 3), cy: String(cy - r / 3), r: String(r / 4), fill: "#ffffff66" })
      )
    ),
    svgEl(
      "g",
      { transform: "translate(186 300)" },
      svgEl("rect", { x: "-26", y: "40", width: "96", height: "46", rx: "16", fill: PALETTE.olive, transform: "rotate(-22)" }),
      svgEl("rect", { x: "-26", y: "46", width: "96", height: "8", fill: "#ffffff22", transform: "rotate(-22)" }),
      svgEl("path", { d: "M-18 36 q-22 -16 -30 -34", stroke: "#d9a273", "stroke-width": "24", "stroke-linecap": "round", fill: "none" }),
      svgEl("ellipse", { cx: "-50", cy: "-6", rx: "22", ry: "18", transform: "rotate(-26 -50 -6)", fill: "#d9a273" }),
      svgEl(
        "g",
        { stroke: "#d9a273", "stroke-width": "11", "stroke-linecap": "round", fill: "none" },
        svgEl("path", { d: "M-62 -18 q-12 -12 -8 -24" }),
        svgEl("path", { d: "M-48 -22 q-6 -14 2 -24" }),
        svgEl("path", { d: "M-34 -20 q0 -14 10 -20" })
      ),
      svgEl("path", { d: "M-66 -6 q-14 -6 -14 -20", stroke: "#d9a273", "stroke-width": "9", "stroke-linecap": "round", fill: "none" }),
      svgEl("circle", { cx: "-52", cy: "-36", r: "12", fill: PALETTE.red }),
      svgEl("circle", { cx: "-56", cy: "-40", r: "3.4", fill: "#ffffff66" })
    )
  );
}

function sceneRoastery() {
  return svgEl(
    "g",
    null,
    svgEl(
      "defs",
      null,
      svgEl(
        "linearGradient",
        { id: "jsRoastGrad", x1: "0", y1: "0", x2: "1", y2: "1" },
        svgEl("stop", { offset: "0", "stop-color": "#ffffff", "stop-opacity": "0.25" }),
        svgEl("stop", { offset: "1", "stop-color": "#000000", "stop-opacity": "0.2" })
      )
    ),
    svgEl("rect", { width: "300", height: "400", fill: PALETTE.paper }),
    svgEl("rect", { y: "0", width: "300", height: "250", fill: PALETTE.sand, opacity: "0.55" }),
    svgEl("rect", { x: "18", y: "40", width: "264", height: "5", rx: "2.5", fill: PALETTE.tan, opacity: "0.8" }),
    ...[32, 70, 108].map((x, i) =>
      svgEl(
        "g",
        { transform: `translate(${x} 10)` },
        svgEl("path", { d: "M0 0h26l4 30H-4z", fill: i % 2 ? PALETTE.olive : PALETTE.mid }),
        svgEl("rect", { x: "2", y: "-5", width: "22", height: "7", rx: "3", fill: i % 2 ? PALETTE.olive : PALETTE.mid })
      )
    ),
    svgEl("circle", { cx: "238", cy: "24", r: "13", fill: "none", stroke: PALETTE.tan, "stroke-width": "3" }),
    svgEl("path", { d: "M238 16v9l6 4", stroke: PALETTE.tan, "stroke-width": "3", "stroke-linecap": "round", fill: "none" }),
    ...[0, 1, 2].map((i) =>
      svgEl("path", {
        className: "steam",
        d: `M${118 + i * 32} 92 q9 -14 0 -26 q-9 -12 0 -24`,
        stroke: PALETTE.tan,
        "stroke-width": "3",
        fill: "none",
        "stroke-linecap": "round",
        opacity: "0.75",
        style: { animationDelay: `${i * 0.7}s` },
      })
    ),
    svgEl("rect", { x: "62", y: "96", width: "176", height: "128", rx: "18", fill: PALETTE.ink }),
    svgEl("rect", { x: "62", y: "96", width: "176", height: "128", rx: "18", fill: "url(#jsRoastGrad)", opacity: "0.35" }),
    svgEl("rect", { x: "112", y: "78", width: "76", height: "22", rx: "7", fill: PALETTE.mid }),
    svgEl("path", { d: "M128 78l10 -22h24l10 22z", fill: PALETTE.mid }),
    svgEl("circle", { cx: "150", cy: "158", r: "50", fill: PALETTE.dark }),
    svgEl("circle", { cx: "150", cy: "158", r: "40", fill: PALETTE.paper, opacity: "0.9" }),
    svgEl("circle", { cx: "150", cy: "158", r: "40", fill: "none", stroke: PALETTE.tan, "stroke-width": "4" }),
    svgEl(
      "g",
      { className: "drum" },
      ...[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return smallBean(150 + Math.cos(rad) * 24, 158 + Math.sin(rad) * 24, deg, 0.95, PALETTE.mid);
      }),
      smallBean(150, 158, 0, 0.8, PALETTE.dark)
    ),
    svgEl("circle", { cx: "150", cy: "158", r: "50", fill: "none", stroke: PALETTE.mid, "stroke-width": "5" }),
    ...[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return svgEl("circle", { cx: String(150 + Math.cos(rad) * 50), cy: String(158 + Math.sin(rad) * 50), r: "3", fill: PALETTE.tan });
    }),
    svgEl("rect", { x: "206", y: "116", width: "24", height: "44", rx: "6", fill: PALETTE.mid }),
    svgEl("circle", { cx: "218", cy: "128", r: "5", fill: PALETTE.red }),
    svgEl("circle", { cx: "218", cy: "144", r: "5", fill: PALETTE.olive3 }),
    svgEl("rect", { x: "208", y: "168", width: "20", height: "4", rx: "2", fill: PALETTE.tan }),
    svgEl("rect", { x: "78", y: "224", width: "14", height: "34", fill: PALETTE.dark }),
    svgEl("rect", { x: "208", y: "224", width: "14", height: "34", fill: PALETTE.dark }),
    svgEl("ellipse", { cx: "150", cy: "300", rx: "112", ry: "40", fill: PALETTE.tan }),
    svgEl("ellipse", { cx: "150", cy: "294", rx: "104", ry: "35", fill: PALETTE.sand }),
    svgEl("ellipse", { cx: "150", cy: "294", rx: "104", ry: "35", fill: "none", stroke: PALETTE.tan, "stroke-width": "3" }),
    svgEl(
      "g",
      { className: "tray" },
      svgEl("path", { d: "M150 294 L58 294 M150 294 L242 294 M150 294 L150 262 M150 294 L150 326", stroke: PALETTE.mid, "stroke-width": "5", "stroke-linecap": "round", opacity: "0.8" }),
      svgEl("circle", { cx: "150", cy: "294", r: "9", fill: PALETTE.ink })
    ),
    ...[
      [70, 292], [96, 280], [120, 306], [150, 276],
      [178, 302], [206, 282], [228, 300], [110, 316],
      [150, 314], [192, 316], [66, 306], [234, 284],
    ].map(([bx, by], i) => smallBean(bx, by, (i * 53) % 180, 0.85, i % 3 ? PALETTE.mid : PALETTE.dark)),
    svgEl(
      "g",
      { transform: "translate(252 348)" },
      svgEl("rect", { x: "-10", y: "18", width: "74", height: "30", rx: "10", fill: PALETTE.olive, transform: "rotate(-24)" }),
      svgEl("path", { d: "M-4 16 q-26 -8 -42 -4", stroke: "#d9a273", "stroke-width": "17", "stroke-linecap": "round", fill: "none" }),
      svgEl("ellipse", { cx: "-50", cy: "8", rx: "16", ry: "12", transform: "rotate(-18 -50 8)", fill: "#d9a273" }),
      svgEl("path", { d: "M-62 2 q-10 -2 -14 3", stroke: "#d9a273", "stroke-width": "7", "stroke-linecap": "round", fill: "none" }),
      svgEl("ellipse", { cx: "-54", cy: "0", rx: "12", ry: "6", fill: PALETTE.sand, transform: "rotate(-12 -54 0)" }),
      smallBean(-58, -2, -20, 0.6, PALETTE.mid),
      smallBean(-48, 0, 30, 0.6, PALETTE.dark)
    )
  );
}

function sceneBrewbar() {
  return svgEl(
    "g",
    null,
    svgEl("rect", { width: "300", height: "400", fill: PALETTE.paper }),
    svgEl("circle", { cx: "150", cy: "170", r: "136", fill: PALETTE.sun, opacity: "0.55" }),
    svgEl(
      "g",
      { transform: "translate(252 150)" },
      svgEl("path", { d: "M-14 0h28l-4 26h-20z", fill: PALETTE.mid }),
      svgEl("path", { d: "M0 0c-14 -6 -18 -22 -10 -32 12 4 16 18 10 32z", fill: PALETTE.olive2 }),
      svgEl("path", { d: "M0 0c14 -8 16 -24 8 -34 -12 6 -14 20 -8 34z", fill: PALETTE.olive3 })
    ),
    svgEl("rect", { x: "0", y: "292", width: "300", height: "26", fill: PALETTE.mid }),
    svgEl("rect", { x: "0", y: "292", width: "300", height: "7", fill: "#8d6648" }),
    svgEl("rect", { x: "0", y: "318", width: "300", height: "82", fill: PALETTE.dark, opacity: "0.25" }),
    ...[40, 120, 200, 266].map((x) => svgEl("path", { d: `M${x} 300h46`, stroke: "#00000022", "stroke-width": "2" })),
    svgEl("rect", { x: "92", y: "272", width: "116", height: "20", rx: "7", fill: PALETTE.ink }),
    svgEl("rect", { x: "150", y: "277", width: "44", height: "10", rx: "4", fill: PALETTE.olive3, opacity: "0.85" }),
    svgEl("path", { d: "M118 212h64l-7 60h-50z", fill: PALETTE.sand, opacity: "0.65" }),
    svgEl("path", { d: "M118 212h64l-7 60h-50z", fill: "none", stroke: PALETTE.tan, "stroke-width": "3" }),
    svgEl("path", { d: "M124 252h52l-2 20h-48z", fill: PALETTE.dark, opacity: "0.8" }),
    svgEl("path", { d: "M104 166h92l-30 46h-32z", fill: PALETTE.red }),
    svgEl("path", { d: "M104 166h92l-5 8h-82z", fill: "#c4533a" }),
    svgEl("path", { d: "M118 174h64l-22 32h-20z", fill: PALETTE.paper, opacity: "0.92" }),
    svgEl("path", { d: "M126 180h48l-15 22h-18z", fill: PALETTE.mid }),
    ...[0, 1, 2, 3, 4, 5].map((i) => svgEl("path", { d: `M${116 + i * 14} 168 l-6 42`, stroke: "#00000022", "stroke-width": "1.5" })),
    ...[0, 1].map((i) =>
      svgEl("circle", { className: "drip", cx: "150", cy: "216", r: "3.2", fill: PALETTE.dark, style: { animationDelay: `${i * 0.8}s` } })
    ),
    svgEl("path", { className: "steam", d: "M136 152 q8 -12 0 -22", stroke: PALETTE.tan, "stroke-width": "3", fill: "none", "stroke-linecap": "round" }),
    svgEl("path", { className: "steam", d: "M164 152 q8 -12 0 -22", stroke: PALETTE.tan, "stroke-width": "3", fill: "none", "stroke-linecap": "round", style: { animationDelay: "0.8s" } }),
    svgEl(
      "g",
      { transform: "translate(232 120) rotate(-16) scale(.88)" },
      svgEl("path", { d: "M-56 0 H14 Q26 0 26 14 V52 Q26 66 12 66 H-52 Q-66 66 -66 52 V14 Q-66 0 -56 0z", fill: PALETTE.tan }),
      svgEl("path", { d: "M-56 0 H14 Q26 0 26 14 V22 H-66 V14 Q-66 0 -56 0z", fill: "#c8b9a6" }),
      svgEl("path", { d: "M-66 24 Q-96 24 -90 52 Q-82 68 -66 62", stroke: PALETTE.tan, "stroke-width": "9", fill: "none" }),
      svgEl("rect", { x: "-32", y: "-10", width: "24", height: "10", rx: "4", fill: PALETTE.ink }),
      svgEl("path", { d: "M26 16 C60 6 74 -14 78 -30", stroke: PALETTE.tan, "stroke-width": "9", fill: "none", "stroke-linecap": "round" }),
      svgEl("path", { d: "M78 -30 l10 8", stroke: PALETTE.tan, "stroke-width": "9", fill: "none", "stroke-linecap": "round" }),
      svgEl(
        "g",
        { transform: "translate(-86 40) rotate(16)" },
        svgEl("rect", { x: "-44", y: "-16", width: "46", height: "34", rx: "11", fill: PALETTE.olive }),
        svgEl("ellipse", { cx: "6", cy: "2", rx: "17", ry: "14", fill: "#e0a877" }),
        svgEl(
          "g",
          { stroke: "#e0a877", "stroke-width": "8", "stroke-linecap": "round" },
          svgEl("path", { d: "M14 -6 h12" }),
          svgEl("path", { d: "M15 2 h13" }),
          svgEl("path", { d: "M14 10 h11" })
        ),
        svgEl("path", { d: "M6 -12 q10 -4 14 2", stroke: "#e0a877", "stroke-width": "7", fill: "none", "stroke-linecap": "round" })
      )
    ),
    svgEl("path", { className: "flow", d: "M163 108 Q157 134 150 164", stroke: "#8fb6cc", "stroke-width": "5", fill: "none", "stroke-linecap": "round", "stroke-dasharray": "7 9" }),
    svgEl(
      "g",
      { transform: "translate(248 246)" },
      svgEl("path", { d: "M-22 0h44l5 46h-54z", fill: PALETTE.olive }),
      svgEl("rect", { x: "-18", y: "-8", width: "36", height: "10", rx: "4", fill: PALETTE.olive }),
      svgEl("rect", { x: "-13", y: "14", width: "26", height: "18", rx: "4", fill: PALETTE.paper, opacity: "0.92" })
    ),
    svgEl(
      "g",
      { transform: "translate(54 262)" },
      svgEl("path", { d: "M-20 0h40q-2 28 -20 28 -18 0 -20 -28z", fill: PALETTE.paper, stroke: PALETTE.tan, "stroke-width": "3" }),
      svgEl("ellipse", { cx: "0", cy: "0", rx: "20", ry: "5", fill: PALETTE.dark }),
      svgEl("path", { d: "M20 6 q14 0 10 12 -3 7 -12 5", stroke: PALETTE.tan, "stroke-width": "4", fill: "none" })
    )
  );
}

function sceneCup() {
  return svgEl(
    "g",
    null,
    svgEl("rect", { width: "300", height: "400", fill: PALETTE.paper }),
    svgEl("circle", { cx: "150", cy: "210", r: "150", fill: PALETTE.sand, opacity: "0.55" }),
    svgEl("circle", { cx: "150", cy: "210", r: "112", fill: PALETTE.sand, opacity: "0.7" }),
    ...[108, 150, 192].map((x, i) =>
      svgEl("path", {
        className: "steam",
        d: `M${x} 92 q11 -17 0 -32 q-11 -15 0 -30`,
        stroke: PALETTE.tan,
        "stroke-width": "4",
        fill: "none",
        "stroke-linecap": "round",
        style: { animationDelay: `${i * 0.8}s` },
      })
    ),
    svgEl("ellipse", { cx: "150", cy: "226", rx: "118", ry: "104", fill: "#00000012" }),
    svgEl("ellipse", { cx: "150", cy: "218", rx: "116", ry: "102", fill: PALETTE.paper, stroke: PALETTE.tan, "stroke-width": "4" }),
    svgEl("ellipse", { cx: "150", cy: "218", rx: "94", ry: "82", fill: PALETTE.sand, opacity: "0.5" }),
    svgEl("ellipse", { cx: "150", cy: "218", rx: "82", ry: "72", fill: PALETTE.paper, stroke: PALETTE.tan, "stroke-width": "3" }),
    svgEl("ellipse", { cx: "150", cy: "218", rx: "70", ry: "61", fill: PALETTE.dark }),
    svgEl("ellipse", { cx: "150", cy: "218", rx: "70", ry: "61", fill: "none", stroke: "#5a3a24", "stroke-width": "5" }),
    svgEl("path", { d: "M228 196 q38 4 32 34 -5 24 -36 24", stroke: PALETTE.tan, "stroke-width": "13", fill: "none", "stroke-linecap": "round" }),
    svgEl(
      "g",
      { className: "latte", transform: "translate(150 218)" },
      svgEl("path", { d: "M0 -38 C28 -19 28 19 0 38 C-28 19 -28 -19 0 -38z", fill: PALETTE.sand }),
      svgEl("path", {
        d: "M0 -30 V32 M0 -12 L-12 -21 M0 0 L-14 -10 M0 12 L-12 4 M0 -12 L12 -21 M0 0 L14 -10 M0 12 L12 4",
        stroke: PALETTE.ink,
        "stroke-width": "2.6",
        "stroke-linecap": "round",
        fill: "none",
      })
    ),
    smallBean(66, 300, -24, 1.1, PALETTE.mid),
    smallBean(96, 318, 30, 1, PALETTE.dark),
    smallBean(226, 306, 14, 1.1, PALETTE.mid),
    svgEl(
      "g",
      { transform: "translate(252 352) rotate(-36)" },
      svgEl("rect", { x: "-6", y: "-46", width: "12", height: "58", rx: "6", fill: PALETTE.tan }),
      svgEl("ellipse", { cx: "0", cy: "-54", rx: "15", ry: "11", fill: "#c8b9a6" })
    )
  );
}

const SCENE_BUILDERS = {
  plantation: scenePlantation,
  panen: sceneHarvest,
  roastery: sceneRoastery,
  brewbar: sceneBrewbar,
  cangkir: sceneCup,
};

function renderSceneSvg(name) {
  const build = SCENE_BUILDERS[name] || SCENE_BUILDERS.plantation;
  return svgEl(
    "svg",
    {
      viewBox: "0 0 300 400",
      className: "h-full w-full",
      preserveAspectRatio: "xMidYMid slice",
      role: "img",
      "aria-label": SCENE_LABELS[name] || "",
    },
    build()
  );
}

export function JourneyShowcase() {
  let index = 0;
  let paused = false;
  let pointerStart = null;
  let timer = null;

  const mq = typeof window !== "undefined" ? window.matchMedia?.("(prefers-reduced-motion: reduce)") : null;
  let reduced = Boolean(mq?.matches);

  const counterNum = el("span", { className: "font-display text-2xl tabular-nums text-white" });
  const counterTag = el("span", { className: "tracking-wide" });
  const textBox = el("div", { className: "step-in" });
  const tabsSlot = el("div", { className: "mt-10 flex flex-wrap gap-2" });
  const stageSlot = el("div", { className: "step-in aspect-[4/3] overflow-hidden rounded-[2rem] bg-paper shadow-2xl lg:aspect-[5/6]" });

  const scheduleNext = () => {
    if (timer) clearTimeout(timer);
    if (paused || reduced) return;
    timer = setTimeout(() => {
      index = (index + 1) % STAGES.length;
      renderStage();
      scheduleNext();
    }, DURATION_MS);
  };

  const selectStage = (nextIdx) => {
    const n = STAGES.length;
    index = ((nextIdx % n) + n) % n;
    renderStage();
    scheduleNext();
  };

  const renderStage = () => {
    const s = STAGES[index];
    counterNum.textContent = String(index + 1).padStart(2, "0");
    counterTag.textContent = s.tag;

    textBox.replaceChildren(
      el("h2", { className: "mt-4 text-3xl leading-[1.08] !text-white sm:text-5xl" }, s.title),
      el("p", { className: "mt-4 max-w-md leading-relaxed text-cream-200" }, s.text),
      el(
        "dl",
        { className: "mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6" },
        ...s.metrics.map(([label, value]) =>
          el(
            "div",
            null,
            el("dt", { className: "text-[11px] font-semibold uppercase tracking-wide text-cream-300" }, label),
            el("dd", { className: "mt-1 font-display text-xl tabular-nums text-white sm:text-2xl" }, value)
          )
        )
      )
    );

    tabsSlot.replaceChildren(
      ...STAGES.map((stage, i) => {
        const active = i === index;
        const bar = active
          ? el("span", {
              className: "bar-fill absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-espresso-700/35",
              style: {
                animationDuration: `${DURATION_MS}ms`,
                animationPlayState: paused ? "paused" : "running",
              },
            })
          : null;

        return el(
          "button",
          {
            type: "button",
            onClick: () => selectStage(i),
            "aria-current": active ? "true" : undefined,
            className: `relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold transition ${
              active ? "bg-white text-espresso-700" : "border border-white/25 text-cream-200 hover:bg-white/10"
            }`,
          },
          el("span", { className: "mr-1.5 opacity-60 tabular-nums" }, `0${i + 1}`),
          stage.tag,
          bar
        );
      })
    );

    stageSlot.replaceChildren(renderSceneSvg(s.scene));
  };

  const onReduceChange = (e) => {
    reduced = Boolean(e.matches);
    scheduleNext();
  };
  mq?.addEventListener?.("change", onReduceChange);

  const section = el(
    "section",
    {
      className: "relative overflow-hidden bg-espresso-800 text-cream-50",
      "aria-roledescription": "carousel",
      "aria-label": "Perjalanan kopi, berjalan otomatis",
      onMouseEnter: () => {
        paused = true;
        scheduleNext();
        const bar = tabsSlot.querySelector(".bar-fill");
        if (bar) bar.style.animationPlayState = "paused";
      },
      onMouseLeave: () => {
        paused = false;
        scheduleNext();
        const bar = tabsSlot.querySelector(".bar-fill");
        if (bar) bar.style.animationPlayState = "running";
      },
      onFocusIn: () => {
        paused = true;
        scheduleNext();
      },
      onFocusOut: () => {
        paused = false;
        scheduleNext();
      },
      onKeyDown: (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          selectStage(index + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          selectStage(index - 1);
        }
      },
      onPointerDown: (e) => {
        pointerStart = e.clientX;
      },
      onPointerUp: (e) => {
        if (pointerStart === null) return;
        const delta = e.clientX - pointerStart;
        pointerStart = null;
        if (Math.abs(delta) > 60) {
          selectStage(index + (delta < 0 ? 1 : -1));
        }
      },
    },
    el("span", { className: "pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-terra-600/25 blur-3xl", "aria-hidden": "true" }),
    el("span", { className: "pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-cream-200/10 blur-3xl", "aria-hidden": "true" }),
    el(
      "div",
      { className: "container-x relative grid gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20" },
      el(
        "div",
        { className: "order-2 lg:order-1" },
        el(
          "div",
          { className: "flex items-center gap-3 text-sm font-semibold text-cream-300" },
          counterNum,
          el("span", { className: "h-px w-8 bg-cream-400/60", "aria-hidden": "true" }),
          counterTag
        ),
        textBox,
        tabsSlot
      ),
      el("div", { className: "order-1 lg:order-2" }, stageSlot)
    )
  );

  renderStage();
  scheduleNext();

  const cleanup = () => {
    if (timer) clearTimeout(timer);
    mq?.removeEventListener?.("change", onReduceChange);
  };

  return { element: section, cleanup };
}
