# Amazon Clone — Frontend

A rebuild of amazon.com's shopping experience, built for the 8x engineering
assignment. Next.js 16 (App Router), React 19, Tailwind 4, NextAuth v5.

**Backend repo:** [jobtask-cloneAmazon-backend](https://github.com/amuqsit57/jobtask-cloneAmazon-backend)

---

## What works

Every flow below is complete end to end against a real Postgres database.

| Flow | Detail |
|---|---|
| **Home** | Auto-advancing hero carousel, category cards, horizontally scrolling product rails |
| **Search** | Postgres full-text search with relevance ranking, live suggestions in the header |
| **Browse & filter** | Department, price band, rating floor and Prime facets; five sort orders; pagination |
| **Product detail** | Hover-swap gallery with zoom, buy box, variants, rating histogram, reviews, related items |
| **Cart** | Guest cart, quantity stepper, save for later, free-shipping progress |
| **Auth** | Register and sign in; the guest cart merges into your account on sign-in |
| **Checkout** | Three-step accordion (address → payment → review) with server-recomputed totals |
| **Orders** | History and detail, reading snapshotted line items |

Try it with the demo account: `demo@example.com` / `Password123!`

---

## What I deliberately left out, and why

The brief allows 24 hours and judges *what you chose to build first, and what you
left out*. Amazon is twenty years of product; attempting all of it produces forty
broken pages. I chose instead to make the core purchase path genuinely work.

Cut, with reasoning:

- **Prime Video / Music / Alexa / Fresh** — entire separate products. Zero overlap
  with the purchase flow that makes Amazon *Amazon*.
- **Seller / marketplace portal** — a second application with its own auth,
  inventory and payout model. A day's work on its own.
- **Real payment processing** — Stripe integration is well-understood plumbing.
  The checkout collects a card and stores only the last four digits; wiring a real
  processor would demonstrate less than the transactional order placement does.
- **Recommendation ML** — "customers also bought" here is category similarity.
  A real recommender needs behavioural data that a seeded catalog does not have.
- **Returns / A-to-z claims** — post-purchase support flow, not the purchase.
- **Multi-SKU variants** — variant pickers render and select, but the seeded
  catalog has one SKU per product, so choosing a colour does not change the price
  or the cart line. Modelling true variant inventory means a SKU table, per-SKU
  stock and cart lines keyed by SKU. Visible in the UI, honestly scoped in code.
- **Address book at checkout** — the API supports saved addresses
  (`/api/addresses`), but checkout uses a single typed-in address rather than a
  picker.

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
