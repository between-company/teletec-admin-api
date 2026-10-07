import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'qa', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z
  .string()
  .min(1, 'DATABASE_URL is required'),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  FRONTEND_URL: z.url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1),
  SESSION_EXPIRES_DAYS: z.coerce.number().int().min(1).max(90),
})

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`)
  }

  return result.data
}