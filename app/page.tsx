// app/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LoginCarousel } from "@/components/login/login-carousel";
import { EmailForm } from "@/components/login/email-form";
import { OtpForm } from "@/components/login/otp-form";
import type { AuthStep } from "@/components/login/types";

export default function Home() {
  const router = useRouter();

  const [step, setStep] = React.useState<AuthStep>("email");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  /** Email entered - move to OTP step */
  function handleEmailSubmit(submittedEmail: string) {
    setEmail(submittedEmail);
    // In the future: fire off an API call to send the OTP here
    setStep("otp");
  }

  /** OTP entered - navigate to dashboard */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleOtpVerify(_otp: string) {
    setIsSubmitting(true);
    try {
      // No backend yet - just proceed
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
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
                  src="/Celerey_Logo_dark.png"
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
