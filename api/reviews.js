/* ============================================
   EARTHED — Public reviews feed
   GET /api/reviews            → rating summary for every product
   GET /api/reviews?product=ID → summary + approved reviews
   ============================================ */
const store = require("./_store");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  if (!store.configured()) return res.status(200).json({ summary: {}, reviews: [] });
  try {
    const all = Object.values(await store.hgetall("rv:reviews")).filter(r => r.status === "approved");
    const summary = {};
    for (const id of Object.keys(store.PRODUCTS)) {
      const rs = all.filter(r => r.product === id);
      summary[id] = {
        count: rs.length,
        average: rs.length ? Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10 : 0,
        stars: [1, 2, 3, 4, 5].map(n => rs.filter(r => r.rating === n).length)
      };
    }
    const product = req.query.product;
    if (!product) return res.status(200).json({ summary });
    const reviews = all
      .filter(r => r.product === product)
      .sort((a, b) => b.created - a.created)
      .map(({ id, name, rating, text, photo, badge, created }) => ({ id, name, rating, text, photo, badge, created }));
    return res.status(200).json({ summary, reviews });
  } catch (e) {
    return res.status(200).json({ summary: {}, reviews: [] });
  }
};
