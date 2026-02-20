"use client";

import { useParams, useRouter } from "next/navigation";
import { findHolding, mockHoldings } from "@/lib/asset-data";
import { HoldingForm } from "@/components/dashboard/assets/holding-form";

export default function EditHoldingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const holding = findHolding(params.id, mockHoldings);

  if (!holding) {
    // Holding not found - redirect back
    router.replace("/dashboard/assets");
    return null;
  }

  return <HoldingForm editingHolding={holding} />;
}
