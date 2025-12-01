import VectorTileLayer from 'ol/layer/VectorTile';
import { Style, Stroke, Fill } from 'ol/style';
import { useAreaLayerStore } from '@/store/area-layer.js';
import classAreasSource from '../boundary-sources/class-areas.js';
const classAreasLayer = new VectorTileLayer({
    source: classAreasSource,
    visible: false,
    zIndex: 1,
});
export default classAreasLayer;

const getStyle = () => {
    const areaLayerStore = useAreaLayerStore();
    let item = areaLayerStore.handleGetLayerColor('class');
    let color = item.color;
    let width = item.width || 2;
    return new Style({
        stroke: new Stroke({
            color: color,
            width,
        }),
        fill: new Fill({
            color: 'transparent',
        }),
    });
};
export const setClassAreasLayerStyle = (visible = true) => {
    classAreasLayer.setVisible(visible);
    classAreasLayer.setStyle((feature) => {
        return getStyle();
    });
};
