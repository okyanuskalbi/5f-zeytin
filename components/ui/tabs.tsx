"use client";

import * as React from "react";
import { cn } from "cn";
import { Tabs as TabsPrimitive } from "radix-ui";

// Official shadcn CLI tabs, adapted to AFİNA's flat sand/olive surfaces.
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex min-w-0 flex-col gap-6", className)} {...props} />;
}
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("flex w-fit max-w-full gap-2 overflow-x-auto p-1", className)} {...props} />;
}
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-none px-5 py-3 font-sans text-base font-medium whitespace-nowrap text-foreground hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />;
}
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring", className)} {...props} />;
}
export { Tabs, TabsList, TabsTrigger, TabsContent };
