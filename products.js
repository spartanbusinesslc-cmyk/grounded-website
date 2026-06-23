/* ============================================
   GROUNDED — Product Catalog
   ---------------------------------------------
   This is the single source of truth for product
   names, display prices and swatch styling used
   across the site. The actual checkout price is
   always re-verified server-side against Stripe —
   this file is for display purposes only.
   ============================================ */

const PRODUCTS = {
  soapUnscented: {
    name: "Raw Milk Soap — Unscented",
    price: 11.99,
    swatch: "swatch-soap"
  },
  soapCitrusLavender: {
    name: "Raw Milk Soap — Citrus & Lavender",
    price: 11.99,
    swatch: "swatch-soap"
  },
  soapMintTeaTree: {
    name: "Raw Milk Soap — Mint & Tea Tree",
    price: 11.99,
    swatch: "swatch-soap"
  },
  oliveUnscented: {
    name: "Olive Oil Soap — Unscented",
    price: 11.99,
    swatch: "swatch-soap"
  },
  oliveCitrusLavender: {
    name: "Olive Oil Soap — Citrus & Lavender",
    price: 11.99,
    swatch: "swatch-soap"
  },
  oliveMintTeaTree: {
    name: "Olive Oil Soap — Mint & Tea Tree",
    price: 11.99,
    swatch: "swatch-soap"
  },
  bodyBalm: {
    name: "Tallow Body Balm",
    price: 24.99,
    swatch: "swatch-balm"
  },
  lipBalm: {
    name: "Lip Balm",
    price: 9.99,
    swatch: "swatch-lip"
  },
  soapBundle: {
    name: "Soap Trio (3 Bars)",
    price: 24.99,
    swatch: "swatch-soap"
  },
  balmBundle: {
    name: "Body Balm Trio (3 Jars)",
    price: 49.98,
    swatch: "swatch-balm"
  },
  lipBundle: {
    name: "Lip Balm Trio (3 Tins)",
    price: 19.99,
    swatch: "swatch-lip"
  },
  essentialsBundle: {
    name: "The Essentials Set",
    price: 39.99,
    swatch: "swatch-balm"
  }
};
