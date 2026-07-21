import { model, Schema } from 'mongoose';

const objectId = Schema.Types.ObjectId;
const timestamps = { timestamps: true } as const;
const softDelete = { deletedAt: { type: Date, default: null, index: true } };
const retention = {
  retentionExpiresAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },
};

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    roleKeys: { type: [String], required: true, default: ['client_user'], index: true },
    organisationId: { type: objectId, ref: 'Organisation', index: true },
    status: {
      type: String,
      enum: ['invited', 'active', 'locked', 'disabled'],
      default: 'active',
      index: true,
    },
    failedLoginCount: { type: Number, default: 0, min: 0, select: false },
    lockedUntil: { type: Date, default: null, select: false },
    lastLoginAt: Date,
    passwordChangedAt: Date,
    resetTokenHash: { type: String, select: false },
    resetExpiresAt: { type: Date, select: false },
    mfa: { enabled: { type: Boolean, default: false }, methods: { type: [String], default: [] } },
    ...softDelete,
  },
  timestamps,
);
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

const roleSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    permissions: { type: [String], required: true, default: [] },
    system: { type: Boolean, default: false },
  },
  timestamps,
);

const organisationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    status: {
      type: String,
      enum: ['prospect', 'active', 'inactive'],
      default: 'active',
      index: true,
    },
    industry: { type: String, maxlength: 100 },
    primaryContactId: { type: objectId, ref: 'User' },
    dataRegion: { type: String, maxlength: 80 },
    ...softDelete,
  },
  timestamps,
);
organisationSchema.index({ name: 1, deletedAt: 1 });

const membershipSchema = new Schema(
  {
    organisationId: { type: objectId, ref: 'Organisation', required: true, index: true },
    userId: { type: objectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['owner', 'member', 'viewer'], default: 'member' },
    status: { type: String, enum: ['invited', 'active', 'revoked'], default: 'active' },
  },
  timestamps,
);
membershipSchema.index({ organisationId: 1, userId: 1 }, { unique: true });

const serviceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, maxlength: 160 },
    summary: { type: String, required: true, maxlength: 1000 },
    content: { type: String, maxlength: 50000 },
    active: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    publishedAt: Date,
    ...softDelete,
  },
  timestamps,
);

const leadSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['contact', 'assessment', 'incident', 'vulnerability', 'career'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'acknowledged', 'qualified', 'closed', 'spam'],
      default: 'new',
      index: true,
    },
    name: { type: String, maxlength: 120 },
    email: { type: String, maxlength: 254 },
    organisation: { type: String, maxlength: 160 },
    sourceId: { type: objectId, index: true },
    assignedTo: { type: objectId, ref: 'User', index: true },
    ...softDelete,
    ...retention,
  },
  timestamps,
);

const formBase = {
  reference: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, required: true, unique: true, select: false },
  name: { type: String, required: true, maxlength: 120 },
  email: { type: String, required: true, maxlength: 254, index: true },
  organisation: { type: String, maxlength: 160 },
  status: {
    type: String,
    enum: ['received', 'reviewing', 'closed', 'spam'],
    default: 'received',
    index: true,
  },
  ipHash: { type: String, required: true, select: false },
  ...softDelete,
  ...retention,
};

const contactSchema = new Schema(
  {
    ...formBase,
    phone: { type: String, maxlength: 40 },
    topic: { type: String, required: true },
    message: { type: String, required: true, maxlength: 4000 },
  },
  timestamps,
);
const assessmentSchema = new Schema(
  {
    ...formBase,
    phone: { type: String, maxlength: 40 },
    service: { type: String, required: true, index: true },
    organisationSize: String,
    timeframe: String,
    context: { type: String, required: true, maxlength: 5000 },
  },
  timestamps,
);
const incidentSchema = new Schema(
  {
    ...formBase,
    phone: { type: String, required: true, maxlength: 40 },
    incidentType: { type: String, required: true },
    activeIncident: Boolean,
    safeToContact: String,
    summary: { type: String, required: true, maxlength: 3000 },
  },
  timestamps,
);
const vulnerabilityReportSchema = new Schema(
  {
    ...formBase,
    organisation: { type: String, default: 'Independent researcher' },
    affectedAsset: { type: String, required: true, maxlength: 500 },
    vulnerabilityType: { type: String, required: true, maxlength: 120 },
    summary: { type: String, required: true, maxlength: 8000 },
  },
  timestamps,
);

