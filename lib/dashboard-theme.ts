// lib/dashboard-theme.ts
//
// ─────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH FOR DASHBOARD VISUAL STYLING
// ─────────────────────────────────────────────────────────────────────────
//
// Change a value here and it propagates to every dashboard tab. Use these
// constants everywhere instead of hard-coding background / border classes
// on individual pages.
//
// Where each token shows up:
//   surface          → app/dashboard/layout.tsx <main>           (page bg)
//   card             → components/dashboard/dash-card.tsx        (every card)
//   kpiTile          → components/dashboard/kpi-strip.tsx        (every KPI cell)
//   sectionLabel     → SectionLabel headings on each tab
//
// IMPORTANT
//   - `surface` is the *only* token that is a CSS class defined in
//     app/globals.css (.dashboard-surface). Edit the gradient there.
//   - `card` and `kpiTile` use the shadcn `bg-card` CSS variable
//     (--card in globals.css :root). Change `--card` to recolor every
//     card/KPI tile at once without touching React components.
//
// Do NOT add tab-specific styling here. Keep this file purely about the
// shell. Tab-specific affordances belong in their own components.

export const dashboardTheme = {
  /** Applied to the dashboard <main> element. Defined in globals.css. */
  surface: "dashboard-surface @container/dash",

  /**
   * Base classes for any "card" surface inside the dashboard.
   * Used by <DashCard /> - prefer that component over raw classes.
   */
  card: "bg-card border border-border/60",

  /** Tiles inside the KPI strip - same look as cards, smaller radius. */
  kpiTile: "bg-card border border-border/60 rounded-xl",

  /** Section heading above each block of cards (e.g. "At a glance"). */
  sectionLabel:
    "text-[11px] font-medium uppercase tracking-wider text-muted-foreground",

  /** Standard outer padding for tab content (matches existing pages). */
  pageContainer: "mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8",
} as const;
