// app/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LoginCarousel } from "@/components/login/login-carousel";
import { EmailForm } from "@/components/login/email-form";
import { OtpForm } from "@/components/login/otp-form";
import { CelereyLoader } from "@/components/login/celerey-loader";
import type { AuthMode, AuthStep } from "@/components/login/types";
import {
  setAuth,
  getAuth,
  getSubscription,
  getUserType,
  setOnboarded,
  setSubscriptionData,
  mockStartTrialIfMissing,
} from "../lib/client-data";
import { resetSession } from "../lib/session-reset";
import {
  fetchSubscription,
  prefetchDashboardSummary,
} from "../lib/dashboard-api";

const OTP_MESSAGE_TYPE = "OTPAuthMessage:HTML";

// Signup (new account) endpoints
const SIGNUP_REQUEST_OTP_ENDPOINT = "/api/proxy/onboarding.generate-otp";
const SIGNUP_VERIFY_OTP_ENDPOINT = "/api/proxy/onboarding.verify-otp";
const SIGNUP_OTP_SUBJECT = "Your Celerey Verification Code";

// Login (existing account) endpoints
const LOGIN_REQUEST_OTP_ENDPOINT = "/api/proxy/auth.request-otp";
const LOGIN_VERIFY_OTP_ENDPOINT = "/api/proxy/auth.verify-otp";
const LOGIN_OTP_SUBJECT = "Your Celerey Login Code";

