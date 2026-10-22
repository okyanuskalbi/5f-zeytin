"use client";

import type { ComponentProps } from "react";
import { cn } from "cn";
import { Slot } from "radix-ui";

// Adapted from `shadcn add sidebar`: retain the composable sidebar/group/menu
// primitives. AdminShell owns its accessible mobile Sheet. No collapse cookie,
// global keyboard shortcut or unused tooltip/skeleton dependencies are needed.
function Sidebar({ className, ...props }: ComponentProps<"aside">) {
  return <aside data-slot="sidebar" className={cn("bg-background text-foreground", className)} {...props} />;
}
function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-content" className={cn("min-h-0 flex-1 overflow-y-auto px-4", className)} {...props} />;
}
function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-group" className={cn("mb-4 border-b border-border pb-4 last:mb-0 last:border-b-0", className)} {...props} />;
}
function SidebarGroupLabel({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-group-label" className={cn("px-3 py-2 text-sm font-semibold text-muted-foreground", className)} {...props} />;
}
function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("flex min-w-0 flex-col gap-1", className)} {...props} />;
}
function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("min-w-0", className)} {...props} />;
}
function SidebarMenuButton({ asChild = false, className, ...props }: ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="sidebar-menu-button" className={cn(
    "flex min-h-11 w-full items-center gap-3 rounded-(--radius) px-3 py-2 text-left text-sm font-medium break-words hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[active=true]:bg-primary data-[active=true]:text-primary-foreground [&_svg]:size-4 [&_svg]:shrink-0",
    className,
  )} {...props} />;
}
export { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem };
