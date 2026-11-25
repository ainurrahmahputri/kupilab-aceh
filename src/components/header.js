import { el, svgEl } from "../utils/dom.js";
import { routeLink } from "../router.js";
import { BrandWordmark } from "./brand.js";
import { store } from "../store/appStore.js";
import { openCartDrawer } from "./cartDrawer.js";

const PRIMARY_NAV = [
  { to: "/toko", label: "Toko" },
  { to: "/kenali-kopi", label: "Kenali Kopi" },
  { to: "/proses", label: "Proses" },
  { to: "/kalkulator", label: "Kalkulator" },
  { to: "/jurnal", label: "Jurnal" },
];

const MOBILE_NAV = [
  { to: "/", label: "Beranda", end: true },
  ...PRIMARY_NAV,
  { to: "/tentang", label: "Tentang" },
];

export function createHeader(pathname) {
  let mobileOpen = false;
  let lastCount = store.cartCount;

  const isRouteActive = (to, end = false) =>
    end ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const mobileNav = el("nav", {
    className: "container-x hidden flex-col gap-1 pb-4 lg:hidden",
    "aria-label": "Navigasi seluler",
  });

  const menuBtnIcon = () =>
    mobileOpen
      ? svgEl(
          "svg",
          { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" },
          svgEl("path", { d: "M6 6l12 12M18 6L6 18" })
        )
      : svgEl(
          "svg",
          { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" },
          svgEl("path", { d: "M4 7h16M4 12h16M4 17h16" })
        );

  const menuBtn = el(
    "button",
    {
      type: "button",
      className:
        "flex h-10 w-10 items-center justify-center rounded-full border border-espresso-200 bg-white lg:hidden",
      "aria-label": "Buka menu",
      "aria-expanded": "false",
      onClick: () => {
        mobileOpen = !mobileOpen;
        mobileNav.classList.toggle("hidden", !mobileOpen);
        mobileNav.classList.toggle("flex", mobileOpen);
        menuBtn.setAttribute("aria-label", mobileOpen ? "Tutup menu" : "Buka menu");
        menuBtn.setAttribute("aria-expanded", String(mobileOpen));
        menuBtn.replaceChildren(menuBtnIcon());
      },
    },
    menuBtnIcon()
  );

  const closeMobile = () => {
    if (!mobileOpen) return;
    mobileOpen = false;
    mobileNav.classList.add("hidden");
    mobileNav.classList.remove("flex");
    menuBtn.setAttribute("aria-label", "Buka menu");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.replaceChildren(menuBtnIcon());
  };

  for (const item of MOBILE_NAV) {
    const active = isRouteActive(item.to, Boolean(item.end));
    mobileNav.appendChild(
      routeLink(
        item.to,
        {
          className: `rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition ${
            active ? "bg-espresso-700 text-cream-50" : "text-espresso-600 hover:bg-cream-200"
          }`,
          onClick: closeMobile,
        },
        item.label
      )
    );
  }

  mobileNav.appendChild(
    routeLink(
      store.customer ? "/akun" : "/masuk",
      {
        className:
          "mt-2 rounded-full border border-espresso-200 px-4 py-2 text-sm font-semibold text-espresso-700 whitespace-nowrap shrink-0",
        onClick: closeMobile,
      },
      store.customer ? `Akun saya (${store.customer.name.split(" ")[0]})` : "Masuk / daftar"
    )
  );

  const count = store.cartCount;
  const cartBadge = el(
    "span",
    {
      className: `absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terra-600 px-1 text-[11px] font-bold tabular-nums text-white ${
        count > 0 ? "" : "hidden"
      }`,
    },
    String(count)
  );

  const cartLink = el(
    "button",
    {
      type: "button",
      className:
        "relative flex h-10 w-10 items-center justify-center rounded-full border border-espresso-200 bg-white text-espresso-700 transition hover:border-espresso-700",
      "aria-label": `Keranjang, ${count} barang`,
      "aria-haspopup": "dialog",
      onClick: () => {
        closeMobile();
        openCartDrawer();
      },
    },
    svgEl(
      "svg",
      {
        viewBox: "0 0 24 24",
        className: "h-5 w-5",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.8",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      svgEl("path", { d: "M3 4h2l2.2 11h10.6L20 7H6.2" }),
      svgEl("circle", { cx: "9", cy: "19.5", r: "1.3" }),
      svgEl("circle", { cx: "17", cy: "19.5", r: "1.3" })
    ),
    cartBadge
  );

  const accountLink = routeLink(
    store.customer ? "/akun" : "/masuk",
    {
      onClick: closeMobile,
      className:
        "hidden h-10 items-center gap-2 rounded-full border border-espresso-200 bg-white px-4 text-sm font-semibold text-espresso-700 whitespace-nowrap shrink-0 transition hover:border-espresso-700 sm:inline-flex",
    },
    svgEl(
      "svg",
      {
        viewBox: "0 0 24 24",
        className: "h-4 w-4",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.8",
        "stroke-linecap": "round",
      },
      svgEl("circle", { cx: "12", cy: "8", r: "3.4" }),
      svgEl("path", { d: "M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2" })
    ),
    store.customer ? store.customer.name.split(" ")[0] : "Masuk"
  );

  // Strict 3-zone Top Bar Contract (gap-8): [Brand wordmark] — [5 single-line text links] — [Primary action zone]
  const desktopNav = el(
    "nav",
    { className: "hidden items-center gap-6 lg:flex", "aria-label": "Navigasi utama" },
    ...PRIMARY_NAV.map((item) => {
      const active = isRouteActive(item.to);
      return routeLink(
        item.to,
        {
          className: `whitespace-nowrap shrink-0 text-sm transition underline-offset-4 ${
            active
              ? "font-semibold text-espresso-800 underline"
              : "font-medium text-espresso-600 hover:text-espresso-800 hover:underline"
          }`,
        },
        item.label
      );
    })
  );

  const header = el(
    "header",
    { className: "sticky top-0 z-40 border-b border-espresso-100 bg-white/90 backdrop-blur-md" },
    el(
      "div",
      { className: "container-x flex h-16 items-center justify-between gap-8" },
      routeLink(
        "/",
        {
          onClick: closeMobile,
          "aria-label": "KupiLab Aceh, ke beranda",
          className: "shrink-0",
        },
        BrandWordmark({ light: false })
      ),
      desktopNav,
      el("div", { className: "flex items-center gap-2.5 shrink-0" }, accountLink, cartLink, menuBtn)
    ),
    mobileNav
  );

  const syncCartBadge = () => {
    const next = store.cartCount;
    cartBadge.textContent = String(next);
    cartBadge.classList.toggle("hidden", next === 0);
    cartLink.setAttribute("aria-label", `Keranjang, ${next} barang`);
    if (next > lastCount) {
      cartBadge.classList.remove("bump");
      void cartBadge.offsetWidth;
      cartBadge.classList.add("bump");
    }
    lastCount = next;
  };

  return { element: header, syncCartBadge };
}
