# Deployment

Build immutable web and API images from the included Dockerfiles. The supplied Compose stack is for local evaluation over HTTP and deliberately runs the API in development mode. It is not a production topology.

In production, place the web and API behind a TLS ingress, use separate non-root workloads, inject secrets through the platform secret manager, and use an authenticated managed MongoDB endpoint. Set `NODE_ENV=production`, `COOKIE_SECURE=true`, an exact HTTPS `WEB_ORIGIN`, and a narrow proxy trust configuration. Run `npm run db:indexes` as a single controlled deployment job before rolling out replicas.

Deploy the API first, verify `/api/health` and `/api/ready`, then deploy the web image. Confirm cookie attributes, CORS, CSP, rate-limit behaviour, authentication rotation, email delivery, log redaction, and organisation isolation in the target environment. Roll back using the previous immutable image; do not roll database state backward without a reviewed data plan.
