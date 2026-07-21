import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function PageHero({
  eyebrow,
  title,
  description,
  cta,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta?: { label: string; to: string };
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-white/10',
        compact ? 'py-16 sm:py-20' : 'py-20 sm:py-28',
      )}
    >
      <div className="hero-grid bg-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/[.07] blur-3xl"
        aria-hidden="true"
      />
      <div className="shell relative">
        <p className="kicker">{eyebrow}</p>
        <h1
          className={cn(
            'max-w-4xl font-semibold leading-[1.08]',
            compact ? 'text-3xl sm:text-5xl' : 'text-4xl sm:text-5xl lg:text-6xl',
          )}
        >
          {title}
        </h1>
        <p className="lede max-w-2xl">{description}</p>
        {cta && (
          <Button className="mt-8" asChild size="lg">
            <Link to={cta.to}>
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
