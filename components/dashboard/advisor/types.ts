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
  dueLabel: string;
  done: boolean;
};

export type Note = {
  id: string;
  dateLabel: string;
  text: string;
};

export type RequestTopic = "portfolio" | "tax" | "goals" | "other";

export type RequestUrgency = "standard" | "urgent";
