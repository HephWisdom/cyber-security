import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-all duration-200 will-change-transform active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 [&>svg]:transition-transform [&>svg]:duration-200 [&:hover>svg]:translate-x-0.5',
  {
    variants: {
      variant: {
        primary:
          'border border-[#0b63f6] bg-[#0b63f6] text-white shadow-[0_12px_30px_rgba(11,99,246,.2)] hover:-translate-y-0.5 hover:border-[#071a33] hover:bg-[#071a33] hover:text-white hover:shadow-[0_16px_36px_rgba(7,26,51,.24)]',
        secondary:
          'border border-[#0b63f6] bg-white text-[#0b63f6] hover:-translate-y-0.5 hover:border-[#38bdf8] hover:bg-[#eaf4ff] hover:text-[#0755d1] hover:shadow-[0_12px_26px_rgba(11,99,246,.12)]',
        ghost:
          'border border-transparent text-current hover:border-[#0b63f6] hover:bg-[#eaf4ff] hover:text-[#0755d1]',
        inverse:
          'border border-white bg-white text-[#0755d1] shadow-[0_12px_30px_rgba(4,28,66,.18)] hover:-translate-y-0.5 hover:border-[#ff5c35] hover:bg-[#ff5c35] hover:text-white hover:shadow-[0_16px_34px_rgba(255,92,53,.28)]',
        danger: 'border border-rose-600 bg-rose-600 text-white hover:bg-white hover:text-rose-600',
      },
      size: { default: 'min-h-11 px-5', sm: 'min-h-9 px-3.5', lg: 'min-h-12 px-6 text-base' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild, className, variant, size, ...props }: Props) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
