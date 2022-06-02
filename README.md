# Moul

> The minimalist publishing tool for photographers

Demo: https://edge.moul.app

## Features

- `Simplicity` Simple and easy to use, no coding skill required
- `Flexible` Customizable styles
- `Smart` Photos grid look great in all screen size without crop your composition
- `Edge` Edge ready, deploy to Cloudflare Workers, KV, and R2

## Get started

### Prerequisite

- Node.js v16+
- wrangler https://github.com/cloudflare/wrangler2

```
// git clone -b edge --single-branch git@github.com:moulapp/moul.git
// install
// update `wrangler.toml` base on your info
// `name`, `account_id`, `kv_namespaces` id, and your bucket name
// wrangler secret put MOUL_SESSION_SECRET
// wrangler secret put MOUL_ACCESS_KEY
// npm run deploy
```
