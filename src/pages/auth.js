import { el } from "../utils/dom.js";
import { navigate, routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { AccountTypeTabs } from "../components/accountTabs.js";

export function LoginPage() {
  if (store.customer) {
    queueMicrotask(() => navigate("/akun", { replace: true }));
  }

  const emailInput = el("input", {
    id: "login-email",
    type: "email",
    className: "input",
    placeholder: "nama@email.com",
    autocomplete: "email",
    required: true,
  });
  const passInput = el("input", {
    id: "login-pass",
    type: "password",
    className: "input",
    placeholder: "••••••",
    autocomplete: "current-password",
    required: true,
  });
  const errEl = el("p", { className: "alert-error hidden" });
  const submitBtn = el("button", { type: "submit", className: "btn-primary w-full" }, "Masuk");

  const form = el(
    "form",
    {
      className: "space-y-4",
      onSubmit: async (e) => {
        e.preventDefault();
        errEl.classList.add("hidden");
        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email || !password) {
          errEl.textContent = "Email dan kata sandi wajib diisi.";
          errEl.classList.remove("hidden");
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Memeriksa…";
        try {
          await store.loginCustomer(email, password);
          const target = store.cart.length > 0 ? "/checkout" : "/akun";
          navigate(target, { replace: true });
        } catch (err) {
          errEl.textContent = err.message || "Email atau kata sandi salah.";
          errEl.classList.remove("hidden");
          submitBtn.disabled = false;
          submitBtn.textContent = "Masuk";
        }
      },
    },
    errEl,
    el("div", null, el("label", { className: "label", htmlFor: "login-email" }, "Email"), emailInput),
    el("div", null, el("label", { className: "label", htmlFor: "login-pass" }, "Kata sandi"), passInput),
    submitBtn
  );

  return el(
    "div",
    { className: "page-in flex min-h-[75vh] items-center justify-center bg-cream-100/70 p-4 py-12" },
    el(
      "div",
      { className: "card w-full max-w-md space-y-5 p-8 shadow-xl" },
      AccountTypeTabs({ active: "buyer" }),
      el(
        "div",
        null,
        el("h1", { className: "text-3xl" }, "Masuk pembeli"),
        el("p", { className: "mt-2 text-sm text-espresso-500" }, "Masuk untuk menyelesaikan pesanan dan memantau pengirimanmu.")
      ),
      form,
      el(
        "p",
        { className: "text-center text-sm text-espresso-500" },
        "Belum punya akun? ",
        routeLink("/daftar", { className: "font-semibold text-terra-600 hover:underline" }, "Buat akun")
      )
    )
  );
}

export function RegisterPage() {
  if (store.customer) {
    queueMicrotask(() => navigate("/akun", { replace: true }));
  }

  const nameInput = el("input", {
    id: "reg-name",
    type: "text",
    className: "input",
    placeholder: "Misal: Rizki Pratama",
    autocomplete: "name",
    required: true,
  });
  const phoneInput = el("input", {
    id: "reg-phone",
    type: "tel",
    className: "input",
    placeholder: "0812xxxxxxxx",
    autocomplete: "tel",
    required: true,
  });
  const emailInput = el("input", {
    id: "reg-email",
    type: "email",
    className: "input",
    placeholder: "nama@email.com",
    autocomplete: "email",
    required: true,
  });
  const passInput = el("input", {
    id: "reg-pass",
    type: "password",
    className: "input",
    placeholder: "Minimal 6 karakter",
    autocomplete: "new-password",
    required: true,
  });
  const errEl = el("p", { className: "alert-error hidden" });
  const submitBtn = el("button", { type: "submit", className: "btn-primary w-full" }, "Buat akun");

  const form = el(
    "form",
    {
      className: "space-y-4",
      onSubmit: async (e) => {
        e.preventDefault();
        errEl.classList.add("hidden");
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const password = passInput.value;

        if (!name || !phone || !email || !password) {
          errEl.textContent = "Semua kolom wajib diisi.";
          errEl.classList.remove("hidden");
          return;
        }
        if (password.length < 6) {
          errEl.textContent = "Kata sandi minimal 6 karakter.";
          errEl.classList.remove("hidden");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Mendaftarkan…";
        try {
          await store.registerCustomer({ name, phone, email, password });
          const target = store.cart.length > 0 ? "/checkout" : "/akun";
          navigate(target, { replace: true });
        } catch (err) {
          errEl.textContent = err.message || "Gagal mendaftar.";
          errEl.classList.remove("hidden");
          submitBtn.disabled = false;
          submitBtn.textContent = "Buat akun";
        }
      },
    },
    errEl,
    el("div", null, el("label", { className: "label", htmlFor: "reg-name" }, "Nama lengkap"), nameInput),
    el("div", null, el("label", { className: "label", htmlFor: "reg-phone" }, "Nomor WhatsApp"), phoneInput),
    el("div", null, el("label", { className: "label", htmlFor: "reg-email" }, "Email"), emailInput),
    el("div", null, el("label", { className: "label", htmlFor: "reg-pass" }, "Kata sandi"), passInput),
    submitBtn
  );

  return el(
    "div",
    { className: "page-in flex min-h-[75vh] items-center justify-center bg-cream-100/70 p-4 py-12" },
    el(
      "div",
      { className: "card w-full max-w-md space-y-5 p-8 shadow-xl" },
      AccountTypeTabs({ active: "buyer" }),
      el(
        "div",
        null,
        el("h1", { className: "text-3xl" }, "Buat akun"),
        el("p", { className: "mt-2 text-sm text-espresso-500" }, "Simpan riwayat pesanan dan lacak pengiriman kapan saja.")
      ),
      form,
      el(
        "p",
        { className: "text-center text-sm text-espresso-500" },
        "Sudah punya akun? ",
        routeLink("/masuk", { className: "font-semibold text-terra-600 hover:underline" }, "Masuk")
      )
    )
  );
}
