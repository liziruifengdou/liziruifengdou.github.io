# Pages API deployment

`_worker.js` is the Pages Advanced Mode version of the serverless API. Deploy it with:

```powershell
wrangler pages deploy pages-api --project-name fengdou-search
```

Set the upstream secret once for the Pages project. Wrangler prompts for the value without putting it in this repository:

```powershell
wrangler pages secret put API_KEY --project-name fengdou-search
```

The production endpoint is `https://fengdou-search.pages.dev`.
