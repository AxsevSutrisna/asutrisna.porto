/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl border-2 border-[color:var(--color-button-outline)] text-sm font-medium ring-offset-[color:var(--color-backdrop-base)] transition-all gap-2 shadow-[4px_4px_0_var(--color-shadow-primary)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-button-outline)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-[color:var(--color-button-primary-from)] text-[color:var(--color-text-primary)]',
                noShadow: 'bg-[color:var(--color-button-primary-from)] text-[color:var(--color-text-primary)] shadow-none hover:translate-x-0 hover:translate-y-0',
                neutral: 'bg-[color:var(--color-button-secondary-from)] text-[color:var(--color-text-primary)]',
                ghost: 'bg-[color:var(--color-backdrop-base)] text-[color:var(--color-text-primary)]',
                reverse: 'bg-[color:var(--color-button-primary-to)] text-[color:var(--color-text-primary)]',
            },
            size: {
                default: 'h-11 px-5',
                sm: 'h-10 px-4',
                lg: 'h-12 px-6',
                icon: 'size-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}) {
    const Comp = asChild ? Slot : 'button'

    return (
        <Comp
            data-slot="button"
            data-variant={variant || 'default'}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
