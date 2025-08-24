# Simple Ed - Educational Apps Platform

A multi-app platform hosting educational applications on simple-ed.com.

## Apps

- **Flash Cards** (`/flash-card`) - Interactive flashcard learning tool (Next.js app)
- **Random Selection** (`/random-selection`) - Random name/item selection tool (Static HTML app)

## Deployment to Vercel

1. Install dependencies:
   ```bash
   npm install
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

3. Configure domain:
   - Go to Vercel dashboard
   - Navigate to project settings
   - Add `simple-ed.com` as a custom domain
   - Configure DNS to point to Vercel

## Local Development

```bash
npm run dev
```

The landing page will be available at `http://localhost:3000`, with apps accessible at:
- `http://localhost:3000/flash-card`
- `http://localhost:3000/random-selection`

## Structure

```
simple-ed-main/
├── src/app/              # Main landing page (Next.js)
├── apps/
│   ├── flash-card/       # Flash card app (Next.js)
│   ├── random-selection/ # Random selection tool (Static HTML)
│   └── random_selector_1/# Additional analytics app
├── vercel.json          # Vercel deployment configuration
└── package.json         # Main project dependencies
```