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
  getSubscription,
  isOnboarded,
  getUserType,
} from "../lib/client-data";

const OTP_MESSAGE_TYPE = "OTPAuthMessage:HTML";
const OTP_MESSAGE_SUBJECT = "Your Celerey Verification Code";
const ONBOARDING_TOKEN_KEY = "onboarding_token";

// Requests go to the Next.js proxy route to avoid CORS.
// next.config.ts rewrites /api/proxy/* → NEXT_PUBLIC_BASE_API_URL/* server-side.
const GENERATE_OTP_ENDPOINT = "/api/proxy/onboarding.generate-otp";
const VERIFY_OTP_ENDPOINT = "/api/proxy/onboarding.verify-otp";

export default function Home() {
  const router = useRouter();

  const [step, setStep] = React.useState<AuthStep>("email");
  const [mode, setMode] = React.useState<AuthMode>("signup");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  /** Request OTP for the supplied email; only move forward on success. */
  async function handleEmailSubmit(submittedEmail: string) {
    setErrorMessage(null);
    setEmail(submittedEmail);
    setIsSubmitting(true);

    try {
      const response = await fetch(GENERATE_OTP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: submittedEmail,
          messageType: OTP_MESSAGE_TYPE,
          messageSubject: OTP_MESSAGE_SUBJECT,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || "Unable to send verification code.",
        );
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

  /** Verify OTP and route into onboarding flow on success. */
  async function handleOtpVerify(otp: string) {
    setErrorMessage(null);
    setIsSubmitting(true);
    let verificationSucceeded = false;

    try {
      const response = await fetch(VERIFY_OTP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        data?: { onboarding_token?: string };
      } | null;

      const onboardingToken = payload?.data?.onboarding_token;

      if (!response.ok || !payload?.success || !onboardingToken) {
        throw new Error(payload?.message || "Unable to verify code.");
      }

      try {
        window.localStorage.setItem(ONBOARDING_TOKEN_KEY, onboardingToken);
      } catch {
        // Ignore storage failures; auth flow can still continue.
      }

      verificationSucceeded = true;
      setIsNavigating(true);

      setAuth(email);

      const sub = getSubscription();
      const completedOnboarding = isOnboarded();

      // New flow: onboarding → choose-plan → dashboard
      if (!completedOnboarding) {
        router.push("/onboarding");
      } else if (getUserType() === "enterprise" || sub.status !== "none") {
        router.push("/dashboard");
      } else {
        router.push("/choose-plan");
      }
      // keep loader visible during navigation
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
                  src="https://i.ibb.co/PGVKSsV1/image.png"
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
                />
              ) : (
                <OtpForm
                  email={email}
                  mode={mode}
                  onVerify={handleOtpVerify}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                  errorMessage={errorMessage}
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
