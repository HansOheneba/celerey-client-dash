"use client";

import { useParams, useRouter } from "next/navigation";
import { findProperty } from "@/lib/client-data";
import { useFinancialStore } from "@/store/financialStore";
import { PropertyForm } from "@/components/dashboard/properties/property-form";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storeProperties = useFinancialStore((s) => s.propertyAssets);
  const property = findProperty(params.id, storeProperties);

  if (!property) {
    router.replace("/dashboard/properties");
    return null;
  }

  return <PropertyForm editingProperty={property} />;
}
