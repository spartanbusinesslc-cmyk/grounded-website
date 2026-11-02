/* ============================================
   EARTHED — Review admin (private)
   POST with header x-admin-password and body {action, ...}
   actions: list, create-link, approve, reject, delete
   Password = REVIEW_ADMIN_PASSWORD env var.
   ============================================ */
const crypto = require("crypto");
const store = require("./_store");

const same = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }
  const pw = process.env.REVIEW_ADMIN_PASSWORD;
  if (!pw) return res.status(503).json({ error: "REVIEW_ADMIN_PASSWORD is not set in Vercel yet." });
  if (!store.configured()) return res.status(503).json({ error: "Reviews database isn't connected in Vercel yet." });
  if (!same(req.headers["x-admin-password"] || "", pw)) return res.status(401).json({ error: "Wrong password." });

  const b = req.body || {};
  try {
    if (b.action === "list") {
      const reviews = Object.values(await store.hgetall("rv:reviews")).sort((a, c) => c.created - a.created);
      const links = Object.entries(await store.hgetall("rv:links"))
        .map(([token, l]) => ({ token, ...l })).sort((a, c) => c.created - a.created);
      return res.status(200).json({ reviews, links, products: store.PRODUCTS });
    }
    if (b.action === "create-link") {
      const count = Math.min(50, Math.max(1, parseInt(b.count, 10) || 1));
      const product = store.PRODUCTS[b.product] ? b.product : "";
      const badge = b.badge === "free" ? "free" : b.badge === "verified" ? "verified" : "";
      const name = String(b.name || "").replace(/[<>]/g, "").trim().slice(0, 40);
      const tokens = [];
      if (b.shared) {
        const token = crypto.randomBytes(9).toString("base64url");
        await store.hset("rv:links", token, { product, badge, name: "", used: false, shared: true, uses: 0, created: Date.now() });
        return res.status(200).json({ tokens: [token] });
      }
      for (let i = 0; i < count; i++) {
        const token = crypto.randomBytes(9).toString("base64url");
        await store.hset("rv:links", token, { product, badge, name: count === 1 ? name : "", used: false, created: Date.now() });
        tokens.push(token);
      }
      return res.status(200).json({ tokens });
    }
    if (b.action === "set-badge") {
      const r = await store.hget("rv:reviews", String(b.id));
      if (!r) return res.status(404).json({ error: "Review not found." });
      await store.hset("rv:reviews", r.id, { ...r, badge: r.badge === "free" ? "verified" : "free" });
      return res.status(200).json({ ok: true });
    }
    if (["approve", "reject", "delete"].includes(b.action)) {
      const r = await store.hget("rv:reviews", String(b.id));
      if (!r) return res.status(404).json({ error: "Review not found." });
      if (b.action === "delete") await store.hdel("rv:reviews", r.id);
      else await store.hset("rv:reviews", r.id, { ...r, status: b.action === "approve" ? "approved" : "rejected" });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: "Unknown action." });
  } catch (e) {
    return res.status(500).json({ error: "Server error." });
  }
};
