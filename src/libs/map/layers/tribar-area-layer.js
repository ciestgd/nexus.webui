import VectorTileLayer from 'ol/layer/VectorTile';
import { Style, Stroke, Fill } from 'ol/style';
import { useAreaLayerStore } from '@/store/area-layer.js';
import tribalAreaSource from '../boundary-sources/tribal-areas.js';
const tribalAreasLayer = new VectorTileLayer({
    source: tribalAreaSource,
    visible: false,
    zIndex: 1,
});
export default tribalAreasLayer;

const getStyle = () => {
    const areaLayerStore = useAreaLayerStore();
    let item = areaLayerStore.handleGetLayerColor('tribal');
    let color = item.color;
    let width = item.width || 2;
    return new Style({
        stroke: new Stroke({
            color: color,
            width: width,
        }),
        fill: new Fill({
            color: 'transparent',
        }),
    });
};
export const setTribalAreaLayerStyle = (visible = true) => {
    tribalAreasLayer.setVisible(visible);
    tribalAreasLayer.setStyle((feature) => {
        return getStyle();
    });
};
