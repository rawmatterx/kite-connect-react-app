# Kite Connect React App

A React application that integrates with Zerodha's Kite Connect API to provide trading functionalities.

## Prerequisites

1. Node.js (v18 or higher recommended)
2. A Zerodha account with Kite Connect API access
3. API credentials from https://kite.trade/console

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your Kite Connect API credentials:
   - `KITE_API_KEY`: Your API key from Kite Console
   - `KITE_API_SECRET`: Your API secret from Kite Console
   - `KITE_REDIRECT_URI`: Should match the redirect URI registered in your Kite Console
   - `SESSION_SECRET`: A random string for session encryption

## Development

To run the app locally:

```bash
npm run dev
```

## Deployment

This app is configured for deployment on Vercel. Make sure to set the environment variables in your Vercel project settings:

- `KITE_API_KEY`
- `KITE_API_SECRET`
- `KITE_REDIRECT_URI`
- `SESSION_SECRET`

## API Endpoints

- `/api/login` - Initiates the Kite Connect login flow
- `/api/kite-redirect` - Handles the OAuth callback
- `/api/profile` - Fetches user profile
- `/api/holdings` - Fetches user holdings
- `/api/margins` - Fetches user margins
- `/api/logout` - Logs out the user

## Security

- Never commit your `.env` file to version control
- Use strong, random values for `SESSION_SECRET`
- In production, set environment variables through your deployment platform's interface
