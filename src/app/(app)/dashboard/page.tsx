import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";

import { ComingSoon } from "@/components/composed/coming-soon";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <ComingSoon
      icon={LayoutDashboard}
      title="Dashboard"
      description="Your memes, stats, and recent activity."
    />
  );
}
