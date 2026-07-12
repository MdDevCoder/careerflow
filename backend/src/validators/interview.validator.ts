import { z } from 'zod';

export const createInterviewSchema = z.object({
  body: z.object({
    round_type: z.string().min(1, 'Round type is required'),
    scheduled_date: z.string().or(z.date()),
    interview_mode: z.string().optional(),
    interviewer_name: z.string().optional(),
    interviewer_email: z.string().email().optional().or(z.literal('')),
    status: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateInterviewSchema = z.object({
  body: z.object({
    round_type: z.string().optional(),
    scheduled_date: z.string().or(z.date()).optional(),
    interview_mode: z.string().optional(),
    interviewer_name: z.string().optional(),
    interviewer_email: z.string().email().optional().or(z.literal('')),
    status: z.string().optional(),
    notes: z.string().optional(),
  }),
});
