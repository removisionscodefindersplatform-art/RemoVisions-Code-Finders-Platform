# RemoVisions Code Finders Platform - AI Agents Setup Guide

This guide will walk you through installing and configuring all AI agents (OpenAI, Google Gemini, and Anthropic Claude) for the RemoVisions platform.

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- API keys for the AI services you want to use:
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Google Gemini API Key](https://makersuite.google.com/app/apikey)
  - [Anthropic Claude API Key](https://console.anthropic.com/)

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/removisionscodefindersplatform-art/RemoVisions-Code-Finders-Platform.git
cd RemoVisions-Code-Finders-Platform
```

### Step 2: Install All Dependencies

```bash
# Install all agents and dependencies
npm install
```

### Step 3: Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Then edit the `.env` file and add your API keys:

```env
OPENAI_API_KEY=sk-your-actual-key-here
GOOGLE_API_KEY=your-actual-google-key-here
ANTHROPIC_API_KEY=your-actual-anthropic-key-here
```

### Step 4: Start Development Server

```bash
npm run dev
```

## Individual Agent Installation

If you only want specific agents, install them individually:

### OpenAI ChatGPT

```bash
npm install openai
```

**Usage Example:**

```javascript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chatWithGPT() {
  const message = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Hello, can you help me build a website?' }
    ],
  });
  console.log(message.choices[0].message.content);
}

chatWithGPT();
```

### Google Gemini

```bash
npm install @google/generative-ai
```

**Usage Example:**

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function chatWithGemini() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent('Help me create a no-code website');
  console.log(result.response.text());
}

chatWithGemini();
```

### Anthropic Claude

```bash
npm install @anthropic-ai/sdk
```

**Usage Example:**

```javascript
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function chatWithClaude() {
  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: 'Guide me through building an app' }
    ],
  });
  console.log(message.content[0].text);
}

chatWithClaude();
```

## Getting API Keys

### OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and paste it in `.env` as `OPENAI_API_KEY`

### Google Gemini API Key

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your project
4. Copy the key and paste it in `.env` as `GOOGLE_API_KEY`

### Anthropic Claude API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API keys section
4. Create a new key
5. Copy and paste it in `.env` as `ANTHROPIC_API_KEY`

## Available npm Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run install-agents  # Install all agent dependencies
```

## Project Structure

```
RemoVisions-Code-Finders-Platform/
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Project dependencies
├── SETUP.md            # This file
└── index.js            # Main entry point (to be created)
```

## Troubleshooting

### "API key not found" Error

- Make sure you've created a `.env` file (not just `.env.example`)
- Verify your API keys are correctly pasted
- Ensure there are no extra spaces in your keys
- Check that your `.env` file is in the root directory

### "Module not found" Error

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Rate Limits

If you hit rate limits:
- Add delays between API calls
- Upgrade your plan on the respective platform
- Implement request queuing

## Next Steps

1. ✅ Install all agents
2. ✅ Configure API keys
3. 🔄 Create your first AI-powered feature
4. 🚀 Deploy to production

## Support

For issues or questions:
- Check the respective AI service documentation
- Review GitHub Issues on this repository
- Contact the maintainers

## License

GNU General Public License v3.0 - See LICENSE file for details
