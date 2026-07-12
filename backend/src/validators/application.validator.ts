import { z } from 'zod';

export const createApplicationSchema = z.object({
  body: z.object({
    company_name: z.string().min(1, 'Company name is required'),
    job_title: z.string().min(1, 'Job title is required'),
    status: z.enum(['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    source: z.enum(['LinkedIn', 'Indeed', 'Naukri', 'Referral', 'Website']).optional(),
    health_score: z.enum(['HEALTHY', 'AT_RISK', 'STALE', 'SUCCESS']).optional(),
    location: z.string().optional(),
    salary_min: z.number().optional().nullable(),
    salary_max: z.number().optional().nullable(),
    currency: z.string().optional(),
    job_url: z.string().optional(),
    application_notes: z.string().optional(),
    contact_person: z.string().optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    applied_date: z.string().or(z.date()).optional().nullable(),
  }),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    company_name: z.string().optional(),
    job_title: z.string().optional(),
    status: z.enum(['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    source: z.enum(['LinkedIn', 'Indeed', 'Naukri', 'Referral', 'Website']).optional(),
    health_score: z.enum(['HEALTHY', 'AT_RISK', 'STALE', 'SUCCESS']).optional(),
    location: z.string().optional(),
    salary_min: z.number().optional().nullable(),
    salary_max: z.number().optional().nullable(),
    currency: z.string().optional(),
    job_url: z.string().optional(),
    application_notes: z.string().optional(),
    contact_person: z.string().optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    applied_date: z.string().or(z.date()).optional().nullable(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Accepted']),
  }),
});
