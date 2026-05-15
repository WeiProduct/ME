#!/bin/bash

echo "🔐 Setting up Secure API for Personal Website"
echo "============================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your OpenAI API key"
    echo ""
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm i -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "Next Steps:"
echo "1. Edit .env and add your OpenAI API key"
echo "2. Update the API_ENDPOINT in js/chat.js with your Vercel app URL"
echo "3. Update CORS origin in api/chat-proxy.js with your domain"
echo "4. Run 'vercel' to deploy your API proxy"
echo "5. Set OPENAI_API_KEY in Vercel dashboard environment variables"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"