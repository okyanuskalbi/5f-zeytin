"use client";

// Adapted from `shadcn add sheet`: Sheet and Dialog use the same Radix Dialog
// primitives. Share our tokenized base and its fullscreen placement so switching
// presentation never remounts fields, discards a draft or interrupts focus.
// The caller supplies bottom-entry motion and the sheet-content slot.
export {
  Dialog as Sheet,
  DialogTrigger as SheetTrigger,
  DialogClose as SheetClose,
  DialogContent as SheetContent,
  DialogHeader as SheetHeader,
  DialogFooter as SheetFooter,
  DialogTitle as SheetTitle,
  DialogDescription as SheetDescription,
} from "@/components/ui/dialog";
