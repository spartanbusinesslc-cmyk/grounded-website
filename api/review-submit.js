/* ============================================
   EARTHED — Review form backend
   GET  /api/review-submit?t=TOKEN → is this link valid?
   POST /api/review-submit         → save a review (held for approval)
   Each link is single-use.
   ============================================ */
const store = require("./_store");

const clean = (s, n) => String(s || "").replace(/[<>]/g, "").trim().slice(0, n);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!store.configured()) return res.status(503).json({ error: "Reviews aren't switched on yet." });
  try {
    if (req.method === "GET") {
      const link = await store.hget("rv:links", clean(req.query.t, 40));
      if (!link) return res.status(404).json({ error: "This review link isn't valid." });
      if (link.used) return res.status(410).json({ error: "This link has already been used. Thank you!" });
      return res.status(200).json({ product: link.product || null, products: store.PRODUCTS, name: link.name || "", askBadge: !link.badge });
    }
    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).end(); }

    const b = req.body || {};
    const token = clean(b.token, 40);
    const link = await store.hget("rv:links", token);
    if (!link) return res.status(404).json({ error: "This review link isn't valid." });
    if (link.used) return res.status(410).json({ error: "This link has already been used. Thank you!" });

    const product = link.product || b.product;
    const rating = parseInt(b.rating, 10);
    const text = clean(b.text, 1500);
    const name = clean(b.name, 40);
    const badge = link.badge || b.badge;
    if (badge !== "verified" && badge !== "free") return res.status(400).json({ error: "Please tell us how you got the product." });
    if (!store.PRODUCTS[product]) return res.status(400).json({ error: "Please choose a product." });
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: "Please choose a star rating." });
    if (text.length < 5) return res.status(400).json({ error: "Please write a few words about it." });
    if (!name) return res.status(400).json({ error: "Please add your first name." });

    let photo = "";
    if (typeof b.photo === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.photo) && b.photo.length < 450000) {
      photo = b.photo;
    }

    const id = "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await store.hset("rv:reviews", id, {
      id, product, rating, text, name, photo,
      badge,
      status: "pending", created: Date.now(), token
    });
    await store.hset("rv:links", token, { ...link, used: true, usedAt: Date.now(), reviewId: id });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
