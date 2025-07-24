# Railway Deployment Steps

## Prerequisites
- GitHub account
- MongoDB Atlas database (you already have this)

## Step 1: Push to GitHub (if not already done)
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Railway Setup
1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

## Step 3: Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-random-string-here
MONGODB_URI=mongodb+srv://Kyo:v9RZmgp79wp6wcam@cluster0.g1wlbaw.mongodb.net/Skeleton?retryWrites=true&w=majority&appName=Cluster0
```

## Step 4: Update Frontend Environment
Railway will provide a domain like: `https://your-app-name.railway.app`

Update your client/.env file:
```
VITE_API_URL=https://your-app-name.railway.app
```

## Step 5: Deploy
Railway will automatically:
1. Detect Node.js project
2. Run `npm install`
3. Run `npm run build` (builds frontend)
4. Run `npm start` (starts backend)
5. Provide live URL

## Expected Timeline
- Setup: 5 minutes
- First deployment: 3-5 minutes
- Your app will be live!

## Post-Deployment
1. Test all features work
2. Create admin user using the live URL
3. Upload images to test file system
4. Share your live gallery!

## Cost
- Development: FREE (500 hours/month)
- If you exceed: ~$5-10/month (still very affordable)

## Troubleshooting
If issues occur:
1. Check Railway logs
2. Verify environment variables
3. Ensure MongoDB Atlas allows Railway's IP ranges (0.0.0.0/0)
