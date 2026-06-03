import type {
  AdvisorySession,
  SessionAllocation,
  SessionDocument,
  UpcomingSession,
} from "@/components/dashboard/advisor/types";

// ── Session allocation ────────────────────────────────────────────────────────
// Users get 2 advisory sessions per plan year. They choose when to use them.

export const MOCK_ALLOCATION: SessionAllocation = {
  periodLabel: "2025 - 2026 plan year",
  totalIncluded: 2,
  used: 1,
  nextAvailableDate: "Book anytime",
};

// ── Upcoming session ──────────────────────────────────────────────────────────
// null = user has not yet booked their next session

export const MOCK_UPCOMING: UpcomingSession | null = null;

// ── Last session ──────────────────────────────────────────────────────────────

export const MOCK_LAST_SESSION: AdvisorySession = {
  id: "session-1",
  date: "18 March 2026",
  type: "annual_review",
  advisorName: "Jude Addo",
  durationMinutes: 75,
  focusAreas: ["Annual review", "Goals progress", "Net worth trajectory"],
  keyDiscussionPoints: [
    "Reviewed full-year portfolio performance - total assets grew 6.8% year-on-year.",
    "Emergency fund confirmed fully funded at 6 months of expenses.",
    "Discussed increasing pension contributions following a recent salary uplift.",
    "Assessed property mortgage overpayment strategy and projected loan end date.",
  ],
  advisorAssessment:
    "Your financial position has strengthened considerably over the past year. Short-term buffers are well-established. The priority for the remainder of 2026 is maximising long-term investment contributions and ensuring the pension consolidation is completed before Q4.",
  summaryNotes:
    "Follow-up materials sent via email on 20 March 2026. Second session should focus on mid-year portfolio rebalancing and goal timeline review.",
  recommendations: [
    "Increase pension contribution from 8% to 12% of gross salary before July.",
    "Consolidate two legacy pension pots into your current employer scheme.",
    "Review ISA allocation to ensure the 2026/27 annual allowance is being fully used.",
  ],
  actionItems: [
    {
      id: "a1",
      label: "Increase pension contribution to 12%",
      dueLabel: "By 30 June 2026",
      done: false,
      priority: "high",
      category: "financial",
    },
    {
      id: "a2",
      label: "Request pension transfer paperwork from previous employer",
      dueLabel: "By 31 July 2026",
      done: false,
      priority: "medium",
      category: "documents",
    },
    {
      id: "a3",
      label: "Top up ISA allowance for 2026/27 tax year",
      dueLabel: "By 5 April 2027",
      done: false,
      priority: "medium",
      category: "financial",
    },
    {
      id: "a4",
      label: "Confirm emergency fund account earns best available rate",
      dueLabel: "By 30 June 2026",
      done: true,
      priority: "low",
      category: "financial",
    },
  ],
  documents: [
    {
      id: "d1",
      name: "Annual Review 2026",
      type: "report",
      dateLabel: "20 March 2026",
      sizeLabel: "2.1 MB",
    },
    {
      id: "d2",
      name: "Financial Planning Summary - March 2026",
      type: "plan",
      dateLabel: "20 March 2026",
      sizeLabel: "940 KB",
    },
  ],
};

// ── Session history ───────────────────────────────────────────────────────────

export const MOCK_HISTORY: AdvisorySession[] = [
  MOCK_LAST_SESSION,
  {
    id: "session-0",
    date: "5 September 2025",
    type: "quarterly_checkin",
    advisorName: "Jude Addo",
    durationMinutes: 60,
    focusAreas: ["Mid-year check-in", "Cash flow review", "Insurance gap"],
    keyDiscussionPoints: [
      "Mid-year cash flow review showed surplus trending 12% above projection.",
      "Identified a gap in income protection insurance coverage.",
      "Discussed property investment options for the medium term.",
    ],
    advisorAssessment:
      "A solid first half of the year. The income protection gap is the most pressing risk item and should be addressed before the end of Q3 2025.",
    summaryNotes: "Check-in report delivered 7 September 2025.",
    recommendations: [
      "Obtain income protection insurance covering at least 70% of gross income.",
      "Increase emergency fund from 3 months to 6 months of expenses.",
    ],
    actionItems: [
      {
        id: "b1",
        label: "Get income protection insurance quote",
        done: true,
        priority: "high",
        category: "financial",
      },
      {
        id: "b2",
        label: "Increase emergency fund to 6 months",
        done: true,
        priority: "high",
        category: "financial",
      },
    ],
    documents: [
      {
        id: "d-h1",
        name: "Mid-Year Check-in Report - September 2025",
        type: "review",
        dateLabel: "7 September 2025",
        sizeLabel: "1.4 MB",
      },
    ],
  },
];

// ── All documents (across all sessions) ──────────────────────────────────────

export const MOCK_ALL_DOCS: SessionDocument[] = [
  ...(MOCK_LAST_SESSION.documents ?? []),
  ...(MOCK_HISTORY[1].documents ?? []),
];

// ── Raw progress metrics (monetary values as numbers for currency formatting) ─

export type RawProgressMetric = {
  label: string;
  beforeAmount: number;
  afterAmount: number;
  direction: "up" | "down" | "flat";
  positiveDirection: "up" | "down";
  isCurrency: boolean;
  /** Non-currency change label (e.g. "+7pp"). Used only when isCurrency=false. */
  changeLabel?: string;
};

export const MOCK_PROGRESS_RAW: RawProgressMetric[] = [
  {
    label: "Net worth",
    beforeAmount: 312400,
    afterAmount: 338750,
    direction: "up",
    positiveDirection: "up",
    isCurrency: true,
  },
  {
    label: "Goal funding rate",
    beforeAmount: 64,
    afterAmount: 71,
    direction: "up",
    positiveDirection: "up",
    isCurrency: false,
    changeLabel: "+7pp",
  },
  {
    label: "Mortgage balance",
    beforeAmount: 218000,
    afterAmount: 211200,
    direction: "down",
    positiveDirection: "down",
    isCurrency: true,
  },
  {
    label: "Monthly surplus",
    beforeAmount: 1240,
    afterAmount: 1580,
    direction: "up",
    positiveDirection: "up",
    isCurrency: true,
  },
];
