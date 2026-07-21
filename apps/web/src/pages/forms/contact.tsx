import { zodResolver } from '@hookform/resolvers/zod';
import { company, contactSchema, routes, type ContactInput } from '@platform/shared';
import { useMutation } from '@tanstack/react-query';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PageHero } from '@/components/page-hero';
import {
  ConsentField,
  Honeypot,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/forms/fields';
import { FormError, SubmissionSuccess } from '@/components/forms/status';
import { Button } from '@/components/ui/button';
import { useMeta } from '@/hooks/use-meta';
import { api } from '@/lib/api';
import { track } from '@/lib/analytics';
import { createIdempotencyKey } from '@/lib/utils';

type FormResult = { reference: string; status: string };

export function ContactPage() {
  useMeta(
    'Contact',
    'Speak with a cybersecurity expert about a decision, concern, or planned engagement.',
  );
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      workEmail: '',
      organisation: '',
      phone: '',
      topic: 'general',
      message: '',
      consent: undefined,
      website: '',
      idempotencyKey: createIdempotencyKey(),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: ContactInput) =>
      api<FormResult>('/forms/contact', {
        method: 'POST',
        headers: { 'Idempotency-Key': values.idempotencyKey },
        body: JSON.stringify(values),
      }),
    onSuccess: () => track('contact_complete'),
  });
  const reset = () => {
    mutation.reset();
    form.reset({
      ...form.getValues(),
      name: '',
      workEmail: '',
      organisation: '',
      phone: '',
      message: '',
      consent: undefined,
      website: '',
      idempotencyKey: createIdempotencyKey(),
    });
  };
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Bring us the question, not a perfect brief."
        description="Tell us what changed, what concerns you, or what decision you need to make. Avoid sharing credentials, findings, or sensitive technical data here."
      />
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[.6fr_1.2fr]">
          <aside>
            <h2 className="text-2xl font-semibold">Contact details</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <a className="flex min-h-11 items-center gap-3" href={`mailto:${company.email}`}>
                <Mail className="h-4 w-4 text-cyan-300" />
                {company.email}
              </a>
              <a className="flex min-h-11 items-center gap-3" href={`tel:${company.phone}`}>
                <Phone className="h-4 w-4 text-cyan-300" />
                {company.phone}
              </a>
              <span className="flex min-h-11 items-center gap-3">
                <MapPin className="h-4 w-4 text-cyan-300" />
                {company.address}
              </span>
            </div>
            <p className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-4 text-xs leading-5 text-slate-300">
              Contact details are central placeholders and must be verified before launch. This form
              is not an emergency monitoring channel.
            </p>
          </aside>
          <div>
            {mutation.data ? (
              <SubmissionSuccess reference={mutation.data.reference} onReset={reset} />
            ) : (
              <form
                className="surface relative space-y-6 p-6 sm:p-8"
                noValidate
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    required
                    label="Name"
                    autoComplete="name"
                    registration={form.register('name')}
                    error={form.formState.errors.name}
                  />
                  <TextField
                    required
                    label="Work email"
                    type="email"
                    autoComplete="email"
                    registration={form.register('workEmail')}
                    error={form.formState.errors.workEmail}
                  />
                  <TextField
                    required
                    label="Organisation"
                    autoComplete="organization"
                    registration={form.register('organisation')}
                    error={form.formState.errors.organisation}
                  />
                  <TextField
                    label="Phone"
                    type="tel"
                    autoComplete="tel"
                    registration={form.register('phone')}
                    error={form.formState.errors.phone}
                  />
                </div>
                <SelectField
                  required
                  label="What would you like to discuss?"
                  registration={form.register('topic')}
                  error={form.formState.errors.topic}
                  options={[
                    ['general', 'General enquiry'],
                    ['services', 'Security services'],
                    ['partnership', 'Partnership'],
                    ['privacy', 'Privacy request'],
                    ['other', 'Other'],
                  ]}
                />
                <TextAreaField
                  required
                  label="How can we help?"
                  hint="Do not include passwords, credentials, findings, or sensitive evidence."
                  registration={form.register('message')}
                  error={form.formState.errors.message}
                />
                <ConsentField
                  label={`I agree that ${company.name} may use this information to respond to my request.`}
                  registration={form.register('consent')}
                  error={form.formState.errors.consent}
                />
                <Honeypot registration={form.register('website')} />
                {mutation.isError && <FormError message={mutation.error.message} />}
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Sending securely…' : 'Send enquiry'}
                </Button>
                <p className="text-xs text-slate-500">
                  By submitting, you acknowledge the{' '}
                  <a className="underline" href={routes.privacy}>
                    privacy policy
                  </a>
                  . A confirmation appears only after server acceptance.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
