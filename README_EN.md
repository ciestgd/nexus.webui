# NEXUS - Web UI

Overview
---
NEXUS is a web-based front-end for multi-pollutant risk analysis, designed to identify and visualize overlapping high-health-risk areas related to PM2.5, O3, and air toxics. The application targets environmental analysts, researchers, and urban/regional planners.

Author: IceCoffee

Key Features
---
- Multi-pollutant risk comparison and visualization (PM2.5, O3, air toxics)
- Map-based visualizations and charting
- Supports multiple data sources (monitoring data, model outputs, raster/vector layers)
- Export data to CSV / Excel

Tech Stack
---
- Frontend: Vue 3 + Vite
- State management: Pinia
- UI: Element Plus
- Mapping: OpenLayers (`ol`)
- Charting: ECharts, Chart.js
- HTTP: axios (wrapped in `src/libs/request.js`, includes caching and global error handling)

Quick Start
---
Requirements: Node.js >= 16 (Node 18+ recommended)

Install dependencies:
```bash
npm install
```

Run dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

Environment Variables
---
Create a `.env` or `.env.local` in the project root for local overrides. Common variables:
```
VITE_APP_API_BASE_URL=http://localhost:5000/api
VITE_APP_API_TIMEOUT=30000
```
These are used by `src/libs/request.js` to configure axios `baseURL` and `timeout`.

Project Layout (summary)
---
- `public/`: static assets and data (e.g. `dataInput/`, `mapLayer/`, `proximityData/`)
- `src/`
  - `src/api/`: backend API wrappers (examples: `map-layer.js`, `monitor-data.js`, `endpoints.js`)
  - `src/components/`: reusable Vue components
  - `src/libs/`: helper modules and wrappers (request, export, map interactions, etc.)
  - `src/store/`: Pinia modules
  - `src/views/`: pages
  - `src/router/`: routing

Notable files:
- `src/libs/request.js`: axios wrapper with progress, caching and central error handling.
- `src/api/endpoints.js`: `getEndpoints()` - fetch available endpoints from backend.
- `src/api/map-layer.js`: `getMapLayerData({ pollutantType, dataType, year, dataScaleType })`.
- `src/api/monitor-data.js`: `getPM25MonitorData`, `getO3MonitorData`, `getAirToxicMonitorData`, etc.

API Usage Examples
---
All API helpers are in `src/api/*.js` and call `src/libs/request.js`.

Example: fetch map layer data
```javascript
import { getMapLayerData } from '@/api/map-layer';

const params = { pollutantType: 'PM25', dataType: 'design', year: 2017 };
const layerData = await getMapLayerData(params);
// Note: the request wrapper returns response.data directly.
```

Example: fetch PM2.5 monitor data
```javascript
import { getPM25MonitorData } from '@/api/monitor-data';

// rankingYear, topCount, sinceYear, geoIdList
const data = await getPM25MonitorData(2020, 50, 2015, { geoid: ['14000US36061'] });
```

Notes: `src/libs/request.js` serializes arrays using `qs` with the `repeat` format (e.g. `?geoid=1&geoid=2`) and uses `axios-cache-interceptor` for basic caching.

Data
---
Most static datasets are stored in `public/dataInput/`, including monitor data, grid/zone GeoJSON or CSV, and derived results JSON. Keep data field names consistent (e.g. geoid field name, year, pollutant id) to avoid parsing or rendering issues on the front end.

Development & Debugging Tips
---
- Check the browser network tab to inspect request URLs and parameters; ensure `VITE_APP_API_BASE_URL` is set correctly.
- Common places to debug:
  - Map interactions: `src/libs/map-*`, `src/libs/map-click.js`, `src/libs/map-point.js`
  - State & data flow: Pinia modules in `src/store/`
  - API adapters: `src/api/`

Testing
---
There are no automated tests in the repository currently. If you want, we can add `vitest` + `vue-test-utils` for unit and component testing.

Build & Deployment (Nginx example)
---
1. Build:
```powershell
npm run build
```
2. Deploy contents of `dist/` to your static host.

Sample minimal Nginx config:
```
server {
    listen 80;
    server_name example.com;
    root /var/www/nexus/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Contribution Guide
---
1. Fork the repo and create a feature branch
2. Run locally and verify (`npm install`, `npm run dev`)
3. Make changes, write clear commit messages and open a PR with a description and testing notes

Troubleshooting
---
- Map tiles not loading: verify `public/mapLayer/` files or remote tile service URLs are correct.
- API returns 401/403: `src/libs/request.js` handles 401 by redirecting to `/login`; ensure auth or local mock is present.

License
---
The repository does not currently specify an open-source license in `package.json`. Add a `LICENSE` file (e.g. MIT) if you plan to publish it.

Contact
---
Author: IceCoffee

----

Next steps I can help with (choose any):
- generate a detailed API reference for `src/api/` functions (parameters & example responses);
- create an English+Chinese combined README or add badges; or
- add a GitHub Actions workflow for CI (build & deploy).
