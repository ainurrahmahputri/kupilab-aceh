import { svgEl } from "../utils/dom.js";

const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const smooth = (t) => t * t * (3 - 2 * t);

function mixColor(a, b, t) {
  const ch = (hex, idx) => parseInt(hex.slice(1 + idx * 2, 3 + idx * 2), 16);
  const k = clamp(t);
  const seg = (idx) => Math.round(ch(a, idx) + (ch(b, idx) - ch(a, idx)) * k).toString(16).padStart(2, "0");
  return `#${seg(0)}${seg(1)}${seg(2)}`;
}

const INK = "#3d2615";
const OLIVE = "#504f2c";

function beanShape(x, y, r = 0, c = "#5a3a24", s = 1) {
  return svgEl(
    "g",
    { transform: `translate(${x} ${y}) rotate(${r}) scale(${s})` },
    svgEl("ellipse", { rx: "11", ry: "16", fill: c }),
    svgEl("path", { d: "M-2 -13c7 6 -7 20 2 26", stroke: "#00000055", "stroke-width": "2.4", fill: "none", "stroke-linecap": "round" })
  );
}

// 1. Menanam
function stagePlanting(t) {
  const stemHeight = 150 * smooth(t);
  const leaves = [0.35, 0.6, 0.85].map((thresh, i) => {
    const scale = smooth(clamp((t - thresh) / 0.15));
    const y = 318 - 150 * thresh;
    return svgEl(
      "g",
      { transform: `translate(200 ${y}) scale(${scale})` },
      svgEl("ellipse", { cx: "-30", cy: "-6", rx: "30", ry: "11", transform: "rotate(-22 -30 -6)", fill: i % 2 ? "#6b6a3a" : "#7e7d4b" }),
      svgEl("ellipse", { cx: "30", cy: "-6", rx: "30", ry: "11", transform: "rotate(22 30 -6)", fill: i % 2 ? "#7e7d4b" : "#6b6a3a" })
    );
  });
  const drops = [0, 1, 2].map((i) => {
    const p = (t * 2.2 + i / 3) % 1;
    return svgEl("path", {
      d: "M0 -7c5 7 5 11 0 13c-5-2-5-6 0-13z",
      transform: `translate(${130 + i * 70} ${150 + p * 120})`,
      fill: "#7aa6c2",
      opacity: String(0.8 * (1 - p)),
    });
  });

  return svgEl(
    "g",
    null,
    svgEl("circle", { cx: "320", cy: "70", r: "26", fill: "#e8d9a8" }),
    svgEl("path", { d: "M50 345 Q200 285 350 345 Z", fill: "#5a3a24" }),
    svgEl("path", { d: "M50 345 Q200 285 350 345", stroke: INK, "stroke-width": "3", fill: "none" }),
    svgEl("path", { d: `M200 318 L200 ${318 - stemHeight}`, stroke: OLIVE, "stroke-width": "7", "stroke-linecap": "round" }),
    ...leaves,
    ...drops
  );
}

// 2. Panen petik merah
function stageHarvest(t) {
  const cherryColor = mixColor("#7a9a3a", "#b3402c", t * 1.7);
  const fall = smooth(clamp((t - 0.65) / 0.35));
  const cherries = [[110, 150], [165, 168], [225, 150], [280, 172], [330, 148]].map(([bx, by], i) => {
    const cy = by + fall * (300 - by) + (i % 2) * fall * 12;
    const cx = bx + fall * (i - 2) * 6;
    return svgEl(
      "g",
      null,
      fall < 0.05 ? svgEl("path", { d: `M${bx} ${by - 38 + (i % 2) * 8} L${bx} ${by - 14}`, stroke: OLIVE, "stroke-width": "3" }) : null,
      svgEl("circle", { cx: String(cx), cy: String(cy), r: "17", fill: cherryColor }),
      svgEl("circle", { cx: String(cx - 5), cy: String(cy - 5), r: "4", fill: "#ffffff55" })
    );
  });

  return svgEl(
    "g",
    null,
    svgEl("path", { d: "M20 110 Q200 150 390 100", stroke: OLIVE, "stroke-width": "8", fill: "none", "stroke-linecap": "round" }),
    svgEl("path", { d: "M60 118 Q80 80 120 92 Q100 120 60 118z M250 128 Q280 90 320 104 Q300 132 250 128z", fill: "#6b6a3a" }),
    ...cherries,
    svgEl("path", { d: "M95 300 H305 L285 370 H115 Z", fill: "#a8946d" }),
    svgEl("path", { d: "M100 318 H300 M105 338 H295 M112 356 H288", stroke: "#8d7a55", "stroke-width": "3" }),
    svgEl("path", { d: "M95 300 Q200 280 305 300", stroke: "#8d7a55", "stroke-width": "6", fill: "none" })
  );
}

