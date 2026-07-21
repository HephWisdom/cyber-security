export type CatalogItem = {
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  description: string;
  outcomes: string[];
  active: boolean;
};

export const services: CatalogItem[] = [
  {
    slug: 'security-assessments',
    name: 'Security Assessments',
    eyebrow: 'Know what matters first',
    summary: 'Build an evidence-led view of exposure and a practical remediation plan.',
    description:
      'A structured review of technology, process, and control effectiveness, scoped to your environment and business priorities.',
    outcomes: [
      'Prioritised risk register',
      'Actionable remediation roadmap',
      'Clear stakeholder briefing',
    ],
    active: true,
  },
  {
    slug: 'penetration-testing',
    name: 'Penetration Testing',
    eyebrow: 'Test before an attacker does',
    summary: 'Validate exploitable risk with carefully scoped, human-led security testing.',
    description:
      'Controlled testing of applications, infrastructure, and cloud environments with agreed rules of engagement and reproducible findings.',
    outcomes: [
      'Validated attack paths',
      'Reproducible findings',
      'Retest-ready remediation guidance',
    ],
    active: true,
  },
  {
    slug: 'incident-readiness',
    name: 'Incident Readiness',
    eyebrow: 'Prepare for decisive response',
    summary: 'Clarify responsibilities, decisions, and evidence needs before an incident.',
    description:
      'Practical planning, tabletop exercises, and response playbooks aligned to your systems and operating model.',
    outcomes: [
      'Tested response playbooks',
      'Clear escalation paths',
      'Improved evidence readiness',
    ],
    active: true,
  },
  {
    slug: 'cloud-security',
    name: 'Cloud Security',
    eyebrow: 'Make cloud risk visible',
    summary: 'Review cloud architecture, identity, configuration, and delivery practices.',
    description:
      'Architecture and configuration reviews that connect technical findings to the services and data your organisation relies on.',
    outcomes: ['Configuration baseline', 'Identity risk review', 'Prioritised cloud roadmap'],
    active: true,
  },
  {
    slug: 'governance-risk-compliance',
    name: 'Governance, Risk & Compliance',
    eyebrow: 'Turn obligations into action',
    summary: 'Translate risk and compliance requirements into workable controls and evidence.',
    description:
      'Advisory support for control design, policy, risk management, and audit preparation without unsupported certification claims.',
    outcomes: ['Control gap analysis', 'Evidence plan', 'Governance roadmap'],
    active: true,
  },
  {
    slug: 'virtual-ciso',
    name: 'Virtual CISO',
    eyebrow: 'Security leadership that fits',
    summary: 'Add experienced security direction without creating a full-time executive role.',
    description:
      'Fractional security leadership focused on priorities, governance, reporting, and capability improvement.',
    outcomes: ['Board-ready reporting', 'Risk-led programme plan', 'Security decision support'],
    active: false,
  },
];

export const solutions: CatalogItem[] = [
  {
    slug: 'ransomware-readiness',
    name: 'Ransomware Readiness',
    eyebrow: 'Reduce disruption risk',
    summary:
      'Test whether people, controls, backups, and decisions can withstand a ransomware event.',
    description:
      'A focused readiness review across prevention, detection, response, recovery, and communications.',
    outcomes: [
      'Recovery dependency map',
      'Scenario-tested decisions',
      'Prioritised resilience actions',
    ],
    active: true,
  },
  {
    slug: 'compliance-readiness',
    name: 'Compliance Readiness',
    eyebrow: 'Prepare defensible evidence',
    summary: 'Understand control gaps and build a realistic path to audit readiness.',
    description:
      'Map obligations to current controls, owners, and evidence without treating compliance as a security guarantee.',
    outcomes: ['Mapped obligations', 'Evidence inventory', 'Remediation plan'],
    active: true,
  },
  {
    slug: 'identity-risk',
    name: 'Identity Risk',
    eyebrow: 'Protect critical access paths',
    summary:
      'Find privilege, lifecycle, and authentication weaknesses before they become attack paths.',
    description:
      'Review how identities are created, used, monitored, and removed across priority environments.',
    outcomes: [
      'Privilege exposure map',
      'Lifecycle control review',
      'Identity hardening priorities',
    ],
    active: true,
  },
  {
    slug: 'application-security',
    name: 'Application Security',
    eyebrow: 'Build safer delivery habits',
    summary:
      'Reduce application risk through architecture, testing, and development workflow improvements.',
    description:
      'Combine targeted testing with practical improvements to design, code review, and release controls.',
    outcomes: [
      'Validated application risks',
      'Secure delivery backlog',
      'Developer-ready guidance',
    ],
    active: true,
  },
];

export const industries: CatalogItem[] = [
  {
    slug: 'financial-services',
    name: 'Financial Services',
    eyebrow: 'Resilience for trusted transactions',
    summary:
      'Prioritise identity, availability, third-party, and data risks in regulated environments.',
    description:
      'Risk-led security support shaped around critical services and applicable obligations.',
    outcomes: [
      'Critical service mapping',
      'Control assurance priorities',
      'Evidence-ready reporting',
    ],
    active: true,
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    eyebrow: 'Protect care continuity',
    summary:
      'Reduce cyber risk while respecting operational, privacy, and availability constraints.',
    description:
      'Security reviews focused on sensitive data, connected environments, and service continuity.',
    outcomes: [
      'Care-impact risk view',
      'Data protection priorities',
      'Resilience improvement plan',
    ],
    active: true,
  },
  {
    slug: 'technology',
    name: 'Technology',
    eyebrow: 'Secure fast-moving systems',
    summary: 'Embed security into cloud, product, identity, and software delivery decisions.',
    description:
      'Practical assurance for teams operating rapidly changing platforms and applications.',
    outcomes: ['Product risk visibility', 'Cloud assurance', 'Delivery control roadmap'],
    active: true,
  },
  {
    slug: 'nonprofits',
    name: 'Nonprofits & NGOs',
    eyebrow: 'Protect mission-critical work',
    summary: 'Focus limited security resources on the information and services that matter most.',
    description:
      'Proportionate risk reduction for distributed teams, sensitive stakeholders, and constrained budgets.',
    outcomes: ['Practical priority plan', 'Identity and data focus', 'Leadership-ready risk view'],
    active: true,
  },
];

export const activeServices = services.filter((item) => item.active);
export const activeSolutions = solutions.filter((item) => item.active);
export const activeIndustries = industries.filter((item) => item.active);
