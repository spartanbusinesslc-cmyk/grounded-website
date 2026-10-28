/* ============================================
   GROUNDED — Shared Script (nav only)
   ---------------------------------------------
   Cart logic lives in cart.js. This file just
   handles the mobile nav toggle.
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("nav-links-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
});

// Open at the purchase box when arriving via a #buy link (re-run after images settle the layout)
if (location.hash === "#buy") {
  const toBuy = () => document.getElementById("buy")?.scrollIntoView({ block: "start" });
  window.addEventListener("load", () => { toBuy(); setTimeout(toBuy, 400); });
}
