import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

const buttonVariants = cva(
  "inline-flex min-h-11 min-w-0 max-w-full items-center justify-center gap-2 rounded-none border border-transparent font-sans text-base font-medium whitespace-normal break-words text-center transition-transform duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:hover:bg-muted aria-invalid:border-destructive aria-invalid:outline-destructive active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        outline: "bg-background text-foreground hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "bg-background text-foreground hover:bg-accent",
        link: "text-primary underline underline-offset-4 hover:decoration-2",
      },
      size: {
        default: "px-5 py-3",
        xs: "gap-1 px-2 py-2 text-xs",
        sm: "gap-1.5 px-3 py-2",
        lg: "min-h-12 px-7 py-3 text-base",
        icon: "size-11 shrink-0",
        "icon-xs": "size-11 shrink-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-11 shrink-0",
        "icon-lg": "size-12 shrink-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
};

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  type = "button",
  ...props
}: ButtonProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
