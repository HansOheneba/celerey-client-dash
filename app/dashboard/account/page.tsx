"use client";

import { useState } from "react";
import { mockUser, getUserFullName, type User } from "@/lib/user-data";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, UserIcon } from "lucide-react";

const currencies = [
  "USD",
  "EUR",
  "GBP",
  "GHS",
  "NGN",
  "KES",
  "ZAR",
  "CAD",
  "AUD",
  "JPY",
];
const countries = [
  "USA",
  "United Kingdom",
  "Canada",
  "Ghana",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Australia",
  "Germany",
  "France",
  "Japan",
];

export default function AccountPage() {
  const [form, setForm] = useState<User>({ ...mockUser });
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof User, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    // In a real app this would call an API
    console.log("Saving user profile:", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information and preferences.
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="bg-[#1B1856] text-white text-base">
                {form.first_name[0]}
                {form.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{getUserFullName(form)}</CardTitle>
              <CardDescription>{form.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              placeholder="Enter phone number"
              value={form.phone_number ?? ""}
              onChange={(e) => handleChange("phone_number", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resident_country">Country of Residence</Label>
              <Select
                value={form.resident_country}
                onValueChange={(value) =>
                  handleChange("resident_country", value)
                }
              >
                <SelectTrigger id="resident_country" className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Preferred Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
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