// 3. Kupas dan fermentasi
function stagePulping(t) {
  const e = smooth(t);
  const splashes = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const angle = (i / 7) * Math.PI * 2;
    const radius = 40 + e * 120;
    return svgEl("circle", {
      cx: String(Math.cos(angle) * radius),
      cy: String(Math.sin(angle) * radius * 0.8),
      r: String(9 * (1 - e * 0.5)),
      fill: "#b3402c",
      opacity: String(clamp(e * 3) * (1 - clamp((e - 0.7) / 0.3))),
    });
  });

  return svgEl(
    "g",
    null,
    svgEl(
      "g",
      { transform: "translate(200 210)" },
      svgEl("ellipse", { cx: "-22", cy: "0", rx: "26", ry: "38", transform: "rotate(-8)", fill: "#e0d2b4", opacity: String(clamp(e * 2)) }),
      svgEl("ellipse", { cx: "22", cy: "0", rx: "26", ry: "38", transform: "rotate(8)", fill: "#d6c6a6", opacity: String(clamp(e * 2)) }),
      svgEl("path", {
        d: "M-22 -28c6 12 -4 40 2 56M22 -28c-5 12 5 40 -1 56",
        stroke: "#a8946d",
        "stroke-width": "3",
        fill: "none",
        "stroke-linecap": "round",
        opacity: String(clamp(e * 2)),
      }),
      svgEl(
        "g",
        { transform: `scale(${1 + e * 0.25})`, opacity: String(1 - clamp(e * 1.6)) },
        svgEl("circle", { r: "78", fill: "#b3402c" }),
        svgEl("circle", { cx: "-22", cy: "-24", r: "12", fill: "#ffffff44" })
      ),
      ...splashes
    ),
    svgEl(
      "text",
      {
        x: "200",
        y: "360",
        "text-anchor": "middle",
        "font-size": "15",
        fill: OLIVE,
        opacity: String(clamp((t - 0.6) / 0.3)),
        "font-family": "Figtree, sans-serif",
        "font-weight": "600",
      },
      "Biji terbungkus kulit tanduk"
    )
  );
}