export default function Home() {
  const router = useRouter();

  const [step, setStep] = React.useState<AuthStep>("email");
  const [mode, setMode] = React.useState<AuthMode>("signup");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);

  /** Request OTP for a given email + mode. Returns true on success. */
  async function requestOtp(
    targetEmail: string,
    targetMode: AuthMode,
  ): Promise<boolean> {
    const endpoint =
      targetMode === "login"
        ? LOGIN_REQUEST_OTP_ENDPOINT
        : SIGNUP_REQUEST_OTP_ENDPOINT;
    const subject =
      targetMode === "login" ? LOGIN_OTP_SUBJECT : SIGNUP_OTP_SUBJECT;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: targetEmail,
        messageType: OTP_MESSAGE_TYPE,
        messageSubject: subject,
      }),
    });

    const payload = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;

    return response.ok && payload?.success === true;
  }

  /** Request OTP for the supplied email; only move forward on success. */
  async function handleEmailSubmit(submittedEmail: string) {
    setErrorMessage(null);
    setInfoMessage(null);
    setEmail(submittedEmail);
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "login"
          ? LOGIN_REQUEST_OTP_ENDPOINT
          : SIGNUP_REQUEST_OTP_ENDPOINT;
      const subject = mode === "login" ? LOGIN_OTP_SUBJECT : SIGNUP_OTP_SUBJECT;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submittedEmail,
          messageType: OTP_MESSAGE_TYPE,
          messageSubject: subject,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.success) {
        const msg = payload?.message ?? "";

        // Signup → account already exists → silently switch to login
        if (mode === "signup" && msg.toLowerCase().includes("already exists")) {
          setMode("login");
          setInfoMessage(
            "An account with this email already exists. We’ve sent you a login code instead.",
          );
          const ok = await requestOtp(submittedEmail, "login");
          if (ok) {
            setStep("otp");
            return;
          }
          throw new Error("Unable to send verification code.");
        }

        // Login → no account found → silently switch to signup
        if (
          mode === "login" &&
          msg.toLowerCase().includes("no account found")
        ) {
          setMode("signup");
          setInfoMessage("No account found — we're creating one for you now.");
          const ok = await requestOtp(submittedEmail, "signup");
          if (ok) {
            setStep("otp");
            return;
          }
          throw new Error("Unable to send verification code.");
        }

        throw new Error(msg || "Unable to send verification code.");
      }

      setStep("otp");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send verification code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Verify OTP and navigate to the correct destination on success. */
  async function handleOtpVerify(otp: string) {
    setErrorMessage(null);
    setIsSubmitting(true);
    let verificationSucceeded = false;

    const endpoint =
      mode === "login" ? LOGIN_VERIFY_OTP_ENDPOINT : SIGNUP_VERIFY_OTP_ENDPOINT;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        data?: { session_token?: string; onboarding_token?: string };
      } | null;

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Unable to verify code.");
      }

      if (mode === "login") {
        // ── Existing account: session_token ──────────────────────────────
        const sessionToken = payload?.data?.session_token;
        if (!sessionToken) throw new Error("Unable to verify code.");

        // If the browser has stale data for a different account, wipe it
        // before establishing the new session so the new user doesn't inherit
        // the previous user's onboarded flag, subscription, profile, etc.
        const previous = getAuth();
        const accountSwitched =
          !!previous.email &&
          previous.email.toLowerCase() !== email.toLowerCase();
        if (accountSwitched) {
          resetSession();
        }

        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken, type: "session" }),
        });

        // Kick off the dashboard summary fetch immediately so the data is
        // ready (or in-flight) by the time the dashboard layout mounts —
        // dashboard.summary is the only request needed for the overview.
        prefetchDashboardSummary();

        verificationSucceeded = true;
        setIsNavigating(true);
        setAuth(email);
        // MOCK: default new logins to a 7-day trial so we can exercise
        // gated UI until the backend webhook is wired up.
        mockStartTrialIfMissing();
        // Existing users with a session token have already completed onboarding.
        // Mark them as onboarded so DashboardGuard doesn't redirect them.
        setOnboarded();

        // After an account switch we just wiped local subscription state, so
        // pull the real one from the API before routing — otherwise the user
        // would land on the dashboard with stale subscription data.
        if (accountSwitched) {
          try {
            const fresh = await fetchSubscription();
            if (fresh) setSubscriptionData(fresh);
          } catch {
            /* non-fatal — fall through to default routing */
          }
        }

        // Paywall redirect to /choose-plan is temporarily disabled while
        // backend subscription_status sync is being fixed.
        router.push("/dashboard");
      } else {
        // ── New account: onboarding_token ────────────────────────────────
        const onboardingToken = payload?.data?.onboarding_token;
        if (!onboardingToken) throw new Error("Unable to verify code.");

        // Detect a re-verify after onboarding-session expiry: if the previous
        // run stashed a reverify flag for THIS email, preserve their
        // onboarding progress instead of wiping it like a fresh signup.
        let isReverify = false;
        try {
          const flag = localStorage.getItem("onboarding_reverify_email");
          isReverify = !!flag && flag.toLowerCase() === email.toLowerCase();
          // Always clear the flag — single-use.
          localStorage.removeItem("onboarding_reverify_email");
        } catch {
          /* noop */
        }

        if (!isReverify) {
          // A fresh signup must always start from a clean slate — wipe any
          // residual state from a previous account on this browser (both
          // localStorage AND in-memory Zustand stores).
          resetSession();
        }

        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: onboardingToken }),
        });

        verificationSucceeded = true;
        setIsNavigating(true);
        setAuth(email);
        router.push("/onboarding");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to verify code.",
      );
    } finally {
      if (!verificationSucceeded) {
        setIsSubmitting(false);
      }
    }
  }

  /** Go back from OTP to email */
  function handleBack() {
    setErrorMessage(null);
    setStep("email");
  }

  function handleModeToggle() {
    setErrorMessage(null);
    setInfoMessage(null);
    setMode((currentMode) => (currentMode === "signup" ? "login" : "signup"));
    setStep("email");
    setEmail("");
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-muted/40 px-4 py-5 md:px-7 md:py-8">
      <div className="mx-auto w-full max-w-6xl rounded-sm bg-background shadow-sm ring-1 ring-border">
        <div className="grid h-190 grid-cols-1 gap-0 md:grid-cols-2">
          {/* LEFT: carousel */}
          <LoginCarousel />

          {/* RIGHT: auth forms */}
          <section className="relative flex items-start justify-center px-6 pb-6 pt-8 md:px-10 md:pb-10 md:pt-10">
            <div className="w-full max-w-md flex flex-col justify-between h-full">
              {/* Logo */}
              <div className="mb-10 flex items-center justify-start gap-2 md:mb-12">
                <Image
                  src="https://i.ibb.co/d0v22fZp/logo-Dark.png"
                  alt="Celerey logo"
                  width={100}
                  height={100}
                  priority
                />
              </div>

              {/* Step content */}
              {step === "email" ? (
                <EmailForm
                  onSubmit={handleEmailSubmit}
                  mode={mode}
                  onModeToggle={handleModeToggle}
                  isSubmitting={isSubmitting}
                  errorMessage={errorMessage}
                  infoMessage={infoMessage}
                />
              ) : (
                <OtpForm
                  email={email}
                  mode={mode}
                  onVerify={handleOtpVerify}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                  errorMessage={errorMessage}
                  infoMessage={infoMessage}
                />
              )}

              {/* Footer */}
              <div className="mt-6 text-xs text-muted-foreground">
                <Link
                  href="/support"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  Need help?
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
