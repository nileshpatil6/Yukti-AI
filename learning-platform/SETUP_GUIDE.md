# AI Learning Platform - Complete Setup Guide (100% FREE TIER)

This guide will walk you through setting up the AI Learning Platform using entirely free services.

## 🎯 What You'll Need

All services below offer generous free tiers:

1. **Supabase** - Database & File Storage (Free: 500MB DB + 1GB Storage)
2. **Google OAuth** - Authentication (Free)
3. **Gemini API** - AI Generation (Free: 60 req/min)
4. **DeepGram API** - Voice Features (Free: $200 credit)

---

## 📋 Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
cd learning-platform
npm install
```

### 2. Set Up Supabase (Database + Storage)

#### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Fill in:
   - **Name**: `ai-learning-platform`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
5. Wait 2-3 minutes for project creation

#### Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Find "Connection string" section
3. Copy the **URI** format
4. Replace `[YOUR-PASSWORD]` with your database password

```
postgresql://postgres.[project-id]:[YOUR-PASSWORD]@db.[project-id].supabase.co:5432/postgres
```

#### Set Up File Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `study-materials`
4. Make it **PUBLIC**
5. Click "Create bucket"

#### Get Supabase API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen:
   - **User Type**: External
   - **App name**: AI Learning Platform
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **Save and Continue** (skip scopes)
   - Add yourself as test user
6. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: AI Learning Platform Web
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - (Add production URL later)
7. Copy **Client ID** and **Client Secret**

### 4. Set Up Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Select your Google Cloud project (or create new)
4. Copy the generated API key

**Free Tier**: 60 requests per minute

### 5. Set Up DeepGram API (Voice Features)

1. Go to [DeepGram Console](https://console.deepgram.com/signup)
2. Sign up (get $200 free credit)
3. Go to **API Keys**
4. Click **Create a New API Key**
5. Name it: `AI Learning Platform`
6. Copy the key (long string starting with letters/numbers)

**Free Credit**: $200 (enough for ~40 hours of audio)

### 6. Configure Environment Variables

1. Copy the example file:

```bash
cp .env.example .env
```

2. Edit `.env` and fill in all values:

```env
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"

# Gemini AI
GEMINI_API_KEY="AIzaSy..."

# DeepGram
DEEPGRAM_API_KEY="your-deepgram-key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

#### Generate NEXTAUTH_SECRET

Run this command:

```bash
openssl rand -base64 32
```

Copy the output into `NEXTAUTH_SECRET`.

### 7. Initialize Database

Run Prisma migrations to create all tables:

```bash
npx prisma generate
npx prisma db push
```

You should see output confirming 14+ tables created.

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Verify Setup

### Test Checklist

- [ ] Landing page loads
- [ ] Can sign in with Google
- [ ] Onboarding wizard works
- [ ] Can create a subject
- [ ] Can upload files (check Supabase Storage)
- [ ] AI Teacher chat responds
- [ ] Can generate slides
- [ ] Can generate quiz
- [ ] Can generate flashcards
- [ ] Can generate games
- [ ] Voice mode records and transcribes
- [ ] Voice mode generates spoken responses
- [ ] Study planner creates schedule

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:
- Check DATABASE_URL is correct
- Verify Supabase project is active
- Check database password has no special characters that need URL encoding

### Google OAuth Errors

**Error**: `redirect_uri_mismatch`

**Solution**:
- Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
- Make sure NEXTAUTH_URL matches exactly

### Gemini API Errors

**Error**: `API key not valid`

**Solution**:
- Generate new API key at [AI Studio](https://makersuite.google.com/app/apikey)
- Make sure key starts with `AIzaSy`
- Check for extra spaces in .env file

### DeepGram Errors

**Error**: `Authentication failed`

**Solution**:
- Verify API key is correct
- Check you have credit remaining in [console](https://console.deepgram.com/)
- Ensure microphone permissions are granted in browser

### File Upload Issues

**Error**: `Failed to upload file`

**Solution**:
- Check Supabase Storage bucket exists and is named `study-materials`
- Verify bucket is set to PUBLIC
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
- Verify anon key has storage permissions

---

## 📊 Free Tier Limits

### Supabase
- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited

### Gemini API
- **Requests**: 60/minute (free tier)
- **Models**: gemini-2.5-flash
- **No daily limits**

### DeepGram
- **Credit**: $200 (lasts months)
- **Usage**: ~$0.0125/minute for STT
- **Usage**: ~$0.015/minute for TTS

### Google OAuth
- **Completely free**
- **Unlimited users** (in production)

---

## 🚀 Deployment (Optional)

### Deploy to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your repository
5. Add all environment variables
6. Update `NEXTAUTH_URL` to your Vercel URL
7. Add Vercel URL to Google OAuth redirect URIs
8. Deploy!

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic SSL

---

## 🎓 Usage Tips

### Maximizing Free Tiers

**Supabase Storage**:
- 1GB is enough for ~1000 PDF files
- Compress images before uploading
- Delete old unused files

**Gemini API**:
- 60 req/min = 3,600/hour
- Each AI generation = 1 request
- More than enough for personal use

**DeepGram Credit**:
- $200 credit lasts 15+ months with moderate use
- Each 1-minute voice session costs ~$0.03
- Avoid leaving microphone running idle

### Best Practices

1. **Regular Backups**: Export data from Supabase monthly
2. **Monitor Usage**: Check Supabase and DeepGram dashboards weekly
3. **Clean Storage**: Delete unused notes/files regularly
4. **API Limits**: Avoid rapid-fire AI generations

---

## 📝 Additional Configuration

### Enable Email Notifications (Optional)

Add to `.env`:

```env
# Email (using Supabase built-in SMTP)
EMAIL_FROM="noreply@yourdomain.com"
```

Configure in Supabase dashboard under **Authentication** → **Email Templates**

### Custom Domain (Optional)

1. Add domain in Vercel settings
2. Update DNS records
3. Update NEXTAUTH_URL in .env
4. Update Google OAuth redirect URIs

---

## 🔒 Security Notes

- Never commit `.env` file to git
- Rotate API keys every 90 days
- Use environment variables for all secrets
- Enable RLS (Row Level Security) in Supabase for production
- Add rate limiting for production deployment

---

## 📞 Support

### Common Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **DeepGram Docs**: https://developers.deepgram.com/

### Community

- Open an issue on GitHub
- Check existing issues for solutions
- Supabase Discord: https://discord.supabase.com/

---

## 🎉 You're Ready!

Your AI Learning Platform is now fully configured with:

✅ Database (Supabase PostgreSQL)
✅ File Storage (Supabase Storage)
✅ Authentication (Google OAuth)
✅ AI Generation (Gemini)
✅ Voice Features (DeepGram)

All services are 100% free tier and perfect for personal use or small groups!

Start learning at: http://localhost:3000
