/* ============================================
   EARTHED — Order lookup for the success page
   ---------------------------------------------
   Returns the order summary for a completed
   Checkout Session. Personal details (name, email,
   address) are only returned for a paid order from
   the last 24 hours.
   ============================================ */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { PRICE_MAP } = require("./_prices");

const SHIPPING_PRICE_IDS = [
  "SHIPPING_RATE_SUB_UK", "SHIPPING_RATE_SUB_UK_3M",
  "SHIPPING_RATE_SUB_EUROPE", "SHIPPING_RATE_SUB_EUROPE_3M",
  "SHIPPING_RATE_SUB_ROW", "SHIPPING_RATE_SUB_ROW_3M"
].map(k => process.env[k]).filter(Boolean);

const DAY = 24 * 60 * 60;

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"]
    });

    const lineItems = session.line_items?.data || [];

    // Used by Google Analytics (unchanged)
    const items = lineItems.map(li => ({
      item_id: li.price?.id,
      item_name: li.description,
      price: li.amount_total / 100 / li.quantity,
      quantity: li.quantity
    }));

    const base = {
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      items
    };

    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    const recent = Date.now() / 1000 - session.created < DAY;
    if (!paid || !recent) return res.status(200).json(base);

    const idByPrice = {};
    Object.keys(PRICE_MAP).forEach(id => { if (PRICE_MAP[id]) idByPrice[PRICE_MAP[id]] = id; });

    const lines = lineItems.map(li => {
      const priceId = li.price?.id;
      return {
        productId: idByPrice[priceId] || null,
        name: li.description,
        quantity: li.quantity,
        amount: li.amount_subtotal,
        recurring: li.price?.recurring ? { interval: li.price.recurring.interval, count: li.price.recurring.interval_count } : null,
        isShipping: SHIPPING_PRICE_IDS.includes(priceId)
      };
    });

    const shipping = session.shipping_details || session.collected_information?.shipping_details || null;
    const cd = session.customer_details || {};
    const addr = shipping?.address || cd.address || null;

    res.status(200).json({
      ...base,
      details: {
        mode: session.mode,
        name: shipping?.name || cd.name || null,
        email: cd.email || null,
        address: addr ? {
          line1: addr.line1, line2: addr.line2, city: addr.city,
          state: addr.state, postal_code: addr.postal_code, country: addr.country
        } : null,
        lines,
        subtotal: lines.filter(l => !l.isShipping).reduce((a, l) => a + l.amount, 0),
        delivery: (session.total_details?.amount_shipping || 0) + lines.filter(l => l.isShipping).reduce((a, l) => a + l.amount, 0),
        discount: session.total_details?.amount_discount || 0,
        metadata: session.metadata || {}
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
