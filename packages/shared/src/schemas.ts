import { z } from 'zod';

const cleanText = (max: number) => z.string().trim().min(1).max(max);
const email = z.string().trim().toLowerCase().email().max(254);
const phone = z.string().trim().max(40).optional().or(z.literal(''));
const honeypot = z.string().max(0).optional();
const consent = z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) });

export const idempotencyKeySchema = z.string().uuid();

export const contactSchema = z.object({
  name: cleanText(120),
  workEmail: email,
  organisation: cleanText(160),
  phone,
  topic: z.enum(['general', 'services', 'partnership', 'privacy', 'other']),
  message: cleanText(4000),
  consent,
  website: honeypot,
  idempotencyKey: idempotencyKeySchema,
});

export const assessmentSchema = z.object({
  name: cleanText(120),
  workEmail: email,
  organisation: cleanText(160),
  phone,
  service: z.enum([
    'security-assessments',
    'penetration-testing',
    'incident-readiness',
    'cloud-security',
    'governance-risk-compliance',
    'not-sure',
  ]),
  organisationSize: z.enum(['1-49', '50-249', '250-999', '1000+', 'prefer-not-to-say']),
  timeframe: z.enum(['urgent', 'within-30-days', 'within-90-days', 'planning']),
  context: cleanText(5000),
  consent,
  website: honeypot,
  idempotencyKey: idempotencyKeySchema,
});

export const incidentSchema = z.object({
  name: cleanText(120),
  workEmail: email,
  organisation: cleanText(160),
  phone: z.string().trim().min(7).max(40),
  incidentType: z.enum([
    'ransomware',
    'account-compromise',
    'data-exposure',
    'service-disruption',
    'unknown',
    'other',
  ]),
  activeIncident: z.boolean(),
  safeToContact: z.enum(['email', 'phone', 'either']),
  summary: cleanText(3000),
  consent,
  website: honeypot,
  idempotencyKey: idempotencyKeySchema,
});

export const vulnerabilitySchema = z.object({
  name: cleanText(120),
  email,
  affectedAsset: cleanText(500),
  vulnerabilityType: cleanText(120),
  summary: cleanText(8000),
  disclosureAgreement: consent,
  website: honeypot,
  idempotencyKey: idempotencyKeySchema,
});

export const newsletterSchema = z.object({
  email,
  consent,
  website: honeypot,
  idempotencyKey: idempotencyKeySchema,
});

export const careerApplicationSchema = z.object({
  name: cleanText(120),
  email,
  roleId: cleanText(80),
  portfolioUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
  coverNote: cleanText(4000),
  consent,
  website: honeypot,
  idempotencyKey: idempotencyKeySchema,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(12).max(200),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(300),
  password: z.string().min(14).max(200),
});

export const supportTicketSchema = z.object({
  title: cleanText(300),
  message: cleanText(10000),
  priority: z.enum(['low', 'normal', 'high']),
  idempotencyKey: idempotencyKeySchema,
});

export type ContactInput = z.infer<typeof contactSchema>;
export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
export type VulnerabilityInput = z.infer<typeof vulnerabilitySchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type CareerApplicationInput = z.infer<typeof careerApplicationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;

export type ApiSuccess<T = unknown> = { ok: true; data: T; requestId?: string };
export type ApiError = {
  ok: false;
  error: { code: string; message: string; fieldErrors?: Record<string, string[]> };
  requestId?: string;
};
