import { zodResolver } from '@hookform/resolvers/zod';
import {
  company,
  incidentSchema,
  vulnerabilitySchema,
  type IncidentInput,
  type VulnerabilityInput,
} from '@platform/shared';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
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
import { createIdempotencyKey } from '@/lib/utils';

type FormResult = { reference: string; status: string };

export function IncidentPage() {
  useMeta(
    'Incident response request',
    'Submit an initial request for help with a suspected cybersecurity incident.',
  );
  const form = useForm<IncidentInput>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      name: '',
      workEmail: '',
      organisation: '',
      phone: '',
      incidentType: 'unknown',
      activeIncident: false,
      safeToContact: 'either',
      summary: '',
      consent: undefined,
      website: '',
      idempotencyKey: createIdempotencyKey(),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: IncidentInput) =>
      api<FormResult>('/forms/incident', {
        method: 'POST',
        headers: { 'Idempotency-Key': values.idempotencyKey },
        body: JSON.stringify(values),
      }),
  });
  return (
    <>
      <PageHero
        compact
        eyebrow="Incident response request"
        title="Request help with a suspected incident."
        description="This form is reviewed during normal operating hours unless the company has separately confirmed an active response agreement."
      />
      <section className="section pt-12">
        <div className="shell max-w-4xl">
          <div className="mb-8 flex gap-4 rounded-xl border border-amber-300/25 bg-amber-300/[.06] p-5">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <h2 className="text-base font-semibold">
                This is not a 24/7 emergency monitoring channel.
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                If life, safety, or critical public services are at risk, contact the appropriate
                emergency authority. Do not shut down, wipe, or alter affected systems unless your
                response plan or an authorised responder directs you to do so.
              </p>
            </div>
          </div>
          {mutation.data ? (
            <SubmissionSuccess
              title="Incident request received"
              reference={mutation.data.reference}
            />
          ) : (
            <form
              className="surface relative space-y-6 p-6 sm:p-9"
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
                  required
                  label="Safe callback number"
                  type="tel"
                  autoComplete="tel"
                  registration={form.register('phone')}
                  error={form.formState.errors.phone}
                />
                <SelectField
                  required
                  label="Suspected incident type"
                  registration={form.register('incidentType')}
                  error={form.formState.errors.incidentType}
                  options={[
                    ['ransomware', 'Ransomware'],
                    ['account-compromise', 'Account compromise'],
                    ['data-exposure', 'Data exposure'],
                    ['service-disruption', 'Service disruption'],
                    ['unknown', 'Unknown'],
                    ['other', 'Other'],
                  ]}
                />
                <SelectField
                  required
                  label="Safest contact method"
                  registration={form.register('safeToContact')}
                  error={form.formState.errors.safeToContact}
                  options={[
                    ['email', 'Email'],
                    ['phone', 'Phone'],
                    ['either', 'Either'],
                  ]}
                />
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-300"
                  {...form.register('activeIncident')}
                />
                The incident appears active now
              </label>
              <TextAreaField
                required
                label="Brief, non-sensitive summary"
                hint="Do not include passwords, access tokens, malware, personal records, or detailed evidence."
                registration={form.register('summary')}
                error={form.formState.errors.summary}
              />
              <ConsentField
                label={`I authorise ${company.name} to use this information to respond to this request. I understand this is not an emergency monitoring channel.`}
                registration={form.register('consent')}
                error={form.formState.errors.consent}
              />
              <Honeypot registration={form.register('website')} />
              {mutation.isError && <FormError message={mutation.error.message} />}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Submitting securely…' : 'Submit incident request'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export function VulnerabilityPage() {
  useMeta(
    'Report a vulnerability',
    'Report a suspected vulnerability through the responsible disclosure process.',
  );
  const form = useForm<VulnerabilityInput>({
    resolver: zodResolver(vulnerabilitySchema),
    defaultValues: {
      name: '',
      email: '',
      affectedAsset: '',
      vulnerabilityType: '',
      summary: '',
      disclosureAgreement: undefined,
      website: '',
      idempotencyKey: createIdempotencyKey(),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: VulnerabilityInput) =>
      api<FormResult>('/forms/vulnerability', {
        method: 'POST',
        headers: { 'Idempotency-Key': values.idempotencyKey },
        body: JSON.stringify(values),
      }),
  });
  return (
    <>
      <PageHero
        compact
        eyebrow="Responsible disclosure"
        title="Report a suspected vulnerability safely."
        description="Please review the responsible disclosure policy first. A submission reference confirms receipt, not validation, safe harbour, or reward eligibility."
      />
      <section className="section pt-12">
        <div className="shell max-w-4xl">
          <div className="mb-8 flex gap-4 rounded-xl border border-cyan-300/20 bg-cyan-300/[.05] p-5">
            <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
            <p className="text-sm leading-6 text-slate-300">
              No assets are authorised for testing until the company publishes or confirms scope in
              writing. Do not submit live credentials, other people’s data, malware, or exploit code
              through this form.
            </p>
          </div>
          {mutation.data ? (
            <SubmissionSuccess title="Report received" reference={mutation.data.reference} />
          ) : (
            <form
              className="surface relative space-y-6 p-6 sm:p-9"
              noValidate
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  required
                  label="Name or handle"
                  autoComplete="name"
                  registration={form.register('name')}
                  error={form.formState.errors.name}
                />
                <TextField
                  required
                  label="Contact email"
                  type="email"
                  autoComplete="email"
                  registration={form.register('email')}
                  error={form.formState.errors.email}
                />
              </div>
              <TextField
                required
                label="Affected asset"
                hint="URL, host, application name, or other precise identifier."
                registration={form.register('affectedAsset')}
                error={form.formState.errors.affectedAsset}
              />
              <TextField
                required
                label="Vulnerability type"
                registration={form.register('vulnerabilityType')}
                error={form.formState.errors.vulnerabilityType}
              />
              <TextAreaField
                required
                rows={9}
                label="Summary and safe reproduction steps"
                hint="Describe impact and minimal steps. Redact personal data and secrets."
                registration={form.register('summary')}
                error={form.formState.errors.summary}
              />
              <ConsentField
                label="I have read the responsible disclosure policy, will follow its restrictions, and confirm this report does not contain unnecessary personal data, credentials, malware, or secrets."
                registration={form.register('disclosureAgreement')}
                error={form.formState.errors.disclosureAgreement}
              />
              <Honeypot registration={form.register('website')} />
              {mutation.isError && <FormError message={mutation.error.message} />}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Submitting securely…' : 'Submit vulnerability report'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
