import type { Metadata } from "next";
import { User } from "lucide-react";

import { EmptyState } from "@/components/composed/empty-state";

export const metadata: Metadata = { title: "Profile settings" };

export default function ProfileSettingsPage() {
  return (
    <EmptyState
      icon={User}
      title="Profile settings"
      description="Editing your bio, avatar, and links is coming in a later milestone."
    />
  );
}
