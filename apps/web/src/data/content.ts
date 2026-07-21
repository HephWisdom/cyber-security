export type ResourceItem = {
  slug: string;
  type: 'Guide' | 'Briefing' | 'Checklist';
  title: string;
  summary: string;
  readTime: string;
  publishedAt: string;
  status: 'draft' | 'published';
  body: string[];
};

// PLACEHOLDER EDITORIAL CONTENT: replace or approve before production publication.
export const resources: ResourceItem[] = [
  {
    slug: 'prepare-for-a-security-assessment',
    type: 'Guide',
    title: 'How to prepare for a useful security assessment',
    summary: 'Five decisions that help an assessment produce a focused, actionable result.',
    readTime: '6 min read',
    publishedAt: '2026-06-18',
    status: 'published',
    body: [
      'A useful assessment starts with a decision, not a checklist. Be clear about what leaders need to understand or change when the work is complete.',
      'Identify the systems, services, and data that matter to the decision. This keeps scope connected to business impact and avoids spending time on low-value detail.',
      'Assign an internal owner who can coordinate evidence and access. Agree safe testing windows, communication paths, and stop conditions before technical activity begins.',
      'Ask for findings to be prioritised using both technical severity and organisational context. A technically serious issue may be less urgent when strong compensating controls exist—and the reverse can also be true.',
    ],
  },
  {
    slug: 'questions-for-incident-tabletop',
    type: 'Checklist',
    title: 'Questions every incident tabletop should answer',
    summary:
      'A concise checklist for testing decisions, escalation, evidence, and recovery dependencies.',
    readTime: '4 min read',
    publishedAt: '2026-05-22',
    status: 'published',
    body: [
      'A tabletop is valuable when it exposes unclear decisions before an incident. The goal is not to perform a perfect simulation; it is to learn where the response depends on assumptions.',
      'Test who can declare an incident, isolate critical systems, engage external support, notify affected parties, and approve recovery trade-offs. Record decisions that need a named owner or clearer authority.',
      'Include practical evidence questions: which logs will exist, how long they are retained, who can access them, and whether responders can trust the time and identity data they contain.',
      'End with a short, owned action list. Repeat the exercise after material system, supplier, or leadership changes.',
    ],
  },
  {
    slug: 'identity-review-priorities',
    type: 'Briefing',
    title: 'Where to focus an identity security review',
    summary: 'Start with high-impact access paths, lifecycle gaps, and recovery mechanisms.',
    readTime: '5 min read',
    publishedAt: '2026-04-09',
    status: 'published',
    body: [
      'Identity reviews should begin with access paths that can change security controls, sensitive data, or business-critical services.',
      'Look beyond interactive user accounts. Service accounts, automation tokens, recovery channels, dormant accounts, and supplier access can create durable paths around otherwise strong controls.',
      'Review the full lifecycle: approval, provisioning, changes, periodic review, emergency access, monitoring, and removal. Sample evidence instead of relying only on written policy.',
      'Prioritise improvements that reduce standing privilege, strengthen recovery, and make abnormal access easier to investigate.',
    ],
  },
];
