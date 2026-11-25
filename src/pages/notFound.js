import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";

export function NotFoundPage() {
  return el(
    "div",
    { className: "container-x py-24 text-center" },
    el("p", { className: "eyebrow justify-center" }, "404"),
    el("h1", { className: "mt-3 text-4xl" }, "Halaman tidak ditemukan"),
    routeLink("/", { className: "btn-primary mt-6" }, "Kembali ke beranda")
  );
}
