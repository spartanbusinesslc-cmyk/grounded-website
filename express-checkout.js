/* ============================================
   EARTHED — Apple Pay express button (product pages)
   ---------------------------------------------
   Shows Stripe's Express Checkout Element (Apple Pay only)
   under "Add to Cart" for the selected one-time option.
   One button is prepared per option on page load, so
   switching options is instant.
   The Subscribe tab works the same way (buttons are prepared
   the first time it is opened, per frequency).
   Soap pages: single bars follow the selected scent pill.
   The 3-Pack and Essentials Set show our own "Pay with
   Apple Pay" button that opens a scent popup; the real
   Apple Pay button sits inside that popup, and the chosen
   scents are saved on the order (same metadata keys as the
   cart).
   Live for Apple devices. ?applepay=0 switches it off on
   one device (?applepay=1 back on). Never breaks the page
   if anything fails.
   ============================================ */
(function () {
  var PUBLISHABLE_KEY = "pk_live_51Tl7IS5eqX21Gs5oOr5xkpZLrAjRoyyzsyMGRf5ENNEwD1ODofDy6bDBU1mhxaNb1ZIrzenYjtrWud69JXsfLi5i00PPP2g1I9";
  // Balm pages: options with no scent choice
  var PLAIN = ["bodyBalm", "balmBundle", "lipBalm", "lipBundle"];

  // Apple Pay only works on Apple devices, so skip everyone else (no sessions created)
  if (!/Mac|iPhone|iPad|iPod/.test(navigator.userAgent)) return;

  // Kill switch for a single device: ?applepay=0 turns it off, ?applepay=1 turns it back on
  try {
    var flag = new URLSearchParams(location.search).get("applepay");
    if (flag === "0") localStorage.setItem("ep_applepay", "off");
    if (flag === "1") localStorage.removeItem("ep_applepay");
    if (localStorage.getItem("ep_applepay") === "off") return;
  } catch (e) { /* storage blocked: stay on */ }

  var anchor = document.getElementById("bb-add-btn");
  if (!anchor) return;

  var pills = Array.prototype.slice.call(document.querySelectorAll(".variant-pill"));
  var soapMode = pills.length > 0;
  var familyIds = pills.map(function (p) { return p.dataset.productId; });
  var scentList = typeof SCENT_OPTIONS !== "undefined" ? SCENT_OPTIONS : null;
  if (soapMode && !scentList) return;

  // Subscription ids that need the scent popup (soap pages only), mapped to their popup panel
  var SUB_GROUP = { subSoapBundle: "bundle", subSoapBundle3m: "bundle", subEssentialsBundle: "essentials", subEssentialsBundle3m: "essentials" };
  function groupOf(key) {
    if (key === "bundle" || key === "essentials") return key;
    return (soapMode && SUB_GROUP[key]) || null;
  }
  function isModalKey(key) { return !!groupOf(key); }
  function isSubKey(key) { return key.indexOf("sub") === 0; }
  function paySlots(keys) {
    return keys.map(function (k) { return '<div class="express-modal-pay" data-slot="' + k + '"></div>'; }).join("");
  }

  function scentSelect(group, index, label, defaultId) {
    var opts = scentList.map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === defaultId ? " selected" : "") + ">" + s.label + "</option>";
    }).join("");
    return '<label class="express-scent-row"><span>' + label + '</span><select class="express-scent-select" data-group="' + group + '" data-index="' + index + '">' + opts + "</select></label>";
  }

  // ---- inline box (under Add to Cart) ----
  var box = document.createElement("div");
  box.className = "express-checkout";
  box.hidden = true;
  box.innerHTML =
    (soapMode ? '<button type="button" class="express-fake" hidden>Pay with Apple Pay</button>' : "") +
    '<div class="express-slots"></div><p class="express-sub-note" hidden></p><p class="express-error" hidden></p>';
  anchor.insertAdjacentElement("afterend", box);
  var slotsEl = box.querySelector(".express-slots");
  var fakeBtn = box.querySelector(".express-fake");

  // ---- scent popup (soap pages only) ----
  var modal = null;
  if (soapMode) {
    modal = document.createElement("div");
    modal.className = "express-modal-overlay";
    modal.inert = true;
    modal.innerHTML =
      '<div class="express-modal" role="dialog" aria-modal="true" aria-label="Choose your scents">' +
        '<button type="button" class="express-modal-close" aria-label="Close">&times;</button>' +
        '<div class="express-panel" data-for="bundle">' +
          '<h3 class="express-modal-title">Build Your Soap 3-Pack</h3>' +
          '<p class="express-modal-sub">Pick your 3 bars, then pay with Apple Pay.</p>' +
          scentSelect("bundle", 0, "Bar 1", familyIds[0]) +
          scentSelect("bundle", 1, "Bar 2", familyIds[1] || familyIds[0]) +
          scentSelect("bundle", 2, "Bar 3", familyIds[2] || familyIds[0]) +
          '<p class="express-sub-note" hidden></p>' +
          paySlots(["bundle", "subSoapBundle", "subSoapBundle3m"]) +
        "</div>" +
        '<div class="express-panel" data-for="essentials">' +
          '<h3 class="express-modal-title">EARTHED Essentials Set</h3>' +
          '<p class="express-modal-sub">Choose your soap, then pay with Apple Pay. Balm &amp; lip balm are included.</p>' +
          scentSelect("essentials", 0, "Soap", familyIds[0]) +
          '<p class="express-sub-note" hidden></p>' +
          paySlots(["essentials", "subEssentialsBundle", "subEssentialsBundle3m"]) +
        "</div>" +
        '<p class="express-error" hidden></p>' +
      "</div>";
    document.body.appendChild(modal);
  }

  var stripe = null, slots = {}, token = 0, timer = null, anyAvailable = false;

  function showError(msg) {
    Array.prototype.slice.call(document.querySelectorAll(".express-error")).forEach(function (el) {
      el.textContent = msg;
      el.hidden = !msg;
    });
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
    if (tab && tab.dataset.tab === "subscribe") {
      var rs = document.querySelector('#bb-panel-subscribe input[name="bb-sub"]:checked');
      if (!rs) return null;
      var lab = rs.closest(".bb-option");
      if (soapMode && lab.id === "bb-sub-single") {
        var sp = document.querySelector('.variant-pill[aria-pressed="true"]');
        return sp ? sp.dataset.subId : null;
      }
      if (!soapMode && (lab.dataset.modal1m || lab.dataset.modal3m)) return null;
      return lab.dataset["sub" + activeFreq()] || lab.dataset["modal" + activeFreq()] || rs.value;
    }
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

  // Delivery on subscriptions is billed with each delivery, so say so next to the button
  var DELIVERY = { uk: [3.99, 20], europe: [15, 75], row: [20, 100] };
  function subNote(key) {
    var pr = PRODUCTS[key];
    if (!pr) return "";
    var region = (document.getElementById("cart-region") || {}).value || "uk";
    var d = DELIVERY[region] || DELIVERY.uk;
    var every = /3m$/.test(key) ? "every 3 months" : "every month";
    var price = "£" + pr.price.toFixed(2);
    return (pr.price >= d[1] ? price + " " + every + ", free delivery" : price + " + £" + d[0].toFixed(2) + " delivery, " + every) + ". Cancel anytime.";
  }

  function activeFreq() {
    var fp = document.querySelector("#bb-panel-subscribe .bb-freq-pill.active");
    return fp ? fp.dataset.freq : "1m";
  }

  // Every subscription option for a frequency that can have an Apple Pay button
  function subKeys(freq) {
    var out = [];
    Array.prototype.slice.call(document.querySelectorAll('#bb-panel-subscribe input[name="bb-sub"]')).forEach(function (r) {
      var lab = r.closest(".bb-option");
      if (soapMode && lab.id === "bb-sub-single") {
        pills.forEach(function (p) { if (p.dataset.subId) out.push(p.dataset.subId); });
      } else if (!soapMode && (lab.dataset.modal1m || lab.dataset.modal3m)) {
        return;
      } else {
        out.push(lab.dataset["sub" + freq] || lab.dataset["modal" + freq] || r.value);
      }
    });
    return out;
  }

  // Subscription buttons are prepared the first time the Subscribe tab is used, and per frequency
  function ensureSubSlots() {
    var tab = document.querySelector(".bb-tab.active");
    if (!tab || tab.dataset.tab !== "subscribe") return;
    subKeys(activeFreq()).forEach(function (k) { if (!slots[k]) buildSlot(k); });
  }

  function scentValues(group) {
    return Array.prototype.slice.call(modal.querySelectorAll('.express-scent-select[data-group="' + group + '"]'))
      .map(function (s) { return s.value; });
  }

  function nameOf(id) { return (PRODUCTS[id] && PRODUCTS[id].name) || id; }

  function descriptor(key) {
    var g = groupOf(key);
    if (g === "bundle") {
      var md = {};
      scentValues("bundle").forEach(function (id, i) { md["soap_bundle_bar_" + (i + 1)] = nameOf(id); });
      return { id: key === "bundle" ? "soapBundle" : key, metadata: md };
    }
    if (g === "essentials") {
      return { id: key === "essentials" ? "essentialsBundle" : key, metadata: { essentials_soap: nameOf(scentValues("essentials")[0]) } };
    }
    return { id: key, metadata: {} };
  }

  function updateVisibility() {
    var sel = selectedKey();
    Object.keys(slots).forEach(function (k) {
      if (!isModalKey(k)) slots[k].node.classList.toggle("active", k === sel);
    });
    box.hidden = !(anyAvailable && sel && slots[sel]);
    var inlineNote = box.querySelector(".express-sub-note");
    inlineNote.hidden = !(sel && isSubKey(sel) && !isModalKey(sel));
    if (!inlineNote.hidden) inlineNote.textContent = subNote(sel);
    if (fakeBtn) fakeBtn.hidden = !(sel && isModalKey(sel));
    if (modal) {
      var grp = sel && groupOf(sel);
      Array.prototype.slice.call(modal.querySelectorAll(".express-panel")).forEach(function (p) {
        p.classList.toggle("active", p.dataset.for === grp);
      });
      Array.prototype.slice.call(modal.querySelectorAll(".express-modal-pay")).forEach(function (c) {
        c.classList.toggle("active", c.dataset.slot === sel);
      });
      Array.prototype.slice.call(modal.querySelectorAll(".express-sub-note")).forEach(function (n) {
        n.hidden = !(sel && isSubKey(sel) && PRODUCTS[sel]);
        if (!n.hidden) n.textContent = subNote(sel);
      });
    }
  }

  function openModal() {
    if (!modal) return;
    updateVisibility();
    showError("");
    modal.inert = false;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    // Focus the dialog itself, not a dropdown (focusing a select opens its picker on iPhone)
    var dlg = modal.querySelector(".express-modal");
    dlg.setAttribute("tabindex", "-1");
    dlg.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.inert = true;
    document.body.style.overflow = "";
    if (fakeBtn && !fakeBtn.hidden) fakeBtn.focus();
  }

  async function buildSlot(key) {
    var old = slots[key];
    if (old) {
      try { if (old.element) old.element.destroy(); } catch (e) {}
      old.node.remove();
    }
    var node = document.createElement("div");
    node.className = "express-slot" + (isModalKey(key) || isSubKey(key) ? " loading" : "");
    var parent = isModalKey(key) ? modal.querySelector('.express-modal-pay[data-slot="' + key + '"]') : slotsEl;
    parent.appendChild(node);
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
          subscription: isSubKey(d.id),
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
        if (e.paymentMethods) { anyAvailable = true; node.classList.remove("loading"); }
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
      node.classList.remove("loading");
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
      slots[k].node.remove();
    });
    slots = {};
    anyAvailable = false;
    showError("");
    box.hidden = true;
    allKeys().forEach(buildSlot);
    ensureSubSlots();
  }

  if (fakeBtn) fakeBtn.addEventListener("click", openModal);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || (e.target.closest && e.target.closest(".express-modal-close"))) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  document.addEventListener("change", function (e) {
    if (!e.target.matches) return;
    if (e.target.matches('input[name="bb-ot"], input[name="bb-sub"]')) { ensureSubSlots(); updateVisibility(); }
    if (e.target.matches("#cart-region")) {
      updateVisibility();
      clearTimeout(timer);
      timer = setTimeout(buildAll, 300);
    }
    if (e.target.matches(".express-scent-select")) {
      var group = e.target.dataset.group;
      clearTimeout(timer);
      timer = setTimeout(function () {
        Object.keys(slots).forEach(function (k) { if (groupOf(k) === group) buildSlot(k); });
      }, 250);
    }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest(".bb-tab, .variant-pill, .bb-freq-pill, .bb-option")) {
      setTimeout(function () { ensureSubSlots(); updateVisibility(); }, 60);
    }
  });
  buildAll();
})();
