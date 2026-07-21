import { zodResolver } from '@hookform/resolvers/zod';
import {
  careerApplicationSchema,
  company,
  routes,
  type CareerApplicationInput,
} from '@platform/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, BriefcaseBusiness, CalendarDays, Clock3, FileText } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { ConsentField, Honeypot, TextAreaField, TextField } from '@/components/forms/fields';
import { FormError, SubmissionSuccess } from '@/components/forms/status';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { resources } from '@/data/content';
import { useMeta } from '@/hooks/use-meta';
import { api } from '@/lib/api';
import { createIdempotencyKey, formatDate } from '@/lib/utils';
import { NotFoundPage } from './system';

export function InsightsPage() {
  useMeta('Insights', 'Practical guides and briefings for clearer cybersecurity decisions.');
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Useful security thinking, without the noise."
        description="Practical guides and briefings focused on decisions, evidence, and achievable improvements."
      />
      <section className="section">
        <div className="shell grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Link key={resource.slug} to={routes.resource(resource.slug)} className="group">
              <Card className="flex h-full min-h-72 flex-col transition hover:border-cyan-300/30">
                <FileText className="h-6 w-6 text-cyan-300" />
                <p className="mt-7 text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">
                  {resource.type}
                </p>
                <h2 className="mt-3 text-xl font-semibold leading-snug">{resource.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{resource.summary}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold">
                  Read {resource.readTime}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-xs text-slate-500">
          Editorial content in this starter is marked for owner review before production
          publication.
        </p>
      </section>
    </>
  );
}

