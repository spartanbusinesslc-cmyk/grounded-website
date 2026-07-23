/* ============================================
   EARTHED — Create Checkout Session
   ---------------------------------------------
   Runs as a Vercel serverless function at
   /api/create-checkout-session.

   Receives the cart from the browser as:
     { items: [{ id: "soapUnscented", quantity: 2 }, ...] }
   Or for subscriptions:
     { items: [{ id: "soapBundle", quantity: 1 }], subscription: true }

   IMPORTANT — security note:
   We never trust a price sent from the browser.
   This function looks up the real Stripe Price ID
   for each item from the PRICE_MAP below (sourced
   from environment variables), so nobody can tamper
   with prices by editing the page.
   ============================================ */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  soapUnscented:       process.env.PRICE_SOAP_UNSCENTED,
  soapCitrusLavender:  process.env.PRICE_SOAP_CITRUS_LAVENDER,
  soapMintTeaTree:     process.env.PRICE_SOAP_MINT_TEA_TREE,
  oliveUnscented:      process.env.PRICE_OLIVE_UNSCENTED,
  oliveCitrusLavender: process.env.PRICE_OLIVE_CITRUS_LAVENDER,
  oliveMintTeaTree:    process.env.PRICE_OLIVE_MINT_TEA_TREE,
  bodyBalm:            process.env.PRICE_BODY_BALM,
  lipBalm:             process.env.PRICE_LIP_BALM,
  soapBundle:          process.env.PRICE_SOAP_BUNDLE,
  balmBundle:          process.env.PRICE_BALM_BUNDLE,
  lipBundle:           process.env.PRICE_LIP_BUNDLE,
  essentialsBundle:    process.env.PRICE_ESSENTIALS_BUNDLE,
  // Subscription prices — bundles
  subSoapBundle:          process.env.PRICE_SUB_SOAP_BUNDLE,
  subBalmBundle:          process.env.PRICE_SUB_BALM_BUNDLE,
  subLipBundle:           process.env.PRICE_SUB_LIP_BUNDLE,
  subEssentialsBundle:    process.env.PRICE_SUB_ESSENTIALS_BUNDLE,
  // Subscription prices — single items
  subSoapUnscented:       process.env.PRICE_SUB_SOAP_UNSCENTED,
  subSoapCitrusLavender:  process.env.PRICE_SUB_SOAP_CITRUS_LAVENDER,
  subSoapMintTeaTree:     process.env.PRICE_SUB_SOAP_MINT_TEA_TREE,
  subOliveUnscented:      process.env.PRICE_SUB_OLIVE_UNSCENTED,
  subOliveCitrusLavender: process.env.PRICE_SUB_OLIVE_CITRUS_LAVENDER,
  subOliveMintTeaTree:    process.env.PRICE_SUB_OLIVE_MINT_TEA_TREE,
  subBodyBalm:            process.env.PRICE_SUB_BODY_BALM,
  subLipBalm:             process.env.PRICE_SUB_LIP_BALM
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({
      error: "STRIPE_SECRET_KEY is not set in your Vercel environment variables yet."
    });
  }

  try {
    const { items, subscription, metadata, subtotalPence, affiliateRef } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    const line_items = items.map((item) => {
      const priceId = PRICE_MAP[item.id];

      if (!priceId) {
        throw new Error(
          `No Stripe Price ID is configured for "${item.id}". Add it as an environment variable in Vercel.`
        );
      }

      const quantity = Math.min(20, Math.max(1, parseInt(item.quantity, 10) || 1));
      return { price: priceId, quantity };
    });

    const origin = getOrigin(req);
    const mode = subscription ? "subscription" : "payment";

    const sessionParams = {
      mode,
      line_items,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop.html`,
      allow_promotion_codes: true,
      metadata: { ...(metadata || {}), ...(affiliateRef ? { affiliate_ref: affiliateRef } : {}) },
      payment_intent_data: {
        metadata: { ...(metadata || {}), ...(affiliateRef ? { affiliate_ref: affiliateRef } : {}) }
      }
    };

    // Shipping only applies to one-time payments; subscriptions use billing address
    if (!subscription) {
      const shippingOptions = [
        { shipping_rate: process.env.SHIPPING_RATE_STANDARD },
        { shipping_rate: process.env.SHIPPING_RATE_EXPRESS },
      ];
      // Free shipping on orders of £25 or more
      if (subtotalPence >= 2500) {
        shippingOptions.unshift({ shipping_rate: process.env.SHIPPING_RATE_FREE });
      }
      sessionParams.shipping_options = shippingOptions;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    return res.status(500).json({ error: err.message || "Something went wrong creating checkout." });
  }
};

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}
