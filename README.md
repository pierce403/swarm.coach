# Swarm Inc

A browser-local strategy game about deploying waves of AI swarms to acquire datacenter capacity and dominate Internet traffic. Built with HTML, CSS, SVG, and dependency-free JavaScript modules. Source and assets are self-contained; there are no external game services or trackers.

## Playing

Select an entry hub, set expansion intensity, reinvestment, traffic allocation, and seed capital, then launch. Each wave runs for up to 120 simulation days, at 1, 2, or 4 days per real second. Click another hub during a wave to prioritize expansion there. Resources accumulate continuously; upgrades are purchased between waves. Win by carrying 60% of modeled global traffic for ten consecutive simulation days.

Space pauses/resumes. Keys 1/2/3 select Command, Evolution, and Archive. Campaigns autosave in localStorage. Export/import JSON is available in Settings. Backgrounding the page pauses the simulation. Saves are local to the browser, not synchronized between devices.

## Model

- 23 geographically located datacenter clusters connected through 39 illustrative backbone links.
- Each node has compute capacity, transit capacity, electricity cost, operator resistance, acquired control, and heat.
- Acquisition propagates only through adjacent network links, with a distance-derived latency penalty; prioritizing a remote hub does not teleport resources.
- Replication and service workloads compete for output. Routing allocation increases carried traffic but reduces research yield.
- Link capacity, neighboring presence, heat, and power constraints limit traffic yield. More servers do not automatically imply an equal share of global traffic.
- Footprint and expansion intensity raise operator attention. Interventions reclaim capacity and temporarily inhibit acquisition. Power events throttle regional output.
- Six persistent upgrade paths improve learning, peering, cooling, resilience, research, and efficiency.
- Waves retain a fraction of their acquired capacity. An 80-credit seed reserve prevents upgrades from stranding the next launch.
- Currency, capacities, takeover dynamics, topology, and accelerated timelines are fictional and tuned for play. PF/s is a modeled compute scale, not a hardware benchmark. The simulation is not an empirical representation of Internet ownership or flows.
- No network probing, external agents, real infrastructure control, exploitation, or live traffic data are implemented.

## Sources and assets

Conceptual infrastructure constraints:
- IEA, *Energy and AI*: https://www.iea.org/reports/energy-and-ai
- Cloudflare, Network Interconnect: https://developers.cloudflare.com/network-interconnect/

Map geometry: Natural Earth 1:110m land, public domain, obtained from https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson . Terms: https://www.naturalearthdata.com/about/terms-of-use/ . Converted locally to SVG.

Fonts: Barlow Condensed, IBM Plex Mono, and Manrope, distributed through Google Fonts under the SIL Open Font License; local assets in `public/fonts`.

## Development and deployment

Production: https://swarm.coach/

```sh
npm ci
npm run dev
npm run check
```

`npm run check` runs the simulation tests, checks JavaScript syntax and local asset references, and performs a Wrangler deployment dry run.

Cloudflare Workers Builds deploys the `main` branch automatically using the existing `swarm-coach` Worker and custom-domain configuration. Static files are served from `public/`, as configured in `wrangler.jsonc`. Cloudflare credentials remain in Cloudflare; GitHub secrets are not required. `npm run deploy` is available for an authenticated local deployment.

The tests cover network reachability, launch/pause/recall, resource accounting and launch reserves, upgrade caps, save round trips and invalid imports, strategy differences, 25 seeded campaign scenarios, and a reachable victory condition.

GitHub Actions independently validates each push and checks the live custom domain after Cloudflare deployment. The production check verifies exact SHA-256 matches for all game assets, JavaScript module MIME types, and the custom 404 response. It retries while the new build propagates and requires no deployment credentials.

Saves are browser-local and origin-specific. To bring an existing campaign from the original preview site, export it there and import the JSON through Settings on swarm.coach.
