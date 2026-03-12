"use client";

import { useParams, useRouter } from "next/navigation";
import { findProperty, mockProperties } from "@/lib/client-data";
import { PropertyForm } from "@/components/dashboard/properties/property-form";

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
