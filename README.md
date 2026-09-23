# Frecom — audio objects

A statically exported storefront for a small line of studio-lit audio objects. Six products,
each rendered live in the browser from procedural geometry, wrapped in five layers of motion,
and shipped as plain HTML/CSS/JS that any CDN can serve.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # emits ./out
npm run preview    # serves ./out on :4173
```

---

## What is actually here

| Route | What it is |
| --- | --- |
| `/` | Live 3D hero, marquee band, asymmetric two-up, pinned camera story, horizontal rail, bone workshop section |
| `/products` | Filter + sort catalogue with a shared hover preview panel |
| `/products/[slug]` | Detail: 3D configurator, scroll-linked callouts, spec table, material lightbox, sticky buy bar |
| `/about` | Parallax narrative + the abstract shader signature |
| `/cart`, `/checkout` | The quiet pages — real arithmetic, no theatre |
| `404` | The catalogue again, in a different shape |

Everything is `output: 'export'`. There are no API routes, no server components that fetch,
and no runtime data source: `lib/products.ts` is the catalogue, and every detail route is
generated from it at build time by `generateStaticParams`.

---

## The 3D asset strategy — the part worth reading first

**No GLB, glTF or HDRI file is loaded anywhere on this site.** None was provided, and rather
than ship a broken loader or a placeholder cube, the models are *built* from primitives at
runtime:

- `components/three/ProductModels.tsx` — six procedural models (headphone, monitor, turntable,
  amplifier, stand, portable), each assembled from `BoxGeometry`, `CylinderGeometry`,
  `LatheGeometry`, `TorusGeometry` and friends, with per-finish `metalness`/`roughness` taken
  straight from the product record.
- `components/three/StudioEnvironment.tsx` — the studio lighting is procedural too: a `<Lightformer>`
  rig baked once into a 256px cube via drei's `<Environment frames={1}>`. No `.hdr` fetch.

This is the swap-in point if real assets ever arrive. Each model is one exported component with
a stable signature (`{ finish }`) and a matching entry in `FRAMING`; replacing a component body
with a `useGLTF(...)` + `<primitive object={scene} />` keeps every caller, every camera curve
and every anchor untouched.

The cost is honest: the models read as engineered product silhouettes rather than photographs.
The benefit is that the site is fully functional with zero binary assets, the whole catalogue
weighs less than one compressed GLB per product, and nothing 404s on a CDN that was never given
the files.

**Fallback ladder**, in order of what a device gets:

1. WebGL2/WebGL available and not a low tier → the live scene.
2. Probing, or the module is still in flight → an exactly-sized spacer (no layout shift).
3. `canRender3D()` false, or `prefers-reduced-motion` refusing the shader work → an SVG poster
   plate (`PosterFallback`) drawn in the product's own finish colours, plus `StorySpread` — the
   same story beats as a typographic spread in place of the pinned camera sequence.

The gate lives in `components/three/LazyScenes.tsx`, and it gates **the import itself**, not just
the context: a device that will not draw never downloads three.js.

---

## The commerce seam

`/checkout` deliberately collects **no card details**. A static export cannot take a payment, and
a decorative card field would be a lie wearing a feature's clothes. Instead the order is recorded
in the browser, given a reference, and the payment method is chosen the way a workshop actually
takes one — a secure link once the build window is confirmed, a transfer, or an invoice.

To make it real, one seam has to change: `CheckoutView`'s `onSubmit`. It currently sets local
state and clears the cart. Point it at a hosted checkout (Stripe Checkout, Snipcart, Shopify
Storefront) and pass the same `lines`, which already carry `{ slug, finishId, qty }` and resolve
against the catalogue. Nothing else in the site knows how an order is taken.

---

## Motion architecture

One curve — `cubic-bezier(0.16, 1, 0.3, 1)` — defined once in `app/globals.css` as `--ease-exp`
and mirrored in `lib/tokens.ts`, because CSS, GSAP and Framer Motion cannot read each other's
values. `lib/gsap.ts` registers it as a named `CustomEase` so `gsap.defaults()` can apply it.

The five layers the spec asks for:

1. **Ambient** — `AmbientLayer`, a fragment-shader quad with unlit motes. Also the About page's
   signature moment. Camera-independent, so it needs no product and no framing.
2. **Hero** — `HeroViewer`: `CatmullRomCurve3` dolly-in, then damped `OrbitControls`, idle
   auto-rotate that yields to the pointer, and a variant swap that reuses the same geometry.
3. **Scroll choreography** — `ScrollStory` (camera along a curve through three beats, pinned by
   sticky positioning rather than pin-spacers) and `HorizontalRail` (vertical scroll drives a
   horizontal track).
4. **Micro-interactions** — magnetic buttons, morphing cursor, alternating tilt cards, staggered
   entrances, counters that arrive at the real number, skeletons held open at final size.
5. **Page transitions** — `AnimatePresence` in `app/template.tsx`.

Two rules are enforced throughout:

- **Nothing animates on a timer.** The preloader is weighted against real work (fonts 0.4,
  first drawn frame 0.55, chrome 0.05) and a scene that deliberately never starts resolves it
  immediately. Progress bars read real progress.
- **Scroll-linked values never touch React state.** They are written to refs and DOM transforms
  from GSAP's ticker. Only the booleans that change *treatment* are state.

### Reduced motion

`prefers-reduced-motion` is not a switch that disables an animation layer — the site stays fully
usable and legible:

- Every Framer component self-gates with `useReducedMotion()`; the global CSS block cannot reach
  inline styles, so nothing relies on it.
- Scenes mount with `frameloop="demand"`: interactive, but no self-driven movement.
- The pinned camera story becomes a typographic spread; parallax renders in place.
- The catalogue's hover preview is not requested at all — a cursor-chasing panel is precisely
  what the preference is asking for less of.

---

## Performance budget

- three.js is behind `next/dynamic(..., { ssr: false })` **and** the capability gate, so it is
  never in the initial route bundle of a device that cannot run it.
- At most **two live WebGL contexts** per page (detail: hero + configurator; home: hero + story;
  catalogue: one shared hover panel, created on first hover).
- `dpr` capped at `[1, 2]` on high tier, `[1, 1.5]` otherwise; contact shadows baked over two
  frames; environment baked over one.
- Fonts via `next/font` — self-hosted, metric-matched fallbacks, no layout shift. (The preload
  hint is absent from Windows-built exports; see [Known limitations](#known-limitations).)
- No binary assets at all — the only network cost is JS, CSS and the fonts.

---

## Accessibility

- A skip link, one `<main>`, real landmark structure, and a visible copper focus ring that is
  never removed.
- Every canvas has a keyboard path: the hero responds to arrow keys through a focusable wrapper
  with `role="application"`, and every variant it offers is also a radio in `FinishPicker` — the
  non-3D accessible alternative the spec asks for.
- Dialogs (mobile menu, material lightbox, mobile filter panel) are real dialogs: scroll lock,
  Escape, a tab trap shared through `lib/a11y.ts`, and focus returned to the opener.
- Live regions for the toast and the catalogue count; `aria-pressed` on filters; `aria-checked`
  radios for finishes; `sr-only` naming on every quantity and remove control.
- The spec table is a `<dl>` because it is name/value pairs, not tabular data.

---

## Stack

Next.js 15 (App Router, static export) · React 19 · TypeScript strict · Tailwind CSS v4 ·
react-three-fiber + drei · GSAP + ScrollTrigger · Framer Motion · Lenis · Zustand.

```
app/          routes, layout, template, globals.css (tokens live here)
components/
  three/      the WebGL layer, and the gate that decides who gets it
  site/       navigational and commercial components
  home/       the home hero
  ui/         motion primitives: Reveal, Parallax, Magnetic, Tilt, Cursor, Toast…
