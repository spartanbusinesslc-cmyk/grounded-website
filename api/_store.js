/* ============================================
   EARTHED — Review storage helper
   ---------------------------------------------
   Talks to an Upstash Redis database over its REST
   API (added from the Vercel dashboard: Storage →
   Upstash → Redis). Uses whichever env var names
   the integration created.
   ============================================ */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const PRODUCTS = {
  "raw-milk-soap": "Raw Milk Soap",
  "olive-oil-soap": "Olive Oil Soap",
  "tallow-balm": "Tallow Balm",
  "lip-balm": "Lip Balm"
};

function configured() { return !!(URL_ && TOKEN); }

async function cmd(...args) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

async function hgetall(key) {
  const flat = (await cmd("HGETALL", key)) || [];
  const out = {};
  for (let i = 0; i < flat.length; i += 2) {
    try { out[flat[i]] = JSON.parse(flat[i + 1]); } catch (e) { /* skip bad row */ }
  }
  return out;
}

const hget = async (key, f) => { const v = await cmd("HGET", key, f); return v ? JSON.parse(v) : null; };
const hset = (key, f, obj) => cmd("HSET", key, f, JSON.stringify(obj));
const hdel = (key, f) => cmd("HDEL", key, f);

module.exports = { PRODUCTS, configured, hgetall, hget, hset, hdel };
