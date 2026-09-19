# Serverless API

这是网站的语义搜索后端，使用 Cloudflare Workers 部署。

```bash
npm install -g wrangler
wrangler login
wrangler secret put API_KEY
wrangler deploy
```

`API_KEY` 是上游 OpenAI 兼容服务的密钥，只保存在 Worker Secret。需要使用其他服务时，修改 `wrangler.toml` 的 `API_BASE`；部署后把 Worker 地址填入网站的“API 设置”。

如果不设置 `MODEL`，可以在网站设置中填写模型名称。部署后可用 `/health` 检查 Worker，网站设置中的“读取模型”和“测试连接”用于检查上游服务。
