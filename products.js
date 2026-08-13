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
    image: "assets/rms-unscented.png"
  },
  soapCitrusLavender: {
    name: "Raw Milk Soap — Citrus & Lavender",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/rms-citrus-lavender.png"
  },
  soapMintTeaTree: {
    name: "Raw Milk Soap — Mint & Tea Tree",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/rms-mint-teatree.png"
  },
  oliveUnscented: {
    name: "Olive Oil Soap — Plain",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/oos-unscented.png"
  },
  oliveCitrusLavender: {
    name: "Olive Oil Soap — Citrus & Lavender",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/oos-citrus-lavender.png"
  },
  oliveMintTeaTree: {
    name: "Olive Oil Soap — Mint & Tea Tree",
    price: 11.99,
    swatch: "swatch-soap",
    image: "assets/oos-mint-teatree.png"
  },
  bodyBalm: {
    name: "Tallow Body Balm",
    price: 24.99,
    swatch: "swatch-balm",
    image: "assets/tallow balm.png"
  },
  lipBalm: {
    name: "Lip Balm",
    price: 9.99,
    swatch: "swatch-lip",
    image: "assets/lip balm.png"
  },
  soapBundle: {
    name: "Soap 3-Pack (3 Bars)",
    price: 24.99,
    swatch: "swatch-soap",
    image: "assets/soap bundle.png"
  },
  balmBundle: {
    name: "Body Balm 3-Pack (3 Jars)",
    price: 49.98,
    swatch: "swatch-balm",
    image: "assets/Tallow Trio.png"
  },
  lipBundle: {
    name: "Lip Balm 3-Pack (3 Tins)",
    price: 19.99,
    swatch: "swatch-lip",
    image: "assets/Lip balm trio.png"
  },
  essentialsBundle: {
    name: "The Essentials Set",
    price: 39.99,
    swatch: "swatch-balm",
    image: "assets/essentials bundle.png"
  },
  // Subscription variants
  subSoapUnscented:       { name: "Raw Milk Soap — Plain (Monthly)",        price: 9.99,  swatch: "swatch-soap",  image: "assets/rms-unscented.png" },
  subSoapCitrusLavender:  { name: "Raw Milk Soap — Citrus & Lavender (Monthly)", price: 9.99,  swatch: "swatch-soap",  image: "assets/rms-citrus-lavender.png" },
  subSoapMintTeaTree:     { name: "Raw Milk Soap — Mint & Tea Tree (Monthly)",   price: 9.99,  swatch: "swatch-soap",  image: "assets/rms-mint-teatree.png" },
  subOliveUnscented:      { name: "Olive Oil Soap — Plain (Monthly)",        price: 9.99,  swatch: "swatch-soap",  image: "assets/oos-unscented.png" },
  subOliveCitrusLavender: { name: "Olive Oil Soap — Citrus & Lavender (Monthly)",price: 9.99,  swatch: "swatch-soap",  image: "assets/oos-citrus-lavender.png" },
  subOliveMintTeaTree:    { name: "Olive Oil Soap — Mint & Tea Tree (Monthly)",  price: 9.99,  swatch: "swatch-soap",  image: "assets/oos-mint-teatree.png" },
  subBodyBalm:            { name: "Tallow Body Balm (Monthly)",                  price: 21.99, swatch: "swatch-balm",  image: "assets/tallow balm.png" },
  subLipBalm:             { name: "Lip Balm (Monthly)",                          price: 7.99,  swatch: "swatch-lip",   image: "assets/lip balm.png" },
  subSoapBundle:          { name: "Soap 3-Pack (Monthly)",                       price: 19.99, swatch: "swatch-soap",  image: "assets/soap bundle.png" },
  subBalmBundle:          { name: "Tallow 3-Pack (Monthly)",                     price: 41.99, swatch: "swatch-balm",  image: "assets/Tallow Trio.png" },
  subLipBundle:           { name: "Lip Balm 3-Pack (Monthly)",                   price: 16.99, swatch: "swatch-lip",   image: "assets/Lip balm trio.png" },
  subEssentialsBundle:    { name: "The Essentials Set (Monthly)",                price: 32.99, swatch: "swatch-balm",  image: "assets/essentials bundle.png" },
  subSoapBundle3m:        { name: "Soap 3-Pack (Every 3 months)",                price: 19.99, swatch: "swatch-soap",  image: "assets/soap bundle.png" },
  subBalmBundle3m:        { name: "Tallow 3-Pack (Every 3 months)",              price: 39.99, swatch: "swatch-balm",  image: "assets/Tallow Trio.png" },
  subLipBundle3m:         { name: "Lip Balm 3-Pack (Every 3 months)",            price: 16.99, swatch: "swatch-lip",   image: "assets/Lip balm trio.png" },
  subEssentialsBundle3m:  { name: "The Essentials Set (Every 3 months)",         price: 32.99, swatch: "swatch-balm",  image: "assets/essentials bundle.png" }
};
