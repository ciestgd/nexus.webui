import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import { useMyLayerColorStore } from '@/store/my-layer-color';
let layerId = null;
const seaLevelRiskLayer = new TileLayer({
    source: null,
    visible: false,
    opacity: 1,
});
export default seaLevelRiskLayer;

export const setSeaLevelRiskLayerVisible = (visible = true) => {
    if (visible) {
        setSeaLevelRiskLayerOpacity();
    }
    seaLevelRiskLayer.setVisible(visible);
};
export const setSeaLevelRiskLayerOpacity = () => {
    const myLayerColorStore = useMyLayerColorStore();
    let climateListChilds = myLayerColorStore.climateList[0].children;
    climateListChilds.forEach((item) => {
        if (item.id === layerId) {
            let opacityValue = item.opacityValue !== null ? item.opacityValue : 100;
            seaLevelRiskLayer.setOpacity(opacityValue / 100);
        }
    });
};
export const setSeaLevelRiskLayerSource = (type, id) => {
    let url = 'https://www.coast.noaa.gov/arcgis/rest/services/dc_slr/slr_1ft/MapServer/tile/{z}/{y}/{x}';
    url = url.replace(/1ft/gi, type);
    let source = new XYZ({
        url,
        crossOrigin: 'anonymous',
    });
    seaLevelRiskLayer.setSource(source);
    layerId = id;
};
