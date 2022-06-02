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

### Step 1

```
$ git clone -b edge --single-branch git@github.com:moulapp/moul.git
$ cd moul && npm i
$ cp wrangler.example.toml  wrangler.toml
```

### Step 2

Before continue, update `wrangler.toml`

- `__replace__me__with__account__id__` to your `account_id`
- `__replace__me__with__kv__id__` to your KV namespace ID
- `__replace__me__with__bucket__name__` to your bucket name

Next step is generate `MOUL_ACCESS_KEY` and `MOUL_SESSION_SECRET` then set it via `wrangler secret`

> You can use your password manager for this, make sure to save `MOUL_ACCESS_KEY`, you will need it to login.

```
$ wrangler secret put MOUL_SESSION_SECRET
$ wrangler secret put MOUL_ACCESS_KEY
```

### Step 3

Final step

```
$ npm run deploy
```

## Usages

### Add your profile

1. Visit `https://example.com/_moul`
2. Access with your `MOUL_ACCESS_KEY`
3. Click `Profile` button on the top navigation
4. Update your name, profile picture, etc.
5. Save

### To create new story

1. Visit `https://example.com/_moul/my-awesome-story` (will be created at `https://example.com/my-awesome-story`, after save)

### Markdown inspired format

On top of markdown, Moul have few specials tag

#### Cover

Cover is the cover of the story

```
{% cover %}
{% photo pid="wqpuy9ebkcpf" /%}
{% /cover %}
```

#### Title

Title is the title of the story

```
{% title %}
This is my title of the story
{% /title %}
```

#### Grid

Grid is work great with 3 or more photos.

```
{% grid %}
{% photo pid="g29yj7bvshfl" /%}
{% photo pid="epczi7m1l5by" /%}
{% photo pid="95mzxl38ijw4" /%}
{% /grid %}
```

> you can copy `pid` from `clipboard` button when open photos modal.

> Use your clipboard history to effectively working with it.
