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
import type { AuthStep } from "@/components/login/types";
import { setAuth, getSubscription, isOnboarded } from "../lib/client-data";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const router = useRouter();

  const [step, setStep] = React.useState<AuthStep>("email");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  /** Email entered - spin the button, then move to OTP step */
  async function handleEmailSubmit(submittedEmail: string) {
    setEmail(submittedEmail);
    setIsSubmitting(true);
    await sleep(800);
    setIsSubmitting(false);
    setStep("otp");
  }

  /** OTP entered - spin the button briefly, then full-screen loader while routing */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleOtpVerify(_otp: string) {
    setIsSubmitting(true);
    await sleep(700);
    setIsNavigating(true);

    setAuth(email);

    const sub = getSubscription();
    const completedOnboarding = isOnboarded();

    // New flow: onboarding → choose-plan → dashboard
    if (!completedOnboarding) {
      router.push("/onboarding");
    } else if (sub.status === "none") {
      router.push("/choose-plan");
    } else {
      router.push("/dashboard");
    }
    // keep loader visible during navigation
  }

  /** Go back from OTP to email */
  function handleBack() {
    setStep("email");
  }



  return (
    <div className="min-h-screen flex justify-center items-center bg-muted/40 px-4 py-5 md:px-7 md:py-8">
      <div className="mx-auto w-full max-w-6xl rounded-[28px] bg-background shadow-sm ring-1 ring-border">
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
                  isSubmitting={isSubmitting}
                />
              ) : (
                <OtpForm
                  email={email}
                  onVerify={handleOtpVerify}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
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
