"use client";

import { useState } from "react";
import { getUserFullName, type User } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, UserIcon, Globe, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import {
  countries as allCountries,
  currencies as allCurrencies,
  getSymbolFromCurrency,
} from "country-data-list";

const countryOptions = allCountries.all
  .filter((c) => c.status === "assigned" && c.name)
  .sort((a, b) => a.name.localeCompare(b.name));

const currencyOptions = allCurrencies.all
  .filter((c) => c.code && c.name)
  .sort((a, b) => a.code.localeCompare(b.code));

const contactMethods = ["Email", "Phone", "WhatsApp"];

const maritalStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

const riskProfileOptions = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate Growth" },
  { value: "aggressive", label: "Aggressive Growth" },
];

function accountModeLabel(mode?: string) {
  if (mode === "partner") return "Partner Account";
  if (mode === "family") return "Family Account";
  return "Individual Account";
}

export default function AccountPage() {
  const storeUser = useFinancialStore((s) => s.user);
  const setUser = useFinancialStore((s) => s.setUser);

  const baseUser: User = storeUser ?? {
    user_id: "",
    email: "",
    resident_country: "",
    currency: "USD",
    is_active: true,
    created_at: "",
    updated_at: "",
    user_type: "regular",
  };

  const [form, setForm] = useState<User & { citizenships: string[] }>({
    ...baseUser,
    citizenships: baseUser.citizenships ?? [],
    city: baseUser.city ?? "",
    preferred_contact: baseUser.preferred_contact ?? "Email",
  });

  const [saved, setSaved] = useState(false);

  const mode = form.account_mode ?? "solo";
  const isSolo = mode === "solo";

  function handleChange(field: keyof User | "citizenships", value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleCitizenshipAdd(country: string) {
    if (!form.citizenships.includes(country)) {
      setForm((prev) => ({
        ...prev,
        citizenships: [...prev.citizenships, country],
      }));
      setSaved(false);
    }
  }

  function handleCitizenshipRemove(country: string) {
    setForm((prev) => ({
      ...prev,
      citizenships: prev.citizenships.filter((c) => c !== country),
    }));
    setSaved(false);
  }

  function handleSave() {
    setUser({ ...form, updated_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const initials = getUserFullName(form)
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details and platform preferences.
        </p>
      </div>

      {/* Profile summary */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-[#1B1856] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-lg">{getUserFullName(form)}</p>
              <Badge variant="outline" className="text-xs">
                {accountModeLabel(mode)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{form.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            {isSolo ? "Personal Information" : "Household Information"}
          </CardTitle>
          <CardDescription>
            {isSolo
              ? "Update your personal information."
              : "Update your household details."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Display name — works for all account modes */}
          <div className="space-y-2">
            <Label>{isSolo ? "Full Name" : "Household Name"}</Label>
            <Input
              value={form.display_name ?? ""}
              onChange={(e) => handleChange("display_name", e.target.value)}
            />
          </div>

          {/* First / last name — solo only */}
          {isSolo && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={form.first_name ?? ""}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={form.last_name ?? ""}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={form.phone_number ?? ""}
                onChange={(e) => handleChange("phone_number", e.target.value)}
              />
            </div>
          </div>

          {/* Date of Birth — solo only */}
          {isSolo && (
            <div className="space-y-2 w-fit">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[220px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date_of_birth
                      ? format(new Date(form.date_of_birth), "PPP")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={
                      form.date_of_birth
                        ? new Date(form.date_of_birth)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date)
                        handleChange(
                          "date_of_birth",
                          date.toISOString().split("T")[0],
                        );
                    }}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Occupation + Marital Status — solo only */}
          {isSolo && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input
                  value={form.occupation ?? ""}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select
                  value={form.marital_status ?? ""}
                  onValueChange={(v) => handleChange("marital_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalStatusOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Dependents — partner/family accounts */}
          {!isSolo && (
            <div className="space-y-2 w-fit">
              <Label>Number of Dependents</Label>
              <Input
                type="number"
                min={0}
                value={form.dependents ?? ""}
                onChange={(e) =>
                  handleChange(
                    "dependents",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className="w-32"
              />
            </div>
          )}

          {/* Bio — all account types */}
          <div className="space-y-2">
            <Label>{isSolo ? "Bio" : "Household Description"}</Label>
            <Textarea
              value={form.bio ?? ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder={
                isSolo
                  ? "A short description about yourself..."
                  : "A short description about your household..."
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Residency & Citizenship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Residency &amp; Citizenship
          </CardTitle>
          <CardDescription>
            Provide information related to your residency and nationality.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Country of Residence</Label>
              <Select
                value={form.resident_country}
                onValueChange={(v) => handleChange("resident_country", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((c) => (
                    <SelectItem key={c.alpha2} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
          </div>

          {/* Citizenship — solo only (partner/family share a household) */}
          {isSolo && (
            <div className="space-y-2">
              <Label>Citizenship</Label>
              <Select onValueChange={(v) => handleCitizenshipAdd(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add citizenship" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((c) => (
                    <SelectItem key={c.alpha2} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.citizenships.map((country) => (
                  <span
                    key={country}
                    className="px-3 py-1 text-xs bg-muted rounded-full cursor-pointer hover:bg-muted/70"
                    onClick={() => handleCitizenshipRemove(country)}
                  >
                    {country} &times;
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Financial Profile
          </CardTitle>
          <CardDescription>
            Your risk tolerance and investment preferences.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2 max-w-xs">
            <Label>Risk Profile</Label>
            <Select
              value={form.risk_profile ?? ""}
              onValueChange={(v) =>
                handleChange("risk_profile", v as User["risk_profile"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk profile" />
              </SelectTrigger>
              <SelectContent>
                {riskProfileOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your platform preferences.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Preferred Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => handleChange("currency", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {getSymbolFromCurrency(c.code) !== c.code
                        ? `${getSymbolFromCurrency(c.code)} `
                        : ""}
                      {c.code} – {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Contact Method</Label>
              <Select
                value={form.preferred_contact}
                onValueChange={(v) => handleChange("preferred_contact", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {contactMethods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-[#1B1856] hover:bg-[#1B1856]/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
