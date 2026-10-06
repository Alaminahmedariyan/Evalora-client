"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { mergeRefs } from "@/lib/mergeRefs";

export const buttonVariants = cva(
  "interactive group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:brightness-110",
        brand: "bg-brand-accent text-brand-accent-foreground shadow-md shadow-brand-accent/25 hover:brightness-110",
        outline:
          "border border-border bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-md shadow-destructive/20 hover:brightness-110",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium variants
        gradient: "btn-gradient",
        glass:
          "border border-border bg-card/70 text-foreground shadow-sm backdrop-blur-md hover:border-primary/40 hover:bg-card",
        light: "bg-white text-indigo-700 shadow-lg shadow-black/10 hover:bg-white/90",
        onDark: "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-12 rounded-xl px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, asChild, children, onClick, ...props }, ref) => {
    const isDisabled = disabled || isLoading;
    const classes = cn(buttonVariants({ variant, size }), isDisabled && "pointer-events-none opacity-50", className);

    const spinner = isLoading ? (
      <span
        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
    ) : null;

    if (asChild && React.isValidElement(children)) {
      // The element's own props type has to accept the extra props below.
      // Our narrow, hand-written prop shape does not declare them, so TypeScript
      // rejects the call even though it is valid at runtime. shadcn/ui's <Slot>
      // hits the same limitation and widens the type the same way. The widening
      // stays inside this one branch instead of loosening types anywhere else.
      const child = children as React.ReactElement<any>;
      const childRef = (child as { ref?: React.Ref<HTMLElement> }).ref ?? null;

      return React.cloneElement(child, {
        ...props,
        ref: mergeRefs(ref as React.Ref<HTMLElement>, childRef),
        className: cn(classes, child.props.className),
        "aria-disabled": isDisabled || undefined,
        tabIndex: isDisabled ? -1 : undefined,
        onClick: isDisabled
          ? (e: React.MouseEvent) => e.preventDefault()
          : (e: React.MouseEvent) => {
              child.props.onClick?.(e);
              onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
            },
        children: (
          <>
            {spinner}
            {child.props.children}
          </>
        ),
      });
    }

    return (
      <button ref={ref} className={classes} disabled={isDisabled} onClick={onClick} {...props}>
        {spinner}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";