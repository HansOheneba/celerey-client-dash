"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { countries, getEmojiFlag } from "countries-list";
import type { TCountryCode } from "countries-list";

import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  identitySchema,
  type IdentityFormValues,
} from "@/lib/onboarding/schemas";
import type { IdentityData } from "@/lib/onboarding/types";
import { ONBOARDING_COPY } from "@/lib/onboarding/copy";
import { useOnboardingStore } from "@/store/onboardingStore";
import { ArrowRight, ChevronsUpDown, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Build sorted country list from countries-list ───────────────────────────
const COUNTRY_LIST = Object.entries(countries)
  .map(([code, data]) => ({
    code: code as TCountryCode,
    name: data.name,
    flag: getEmojiFlag(code as TCountryCode),
    dialCode: data.phone[0] ? `+${data.phone[0]}` : "",
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ─── Currencies ──────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GHS", label: "GHS — Ghanaian Cedi" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "KES", label: "KES — Kenyan Shilling" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "INR", label: "INR — Indian Rupee" },
];

const MARITAL_STATUSES = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
  "Prefer not to say",
];

interface Step1IdentityProps {
  defaultValues?: IdentityData | null;
  onComplete: (data: IdentityData) => void;
  onBack?: () => void;
}

export function Step1Identity({
  defaultValues,
  onComplete,
  onBack,
}: Step1IdentityProps) {
  const [dialCode, setDialCode] = React.useState("+233");
  const [countryOpen, setCountryOpen] = React.useState(false);

  const { accountMode } = useOnboardingStore();
  const isSolo = accountMode === "solo";

  const initialValues: IdentityFormValues = {
    first_name: defaultValues?.first_name ?? "",
    last_name: defaultValues?.last_name ?? "",
    display_name: defaultValues?.display_name ?? "",
    date_of_birth: defaultValues?.date_of_birth ?? "",
    phone_number: defaultValues?.phone_number ?? "",
    country: defaultValues?.country ?? "",
    resident_city: defaultValues?.resident_city ?? "",
    preferred_currency: defaultValues?.preferred_currency ?? "",
    // account_mode is driven by the store, not re-selected here
    account_mode: accountMode,
    marital_status: defaultValues?.marital_status ?? "",
    occupation: defaultValues?.occupation ?? "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: initialValues,
  });

  const selectedCountry = watch("country");

  // Keep account_mode in sync with store value (in case user went back and changed it)
  React.useEffect(() => {
    setValue("account_mode", accountMode);
  }, [accountMode, setValue]);

  // ─── Auto-detect country via IP ────────
  React.useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code) {
          const match = COUNTRY_LIST.find((c) => c.code === data.country_code);
          if (match) {
            if (!defaultValues?.country) {
              setValue("country", match.name);
            }
            setDialCode(match.dialCode);
          }
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(data: IdentityFormValues) {
    // For solo accounts: derive display_name from first + last name
    const display_name = isSolo
      ? `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim()
      : data.display_name;

    onComplete({
      ...data,
      display_name,
      // Clear fields that don't apply to the account mode
      first_name: isSolo ? data.first_name : undefined,
      last_name: isSolo ? data.last_name : undefined,
      date_of_birth: isSolo ? data.date_of_birth : undefined,
      marital_status: data.marital_status || undefined,
      occupation: data.occupation || undefined,
    });
  }

  const heading = ONBOARDING_COPY.identity.sectionHeading[accountMode];
  const subheading = ONBOARDING_COPY.identity.sectionSubheading[accountMode];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
          {heading}
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-base">
          {subheading} All fields marked{" "}
          <span className="text-slate-800 font-medium">(optional)</span> can be
          filled later.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── PERSONAL INFO ── */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Personal Info
          </p>

          {isSolo ? (
            /* ── SOLO: collect first name + last name ── */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-xs text-red-500">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-xs text-red-500">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ── PARTNER / FAMILY: collect household display name ── */
            <div className="space-y-1.5">
              <Label>{ONBOARDING_COPY.identity.nameLabel[accountMode]}</Label>
              <Input
                {...register("display_name")}
                placeholder={
                  ONBOARDING_COPY.identity.namePlaceholder[accountMode] ?? ""
                }
              />
              {errors.display_name && (
                <p className="text-xs text-red-500">
                  {errors.display_name.message}
                </p>
              )}
            </div>
          )}

          {/* DOB + Phone — DOB only for solo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isSolo && (
              <DatePickerField
                control={control}
                name="date_of_birth"
                placeholder="Select date of birth"
                fromYear={1930}
                toYear={new Date().getFullYear() - 16}
                disabled={{
                  after: new Date(
                    new Date().getFullYear() - 16,
                    new Date().getMonth(),
                    new Date().getDate(),
                  ),
                }}
              />
            )}

            {/* Phone — dial code + number */}
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Controller
                control={control}
                name="phone_number"
                render={({ field }) => {
                  const rawNumber = field.value?.startsWith(dialCode)
                    ? field.value.slice(dialCode.length).trim()
                    : field.value;

                  return (
                    <div className="flex gap-2">
                      <Select
                        value={dialCode}
                        onValueChange={(val) => {
                          setDialCode(val);
                          const raw = field.value?.startsWith(dialCode)
                            ? field.value.slice(dialCode.length).trim()
                            : field.value;
                          field.onChange(`${val} ${raw}`.trim());
                        }}
                      >
                        <SelectTrigger className="w-27.5 shrink-0">
                          <SelectValue>
                            {COUNTRY_LIST.find((c) => c.dialCode === dialCode)
                              ?.flag ?? "🌍"}{" "}
                            {dialCode}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {COUNTRY_LIST.filter((c) => c.dialCode).map((c) => (
                            <SelectItem
                              key={`${c.code}-${c.dialCode}`}
                              value={c.dialCode}
                            >
                              {c.flag} {c.dialCode} — {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="tel"
                        placeholder="12 345 6789"
                        value={rawNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^\d\s]/g, "");
                          field.onChange(`${dialCode} ${digits}`.trim());
                        }}
                        className="flex-1"
                      />
                    </div>
                  );
                }}
              />
              {errors.phone_number && (
                <p className="text-xs text-red-500">
                  {errors.phone_number.message}
                </p>
              )}
            </div>
          </div>

          {/* Marital + Occupation */}
          {isSolo && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  Marital status{" "}
                  <span className="text-slate-400">(optional)</span>
                </Label>
                <Controller
                  control={control}
                  name="marital_status"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Occupation <span className="text-slate-400">(optional)</span>
                </Label>
                <Input {...register("occupation")} />
              </div>
            </div>
          )}
        </div>

        {/* ── LOCATION & PREFERENCES ── */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Location & Preferences
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Country — searchable combobox */}
            <div className="space-y-1.5">
              <Label>Country of residence</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className={cn(
                      "w-full justify-between font-normal h-10",
                      !selectedCountry && "text-slate-400",
                    )}
                  >
                    {selectedCountry
                      ? (() => {
                          const match = COUNTRY_LIST.find(
                            (c) => c.name === selectedCountry,
                          );
                          return match
                            ? `${match.flag} ${match.name}`
                            : selectedCountry;
                        })()
                      : "Select country"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-70 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {COUNTRY_LIST.map((c) => (
                          <CommandItem
                            key={c.code}
                            value={c.name}
                            onSelect={(val) => {
                              setValue("country", val);
                              // sync dial code when country changes
                              const match = COUNTRY_LIST.find(
                                (x) =>
                                  x.name.toLowerCase() === val.toLowerCase(),
                              );
                              if (match?.dialCode) setDialCode(match.dialCode);
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCountry === c.name
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {c.flag} {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.country && (
                <p className="text-xs text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input {...register("resident_city")} placeholder="eg. Cairo" />
              {errors.resident_city && (
                <p className="text-xs text-red-500">
                  {errors.resident_city.message}
                </p>
              )}
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <Label>Preferred currency</Label>
            <Controller
              control={control}
              name="preferred_currency"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.preferred_currency && (
              <p className="text-xs text-red-500">
                {errors.preferred_currency.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 gap-1 h-12 text-base rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="flex-1 gap-2 bg-[#151339] hover:bg-[#1e1b55] text-white h-12 text-base rounded-xl"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
