# Robotics storefront update

The live storefront uses React, React Three Fiber, Three.js, GSAP and Supabase. The robot is a procedural 3D engineering model with separate selectable meshes. It uses the uploaded reference for a clearly labelled fallback, not as the animated model. It is not a manufacturer CAD model. No ESP32 is shown because the assembly uses an Uno.

The 22-second sequence includes entrance, separation, discovery, product highlights, reassembly and a final rotation. Pause, replay, accessible component buttons and reduced-motion support are included. WebGL failure shows the reference and preserves shopping controls. The 3D bundle is lazy-loaded, rendering uses a capped pixel ratio, and shadows use a 1024-pixel map.

Products use only administrator-uploaded images. There are no fabricated prices, stock counts, ratings or sales totals. Best sellers are manually selected by the owner, not calculated from sales. The database starts with 17 categories and no products. Old generated illustrations are retained in docs/legacy-illustrations and excluded from deployment.

## Product management

In Admin > Products, set the Robot component link to associate one catalog product with a robot part. Unlink an existing product before assigning another to that same part. The database enforces uniqueness and a fixed set of valid part names. Price, quantity, photographs, enabled status and featured/bestseller flags are managed in the same form. Realtime product updates refresh the scene and cards.

The cart stores only product IDs and quantities locally. Names, availability and prices resolve from the live catalog. Out-of-stock or deleted items block order requests. Checkout prepares a WhatsApp message for the customer to send; it does not collect payments, create paid orders or reserve inventory.

## Backend options

Sites hosts the frontend and uses Supabase Auth, Postgres RLS, Storage and Realtime directly. It cannot host a persistent Node/Express process. A portable Express backend is included at server/index.mjs for a Node host: run npm run build then npm start (Node 22+). It serves the built frontend, read-only catalog APIs, and owner-authorized product mutation APIs. It forwards the authenticated Supabase JWT and uses RLS; no service-role key is required. The deployed Sites frontend does not depend on this optional server. Configure the listening host/port and HTTPS reverse proxy for external Node hosting.

## Owner setup still required

The alias admin (and legacy cyelone) maps to sojakanjakan@gmail.com. Create that account in Supabase Authentication, set its password privately, then assign the verified Auth UUID to public.admins. No password is stored in source. Restrict signups and configure recovery redirects/SMTP in the Supabase dashboard. A successful database connection is not proof that an owner account exists.

Tests cover RLS, owner checks, quote privacy, authoritative totals, robot-part uniqueness and invalid part rejection. TypeScript and Vite builds run before publication. Existing moderate React Router dependency advisories remain; there is no server-side React hydration, and product slugs are constrained.
