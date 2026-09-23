"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { mergeRefs } from "@/lib/mergeRefs";

const buttonVariants = cva(
  "interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        brand: "bg-brand-accent text-brand-accent-foreground hover:opacity-90",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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

type ChildWithRef = React.ReactElement<{
  className?: string;
  "aria-disabled"?: boolean;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}> & { ref?: React.Ref<HTMLElement> };

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
  // element's own declared props type to accept it in the props object —
  // our narrow, hand-written prop shape below doesn't declare it, so TS
  // rejects it even though this is valid at runtime. shadcn/ui's own
  // <Slot> component hits the exact same limitation and works around it
  // the same way: widen to `ReactElement<any>` for this one call, isolated
  // to this single function, rather than loosening types anywhere else.
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