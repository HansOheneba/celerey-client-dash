export type Availability = "available" | "limited" | "away";

export type Advisor = {
  initials: string;
  name: string;
  title: string;
  credentials: string[];
  location: string;
  email: string;
  phone: string;
  availability: Availability;
  bio: string;
  specialties: string[];
  philosophy: string;
};

export type Meeting = {
  title: string;
  dateLabel: string;
  type: "review" | "checkin";
  status: "scheduled" | "requested";
};

export type ActionItem = {
  id: string;
  label: string;
  dueLabel?: string;
  done: boolean;
  priority?: "high" | "medium" | "low";
  category?: "financial" | "documents" | "goals" | "other";
};

export type Note = {
  id: string;
  dateLabel: string;
  text: string;
};

export type RequestTopic = "portfolio" | "tax" | "goals" | "other";
export type RequestUrgency = "standard" | "urgent";

// ── Advisory Session types ──────────────────────────────────────────────────

export type SessionType =
  | "annual_review"
  | "quarterly_checkin"
  | "goal_planning"
  | "portfolio_review"
  | "tax_planning"
  | "ad_hoc";

export type AdvisorySession = {
  id: string;
  date: string;
  type: SessionType;
  advisorName: string;
  durationMinutes: number;
  focusAreas: string[];
  keyDiscussionPoints: string[];
  advisorAssessment: string;
  summaryNotes: string;
  recommendations: string[];
  actionItems: ActionItem[];
  documents?: SessionDocument[];
};

export type SessionDocument = {
  id: string;
  name: string;
  type: "report" | "plan" | "review" | "attachment";
  dateLabel: string;
  sizeLabel?: string;
};

export type SessionAllocation = {
  periodLabel: string;
  totalIncluded: number;
  used: number;
  nextAvailableDate: string | null;
};

export type UpcomingSession = {
  date: string;
  timeLabel: string;
  advisorName: string;
  type: SessionType;
  focusAreas: string[];
  joinUrl?: string;
  rescheduleUrl?: string;
};
