import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React from 'react';

/* ------------------------------------------------------------------ */
/*  Re-export primitives for composable usage                          */
/* ------------------------------------------------------------------ */

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
    React.ComponentRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
    <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={`ds-tooltip-content ${className ?? ''}`}
            {...props}
        >
            {children}
            <TooltipPrimitive.Arrow className="ds-tooltip-arrow" />
        </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

/* ------------------------------------------------------------------ */
/*  Convenience wrapper (backwards-compatible with existing usage)     */
/* ------------------------------------------------------------------ */

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    delayDuration?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    side = 'top',
    delayDuration = 300,
}) => (
    <TooltipRoot delayDuration={delayDuration}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipRoot>
);

export default Tooltip;
