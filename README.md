# Google the Second

A minimal Google-like interface for uploading and searching PDF files.

## Features

- Upload PDF files to S3
- Extract and index text from PDFs
- Search across uploaded PDFs
- View search results with highlighted snippets
- Delete uploaded files

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **File Storage**: AWS S3

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Run the migration in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
3. Get your project URL and service role key from Supabase settings

### 3. Set Up AWS S3

1. Create an S3 bucket in AWS
2. Get your AWS access key ID and secret access key
3. Ensure your IAM user has permissions for:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name

# Admin Password (use quotes if password contains special characters like #)
ADMIN_PASSWORD="your-admin-password"
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project can be deployed to Vercel or any platform that supports Next.js.

Make sure to:
1. Set all environment variables in your deployment platform
2. Run the Supabase migration on your production database
3. Ensure your S3 bucket is accessible from your deployment environment

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts    # PDF upload endpoint
│   │   ├── search/route.ts    # Search endpoint
│   │   ├── delete/route.ts    # Delete file endpoint
│   │   └── files/route.ts     # List files endpoint
│   ├── results/
│   │   └── page.tsx           # Search results page
│   ├── layout.tsx
│   ├── page.tsx               # Home page
│   └── globals.css
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── s3.ts                 # S3 operations
│   ├── pdf.ts                # PDF text extraction & tokenization
│   └── snippets.ts           # Snippet generation & highlighting
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

## API Endpoints

### POST /api/upload
Upload a PDF file. Expects `multipart/form-data` with a `file` field.

### GET /api/search?q=query
Search for query terms across uploaded PDFs. Returns matching files with snippets.

### DELETE /api/delete
Delete a file. Expects JSON body: `{ "fileId": "uuid" }`

### GET /api/files
List all uploaded files.

## Database Schema

- **files**: Stores file metadata (id, filename, s3_key, extracted_text, created_at)
- **tokens**: Inverted index for fast searching (word, file_id)

