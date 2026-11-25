import "./styles/main.css";
import { el, clearNode } from "./utils/dom.js";
import { observeReveals } from "./utils/reveal.js";
import { store } from "./store/appStore.js";
import { currentPath, initRouterLinks, matchRoute, onRouteChange } from "./router.js";
import { createHeader } from "./components/header.js";
import { createFooter } from "./components/footer.js";
import { closeCartDrawer } from "./components/cartDrawer.js";
import { HomePage } from "./pages/home.js";
import { ShopPage } from "./pages/shop.js";
import { ProductDetailPage } from "./pages/productDetail.js";
import { CartPage } from "./pages/cart.js";
import { KnowCoffeePage } from "./pages/knowCoffee.js";
import { ProcessPage } from "./pages/process.js";
import { CalculatorPage } from "./pages/calculator.js";
import { JournalPage } from "./pages/journal.js";
import { ArticleDetailPage } from "./pages/articleDetail.js";
import { AboutPage } from "./pages/about.js";
import { LoginPage, RegisterPage } from "./pages/auth.js";
import { AccountPage } from "./pages/account.js";
import { CheckoutPage } from "./pages/checkout.js";
import { OrderDetailPage } from "./pages/orderDetail.js";
import { AdminLoginPage } from "./pages/adminLogin.js";
import { AdminPage } from "./pages/admin.js";
import { NotFoundPage } from "./pages/notFound.js";

const ROUTES = [
  { path: "/", title: "Beranda", render: () => HomePage() },
  { path: "/toko", title: "Toko", render: () => ShopPage() },
  { path: "/produk/:id", title: "Detail Produk", render: (p) => ProductDetailPage(p) },
  { path: "/keranjang", title: "Keranjang", render: () => CartPage() },
  { path: "/kenali-kopi", title: "Kenali Kopi Indonesia", render: () => KnowCoffeePage() },
  { path: "/proses", title: "Dari Petani ke Cangkir", render: () => ProcessPage() },
  { path: "/kalkulator", title: "Kalkulator Seduh", render: () => CalculatorPage() },
  { path: "/jurnal", title: "Jurnal Seduh", render: () => JournalPage() },
  { path: "/jurnal/:slug", title: "Artikel", render: (p) => ArticleDetailPage(p) },
  { path: "/tentang", title: "Tentang Roastery", render: () => AboutPage() },
  { path: "/masuk", title: "Masuk Pembeli", render: () => LoginPage() },
  { path: "/daftar", title: "Buat Akun", render: () => RegisterPage() },
  { path: "/akun", title: "Akun Pembeli", render: () => AccountPage() },
  { path: "/checkout", title: "Checkout", render: () => CheckoutPage() },
  { path: "/pesanan/:id", title: "Rincian Pesanan", render: (p) => OrderDetailPage(p) },
  { path: "/admin/login", title: "Masuk Pemilik Toko", standalone: true, render: () => AdminLoginPage() },
  { path: "/admin", title: "Portal Pengelola", standalone: true, render: () => AdminPage() },
  { path: "*", title: "Halaman Tidak Ditemukan", render: () => NotFoundPage() },
];

const root = document.getElementById("app");
let activeCleanup = null;
let stopRevealObserver = null;
let activeHeader = null;

function setDocumentTitle(entryTitle) {
  document.title = entryTitle && entryTitle !== "Beranda" ? `${entryTitle} — KupiLab Aceh` : "KupiLab Aceh — Biji Kopi Nusantara";
}

function renderLoadingState() {
  clearNode(root);
  root.appendChild(
    el(
      "div",
      { className: "flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 text-center" },
      el("p", { className: "font-display text-3xl text-espresso-700" }, "KupiLab Aceh"),
      el("p", { className: "mt-2 text-sm text-espresso-400" }, "Menyiapkan katalog roastery…")
    )
  );
}

function renderErrorState(message) {
  clearNode(root);
  root.appendChild(
    el(
      "div",
      { className: "flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 text-center" },
      el("h1", { className: "text-2xl text-espresso-700" }, "Gagal memuat roastery"),
      el("p", { className: "mt-2 max-w-md text-sm text-espresso-500" }, message),
      el(
        "button",
        {
          type: "button",
          className: "btn-primary mt-6",
          onClick: () => {
            renderLoadingState();
            store.init().then(renderCurrentRoute);
          },
        },
        "Coba lagi"
      )
    )
  );
}

function renderCurrentRoute() {
  if (store.loading) {
    renderLoadingState();
    return;
  }
  if (store.loadError) {
    renderErrorState(store.loadError);
    return;
  }

  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
  if (stopRevealObserver) {
    stopRevealObserver();
    stopRevealObserver = null;
  }
  activeHeader = null;

  const pathname = currentPath();
  const matched = matchRoute(ROUTES, pathname);
  const { entry, params } = matched;

  setDocumentTitle(entry.title);
  const pageResult = entry.render(params);
  const pageNode = pageResult instanceof Node ? pageResult : pageResult.element;
  if (pageResult && typeof pageResult.cleanup === "function") {
    activeCleanup = pageResult.cleanup;
  }

  clearNode(root);

  if (entry.standalone) {
    root.appendChild(pageNode);
  } else {
    const header = createHeader(pathname);
    activeHeader = header;
    const shell = el(
      "div",
      { className: "flex min-h-screen flex-col" },
      el(
        "a",
        {
          href: "#konten",
          className: "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-espresso-700 focus:px-4 focus:py-2 focus:text-sm focus:text-white",
        },
        "Loncat ke konten"
      ),
      header.element,
      el("main", { id: "konten", className: "flex-1" }, pageNode),
      createFooter()
    );
    root.appendChild(shell);
  }

  stopRevealObserver = observeReveals(root);
}

initRouterLinks();
onRouteChange(() => {
  closeCartDrawer();
  renderCurrentRoute();
});

store.subscribe((_s, reason) => {
  if (reason === "cart" && activeHeader) {
    activeHeader.syncCartBadge();
  } else if (reason === "auth") {
    renderCurrentRoute();
  }
});

renderLoadingState();
store.init().then(renderCurrentRoute);
