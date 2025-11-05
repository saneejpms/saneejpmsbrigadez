# Deployment Guide - Brigadez Project Management App

This guide will walk you through deploying your project management application to Vercel with Supabase and Google Drive integrations.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- A Google Cloud Platform account (for Google Drive API)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: Brigadez Project Management
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"** and wait for it to initialize (~2 minutes)

### 1.2 Run Database Setup Scripts

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Run the following scripts **in order** by copying and pasting each one:

   **Script 1: Create Tables**
   \`\`\`
   Copy content from: scripts/001_create_tables.sql
   Click "Run" or press Ctrl+Enter
   \`\`\`

   **Script 2: Enable RLS**
   \`\`\`
   Copy content from: scripts/002_enable_rls.sql
   Click "Run"
   \`\`\`

   **Script 3: Create Profile Trigger**
   \`\`\`
   Copy content from: scripts/003_create_profile_trigger.sql
   Click "Run"
   \`\`\`

   **Script 4: Create Functions**
   \`\`\`
   Copy content from: scripts/004_create_functions.sql
   Click "Run"
   \`\`\`

   **Script 5: Seed Data**
   \`\`\`
   Copy content from: scripts/005_seed_data.sql
   Click "Run"
   \`\`\`

   **Script 6: Add Enquiry Number**
   \`\`\`
   Copy content from: scripts/006_add_enquiry_number.sql
   Click "Run"
   \`\`\`

   **Script 7: Add Client ID to Drive Files**
   \`\`\`
   Copy content from: scripts/007_add_client_id_to_drive_files.sql
   Click "Run"
   \`\`\`

   **Script 8: Create Admin User**
   \`\`\`
   Copy content from: scripts/017_simple_admin_create.sql
   Click "Run"
   \`\`\`

3. Verify all scripts ran successfully (you should see success messages)

### 1.3 Get Supabase Environment Variables

1. In your Supabase dashboard, go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy the following values (you'll need these for Vercel):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

---

## Step 2: Set Up Google Drive Integration

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Name it: **"Brigadez File Storage"**
4. Click **"Create"**

### 2.2 Enable Google Drive API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google Drive API"**
3. Click on it and click **"Enable"**

### 2.3 Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in:
   - **Service account name**: `brigadez-drive-service`
   - **Service account ID**: (auto-generated)
4. Click **"Create and Continue"**
5. For role, select **"Basic"** → **"Editor"** (or create custom role with Drive access)
6. Click **"Continue"** → **"Done"**

### 2.4 Create Service Account Key

1. In **Credentials**, find your service account and click on it
2. Go to **Keys** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **JSON** format
5. Click **"Create"** - A JSON file will download
6. **IMPORTANT**: Keep this file secure! It contains sensitive credentials

### 2.5 Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder called **"Brigadez Files"**
3. Right-click the folder → **"Share"**
4. Add the service account email (found in the JSON file: `client_email`)
5. Give it **"Editor"** permissions
6. Copy the **Folder ID** from the URL:
   - URL looks like: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part

### 2.6 Prepare Service Account Key for Vercel

1. Open the downloaded JSON file
2. Copy the **entire contents** of the file
3. Minify it (remove all line breaks) - you can use an online JSON minifier
4. Save this minified JSON string - you'll need it for Vercel

---

## Step 3: Deploy to Vercel

### 3.1 Import Your Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository:
   - Connect your GitHub/GitLab/Bitbucket account if needed
   - Select your repository
4. Click **"Import"**

### 3.2 Configure Project Settings

1. **Framework Preset**: Next.js (should auto-detect)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `next build` (default)
4. **Output Directory**: `.next` (default)

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add the following:

#### Supabase Variables

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
\`\`\`

#### Google Drive Variables

\`\`\`
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
GOOGLE_DRIVE_PARENT_FOLDER_ID=your-folder-id-here
\`\`\`

#### Development Redirect URL (for email confirmation)

\`\`\`
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-app.vercel.app
\`\`\`

**Note**: Replace `your-app` with your actual Vercel app URL after deployment

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~2-3 minutes)
3. Once deployed, you'll get a URL like: `https://your-app.vercel.app`

