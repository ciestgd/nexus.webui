import VectorTileLayer from 'ol/layer/VectorTile';
import { Style, Stroke, Fill } from 'ol/style';
import { useAreaLayerStore } from '@/store/area-layer.js';
import advanceAreasSource from '../boundary-sources/advance-areas.js';
const advanceAreasLayer = new VectorTileLayer({
    source: advanceAreasSource,
    visible: false,
    zIndex: 1,
});
export default advanceAreasLayer;

const getStyle = () => {
    const areaLayerStore = useAreaLayerStore();
    let item = areaLayerStore.handleGetLayerColor('advance');
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
export const setAdvanceAreaLayerStyle = (visible = true) => {
    advanceAreasLayer.setVisible(visible);
    advanceAreasLayer.setStyle((feature) => {
        return getStyle();
    });
};
