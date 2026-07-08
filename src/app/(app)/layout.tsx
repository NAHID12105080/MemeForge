import { AppSidebar } from "./_components/app-sidebar";
import { AppTopbar } from "./_components/app-topbar";
import { CommandPalette } from "@/components/composed/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
