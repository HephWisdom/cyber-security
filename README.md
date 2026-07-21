# Cybersecurity company platform

A complete full-stack foundation for an evidence-led cybersecurity services company: enterprise public website, multi-step intake, secure client workspace, role-protected administration, MongoDB data model, security controls, tests, and deployment documentation.

All company identity values are intentionally placeholders because the source repository was empty. Replace `packages/shared/src/company.ts` before any public launch. Service availability is controlled in `packages/shared/src/catalog.ts`; inactive services are not advertised.

## Quick start

Requirements: Node.js 22+, npm 10+, and MongoDB 8 (or Docker).

1. Copy `.env.example` to `.env`.
2. Replace `IP_HASH_SECRET` with at least 32 random characters and change both seed passwords.
3. Start MongoDB locally, or run the `mongo` service from Compose.
4. Run `npm install`.
5. Run `npm run db:indexes` once against the intended development database.
6. Run `npm run seed` for clearly labelled fictional portal data and local accounts.
7. Run `npm run dev`.

The web app runs at `http://localhost:5173`; the API runs at `http://localhost:4000`. Self-registration is disabled. Use only the credentials you supplied through `SEED_ADMIN_*` and `SEED_CLIENT_*`.

For a containerised local evaluation, set `IP_HASH_SECRET` and run `docker compose up --build`. Open `http://localhost:8080`. The included Compose topology uses HTTP and development runtime settings; follow [deployment guidance](docs/deployment.md) for production.

## Architecture

- `apps/web` — route-split React/Vite client, public marketing site, accessible forms, client portal, and administration interface.
- `apps/api` — Express API with controller-style routers, security middleware, services, Mongoose models, seeds, and index jobs.
- `packages/shared` — central brand/catalog config, route definitions, shared schemas, API DTOs, and validation.
- `docs/openapi.yaml` — API contract.

See [architecture details](docs/architecture.md), the [production security checklist](docs/production-security-checklist.md), [deployment guidance](docs/deployment.md), and [backup/restore guidance](docs/backup-restore.md).

## Public routes

`/`, `/services`, `/services/:slug`, `/solutions`, `/solutions/:slug`, `/industries`, `/industries/:slug`, `/about`, `/trust`, `/case-studies`, `/insights`, `/insights/:slug`, `/careers`, `/contact`, `/request-assessment`, `/incident-response`, `/report-vulnerability`, four legal/policy routes, and custom 404/500 experiences.

Portal routes cover login, password recovery, overview, engagements, assessments, report metadata, support tickets, notifications, organisation settings, session/device management, and visible audit history. Administration covers leads, organisations, users/roles, engagements, findings/reports, tickets, content, careers, newsletter, settings, and audit logs.

## Database models

User, Role, Organisation, ClientMembership, Service, Lead, ContactSubmission, AssessmentRequest, IncidentRequest, VulnerabilityReport, Engagement, Finding, Report, SupportTicket, TicketMessage, Resource, ResourceCategory, CaseStudy, CareerOpening, Application, NewsletterSubscriber, Notification, AuditLog, RefreshSession, and SiteSetting.

Models include timestamps, ownership/organisation fields, status enums, indexes, unique constraints, soft deletion where appropriate, and TTL-compatible retention dates for sensitive intake. Run `npm run db:indexes` as a controlled single-instance deployment job.

## Security controls

- Argon2id passwords; generic login/reset responses; progressive account lockout.
- Opaque 30-minute access cookies and rotating refresh sessions; only token hashes are stored.
- Secure, HttpOnly, SameSite cookies in production; session-bound CSRF double submission for authenticated mutations.
- Strict origin allowlist, Helmet/CSP headers, request/body limits, authentication/form/API rate limits.
- Zod allowlist validation, Unicode normalisation, recursive NoSQL-key rejection, Mongoose filter sanitisation, and explicit assignments.
- Server-side roles and organisation-scoped queries; report lookup includes `organisationId` to prevent BOLA.
- Confirmation headers and authorisation for publish, deletion, and session revocation.
- Structured Pino logging with secrets and personal/request content redacted.
- Hash-linked, append-style audit records for authentication and administrative changes.
- No public upload execution path. Document upload/download remains disabled pending private object storage and scanning.

Controls reduce risk; they are not a security guarantee. Complete the production checklist and an independent review before launch.

## Environment variables

| Variable                                                   | Purpose                                                |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| `NODE_ENV`, `PORT`                                         | Runtime mode and API port                              |
| `MONGODB_URI`                                              | Authenticated MongoDB connection string in production  |
| `WEB_ORIGIN`, `PUBLIC_URL`                                 | Exact CORS origin and public password-reset base URL   |
| `SESSION_COOKIE_NAME`                                      | Opaque access-cookie name                              |
| `SESSION_TTL_MINUTES`, `SESSION_REFRESH_TTL_DAYS`          | Access and refresh lifetimes                           |
| `COOKIE_SECURE`, `TRUST_PROXY`                             | HTTPS cookie enforcement and proxy trust               |
| `IP_HASH_SECRET`                                           | HMAC secret used to pseudonymise request IPs           |
| `LOG_LEVEL`                                                | Structured log threshold                               |
| `EMAIL_PROVIDER`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL` | Email adapter and sender/notification addresses        |
| `SMTP_*`                                                   | Required only for the SMTP adapter                     |
| `VITE_API_URL`                                             | Public API base path; contains no secret               |
| `SEED_*`                                                   | Local seed accounts only; never production credentials |

Environment parsing fails closed on missing or invalid values. Production refuses insecure cookies.

## Quality commands

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- `npm run format:check`

API tests cover validation, injection rejection, idempotent contact and assessment submission, login cookies, completed password reset and session revocation, authentication throttling, protected admin access, roles, confirmed resource publishing, and organisation-scoped report access. Component tests cover keyboard/mobile navigation and analytics consent. Playwright covers public journeys, mobile navigation, placeholder-link checks, and overflow.

## Remaining launch work

- Supply verified company identity, logo, contact details, locations, team details, service catalog, and approved legal text.
- Approve editorial starter articles; publish only permissioned case studies and real career openings.
- Configure production email, double opt-in, distributed rate-limit storage, monitoring, and alerting.
- Add MFA enrolment and enforcement if required; the current session and user model is MFA-ready but does not present an enrolment flow.
- Define and implement the remaining organisation-specific admin state-transition workflows. The supplied admin screens are role-scoped operational queues; content creation/publishing and application deletion are the initial audited mutations.
- Connect private document storage, malware scanning, MIME/size validation, and expiring signed delivery before file features are enabled.
- Define jurisdiction-specific retention, deletion, data-subject, incident availability, and responsible disclosure commitments.
- Replace the sitemap/canonical placeholder host and run final external accessibility, performance, privacy, and security reviews in the production environment.
