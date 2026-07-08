"use client";

import {
  Bookmark,
  Compass,
  FolderHeart,
  Home,
  LayoutDashboard,
  Palette,
  Sparkles,
  SquarePlus,
  TrendingUp,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/features/auth/components/user-menu";

const createNav = [{ label: "New meme", href: "/editor/new", icon: SquarePlus }];

const browseNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Templates", href: "/templates", icon: Palette },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Trending", href: "/trending", icon: TrendingUp },
];

const createToolsNav = [
  { label: "AI Generator", href: "/ai-generator", icon: Sparkles },
  { label: "GIF Generator", href: "/gif-generator", icon: Video },
];

const libraryNav = [
  { label: "Collections", href: "/collections", icon: FolderHeart },
  { label: "Favorites", href: "/favorites", icon: Bookmark },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <Home className="text-brand-via size-5 shrink-0" />
          <span className="font-heading text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            MemeForge
          </span>
        </Link>
        <Button asChild className="w-full justify-start gap-2">
          <Link href={createNav[0].href}>
            <SquarePlus className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">New meme</span>
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {browseNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {createToolsNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
