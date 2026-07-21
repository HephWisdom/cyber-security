import { zodResolver } from '@hookform/resolvers/zod';
import { newsletterSchema, type NewsletterInput } from '@platform/shared';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { createIdempotencyKey } from '@/lib/utils';
import { Button } from '../ui/button';
import { ConsentField, Honeypot, TextField } from './fields';
import { FormError } from './status';

export function NewsletterForm() {
  const form = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      consent: undefined,
      website: '',
      idempotencyKey: createIdempotencyKey(),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: NewsletterInput) =>
      api<{ status: string }>('/public/newsletter', {
        method: 'POST',
        headers: { 'Idempotency-Key': values.idempotencyKey },
        body: JSON.stringify(values),
      }),
  });

  if (mutation.data) {
    return (
      <div
        className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[.05] p-4 text-sm text-slate-300"
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
        <span>
          Subscription request received. Confirmation remains pending until the email step is
          complete.
        </span>
      </div>
    );
  }

  return (
    <form
      className="relative mt-6 space-y-4"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <TextField
        required
        label="Security insights by email"
        type="email"
        autoComplete="email"
        placeholder="you@organisation.com"
        registration={form.register('email')}
        error={form.formState.errors.email}
      />
      <ConsentField
        label="I want to receive security insights and can unsubscribe at any time."
        registration={form.register('consent')}
        error={form.formState.errors.consent}
      />
      <Honeypot registration={form.register('website')} />
      {mutation.isError && <FormError message={mutation.error.message} />}
      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Submitting…' : 'Subscribe'}
      </Button>
    </form>
  );
}
