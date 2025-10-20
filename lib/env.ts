import { z } from 'zod'

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

const envSchema = z.object({
  // OpenAI (for DALL-E image generation)
  OPENAI_API_KEY: z.string().optional(),

  // Replicate (for Stable Diffusion - optional)
  REPLICATE_API_TOKEN: z.string().optional(),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Authentication
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Integration with main Tarotaros platform (optional)
  TAROTAROS_API_URL: z.string().optional(),
  TAROTAROS_SHARED_SECRET: z.string().optional(),
})

function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n')

      if (isBuildTime) {
        console.warn(`⚠️ Environment variable warnings during build:\n${missingVars}`)
        return process.env as z.infer<typeof envSchema>
      }

      throw new Error(`❌ Invalid environment variables:\n${missingVars}`)
    }
    throw error
  }
}

export const env = validateEnv()
