# Amazon Clone — Frontend

A rebuild of amazon.com's shopping experience, built for the 8x engineering
assignment. Next.js 16 (App Router), React 19, Tailwind 4, NextAuth v5.

**Backend repo:** [jobtask-cloneAmazon-backend](https://github.com/amuqsit57/jobtask-cloneAmazon-backend)

---

## What works

Three roles, all complete end to end against a real Postgres database, covered
by **175 passing assertions** across four test suites.

### Customer

| Flow | Detail |
|---|---|
| **Home** | Auto-advancing hero carousel, category cards, horizontally scrolling product rails |
| **Search** | Postgres full-text search with relevance ranking, live suggestions in the header |
| **Browse & filter** | Department, price band, rating floor and Prime facets; five sort orders; pagination |
| **Product detail** | Hover-swap gallery with zoom, buy box, variants, rating histogram, reviews, related items |
| **Cart** | Guest cart, quantity stepper, save for later, free-shipping progress |
| **Auth** | Register and sign in; the guest cart merges into your account on sign-in |
| **Checkout** | Address → payment → review, with delivery speeds, promo codes and gift options |
| **Orders** | History and detail, reading snapshotted line items |
| **Wishlists** | Add from any product, make the list public, share it by link |
| **Q&A** | Read questions and answers, ask a question, answer someone else's |
| **Reviews** | Write one, rate 1–5, vote others helpful; Verified Purchase is earned, not claimed |
| **Returns** | Request against a delivered line, pick a reason, see the refund; stock is restocked |
| **Prime** | Join or cancel; membership makes the upgrade shipping tiers free |

### Seller — Seller Central

| Flow | Detail |
|---|---|
| **Dashboard** | Revenue, units, 30-day sales chart, low stock, best sellers |
| **Products** | List, create, edit price and stock inline, archive |
| **New listing** | Full form; submits for admin review rather than going live |
| **Orders** | Only lines containing their products; confirm shipment with tracking |
| **Inventory** | Bulk stock management with low-stock highlighting |

### Admin — Admin Console

| Flow | Detail |
|---|---|
| **Overview** | Platform GMV, user counts, per-seller revenue table |
| **Moderation** | Approve, reject with a reason, or archive any listing |
| **Users** | Every account, lifetime spend, promote or demote roles |
| **Orders** | All orders across the platform |
| **Audit log** | Every moderation decision and role change, attributed |

### The marketplace loop

The thing that makes this a marketplace rather than a shop:

> A seller creates a listing → it is **invisible** in customer search while pending
> → an admin approves it → it appears in search → a customer buys it → the sale
> lands on the seller dashboard → the seller ships it with tracking.

Every step of that is asserted in `test/roles.mjs`.

---

## Demo accounts

All use the password `Password123!`

| Email | Role | |
|---|---|---|
| `demo@example.com` | Customer | Has order history |
| `seller@example.com` | Seller | Nova Retail Group — 7 products |
| `seller2@example.com` | Seller | Harbor Home & Kitchen — 5 products |
| `seller3@example.com` | Seller | Meridian Supply Co. — 8 products |
| `admin@example.com` | Admin | Full console access |

Promo codes: `SAVE10`, `WELCOME5`, `BIGDEAL20`, `FREESHIP`.

---

## What I deliberately left out, and why

The brief allows 24 hours and judges *what you chose to build first, and what you
left out*. Amazon is twenty years of product; attempting all of it produces forty
broken pages. I chose instead to make the customer experience genuinely complete,
then said no to the rest.

Cut, with reasoning:

- **Delivery / driver app** — Amazon Flex is mobile-first: claiming route blocks,
  scanning packages, capturing proof-of-delivery photos, working offline in a van
  with no signal. A browser version would be a list with a "mark delivered"
  button, which misses everything that makes the real thing work. This is the one
  role that genuinely needs a different platform, so it was cut deliberately.
- **Seller advertising, FBA and payouts** — Sponsored Products with keyword
  bidding, fulfilment-by-Amazon shipment workflows, payout reconciliation with
  fee breakdowns, account health metrics. Each is a product in its own right; the
  seller area covers listing, inventory, orders and analytics instead.
- **Prime Video / Music / Alexa / Fresh** — separate products that happen to share
  a login. No overlap with the purchase flow.
- **Real payment processing** — Stripe is well-understood plumbing. Checkout
  collects a card and stores only the last four digits. The transactional order
  placement is the part worth demonstrating, and that is real.
- **Recommendation ML** — "related items" here is category similarity. A real
  recommender needs behavioural data a seeded catalog does not have.
- **Multi-SKU variants** — variant pickers render and select, but the catalog has
  one SKU per product, so choosing a colour does not change price or stock. Doing
  it properly means a SKU table, per-SKU inventory and cart lines keyed by SKU.
  Visible in the UI, honestly scoped in the code.
- **Address book at checkout** — the API supports saved addresses
  (`/api/addresses`), but checkout types one in rather than offering a picker.
- **Subscribe & Save, registries, 1-Click, digital content** — conveniences layered
  on a purchase flow that already works.

---

## Running locally

You need the backend running first — see its README.

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
AUTH_SECRET=<any long random string>
AUTH_TRUST_HOST=true
```

Open http://localhost:3000.

---

## Notable implementation decisions

**Amazon's actual colours.** `#131921` nav, `#232F3E` sub-nav, `#FFD814` buttons,
`#B12704` price red, `#007185` link teal, taken from the site rather than
approximated. Most of what makes a clone read as Amazon at a glance is getting
these exactly right.

**Light mode only.** Amazon has no dark mode. Honouring `prefers-color-scheme`
would make the clone look *less* like the original, so the palette is committed to
light deliberately rather than by omission.

**NextAuth owns the session, Express owns identity.** Signing in posts credentials
to the API, which verifies them and returns a JWT. That JWT rides inside the
NextAuth session, so every client call is authenticated by the backend. One source
of truth, two layers each doing what they are good at.

**Guest carts survive sign-in.** The cart is keyed by a localStorage session id
before you have an account, and merged into your user cart on sign-in. Without
this, anything a visitor added vanishes the moment they register — which is the
difference between a demo and something usable.

**The home page degrades instead of erroring.** Render's free tier sleeps after
15 minutes idle. A cold API returns an empty shell with an explanation rather
than a 500, so a first visitor sees the site rather than a stack trace.

**URL-driven search state.** Every filter and sort lives in the query string, so
results are shareable and the back button behaves.

---

## Deploying

Deployed on Vercel. Set in project settings:

- `NEXT_PUBLIC_API_URL` — the Render API URL plus `/api`
- `AUTH_SECRET` — `npx auth secret`
- `AUTH_TRUST_HOST` — `true`

The backend's `CORS_ORIGIN` must include the deployed frontend URL.
