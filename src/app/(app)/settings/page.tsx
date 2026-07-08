import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { EmptyState } from "@/components/composed/empty-state";

export const metadata: Metadata = { title: "Account settings" };

export default function AccountSettingsPage() {
  return (
    <EmptyState
      icon={Settings}
      title="Account settings"
      description="Email, password, and account management are coming in a later milestone."
    />
  );
}
