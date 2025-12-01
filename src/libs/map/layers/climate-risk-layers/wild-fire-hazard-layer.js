import ImageLayer from 'ol/layer/Image.js';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import http from '@/libs/file-request';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';

const wildFireHazrdLayer = new ImageLayer({
    source: new ImageArcGISRest({
        ratio: 1,
        params: {},
        url: 'https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/RMRS_WildfireHazardPotential_2018/MapServer',
    }),
    opacity: 1,
    visible: false,
});
export default wildFireHazrdLayer;

export const resetWildFireHazardLayerLegend = async () => {
    const url = 'https://apps.fs.usda.gov/arcx/rest/services/RDW_Wildfire/RMRS_WildfireHazardPotential_2018/MapServer/legend?f=pjson';
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
            if (item.id === 'wildFireHazard') {
                item.children = children;
            }
        });
    }
};
export const setWildFireHazrdLayerVisible = (visible = true) => {
    if (visible) {
        setWildFireHazrdLayerOpacity();
    }
    wildFireHazrdLayer.setVisible(visible);
};
export const setWildFireHazrdLayerOpacity = () => {
    const myLayerColorStore = useMyLayerColorStore();
    let climateListChilds = myLayerColorStore.climateList[0].children;
    climateListChilds.forEach((item) => {
        if (item.id === 'wildFireHazard') {
            let opacityValue = item.opacityValue !== null ? item.opacityValue : 100;
            wildFireHazrdLayer.setOpacity(opacityValue / 100);
        }
    });
};
