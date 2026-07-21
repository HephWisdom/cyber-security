import {
  activeIndustries,
  activeServices,
  activeSolutions,
  routes,
  type CatalogItem,
} from '@platform/shared';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { useMeta } from '@/hooks/use-meta';
import { NotFoundPage } from './system';

type CatalogType = 'services' | 'solutions' | 'industries';

const catalogConfig = {
  services: {
    items: activeServices,
    title: 'Focused security services. Clear next steps.',
    description:
      'Assessment, testing, and advisory work designed around the risk decision you need to make.',
    itemRoute: routes.service,
    singular: 'service',
  },
  solutions: {
    items: activeSolutions,
    title: 'Security outcomes organised around your challenge.',
    description:
      'Begin with the business risk or operating concern—not an arbitrary list of tools.',
    itemRoute: routes.solution,
    singular: 'solution',
  },
  industries: {
    items: activeIndustries,
    title: 'Security advice needs operational context.',
    description:
      'Explore how priorities change across different services, constraints, data, and obligations.',
    itemRoute: routes.industry,
    singular: 'industry',
  },
} satisfies Record<
  CatalogType,
  {
    items: CatalogItem[];
    title: string;
    description: string;
    itemRoute: (slug: string) => string;
    singular: string;
  }
>;

export function CatalogPage({ type }: { type: CatalogType }) {
  const config = catalogConfig[type];
  useMeta(type[0]!.toUpperCase() + type.slice(1), config.description);
  return (
    <>
      <PageHero
        eyebrow={type}
        title={config.title}
        description={config.description}
        cta={{ label: 'Talk to an expert', to: routes.contact }}
      />
      <section className="section">
        <div className="shell grid gap-4 md:grid-cols-2">
          {config.items.map((item) => (
            <Link
              key={item.slug}
              to={config.itemRoute(item.slug)}
              className="surface group flex min-h-72 flex-col p-7 transition hover:border-cyan-300/30 hover:bg-white/[.05] sm:p-9"
            >
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">
                {item.eyebrow}
              </p>
              <h2 className="mt-5 text-2xl font-semibold">{item.name}</h2>
              <p className="mt-4 max-w-xl text-slate-400">{item.summary}</p>
              <div className="mt-7 space-y-2">
                {item.outcomes.slice(0, 2).map((outcome) => (
                  <span key={outcome} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    {outcome}
                  </span>
                ))}
              </div>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-white">
                Explore {config.singular}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function CatalogDetailPage({ type }: { type: CatalogType }) {
  const { slug } = useParams();
  const config = catalogConfig[type];
  const item = config.items.find((entry) => entry.slug === slug);
  useMeta(
    item?.name ?? 'Not found',
    item?.summary ?? 'The requested catalog entry could not be found.',
    !item,
  );
  if (!item) return <NotFoundPage />;
  const isService = type === 'services';
  return (
    <>
      <PageHero
        eyebrow={`${config.singular} · ${item.eyebrow}`}
        title={item.name}
        description={item.summary}
        cta={{
          label: isService ? 'Request this assessment' : 'Discuss this challenge',
          to: routes.assessment,
        }}
      />
      <section className="section">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_.52fr]">
          <div>
            <p className="kicker">The objective</p>
            <h2 className="headline">Move from uncertainty to an evidence-led plan.</h2>
            <p className="lede">{item.description}</p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              <DetailBlock
                title={isService ? 'Who it is for' : 'When this matters'}
                items={
                  isService
                    ? [
                        'Teams planning change or assurance work',
                        'Leaders who need a clear risk view',
                        'Owners who need prioritised action',
                      ]
                    : [
                        'Risk has changed or become unclear',
                        'A critical decision needs defensible evidence',
                        'Existing controls need validation',
                      ]
                }
              />
              <DetailBlock title="Expected outcomes" items={item.outcomes} />
              <DetailBlock
                title={isService ? 'Typical deliverables' : 'Areas considered'}
                items={
                  isService
                    ? [
                        'Scope and rules of engagement',
                        'Evidence-backed findings',
                        'Prioritised remediation roadmap',
                        'Stakeholder briefing',
                      ]
                    : [
                        'People and decision pathways',
                        'Technology and control effectiveness',
                        'Critical dependencies',
                        'Recovery and assurance needs',
                      ]
                }
              />
              <DetailBlock
                title="Engagement approach"
                items={[
                  'Scope and success criteria',
                  'Evidence gathering and testing',
                  'Context-led analysis',
                  'Reporting and action planning',
                ]}
              />
            </div>
          </div>
          <aside>
            <div className="sticky top-28 rounded-2xl border border-cyan-300/20 bg-cyan-300/[.055] p-7">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">
                A safe first step
              </p>
              <h2 className="mt-4 text-2xl font-semibold">Shape the scope with an expert.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Tell us the decision you need to make. Do not include passwords, credentials,
                findings, or sensitive technical evidence.
              </p>
              <Button className="mt-7 w-full" asChild>
                <Link to={routes.assessment}>Request an assessment</Link>
              </Button>
              <Button className="mt-2 w-full" variant="ghost" asChild>
                <Link to={routes.contact}>Ask a question</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
      <Faq item={item} />
    </>
  );
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((value) => (
          <li key={value} className="flex gap-3 text-sm leading-6 text-slate-400">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Faq({ item }: { item: CatalogItem }) {
  const questions = [
    [
      'How is scope agreed?',
      'Scope is confirmed before work begins, including objectives, in-scope systems, constraints, access, communication, and stop conditions.',
    ],
    [
      'Will findings be prioritised?',
      'Yes. Priorities should consider evidence, technical severity, business context, exploitability, and compensating controls.',
    ],
    [
      'Can you guarantee a particular outcome?',
      `No. ${item.name} reduces uncertainty and supports risk decisions, but no assessment or control can guarantee that incidents will not occur.`,
    ],
  ];
  return (
    <section className="section border-t border-white/10 bg-white/[.018]">
      <div className="shell max-w-4xl">
        <p className="kicker">Frequently asked questions</p>
        <h2 className="headline">What to expect.</h2>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {questions.map(([question, answer]) => (
            <details className="group py-5" key={question}>
              <summary className="cursor-pointer list-none pr-6 font-semibold text-white marker:hidden">
                {question}
                <span className="float-right text-cyan-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
