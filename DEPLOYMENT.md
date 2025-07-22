# 🚀 Deployment Guide: GitHub + Vercel

## Step 1: GitHub Repository ✅
**Already Done!** Your repository is ready at:
- **GitHub URL:** https://github.com/stocktonwalbeck/ai-framework-generator

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [Vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository `ai-framework-generator`
4. Vercel will auto-detect it as a Python project

### 2.2 Configure Environment Variables
**⚠️ IMPORTANT:** Add your OpenAI API key:

1. In Vercel project settings, go to "Environment Variables"
2. Add a new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** [Your actual OpenAI API key starting with sk-proj-...]
   - **Environments:** Production, Preview, Development

### 2.3 Deploy
1. Click "Deploy"
2. Wait for deployment to complete (usually 1-2 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## Step 3: Test Your Deployment

### ✅ What to Test:
- [ ] Home page loads correctly
- [ ] All 5 framework types are displayed
- [ ] Framework generation works
- [ ] Export functionality works
- [ ] Mobile responsiveness

### 🔧 Common Issues & Fixes:

**Issue:** "OpenAI API key not found"
- **Fix:** Ensure environment variable `OPENAI_API_KEY` is set in Vercel

**Issue:** "Module not found"
- **Fix:** Check `requirements.txt` includes all dependencies

**Issue:** "Build failed"
- **Fix:** Ensure Python version in `runtime.txt` is supported by Vercel

## Step 4: Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed

## 🎉 You're Live!

Your AI SYSTEM GENERATOR is now:
- ✅ Hosted on GitHub (version control)
- ✅ Ready for Vercel deployment
- ✅ Secured with environment variables
- ✅ Auto-deploys on every push to main branch

## 🚀 Quick Deploy Commands

For future updates, just use:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy on every push to main! 