// 4. Jemur
function stageDrying(t) {
  const sunX = 60 + 280 * t;
  const sunY = 130 - 70 * Math.sin(Math.PI * t);
  const rays = Array.from({ length: 10 }, (_, i) =>
    svgEl("line", {
      x1: String(sunX + Math.cos(i * 0.628) * 42),
      y1: String(sunY + Math.sin(i * 0.628) * 42),
      x2: String(sunX + Math.cos(i * 0.628) * 54),
      y2: String(sunY + Math.sin(i * 0.628) * 54),
      stroke: "#f1d77a",
      "stroke-width": "4",
      "stroke-linecap": "round",
    })
  );
  const beans = Array.from({ length: 30 }, (_, i) => {
    const x = 82 + (i % 10) * 26;
    const y = 252 + Math.floor(i / 10) * 9;
    const r = (i * 37) % 180;
    return svgEl("ellipse", {
      cx: String(x),
      cy: String(y),
      rx: "9",
      ry: "6",
      transform: `rotate(${r} ${x} ${y})`,
      fill: mixColor("#cbb98f", "#e6dac0", t),
      stroke: "#a8946d",
      "stroke-width": "1",
    });
  });
  const vapors = [0, 1, 2].map((i) => {
    const p = (t * 3 + i / 3) % 1;
    return svgEl("path", {
      d: `M${130 + i * 70} ${236 - p * 40} q8 -8 0 -16 q-8 -8 0 -16`,
      stroke: "#7aa6c2",
      "stroke-width": "3",
      fill: "none",
      "stroke-linecap": "round",
      opacity: String((1 - p) * (1 - t)),
    });
  });

  return svgEl(
    "g",
    null,
    svgEl("circle", { cx: String(sunX), cy: String(sunY), r: "34", fill: "#f1d77a" }),
    ...rays,
    svgEl("rect", { x: "62", y: "262", width: "276", height: "12", rx: "3", fill: "#a8946d" }),
    svgEl("path", { d: "M80 274 V340 M320 274 V340 M80 300 H320", stroke: "#8d7a55", "stroke-width": "5" }),
    ...beans,
    ...vapors,
    svgEl(
      "text",
      { x: "200", y: "372", "text-anchor": "middle", "font-size": "15", fill: OLIVE, "font-family": "Figtree, sans-serif", "font-weight": "600" },
      `Kadar air ${Math.round(55 - 43 * t)}%`
    )
  );
}

// 5. Sortir biji hijau
function stageSorting(t) {
  const rollers = [50, 90, 130, 170, 210, 250, 290].map((x) =>
    svgEl("circle", { cx: String(x - ((t * 120) % 40)), cy: "270", r: "3", fill: "#77543a" })
  );
  const items = Array.from({ length: 7 }, (_, i) => {
    const bad = i === 2 || i === 5;
    const x = 40 + ((i / 7 + t * 0.9) % 1) * 280;
    const drop = bad ? Math.max(0, x - 262) : 0;
    const y = 248 + drop * 1.9;
    return beanShape(x + drop * 0.3, y, bad ? 50 + drop * 3 : -20, bad ? "#4a3a2a" : "#8b9a5b", 0.9);
  });

  return svgEl(
    "g",
    null,
    svgEl("rect", { x: "30", y: "262", width: "270", height: "16", rx: "8", fill: INK }),
    ...rollers,
    svgEl("circle", { cx: "40", cy: "270", r: "15", fill: "#5a3a24" }),
    svgEl("circle", { cx: "292", cy: "270", r: "15", fill: "#5a3a24" }),
    svgEl("path", { d: "M318 300 H388 L378 372 H328 Z", fill: "#a8946d" }),
    ...items,
    svgEl(
      "text",
      { x: "200", y: "372", "text-anchor": "middle", "font-size": "15", fill: OLIVE, "font-family": "Figtree, sans-serif", "font-weight": "600" },
      "Biji cacat disisihkan"
    )
  );
}

