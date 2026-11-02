# Ceylon Electronics

**Security review, 2 November 2026:** Updated Vite, PostCSS and React Router (now v7) to patched versions; `npm audit` reports zero known vulnerabilities. Production build and database authorization tests pass. The connected Supabase project has RLS on all six public tables and one owner membership. An internal event-trigger function no longer grants execution to client roles. See [the security review](docs/security-review-2026-11-02.md) for scope, remaining findings, and deployment requirements. This update supersedes the historical connection and dependency notes below.

**Latest status (31 October 2026):** Supabase is connected and the schema is installed. The 3D robotics storefront, live product links, cart and portable Express backend are documented in [docs/robotics-storefront.md](docs/robotics-storefront.md). Owner-account creation and real inventory uploads are still required. Historical delivery notes below describe the earlier preview.


React 18, Vite, TypeScript, React Router 6, Tailwind, Supabase, i18next, Zod, Lucide, Framer Motion, and react-hot-toast. Source and lockfile are included.

## Current delivery status

The site works in clearly labelled preview mode without environment variables. The 12 products, prices and stock counts are **illustrative sample data**, not verified store inventory. Product illustrations are placeholders for owner-uploaded product photography, explicitly labelled as illustrations.

The intended Supabase project is `kbxrrvtnscwzpzbcfoer`. The connected account returned a permission error, so **no migration, bucket, owner account, Auth setting, or database change has been applied remotely**. Live Auth, email recovery, Storage and Realtime still require end-to-end testing after connection. This delivery is not a claim of production readiness or a measured Lighthouse score.

## 1. Run locally

Use Node 22+ and npm.

```bash
npm ci
cp .env.example .env
npm run dev
```

Leave the Supabase key blank to view the demo. For real data set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. Despite the compatibility variable name, use a modern **publishable** key (`sb_publishable_...`) from the project's API keys page, or its legacy anon key. Never use a secret or service-role key. All `VITE_*` values are public browser values.

Set `VITE_SITE_URL` to your final HTTPS origin. Build environment variables must be configured before `npm run build`. Changing environment values requires rebuilding.

```bash
npm test
npm run build
npm run preview
```

## 2. Set up the NEW Supabase database

1. Open the intended Ceylon project, not the existing education project.
2. In SQL Editor run the entire `supabase/migrations/001_init.sql` once. It is a transactional fresh-schema initializer, not an idempotent migration for a populated database. Review existing schemas first.
3. It creates categories, products, quotations, messages, site content, one-owner membership, RLS, a stock-status generated column, triggers, public verification RPC, and `product-images` storage policies. Six categories and initial page copy are included.
4. Optionally run `supabase/seed.sql` on a development database for 12 sample products. Do not use these illustrative prices or inventory for launch without reviewing them.
5. Ensure the Data API exposes `public`. **Do not expose `private`.** Explicit role grants are in the migration.
6. Confirm `products` is enabled in the `supabase_realtime` publication. The migration adds it when the Supabase publication exists.
7. Run Supabase's security and performance advisors. The public quotation verification function is a deliberately restricted `SECURITY DEFINER` declassifier; it exposes six safe fields only. It has an empty search path and explicit execute grants. The helper triggers are private.

The supplied filename follows the requested `001_init.sql` manual SQL Editor workflow. If adopting CLI migrations, initialize the CLI project, discover its commands with `supabase --help`, create a migration with `supabase migration new init`, and copy this SQL into that generated file. Avoid recording the initializer twice against the same database.

## 3. Create the one owner

1. In Supabase Authentication settings disable new user sign-ups, including anonymous sign-ins. This is a dashboard setting, not something the frontend can enforce.
2. In Authentication > Users create the owner's email/password account using a private strong password. Never place the password in frontend code, source control, or this chat.
3. Copy that user's UUID. Use SQL Editor to add it to `public.admins`:

```sql
-- Replace the quoted value with the actual Auth user UUID you just copied.
insert into public.admins(user_id) values ('OWNER_AUTH_USER_UUID'::uuid);
```

