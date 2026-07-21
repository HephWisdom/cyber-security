# MongoDB backup and restore

Use the managed database provider's encrypted point-in-time backups in production. Define recovery point and recovery time objectives with the service owner. Restrict backup and restore roles, log their use, and keep a copy in an approved separate failure domain.

For a local database, create a logical backup with `mongodump --uri "$MONGODB_URI" --archive=<approved-path> --gzip`. Restore into an isolated validation environment first with `mongorestore --uri "$RESTORE_URI" --archive=<approved-path> --gzip --drop`. Never restore over production without a reviewed change plan, a fresh backup, exact target confirmation, and authorised approval.

After restoration, validate collection counts, indexes, authentication, organisation scoping, audit continuity, TTL policies, and a sample of portal workflows. Record the test date and observed recovery time.
