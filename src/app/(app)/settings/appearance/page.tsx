import type { Metadata } from "next";

import { AppearanceForm } from "./appearance-form";

export const metadata: Metadata = { title: "Appearance settings" };

export default function AppearanceSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Appearance</h2>
        <p className="text-muted-foreground text-sm">
          Customize how MemeForge looks on your device.
        </p>
      </div>
      <AppearanceForm />
    </div>
  );
}
