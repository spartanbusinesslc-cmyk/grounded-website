/* ============================================
   EARTHED — Soap Bundle Scent Picker Modal
   ---------------------------------------------
   When a customer adds the soap bundle, a modal
   asks them to pick 3 scents. Their selections
   are stored as cart notes (display only).
   Stripe is charged the bundle price ID only.
   ============================================ */

const SCENT_OPTIONS = [
  { id: "soapUnscented",       label: "Raw Milk — Plain" },
  { id: "soapCitrusLavender",  label: "Raw Milk — Citrus & Lavender" },
  { id: "soapMintTeaTree",     label: "Raw Milk — Mint & Tea Tree" },
  { id: "oliveUnscented",      label: "Olive Oil — Plain" },
  { id: "oliveCitrusLavender", label: "Olive Oil — Citrus & Lavender" },
  { id: "oliveMintTeaTree",    label: "Olive Oil — Mint & Tea Tree" },
];

function buildScentSelect(label) {
  const id = "scent-" + Math.random().toString(36).slice(2);
  const opts = SCENT_OPTIONS.map(s =>
    `<option value="${s.id}">${s.label}</option>`
  ).join("");
  return `
    <div class="bm-row">
      <label for="${id}" class="bm-label">${label}</label>
      <select id="${id}" class="bm-select">${opts}</select>
    </div>`;
}

function openBundleModal(bundleId) {
  const overlay = document.getElementById("bundle-modal-overlay");
  const modal   = document.getElementById("bundle-modal");
  if (!overlay || !modal) return;

  modal.dataset.bundleId = bundleId;
  const isSub = bundleId.startsWith("sub");
  const is3m = bundleId.endsWith("3m");
  const isEssentials = bundleId.includes("ssentials");
  const billingLabel = is3m ? "/ 3 months" : "/mo";
  const body = modal.querySelector(".bm-body");

  if (isEssentials) {
    const price = isSub ? `£32.99 ${billingLabel}` : "£39.99";
    modal.querySelector(".bm-title").textContent = "EARTHED Essentials Set";
    modal.querySelector(".bm-subtitle").textContent =
      "Choose your soap scent — balm & lip balm are included.";
    modal.querySelector(".bm-confirm").textContent = `Add to Cart — ${price}`;
    body.innerHTML = buildScentSelect("Your Soap");
  } else {
    const price = isSub ? `£19.99 ${billingLabel}` : "£24.99";
    modal.querySelector(".bm-title").textContent = "Build Your Soap 3-Pack";
    modal.querySelector(".bm-subtitle").textContent =
      "Pick your 3 bars — mix & match any scent.";
    modal.querySelector(".bm-confirm").textContent = `Add to Cart — ${price}`;
    body.innerHTML =
      buildScentSelect("Bar 1") +
      buildScentSelect("Bar 2") +
      buildScentSelect("Bar 3");
    const selects = body.querySelectorAll(".bm-select");
    if (selects[1]) selects[1].value = "soapCitrusLavender";
    if (selects[2]) selects[2].value = "soapMintTeaTree";
  }

  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeBundleModal() {
  const overlay = document.getElementById("bundle-modal-overlay");
  if (overlay) overlay.hidden = true;
  document.body.style.overflow = "";
}

function confirmBundleModal() {
  const modal    = document.getElementById("bundle-modal");
  const bundleId = modal.dataset.bundleId;
  const selects  = modal.querySelectorAll(".bm-select");
  const selections = Array.from(selects).map(s => s.value);

  // Add the bundle price ID to cart (what Stripe charges)
  addToCart(bundleId, 1);

  // Store selections in localStorage so cart/checkout can pass to Stripe
  const notes = JSON.parse(localStorage.getItem("earthed_bundle_notes") || "{}");
  const isEssentials = bundleId.includes("ssentials");
  if (isEssentials) {
    notes[bundleId] = [PRODUCTS[selections[0]]?.name || selections[0]];
  } else {
    notes[bundleId] = selections.map(id => PRODUCTS[id]?.name || id);
  }
  localStorage.setItem("earthed_bundle_notes", JSON.stringify(notes));

  closeBundleModal();
  openCart();
}

document.addEventListener("DOMContentLoaded", () => {
  // Wire up confirm & close buttons
  document.getElementById("bundle-modal-confirm")
    ?.addEventListener("click", confirmBundleModal);
  document.getElementById("bundle-modal-close")
    ?.addEventListener("click", closeBundleModal);
  document.getElementById("bundle-modal-overlay")
    ?.addEventListener("click", e => {
      if (e.target === e.currentTarget) closeBundleModal();
    });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeBundleModal();
  });

  // Subscribe & Save toggle — reveals Monthly / Every 3 months sub-options
  document.querySelectorAll(".bundle-sub-toggle").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wrap = btn.nextElementSibling;
      if (wrap && wrap.classList.contains("bundle-interval-wrap")) {
        wrap.hidden = !wrap.hidden;
      }
    });
  });

  // Wire bundle nudge dropdown buttons to open modal instead of direct addToCart
  document.querySelectorAll(".bundle-option[data-bundle-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.bundleModal;
      // Close whichever nudge dropdown this button lives in
      const drop = btn.closest(".bundle-nudge-dropdown");
      if (drop) {
        drop.hidden = true;
        const nudgeBtn = drop.closest(".bundle-nudge-wrap")?.querySelector(".bundle-nudge");
        if (nudgeBtn) nudgeBtn.setAttribute("aria-expanded", "false");
      }
      openBundleModal(id);
    });
  });
});

function closeBundleDropdown() {
  const nudgeBtn  = document.getElementById("bundle-nudge-btn");
  const nudgeDrop = document.getElementById("bundle-nudge-dropdown");
  if (nudgeBtn)  nudgeBtn.setAttribute("aria-expanded", "false");
  if (nudgeDrop) nudgeDrop.hidden = true;
}
