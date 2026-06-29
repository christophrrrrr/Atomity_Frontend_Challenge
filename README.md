# Atomity — Cloud Cost Explorer

An animated, scroll-triggered **drill-down cost explorer** built for the Atomity frontend
engineering challenge. It visualizes Kubernetes-style spend across a `Cluster → Namespace → Pod`
hierarchy with a live bar chart and a metrics table, and surfaces optimization/savings insights.

> **Status:** in progress — built incrementally. See commit history.

- **Live demo:** _coming soon_
- **Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · TanStack Query

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## About

The data is fetched from [JSONPlaceholder](https://jsonplaceholder.typicode.com) — its
`users → posts → comments` hierarchy is mapped onto `Cluster → Namespace → Pod`, with cost metrics
derived deterministically from entity IDs (stable across renders). Async state (loading / error /
success) and caching are handled with TanStack Query.

<!-- The full write-up (feature rationale, animation approach, token architecture, data/caching
strategy, tradeoffs, and future work) is filled in as the build completes. -->
