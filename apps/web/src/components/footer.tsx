import { company, routes } from '@platform/shared';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandMark } from './brand-mark';
import { NewsletterForm } from './forms/newsletter';

const groups: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: 'What we do',
    links: [
      ['Services', routes.services],
      ['Solutions', routes.solutions],
      ['Industries', routes.industries],
      ['Request assessment', routes.assessment],
      ['Incident response', routes.disclosure],
    ],
  },
  {
    title: 'Explore',
    links: [
      ['Insights', routes.resources],
      ['Case studies', routes.caseStudies],
      ['Trust centre', routes.trust],
      ['About', routes.about],
      ['Careers', routes.careers],
    ],
  },
  {
    title: 'Legal & security',
    links: [
      ['Report a vulnerability', routes.disclosure],
      ['Responsible disclosure', routes.responsibleDisclosure],
      ['Privacy policy', routes.privacy],
      ['Cookie policy', routes.cookies],
      ['Terms of service', routes.terms],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t-[6px] border-[#0b63f6] bg-[#07182e] text-white">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-14 border-b border-white/15 pb-14 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <BrandMark inverse />
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/60">{company.description}</p>
            <a
              href={`mailto:${company.email}`}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white transition hover:text-[#7dd3fc]"
            >
              <Mail className="h-4 w-4 text-[#7dd3fc]" />
              {company.email}
            </a>
            <NewsletterForm />
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-bold uppercase tracking-[.15em] text-[#7dd3fc]">
                  {group.title}
                </h2>
                <ul className="mt-5 space-y-1">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        className="inline-flex min-h-10 items-center text-sm text-white/60 transition hover:translate-x-0.5 hover:text-white"
                        to={href}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}. Company details are placeholders
            pending owner verification.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#7dd3fc]" /> Evidence-led security
            </span>
            <Link
              className="inline-flex items-center gap-2 font-semibold text-white/75 transition hover:text-white"
              to={routes.assessment}
            >
              Plan an assessment <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
