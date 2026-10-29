# Jax Nation Productions, site

Deployed on Render as a static site (`jax-nation-site`), auto-deploys from `main`.

## How content works

- `index.html` is the whole site and works on its own, exactly as committed.
- `build.js` runs on Render at deploy time. It reads the latest content from Sanity
  (film projects, shows, merch, studio rate and facts, founder details) and bakes it into the page.
  If Sanity is unreachable or not configured, the committed `index.html` is served unchanged.
- `studio/` is the Sanity Studio (the client's login and forms). Deployed as a second Render static site.

## Render settings

Site (`jax-nation-site`):
- Build command: `node build.js`
- Publish directory: `.`
- Environment: `SANITY_PROJECT_ID` (and `SANITY_DATASET` if not `production`)

Studio (new static site, same repo):
- Root directory: `studio`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `SANITY_STUDIO_PROJECT_ID`
- Redirect/Rewrite rule: `/*` to `/index.html` (Rewrite)

Sanity (sanity.io/manage, project settings):
- API, CORS origins: add the Studio's Render URL with "Allow credentials" ticked
- API, Webhooks: POST to the site's Render Deploy Hook URL, on create, update and delete, dataset `production`
  (this rebuilds the site a minute after the client hits Publish)
