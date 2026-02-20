"use client";

import { useParams, useRouter } from "next/navigation";
import { findProperty, mockProperties } from "@/lib/property-data";
import { PropertyForm } from "@/components/dashboard/assets/property-form";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const property = findProperty(params.id, mockProperties);

  if (!property) {
    router.replace("/dashboard/properties");
    return null;
  }

  return <PropertyForm editingProperty={property} />;
}
