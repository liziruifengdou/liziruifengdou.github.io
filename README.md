# fengdou archive

## Fengdou 找搭子

[打开网页游戏](https://liziruifengdou.github.io/fengdou/)

游戏位于 `fengdou/`，打开链接即可玩，无需账号或安装。电脑使用 WASD / 方向键移动、空格冲刺；手机按住游戏画面拖动移动。最高分保存在当前浏览器。

当前版本包含三关连续冒险、3000 × 2000 的榆中校园地图、卡通人物搭子、八位对手，以及六种达到配方等级后解锁的组合进化攻击。每关三分钟，升级选择至少间隔十二秒；第二关开始可以选择进化，每局最多三个。

首页点「叫上朋友 · 8 人联机」，创建房间后分享房间码或邀请链接，最多八位真人一起玩。小队共享电量、经验、技能和进化，房主决定升级与关卡选项。房主需保持页面打开；短暂断线可刷新恢复。

GitHub Pages 提供游戏页面，联机通过 `index.html` 中的 `fengdou-room-endpoint` 连接公开的游戏房间服务。房间服务位于 `https://fengdou-campus-survivors.major-char-1417.chatgpt.site/api/room`，与原游戏网站共享房间，已允许本 Pages 域名跨域访问。房间接口无需账号或 Cookie，玩家凭据不放入邀请链接。

更新游戏时使用游戏源项目的 `scripts/export-github-pages.mjs` 导出到本仓库 `fengdou/`，提交到 `main` 后由现有 GitHub Actions 一起发布。涉及房间协议的更新须先发布兼容的房间服务。

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
