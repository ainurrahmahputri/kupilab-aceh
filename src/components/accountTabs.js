import { el } from "../utils/dom.js";
import { routeLink } from "../router.js";

export function AccountTypeTabs({ active }) {
  const linkClass = (isActive) =>
    `flex-1 rounded-full py-2 text-center text-sm font-semibold transition ${
      isActive ? "bg-white text-espresso-700 shadow-sm" : "text-espresso-500 hover:text-espresso-700"
    }`;

  return el(
    "div",
    { className: "flex rounded-full bg-cream-200 p-1" },
    routeLink("/masuk", { className: linkClass(active === "buyer") }, "Pembeli"),
    routeLink("/admin/login", { className: linkClass(active === "owner") }, "Pemilik toko")
  );
}
