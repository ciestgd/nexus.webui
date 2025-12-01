import VectorLayer from 'ol/layer/Vector';
import blockGroupSource from '../boundary-sources/block-group';
import { Style, Fill, Stroke } from 'ol/style';
const blockLayer = new VectorLayer({
    source: blockGroupSource,
    visible: false,
    zIndex: 5,
});
export default blockLayer;

// 配置参数集中管理
const PATTERN_CONFIG = {
    // dotColor: '#A48F25',
    dotColor: '#A48F25',
    strokeWidth: 3,
    baseRadius: 2,
    baseSpacing: 4, // 调整为安全间距
    canvasSize: 8, // 根据实际需求调整（2的n次方效率更高）
    safetyFactor: 1.2 // 安全间距系数
};

// 缓存图案对象（避免重复创建）
let cachedPattern = null;
// 动态计算实际参数
const getActualParams = () => {
    const minSpacing = PATTERN_CONFIG.baseRadius * 2 * PATTERN_CONFIG.safetyFactor;
    return {
        radius: Math.min(PATTERN_CONFIG.baseRadius, (PATTERN_CONFIG.baseSpacing / 2) * 0.9),
        spacing: Math.max(PATTERN_CONFIG.baseSpacing, minSpacing),
    };
};

// 创建离屏canvas生成图案（性能优化）
const createDotPattern = () => {
    if (cachedPattern) return cachedPattern;
    const { canvasSize, dotColor } = PATTERN_CONFIG;
    const { radius, spacing } = getActualParams();

    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    cnv.width = canvasSize;
    cnv.height = canvasSize;

    // 修正后的绘制逻辑（防止边界溢出）
    const startOffset = spacing / 2;
    const maxXY = canvasSize - startOffset;

    for (let y = startOffset; y < maxXY; y += spacing) {
        for (let x = startOffset; x < maxXY; x += spacing) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = dotColor;
            ctx.fill();
        }
    }
    cachedPattern = ctx.createPattern(cnv, 'repeat');
    return cachedPattern;
};

// 样式工厂函数（支持动态参数）
const createBlockStyle = () => {
    const pattern = createDotPattern();

    return new Style({
        stroke: new Stroke({
            color: PATTERN_CONFIG.dotColor,
            width: PATTERN_CONFIG.strokeWidth,
        }),
        fill: new Fill({
            color: pattern,
        }),
    });
};
export const setBlockLayerStyle = async () => {
    blockGroupSource.refresh();
    blockLayer.setStyle(createBlockStyle());
    blockLayer.setVisible(true);
    blockLayer.setSource(blockGroupSource);
};

// 清理缓存方法（当需要修改参数时调用）
export const clearPatternCache = () => {
    cachedPattern = null;
};
