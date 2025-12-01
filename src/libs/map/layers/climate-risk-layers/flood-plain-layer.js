import ImageLayer from 'ol/layer/Image.js';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';

const floodPlainLayer = new ImageLayer({
    source: new ImageArcGISRest({
        ratio: 1,
        params: {},
        url: 'https://enviroatlas.epa.gov/arcgis/rest/services/Supplemental/Estimated_floodplain_CONUS_WM/ImageServer',
    }),
    opacity: 1,
    visible: false,
});
export default floodPlainLayer;

export const setFloodPlainLayerVisible = (visible = true) => {
    if (visible) {
        setFloodPlainLayerOpacity();
    }
    floodPlainLayer.setVisible(visible);
};
export const setFloodPlainLayerOpacity = () => {
    const myLayerColorStore = useMyLayerColorStore();
    let climateListChilds = myLayerColorStore.climateList[0].children;
    climateListChilds.forEach((item) => {
        if (item.id === 'floodPlain') {
            let opacityValue = item.opacityValue !== null ? item.opacityValue : 100;
            floodPlainLayer.setOpacity(opacityValue / 100);
        }
    });
};