lib/          tokens, gsap setup, hooks, cart + load stores, formatters, the catalogue
```

---

## Known limitations

- **Products are procedural**, as described above. They are not photographs of real objects.
- **The cart is a browser.** `localStorage`, no accounts, nothing server-side — and the checkout
  says so in as many words.
- **Copy is demonstration copy.** Frecom is a fictional workshop; the email address is a
  placeholder and no message is ever sent.
- Static redaction only: no search, no reviews, no inventory. A short line of six objects does
  not need them.
- **Font preload hints are missing from exports built on Windows.** A Next.js 15.5 bug, not a
  site bug: `NextFontManifestPlugin` collects fonts by testing `mod.request.includes('/next-font-loader/index.js?')`,
  and webpack spells that request with backslashes on Windows, so nothing matches and the app
  font manifest stays empty. The result is zero `<link rel="preload" as="font">` tags across all
  15 exported pages, and every family is discovered only after the CSS parses.

  What it does *not* break: the woff2 files are exported, the `@font-face` rules are correct, and
  the generated fallback faces carry their `size-adjust` overrides — so the swap costs a brief
  flash of fallback type, not a layout shift. Builds on macOS, Linux and CI are unaffected.

  Verify on any export:

  ```bash
  grep -rl 'rel="preload" as="font"' out --include=*.html | wc -l   # 0 on Windows, 15 elsewhere
  ```

  If it matters for the host you deploy from, build in a Linux container — or patch the plugin's
  separator test in `node_modules`. That patch was tried here and works, and was then reverted
  rather than shipping node_modules surgery; a container is the version that survives
  `npm install`.
