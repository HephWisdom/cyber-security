export const company = {
  // PLACEHOLDER: Verify the remaining contact and company details before production launch.
  name: 'ShieldStack',
  shortName: 'SS',
  legalName: 'ShieldStack',
  tagline: 'Security decisions grounded in evidence.',
  description:
    'Independent cybersecurity services that help organisations understand exposure, reduce risk, and respond with confidence.',
  email: 'security@example.com',
  privacyEmail: 'privacy@example.com',
  careersEmail: 'careers@example.com',
  phone: '+000 000 000 000',
  incidentPhone: '',
  address: 'Office address to be supplied',
  country: 'Country to be supplied',
  websiteUrl: 'https://example.com',
  social: { linkedin: '', x: '' },
  availability: {
    incidentResponse24x7: false,
  },
  verifiedTrustSignals: [] as Array<{ label: string; detail: string }>,
} as const;

export type CompanyConfig = typeof company;
