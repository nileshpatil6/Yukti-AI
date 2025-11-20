# 🎓 AI Learning Platform

An all-in-one AI-powered learning ecosystem where students can upload their study notes and instantly unlock a fully personalized, gamified learning experience.

## ✨ Features

### 🤖 AI-Powered Learning
- **RAG-Based Q&A**: Ask questions and get answers grounded in your uploaded notes using Gemini File Search
- **AI-Generated Slides**: Beautiful presentations with visual diagrams and real-world examples
- **Audio Lessons**: Natural-sounding voice narration using DeepGram TTS
- **Adaptive Teaching**: Content personalized to your learning style, pace, and interests

### 📝 Interactive Assessment
- **Smart Quizzes**: Adaptive quizzes with MCQs, true/false, and short answer questions
- **Interactive Games**: Engaging HTML5 games tailored to each topic
- **Flashcards**: Spaced repetition system for optimal memory retention

### 🎮 Gamification
- **Streak System**: Maintain daily learning streaks
- **XP & Levels**: Earn experience points and level up
- **Badges & Achievements**: Unlock milestones
- **AI Personas**: Choose your learning companion

### 🗣️ Voice Mode
- **Conversational Learning**: Natural voice conversations with AI tutor
- **Socratic Dialogue**: Question-answer format to deepen understanding

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with Google OAuth
- **AI**: Gemini API (free tier) for RAG and content generation
- **Audio**: DeepGram API (free tier) for TTS

## 📦 Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Initialize database**
```bash
npx prisma generate
npx prisma db push
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Required API Keys (All Free Tier)

- **Google OAuth**: [console.cloud.google.com](https://console.cloud.google.com)
- **Gemini API**: [makersuite.google.com](https://makersuite.google.com/app/apikey)
- **DeepGram API**: [console.deepgram.com](https://console.deepgram.com)
- **Database**: [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech)

## 📁 Project Structure

```
learning-platform/
├── app/                # Next.js app directory
├── components/         # React components
├── lib/               # Utilities and configs
├── prisma/            # Database schema
└── public/            # Static assets
```

## 🗄️ Database Models

14 Prisma models including: User, Subject, Note, Topic, Slide, Quiz, Game, Flashcard, StudyPlan, Streak, Achievement

## 🚀 Roadmap

- [x] Project foundation
- [x] Authentication
- [x] Landing page
- [ ] Onboarding flow
- [ ] Subject management
- [ ] AI integration (RAG)
- [ ] Content generation
- [ ] Voice mode
- [ ] Gamification

## 📝 License

MIT License

---

**Built with ❤️ for students worldwide**
*100% Free • Open Source • AI-Powered*
