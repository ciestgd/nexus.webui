import VectorTileLayer from 'ol/layer/VectorTile';
import { censusTractSource } from '../boundary-sources/index.js';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
// import { useMyLayerColorStore } from '@/store/my-layer-color';
import { useIndicatorsLayerStore } from '@/store/indicators-layer';
import { Style, Fill, Stroke } from 'ol/style';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const indicatorsGeoIdSet = new Set();
let keyValueList = {};
const indicatorsLayer = new VectorTileLayer({
    source: censusTractSource,
    visible: false,
    zIndex: 1,
});
let indicatorsType = '';

export default indicatorsLayer;
const getIndicatorsStyle = (geoId11) => {
    const indicatorsLayerStore = useIndicatorsLayerStore();
    const indicatorsList = indicatorsLayerStore.layerList[0].children;
    if (indicatorsGeoIdSet.has(geoId11)) {
        let val = keyValueList[geoId11];
        let item = indicatorsList.filter((item) => item.id === indicatorsType);
        let color = '';
        val = val * 100;
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
export const setIndicatorsGeoIdSet = (idsObj, type) => {
    indicatorsGeoIdSet.clear();
    keyValueList = idsObj;
    indicatorsType = type;
    let keys = Object.keys(idsObj);
    if (keys.length) {
        keys.forEach((key) => {
            indicatorsGeoIdSet.add(key);
        });
    }
    setIndicatorslayerStyle();
};
export const setIndicatorslayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    indicatorsLayer.setVisible(useIndicatorsLayerStore().checkList.length > 0);
    if (isNotInZoom) {
        indicatorsLayer.setStyle((feature) => {
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
            return getIndicatorsStyle(geoId11);
        });
    } else {
        indicatorsLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getIndicatorsStyle(geoId11);
        });
    }
};
