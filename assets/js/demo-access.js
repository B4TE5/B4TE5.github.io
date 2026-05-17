// Password-gated live demo access.
// Constants are produced by scripts/encrypt-demos.mjs — never edit by hand.
// AES-GCM ciphertexts; PBKDF2-derived key. Wrong password = AES-GCM tag mismatch
// = unlockDemo() returns null.

(() => {
  "use strict";

  const ENCRYPTED_DEMOS = {
    salt: "IXoYtDceGdiwEt0F6pZqWA==",
    iterations: 100000,
    sayndex: {
      iv: "40l7im+tSxIslaME",
      ciphertext: "5784TCNQAE61AMoZ6TnTa/Q8dO8Fp6BRYsSQba/58mv4KNuwYBhWoj54KQ==",
    },
    trustforge: {
      iv: "8t4/sYlovSM2N3D9",
      ciphertext: "6zn2OHeqgOunc2i2EjdmJAAsMKeETUXAf6HxTrP1QYhD7aCI8nHnu6Do10K8ddBYbzzF7wI=",
    },
    clausulazo: {
      iv: "qAdSxQC/Xjne7zNr",
      ciphertext: "/wL8xiWZWFAzTotqguKrA3M8gNOB+AYbC/ZYwv7PoLcRou0sSmEKX+BJjc9przZV",
    },
  };

  const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  async function deriveKey(password, salt, iterations) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  }

  async function unlockDemo(projectKey, password) {
    const blob = ENCRYPTED_DEMOS[projectKey];
    if (!blob) return null;
    try {
      const salt = b64ToBytes(ENCRYPTED_DEMOS.salt);
      const iv = b64ToBytes(blob.iv);
      const ct = b64ToBytes(blob.ciphertext);
      const key = await deriveKey(password, salt, ENCRYPTED_DEMOS.iterations);
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      return new TextDecoder().decode(plain);
    } catch {
      return null;
    }
  }

  function initDemoAccessModal() {
    const modal = document.getElementById("demo-access-modal");
    if (!modal) return;
    const triggers = document.querySelectorAll("[data-demo]");
    if (!triggers.length) return;

    const form = modal.querySelector("[data-demo-modal-form]");
    const input = modal.querySelector("#demo-modal-password");
    const errorEl = modal.querySelector("[data-demo-modal-error]");
    const closers = modal.querySelectorAll("[data-demo-modal-close]");
    const submitBtn = modal.querySelector(".modal-submit");
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    let lastFocused = null;
    let currentProject = null;
    let inFlight = false;

    const open = (trigger) => {
      lastFocused = trigger;
      currentProject = trigger.dataset.demo;
      if (form) form.reset();
      if (errorEl) errorEl.hidden = true;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      }
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      window.setTimeout(() => input?.focus(), 30);
    };

    const close = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
      lastFocused = null;
      currentProject = null;
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => open(trigger));
    });
    closers.forEach((el) => {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(modal.querySelectorAll(focusableSelector))
          .filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (inFlight || !currentProject) return;
        const password = String(input?.value || "");
        if (!password) return;
        inFlight = true;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.setAttribute("aria-busy", "true");
        }
        if (errorEl) errorEl.hidden = true;
        const url = await unlockDemo(currentProject, password);
        inFlight = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
        }
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
          close();
        } else {
          if (errorEl) errorEl.hidden = false;
          input?.select();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDemoAccessModal, { once: true });
  } else {
    initDemoAccessModal();
  }
})();
