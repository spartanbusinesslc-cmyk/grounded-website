/* ============================================
   EARTHED — Cart
   ---------------------------------------------
   Cart state lives in localStorage so it persists
   between pages and visits. Checkout sends the cart
   contents to /api/create-checkout-session, which
   builds one combined Stripe Checkout session for
   the whole order server-side.
   ============================================ */

const CART_KEY = "earthed_cart";

// Affiliate ref tracking — save ?ref= param to cookie for 30 days
(function() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    document.cookie = `earthed_ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }
})();

function getAffiliateRef() {
  const match = document.cookie.match(/(?:^|;\s*)earthed_ref=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(id, qty = 1) {
  if (!PRODUCTS[id]) return;
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
  openCart();
}

function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = qty;
  }
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}

function cartCount(cart) {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartSubtotal(cart) {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = PRODUCTS[id];
    return product ? sum + product.price * qty : sum;
  }, 0);
}

function renderCart() {
  const cart = getCart();
  const count = cartCount(cart);

  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
  });

  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const subtotalEl = document.getElementById("cart-subtotal");
  if (!itemsEl) return; // drawer not on this page

  const entries = Object.entries(cart);

  if (entries.length === 0) {
    itemsEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
  } else {
    if (emptyEl) emptyEl.style.display = "none";
    itemsEl.innerHTML = entries
      .map(([id, qty]) => {
        const p = PRODUCTS[id];
        if (!p) return "";
        return `
          <div class="cart-line" data-line="${id}">
            <div class="cart-line-swatch ${p.swatch}"></div>
            <div class="cart-line-info">
              <span class="cart-line-name">${p.name}</span>
              <span class="cart-line-price">£${p.price.toFixed(2)}</span>
              <div class="cart-line-qty">
                <button type="button" aria-label="Decrease quantity" data-cart-dec="${id}">−</button>
                <span>${qty}</span>
                <button type="button" aria-label="Increase quantity" data-cart-inc="${id}">+</button>
              </div>
            </div>
            <button type="button" class="cart-line-remove" aria-label="Remove ${p.name}" data-cart-remove="${id}">×</button>
          </div>
        `;
      })
      .join("");
  }

  const subtotal = cartSubtotal(cart);
  if (subtotalEl) subtotalEl.textContent = `£${subtotal.toFixed(2)}`;

  // Free shipping nudge
  const nudgeEl = document.getElementById("cart-shipping-nudge");
  if (nudgeEl) {
    if (subtotal === 0) {
      nudgeEl.style.display = "none";
    } else if (subtotal >= 25) {
      nudgeEl.textContent = "🎉 You qualify for free delivery!";
      nudgeEl.style.display = "block";
    } else {
      const remaining = (25 - subtotal).toFixed(2);
      nudgeEl.textContent = `Add £${remaining} more for free delivery`;
      nudgeEl.style.display = "block";
    }
  }
}

function openCart() {
  document.getElementById("cart-drawer")?.classList.add("cart-open");
  document.getElementById("cart-overlay")?.classList.add("cart-open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart-drawer")?.classList.remove("cart-open");
  document.getElementById("cart-overlay")?.classList.remove("cart-open");
  document.body.style.overflow = "";
}

async function checkout() {
  const cart = getCart();
  const items = Object.entries(cart).map(([id, quantity]) => ({ id, quantity }));

  if (items.length === 0) return;

  const btn = document.getElementById("cart-checkout-btn");
  const originalText = btn.textContent;
  btn.textContent = "Redirecting to checkout…";
  btn.disabled = true;

  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, subtotalPence: Math.round(cartSubtotal(cart) * 100), affiliateRef: getAffiliateRef() })
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error(data.error || "Checkout could not be started.");
    }

    window.location.href = data.url;
  } catch (err) {
    alert(
      "Checkout isn't connected yet.\n\n" +
      "This site needs Stripe Price IDs and a secret key set up in your Vercel project " +
      "before checkout will work. See README.md for setup steps.\n\n" +
      "(Technical detail: " + err.message + ")"
    );
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  // Add to cart buttons
  document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      addToCart(btn.getAttribute("data-add-to-cart"), 1);
    });
  });

  // Variant-aware add to cart (soap block — uses the currently selected pill)
  document.querySelectorAll("[data-add-to-cart-variant]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const group = (btn.closest(".info-col") || btn.closest(".product-info"))?.querySelector(".variant-pills");
      const activePill = group?.querySelector('[aria-pressed="true"]');
      const id = activePill?.getAttribute("data-product-id") || btn.getAttribute("data-add-to-cart-variant");
      addToCart(id, 1);
    });
  });

  // Cart drawer open/close
  document.getElementById("cart-toggle")?.addEventListener("click", openCart);
  document.getElementById("cart-close")?.addEventListener("click", closeCart);
  document.getElementById("cart-overlay")?.addEventListener("click", closeCart);

  // Delegated qty/remove controls inside drawer
  document.getElementById("cart-items")?.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-cart-inc]");
    const dec = e.target.closest("[data-cart-dec]");
    const rem = e.target.closest("[data-cart-remove]");
    const cart = getCart();

    if (inc) setQty(inc.dataset.cartInc, (cart[inc.dataset.cartInc] || 0) + 1);
    if (dec) setQty(dec.dataset.cartDec, (cart[dec.dataset.cartDec] || 0) - 1);
    if (rem) removeFromCart(rem.dataset.cartRemove);
  });

  document.getElementById("cart-checkout-btn")?.addEventListener("click", checkout);

  // Escape key closes cart
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });
});
