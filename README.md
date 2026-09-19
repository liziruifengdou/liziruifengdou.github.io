# fengdou archive

## 功能

- 关键词搜索、排序和分页
- 按意思搜索（基于Cloudflare Worker）
- 精选语录、历史个签和上下文
- 群相册

## 部署

GitHub Actions 自动发布 Pages。网站所需静态数据位于 `data/`。语义搜索后端位于 `worker/`。部署前在 Cloudflare Worker 中设置 `API_KEY` Secret，然后把 Worker 地址填入网页的“API 设置”。上游接口必须兼容 OpenAI `/models` 和 `/chat/completions`；其他模型服务可在 `worker/wrangler.toml` 修改 `API_BASE`。

```bash
cd worker
npm install -g wrangler
wrangler login
wrangler secret put API_KEY
wrangler deploy
```
