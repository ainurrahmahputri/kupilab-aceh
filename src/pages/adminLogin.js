import { el } from "../utils/dom.js";
import { navigate, routeLink } from "../router.js";
import { store } from "../store/appStore.js";
import { AccountTypeTabs } from "../components/accountTabs.js";

export function AdminLoginPage() {
  const bodySlot = el("div", null, el("p", { className: "text-sm text-espresso-400" }, "Memeriksa status pengelola…"));

  const renderForm = (status) => {
    if (status.authenticated) {
      navigate("/admin", { replace: true });
      return;
    }

    if (status.needsClaim) {
      const passInput = el("input", {
        id: "claim-pass",
        type: "password",
        className: "input",
        placeholder: "Minimal 8 karakter",
        autocomplete: "new-password",
        required: true,
      });
      const confirmInput = el("input", {
        id: "claim-confirm",
        type: "password",
        className: "input",
        placeholder: "Ulangi kata sandi",
        autocomplete: "new-password",
        required: true,
      });
      const errEl = el("p", { className: "alert-error hidden" });
      const submitBtn = el("button", { type: "submit", className: "btn-accent w-full" }, "Simpan kata sandi & masuk");

      bodySlot.replaceChildren(
        el("h1", { className: "text-2xl sm:text-3xl" }, "Siapkan kata sandi pengelola"),
        el(
          "p",
          { className: "mt-2 text-sm leading-relaxed text-espresso-500" },
          "Kata sandi pengelola belum diatur. Buat kata sandi satu kali untuk mengamankan halaman pemilik toko (atau atur ADMIN_PASSCODE di Secrets)."
        ),
        el(
          "form",
          {
            className: "mt-5 space-y-4",
            onSubmit: async (e) => {
              e.preventDefault();
              errEl.classList.add("hidden");
              const pw = passInput.value;
              const cf = confirmInput.value;
              if (pw.length < 8) {
                errEl.textContent = "Kata sandi minimal 8 karakter.";
                errEl.classList.remove("hidden");
                return;
              }
              if (pw !== cf) {
                errEl.textContent = "Konfirmasi kata sandi tidak cocok.";
                errEl.classList.remove("hidden");
                return;
              }
              submitBtn.disabled = true;
              submitBtn.textContent = "Menyimpan…";
              try {
                await store.claimAdminPassword(pw);
                navigate("/admin", { replace: true });
              } catch (err) {
                errEl.textContent = err.message || "Gagal menyimpan kata sandi.";
                errEl.classList.remove("hidden");
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan kata sandi & masuk";
              }
            },
          },
          errEl,
          el("div", null, el("label", { className: "label", htmlFor: "claim-pass" }, "Kata sandi pengelola baru"), passInput),
          el("div", null, el("label", { className: "label", htmlFor: "claim-confirm" }, "Ulangi kata sandi"), confirmInput),
          submitBtn
        )
      );
      return;
    }

    const passInput = el("input", {
      id: "admin-pass",
      type: "password",
      className: "input",
      placeholder: "Masukkan kata sandi pengelola",
      autocomplete: "current-password",
      required: true,
    });
    const errEl = el("p", { className: "alert-error hidden" });
    const submitBtn = el("button", { type: "submit", className: "btn-primary w-full" }, "Masuk ke halaman pengelola");

    bodySlot.replaceChildren(
      el("h1", { className: "text-3xl" }, "Pemilik toko"),
      el(
        "p",
        { className: "mt-2 text-sm text-espresso-500" },
        status.hasEnvPasscode
          ? "Masukkan passcode pengelola yang dikonfigurasi di server."
          : "Masukkan kata sandi pengelola roastery."
      ),
      el(
        "form",
        {
          className: "mt-5 space-y-4",
          onSubmit: async (e) => {
            e.preventDefault();
            errEl.classList.add("hidden");
            const pw = passInput.value;
            if (!pw) {
              errEl.textContent = "Kata sandi wajib diisi.";
              errEl.classList.remove("hidden");
              return;
            }
            submitBtn.disabled = true;
            submitBtn.textContent = "Memeriksa…";
            try {
              await store.loginAdmin(pw);
              navigate("/admin", { replace: true });
            } catch (err) {
              errEl.textContent = err.message || "Kata sandi salah.";
              errEl.classList.remove("hidden");
              submitBtn.disabled = false;
              submitBtn.textContent = "Masuk ke halaman pengelola";
            }
          },
        },
        errEl,
        el("div", null, el("label", { className: "label", htmlFor: "admin-pass" }, "Kata sandi"), passInput),
        submitBtn
      )
    );
  };

  store
    .fetchAdminStatus()
    .then(renderForm)
    .catch((err) => {
      bodySlot.replaceChildren(el("p", { className: "alert-error" }, err.message || "Gagal memeriksa status pengelola."));
    });

  return el(
    "div",
    { className: "page-in flex min-h-screen items-center justify-center bg-cream-100/70 p-4" },
    el(
      "div",
      { className: "card w-full max-w-md space-y-5 p-8 shadow-xl" },
      AccountTypeTabs({ active: "owner" }),
      bodySlot,
      el(
        "div",
        { className: "border-t border-espresso-100 pt-4 text-center" },
        routeLink("/", { className: "text-sm font-semibold text-espresso-500 hover:text-espresso-700" }, "← Kembali ke situs")
      )
    )
  );
}
