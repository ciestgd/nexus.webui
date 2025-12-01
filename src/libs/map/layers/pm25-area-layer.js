import VectorTileLayer from 'ol/layer/VectorTile';
import { countySource } from '../boundary-sources/index.js';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { Style, Fill, Stroke } from 'ol/style';
import { useAreaLayerStore } from '@/store/area-layer.js';
import { getEpaRegionId, getCbsaId } from '@/libs/geoId-enums';
const pm25GeoId5Set = new Set();
const pm25AreaLayer = new VectorTileLayer({
    source: countySource,
    visible: false,
});

export default pm25AreaLayer;

// 配置参数对象
const LINE_CONFIG = {
    // lineColor: '#A48F25',   // 线条颜色
    lineWidth: 2, // 线条粗细
    spacing: 10, // 线间距
    dash: [], // 虚线模式（设为空数组时实线）
    canvasSize: 8, // 图案尺寸（推荐2的幂次）
};

// 创建线条图案缓存
let linePatternCache = null;

const createLinePattern = (color) => {
    if (linePatternCache) return linePatternCache;

    // 创建离屏Canvas
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    [cnv.width, cnv.height] = [LINE_CONFIG.canvasSize, LINE_CONFIG.canvasSize];

    // 绘制水平线
    ctx.beginPath();
    for (let y = 0.5; y < cnv.height; y += LINE_CONFIG.spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(cnv.width, y);
    }

    // // 绘制垂直线
    // for (let x = 0.5; x < cnv.width; x += LINE_CONFIG.spacing) {
    //     ctx.moveTo(x, 0);
    //     ctx.lineTo(x, cnv.height);
    // }

    // 应用样式
    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_CONFIG.lineWidth;
    if (LINE_CONFIG.dash.length) {
        ctx.setLineDash(LINE_CONFIG.dash);
    }
    ctx.stroke();

    linePatternCache = ctx.createPattern(cnv, 'repeat');
    return linePatternCache;
};
// 样式工厂函数（支持动态参数）
const createLineStyle = (color, width) => {
    const pattern = createLinePattern(color);

    return new Style({
        stroke: new Stroke({
            color: color,
            width: width,
        }),
        fill: new Fill({
            color: pattern,
        }),
    });
};
const getCountyStyle = (geoId5) => {
    if (pm25GeoId5Set.has(geoId5)) {
        const areaLayerStore = useAreaLayerStore();
        let item = areaLayerStore.handleGetLayerColor('pm25');
        let color = item.color;
        let width = item.width || 2;
        return createLineStyle(color, width);
    }
};
export const setPm25AreaGeoIdSet = (ids) => {
    pm25GeoId5Set.clear();
    ids.forEach((id) => {
        pm25GeoId5Set.add(id);
    });
    setPm25ArealayerStyle();
};
export const setPm25ArealayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;

    pm25AreaLayer.setVisible(useAreaLayerStore().pm25AreaCheckbox);

    if (isNotInZoom) {
        pm25AreaLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            const geoId5 = geoId11.substr(0, 5);
            let regionId = getEpaRegionId(geoId5);
            let cbsaId = getCbsaId(geoId5);
            const args = [regionId, geoId5.substr(0, 2), cbsaId, geoId5];
            if (isNotInZoom(args)) {
                return;
            }

            return getCountyStyle(geoId5);
        });
    } else {
        pm25AreaLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            const geoId5 = geoId11.substr(0, 5);
            return getCountyStyle(geoId5);
        });
    }
};
