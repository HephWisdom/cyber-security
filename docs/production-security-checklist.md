# Production security checklist

- Replace every value in `packages/shared/src/company.ts` and obtain legal approval for policies.
- Set strong, unique runtime secrets in a secret manager. Keep `.env` out of images and source control.
- Use TLS at the ingress, set `COOKIE_SECURE=true`, configure the exact `WEB_ORIGIN`, and verify proxy trust depth.
- Configure private MongoDB with authentication, TLS, encrypted storage, network restrictions, point-in-time backups, and restore drills.
- Run dependency review, secret scanning, SAST, container scanning, and a scoped security review in CI.
- Configure production email with SPF, DKIM, DMARC, delivery monitoring, suppression handling, and newsletter double opt-in.
- Approve retention periods and run deletion workflows for leads, incidents, vulnerability reports, and applications.
- Forward structured logs to access-controlled storage; validate redaction and retention. Alert on authentication failures and administrative events.
- Review roles, seed accounts, CORS, CSP, rate-limit storage, and sessions. Use Redis-backed limits with multiple API replicas.
- Connect private object storage and malware scanning before enabling document uploads or downloads.
- Verify accessibility, responsive layouts, links, legal content, sitemap host, incident language, and disclosure scope.
- Exercise restoration, incident response, credential rotation, session revocation, rollback, and key rotation.
