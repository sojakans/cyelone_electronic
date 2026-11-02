# Security review — 2 November 2026

## Changes and verification

- Pinned React Router DOM 7.18.5, PostCSS 8.5.32 and Vite 6.4.5; full npm audit reports zero known vulnerabilities.
- Production TypeScript/Vite build passes. Large JavaScript bundle warnings remain.
- Existing PGlite authorization tests pass: owner/non-owner permissions, public catalog reads, protected quotations/messages, storage permissions, and authoritative quotation totals.
- Scanned all 129 previously tracked files for private-key blocks and common credential token patterns; no matches. This is a targeted scan, not a guarantee that all possible secrets are absent.
- Ignore all environment files except `.env.example`, and ignore `.vercel` local state.
- Added response headers against framing, MIME sniffing, unsafe base/object embedding, and unnecessary device permissions.
- Supabase project `kbxrrvtnscwzpzbcfoer`: all six public tables have RLS enabled; one owner membership exists.
- Applied `restrict_internal_function_execution`: clients can no longer execute the internal `rls_auto_enable()` event-trigger function. Verified permissions after applying.
- Live requests using the publishable key can read products/categories; quotation/message reads return permission denied; unknown quotation verification returns no rows.

## Remaining findings and limits

- Supabase leaked-password protection is disabled. Enable it in Auth settings where supported by the project's plan: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No paid plan upgrade was performed.
- The quotation verifier intentionally remains public and `SECURITY DEFINER`; advisors flag this. Its reviewed query requires a full reference and returns only six limited fields. It does not expose phone, full customer name, or items. The local tests validate this boundary.
- The contact form has validation and a honeypot but no robust server-side anti-spam rate limit/CAPTCHA.
- Owner browser sign-in, recovery email delivery, uploads and Realtime were not tested with owner credentials.
- The database currently has one product. The frontend also merges a bundled catalog into results. Bundled prices and stock need owner validation; no catalog import or overwrite was performed during this security review.
- This review is not an exhaustive penetration test or a guarantee of security.

## Vercel deployment

Target repository: `sojakans/cyelone_electronic`, branch `main`.
Prepared project name: `cyelone-electronic`; framework Vite; Node 22+; install `npm ci`; build `npm run build`; output `dist`.

Set production build variables from the local ignored configuration:

- `VITE_SUPABASE_URL`: the intended Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: the existing publishable key only; never a secret/service-role key.
- `VITE_OWNER_EMAIL`: existing owner alias configuration (public browser value).
- `VITE_SITE_URL`: verified final HTTPS deployment origin.

All `VITE_*` variables are public. Configure the Supabase Auth site URL and `/admin/reset-password` redirect for the final domain, then verify recovery email delivery. Keep preview/development database access separate from production.

Vercel project creation currently returns HTTP 403 because the connection lacks authorization for team `sojakan` (`team_x46sHy1Za9VD1wIIBDIaR4m9`). Deployment and remote environment-variable setup require the returned Vercel team-consent link to be approved. No Vercel deployment URL has been verified yet.
