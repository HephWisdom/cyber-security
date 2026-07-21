# Architecture

The repository is an npm-workspace monorepo:

- `apps/web`: React 19, Vite, TypeScript, React Router, Tailwind, shadcn-style primitives, Radix, TanStack Query, React Hook Form, Zod, Framer Motion, Lucide, Recharts, and Sonner.
- `apps/api`: Express, TypeScript, Mongoose, Zod, Argon2id, Pino, Helmet, rate limiting, cookie sessions, transactional email abstraction, and role/organisation authorization.
- `packages/shared`: central company facts, active catalog configuration, route helpers, DTOs, and validation schemas.

Public routes are lazy loaded. Protected views query the API with cookies and never rely on client-side roles for enforcement. Portal records are queried with `organisationId` in the database predicate. Administration uses role gates and confirmation headers for high-impact mutations.

Authentication uses a 30-minute opaque access cookie and a longer opaque refresh cookie. Only SHA-256 token digests are stored. Refresh rotates the server session record. CSRF tokens are bound to the session, mirrored to a readable SameSite cookie, and required in a custom header for authenticated mutations. Passwords use Argon2id with 64 MiB memory, three iterations, and one lane.

MongoDB schemas live in `apps/api/src/models`. Sensitive intake collections support a TTL retention date; business records use explicit soft deletion where recovery and auditability matter. `npm run db:indexes` is the repeatable index synchronization step. Run it as a controlled deployment job, not from every application replica.

Transactional email uses a `console` development provider or SMTP adapter. Replace or extend `EmailProvider` for a managed provider. File uploads and report object delivery remain disabled until private object storage, malware scanning, MIME inspection, size controls, signed short-lived downloads, and retention policies are configured.
