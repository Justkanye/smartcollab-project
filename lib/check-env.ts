import { z } from 'zod';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Define the schema for environment variables
const envSchema = z.object({
  // Required environment variables
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'Supabase URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // Email configuration
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  EMAIL_DOMAIN: z.string().min(1, 'Email domain is required'),
  
  // Application URL
  NEXT_PUBLIC_APP_URL: z.string().url('Valid app URL is required'),
  
  // Optional with defaults
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Get all environment variables
const envVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
};

// Validate environment variables
const result = envSchema.safeParse(envVars);

if (!result.success) {
  console.error('❌ Invalid environment variables:');
  
  // Format and display all validation errors
  Object.entries(result.error.format()).forEach(([key, value]) => {
    if (key === '_errors') return;
    console.error(`  ${key}: ${value._errors.join(', ')}`);
  });
  
  // Suggest creating .env.local from example if it doesn't exist
  console.error('\n💡 Make sure to create a .env.local file with the required environment variables.');
  console.error('   You can use .env.local.example as a template.\n');
  
  process.exit(1);
}

console.log('✅ Environment variables are valid');
