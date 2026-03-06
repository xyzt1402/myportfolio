import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** When true, renders the child element instead of a <button> */
    asChild?: boolean;
    /** Show a loading spinner and disable interaction */
    loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'ds-btn-primary',
    secondary: 'ds-btn-secondary',
    ghost: 'ds-btn-ghost',
    destructive: 'bg-[var(--ds-destructive)] text-white hover:opacity-90 border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'ds-btn-sm',
    md: '',
    lg: 'ds-btn-lg',
    icon: 'ds-btn-icon',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            asChild = false,
            loading = false,
            disabled,
            className,
            children,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                ref={ref}
                disabled={disabled || loading}
                className={clsx(
                    'ds-btn',
                    variantClasses[variant],
                    sizeClasses[size],
                    loading && 'cursor-wait',
                    className,
                )}
                {...props}
            >
                {loading ? (
                    <>
                        <span
                            className="ds-animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                            aria-hidden="true"
                        />
                        <span className="sr-only">Loading…</span>
                        {children}
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    },
);

Button.displayName = 'Button';

export default Button;
