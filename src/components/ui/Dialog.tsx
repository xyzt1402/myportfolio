import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React from 'react';
import Button from './Button';

/* ------------------------------------------------------------------ */
/*  Sub-components (re-exported for composable usage)                  */
/* ------------------------------------------------------------------ */

export const DialogRoot = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

/* Animated Overlay */
export const DialogOverlay = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={`ds-dialog-overlay ${className ?? ''}`}
        {...props}
    />
));
DialogOverlay.displayName = 'DialogOverlay';

/* Animated Content */
export const DialogContent = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={`ds-dialog-content ${className ?? ''}`}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="ds-dialog-close" aria-label="Close">
                <X size={16} />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

export const DialogTitle = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={`ds-dialog-title ${className ?? ''}`}
        {...props}
    />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={`ds-dialog-description ${className ?? ''}`}
        {...props}
    />
));
DialogDescription.displayName = 'DialogDescription';

/* ------------------------------------------------------------------ */
/*  Convenience wrapper (backwards-compatible with existing usage)     */
/* ------------------------------------------------------------------ */

interface DialogProps {
    /** Optional text for a built-in button trigger. */
    triggerText?: string;
    /** Custom trigger element – overrides triggerText when provided. */
    trigger?: React.ReactNode;
    /** Dialog title shown in the header */
    title?: string;
    /** Dialog description shown below the title */
    description?: string;
    children: React.ReactNode;
    /** Controlled open state */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const Dialog: React.FC<DialogProps> = ({
    triggerText,
    trigger,
    title,
    description,
    children,
    open,
    onOpenChange,
}) => (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
            {trigger ? (
                <>{trigger}</>
            ) : (
                <Button variant="primary">{triggerText}</Button>
            )}
        </DialogTrigger>

        <DialogContent>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
            {children}
        </DialogContent>
    </DialogRoot>
);

export default Dialog;
