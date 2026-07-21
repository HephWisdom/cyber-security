# Security policy

Do not report a vulnerability through a public issue tracker. Before production launch, replace `security@example.com`, publish an approved asset scope, and have the responsible disclosure policy reviewed by the owning organisation.

The application includes a `/report-vulnerability` intake route. It must not be treated as authorisation to test an asset. Do not include credentials, malware, or unnecessary personal information in an initial report.

For maintainers: rotate exposed secrets immediately, preserve relevant audit evidence, triage privately, and coordinate remediation and disclosure with authorised stakeholders. See `docs/production-security-checklist.md`.