export function ResourceDetailPage() {
  const { slug } = useParams();
  const resource = resources.find((item) => item.slug === slug && item.status === 'published');
  useMeta(
    resource?.title ?? 'Insight not found',
    resource?.summary ?? 'The requested insight could not be found.',
    !resource,
  );
  if (!resource) return <NotFoundPage />;
  return (
    <>
      <article>
        <PageHero
          compact
          eyebrow={resource.type}
          title={resource.title}
          description={resource.summary}
        />
        <div className="shell grid gap-12 py-14 lg:grid-cols-[1fr_.34fr]">
          <div className="rich-copy max-w-3xl">
            <div className="mb-8 flex flex-wrap gap-5 border-b border-white/10 pb-6 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-300" />
                {formatDate(resource.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-cyan-300" />
                {resource.readTime}
              </span>
            </div>
            {resource.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="mt-10 rounded-xl border border-amber-300/20 bg-amber-300/[.04] p-5 text-sm leading-6 text-slate-300">
              <strong className="text-white">Editorial status:</strong> This starter content
              requires company review, jurisdictional review where relevant, and a named author
              before production publication.
            </div>
          </div>
          <aside>
            <div className="surface sticky top-28 p-6">
              <h2 className="text-xl font-semibold">Need context for your environment?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                A short conversation can help turn a broad concern into a sensible scope.
              </p>
              <Button className="mt-6 w-full" asChild>
                <Link to={routes.contact}>Talk to an expert</Link>
              </Button>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

export function CaseStudiesPage() {
  useMeta('Case studies', 'Verified cybersecurity outcomes and client stories.');
  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="Evidence belongs close to the decision."
        description="This section is ready for approved client stories, but none are published until the company supplies permission, context, and verifiable outcomes."
      />
      <section className="section">
        <div className="shell">
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-white/20 p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-cyan-300" />
            <h2 className="mt-5 text-2xl font-semibold">
              No verified case studies are published yet.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              The content model supports problem, engagement, outcome, permission status, and
              measurable results. It intentionally contains no fabricated clients or metrics.
            </p>
            <Button className="mt-7" asChild>
              <Link to={routes.services}>Explore service outcomes</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export function CareersPage() {
  useMeta('Careers', `Explore current opportunities at ${company.name}.`);
  const [selected, setSelected] = useState<CareerOpening | null>(null);
  const query = useQuery({
    queryKey: ['public-careers'],
    queryFn: () => api<{ items: CareerOpening[] }>('/public/careers'),
  });
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Do careful work that helps people act."
        description="Open roles will appear here only when approved company and employment information is available."
      />
      <section className="section">
        <div className="shell">
          {query.isLoading ? (
            <div className="surface p-8 text-sm text-slate-400" role="status">
              Loading approved openings…
            </div>
          ) : query.isError ? (
            <div className="surface border-rose-300/20 p-8 text-sm text-rose-200" role="alert">
              Openings could not be loaded. No application has been collected.
            </div>
          ) : query.data?.items.length ? (
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
              <div className="space-y-4">
                {query.data.items.map((opening) => (
                  <Card key={opening.id}>
                    <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">
                      {opening.workMode} · {opening.location}
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold">{opening.title}</h2>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">
                      {opening.description}
                    </p>
                    <Button className="mt-6" onClick={() => setSelected(opening)}>
                      Apply for this role
                    </Button>
                  </Card>
                ))}
              </div>
              <div>
                {selected ? (
                  <CareerApplicationForm opening={selected} />
                ) : (
                  <div className="surface sticky top-28 p-8">
                    <BriefcaseBusiness className="h-7 w-7 text-cyan-300" />
                    <h2 className="mt-5 text-2xl font-semibold">Choose an approved opening.</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      The application form appears here. Speculative applications are not collected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-white/20 p-9 text-center">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-cyan-300" />
              <h2 className="mt-5 text-2xl font-semibold">There are no published openings.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                We do not advertise placeholder positions or collect speculative CVs. Verified roles
                can be managed through the protected content administration area.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

type CareerOpening = {
  id: string;
  title: string;
  location: string;
  workMode: string;
  description: string;
  closesAt?: string;
};

function CareerApplicationForm({ opening }: { opening: CareerOpening }) {
  const form = useForm<CareerApplicationInput>({
    resolver: zodResolver(careerApplicationSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: opening.id,
      portfolioUrl: '',
      coverNote: '',
      consent: undefined,
      website: '',
      idempotencyKey: createIdempotencyKey(),
    },
  });
  const mutation = useMutation({
    mutationFn: (values: CareerApplicationInput) =>
      api<{ reference: string; status: string }>('/public/career', {
        method: 'POST',
        headers: { 'Idempotency-Key': values.idempotencyKey },
        body: JSON.stringify(values),
      }),
  });

  if (mutation.data)
    return <SubmissionSuccess title="Application received" reference={mutation.data.reference} />;

  return (
    <form
      className="surface sticky top-28 space-y-5 p-6 sm:p-8"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">
          Application
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{opening.title}</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          File uploads are intentionally disabled. Use the optional portfolio/profile URL; an
          authorised hiring contact can request documents through an approved channel.
        </p>
      </div>
      <input type="hidden" {...form.register('roleId')} value={opening.id} />
      <TextField
        required
        label="Name"
        autoComplete="name"
        registration={form.register('name')}
        error={form.formState.errors.name}
      />
      <TextField
        required
        label="Email"
        type="email"
        autoComplete="email"
        registration={form.register('email')}
        error={form.formState.errors.email}
      />
      <TextField
        label="Portfolio or professional profile URL"
        type="url"
        registration={form.register('portfolioUrl')}
        error={form.formState.errors.portfolioUrl}
      />
      <TextAreaField
        required
        label="Why are you interested in this role?"
        hint="Do not include identification documents or unnecessary sensitive information."
        registration={form.register('coverNote')}
        error={form.formState.errors.coverNote}
      />
      <ConsentField
        label={`I agree that ${company.name} may use this information to assess my application.`}
        registration={form.register('consent')}
        error={form.formState.errors.consent}
      />
      <Honeypot registration={form.register('website')} />
      {mutation.isError && <FormError message={mutation.error.message} />}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  );
}
