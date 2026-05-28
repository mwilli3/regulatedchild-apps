# regulatedchild-apps

The five (here: seven) **The Regulated Child** web apps, built as a Vite
multi-page app and deployed to Netlify at **apps.regulatedchild.com**.
Self-contained, TRC only. No Larice files.

## Routes

Free (ungated):

| Route | App | Source |
|---|---|---|
| `/body` | The Body Behind the Behavior | `src/body` |
| `/coregulation` | Co-Regulation Guide | `src/coregulation` |
| `/quiz` | Regulation Profile Quiz | `src/quiz` |
| `/scripts-free` | In-the-Moment Scripts Pack (free) | `src/scripts-free` |
| `/decoder-free` | Behavior Decoder (free) | `src/decoder-free` |

Paid (gated by `verify-purchase`, fail-closed redirect to the Shopify product page):

| Route | App | Product id sent | $ |
|---|---|---|---|
| `/decoder` | Behavior Decoder Workbook | `workbook` | $47 |
| `/scripts` | In-the-Moment Scripts Pack — Research Edition | `research` | $47 |

> Brief specified 5 routes; per the "all 7" decision the two free lead-magnet
> apps are included at `/scripts-free` and `/decoder-free`. Drop their entries
> from `vite.config.js`, `netlify.toml`, and their `.html` files to ship only 5.

## Local development

```bash
npm install
npm run build      # -> dist/ with 7 entry HTMLs
npm run preview    # serve dist/ locally
npm run dev        # vite dev server
```

Netlify Functions are not served by `vite preview`, so locally the two paid
apps' gates will **redirect to the Shopify product page** on submit (no backend
to verify against). That is the correct fail-closed behavior, not a bug.

## Netlify Functions

- `netlify/functions/ai-proxy.js` — the AI proxy (the "analyze.js" equivalent;
  named `ai-proxy.js` because the apps fetch `/.netlify/functions/ai-proxy`).
  TRC compliance scope, crisis interception (988 / 741741), 20 req/hr/IP rate
  limit, CORS origin `https://apps.regulatedchild.com`.
- `netlify/functions/verify-purchase.js` — queries the TRC Shopify Orders API by
  email; maps product id (`workbook`/`decoder` -> `DECODER_PRODUCT_TITLE`,
  `research`/`scripts` -> `SCRIPTS_PRODUCT_TITLE`). CORS origin
  `https://apps.regulatedchild.com`.

### Environment variables (Netlify, TRC site) — names the functions read

Match these character-for-character:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (optional; default `claude-sonnet-4-6`)
- `SHOPIFY_STORE_DOMAIN` (TRC `*.myshopify.com`)
- `SHOPIFY_ACCESS_TOKEN` (TRC store Admin API token, `read_orders`)
- `DECODER_PRODUCT_TITLE` (exact Shopify product title for the Workbook)
- `SCRIPTS_PRODUCT_TITLE` (exact Shopify product title for the Scripts Pack)

## Open TODOs (need a human / real data)

1. ~~**Shopify product handles + domain.**~~ Resolved: paid gates redirect to
   `https://regulatedchild.com/products/{behavior-decoder-workbook,in-the-moment-scripts-pack}`
   (`PRODUCT_URLS` in each app's `App.jsx`).
2. **Product titles.** Set `DECODER_PRODUCT_TITLE` / `SCRIPTS_PRODUCT_TITLE` to
   the exact Shopify product titles (verify-purchase matches line-item titles).
3. **Repo + first push** (see below) — this project was scaffolded in a sandbox
   that cannot create the GitHub repo.
4. **AI model** — `ai-proxy.js` defaults to `claude-sonnet-4-6`; override via
   `ANTHROPIC_MODEL` if the account uses a different id.

---

## PHASE 1 — Create the repo (manual)

This project was built in an environment scoped to a different repo, so it could
not create `regulatedchild-apps` on GitHub. To stand it up:

```bash
# from this folder
git init -b main
git add .
git commit -m "Initial commit: TRC apps Vite multi-page build"
git remote add origin git@github.com:<owner>/regulatedchild-apps.git
git push -u origin main
```

Default branch MUST be `main`. Leave the TRC sources on the LL
`claude/vibrant-darwin-V0Pdj` branch in place until this repo is confirmed
building on Netlify; remove them from LL only after.

## PHASE 3 — Netlify + DNS + Shopify (manual)

1. **Netlify site:** New site from the `regulatedchild-apps` repo. Production
   branch `main`, Branch deploys "None", Deploy Previews on. Build `npm run build`,
   publish `dist`, functions `netlify/functions`. Note the site's OWN
   `[name].netlify.app`.
2. **Domain:** Add `apps.regulatedchild.com` to the TRC Netlify site. In Shopify
   DNS for `regulatedchild.com`, add CNAME `apps` -> the TRC site's OWN
   `[name].netlify.app` (NOT lovelarice's target). Wait for resolve, provision
   Let's Encrypt cert, enable Force HTTPS. Mirror the apps.lovelarice.com setup.
3. **Shopify token:** On the TRC store, create a Custom App with `read_orders`,
   generate the Admin API access token. Separate from the Larice token.
4. **Env vars:** Add the six vars above to the TRC Netlify site.
5. **Test live:** `/body` and `/quiz` render; `/decoder` fires the gate and a
   non-buyer is redirected to Shopify; confirm a real buyer email verifies.