4. The singleton constraint allows only one owner. Other authenticated accounts have no catalog write permissions. Clients cannot edit `admins`.
5. Set the Auth Site URL to your HTTPS website. Add `https://YOUR_DOMAIN/admin/reset-password` to the redirect allowlist; for development add `http://localhost:5173/admin/reset-password`.
6. Configure a production SMTP provider for reliable reset emails. Verify delivery. Request password reset in the same browser where the emailed link will be opened because the client uses PKCE.
7. Visit `/admin/login`. The public navbar intentionally contains no admin link. Verify owner login and password recovery before launch.

The frontend signs out locally after 15 minutes without pointer/keyboard/touch activity. This is an interactive session UX timeout, not server-side token revocation. RLS remains the authorization boundary.

## 4. Manage the store

- Dashboard: product, in-stock, low-stock and out-of-stock totals, plus recently updated products. This is not a full historical audit log.
- Products: create/edit/delete products, specifications as a JSON object of string values, category, availability, featured state, price, quantity, bulk price, and low-stock threshold.
- Images: JPEG/PNG/WebP input up to 15 MB; browser resizes to 1600 pixels and uploads WebP. Bucket accepts image formats only and enforces 5 MB per stored object. Up to 12 images per product. Image removal detaches the URL; it does not delete Storage objects. Remove unused objects in the dashboard when appropriate.
- Quick stock: inline price/quantity editing uses the prior `updated_at` timestamp to detect concurrent changes. Bulk actions include zero stock, category changes, and confirmed deletion.
- CSV: export provides the import format, including category UUIDs and JSON for images/specs. Import validates all rows before an upsert on slug (max 1000 rows / 2 MB). Use exported column headers. Export protects against spreadsheet formula injection. CSV category UUIDs must exist in this database.
- Categories: name, slug and ordering. Deleting a category leaves its products uncategorized.
- Quotations: editable item quantities and prices; Postgres computes the authoritative total. Sequence-based references append a random UUID suffix to prevent easy public enumeration. Verification requires the **complete** reference. The UI displays an expired status when the valid-until date has passed. Cancel using the status selector.
- Print/PDF: Print / PDF opens the browser print dialog; choose Save as PDF for an A4 document. No external PDF service is involved.
- Messages: read/unread and deletion; latest 500 shown. Contact form has a honeypot and database length checks. A honeypot reduces simple spam but is not a rate limiter. Add server-side CAPTCHA/rate limiting for higher-volume public use.
- Content: edit About, Legacy, hero and displayed contact details. Content is rendered as plain React text, not HTML. Edit `src/config/business.ts` for telephone/WhatsApp link destinations, map address, and social links. Facebook and TikTok are omitted until actual account URLs are supplied.

## 5. Languages and branding

`src/locales/en.json`, `ta.json`, and `si.json` contain English, Tamil and Sinhala UI strings. The language selector stores the choice in localStorage. Product/category names and owner-authored page content remain as entered; technical errors can be returned in English by the SDK. Have native speakers review translated copy before publishing. Font is Inter with system fallbacks.

Business identity, address, hours, WhatsApp number, map and social profiles are configured in `src/config/business.ts`. About/Legacy copy makes no invented claims about founding dates or awards.

## 6. Deployment

### Netlify

Import this repository. `netlify.toml` sets `npm run build`, `dist`, and SPA fallback. Add the public Supabase environment variables and final `VITE_SITE_URL`, then deploy. Add the reset-password URL to Supabase Auth.

### Vercel

Import this repository as a Vite project. Build command `npm run build`, output `dist`. `vercel.json` provides the SPA rewrite. Set the same environment variables and Auth redirects.

### Firebase Hosting

Install the official Firebase CLI, authenticate, choose your Firebase project with `firebase use --add`, run `npm run build`, then `firebase deploy --only hosting`. `firebase.json` serves `dist` with a SPA rewrite. HTTPS is supplied by the host. Environment variables must be present before building.

### Private review preview