---

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase Redirect URLs

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
4. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`
5. Click **"Save"**

### 4.2 Update Environment Variable

1. Go back to Vercel → Your Project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your actual Vercel URL
3. Click **"Save"**
4. Redeploy: Go to **Deployments** → Click **"..."** on latest → **"Redeploy"**

---

## Step 5: Verify Deployment

### 5.1 Test Database Connection

1. Visit: `https://your-app.vercel.app/auth/check-connection`
2. Verify all checks are green:
   - ✅ Environment Variables
   - ✅ Supabase Connection
   - ✅ Database Tables
   - ✅ Admin User

### 5.2 Test Login

1. Go to: `https://your-app.vercel.app/auth/login`
2. Login with:
   - **Email**: `info@brigadezmetal.com`
   - **Password**: `Brigadezmetal@2024`
3. You should be redirected to the dashboard

### 5.3 Test Google Drive Upload

1. In the dashboard, go to **Clients** or **Enquiries**
2. Try uploading a file
3. Verify it appears in your Google Drive folder

---

## Step 6: Create Additional Users

### Option 1: Via Admin Dashboard

1. Login as admin
2. Go to **Users** → **Create New User**
3. Fill in the form and submit

### Option 2: Via SQL

1. Go to Supabase SQL Editor
2. Run this script (modify email/password/name/role):

\`\`\`sql
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'user@example.com',  -- CHANGE THIS
    crypt('YourPassword123', gen_salt('bf')),  -- CHANGE THIS
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Update profile role (created by trigger)
  UPDATE profiles
  SET role = 'designer'  -- CHANGE THIS (admin/designer/accountant)
  WHERE id = new_user_id;

  RAISE NOTICE 'User created successfully with ID: %', new_user_id;
END $$;
\`\`\`

---

## Troubleshooting

### Issue: "Database error querying schema"

**Solution**: The admin user doesn't exist. Run script `017_simple_admin_create.sql` in Supabase SQL Editor.

### Issue: Google Drive upload fails

**Solutions**:
1. Verify `GOOGLE_SERVICE_ACCOUNT_KEY` is properly formatted (minified JSON)
2. Check that the service account email has access to the Drive folder
3. Verify `GOOGLE_DRIVE_PARENT_FOLDER_ID` is correct
4. Check Vercel logs for detailed error messages

### Issue: Email confirmation not working

**Solution**: Make sure you've added your Vercel URL to Supabase redirect URLs (Step 4.1)

### Issue: Build fails on Vercel

**Solutions**:
1. Check build logs for specific errors
2. Verify all environment variables are set correctly
3. Make sure your code is pushed to the repository
4. Try redeploying

---

## Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel, go to your project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `app.brigadez.com`)
4. Follow the DNS configuration instructions
5. Update Supabase redirect URLs with your custom domain

---

## Security Best Practices

1. **Never commit** `.env` files or service account keys to Git
2. **Rotate** service account keys periodically
3. **Use** different Supabase projects for development and production
4. **Enable** 2FA on your Vercel and Supabase accounts
5. **Review** RLS policies regularly to ensure data security
6. **Monitor** Vercel logs for suspicious activity

---

## Maintenance

### Regular Updates

1. Keep dependencies updated: `npm update`
2. Monitor Vercel deployment logs
3. Check Supabase database size and performance
4. Review Google Drive storage usage

### Backup

1. **Database**: Supabase provides automatic backups (check your plan)
2. **Files**: Google Drive has version history and trash
3. **Code**: Keep your Git repository up to date

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs (Dashboard → Logs)
3. Visit `/auth/check-connection` to diagnose issues
4. Review this deployment guide

---

## Summary Checklist

- [ ] Supabase project created
- [ ] All 8 database scripts executed successfully
- [ ] Admin user created and verified
- [ ] Google Cloud project created
- [ ] Google Drive API enabled
- [ ] Service account created with JSON key
- [ ] Google Drive folder created and shared with service account
- [ ] Project deployed to Vercel
- [ ] All environment variables added to Vercel
- [ ] Supabase redirect URLs configured
- [ ] Login tested successfully
- [ ] File upload tested successfully
- [ ] Additional users created (if needed)

**Congratulations! Your Brigadez Project Management App is now live! 🎉**
