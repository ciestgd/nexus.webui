import VectorTileLayer from 'ol/layer/VectorTile';
import { censusTractSource } from '../boundary-sources/index.js';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { useDemographicLayerStore } from '@/store/demographic-layer';
import { Style, Fill, Stroke } from 'ol/style';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const demographicGeoIdSet = new Set();
let keyValueList = {};
const demographicLayer = new VectorTileLayer({
    source: censusTractSource,
    visible: false,
    zIndex: 1,
});
let demographicType = '';

export default demographicLayer;
const getDemographicStyle = (geoId11) => {
    const demographicLayerStore = useDemographicLayerStore();
    const demographicList = demographicLayerStore.layerList[0].children;
    if (demographicGeoIdSet.has(geoId11)) {
        let val = keyValueList[geoId11];
        let item = demographicList.filter((item) => item.id === demographicType);
        let color = '';
        if (item.length) {
            let childrenList = item[0].children;
            childrenList.forEach((data, index) => {
                if (val <= data.max) {
                    if (val >= data.min) {
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
export const setDemographicGeoIdSet = (idsObj, type) => {
    demographicGeoIdSet.clear();
    keyValueList = idsObj;
    demographicType = type;
    let keys = Object.keys(idsObj);
    if (keys.length) {
        keys.forEach((key) => {
            demographicGeoIdSet.add(key);
        });
    }
    setDemographiclayerStyle();
};
export const setDemographiclayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    demographicLayer.setVisible(useDemographicLayerStore().checkList.length > 0);
    if (isNotInZoom) {
        demographicLayer.setStyle((feature) => {
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
            return getDemographicStyle(geoId11);
        });
    } else {
        demographicLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getDemographicStyle(geoId11);
        });
    }
};