// 6. Cupping
function stageCupping(t) {
  const xs = [70, 150, 230, 310];
  const scores = ["85,5", "87", "84", "88,5"];
  const spoonX = 70 + 240 * smooth(t);

  const cups = xs.map((x, i) => {
    const op = clamp((t - i * 0.22 - 0.1) / 0.12);
    return svgEl(
      "g",
      null,
      svgEl("path", { d: `M${x - 34} 240 H${x + 34} Q${x + 30} 292 ${x} 292 Q${x - 30} 292 ${x - 34} 240z`, fill: "#fff", stroke: "#b7a693", "stroke-width": "3" }),
      svgEl("ellipse", { cx: String(x), cy: "240", rx: "34", ry: "8", fill: "#5a3a24" }),
      svgEl("path", { className: "steam", d: `M${x - 8} 220 q6 -10 0 -20`, stroke: "#b7a693", "stroke-width": "3", fill: "none", "stroke-linecap": "round", style: { animationDelay: `${i * 0.4}s` } }),
      svgEl(
        "text",
        { x: String(x), y: "330", "text-anchor": "middle", "font-size": "20", "font-family": "'Young Serif', serif", fill: INK, opacity: String(op), transform: `translate(0 ${(1 - op) * 10})` },
        scores[i]
      )
    );
  });

  return svgEl(
    "g",
    null,
    ...cups,
    svgEl(
      "g",
      { transform: `translate(${spoonX} ${176 + Math.sin(t * 24) * 6}) rotate(-12)` },
      svgEl("line", { x1: "0", y1: "0", x2: "48", y2: "-52", stroke: "#b7a693", "stroke-width": "6", "stroke-linecap": "round" }),
      svgEl("ellipse", { cx: "0", cy: "4", rx: "17", ry: "10", fill: "#cfc2ae", stroke: "#b7a693", "stroke-width": "3" })
    ),
    svgEl(
      "text",
      { x: "200", y: "372", "text-anchor": "middle", "font-size": "15", fill: OLIVE, "font-family": "Figtree, sans-serif", "font-weight": "600" },
      "Skor cupping"
    )
  );
}

// 7. Sangrai
function stageRoasting(t) {
  const color = t < 0.55 ? mixColor("#8b9a5b", "#b8944f", t / 0.55) : mixColor("#b8944f", INK, (t - 0.55) / 0.45);
  const spin = t * 720;

  return svgEl(
    "g",
    null,
    svgEl("circle", { cx: "200", cy: "190", r: "108", fill: "#e4dbce", stroke: "#b7a693", "stroke-width": "6" }),
    svgEl("circle", { cx: "200", cy: "190", r: "92", fill: "#f4f1ea" }),
    svgEl(
      "g",
      { transform: `rotate(${spin} 200 190)` },
      ...[0, 1, 2, 3].map((i) =>
        svgEl("rect", { x: "194", y: "102", width: "12", height: "46", rx: "5", fill: "#b7a693", transform: `rotate(${i * 90} 200 190)` })
      ),
      ...Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return beanShape(200 + Math.cos(a) * 62, 190 + Math.sin(a) * 62, (a * 180) / Math.PI + 40, color, 0.8);
      })
    ),
    svgEl(
      "text",
      { x: "200", y: "198", "text-anchor": "middle", "font-size": "30", "font-family": "'Young Serif', serif", fill: INK },
      `${Math.round(25 + 185 * t)}°C`
    ),
    svgEl(
      "g",
      { transform: "translate(200 332)" },
      ...[-34, 0, 34].map((x, i) =>
        svgEl("path", {
          className: "flame",
          d: "M0 0c-14 -16 -6 -30 0 -44c6 14 14 28 0 44z",
          transform: `translate(${x} 0)`,
          fill: i === 1 ? "#e08a2c" : "#c4533a",
          style: { animationDelay: `${i * 0.2}s` },
        })
      )
    ),
    svgEl(
      "text",
      { x: "200", y: "378", "text-anchor": "middle", "font-size": "15", fill: OLIVE, "font-family": "Figtree, sans-serif", "font-weight": "600" },
      `${Math.round(2 + 11 * t)} menit`
    )
  );
}

