const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"]
    });

    const items = (session.line_items?.data || []).map(li => ({
      item_id: li.price?.id,
      item_name: li.description,
      price: li.amount_total / 100 / li.quantity,
      quantity: li.quantity
    }));

    res.status(200).json({
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
