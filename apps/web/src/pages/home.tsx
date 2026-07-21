import { activeServices, routes } from '@platform/shared';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Blocks,
  Bot,
  Check,
  Cloud,
  Code2,
  FileSearch,
  Fingerprint,
  Gauge,
  Layers3,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SecurityVisual } from '@/components/security-visual';
import { Button } from '@/components/ui/button';
import { resources } from '@/data/content';
import { useMeta } from '@/hooks/use-meta';

const serviceIcons = [FileSearch, Waypoints, ShieldCheck, Cloud, Gauge];

const challenges = [
  {
    icon: Bot,
    title: 'AI-driven attacks',
    copy: 'New tools are expanding the attack surface faster than most security teams can map it.',
  },
  {
    icon: Layers3,
    title: 'Operational overload',
    copy: 'Fragmented tools and scattered evidence make important signals harder to act on.',
  },
  {
    icon: Network,
    title: 'Connected risk',
    copy: 'Cloud, identity, applications, and suppliers now fail across the same trust paths.',
  },
];

const needs = [
  {
    icon: Code2,
    number: '01',
    title: 'Application security',
    copy: 'Find exploitable weaknesses and strengthen the delivery practices behind every release.',
    to: routes.solution('application-security'),
  },
  {
    icon: Fingerprint,
    number: '02',
    title: 'Identity protection',
    copy: 'Reduce standing privilege and secure the access paths that lead to critical systems.',
    to: routes.solution('identity-risk'),
  },
  {
    icon: Cloud,
    number: '03',
    title: 'Cloud resilience',
    copy: 'Connect architecture, configuration, and ownership into one practical risk view.',
    to: routes.service('cloud-security'),
  },
];

const metrics = [
  ['75%', 'faster prioritisation of security and performance incidents'],
  ['48%', 'less noise in the remediation backlog'],
  ['54%', 'clearer ownership across critical controls'],
];

const clientNames = ['Northstar', 'Aperture', 'Vertex', 'Bluefin', 'Cirrus', 'Monument'];

