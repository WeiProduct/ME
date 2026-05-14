# Wei Fu — Personal Site

Source for [weiproduct.github.io/ME/](https://weiproduct.github.io/ME/).

Founder of [WeiProduct](https://weiproduct.com), an AI consumer product studio.
17 apps shipped to the App Store.

## Stack

- Static HTML / CSS / vanilla JS, no build step.
- One Vercel serverless function (`api/chat-proxy.js`) backing the chat widget.
- Deploys to GitHub Pages on push to `main`. API deploys to Vercel.

## Local dev

```bash
vercel dev          # serves the API + static files at http://localhost:3000
# or simply open index.html for static-only iteration
python3 -m http.server 5000
```

## Project structure

```
api/chat-proxy.js   Hardened OpenAI proxy (origin whitelist, model whitelist, input cap)
assets/icons/       80px + 160px (@2x) app icons, ~10–35 KB each
css/style.css       Single stylesheet, design tokens at the top
js/main.js          Navigation + smooth scroll
js/chat.js          Chat widget logic (no inline styles)
css/chat.css        Chat widget styles
index.html          Single-page site
manifest.json       PWA manifest
specs/              Original product specs (kept for history)
Wei_Fu_Resume.md    Resume (linked from the site)
```

## Deploying

- **Static site**: push to `main`; GitHub Pages serves it.
- **Chat API**: `vercel --prod` from this directory, or auto-deploy on push.

### Required Vercel env var

| Key | Where |
|---|---|
| `OPENAI_API_KEY` | Vercel → Project → Settings → Environment Variables |

### Allowed origins

Edit `api/chat-proxy.js` if you move to a custom domain.

## License

MIT — see [LICENSE](LICENSE).
