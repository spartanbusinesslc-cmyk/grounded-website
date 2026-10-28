/* ============================================
   EARTHED — Apple Pay express button (product pages)
   ---------------------------------------------
   Shows Stripe's Express Checkout Element (Apple Pay only)
   under "Add to Cart" for the selected one-time option.
   One button is prepared per option on page load, so
   switching options is instant. Soap pages: single bars
   follow the selected scent pill; the 3-Pack and Essentials
   Set show scent dropdowns whose choices are saved on the
   order (same metadata keys as the cart).
   Hidden for everyone until a device visits a product
   page once with ?applepay=1 (use ?applepay=0 to switch
   it off again). Never breaks the page if anything fails.
   ============================================ */
(function () {
  var PUBLISHABLE_KEY = "pk_live_51Tl7IS5eqX21Gs5oOr5xkpZLrAjRoyyzsyMGRf5ENNEwD1ODofDy6bDBU1mhxaNb1ZIrzenYjtrWud69JXsfLi5i00PPP2g1I9";
  // Balm pages: options with no scent choice
  var PLAIN = ["bodyBalm", "balmBundle", "lipBalm", "lipBundle"];

  try {
    var flag = new URLSearchParams(location.search).get("applepay");
    if (flag === "1") localStorage.setItem("ep_applepay", "1");
    if (flag === "0") localStorage.removeItem("ep_applepay");
    if (localStorage.getItem("ep_applepay") !== "1") return;
  } catch (e) { return; }

  var anchor = document.getElementById("bb-add-btn");
  if (!anchor) return;

  var pills = Array.prototype.slice.call(document.querySelectorAll(".variant-pill"));
  var soapMode = pills.length > 0;
  var familyIds = pills.map(function (p) { return p.dataset.productId; });
  var scentList = typeof SCENT_OPTIONS !== "undefined" ? SCENT_OPTIONS : null;
  if (soapMode && !scentList) return;

  function scentSelect(group, index, label, defaultId) {
    var opts = scentList.map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === defaultId ? " selected" : "") + ">" + s.label + "</option>";
    }).join("");
    return '<label class="express-scent-row"><span>' + label + '</span><select class="express-scent-select" data-group="' + group + '" data-index="' + index + '">' + opts + "</select></label>";
  }

  var scentsHtml = "";
  if (soapMode) {
    scentsHtml =
      '<div class="express-scents" data-for="bundle" hidden><p>Apple Pay: choose your 3 bars</p>' +
      scentSelect("bundle", 0, "Bar 1", familyIds[0]) +
      scentSelect("bundle", 1, "Bar 2", familyIds[1] || familyIds[0]) +
      scentSelect("bundle", 2, "Bar 3", familyIds[2] || familyIds[0]) +
      "</div>" +
      '<div class="express-scents" data-for="essentials" hidden><p>Apple Pay: choose your soap</p>' +
      scentSelect("essentials", 0, "Soap", familyIds[0]) +
      "</div>";
  }

  var box = document.createElement("div");
  box.className = "express-checkout";
  box.hidden = true;
  box.innerHTML = scentsHtml + '<div class="express-slots"></div><p class="express-error" id="express-error" hidden></p>';
  anchor.insertAdjacentElement("afterend", box);
  var slotsEl = box.querySelector(".express-slots");
  var errEl = box.querySelector("#express-error");

  var stripe = null, slots = {}, token = 0, timer = null, anyAvailable = false;

  function showError(msg) {
    errEl.textContent = msg;
    errEl.hidden = !msg;
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

  function selectedKey() {
    var tab = document.querySelector(".bb-tab.active");
    if (!tab || tab.dataset.tab !== "one-time") return null;
    var r = document.querySelector('#bb-panel-one-time input[name="bb-ot"]:checked');
    if (!r) return null;
    if (soapMode) {
      if (r.value === "soapBundle") return "bundle";
      if (r.value === "essentialsBundle") return "essentials";
      var p = document.querySelector('.variant-pill[aria-pressed="true"]');
      return p ? p.dataset.productId : null;
    }
    return PLAIN.indexOf(r.value) !== -1 ? r.value : null;
  }

  function scentValues(group) {
    return Array.prototype.slice.call(box.querySelectorAll('.express-scent-select[data-group="' + group + '"]'))
      .map(function (s) { return s.value; });
  }

  function nameOf(id) { return (PRODUCTS[id] && PRODUCTS[id].name) || id; }

  function descriptor(key) {
    if (key === "bundle") {
      var md = {};
      scentValues("bundle").forEach(function (id, i) { md["soap_bundle_bar_" + (i + 1)] = nameOf(id); });
      return { id: "soapBundle", metadata: md };
    }
    if (key === "essentials") {
      return { id: "essentialsBundle", metadata: { essentials_soap: nameOf(scentValues("essentials")[0]) } };
    }
    return { id: key, metadata: {} };
  }

  function updateVisibility() {
    var sel = selectedKey();
    Object.keys(slots).forEach(function (k) { slots[k].node.classList.toggle("active", k === sel); });
    box.hidden = !(anyAvailable && sel);
    Array.prototype.slice.call(box.querySelectorAll(".express-scents")).forEach(function (g) {
      g.hidden = g.dataset.for !== sel;
    });
  }

  async function buildSlot(key) {
    var old = slots[key];
    if (old) {
      try { if (old.element) old.element.destroy(); } catch (e) {}
      old.node.remove();
    }
    var node = document.createElement("div");
    node.className = "express-slot";
    slotsEl.appendChild(node);
    var slot = { node: node, element: null };
    slots[key] = slot;
    updateVisibility();
    try {
      var d = descriptor(key);
      if (!PRODUCTS[d.id]) throw new Error("unknown product " + d.id);
      var region = (document.getElementById("cart-region") || {}).value || "uk";
      var res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: d.id, quantity: 1 }],
          express: true,
          metadata: d.metadata,
          subtotalPence: Math.round(PRODUCTS[d.id].price * 100),
          affiliateRef: typeof getAffiliateRef === "function" ? getAffiliateRef() : null,
          shippingRegion: region
        })
      });
      var data = await res.json();
      if (!res.ok || !data.client_secret) throw new Error(data.error || "express session failed");
      await loadStripeJs();
      if (slots[key] !== slot) return;

      stripe = stripe || Stripe(PUBLISHABLE_KEY);
      var checkout = stripe.initCheckoutElementsSdk({ clientSecret: data.client_secret });
      var el = checkout.createExpressCheckoutElement({
        buttonHeight: 48,
        buttonType: { applePay: "buy" },
        paymentMethods: { applePay: "auto", googlePay: "never", link: "never", paypal: "never", amazonPay: "never", klarna: "never" }
      });
      slot.element = el;
      el.on("availablepaymentmethodschange", function (e) {
        if (slots[key] !== slot) return;
        if (e.paymentMethods) anyAvailable = true;
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
      if (window.console) console.warn("Apple Pay button unavailable for " + key + ":", err);
    }
  }

  function allKeys() {
    if (soapMode) return familyIds.concat(["bundle", "essentials"]);
    return PLAIN.filter(function (id) {
      return document.querySelector('#bb-panel-one-time input[name="bb-ot"][value="' + id + '"]');
    });
  }

  function buildAll() {
    token++;
    Object.keys(slots).forEach(function (k) {
      try { if (slots[k].element) slots[k].element.destroy(); } catch (e) {}
    });
    slots = {};
    slotsEl.innerHTML = "";
    anyAvailable = false;
    showError("");
    box.hidden = true;
    allKeys().forEach(buildSlot);
  }

  document.addEventListener("change", function (e) {
    if (!e.target.matches) return;
    if (e.target.matches('input[name="bb-ot"]')) updateVisibility();
    if (e.target.matches("#cart-region")) {
      clearTimeout(timer);
      timer = setTimeout(buildAll, 300);
    }
    if (e.target.matches(".express-scent-select")) {
      var group = e.target.dataset.group;
      clearTimeout(timer);
      timer = setTimeout(function () { buildSlot(group); }, 250);
    }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest(".bb-tab") || e.target.closest(".variant-pill")) setTimeout(updateVisibility, 60);
  });
  buildAll();
})();
