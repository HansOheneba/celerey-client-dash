"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthMode } from "@/components/login/types";

interface EmailFormProps {
  onSubmit: (email: string) => void;
  mode: AuthMode;
  onModeToggle: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
  infoMessage?: string | null;
}

export function EmailForm({
  onSubmit,
  mode,
  onModeToggle,
  isSubmitting,
  errorMessage,
  infoMessage,
}: EmailFormProps) {
  const [email, setEmail] = React.useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting || email.trim().length === 0) return;
    onSubmit(email.trim());
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        {mode === "login" ? "Welcome back" : "Welcome to Celerey"}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "login"
          ? "Enter your email to log in to your dashboard."
          : "Enter your email to get into your dashboard."}
      </p>

      {infoMessage ? (
        <p className="mt-3 text-sm text-emerald-600" role="status">
          {infoMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

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
          {isSubmitting
            ? "Sending code…"
            : mode === "login"
              ? "Send login code"
              : "Continue"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {mode === "login" ? "New to Celerey?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={onModeToggle}
          className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          disabled={isSubmitting}
        >
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
    </div>
  );
}
