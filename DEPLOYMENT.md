# Deployment Instructions

## GitHub Pages Deployment Setup

### 1. Repository Setup
- Ensure your repository is public on GitHub
- Repository name: `Nepal_ForeignTrade_dashboard_React`
- Main branch: `main` or `master`

### 2. GitHub Pages Configuration
1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select "Deploy from a branch"
5. Choose `gh-pages` branch
6. Click **Save**

### 3. GitHub Actions Workflow
The deployment is automated via GitHub Actions:
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Push to main/master branch
- **Process**: Build → Test → Deploy

### 4. First Deployment
1. Push your code to the main branch:
```bash
git add .
git commit -m "Initial commit with GitHub Actions deployment"
git push origin main
```

2. GitHub Actions will automatically:
   - Install dependencies
   - Run tests
   - Build the React app
   - Deploy to GitHub Pages

### 5. Verify Deployment
- Check Actions tab for build status
- Visit: https://shivaji-137.github.io/Nepal_ForeignTrade_dashboard_React
- Allow 5-10 minutes for initial deployment

### 6. Subsequent Deployments
Every push to main branch will trigger automatic redeployment.

## Troubleshooting

### Common Issues:
1. **404 Page**: Check homepage URL in package.json
2. **Build Fails**: Check console for dependency issues
3. **Pages Not Enabled**: Verify repository is public

### Manual Build Test:
```bash
npm install
npm test
npm run build
```

## Environment Variables
For production deployment, ensure no sensitive data is exposed in:
- Environment variables
- API keys
- Database credentials

## Monitoring
- GitHub Actions logs
- Browser developer console
- Network requests in DevTools
