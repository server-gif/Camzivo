# Random Video Chat Demo (Camzivo)

A simulated random video chat experience. The live grid shows still pictures from `public/Video_Girl_image/` and the connecting screen is an animation. There is no live connection, no camera or microphone access, no chat, and no matching. The UI says so plainly wherever it matters.

Brand name in the UI: **Camzivo** (original name, logo and copy — change `BRAND_NAME` in `src/components/layout/Logo.tsx`).

## Stack

| Area | Choice |
| --- | --- |
| Build | Vite 8, TypeScript 7 (strict) |
| UI | React 19, Tailwind CSS 4, Lucide icons, shadcn/ui-style primitives (`src/components/ui`) |
| Routing | React Router 7 (data router, lazy routes) |
| Forms | React Hook Form + Zod 4 |
| State | One small React Context for onboarding; local state everywhere else |
| Tests | Vitest 5, React Testing Library, jsdom |
| Hosting | Cloudflare Pages (static) |

> The shadcn/ui CLI was not run. `button`, `badge` and `choice-card` follow the shadcn pattern (`cva` + `cn()`), so you can add real shadcn components later with `npx shadcn@latest init` without conflicts.

## Getting started

Requires Node.js 20.19+ (22 LTS recommended).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run typecheck` | Strict TypeScript check (app + Vite config) |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Tests in watch mode |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm run preview` | Serve `dist/` locally to check the production build |

## The flow

| Route | Page | Guard |
| --- | --- | --- |
| `/` | Landing — hero, features, how it works, FAQ | — |
| `/age` | Age range + explicit 18+ confirmation | — |
| `/gender` | Male / Female / Other / Prefer not to say | Needs 18+ confirmation |
| `/clips` | Live grid — one card per picture in `public/Video_Girl_image/` | Needs both steps |
| `/girl-find` | The connecting screen a card leads to, with the rewarded Connect button | — |
| `/about`, `/privacy`, `/terms`, `/contact` | Info pages (privacy/terms/contact are **drafts**) | — |
| anything else | Custom 404 | — |

Visiting a later step directly redirects to the first incomplete one. **Exit demo** clears progress and returns home.

## The live grid's pictures

`/clips` shows one card per picture in `public/Video_Girl_image/`. The folder
*is* the list: `src/data/girlImages.ts` asks Vite for its contents while it
builds, so no file name has to be written down in code, config or an env file.

- Drop a `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` or `.avif` into the folder, reload, the card appears.
- Delete one, reload, the card is gone.
- Cards follow the number at the end of the file name (`stroke bg-2` before
  `stroke bg-10`); a name without a number sorts after the numbered ones.
- The name under each picture comes from `DEMO_NAMES` in `src/data/girlImages.ts`,
  handed out in that same order. They are invented demo names — the file names
  (`stroke bg-3.png`) are export labels and are never shown. A folder with more
  pictures than the list has names reuses them from the top.

Nothing is fetched at runtime, so a deployed page changes when you rebuild it.
The current set is ~1 MB PNGs, loaded lazily so only the pictures on screen are
fetched.

The pictures in the folder are not plain photos: each one is a smaller photo
with a light stroke and rounded corners drawn around it, floating on a
transparent canvas with a soft shadow (on a 912×1040 file the solid picture
covers only the middle 74% × 79%). `ClipCard` places each picture at that
measured box, so the stroke, the shadow and the drawn corners fall outside the
card and the card does the rounding. Plain full-frame photos work too — they
lose about 4% of their width and 3% of their height to the same placement.

### Assets you need to supply

The project ships with the 15 pictures you put in `public/Video_Girl_image/`, so
the flow works end to end. Before publishing, check:

- [ ] Pictures you own or are licensed to use, one per card, and matching names in `DEMO_NAMES`.
- [ ] A compressed version of each (WebP or AVIF, ~100 KB) — 15 PNGs at ~1 MB are 16 MB on the wire.
- [ ] Real contact email in `src/pages/InfoPage.tsx` (`CONTACT_EMAIL`).
- [ ] Reviewed Privacy Policy and Terms text (current versions are marked as drafts).

## Grid behaviour

- Every picture in the folder becomes a card, two to a row, and each card links
  to `/girl-find`.
- A card is a still picture filling a 5:6 frame, a **Live** badge flush in its
  top-left corner, and the name over a soft darkening at the bottom-left with a
  small round avatar cut from the same picture. The card adds no border or ring
  of its own.
- Tapping a card fires the interstitial ad first (when GAM is on) and then
  navigates; with ads off it navigates straight away.
- An empty folder says so on the page and names the folder, instead of showing a
  blank grid.

## Privacy and the age gate

**What is stored:** three booleans in `sessionStorage` (`ageConfirmed`, `ageDenied`, `genderCompleted`) so a page refresh keeps your place. The **age range and gender value are never stored** — the gender choice lives in memory only. Session storage clears when the tab closes; *Exit demo* clears progress immediately.

**Trade-off:** in-memory-only state would be even more private, but refreshing `/clips` would then bounce visitors back to the start. Storing only booleans in session (not local) storage is the compromise.

**Age gate:** choosing "Under 18" closes the gate for the rest of the browser session (Exit demo does not reopen it), and all later routes redirect back to it.

> ⚠️ **A client-side age gate is not age verification.** Anyone can clear storage, use a private window, or simply lie. It discourages casual access only. If the product ever serves genuinely adult content, you need server-side, legally reviewed age assurance appropriate to your jurisdictions.

