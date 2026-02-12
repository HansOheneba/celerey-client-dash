"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GoalForm = {
  title: string;
  target: string;
  current: string;
  timelineValue: string;
  timelineUnit: "months" | "years";
};

export default function NewGoalPage() {
  const router = useRouter();

  const [form, setForm] = React.useState<GoalForm>({
    title: "",
    target: "",
    current: "",
    timelineValue: "",
    timelineUnit: "years",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function formatNumberWithCommas(value: string): string {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function update<K extends keyof GoalForm>(key: K, value: GoalForm[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMoneyInput(key: "target" | "current", value: string): void {
    const formatted = formatNumberWithCommas(value);
    update(key, formatted);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Replace with real API call
      const timelineValue = Number(form.timelineValue);
      const payload = {
        title: form.title,
        target: Number(form.target.replace(/,/g, "")),
        current: Number(form.current.replace(/,/g, "")),
        yearsRemaining:
          form.timelineUnit === "months" ? timelineValue / 12 : timelineValue,
        timeline: {
          value: timelineValue,
          unit: form.timelineUnit,
        },
      };

      console.log("New goal:", payload);

      // Example API call:
      // await fetch("/api/goals", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      router.push("/dashboard/goals");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Add New Goal</h1>
            <p className="text-sm text-muted-foreground">
              Define a new financial milestone.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6"
        >
          <Card className="border-muted/60 bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Goal Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">What is your goal?</Label>
                <Input
                  id="title"
                  placeholder="e.g. Buy a home"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                />
              </div>

              <Separator />

              {/* Target + Current */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="current">How much do you already have?</Label>
                  <Input
                    id="current"
                    type="text"
                    placeholder="100,000"
                    value={form.current}
                    onChange={(e) =>
                      handleMoneyInput("current", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">How much do you want?</Label>
                  <Input
                    id="target"
                    type="text"
                    placeholder="500,000"
                    value={form.target}
                    onChange={(e) => handleMoneyInput("target", e.target.value)}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timeline-unit">
                    When do you want to achieve it?
                  </Label>
                  <Select
                    value={form.timelineUnit}
                    onValueChange={(value) =>
                      update("timelineUnit", value as GoalForm["timelineUnit"])
                    }
                  >
                    <SelectTrigger id="timeline-unit" className="w-full">
                      <SelectValue placeholder="Select a time unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline-value">
                    How many {form.timelineUnit}?
                  </Label>
                  <Input
                    id="timeline-value"
                    type="number"
                    min="1"
                    placeholder={form.timelineUnit === "months" ? "24" : "10"}
                    value={form.timelineValue}
                    onChange={(e) => update("timelineValue", e.target.value)}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard/goals")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Create goal"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
