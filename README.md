# Atomity — Cloud Cost Explorer

An animated, scroll-triggered **drill-down cost explorer** built for the Atomity frontend
engineering challenge. It lets you dig into Kubernetes-style spend from the top down —
**Cluster → Namespace → Pod** — with a live bar chart, a sortable metrics table, and an
optimization insight that estimates how much money you could claw back.

- **Live demo:** https://atomity-frontend-challenge-weld.vercel.app/
- **Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · TanStack Query

---

## Try it in 30 seconds

- **Click a bar or a cluster name** to drill in; the breadcrumb walks you back out.
- **Drill in, then back out, then in again** and watch the network tab — the revisit is instant,
  served from cache.
- **Sort** any table column, **switch the time range** (7D / 30D / 90D), and **re-size the bars**
  by a single resource (CPU, RAM, …).
- **Hover a bar or a row** — its partner highlights and the other bars dim.
- **Toggle dark mode** (top-right). **Shrink the window** and the table folds into cards.

---

## 1. Which feature, and why

I built **Option A** (the drill-down cost explorer). Two reasons:

- **It's the strongest engineering showcase.** The rubric leans on *data handling* and *caching* —
  and a drill-down is the most natural way to demonstrate them. Every level you open is a fetch;
  every level you return to should be instant. That's exactly the "loading on first fetch, instant
  on revisit" behavior the brief asks for.
- **It has the richest interaction surface** — sorting, linked hover, a time-range filter, a
  resource filter, and animated transitions between levels — without becoming a sprawling page.

To make it *ours* rather than a copy of the video, I folded in the best idea from **Option B** — an
**Estimated Savings** insight — as a live banner that recomputes for whatever level you're viewing.

---

## 2. Approach to animation

Everything uses **Framer Motion** and is meant to feel *intentional*, never decorative:

- **Scroll-triggered entrance** — the explorer rises into view once, when you scroll to it.
- **Staggered bar grow-in** — bars scale up from the baseline with a slight stagger and spring.
- **Number count-up** — totals and the savings figure ease up to their value instead of snapping.
- **Direction-aware level transitions** — drilling *in* slides content one way, going *back* the
  other, so the motion mirrors the navigation.
- **Linked highlighting** — hovering a bar or a row highlights its partner and dims the rest.

**All of it respects `prefers-reduced-motion`.** There's a CSS safety net that neutralizes
transitions globally, and every Framer animation is additionally gated in JS (via
`useReducedMotion`), so reduced-motion users get the final state with no movement — not a broken
half-animated view.

---

## 3. How tokens & styles are structured

There is **one source of truth for color, radius, and shadow**: CSS variables in
[`src/tokens/theme.css`](src/tokens/theme.css). No component hardcodes a hex value.

- Those variables are mapped into **Tailwind v4's `@theme`**, so utilities like `bg-surface`,
  `text-ink`, and `text-brand` resolve *from the tokens*.
- **Dark mode swaps the same variables** under `.dark` — components don't carry per-color `dark:`
  overrides; they just use `bg-surface` and it adapts.
- A typed [`tokens.ts`](src/tokens/tokens.ts) exposes the same values to JavaScript, for the few
  places Tailwind can't reach (e.g. the `color-mix()` string in the efficiency meter).

**Modern CSS**, used where it genuinely fit:

| Feature | Where |
|---|---|
| `@container` queries + native nesting | table folds into cards based on *its own* width |
| `:has()` | the resource filter styles the selected/focused chip with no JS class bookkeeping |
| `color-mix()` | efficiency meter blends red → green by value |
| `clamp()` | fluid headings and base font size |
| Logical properties | `inline-size`, `margin-inline`, `padding-block`, etc. throughout |

---

## 4. Data fetching & caching

Data comes from [JSONPlaceholder](https://jsonplaceholder.typicode.com). Its natural hierarchy maps
cleanly onto ours:

```
users  →  posts  →  comments
cluster → namespace → pod
```

- **Costs are derived, not stored.** A seeded hash turns each entity's id into stable metrics, so
  the same node always shows the same numbers, and — nicely — **a node's children always sum back
  to the node**. It reads like a real cost breakdown. (The brief explicitly allows non-real data;
  what's graded is how async state and caching are handled.)
- **Async state** is explicit: a skeleton on first load, a retryable error state, and the success
  view.
- **Caching** uses **TanStack Query**, keyed by `[level, parentId, timeRange]` with a 5-minute
  `staleTime` and 30-minute `gcTime`. Drilling back to a level you've seen is a cache hit — **no
  network request**. Switching the time range is a new key (one fetch), then cached on return.
- A small, documented **~450 ms artificial latency** (`SIMULATED_LATENCY_MS` in
  [`api.ts`](src/lib/api.ts)) makes the loading state visible and the cached revisit obviously
  instant. Set it to `0` for real latency.

---

## 5. Libraries used, and why

- **Next.js (App Router)** — modern React framework, first-class Vercel deploy, and a strong
  ecosystem signal. The section itself is a client component; Next handles the shell.
- **TypeScript** — typed data model (`CostNode`, `Metrics`) makes the derive/rescale logic safe.
- **Tailwind CSS v4** — utility styling wired to CSS-variable tokens via `@theme`. Its CSS-first
  config is a clean fit for a token architecture.
- **Framer Motion** — declarative, interruptible animations with built-in reduced-motion support.
- **TanStack Query** — the caching story. Query keys + stale/gc times give the "instant on revisit"
  behavior almost for free, and the devtools make it inspectable.

**Every UI element is hand-built** — cards, badges, chips, the bar chart, the skeletons, the theme
toggle. No component libraries.

---

## 6. Tradeoffs & decisions

- **Synthetic-but-consistent numbers.** I chose a deterministic, *additive* model (children sum to
  parent) over random values — it's more work but it makes the whole thing feel real and is easy to
  defend.
- **Stay-put on time-range change.** When you change the range while drilled in, the app keeps your
  position and rescales the ancestors *synchronously* (each node stores its range-independent
  `share` of its parent). I chose this over an async re-fetch specifically to avoid a cache race
  where a stale parent could poison a query key.
- **Time range re-fetches the raw list.** Because each range is its own query key, switching ranges
  re-requests `/users` (same raw data, different derived view). It's cached per range, but a
  stricter design would fetch the raw list once and derive per range client-side. Called out
  honestly; see below.
- **Hand-built chart.** No charting library — the bars are just tokenized, animatable DOM, which
  keeps full control over the linked-hover and grow-in behavior.
- **Intentional latency.** The 450 ms delay is a demo aid, not a performance characteristic.

---

## 7. What I'd improve with more time

- **Option B** — a multi-cloud "unified view" (AWS / Azure / GCP / On-Prem) reusing the same tokens
  and data layer.
- **Split raw fetch from derivation** so switching time ranges doesn't re-request the raw list.
- **URL-synced drill state** so a view is shareable / deep-linkable, with browser back/forward.
- **Virtualized rows** for very large levels, plus a real sparkline of spend over time.
- **Deeper a11y** — roving `tabindex` on the segmented controls and a formal axe audit.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Build with `npm run build`.

## Project structure

```
src/
  app/            layout, page, providers (React Query + theme)
  tokens/         theme.css (CSS variables) + tokens.ts (typed refs)
  lib/            api, deriveMetrics, savings, naming, format, types
  hooks/          useCostData, useDrillPath, useNodeSort
  components/
    CostExplorer/ section, chart, table, breadcrumb, toolbar, savings
    primitives/   Card, Skeleton, AnimatedNumber, ThemeToggle
    theme/        ThemeProvider + no-flash init script
```
