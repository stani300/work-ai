# Work AI

A workplace assistant powered by [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/). Chat in the browser to draft emails, summarize notes, brainstorm ideas, and plan work tasks.

**Live demo:** https://work-ai.sandro-tanis.workers.dev

## What it does

- Serves a chat UI at `/`
- Exposes `POST /api/chat` for AI responses
- Uses Workers AI model `@cf/meta/llama-3.2-3b-instruct`
- Runs on Cloudflare's global edge network

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included as a dev dependency)

## Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/stani300/work-ai.git
   cd work-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Log in to Cloudflare**

   ```bash
   npx wrangler login
   ```

   A browser window opens — sign in and click **Allow**.

## Run locally

From the project folder:

```bash
npm run dev
```

Open the URL Wrangler prints (usually **http://localhost:8787** or **http://localhost:8788**).

Press `Ctrl+C` to stop the server.

> **Note:** Local dev uses your Cloudflare Workers AI account remotely and may incur usage charges.

## Deploy to Cloudflare

```bash
npm run deploy
```

After deploy, Wrangler prints your live URL, e.g.:

```
https://work-ai.<your-subdomain>.workers.dev
```

## Project structure

```
work-ai/
├── public/index.html   # Chat UI
├── src/index.ts        # Worker + /api/chat handler
├── wrangler.jsonc      # Worker config + AI binding
└── package.json
```

## API

### `GET /api/health`

Returns service status and model name.

### `POST /api/chat`

**Request body:**

```json
{
  "message": "Draft a short follow-up email to a client.",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous reply" }
  ]
}
```

**Response:**

```json
{
  "reply": "Assistant response text..."
}
```

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run locally |
| `npm run deploy` | Deploy to Cloudflare |
| `npm test` | Run tests |
| `npm run cf-typegen` | Regenerate TypeScript types after changing `wrangler.jsonc` |

## Troubleshooting

**`npm` errors about `package.json` not found**  
Run commands from inside the project folder:

```bash
cd ~/Projects/work-ai
```

**Chat returns a model error**  
The configured model may have been deprecated. Check the [Workers AI model catalog](https://developers.cloudflare.com/workers-ai/models/) and update `MODEL` in `src/index.ts`.

**Not logged in to Cloudflare**  
Run `npx wrangler login` again.

## License

Private project.
