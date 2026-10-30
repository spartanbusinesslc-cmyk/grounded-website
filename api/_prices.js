/* Shared: product id -> Stripe Price ID (used by checkout and by the order lookup for the success page) */
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
  // 3-month subscription variants — single items
  subSoapUnscented3m: "price_1UVuP65eqX21Gs5ofrTt3H5T",
  subSoapCitrusLavender3m: "price_1UVuPu5eqX21Gs5o1A2yml3v",
  subSoapMintTeaTree3m: "price_1UVuQT5eqX21Gs5o6W5Y5PTu",
  subOliveUnscented3m: "price_1UVuQv5eqX21Gs5oGmCglq1a",
  subOliveCitrusLavender3m: "price_1UVuRI5eqX21Gs5oqZXlPZJQ",
  subOliveMintTeaTree3m: "price_1UVuRg5eqX21Gs5okbobgOQH",
  subBodyBalm3m: "price_1UVuSc5eqX21Gs5okiEcBxKt",
  subLipBalm3m: "price_1UVuTk5eqX21Gs5oWoDfFl2v",
  // 3-month subscription variants
  subSoapBundle3m:        process.env.PRICE_SUB_SOAP_BUNDLE_3M,
  subBalmBundle3m:        process.env.PRICE_SUB_BALM_BUNDLE_3M,
  subLipBundle3m:         "price_1U3zkq5eqX21Gs5oSeFELSoW",
  subEssentialsBundle3m:  process.env.PRICE_SUB_ESSENTIALS_BUNDLE_3M,
  // Subscription prices — single items
  subSoapUnscented:       process.env.PRICE_SUB_SOAP_UNSCENTED,
  subSoapCitrusLavender:  process.env.PRICE_SUB_SOAP_CITRUS_LAVENDER,
  subSoapMintTeaTree:     process.env.PRICE_SUB_SOAP_MINT_TEA_TREE,
  subOliveUnscented:      process.env.PRICE_SUB_OLIVE_UNSCENTED,
  subOliveCitrusLavender: process.env.PRICE_SUB_OLIVE_CITRUS_LAVENDER,
  subOliveMintTeaTree:    process.env.PRICE_SUB_OLIVE_MINT_TEA_TREE,
  subBodyBalm:            "price_1UVuqs5eqX21Gs5oy69HE3US",
  subLipBalm:             process.env.PRICE_SUB_LIP_BALM
};

module.exports = { PRICE_MAP };
