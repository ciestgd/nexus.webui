**项目名称**: NEXUS - Web UI

**简介**:
- **描述**: NEXUS 是一个多污染物基于风险的分析工具，用于识别和评估与 PM2.5、O3 和空气毒性物质相关的高健康风险重叠区域。
- **作者**: IceCoffee

**主要技术栈**:
- **前端框架**: `Vue 3` (使用 `vite` 开发工具链)
- **状态管理**: `Pinia`
**项目名称**: NEXUS - Web UI

**概述**
- **描述**: NEXUS 是一个多污染物风险分析前端，主要用于识别和可视化与 PM2.5、O3 及空气毒性相关的高风险重叠区域。
- **作者**: IceCoffee
- **目标用户**: 环境分析师、研究人员与城市/区域规划人员。

**主要特性**
- 多污染物风险展示与对比（PM2.5、O3、空气毒性）
- 基于地图的可视化与图表分析
- 多数据源支持（监测数据、模型输出、栅格/矢量图层）
- 导出数据为 CSV / Excel

**技术栈**
- **前端**: `Vue 3` + `Vite`
- **状态管理**: `Pinia`
- **UI**: `Element Plus`
- **地图**: `OpenLayers (ol)`
- **图表**: `ECharts`, `chart.js`
- **HTTP**: `axios`（项目封装在 `src/libs/request.js`，含请求缓存与全局错误处理）

**快速开始**
- **要求**: `Node.js` >= 16（建议使用 Node 18+）
- **安装依赖**:
```
npm install
```
- **运行开发服务器**:
```
npm run dev
```
- **生成生产构建**:
```
npm run build
```
- **本地预览构建结果**:
```
npm run preview
```

**环境变量**
在本地开发时可在仓库根目录创建 `.env.local` 或 `.env`，常用变量：
```
VITE_APP_API_BASE_URL=http://localhost:5000/api
VITE_APP_API_TIMEOUT=30000
```
这些变量在 `src/libs/request.js` 中用于配置 `axios` 实例的 `baseURL` 与 `timeout`。

**项目目录（摘要）**
- `public/`：静态资源与数据（`dataInput/`、`mapLayer/`、`proximityData/` 等）
- `src/`
	- `src/api/`：后端接口封装（示例：`map-layer.js`、`monitor-data.js`、`endpoints.js`）
	- `src/components/`：可复用 Vue 组件
	- `src/libs/`：工具与封装（请求、导出、地图交互等）
	- `src/store/`：Pinia 状态模块
	- `src/views/`：页面视图
	- `src/router/`：路由配置

示例文件（快速索引）：
- `src/libs/request.js`：封装 `axios`，拦截器会直接返回 `response.data`，并处理错误与进度条。
- `src/api/endpoints.js`：获取后端可用端点 `getEndpoints()`。
- `src/api/map-layer.js`：`getMapLayerData({ pollutantType, dataType, year, dataScaleType })`。
- `src/api/monitor-data.js`：提供 `getPM25MonitorData`, `getO3MonitorData`, `getAirToxicMonitorData` 等方法。

**API 使用示例**
（这些包装函数位于 `src/api/*.js`，内部通过 `src/libs/request.js` 发起请求）

示例：调用地图图层数据
```javascript
import { getMapLayerData } from '@/api/map-layer';

const params = { pollutantType: 'PM25', dataType: 'design', year: 2017 };
const layerData = await getMapLayerData(params);
// 注意：request 封装的拦截器会返回 response.data
```

示例：获取监测站 PM2.5 数据
```javascript
import { getPM25MonitorData } from '@/api/monitor-data';

// rankingYear: 年度排序依据，topCount: 取前 N 条，sinceYear: 起始年份，geoIdList: 可选地理过滤
const data = await getPM25MonitorData(2020, 50, 2015, { geoid: ['14000US36061'] });
```

注意事项：`src/libs/request.js` 使用 `qs` 将数组序列化为 `repeat` 格式（例如 `?geoid=1&geoid=2`），并使用 `axios-cache-interceptor` 做简单缓存。

**数据说明**
- 项目依赖的多数静态数据放在 `public/dataInput/`，包括但不限于：
	- 监测站数据（CSV / JSON）
	- 栅格或分区文件（GeoJSON / CSV）
	- 结果/派生数据（JSON）
- 更新数据时请保证字段一致（例如地理 ID 字段名、年份字段、污染物标识等），否则前端解析或图层渲染可能失败。

**开发与调试建议**
- 调试后端交互：在浏览器网络面板观察请求 URL 与参数，注意 `baseURL` 与环境变量是否生效。
- 常见调试点：
	- 地图交互逻辑：`src/libs/map-*`、`src/libs/map-click.js`、`src/libs/map-point.js`。
	- 页面状态与数据流：Pinia 模块在 `src/store/`。
	- 接口适配：`src/api/` 中封装的各方法。

**单元/集成测试**
- 当前仓库未包含自动化测试脚本；如需添加建议使用 `vitest` + `vue-test-utils` 来对组件与业务函数做单元测试。

**构建与部署（示例：Nginx）**
1. 生成构建：
```powershell
npm run build
```
2. 将输出目录 `dist/` 的内容部署到静态服务器。
3. Nginx 简单示例配置：
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

**贡献指南**
- **流程**：Fork → feature 分支 → 提交 → PR
- **代码风格**：请遵循现有代码风格（ESLint/Prettier 可根据团队加入）。

**常见问题（Troubleshooting）**
- 网页无法加载地图瓦片：检查 `public/mapLayer/` 或后端瓦片服务地址是否配置正确。
- 接口返回 401/403：`src/libs/request.js` 的拦截器会在 401 时跳转 `/login`，请确认鉴权信息或本地 mock。


