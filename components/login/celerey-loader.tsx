"use client";

import Image from "next/image";

interface CelereyLoaderProps {
  message?: string;
}

export function CelereyLoader({
  message = "Signing you in…",
}: CelereyLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="animate-celerey-breathe">
        <Image
          src="https://i.ibb.co/C593ZXMx/Celerey-Secondary-Symbol-Dark.png"
          alt="Celerey"
          width={72}
          height={72}
          priority
          unoptimized
        />
      </div>
      {message && (
        <p className="mt-5 text-sm text-muted-foreground tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}
