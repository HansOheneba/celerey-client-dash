"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { mockUpgradeToPro } from "@/lib/client-data";

type Options = {
  onSuccess?: () => void;
};

/** Local Pro upgrade while Stripe/Paystack webhooks are unreliable. */
export function useMockUpgrade(options: Options = {}) {
  const [upgrading, setUpgrading] = useState(false);
  const onSuccessRef = useRef(options.onSuccess);
  onSuccessRef.current = options.onSuccess;

  const upgrade = useCallback(async () => {
    if (upgrading) return;
    setUpgrading(true);
    try {
      mockUpgradeToPro();
      toast.success("You're on Pro \u2014 enjoy!");
      onSuccessRef.current?.();
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setUpgrading(false);
    }
  }, [upgrading]);

  return { upgrading, upgrade };
}
