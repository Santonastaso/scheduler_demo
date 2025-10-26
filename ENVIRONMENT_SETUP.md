# Environment Variables Setup

This project now uses environment variables for Supabase configuration instead of hardcoded values for better security.

## Required Environment Variables

The following environment variables must be set:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## GitHub Secrets Setup

For production deployments, set these as GitHub Secrets:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:

### Repository Secrets to Add:

```
VITE_SUPABASE_URL
Value: https://wufsjkzyjxgvualcaftn.supabase.co

VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnNqa3p5anhndnVhbGNhZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzAyNzAsImV4cCI6MjA3NzA0NjI3MH0.cq8pGstXbA3OzgPbkJNRrQT39ROA4t9N3czLSIWpjUs
```

## Local Development

For local development, create a `.env` file in the project root:

```bash
# .env
VITE_SUPABASE_URL=https://wufsjkzyjxgvualcaftn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnNqa3p5anhndnVhbGNhZnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzAyNzAsImV4cCI6MjA3NzA0NjI3MH0.cq8pGstXbA3OzgPbkJNRrQT39ROA4t9N3czLSIWpjUs
```

**Important:** Add `.env` to your `.gitignore` file to prevent committing sensitive data.

## Deployment

The application will automatically use the GitHub Secrets when deployed through GitHub Actions or other CI/CD pipelines that have access to the repository secrets.

## Security Benefits

- ✅ No hardcoded credentials in source code
- ✅ Different configurations for different environments
- ✅ Secure handling of sensitive data
- ✅ Easy rotation of API keys without code changes