// 8. Istirahat dan kemas
function stagePackaging(t) {
  const fill = smooth(clamp(t / 0.8));
  const falling = t < 0.85;
  const beans = falling
    ? Array.from({ length: 9 }, (_, i) => {
        const p = (t * 2.6 + i / 9) % 1;
        return beanShape(170 + ((i * 29) % 60), 20 + p * 190, i * 40 + p * 200, i % 3 ? "#5a3a24" : INK, 0.8);
      })
    : [];

  return svgEl(
    "g",
    null,
    svgEl("defs", null, svgEl("clipPath", { id: "procBagClip" }, svgEl("path", { d: "M120 150 H280 L292 360 H108 Z" }))),
    svgEl("path", { d: "M120 150 H280 L292 360 H108 Z", fill: "#f4f1ea", stroke: "#b7a693", "stroke-width": "3" }),
    svgEl(
      "g",
      { "clip-path": "url(#procBagClip)" },
      svgEl("rect", { x: "100", y: String(360 - 200 * fill), width: "200", height: String(200 * fill), fill: INK }),
      svgEl("ellipse", { cx: "200", cy: String(360 - 200 * fill), rx: "100", ry: "8", fill: "#5a3a24" })
    ),
    svgEl("rect", { x: "140", y: "226", width: "120", height: "86", rx: "8", fill: "#fff", opacity: "0.94" }),
    svgEl("text", { x: "200", y: "262", "text-anchor": "middle", "font-size": "15", "font-weight": "700", fill: INK, "font-family": "Figtree, sans-serif" }, "KupiLab Aceh"),
    svgEl("text", { x: "200", y: "288", "text-anchor": "middle", "font-size": "22", fill: OLIVE, "font-family": "'Young Serif', serif" }, "200 g"),
    svgEl("rect", { x: "120", y: String(150 - 26 * smooth(clamp((t - 0.85) / 0.15))), width: "160", height: "14", rx: "3", fill: OLIVE, opacity: String(clamp((t - 0.8) / 0.1)) }),
    ...beans
  );
}

// 9. Giling dan seduh
function stageBrewing(t) {
  const liquidH = 70 * smooth(t);
  const drips = [0, 1, 2].map((i) => {
    const p = (t * 3 + i / 3) % 1;
    return svgEl("circle", { cx: "200", cy: String(262 + p * 52), r: "4", fill: "#5a3a24", opacity: String(1 - p * 0.5) });
  });

  return svgEl(
    "g",
    null,
    svgEl(
      "g",
      { transform: "translate(300 80) rotate(-28)" },
      svgEl("path", { d: "M-50 0 H30 Q40 0 40 14 V56 Q40 70 26 70 H-44 Q-58 70 -58 56 V14 Q-58 0 -50 0z", fill: "#b7a693" }),
      svgEl("path", { d: "M-58 22 Q-86 22 -80 50 Q-72 64 -58 58", stroke: "#b7a693", "stroke-width": "9", fill: "none" }),
      svgEl("path", { d: "M40 14 L70 -8 L74 -2 L44 28z", fill: "#b7a693" })
    ),
    svgEl("path", { className: "flow", d: "M256 118 Q240 150 202 190", stroke: "#8fb6cc", "stroke-width": "5", fill: "none", "stroke-linecap": "round", "stroke-dasharray": "6 8" }),
    svgEl("path", { d: "M140 196 H260 L226 252 H174 Z", fill: "#c4533a" }),
    svgEl("ellipse", { cx: "200", cy: "196", rx: "60", ry: "8", fill: "#e08a6a" }),
    svgEl("ellipse", { cx: "200", cy: "197", rx: "48", ry: "5", fill: mixColor("#7a4c2c", INK, t) }),
    svgEl("rect", { x: "150", y: "254", width: "100", height: "6", rx: "3", fill: "#b7a693" }),
    ...drips,
    svgEl("defs", null, svgEl("clipPath", { id: "procCupClip" }, svgEl("path", { d: "M154 302 H246 Q246 364 200 364 Q154 364 154 302z" }))),
    svgEl("path", { d: "M152 300 H248 Q248 366 200 366 Q152 366 152 300z", fill: "#fff", stroke: "#b7a693", "stroke-width": "3" }),
    svgEl("rect", { x: "150", y: String(364 - liquidH), width: "100", height: String(liquidH), fill: "#4a2e1c", "clip-path": "url(#procCupClip)" }),
    svgEl("path", { d: "M248 312 Q282 312 276 338 Q270 352 244 348", stroke: "#b7a693", "stroke-width": "8", fill: "none" }),
    svgEl("path", { className: "steam", d: "M186 290 q8 -12 0 -24", stroke: "#b7a693", "stroke-width": "3", fill: "none", "stroke-linecap": "round", opacity: String(clamp(t * 2)) }),
    svgEl("path", { className: "steam", d: "M214 290 q8 -12 0 -24", stroke: "#b7a693", "stroke-width": "3", fill: "none", "stroke-linecap": "round", opacity: String(clamp(t * 2)), style: { animationDelay: ".7s" } })
  );
}

const STAGE_RENDERERS = [
  stagePlanting,
  stageHarvest,
  stagePulping,
  stageDrying,
  stageSorting,
  stageCupping,
  stageRoasting,
  stagePackaging,
  stageBrewing,
];

export const PROCESS_STAGES = [
  {
    who: "Petani",
    title: "Menanam",
    time: "2 - 4 tahun sampai berbuah",
    text: "Bibit disemai lalu ditanam di bawah pohon penaung. Petani memangkas, memupuk, dan menjaga tanaman dari hama. Pohon kopi baru produktif setelah beberapa tahun.",
  },
  {
    who: "Petani",
    title: "Panen petik merah",
    time: "Beberapa bulan per musim",
    text: "Hanya buah merah matang yang dipetik tangan, bertahap. Buah hijau menghasilkan rasa sepat, jadi pohon yang sama didatangi beberapa kali.",
  },
  {
    who: "Pengolah",
    title: "Kupas dan fermentasi",
    time: "12 - 72 jam",
    text: "Kulit buah dikupas (washed) atau dibiarkan utuh (natural). Biji difermentasi sebentar untuk melepas lendir. Tahap ini banyak menentukan rasa akhir.",
  },
  {
    who: "Pengolah",
    title: "Jemur",
    time: "2 - 4 minggu",
    text: "Biji dijemur di para-para dan dibalik rutin sampai kadar airnya sekitar 11-12%. Terlalu basah akan berjamur, terlalu kering mudah pecah.",
  },
  {
    who: "Eksportir dan roaster",
    title: "Sortir biji hijau",
    time: "Beberapa hari",
    text: "Kulit tanduk dikupas hingga tersisa biji hijau. Biji cacat, pecah, atau berbintik disisihkan lewat mesin dan tangan.",
  },
  {
    who: "Roaster",
    title: "Cupping",
    time: "Per lot",
    text: "Sampel disangrai ringan dan dicicipi bersama untuk menilai aroma, asam, body, dan aftertaste. Dari skor inilah roaster memilih lot yang dibeli.",
  },
  {
    who: "Roaster",
    title: "Sangrai",
    time: "9 - 14 menit per batch",
    text: "Biji dipanaskan sampai berubah warna dan mengembang. Light roast menjaga karakter asal, dark roast menonjolkan pahit dan karamel. Tiap batch kami catat.",
  },
  {
    who: "Roaster",
    title: "Istirahat dan kemas",
    time: "3 - 7 hari",
    text: "Setelah sangrai biji melepas gas CO₂. Dibiarkan beberapa hari, lalu dikemas dalam kantong berkatup supaya tetap segar sampai ke tanganmu.",
  },
  {
    who: "Kamu",
    title: "Giling dan seduh",
    time: "Beberapa menit",
    text: "Giling sesaat sebelum seduh, timbang kopinya, atur suhu air. Pakai kalkulator seduh kami untuk rasio V60, sanger, French press, atau cold brew.",
  },
];

export function ProcessStageSvg({ index, t = 1 }) {
  const renderer = STAGE_RENDERERS[index] || STAGE_RENDERERS[0];
  return svgEl(
    "svg",
    {
      viewBox: "0 0 400 400",
      className: "h-full w-full",
      role: "img",
      "aria-label": `Ilustrasi tahap ${index + 1} dari 9: ${PROCESS_STAGES[index]?.title || ""}`,
    },
    renderer(clamp(t))
  );
}
