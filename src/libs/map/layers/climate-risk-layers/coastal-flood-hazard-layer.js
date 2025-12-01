import { useMyLayerColorStore } from '@/store/my-layer-color';
import http from '@/libs/file-request';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
const titleSource = new XYZ({
    url: 'https://coast.noaa.gov/arcgis/rest/services/FloodExposureMapper/CFEM_CoastalFloodHazardComposite/MapServer/tile/{z}/{y}/{x}',
    crossOrigin: 'anonymous',
});
const coastalFloodHazrdLayer = new TileLayer({
    source: titleSource,
    opacity: 1,
    visible: false,
});
export default coastalFloodHazrdLayer;
export const resetCoastalFloodHazardLayerLegend = async () => {
    const url = 'https://coast.noaa.gov/arcgis/rest/services/FloodExposureMapper/CFEM_CoastalFloodHazardComposite/MapServer/legend?f=pjson';
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
            if (item.id === 'coastal') {
                item.children = children;
            }
        });
    }
};
export const setCoastalFloodHazrdLayerVisible = (visible = true) => {
    if (visible) {
        setCoastalFloodHazrdLayerOpacity();
    }
    coastalFloodHazrdLayer.setVisible(visible);
};
export const setCoastalFloodHazrdLayerOpacity = () => {
    const myLayerColorStore = useMyLayerColorStore();
    let climateListChilds = myLayerColorStore.climateList[0].children;
    climateListChilds.forEach((item) => {
        if (item.id === 'coastal') {
            let opacityValue = item.opacityValue !== null ? item.opacityValue : 100;
            coastalFloodHazrdLayer.setOpacity(opacityValue / 100);
        }
    });
};
