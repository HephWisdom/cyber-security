import { zodResolver } from '@hookform/resolvers/zod';
import { assessmentSchema, company, type AssessmentInput } from '@platform/shared';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ConsentField,
  Honeypot,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/forms/fields';
import { FormError, SubmissionSuccess } from '@/components/forms/status';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { useMeta } from '@/hooks/use-meta';
import { api } from '@/lib/api';
import { track } from '@/lib/analytics';
import { createIdempotencyKey } from '@/lib/utils';

const steps = ['Your objective', 'Organisation context', 'Contact & consent'];
const persistedKey = 'assessment-draft-v1';
type FormResult = { reference: string; status: string };

export function AssessmentPage() {
  useMeta(
    'Request a security assessment',
    'Start a confidential scope request for cybersecurity assessment or advisory work.',
  );
  const [step, setStep] = useState(0);
  const form = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      workEmail: '',
      organisation: '',
      phone: '',
      service: 'not-sure',
      organisationSize: 'prefer-not-to-say',
      timeframe: 'planning',
      context: '',
      consent: undefined,
      website: '',
      idempotencyKey: createIdempotencyKey(),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: AssessmentInput) =>
      api<FormResult>('/forms/assessment', {
        method: 'POST',
        headers: { 'Idempotency-Key': values.idempotencyKey },
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      localStorage.removeItem(persistedKey);
      track('assessment_complete');
    },
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(persistedKey) ?? '{}',
      ) as Partial<AssessmentInput>;
      if (saved.service) form.setValue('service', saved.service);
      if (saved.organisationSize) form.setValue('organisationSize', saved.organisationSize);
      if (saved.timeframe) form.setValue('timeframe', saved.timeframe);
    } catch {
      localStorage.removeItem(persistedKey);
    }
  }, [form]);
  useEffect(() => {
    const sub = form.watch((value) =>
      localStorage.setItem(
        persistedKey,
        JSON.stringify({
          service: value.service,
          organisationSize: value.organisationSize,
          timeframe: value.timeframe,
        }),
      ),
    );
    return () => sub.unsubscribe();
  }, [form]);

  const next = async () => {
    const fields: Array<Array<keyof AssessmentInput>> = [
      ['service', 'timeframe', 'context'],
      ['organisation', 'organisationSize'],
      ['name', 'workEmail', 'consent'],
    ];
    if (await form.trigger(fields[step])) {
      if (step === 0) track('assessment_start');
      setStep((value) => Math.min(2, value + 1));
      document
        .querySelector('#assessment-progress')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  return (
    <>
      <PageHero
        compact
        eyebrow="Security assessment"
        title="Start with the decision you need to make."
        description="This scope request collects only enough information for an initial conversation. Do not submit credentials, live findings, regulated records, or sensitive evidence."
      />
      <section className="section pt-12">
        <div className="shell max-w-4xl">
          {mutation.data ? (
            <SubmissionSuccess
              title="Assessment request received"
              reference={mutation.data.reference}
            />
          ) : (
            <>
              <ol
                id="assessment-progress"
                className="mb-8 grid grid-cols-3 gap-2"
                aria-label="Assessment request progress"
              >
                {steps.map((label, index) => (
                  <li
                    key={label}
                    aria-current={step === index ? 'step' : undefined}
                    className={`rounded-lg border p-3 text-xs sm:text-sm ${index <= step ? 'border-cyan-300/30 bg-cyan-300/[.06] text-white' : 'border-white/10 text-slate-500'}`}
                  >
                    <span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full border border-current text-[10px]">
                      {index < step ? <Check className="h-3 w-3" /> : index + 1}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </li>
                ))}
              </ol>
              <form
                className="surface relative p-6 sm:p-9"
                noValidate
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                <div aria-live="polite" className="sr-only">
                  Step {step + 1} of 3: {steps[step]}
                </div>
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold">What do you need to understand?</h2>
                      <p className="mt-2 text-sm text-slate-400">
                        A broad direction is enough. We will confirm scope before any work begins.
                      </p>
                    </div>
                    <SelectField
                      required
                      label="Service or area"
                      registration={form.register('service')}
                      error={form.formState.errors.service}
                      options={[
                        ['security-assessments', 'Security assessment'],
                        ['penetration-testing', 'Penetration testing'],
                        ['incident-readiness', 'Incident readiness'],
                        ['cloud-security', 'Cloud security'],
                        ['governance-risk-compliance', 'Governance, risk & compliance'],
                        ['not-sure', 'Not sure yet'],
                      ]}
                    />
                    <SelectField
                      required
                      label="Timeframe"
                      registration={form.register('timeframe')}
                      error={form.formState.errors.timeframe}
                      options={[
                        ['urgent', 'Urgent planning need'],
                        ['within-30-days', 'Within 30 days'],
                        ['within-90-days', 'Within 90 days'],
                        ['planning', 'Exploratory planning'],
                      ]}
                    />
                    <TextAreaField
                      required
                      label="Context and desired outcome"
                      hint="Describe the business decision or concern, without credentials or sensitive technical evidence."
                      registration={form.register('context')}
                      error={form.formState.errors.context}
                    />
                  </div>
                )}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold">Organisation context</h2>
                      <p className="mt-2 text-sm text-slate-400">
                        This helps us suggest a proportionate next step.
                      </p>
                    </div>
                    <TextField
                      required
                      label="Organisation"
                      autoComplete="organization"
                      registration={form.register('organisation')}
                      error={form.formState.errors.organisation}
                    />
                    <SelectField
                      required
                      label="Organisation size"
                      registration={form.register('organisationSize')}
                      error={form.formState.errors.organisationSize}
                      options={[
                        ['1-49', '1–49'],
                        ['50-249', '50–249'],
                        ['250-999', '250–999'],
                        ['1000+', '1,000+'],
                        ['prefer-not-to-say', 'Prefer not to say'],
                      ]}
                    />
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold">Where should we respond?</h2>
                      <p className="mt-2 text-sm text-slate-400">
                        Submission does not create an engagement or emergency response commitment.
                      </p>
                    </div>
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
                        label="Phone"
                        type="tel"
                        autoComplete="tel"
                        registration={form.register('phone')}
                        error={form.formState.errors.phone}
                      />
                    </div>
                    <ConsentField
                      label={`I agree that ${company.name} may use this information to respond to my assessment request.`}
                      registration={form.register('consent')}
                      error={form.formState.errors.consent}
                    />
                    <Honeypot registration={form.register('website')} />
                  </div>
                )}
                {mutation.isError && (
                  <div className="mt-6">
                    <FormError message={mutation.error.message} />
                  </div>
                )}
                <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-6">
                  {step > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep((value) => value - 1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  {step < 2 ? (
                    <Button type="button" onClick={next}>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? 'Submitting securely…' : 'Submit request'}
                    </Button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
