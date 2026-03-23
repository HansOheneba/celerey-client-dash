"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinancialStore } from "@/store/financialStore";
import { getUserFullName, getUserAge, mockUser } from "@/lib/client-data";

type ProfileField = { label: string; value: string };

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function accountModeLabel(mode?: string) {
  if (mode === "partner") return "Partner Account";
  if (mode === "family") return "Family Account";
  return "Individual Account";
}

function riskLabel(risk?: string) {
  const map: Record<string, string> = {
    conservative: "Conservative",
    moderate: "Moderate Growth",
    aggressive: "Aggressive Growth",
  };
  return risk ? (map[risk] ?? risk) : "—";
}

function ucFirst(s?: string) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Section({
  title,
  fields,
}: {
  title: string;
  fields: ProfileField[];
}) {
  if (!fields.length) return null;
  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-6 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-5">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs text-muted-foreground">{field.label}</p>
            <p className="text-sm font-medium">{field.value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const user = useFinancialStore((s) => s.user) ?? mockUser;
  const mode = user.account_mode ?? "solo";
  const isSolo = mode === "solo";
  const isFamily = mode === "family";
  const fullName = getUserFullName(user);

  // ── Personal / Household Information ──────────────────────────────────────
  const personalFields: ProfileField[] = [
    ...(isSolo
      ? [
          { label: "First Name", value: user.first_name ?? "" },
          { label: "Last Name", value: user.last_name ?? "" },
        ]
      : [{ label: "Household Name", value: user.display_name ?? "" }]),
    ...(isSolo && user.date_of_birth
      ? [
          {
            label: "Date of Birth",
            value: format(new Date(user.date_of_birth), "dd MMM yyyy"),
          },
          { label: "Age", value: `${getUserAge(user)} years old` },
        ]
      : []),
    { label: "Account Type", value: accountModeLabel(mode) },
    ...(isSolo
      ? [
          { label: "Marital Status", value: ucFirst(user.marital_status) },
          { label: "Occupation", value: user.occupation ?? "" },
        ]
      : []),
    ...(!isSolo
      ? [
          {
            label: "Dependents",
            value:
              user.dependents != null ? String(user.dependents) : "",
          },
        ]
      : []),
  ];

  // ── Contact ────────────────────────────────────────────────────────────────
  const contactFields: ProfileField[] = [
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone_number ?? "" },
    { label: "Preferred Contact", value: user.preferred_contact ?? "" },
  ];

  // ── Location ───────────────────────────────────────────────────────────────
  const locationFields: ProfileField[] = [
    { label: "Country of Residence", value: user.resident_country },
    { label: "City", value: user.city ?? "" },
    {
      label: "Citizenship(s)",
      value: user.citizenships?.join(", ") ?? "",
    },
  ];

  // ── Account Information ────────────────────────────────────────────────────
  const accountFields: ProfileField[] = [
    { label: "Client ID", value: user.user_id },
    { label: "Account Currency", value: user.currency },
    {
      label: "Member Since",
      value: user.created_at
        ? format(new Date(user.created_at), "MMMM yyyy")
        : "",
    },
    {
      label: "Account Status",
      value: user.is_active ? "Active" : "Inactive",
    },
  ];

  // ── Financial Profile ──────────────────────────────────────────────────────
  const financialFields: ProfileField[] = [
    { label: "Risk Profile", value: riskLabel(user.risk_profile) },
    ...(user.bio ? [{ label: "Bio", value: user.bio }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            A summary of your personal and financial information.
          </p>
        </div>
        <Link href="/dashboard/account/settings">
          <Button variant="outline" size="sm">
            Edit in Settings
          </Button>
        </Link>
      </div>

      {/* Avatar summary */}
      <div className="flex items-center gap-4 rounded-xl border bg-white p-6">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-[#1B1856] text-white text-sm">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-lg">{fullName}</p>
            <Badge variant="outline" className="text-xs">
              {accountModeLabel(mode)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Section
        title={isSolo ? "Personal Information" : "Household Information"}
        fields={personalFields}
      />
      <Section title="Contact Details" fields={contactFields} />
      <Section title="Location" fields={locationFields} />
      <Section title="Account Information" fields={accountFields} />
      <Section title="Financial Profile" fields={financialFields} />
    </div>
  );
}
