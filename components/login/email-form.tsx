"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFormProps {
  onSubmit: (email: string) => void;
  isSubmitting: boolean;
}

export function EmailForm({ onSubmit, isSubmitting }: EmailFormProps) {
  const [email, setEmail] = React.useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting || email.trim().length === 0) return;
    onSubmit(email.trim());
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome to Celerey
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email to get into your dashboard.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl"
            disabled={isSubmitting}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || email.trim().length === 0}
          className="h-11 w-full rounded-full"
        >
          {isSubmitting ? "Sending code…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
