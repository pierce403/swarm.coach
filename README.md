# swarm.coach

Static site for [swarm.coach](https://swarm.coach), hosted on Cloudflare Workers with Static Assets.

## Development

```sh
npm install
npx wrangler dev
```

## Validation and deployment

```sh
npm run check
npm run deploy
```

Production deployment is configured through Cloudflare Workers Builds from the `main` branch. Cloudflare credentials stay in Cloudflare and are not stored as GitHub repository secrets.