The supplied review link is private. It uses sample data because backend access is blocked. Do not describe it as the live store. Before public release connect Supabase, replace demo data/photos, confirm translations and business information, and complete the checklist below.

SEO: Helmet titles/meta/canonical and LocalBusiness JSON-LD, robots and sitemap generation on build. Sitemap includes public top-level routes. Add product URLs to your sitemap as the catalog grows. Because this is a client-rendered SPA, social crawlers that do not run JavaScript may only read index.html; for reliable per-product social previews use a prerendering service or SSR. No Lighthouse score has been claimed.

## 7. Verification and launch checklist

Already executed locally:

- TypeScript check and Vite production build.
- Real PostgreSQL-compatible PGlite test: migration/seed execution, one-owner constraint, public catalog read, denied anonymous product writes, denied anonymous quotation/message reads, blocked non-owner product and image writes, successful owner writes, generated stock status, database-calculated quote total, invalid quote item rejection, honeypot constraint, and safe first-name-only quotation verification.
- PGlite uses test stubs for Supabase Auth and Storage. It does not test the hosted Auth service, Storage HTTP API, email service, or Realtime websocket delivery.

Complete against your live development project before publishing:

- [ ] Anonymous catalog is readable; direct anonymous insert/update/delete attempts fail.
- [ ] An authenticated non-owner cannot write products or read quotations/messages.
- [ ] Owner adds a product and uploads images successfully.
- [ ] Public browser in a second session shows stock/price changes live.
- [ ] Low-stock, zero-stock and unavailable flags show correct badges.
- [ ] Owner signs out after idle time and can recover a password through email.
- [ ] CSV import validates incorrect rows and updates matching slugs as intended.
- [ ] Valid, expired, cancelled, unknown and partial quotation numbers behave correctly.
- [ ] Verification never reveals surname, phone, item list or internal IDs.
- [ ] Contact submission succeeds without requesting SELECT permission; visitors cannot read messages.
- [ ] Print/PDF contains items, totals, full reference and verification URL.
- [ ] English/Tamil/Sinhala navigation, keyboard focus, mobile layout and contrast are reviewed.
- [ ] Replace illustrative prices, stock, descriptions and images with real business data.
- [ ] Run Lighthouse on the final HTTPS build and optimize to the requested >90 target.
- [ ] Check production redirect allowlist, SMTP, sign-up settings, advisors and backups.

Documentation: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/storage/security/access-control

## Dependency audit

The final production dependency audit found no high or critical advisories, but reports two moderate entries affecting React Router / react-router-dom v6.30.6. The requested v6 major was retained. The advisory topics are untrusted backslash navigation and SSR error hydration. This application uses validated slugs and fixed internal navigation, and does not use SSR hydration. Reassess advisories before launch; migration to patched Router v7 requires changing the requested stack and regression testing. Zod was upgraded to 4.6.7 to resolve its reported high-severity advisory.

## Owner username

The Admin navigation button opens the protected owner dashboard, redirecting signed-out visitors to the login form. `cyelone` is an alias for the Supabase Auth email configured through `VITE_OWNER_EMAIL`. Authentication and the single-owner database role still control access. No password is stored in the browser source.

After connecting the intended Supabase project, create the owner Auth account, set its password in Supabase Auth, and assign its user ID to `public.admins` following the original setup instructions. Set `VITE_OWNER_EMAIL` to that account's email and rebuild. Login and owner writes remain disabled until backend setup is complete.

The product editor includes name, photos, price, stock quantity and availability. Quantity zero means out of stock. The availability switch can temporarily disable sales without changing the recorded quantity.

## Supabase connection update — 2026-10-31

The production build now uses the intended Supabase project and its public publishable key from `.env.production`. The initial schema has been applied remotely, including RLS, storage policies, categories and page content. No sample product stock or prices were imported. The visible owner username defaults to `admin`; both `admin` and legacy `cyelone` resolve to `VITE_OWNER_EMAIL` when configured. An Auth owner account and its membership are still required; no password is included in the source. The site origin is now the current ssakan439.chatgpt.site deployment.
