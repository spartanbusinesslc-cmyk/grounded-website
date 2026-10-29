/* ============================================
   EARTHED — Product Catalog
   ---------------------------------------------
   This is the single source of truth for product
   names, display prices and swatch styling used
   across the site. The actual checkout price is
   always re-verified server-side against Stripe —
   this file is for display purposes only.
   ============================================ */

const PRODUCTS = {
  soapUnscented: {
    name: "Raw Milk Soap — Plain",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/rms-unscented.webp"
  },
  soapCitrusLavender: {
    name: "Raw Milk Soap — Citrus & Lavender",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/rms-citrus-lavender.webp"
  },
  soapMintTeaTree: {
    name: "Raw Milk Soap — Mint & Tea Tree",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/rms-mint-teatree.webp"
  },
  oliveUnscented: {
    name: "Olive Oil Soap — Plain",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/oos-unscented.webp"
  },
  oliveCitrusLavender: {
    name: "Olive Oil Soap — Citrus & Lavender",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/oos-citrus-lavender.webp"
  },
  oliveMintTeaTree: {
    name: "Olive Oil Soap — Mint & Tea Tree",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/oos-mint-teatree.webp"
  },
  bodyBalm: {
    name: "Tallow Body Balm",
    price: 24.99,
    swatch: "swatch-balm",
    image: "assets/tallow balm.webp"
  },
  lipBalm: {
    name: "Lip Balm",
    price: 9.99,
    swatch: "swatch-lip",
    image: "assets/lip balm.webp"
  },
  soapBundle: {
    name: "Soap 3-Pack (3 Bars)",
    price: 24.99,
    swatch: "swatch-soap",
    image: "assets/soap bundle.webp"
  },
  balmBundle: {
    name: "Body Balm 3-Pack (3 Jars)",
    price: 49.98,
    swatch: "swatch-balm",
    image: "assets/Tallow Trio.webp"
  },
  lipBundle: {
    name: "Lip Balm 3-Pack (3 Tins)",
    price: 19.99,
    swatch: "swatch-lip",
    image: "assets/Lip balm trio.webp"
  },
  essentialsBundle: {
    name: "The Essentials Set",
    price: 39.99,
    swatch: "swatch-balm",
    image: "assets/essentials%20bundle.webp"
  },
  // Subscription variants
  subSoapUnscented:       { name: "Raw Milk Soap — Plain (Monthly)",        price: 9.99,  swatch: "swatch-soap",  image: "assets/rms-unscented.webp" },
  subSoapCitrusLavender:  { name: "Raw Milk Soap — Citrus & Lavender (Monthly)", price: 9.99,  swatch: "swatch-soap",  image: "assets/rms-citrus-lavender.webp" },
  subSoapMintTeaTree:     { name: "Raw Milk Soap — Mint & Tea Tree (Monthly)",   price: 9.99,  swatch: "swatch-soap",  image: "assets/rms-mint-teatree.webp" },
  subOliveUnscented:      { name: "Olive Oil Soap — Plain (Monthly)",        price: 9.99,  swatch: "swatch-soap",  image: "assets/oos-unscented.webp" },
  subOliveCitrusLavender: { name: "Olive Oil Soap — Citrus & Lavender (Monthly)",price: 9.99,  swatch: "swatch-soap",  image: "assets/oos-citrus-lavender.webp" },
  subOliveMintTeaTree:    { name: "Olive Oil Soap — Mint & Tea Tree (Monthly)",  price: 9.99,  swatch: "swatch-soap",  image: "assets/oos-mint-teatree.webp" },
  subBodyBalm:            { name: "Tallow Body Balm (Monthly)",                  price: 21.99, swatch: "swatch-balm",  image: "assets/tallow balm.webp" },
  subLipBalm:             { name: "Lip Balm (Monthly)",                          price: 7.99,  swatch: "swatch-lip",   image: "assets/lip balm.webp" },
  subSoapBundle:          { name: "Soap 3-Pack (Monthly)",                       price: 19.99, swatch: "swatch-soap",  image: "assets/soap bundle.webp" },
  subBalmBundle:          { name: "Tallow 3-Pack (Monthly)",                     price: 41.99, swatch: "swatch-balm",  image: "assets/Tallow Trio.webp" },
  subLipBundle:           { name: "Lip Balm 3-Pack (Monthly)",                   price: 16.99, swatch: "swatch-lip",   image: "assets/Lip balm trio.webp" },
  subEssentialsBundle:    { name: "The Essentials Set (Monthly)",                price: 32.99, swatch: "swatch-balm",  image: "assets/essentials%20bundle.webp" },
  subSoapUnscented3m: { name: "Raw Milk Soap — Plain (Every 3 months)", price: 9.99, swatch: "swatch-soap", image: "assets/rms-unscented.webp" },
  subSoapCitrusLavender3m: { name: "Raw Milk Soap — Citrus & Lavender (Every 3 months)", price: 9.99, swatch: "swatch-soap", image: "assets/rms-citrus-lavender.webp" },
  subSoapMintTeaTree3m: { name: "Raw Milk Soap — Mint & Tea Tree (Every 3 months)", price: 9.99, swatch: "swatch-soap", image: "assets/rms-mint-teatree.webp" },
  subOliveUnscented3m: { name: "Olive Oil Soap — Plain (Every 3 months)", price: 9.99, swatch: "swatch-soap", image: "assets/oos-unscented.webp" },
  subOliveCitrusLavender3m: { name: "Olive Oil Soap — Citrus & Lavender (Every 3 months)", price: 9.99, swatch: "swatch-soap", image: "assets/oos-citrus-lavender.webp" },
  subOliveMintTeaTree3m: { name: "Olive Oil Soap — Mint & Tea Tree (Every 3 months)", price: 9.99, swatch: "swatch-soap", image: "assets/oos-mint-teatree.webp" },
  subBodyBalm3m: { name: "Tallow Body Balm (Every 3 months)", price: 21.99, swatch: "swatch-balm", image: "assets/tallow balm.webp" },
  subLipBalm3m: { name: "Lip Balm (Every 3 months)", price: 7.99, swatch: "swatch-lip", image: "assets/lip balm.webp" },
  subSoapBundle3m:        { name: "Soap 3-Pack (Every 3 months)",                price: 19.99, swatch: "swatch-soap",  image: "assets/soap bundle.webp" },
  subBalmBundle3m:        { name: "Tallow 3-Pack (Every 3 months)",              price: 39.99, swatch: "swatch-balm",  image: "assets/Tallow Trio.webp" },
  subLipBundle3m:         { name: "Lip Balm 3-Pack (Every 3 months)",            price: 16.99, swatch: "swatch-lip",   image: "assets/Lip balm trio.webp" },
  subEssentialsBundle3m:  { name: "The Essentials Set (Every 3 months)",         price: 32.99, swatch: "swatch-balm",  image: "assets/essentials%20bundle.webp" }
};
