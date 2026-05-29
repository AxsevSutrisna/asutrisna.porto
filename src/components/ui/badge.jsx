import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-2 px-3 py-1 text-sm font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-2 [&>svg]:pointer-events-none focus-visible:outline-none overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--color-backdrop-base)] border-[color:var(--color-border-light)] text-[color:var(--color-text-primary)]",
        primary: "bg-[color:var(--color-primary-dark)] border-[color:var(--color-border-light)] text-[color:var(--color-text-primary)]",
        neutral: "bg-[color:var(--color-backdrop-glow)] border-[color:var(--color-border-dark)] text-[color:var(--color-text-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
