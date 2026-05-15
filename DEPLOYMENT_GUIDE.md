# Deployment Guide - Secure API Setup

This guide explains how to deploy your personal website with a secure API proxy for the chat widget.

## Overview

The chat widget now uses a secure proxy server to protect your OpenAI API key. Instead of exposing the key in frontend JavaScript, it's now stored securely on the server.

## Architecture

```
User Browser → Your Website → Vercel Proxy → OpenAI API
                               (API key stored here)
```

## Deployment Steps

### 1. Deploy to Vercel

1. Create a Vercel account at https://vercel.com if you don't have one
2. Install Vercel CLI: `npm i -g vercel`
3. From your project directory, run: `vercel`
4. Follow the prompts to link your project

### 2. Set Environment Variables

1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add the following variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your actual OpenAI API key
   - Environment: Production, Preview, Development

### 3. Update CORS Settings

In `/api/chat-proxy.js`, update the allowed origin to match your domain:

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
```

For GitHub Pages, this would be: `https://yourusername.github.io`

### 4. Deploy Updates

After making changes:
```bash
vercel --prod
```

## Local Development

For local testing:

1. Create a `.env` file (copy from `.env.example`)
2. Add your OpenAI API key
3. Run: `vercel dev`

## Security Notes

- Never commit `.env` files with real API keys
- The `.gitignore` file ensures environment files are not tracked
- API keys are only accessible server-side
- CORS is configured to only allow requests from your domain

## Troubleshooting

### Chat widget not working after deployment

1. Check that environment variables are set in Vercel dashboard
2. Verify CORS origin matches your domain exactly
3. Check browser console for errors
4. Verify the API endpoint URL in chat.js

### API key errors

1. Ensure the API key is valid and has sufficient credits
2. Check that the environment variable name matches exactly: `OPENAI_API_KEY`
3. Verify the API key starts with `sk-`

## GitHub Pages Deployment

If deploying to GitHub Pages:

1. Your static files (HTML, CSS, JS) will be served from GitHub Pages
2. The API proxy must be deployed to Vercel
3. Update the API endpoint in chat.js to use the full Vercel URL:
   ```javascript
   const API_ENDPOINT = 'https://your-project.vercel.app/api/chat-proxy';
   ```

## Monitoring

- Check Vercel dashboard for function logs
- Monitor API usage on OpenAI dashboard
- Set up alerts for errors or high usage