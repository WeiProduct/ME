# Setting Up Environment Variables in Vercel Dashboard

## Important: Final Manual Step Required

Your API has been successfully deployed to Vercel at:
`https://personal-portfolio-api-sandy.vercel.app`

However, you need to add your OpenAI API key to Vercel's environment variables for the chat feature to work.

## Steps to Add Environment Variables:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in to your Vercel account

2. **Navigate to Your Project**
   - Click on the "personal-portfolio-api" project

3. **Go to Settings**
   - Click on the "Settings" tab at the top of the project page

4. **Navigate to Environment Variables**
   - In the left sidebar, click on "Environment Variables"

5. **Add Your OpenAI API Key**
   - Click "Add New"
   - Fill in the following:
     - **Key**: `OPENAI_API_KEY`
     - **Value**: Your actual OpenAI API key (get it from https://platform.openai.com/api-keys)
     - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

6. **Redeploy Your Application**
   - Go to the "Deployments" tab
   - Click on the three dots (...) next to your latest deployment
   - Select "Redeploy"
   - Wait for the deployment to complete

## Testing Your Setup

Once the environment variable is added and the app is redeployed:

1. Visit your portfolio website
2. Click on the chat icon in the bottom right
3. Send a test message like "Hi, tell me about Wei"
4. You should receive a response from the AI assistant

## Troubleshooting

If the chat doesn't work:
- Check the browser console for errors
- Ensure the API key is correctly added in Vercel
- Verify the deployment was successful
- Check that the API endpoint URL in js/chat.js matches your Vercel deployment

## Security Notes

- Never commit your API key to Git
- Keep your .env file in .gitignore
- Only use environment variables for sensitive data
- The API proxy ensures your OpenAI key is never exposed to the frontend