const engagementSchema = new Schema(
  {
    organisationId: { type: objectId, ref: 'Organisation', required: true, index: true },
    serviceId: { type: objectId, ref: 'Service' },
    title: { type: String, required: true, maxlength: 200 },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['planned', 'active', 'paused', 'complete', 'cancelled'],
      default: 'planned',
      index: true,
    },
    ownerId: { type: objectId, ref: 'User', required: true },
    startDate: Date,
    targetDate: Date,
    completedAt: Date,
    summary: { type: String, maxlength: 2000 },
    sampleData: { type: Boolean, default: false },
    ...softDelete,
  },
  timestamps,
);

const findingSchema = new Schema(
  {
    organisationId: { type: objectId, ref: 'Organisation', required: true, index: true },
    engagementId: { type: objectId, ref: 'Engagement', required: true, index: true },
    reference: { type: String, required: true },
    title: { type: String, required: true, maxlength: 300 },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'informational'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'in_progress', 'resolved', 'verified'],
      default: 'open',
      index: true,
    },
    description: { type: String, maxlength: 10000 },
    remediation: { type: String, maxlength: 10000 },
    ownerId: { type: objectId, ref: 'User' },
    dueAt: Date,
    verifiedAt: Date,
    sampleData: { type: Boolean, default: false },
    ...softDelete,
  },
  timestamps,
);
findingSchema.index({ organisationId: 1, reference: 1 }, { unique: true });

const reportSchema = new Schema(
  {
    organisationId: { type: objectId, ref: 'Organisation', required: true, index: true },
    engagementId: { type: objectId, ref: 'Engagement', required: true, index: true },
    title: { type: String, required: true, maxlength: 300 },
    version: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'withdrawn'],
      default: 'draft',
      index: true,
    },
    storageKey: { type: String, required: true, select: false },
    sha256: { type: String, required: true },
    mimeType: { type: String, enum: ['application/pdf'], required: true },
    size: { type: Number, max: 25_000_000 },
    publishedAt: Date,
    sampleData: { type: Boolean, default: false },
    ...softDelete,
  },
  timestamps,
);
reportSchema.index({ engagementId: 1, version: 1 }, { unique: true });

const ticketSchema = new Schema(
  {
    organisationId: { type: objectId, ref: 'Organisation', required: true, index: true },
    reference: { type: String, required: true, unique: true },
    idempotencyKey: { type: String, required: true, unique: true, select: false },
    title: { type: String, required: true, maxlength: 300 },
    status: {
      type: String,
      enum: ['open', 'waiting_client', 'waiting_team', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    createdBy: { type: objectId, ref: 'User', required: true },
    assignedTo: { type: objectId, ref: 'User' },
    sampleData: { type: Boolean, default: false },
    ...softDelete,
  },
  timestamps,
);
const ticketMessageSchema = new Schema(
  {
    ticketId: { type: objectId, ref: 'SupportTicket', required: true, index: true },
    organisationId: { type: objectId, ref: 'Organisation', required: true, index: true },
    authorId: { type: objectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 10000 },
    internal: { type: Boolean, default: false },
    ...softDelete,
  },
  timestamps,
);

const resourceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    categoryId: { type: objectId, ref: 'ResourceCategory', index: true },
    title: { type: String, required: true, maxlength: 300 },
    summary: { type: String, required: true, maxlength: 1000 },
    body: { type: String, required: true, maxlength: 100000 },
    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    authorId: { type: objectId, ref: 'User', required: true },
    publishedAt: Date,
    ...softDelete,
  },
  timestamps,
);
const resourceCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, maxlength: 500 },
    order: { type: Number, default: 0 },
    ...softDelete,
  },
  timestamps,
);
const caseStudySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    clientDisplayName: { type: String },
    permissionVerifiedAt: Date,
    problem: { type: String, required: true },
    engagement: { type: String, required: true },
    outcome: { type: String, required: true },
    metrics: [{ label: String, value: String, evidenceReference: String }],
    status: { type: String, enum: ['draft', 'review', 'published', 'archived'], default: 'draft' },
    publishedAt: Date,
    ...softDelete,
  },
  timestamps,
);

const careerSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    workMode: { type: String, enum: ['onsite', 'hybrid', 'remote'], required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['draft', 'open', 'closed'], default: 'draft', index: true },
    closesAt: Date,
    publishedAt: Date,
    ...softDelete,
  },
  timestamps,
);
const applicationSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    careerOpeningId: { type: objectId, ref: 'CareerOpening', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    portfolioUrl: String,
    coverNote: { type: String, required: true },
    status: {
      type: String,
      enum: ['received', 'review', 'interview', 'declined', 'hired'],
      default: 'received',
      index: true,
    },
    idempotencyKey: { type: String, required: true, unique: true, select: false },
    ...softDelete,
    ...retention,
  },
  timestamps,
);
const newsletterSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true },
    idempotencyKey: { type: String, required: true, unique: true, select: false },
    status: {
      type: String,
      enum: ['pending', 'active', 'unsubscribed', 'suppressed'],
      default: 'pending',
      index: true,
    },
    consentAt: { type: Date, required: true },
    confirmationTokenHash: { type: String, select: false },
    confirmedAt: Date,
    unsubscribedAt: Date,
    ...softDelete,
  },
  timestamps,
);
newsletterSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
const notificationSchema = new Schema(
  {
    userId: { type: objectId, ref: 'User', required: true, index: true },
    organisationId: { type: objectId, ref: 'Organisation', index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true, maxlength: 2000 },
    readAt: Date,
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  timestamps,
);

const auditSchema = new Schema(
  {
    actorId: { type: objectId, ref: 'User', index: true },
    organisationId: { type: objectId, ref: 'Organisation', index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: String,
    outcome: { type: String, enum: ['success', 'failure', 'denied'], required: true },
    requestId: String,
    ipHash: { type: String, select: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
    previousHash: { type: String, required: true },
    entryHash: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { versionKey: false },
);
auditSchema.index({ createdAt: -1 });
const sessionSchema = new Schema(
  {
    userId: { type: objectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    accessTokenHash: { type: String, required: true, unique: true, select: false },
    csrfHash: { type: String, required: true, select: false },
    userAgent: { type: String, maxlength: 500 },
    userAgentHash: { type: String, required: true },
    ipHash: { type: String, required: true, select: false },
    lastSeenAt: { type: Date, default: Date.now },
    accessExpiresAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    revokedAt: Date,
    rotatedFrom: { type: objectId, ref: 'RefreshSession' },
  },
  timestamps,
);
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    public: { type: Boolean, default: false },
    updatedBy: { type: objectId, ref: 'User', required: true },
    version: { type: Number, default: 1 },
  },
  timestamps,
);

export const User = model('User', userSchema);
export const Role = model('Role', roleSchema);
export const Organisation = model('Organisation', organisationSchema);
export const ClientMembership = model('ClientMembership', membershipSchema);
export const Service = model('Service', serviceSchema);
export const Lead = model('Lead', leadSchema);
export const ContactSubmission = model('ContactSubmission', contactSchema);
export const AssessmentRequest = model('AssessmentRequest', assessmentSchema);
export const IncidentRequest = model('IncidentRequest', incidentSchema);
export const VulnerabilityReport = model('VulnerabilityReport', vulnerabilityReportSchema);
export const Engagement = model('Engagement', engagementSchema);
export const Finding = model('Finding', findingSchema);
export const Report = model('Report', reportSchema);
export const SupportTicket = model('SupportTicket', ticketSchema);
export const TicketMessage = model('TicketMessage', ticketMessageSchema);
export const Resource = model('Resource', resourceSchema);
export const ResourceCategory = model('ResourceCategory', resourceCategorySchema);
export const CaseStudy = model('CaseStudy', caseStudySchema);
export const CareerOpening = model('CareerOpening', careerSchema);
export const Application = model('Application', applicationSchema);
export const NewsletterSubscriber = model('NewsletterSubscriber', newsletterSchema);
export const Notification = model('Notification', notificationSchema);
export const AuditLog = model('AuditLog', auditSchema);
export const RefreshSession = model('RefreshSession', sessionSchema);
export const SiteSetting = model('SiteSetting', settingSchema);
