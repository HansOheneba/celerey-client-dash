"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type ProfileField = {
  label: string;
  value: string;
};

const personalInfo: ProfileField[] = [
  { label: "Full Name", value: "Hans Oheneba" },
  { label: "Date of Birth", value: "12 May 1998" },
  { label: "Country", value: "Ghana" },
  { label: "City", value: "Accra" },
];

const contactInfo: ProfileField[] = [
  { label: "Email", value: "hans@celerey.com" },
  { label: "Phone", value: "+233 24 000 0000" },
  { label: "Preferred Contact", value: "Email" },
];

const accountInfo: ProfileField[] = [
  { label: "Client ID", value: "CL-28419" },
  { label: "Advisor", value: "Celerey Advisory Team" },
  { label: "Client Since", value: "March 2024" },
  { label: "Account Currency", value: "USD" },
];

const financialProfile: ProfileField[] = [
  { label: "Risk Profile", value: "Moderate Growth" },
  { label: "Investment Horizon", value: "20+ Years" },
  { label: "Primary Goal", value: "Long-term Wealth Growth" },
];

function Section({ title, fields }: { title: string; fields: ProfileField[] }) {
  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-6 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-5">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs text-muted-foreground">{field.label}</p>
            <p className="text-sm font-medium">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
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

      {/* Profile summary */}
      <div className="flex items-center gap-4 rounded-xl border bg-white p-6">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-[#1B1856] text-white text-sm">
            HO
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold text-lg">Hans Oheneba</p>
          <p className="text-sm text-muted-foreground">hans@celerey.com</p>
        </div>
      </div>

      <Section title="Personal Information" fields={personalInfo} />
      <Section title="Contact Details" fields={contactInfo} />
      <Section title="Account Information" fields={accountInfo} />
      <Section title="Financial Profile" fields={financialProfile} />
    </div>
  );
}
