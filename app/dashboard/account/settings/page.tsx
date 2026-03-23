"use client";

import { useState } from "react";
import { getUserFullName, type User } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Save, UserIcon, Globe } from "lucide-react";
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

export default function AccountPage() {
  const storeUser = useFinancialStore((s) => s.user);
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

  const [form, setForm] = useState({
    ...baseUser,
    citizenships: baseUser.citizenships ?? [],
    city: baseUser.city ?? "",
    preferred_contact: baseUser.preferred_contact ?? "Email",
  });

  const [saved, setSaved] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleCitizenshipAdd(country: string) {
    if (!form.citizenships.includes(country)) {
      setForm((prev) => ({
        ...prev,
        citizenships: [...prev.citizenships, country],
      }));
    }
  }

  function handleCitizenshipRemove(country: string) {
    setForm((prev) => ({
      ...prev,
      citizenships: prev.citizenships.filter((c) => c !== country),
    }));
  }

  function handleSave() {
    console.log("Saving user settings:", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

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
              {getUserFullName(form)
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="font-semibold text-lg">{getUserFullName(form)}</p>
            <p className="text-sm text-muted-foreground">{form.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Display name — always shown, works for all account modes */}
          <div className="space-y-2">
            <Label>
              {form.account_mode === "solo" ? "Full Name" : "Household Name"}
            </Label>
            <Input
              value={form.display_name ?? ""}
              onChange={(e) => handleChange("display_name", e.target.value)}
            />
          </div>

          {/* First / last name — only shown for solo accounts */}
          {(!form.account_mode || form.account_mode === "solo") && (
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

          <div className="space-y-2 w-fit">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2 w-fit">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={form.phone_number ?? ""}
              onChange={(e) => handleChange("phone_number", e.target.value)}
            />
          </div>

          <div className="space-y-2 w-fit">
            <Label>Date of Birth</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
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
                    if (date) {
                      handleChange(
                        "date_of_birth",
                        date.toISOString().split("T")[0],
                      );
                    }
                  }}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Residency & Citizenship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Residency & Citizenship
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
                onValueChange={(value) =>
                  handleChange("resident_country", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((c) => (
                    <SelectItem key={c.alpha2} value={c.name}>
                      {c.name}
                      {/* {c.emoji ? `${c.emoji} ` : ""} */}
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

          {/* Citizenship */}
          <div className="space-y-2">
            <Label>Citizenship</Label>

            <Select onValueChange={(value) => handleCitizenshipAdd(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Add citizenship" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((c) => (
                  <SelectItem key={c.alpha2} value={c.name}>
                    {c.name}
                    {/* {c.emoji ? `${c.emoji} ` : ""} */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 mt-2">
              {form.citizenships.map((country) => (
                <span
                  key={country}
                  className="px-3 py-1 text-xs bg-muted rounded-full cursor-pointer"
                  onClick={() => handleCitizenshipRemove(country)}
                >
                  {country} ×
                </span>
              ))}
            </div>
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
                onValueChange={(value) => handleChange("currency", value)}
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
                onValueChange={(value) =>
                  handleChange("preferred_contact", value)
                }
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
