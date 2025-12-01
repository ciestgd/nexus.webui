import ImageLayer from 'ol/layer/Image.js';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import http from '@/libs/file-request';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
const droughtLayer = new ImageLayer({
    source: new ImageArcGISRest({
        ratio: 1,
        params: {},
        url: 'https://geodata.epa.gov/arcgis/rest/services/OAR_OAP/Drought/MapServer',
    }),
    opacity: 1,
    visible: false,
});
export default droughtLayer;

export const resetDroughtLayerLegend = async () => {
    const url = 'https://geodata.epa.gov/arcgis/rest/services/OAR_OAP/Drought/MapServer/legend?f=pjson';
    let result = await http.get(url);
    if (result.layers && result.layers.length) {
        const myLayerColorStore = useMyLayerColorStore();
        let layer = result.layers[0];
        let climateListChilds = myLayerColorStore.climateList[0].children;
        let children = layer.legend.map((item) => {
            return {
                id: item.label,
                label: item.label,
                imageData: 'data:image/png;base64,' + item.imageData,
            };
        });
        climateListChilds.forEach((item) => {
            if (item.id === 'drought') {
                item.children = children;
            }
        });
    }
};
export const setDroughtLayerVisible = (visible = true) => {
    if (visible) {
        setDroughtLayerOpacity()
    }
    droughtLayer.setVisible(visible);
};
export const setDroughtLayerOpacity = () => {
    const myLayerColorStore = useMyLayerColorStore();
    let climateListChilds = myLayerColorStore.climateList[0].children;
    climateListChilds.forEach((item) => {
        if (item.id === 'drought') {
            let opacityValue = item.opacityValue !== null ? item.opacityValue : 100;
            droughtLayer.setOpacity(opacityValue / 100);
        }
    });
};
