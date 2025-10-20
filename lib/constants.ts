export const CONSTANTS = {
  // World generation
  MAX_WORLDS_PER_USER: 100,
  MAX_PROMPT_LENGTH: 500,

  // Image generation
  IMAGE_GENERATION_TIMEOUT: 60000, // 60 seconds
  DEFAULT_IMAGE_SIZE: "1024x1024" as const,
  PANORAMA_IMAGE_SIZE: "1792x1024" as const, // Wide format for 360° scenes

  // Session
  SESSION_COOKIE_NAME: 'worlds-auth-token',
  USER_ID_COOKIE_NAME: 'worlds-userId',

  // Token expiration
  JWT_EXPIRATION: '7d',

  // Rate limiting
  RATE_LIMIT_REQUESTS: 5, // Lower for image generation
  RATE_LIMIT_WINDOW: '1m',

  // World visibility
  WORLD_VISIBILITY: {
    PUBLIC: 'public',
    UNLISTED: 'unlisted',
    PRIVATE: 'private',
  } as const,
} as const

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  path: '/',
}
