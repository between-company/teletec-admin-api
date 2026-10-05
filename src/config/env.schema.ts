import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'qa', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z
  .string()
  .min(1, 'DATABASE_URL is required')
})

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`)
  }

  return result.data
}