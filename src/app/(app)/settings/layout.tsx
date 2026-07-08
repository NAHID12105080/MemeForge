import Link from "next/link";

import { PageHeader } from "@/components/composed/page-header";

const settingsNav = [
  { label: "Account", href: "/settings" },
  { label: "Profile", href: "/settings/profile" },
  { label: "Appearance", href: "/settings/appearance" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex shrink-0 gap-1 md:w-48 md:flex-col">
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
