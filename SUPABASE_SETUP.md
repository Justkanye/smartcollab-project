# Supabase Setup Guide for SmartCollab

This guide will help you set up the Supabase database for SmartCollab without encountering permission errors.

## Prerequisites

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Access to the Supabase SQL Editor or psql with your database credentials

## Setup Steps

### Step 1: Environment Variables

Add these environment variables to your `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### Step 2: Database Setup

Execute the SQL scripts in the following order:

1. **Create Tables**: Run `scripts/001-create-tables-fixed.sql`
2. **Create Policies**: Run `scripts/002-create-policies-fixed.sql`  
3. **Create Functions**: Run `scripts/003-create-functions-fixed.sql`

### Step 3: Verify Setup

After running the scripts, verify that:

1. All tables are created in the `public` schema
2. Row Level Security is enabled on all tables
3. Policies are active and working
4. Triggers are created and functional

### Step 4: Test Authentication

1. Try signing up a new user
2. Verify that a profile is automatically created
3. Test creating a project and tasks
4. Confirm that progress updates automatically

## Troubleshooting

### Permission Denied Errors

If you encounter permission errors:

1. **Use Supabase SQL Editor**: The web-based SQL editor has the necessary permissions
2. **Check User Role**: Ensure you're using a user with sufficient privileges
3. **Schema Specification**: Always specify `public.` schema in your queries

### Common Issues

1. **JWT Secret Error**: This is handled automatically by Supabase - no manual configuration needed
2. **RLS Policies**: Make sure policies are created after tables
3. **Function Security**: All functions use `SECURITY DEFINER` for proper permissions

### Alternative Setup Methods

#### Method 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste each script
4. Execute them one by one

#### Method 2: Supabase CLI
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
\`\`\`

#### Method 3: Direct Database Connection
If you have direct database access:
\`\`\`bash
psql "postgresql://postgres:[password]@[host]:5432/postgres"
\`\`\`

## Security Notes

1. **Row Level Security**: All tables have RLS enabled
2. **User Isolation**: Users can only access their own data and shared projects
3. **Role-based Access**: Different permission levels for project members
4. **Secure Functions**: All functions run with elevated privileges safely

## Performance Optimizations

The setup includes several performance optimizations:

1. **Indexes**: Created on frequently queried columns
2. **Efficient Queries**: Optimized for common access patterns
3. **Triggers**: Automatic progress calculation
4. **Helper Functions**: Pre-built queries for complex operations

## Next Steps

After successful setup:

1. Test user registration and login
2. Create sample projects and tasks
3. Invite team members to projects
4. Verify real-time updates work correctly
5. Test all CRUD operations

For additional help, refer to the [Supabase Documentation](https://supabase.com/docs) or contact support.
\`\`\`

Let's also create a simple test script to verify the setup:
