# GROUNDED Website — Setup Guide

This site has a real shopping cart: visitors can add multiple products and
bundles, then check out once for the whole order. To make that work, a
small serverless function (`/api/create-checkout-session.js`) talks to
Stripe on your behalf — this guide walks through connecting it.

## 1. Create your Stripe products

In the Stripe Dashboard, go to **Product Catalog** and create one product
for each of these, with the price shown:

| Product | Price |
|---|---|
| Raw Milk Soap — Unscented | £11.99 |
| Raw Milk Soap — Citrus & Lavender | £11.99 |
| Raw Milk Soap — Mint & Tea Tree | £11.99 |
| Tallow Body Balm | £24.99 |
| Lip Balm | £9.99 |
| Soap Trio (3 Bars) | £24.99 |
| Body Balm Trio (3 Jars) | £49.98 |
| Lip Balm Trio (3 Tins) | £19.99 |
| The Essentials Set | £39.99 |

For each one, click into the product and copy its **Price ID** — it looks
like `price_1AbCdEfGhIjKlMnO`. You'll need all nine in step 3.

Tip: start in **Test mode** (toggle top-right in Stripe) so you can test
checkout with fake cards before going live.

## 2. Get your Stripe secret key

In Stripe, go to **Developers > API keys** and copy your **Secret key**
(starts `sk_test_...` in test mode, `sk_live_...` once live). Never put
this in any file that goes to GitHub — it only ever goes into Vercel's
environment variables (step 3).

## 3. Add environment variables in Vercel

In your Vercel project: **Settings > Environment Variables**, and add:

- `STRIPE_SECRET_KEY` — your secret key from step 2
- `PRICE_SOAP_UNSCENTED` — Price ID for that product
- `PRICE_SOAP_CITRUS_LAVENDER`
- `PRICE_SOAP_MINT_TEA_TREE`
- `PRICE_BODY_BALM`
- `PRICE_LIP_BALM`
- `PRICE_SOAP_BUNDLE`
- `PRICE_BALM_BUNDLE`
- `PRICE_LIP_BUNDLE`
- `PRICE_ESSENTIALS_BUNDLE`

(`.env.example` in this folder lists these too, as a reference.)

## 4. Deploy

This site needs the serverless function to actually run, so a plain
drag-and-drop static deploy won't pick it up reliably. Instead:

1. Push this folder to a new GitHub repository
2. In Vercel, choose **Add New Project** and import that repository
3. Vercel will detect `package.json` and the `/api` folder automatically
   and deploy both the site and the checkout function together

After deploying, connect your domain under **Settings > Domains** and
point `becomegrounded.co` at it (Vercel gives you the exact DNS records
to add wherever your domain is registered).

## 5. Test it

Add a few items to the cart, click Checkout, and you should land on
Stripe's hosted payment page. Use Stripe's test card `4242 4242 4242 4242`
with any future expiry date and any 3-digit CVC to simulate a successful
payment while you're still in test mode.

Once everything works end to end, switch your Stripe account to **Live
mode**, swap the secret key and price IDs over to the live versions in
Vercel, and you're ready to take real orders.

## Day-to-day

- Adding a new scent or product: create it in Stripe, add a new
  environment variable in Vercel, add it to `PRODUCTS` in `products.js`,
  and add the matching button in `shop.html`.
- Changing a price: update it in Stripe (Stripe treats this as a new
  Price ID — old links/IDs still work for existing customers), then
  update the relevant environment variable and the display price in
  `products.js`.
