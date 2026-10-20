"use client";

import * as React from "react";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>): React.JSX.Element {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>): React.JSX.Element {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>): React.JSX.Element {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>): React.JSX.Element {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>): React.JSX.Element {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-overlay/65", className)}
      {...props}
    />
  );
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
};

function DialogContent({ className, children, showCloseButton = true, ...props }: DialogContentProps): React.JSX.Element {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-6 overflow-y-auto rounded-none bg-popover p-6 text-popover-foreground  outline-none sm:p-8 [&>*]:min-w-0",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <Button
              data-slot="dialog-close"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
            >
              <XIcon aria-hidden="true" />
              <span className="sr-only">Kapat</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-3 pr-8 text-left", className)} {...props} />;
}

type DialogFooterProps = React.ComponentProps<"div"> & { showCloseButton?: boolean };

function DialogFooter({ className, showCloseButton = false, children, ...props }: DialogFooterProps): React.JSX.Element {
  return (
    <div data-slot="dialog-footer" className={cn("flex flex-col gap-3 sm:flex-row sm:justify-end", className)} {...props}>
      {children}
      {showCloseButton && <DialogPrimitive.Close asChild><Button variant="outline">Kapat</Button></DialogPrimitive.Close>}
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>): React.JSX.Element {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("font-serif text-2xl leading-tight font-medium break-words", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>): React.JSX.Element {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-base leading-relaxed break-words text-muted-foreground", className)} {...props} />;
}

export {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogOverlay, DialogPortal, DialogTitle, DialogTrigger,
};
