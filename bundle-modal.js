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

// Scent menus: the real <select> stays in the page (so values and change events work as before),
// and a custom menu with colour dots is shown instead, because a native menu can't show colours.
function scentDotClass(id) {
  return /Unscented$/.test(id) ? "plain" : /Citrus/.test(id) ? "citrus" : "mint";
}

function enhanceScentSelect(select) {
  if (select.dataset.enhanced) return;
  select.dataset.enhanced = "1";
  select.classList.add("scent-native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const wrap = document.createElement("div");
  wrap.className = "scent-dd";
  wrap.innerHTML =
    '<button type="button" class="scent-dd-btn" aria-haspopup="listbox" aria-expanded="false">' +
      '<span class="pill-dot" aria-hidden="true"></span><span class="scent-dd-label"></span>' +
      '<svg class="scent-dd-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</button>' +
    '<ul class="scent-dd-list" role="listbox" hidden>' +
      Array.from(select.options).map(o =>
        '<li role="option" data-value="' + o.value + '"><span class="pill-dot ' + scentDotClass(o.value) + '" aria-hidden="true"></span>' + o.text + "</li>"
      ).join("") +
    "</ul>";
  select.insertAdjacentElement("afterend", wrap);

  const btn = wrap.querySelector(".scent-dd-btn");
  const list = wrap.querySelector(".scent-dd-list");

  function sync() {
    const o = select.options[select.selectedIndex];
    btn.querySelector(".scent-dd-label").textContent = o.text;
    btn.querySelector(".pill-dot").className = "pill-dot " + scentDotClass(o.value);
    Array.from(list.children).forEach(li => li.setAttribute("aria-selected", String(li.dataset.value === o.value)));
  }
  function setOpen(open) {
    list.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  }
  select._syncScent = sync;
  sync();

  btn.addEventListener("click", () => {
    const open = list.hidden;
    document.querySelectorAll(".scent-dd-list").forEach(l => { if (l !== list) { l.hidden = true; } });
    setOpen(open);
  });
  list.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;
    select.value = li.dataset.value;
    sync();
    setOpen(false);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  document.addEventListener("click", e => { if (!wrap.contains(e.target)) setOpen(false); });
  // Escape closes an open menu first, without also closing the popup behind it
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !list.hidden) { setOpen(false); e.stopImmediatePropagation(); }
  }, true);
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

  body.querySelectorAll(".bm-select").forEach(enhanceScentSelect);

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
      const dropdown = btn.closest(".bundle-nudge-dropdown");
      const wrap = dropdown?.querySelector(".bundle-interval-wrap");
      if (wrap) wrap.hidden = !wrap.hidden;
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
