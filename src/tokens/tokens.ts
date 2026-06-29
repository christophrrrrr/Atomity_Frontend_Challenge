/**
 * Typed token references for use outside Tailwind utilities — e.g. inline
 * styles, SVG `fill`/`stroke`, and Framer Motion `animate` values. Every value
 * points at a CSS variable defined in `theme.css`, so light/dark stays in sync
 * with the rest of the app from a single source of truth.
 */
export const tokens = {
  color: {
    canvas: "var(--canvas)",
    surface: "var(--surface)",
    surface2: "var(--surface-2)",
    surface3: "var(--surface-3)",

    ink: "var(--ink)",
    ink2: "var(--ink-2)",
    ink3: "var(--ink-3)",

    line: "var(--line)",
    lineStrong: "var(--line-strong)",
    focus: "var(--focus)",

    brand: "var(--brand)",
    brandStrong: "var(--brand-strong)",
    brandBar: "var(--brand-bar)",
    brandBar2: "var(--brand-bar-2)",
    brandSoft: "var(--brand-soft)",
    brandContrast: "var(--brand-contrast)",

    positive: "var(--positive)",
    warning: "var(--warning)",
    negative: "var(--negative)",
  },
  radius: {
    card: "16px",
    panel: "22px",
    pill: "999px",
  },
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
  },
} as const;

export type Tokens = typeof tokens;
