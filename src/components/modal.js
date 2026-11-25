import { el } from "../utils/dom.js";

export function confirmDialog({ title, message, confirmLabel = "Ya, lanjutkan", cancelLabel = "Batal", danger = false }) {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const cleanup = (result) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      if (previousFocus) previousFocus.focus();
      resolve(result);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cleanup(false);
      }
    };

    const cancelBtn = el(
      "button",
      {
        type: "button",
        className: "btn-ghost",
        onClick: () => cleanup(false),
      },
      cancelLabel
    );

    const confirmBtn = el(
      "button",
      {
        type: "button",
        className: danger ? "btn-danger" : "btn-primary",
        onClick: () => cleanup(true),
      },
      confirmLabel
    );

    const overlay = el(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/50 p-4 backdrop-blur-sm",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "confirm-dialog-title",
        onClick: (e) => {
          if (e.target === overlay) cleanup(false);
        },
      },
      el(
        "div",
        { className: "pop-in w-full max-w-md rounded-3xl border border-espresso-100 bg-white p-6 shadow-2xl" },
        el("h2", { id: "confirm-dialog-title", className: "text-xl text-espresso-800" }, title),
        el("p", { className: "mt-2 text-sm leading-relaxed text-espresso-500" }, message),
        el("div", { className: "mt-6 flex flex-wrap justify-end gap-3" }, cancelBtn, confirmBtn)
      )
    );

    document.addEventListener("keydown", onKeyDown);
    document.body.appendChild(overlay);
    cancelBtn.focus();
  });
}

let toastTimer = null;

export function showToast(message, options = null) {
  const existing = document.getElementById("kupilab-toast");
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const actionBtn =
    options && options.actionLabel && typeof options.onAction === "function"
      ? el(
          "button",
          {
            type: "button",
            className:
              "shrink-0 rounded-full bg-terra-500 px-3 py-1 text-xs font-semibold text-cream-50 transition hover:bg-terra-400",
            onClick: () => {
              const node = document.getElementById("kupilab-toast");
              if (node) node.remove();
              options.onAction();
            },
          },
          options.actionLabel
        )
      : null;

  const toast = el(
    "div",
    {
      id: "kupilab-toast",
      role: "status",
      "aria-live": "polite",
      className:
        "pop-in fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-espresso-200 bg-espresso-800 px-5 py-3 text-sm font-medium text-cream-50 shadow-xl",
    },
    el("span", { className: "leading-snug" }, message),
    actionBtn
  );

  document.body.appendChild(toast);
  toastTimer = setTimeout(() => {
    toast.remove();
  }, options?.actionLabel ? 3800 : 2600);
}
