# yodasbasket

If my cat started cooking, this is the app he'd ask me to make.

An offline-first meal planning and shopping list app that runs entirely in the browser. No accounts, no servers — your data stays on your device.

## Features

- **Meal Planning** — pick recipes, adjust servings, build a weekly plan
- **Shopping Lists** — auto-generated from your meal plan with ingredient merging
- **Pantry Tracking** — track what you have, subtract it from your shopping list
- **Recipes** — browse presets or create your own
- **Export/Import** — back up and restore all your data as JSON
- **Works Offline** — installable PWA with full offline support

## Tech Stack

React · TypeScript · Vite · Tailwind CSS · Dexie (IndexedDB) · Zustand · vite-plugin-pwa

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/istisiki/yodasbasket.git
cd yodasbasket

# Install dependencies
bun install

# Start dev server
bun dev
```

Open [http://localhost:5173/yodasbasket/](http://localhost:5173/yodasbasket/) in your browser.

### Other Commands

```bash
bun run build     # Production build → dist/
bun preview       # Preview the production build
bun run lint      # Check code with Biome
bun run lint:fix  # Auto-fix lint issues
```

## Deployment

The repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on every push to `main`.

### Setup

1. Go to your repo's **Settings → Pages**
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. Push to `main` — the app will be live at `https://istisiki.github.io/yodasbasket/`

### Custom Domain

To use a custom domain, update `base` in `vite.config.ts` from `"/yodasbasket/"` to `"/"`, then configure your domain in GitHub Pages settings.
