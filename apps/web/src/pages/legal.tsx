import { company } from '@platform/shared';
import { PageHero } from '@/components/page-hero';
import { useMeta } from '@/hooks/use-meta';

type LegalType = 'privacy' | 'terms' | 'cookies' | 'disclosure';
const content = {
  privacy: {
    title: 'Privacy policy',
    desc: 'How this platform collects, uses, retains, and protects personal information.',
    sections: [
      [
        'Status of this notice',
        'This is a production-ready policy structure, not jurisdiction-specific legal advice. The company must confirm its legal entity, lawful bases, retention periods, processors, transfer mechanisms, and supervisory authority before launch.',
      ],
      [
        'Information we collect',
        'We collect the contact and organisational information you submit, request metadata needed for security and abuse prevention, account information for authorised portal users, and administrative audit events. Public forms should not be used to submit credentials, security findings, health information, payment data, or other unnecessary sensitive information.',
      ],
      [
        'How information is used',
        'Information is used to respond to requests, deliver contracted services, administer secure accounts, maintain auditability, prevent abuse, and meet applicable obligations. Analytics must not receive form messages, assessment details, credentials, findings, or report contents.',
      ],
      [
        'Retention and deletion',
        'Sensitive submissions must use a documented retention schedule. The default implementation supports expiry and soft deletion fields, but exact periods must be approved by the company and legal counsel. Requests may be sent to the privacy contact below.',
      ],
      [
        'Your choices',
        'Depending on applicable law, individuals may have rights to access, correct, delete, restrict, or object to certain processing. Identity may need to be verified before fulfilling a request.',
      ],
    ],
  },
  terms: {
    title: 'Terms of service',
    desc: 'Terms governing use of this website and client portal.',
    sections: [
      [
        'Status of these terms',
        'These starter terms require review by qualified counsel before production use. They do not create a service-level agreement, professional engagement, warranty, or emergency response commitment.',
      ],
      [
        'Permitted use',
        'Use the platform lawfully, do not attempt unauthorised access, do not interfere with service operation, and do not upload malicious or unlawful content. Authorised security research must follow the responsible disclosure policy.',
      ],
      [
        'Professional services',
        'Submitting a form does not create an engagement. Scope, authorisation, rules of engagement, deliverables, fees, and liabilities must be agreed in a separate signed agreement before testing or advisory work begins.',
      ],
      [
        'Availability and liability',
        'Website and portal availability is not guaranteed by these starter terms. Applicable limitations, warranties, and governing law must be supplied and reviewed before launch.',
      ],
    ],
  },
  cookies: {
    title: 'Cookie policy',
    desc: 'How necessary and optional browser storage is used.',
    sections: [
      [
        'Necessary storage',
        'Secure session cookies support authentication, session rotation, and cross-site request forgery protection. Preference storage may remember privacy choices. Necessary storage is not used for advertising.',
      ],
      [
        'Analytics',
        'The analytics abstraction remains inactive unless a provider is configured and consent is available where required. Events are limited to navigation and completion signals and must never include sensitive form or portal data.',
      ],
      [
        'Managing choices',
        'You can decline optional analytics. Removing necessary session cookies will sign you out and may prevent protected portal features from working.',
      ],
    ],
  },
  disclosure: {
    title: 'Responsible disclosure policy',
    desc: 'How to report a suspected vulnerability safely and responsibly.',
    sections: [
      [
        'Before testing',
        `Only assets explicitly listed by ${company.legalName} are in scope. Because an approved asset inventory has not been supplied, no asset is currently authorised for testing. Contact ${company.email} for written scope before any activity.`,
      ],
      [
        'Safe research expectations',
        'Avoid accessing, changing, retaining, or sharing other people’s data; denial of service; social engineering; physical testing; automated high-volume scanning; persistence; and activity that may disrupt service. Stop when sensitive data is encountered.',
      ],
      [
        'How to report',
        'Use the vulnerability reporting form with a concise description, affected asset, reproduction steps, impact, and safe contact details. Do not send live credentials, unnecessary personal data, malware, or exploit code through the public form.',
      ],
      [
        'Our response',
        'A service-level commitment and safe-harbour statement cannot be offered until the company approves its programme, authorised scope, contact process, and legal terms. A submission reference confirms receipt, not validation or eligibility for a reward.',
      ],
    ],
  },
} satisfies Record<LegalType, { title: string; desc: string; sections: string[][] }>;

export function LegalPage({ type }: { type: LegalType }) {
  const page = content[type];
  useMeta(page.title, page.desc);
  return (
    <>
      <PageHero compact eyebrow="Legal & policy" title={page.title} description={page.desc} />
      <section className="section pt-14">
        <div className="shell max-w-4xl">
          <div className="mb-9 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-5 text-sm leading-6 text-slate-300">
            <strong className="text-white">Review required:</strong> Company identity, jurisdiction,
            service commitments, retention periods, and legal terms are placeholders until approved
            by the organisation and qualified counsel.
          </div>
          <div className="rich-copy">
            {page.sections.map(([title, body]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </section>
            ))}
          </div>
          <p className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-400">
            Questions:{' '}
            <a
              className="text-cyan-300 underline underline-offset-4"
              href={`mailto:${type === 'privacy' ? company.privacyEmail : company.email}`}
            >
              {type === 'privacy' ? company.privacyEmail : company.email}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
