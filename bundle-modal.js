/* ============================================
   EARTHED — Soap Bundle Scent Picker Modal
   ---------------------------------------------
   When a customer adds the soap bundle, a modal
   asks them to pick 3 scents. Their selections
   are stored as cart notes (display only).
   Stripe is charged the bundle price ID only.
   ============================================ */

const SCENT_OPTIONS = [
  { id: "soapUnscented",       label: "Raw Milk — Unscented" },
  { id: "soapCitrusLavender",  label: "Raw Milk — Citrus & Lavender" },
  { id: "soapMintTeaTree",     label: "Raw Milk — Mint & Tea Tree" },
  { id: "oliveUnscented",      label: "Olive Oil — Unscented" },
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
  // bundleId is either "soapBundle" or "subSoapBundle"
  const overlay = document.getElementById("bundle-modal-overlay");
  const modal   = document.getElementById("bundle-modal");
  if (!overlay || !modal) return;

  // Store which bundle to add
  modal.dataset.bundleId = bundleId;
  const isSub = bundleId.startsWith("sub");
  const price  = isSub ? "£19.99/mo" : "£24.99";

  modal.querySelector(".bm-title").textContent = "Build Your Soap Trio";
  modal.querySelector(".bm-subtitle").textContent =
    "Pick your 3 bars — mix & match any scent.";
  modal.querySelector(".bm-confirm").textContent =
    `Add to Cart — ${price}`;

  const body = modal.querySelector(".bm-body");
  body.innerHTML =
    buildScentSelect("Bar 1") +
    buildScentSelect("Bar 2") +
    buildScentSelect("Bar 3");

  // Default bar 2 & 3 to different scents so it looks intentional
  const selects = body.querySelectorAll(".bm-select");
  if (selects[1]) selects[1].value = "soapCitrusLavender";
  if (selects[2]) selects[2].value = "soapMintTeaTree";

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

  // Store selections in localStorage so cart can display them
  const notes = JSON.parse(localStorage.getItem("earthed_bundle_notes") || "{}");
  notes[bundleId] = selections.map(id => PRODUCTS[id]?.name || id);
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

  // Wire bundle nudge dropdown buttons to open modal instead of direct addToCart
  document.querySelectorAll(".bundle-option[data-bundle-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.bundleModal;
      closeBundleDropdown();
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
