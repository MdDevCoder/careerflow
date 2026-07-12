import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/careerflow'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET must be defined'),
  FRONTEND_URL: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('FATAL ERROR: Invalid environment variables:');
  _env.error.issues.forEach((issue) => {
    logger.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = _env.data;
