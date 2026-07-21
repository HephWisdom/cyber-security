import { company, routes } from '@platform/shared';
import { CheckCircle2, FileCheck2, LockKeyhole, Scale, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMeta } from '@/hooks/use-meta';

export function AboutPage() {
  useMeta(
    'About',
    'Learn how our cybersecurity work connects evidence, context, and practical action.',
  );
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Security work should leave people clearer, not overwhelmed."
        description="We help organisations make better-informed security decisions through focused assessment, testing, and advisory work."
        cta={{ label: 'Start a conversation', to: routes.contact }}
      />
      <section className="section">
        <div className="shell grid gap-14 lg:grid-cols-2">
          <div>
            <p className="kicker">Our approach</p>
            <h2 className="headline">Evidence, context, then action.</h2>
            <p className="lede">
              We begin with the decision a client needs to make. Technical evidence is interpreted
              in the context of critical services, operating constraints, and existing controls.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                'Be precise',
                'Separate observed evidence, assumptions, and professional judgement.',
              ],
              [
                'Be proportionate',
                'Focus effort on the systems, decisions, and risks that matter.',
              ],
              [
                'Be usable',
                'Write for the people who own the next action—not only security specialists.',
              ],
              [
                'Be honest',
                'State limits, unknowns, and residual risk without exaggerated guarantees.',
              ],
            ].map(([title, copy]) => (
              <Card key={title}>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <PlaceholderNotice />
    </>
  );
}

export function TrustPage() {
  useMeta(
    'Security & Trust Centre',
    'Review our security practices, disclosure process, privacy approach, and current trust information.',
  );
  const controls = [
    {
      icon: LockKeyhole,
      title: 'Data minimisation',
      copy: 'Public forms ask only for information needed to respond. Sensitive technical detail is discouraged at first contact.',
    },
    {
      icon: ShieldCheck,
      title: 'Access control',
      copy: 'Portal and administration routes enforce server-side roles, scoped organisation access, session rotation, and audit events.',
    },
    {
      icon: FileCheck2,
      title: 'Responsible disclosure',
      copy: 'A dedicated route defines safe reporting expectations. Scope and safe-harbour language require company review before launch.',
    },
    {
      icon: Scale,
      title: 'Honest assurance',
      copy: 'Certifications, service availability, and guarantees are never implied. Verified trust signals can be enabled from central configuration.',
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="Security & trust centre"
        title="Trust should be inspectable."
        description="This centre explains how the platform handles security, privacy, disclosure, and service assurance. Company-specific evidence must be verified before publication."
      />
      <section className="section">
        <div className="shell">
          <div className="grid gap-4 md:grid-cols-2">
            {controls.map(({ icon: Icon, title, copy }) => (
              <Card key={title}>
                <Icon className="h-6 w-6 text-cyan-300" />
                <h2 className="mt-5 text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
              </Card>
            ))}
          </div>
          <div className="mt-14 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Verified company assurances</h2>
            {company.verifiedTrustSignals.length ? (
              <ul className="mt-5 space-y-3">
                {company.verifiedTrustSignals.map((signal) => (
                  <li className="flex gap-3 text-sm text-slate-300" key={signal.label}>
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span>
                      <strong className="text-white">{signal.label}:</strong> {signal.detail}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                No certifications, audits, partnerships, service levels, or external assurances have
                been supplied and verified. This is intentionally empty.
              </p>
            )}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to={routes.disclosure}>Report a vulnerability</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to={routes.privacy}>Read the privacy policy</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function PlaceholderNotice() {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="shell">
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-amber-200">
            Company information required
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Identity and factual claims are intentionally placeholders.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Before launch, update the central company configuration with the verified legal name,
            brand, team information, contact details, operating locations, and any supportable
            credentials. None have been invented for this build.
          </p>
        </div>
      </div>
    </section>
  );
}