export function HomePage() {
  useMeta(
    'Cybersecurity services',
    'Evidence-led cybersecurity services that help organisations understand exposure, reduce risk, and respond with confidence.',
  );

  return (
    <div className="bg-white text-[#0b1f38]">
      <section className="relative overflow-hidden bg-white pb-14 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-16">
        <div className="hero-halo absolute -right-44 top-10 h-[34rem] w-[34rem] rounded-full" />
        <div className="shell relative grid items-center gap-14 lg:min-h-[560px] lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-10"
          >
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-[#2f5274]">
              <span className="h-px w-9 bg-[#0b63f6]" />
              Security decisions grounded in evidence
            </p>
            <h1 className="max-w-[730px] text-[2.75rem] font-semibold leading-[1.03] tracking-[-.055em] text-[#0b1f38] sm:text-[4rem] lg:text-[4.65rem]">
              Make security risk easier to see. <span className="accent-text">And act on.</span>
            </h1>
            <p className="mt-7 max-w-[650px] text-lg leading-8 text-[#334e68] sm:text-xl">
              Unify assessment, testing, and expert guidance into one clear view of what is exposed,
              what matters now, and what your team should do next.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={routes.assessment}>
                  Request a security assessment <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to={routes.services}>Explore our services</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#486581]">
              {['Clear scope', 'Reproducible evidence', 'Practical priorities'].map((item) => (
                <span className="flex items-center gap-2" key={item}>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#eaf4ff] text-[#0b63f6]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.65 }}
            className="relative z-0"
          >
            <SecurityVisual />
          </motion.div>
        </div>
      </section>

      <section className="bg-white pb-20 lg:pb-28">
        <div className="shell">
          <Link
            to={routes.service('penetration-testing')}
            className="announcement-card group grid min-h-32 items-center gap-5 border-b-[10px] border-transparent px-6 py-6 sm:grid-cols-[110px_1fr_auto] sm:px-9"
          >
            <div className="relative hidden h-20 w-24 place-items-center overflow-hidden sm:grid">
              <span className="absolute h-16 w-16 rounded-full border border-[#60a5fa]" />
              <span className="absolute h-12 w-px bg-[#60a5fa]" />
              <span className="absolute h-px w-16 bg-[#60a5fa]" />
              <Radar className="relative h-8 w-8 text-[#0b63f6]" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#102a43] sm:text-lg">
                2026 attack-surface review is now available
              </p>
              <p className="mt-1 text-sm text-[#486581] sm:text-base">
                Find and prioritise the paths an attacker can actually use.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 font-semibold text-[#0b63f6]">
              Learn more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      <section id="how-it-works" className="overflow-hidden bg-[#f6faff] py-20 sm:py-24 lg:py-32">
        <div className="shell grid items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
          <div className="radar-visual relative mx-auto w-full max-w-[520px]" aria-hidden="true">
            <div className="threat-radar relative aspect-square overflow-hidden rounded-full border border-[#c9e1f7] bg-white shadow-[0_30px_100px_rgba(11,99,246,.12)]">
              <div className="radar-ring absolute inset-[12%] rounded-full border border-[#a9d2f5]" />
              <div className="radar-ring absolute inset-[27%] rounded-full border border-[#7dbcf2]" />
              <div className="absolute inset-x-[8%] top-1/2 h-px bg-[#9bcaf2]" />
              <div className="absolute inset-y-[8%] left-1/2 w-px bg-[#9bcaf2]" />
              <div className="radar-sweep absolute inset-[6%] rounded-full">
                <span className="radar-sweep-layer radar-sweep-blue" />
                <span className="radar-sweep-layer radar-sweep-alert" />
              </div>
              <div className="radar-core absolute inset-[35%] grid place-items-center rounded-full bg-gradient-to-br from-[#38bdf8] via-[#0b63f6] to-[#4338ca] shadow-[0_18px_55px_rgba(11,99,246,.32)]">
                <ShieldCheck className="h-16 w-16 text-white" />
              </div>
              {[
                'left-[20%] top-[28%]',
                'right-[19%] top-[34%]',
                'bottom-[20%] left-[30%]',
                'bottom-[30%] right-[18%]',
              ].map((position, index) => (
                <span
                  key={position}
                  className={`radar-signal radar-scan-phase-${index} absolute ${position} h-3 w-3 rounded-full border-2 border-white`}
                />
              ))}
            </div>
            <div className="radar-stat absolute -left-4 top-[18%] rounded-xl border border-[#c9e1f7] bg-white px-4 py-3 shadow-lg sm:-left-10">
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#35658e]">
                Signals
              </p>
              <p className="text-lg font-semibold">24,806</p>
            </div>
            <div className="radar-priority absolute -right-2 bottom-[13%] rounded-xl bg-[#071a33] px-4 py-3 text-white shadow-xl sm:-right-8">
              <p className="priority-label text-[10px] font-bold uppercase tracking-[.12em] text-[#7dd3fc]">
                Priority path
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 fill-[#ff5c35] text-[#ff5c35]" /> Critical
              </p>
            </div>
          </div>

          <div>
            <p className="section-label">The problem</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-.045em] text-[#0b1f38] sm:text-5xl">
              More signals. More sprawl. Less certainty.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#486581]">
              Security teams are navigating rapid change, complex estates, and rising pressure with
              tools that rarely tell the whole story.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {challenges.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="border-t border-[#c9dceb] pt-5">
                  <Icon className="h-6 w-6 text-[#0b63f6]" />
                  <h3 className="mt-4 text-base font-semibold text-[#102a43]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#627d98]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="enterprise-panel relative overflow-hidden py-20 text-white sm:py-24 lg:py-28">
        <div className="accent-grid absolute inset-0 opacity-30" />
        <div className="absolute -left-24 -top-40 h-96 w-96 rounded-full bg-[#38bdf8]/30 blur-3xl" />
        <div className="absolute -bottom-52 right-0 h-[34rem] w-[34rem] rounded-full bg-[#4338ca]/35 blur-3xl" />
        <div className="shell relative grid items-center gap-14 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="section-label !text-[#bae6fd]">The solution</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-.045em] text-white sm:text-5xl lg:text-6xl">
              One clear line from evidence to action.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
              Bring technical evidence, business context, and expert judgement together. Replace
              tool noise with a security programme people can understand and own.
            </p>
            <Button className="mt-9" asChild size="lg" variant="inverse">
              <Link to={routes.assessment}>
                Build your security roadmap <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative mx-auto w-full max-w-[580px] rounded-[2rem] border border-white/30 bg-white/10 p-5 shadow-[0_35px_100px_rgba(4,28,66,.28)] backdrop-blur-md sm:p-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {activeServices.slice(0, 5).map((service, index) => {
                const Icon = serviceIcons[index] ?? ShieldCheck;
                return (
                  <Link
                    key={service.slug}
                    to={routes.service(service.slug)}
                    className={`group rounded-2xl border border-white/30 bg-white/90 p-5 text-[#102a43] shadow-lg transition hover:-translate-y-1 hover:bg-white ${index === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf4ff] text-[#0b63f6]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-8 text-sm font-semibold leading-5 text-[#102a43]">
                      {service.name}
                    </h3>
                    <ArrowRight className="mt-3 h-4 w-4 text-[#0b63f6] transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
              <div className="grid place-items-center rounded-2xl border border-dashed border-white/50 bg-[#0b2f66]/35 p-5 text-center">
                <Sparkles className="h-7 w-7 text-[#7dd3fc]" />
                <p className="mt-3 text-sm font-semibold text-white">One connected risk view</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="bg-white py-20 sm:py-24 lg:py-32">
        <div className="shell">
          <div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="section-label">Meet key security needs</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] text-[#0b1f38] sm:text-5xl">
                Protection built around your environment.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#486581] lg:justify-self-end">
              Start with the risk you need to change. Each engagement connects focused technical
              work to a useful operational outcome.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden border border-[#dbe7f1] bg-[#dbe7f1] lg:grid-cols-3">
            {needs.map(({ icon: Icon, number, title, copy, to }) => (
              <Link
                key={title}
                to={to}
                className="feature-card group relative min-h-[360px] overflow-hidden bg-white p-7 sm:p-9"
              >
                <span className="text-xs font-bold tracking-[.16em] text-[#557a9b]">{number}</span>
                <div className="mt-10 grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf4ff] text-[#0b63f6] transition group-hover:bg-[#0b63f6] group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-12 text-2xl font-semibold tracking-[-.03em] text-[#102a43]">
                  {title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[#627d98]">{copy}</p>
                <span className="absolute bottom-8 left-9 inline-flex items-center gap-2 text-sm font-semibold text-[#0b63f6]">
                  Explore solution
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07182e] py-20 text-white sm:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1.95fr] lg:items-end">
            <div>
              <p className="section-label !text-[#7dd3fc]">Security that moves the work forward</p>
              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-4xl">
                Speedier decisions. Lower noise. Clearer ownership.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-sm bg-white/15 sm:grid-cols-3">
              {metrics.map(([value, label]) => (
                <div className="bg-[#07182e] px-6 py-7 sm:px-8" key={value}>
                  <p className="accent-text text-5xl font-semibold tracking-[-.05em]">{value}</p>
                  <p className="mt-4 text-sm leading-6 text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 border-t border-white/15 pt-9">
            <p className="text-center text-sm font-medium text-white/60">
              Trusted by teams building more resilient organisations
            </p>
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
              {clientNames.map((name) => (
                <div
                  key={name}
                  className="flex min-h-24 items-center justify-center bg-[#07182e] px-5 text-center text-lg font-semibold tracking-[-.03em] text-white/75"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="resources" className="bg-[#f6faff] py-20 sm:py-24 lg:py-28">
        <div className="shell">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label">Practical insights</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] text-[#0b1f38] sm:text-5xl">
                Build security that holds up.
              </h2>
            </div>
            <Link
              to={routes.resources}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b63f6]"
            >
              View all insights <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <Link
                key={resource.slug}
                to={routes.resource(resource.slug)}
                className="resource-card group overflow-hidden border border-[#dbe7f1] bg-white"
              >
                <div
                  className={`relative h-44 overflow-hidden ${
                    ['bg-[#0b63f6]', 'bg-[#38bdf8]', 'bg-[#4338ca]'][index]
                  }`}
                >
                  <div className="accent-grid absolute inset-0 opacity-40" />
                  <div className="absolute -bottom-16 -right-6 h-48 w-48 rounded-full border-[28px] border-white/20" />
                  <div className="absolute left-7 top-7 grid h-12 w-12 place-items-center rounded-xl border border-white/35 bg-white/15 text-white backdrop-blur">
                    {[Blocks, Radar, ShieldCheck][index] &&
                      (() => {
                        const Icon = [Blocks, Radar, ShieldCheck][index] ?? Blocks;
                        return <Icon className="h-6 w-6" />;
                      })()}
                  </div>
                  <span className="absolute bottom-6 left-7 text-xs font-bold uppercase tracking-[.15em] text-white">
                    {resource.type} · {resource.readTime}
                  </span>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-semibold leading-snug tracking-[-.025em] text-[#102a43]">
                    {resource.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#627d98]">{resource.summary}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0b63f6]">
                    Read insight
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="shell">
          <div className="cta-panel relative overflow-hidden px-6 py-14 text-white sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:px-16">
            <div className="accent-grid absolute inset-0 opacity-35" />
            <div className="absolute -right-24 -top-40 h-96 w-96 rounded-full bg-[#38bdf8]/35 blur-3xl" />
            <div className="relative max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#bae6fd]">
                Ready to make risk actionable?
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-5xl">
                Turn an unclear security concern into a focused next step.
              </h2>
            </div>
            <div className="relative mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:ml-10 lg:mt-0 lg:flex-col">
              <Button asChild size="lg" variant="inverse">
                <Link to={routes.assessment}>Request an assessment</Link>
              </Button>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-transparent px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#0755d1]"
                to={routes.contact}
              >
                Talk to an expert <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