**Other measures:** no analytics or third-party scripts, no camera/microphone requests, `Permissions-Policy` header disabling camera/microphone/geolocation, no secrets in the frontend (none are needed).

## Accessibility

Semantic landmarks and a skip link, one `<h1>` per page, per-route document titles, native radio/checkbox inputs behind the selection cards (selection shown with a check mark and border, not colour alone), `aria-invalid` + `aria-describedby` + `role="alert"` on validation errors, labelled icon buttons with visible tooltips, visible focus rings, `prefers-reduced-motion` support, and text contrast at WCAG AA or better on the dark palette.

## Testing

```bash
npm test
```

26 tests across 5 files cover: the welcome, age and gender steps with their validation (missing range, missing confirmation, under-18 restart via Back to home), the flow through to the live grid, route guards, Exit demo, footer links, 404, the ad configuration, the onboarding storage helpers, the folder scan behind the grid (url and name per picture, file-name number order, distinct names), and the grid itself — one card per picture in `public/Video_Girl_image/`, in that order, each card a link into the connecting screen, and no video element left on a card.

`src/test/setup.ts` forces Google Ad Manager off and stubs what jsdom lacks (scrolling, and the canvas Lottie probes on load). Layout and overflow were checked separately in the browser at phone and desktop sizes.

## Deploying to Cloudflare Pages

**Option A — Git integration (recommended)**

1. Push the project to GitHub or GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build settings:
   - Framework preset: **Vite** (or None)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable (optional): `NODE_VERSION` = `22`
4. Deploy. Rebuild after changing `public/Video_Girl_image/`; a deployed page
   shows the pictures that were in the folder when it was built.

**Option B — Direct upload**

```bash
npm run build
npx wrangler pages deploy dist --project-name=random-video-chat-demo
```

**Included config**

- `public/_redirects` — `/* /index.html 200` so deep links like `/girl-find` load the app instead of 404ing. Static files (pictures, assets) are still served directly.
- `public/_headers` — security headers and long-term caching for hashed `/assets/*` files.

After deploying, open `https://<project>.pages.dev/girl-find` and `/privacy` directly in a new tab to confirm SPA routing works.

### Troubleshooting

| Problem | Fix |
| --- | --- |
| Refreshing `/age` or `/girl-find` gives a 404 | Make sure `dist/_redirects` exists after building (it's copied from `public/`). |
| Blank page, 404s for `/assets/*.js` | Output directory must be `dist`. Keep `base: '/'` in `vite.config.ts` unless you deploy under a sub-path. |
| A card shows no picture | The file is not in `public/Video_Girl_image/`, or its extension is not one of png/jpg/jpeg/webp/gif/avif — the grid is built from that folder. Names are case-sensitive. |
| The grid is empty on a deployed build | The pictures were added after the build; rebuild. Nothing is read at runtime. |
| The page is slow to open | These are ~1 MB PNGs. Convert them to WebP/AVIF, or keep fewer in the folder. |
| Old page loads after a deploy | Lazy chunks from a previous deploy may be gone; the error screen offers Reload. |

## Project structure

```
src/
  app/            App, router, guards, providers, layout, scroll + error handling
  pages/          Welcome, Age, Gender, Clips (live grid), GirlFind, Info (about/privacy/terms/contact), NotFound
  components/
    layout/       FlowPanel, PageContainer, Header, Footer, Logo
    onboarding/   ProgressIndicator, AgeSelector, GenderSelector, OnboardingLayout, CrmNote
    video/        ClipCard — one picture with its Live badge, avatar and name
    landing/      WelcomeHero (Lottie)
    ads/          AdBanner, AdAnchor
    ui/           Button, Badge, ChoiceCard, FieldError
  features/
    onboarding/   schema (Zod), types, storage utils, context
  config/ads.ts   GAM switch and ad unit paths
  data/girlImages.ts  the grid's pictures, read from public/Video_Girl_image/, plus the demo names on them
  hooks/          useAdNavigation, usePageTitle
  lib/            cn(), gpt.ts (Google Ad Manager loader)
  styles/globals.css    Tailwind theme tokens and base styles
  test/           setup + route render helper
public/
  Video_Girl_image/   the grid's pictures — add or delete files, then reload
  animations/        Lottie scenes
  videos/ images/    left over from the demo-player version, nothing loads them
  _redirects  _headers  favicon.svg
.env.example      GAM switch and ad unit paths template (copy to .env)
vite.config.ts    React, Tailwind, the @ alias and the Vitest config
tsconfig.json
package.json
```

## What's implemented vs. optional

**Implemented:** the flow pages (welcome, age, gender, live grid, connecting) plus about/privacy/terms/contact and 404; guarded routing with back/forward support; validated onboarding forms; a grid built from a folder of pictures — one card each, in file-name order, named from a demo list, each linking into the connecting screen; Google Ad Manager banner, interstitial, rewarded and anchor slots that step aside when unconfigured; responsive layout; accessibility and reduced-motion support; tests; Cloudflare Pages config.

**Optional / future:**

- Compressed pictures in the grid folder — the current set is 15 × ~1 MB PNGs.
- Real motion on the cards: the grid is still images today, so a clip per card would mean bringing video back into `ClipCard`.
- Filtering the grid by the gender answer — `GenderPage` already stores the value in context; `girlImages` is the place to filter. Only add it if it's genuinely needed and disclosed.
- ESLint/Prettier, Playwright end-to-end tests in CI.
- Legal review of the draft policies.
