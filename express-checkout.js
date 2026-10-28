/* ============================================
   EARTHED — Apple Pay express button (product pages)
   ---------------------------------------------
   Shows Stripe's Express Checkout Element (Apple Pay only)
   under "Add to Cart" for the selected one-time option.
   One button is prepared per option on page load, so
   switching options is instant (no waiting).
   Hidden for everyone until a device visits a product
   page once with ?applepay=1 (use ?applepay=0 to switch
   it off again). Never breaks the page if anything fails.
   ============================================ */
(function () {
  var PUBLISHABLE_KEY = "pk_live_51Tl7IS5eqX21Gs5oOr5xkpZLrAjRoyyzsyMGRf5ENNEwD1ODofDy6bDBU1mhxaNb1ZIrzenYjtrWud69JXsfLi5i00PPP2g1I9";
  // One-time options with no scent choice (bundles that need scents come later)
  var ALLOWED = ["bodyBalm", "balmBundle", "lipBalm", "lipBundle"];

  try {
    var flag = new URLSearchParams(location.search).get("applepay");
    if (flag === "1") localStorage.setItem("ep_applepay", "1");
    if (flag === "0") localStorage.removeItem("ep_applepay");
    if (localStorage.getItem("ep_applepay") !== "1") return;
  } catch (e) { return; }

  var anchor = document.getElementById("bb-add-btn");
  if (!anchor) return;

  var box = document.createElement("div");
  box.className = "express-checkout";
  box.hidden = true;
  box.innerHTML = '<div class="express-slots"></div><p class="express-error" id="express-error" hidden></p>';
  anchor.insertAdjacentElement("afterend", box);
  var slotsEl = box.querySelector(".express-slots");
  var errEl = box.querySelector("#express-error");

  var stripe = null, slots = {}, token = 0, timer = null;

  function showError(msg) {
    errEl.textContent = msg;
    errEl.hidden = !msg;
  }

  function destroyAll() {
    Object.keys(slots).forEach(function (id) {
      try { if (slots[id].element) slots[id].element.destroy(); } catch (e) {}
    });
    slots = {};
    slotsEl.innerHTML = "";
    box.hidden = true;
    showError("");
  }

  function loadStripeJs() {
    return new Promise(function (resolve, reject) {
      if (window.Stripe) return resolve();
      var s = document.createElement("script");
      s.src = "https://js.stripe.com/endive/stripe.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function selectedId() {
    var tab = document.querySelector(".bb-tab.active");
    if (!tab || tab.dataset.tab !== "one-time") return null;
    var r = document.querySelector('#bb-panel-one-time input[name="bb-ot"]:checked');
    return r && ALLOWED.indexOf(r.value) !== -1 ? r.value : null;
  }

  function updateVisibility() {
    var sel = selectedId();
    Object.keys(slots).forEach(function (id) {
      slots[id].node.classList.toggle("active", id === sel);
    });
    box.hidden = !(sel && slots[sel] && slots[sel].available);
  }

  async function build(id, region, mine) {
    var node = document.createElement("div");
    node.className = "express-slot";
    slotsEl.appendChild(node);
    var slot = { node: node, element: null, available: false };
    slots[id] = slot;
    try {
      var res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: id, quantity: 1 }],
          express: true,
          subtotalPence: Math.round(PRODUCTS[id].price * 100),
          affiliateRef: typeof getAffiliateRef === "function" ? getAffiliateRef() : null,
          shippingRegion: region
        })
      });
      var data = await res.json();
      if (!res.ok || !data.client_secret) throw new Error(data.error || "express session failed");
      await loadStripeJs();
      if (mine !== token) return;

      stripe = stripe || Stripe(PUBLISHABLE_KEY);
      var checkout = stripe.initCheckoutElementsSdk({ clientSecret: data.client_secret });
      var el = checkout.createExpressCheckoutElement({
        buttonHeight: 48,
        buttonType: { applePay: "buy" },
        paymentMethods: { applePay: "auto", googlePay: "never", link: "never", paypal: "never", amazonPay: "never", klarna: "never" }
      });
      slot.element = el;
      el.on("availablepaymentmethodschange", function (e) {
        if (mine !== token) return;
        slot.available = !!e.paymentMethods;
        updateVisibility();
      });
      el.mount(node);

      var loaded = await checkout.loadActions();
      if (loaded.type === "success") {
        el.on("confirm", function (event) {
          loaded.actions.confirm({ expressCheckoutConfirmEvent: event }).then(function (r) {
            if (r && r.type === "error") showError("Apple Pay could not complete. Please try again or use Add to Cart.");
          });
        });
      }
    } catch (err) {
      if (window.console) console.warn("Apple Pay button unavailable for " + id + ":", err);
    }
  }

  function buildAll() {
    var mine = ++token;
    destroyAll();
    var region = (document.getElementById("cart-region") || {}).value || "uk";
    ALLOWED.forEach(function (id) {
      var exists = document.querySelector('#bb-panel-one-time input[name="bb-ot"][value="' + id + '"]');
      if (exists && PRODUCTS[id]) build(id, region, mine);
    });
  }

  document.addEventListener("change", function (e) {
    if (!e.target.matches) return;
    if (e.target.matches('input[name="bb-ot"]')) updateVisibility();
    if (e.target.matches("#cart-region")) {
      clearTimeout(timer);
      timer = setTimeout(buildAll, 300);
    }
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".bb-tab")) setTimeout(updateVisibility, 60);
  });
  buildAll();
})();
