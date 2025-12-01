import VectorTileLayer from 'ol/layer/VectorTile';
import { censusTractSource } from '../boundary-sources/index.js';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { useConcentrationLayerStore } from '../../../store/concentration-layer';
import { Style, Fill, Stroke } from 'ol/style';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const concentrationGeoIdSet = new Set();
let keyValueList = {};
const concentrationLayer = new VectorTileLayer({
    source: censusTractSource,
    visible: false,
    zIndex: 1,
});
let concentrationType = '';
let arr = [];
export default concentrationLayer;
const getConcentrationStyle = (geoId11) => {
    const concentrationLayerStore = useConcentrationLayerStore();
    const concentrationList = concentrationLayerStore.layerList[0].children;
    if (concentrationGeoIdSet.has(geoId11)) {
        let val = keyValueList[geoId11];
        let item = concentrationList.filter((item) => item.id === concentrationType);
        let color = '';
        if (item.length) {
            let childrenList = item[0].children;
            childrenList.forEach((data, index) => {
                if (val <= data.max) {
                    if (val > data.min) {
                        color = data.color;
                    } else {
                        if (childrenList[index + 1] && childrenList[index + 1].max < val) {
                            color = data.color;
                        }
                    }
                }
            });
            if (!color) {
                let max = item[0].max;
                let min = item[0].min;
                if (val < min) {
                    color = childrenList[childrenList.length - 1].color;
                }
                if (val > max) {
                    color = childrenList[0].color;
                }
            }
        }
        if (!color) {
            color = '#ffffff00';
        }

        return new Style({
            fill: new Fill({
                color: color,
            }),
        });
    }
};
export const setConcentrationGeoIdSet = (idsObj, type) => {
    concentrationGeoIdSet.clear();
    keyValueList = idsObj;
    concentrationType = type;
    let keys = Object.keys(idsObj);
    if (keys.length) {
        keys.forEach((id) => {
            concentrationGeoIdSet.add(id);
        });
    }
    setConcentrationlayerStyle();
};
export const setConcentrationlayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    concentrationLayer.setVisible(useConcentrationLayerStore().checkList.length > 0);
    if (isNotInZoom) {
        concentrationLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            const geoId5 = geoId11.substr(0, 5);
            let region = feature.get('region')
            let cbsa = feature.get('cbsa')
            if (!region) {
                let detail = getCensusTractDetail(geoId11)
                if (detail) {
                    region = detail.epaRegionId;
                    cbsa = detail.cbsaGeoId;
                }
            }

            const args = [region, geoId5.substr(0, 2), cbsa, geoId5];
            if (isNotInZoom(args)) {
                return;
            }
            return getConcentrationStyle(geoId11);
        });
    } else {
        concentrationLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getConcentrationStyle(geoId11);
        });
    }
};
