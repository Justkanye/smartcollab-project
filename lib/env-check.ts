// Environment variable validation utility
export interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export function validateEnvironment(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required public environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  } else {
    // Validate URL format
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      if (!url.hostname.includes('supabase.co')) {
        warnings.push('NEXT_PUBLIC_SUPABASE_URL should be a Supabase URL (*.supabase.co)')
      }
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }

  // Check optional service role key
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY is not set (optional for client-side operations)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function getEnvStatus(): string {
  const validation = validateEnvironment()
  
  if (!validation.isValid) {
    return `Environment configuration errors: ${validation.errors.join(', ')}`
  }
  
  if (validation.warnings.length > 0) {
    return `Environment configured with warnings: ${validation.warnings.join(', ')}`
  }
  
  return 'Environment properly configured'
}
