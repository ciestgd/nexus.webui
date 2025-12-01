import VectorTileLayer from 'ol/layer/VectorTile';
import { censusTractSource } from '../boundary-sources/index.js';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import { Style, Fill, Stroke } from 'ol/style';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const climateGeoIdSet = new Set();
let keyValueList = {};
const climateLayer = new VectorTileLayer({
    source: censusTractSource,
    visible: false,
    zIndex: 1,
});
let climateType = '';

export default climateLayer;
const getClimateStyle = (geoId11) => {
    const myLayerColorStore = useMyLayerColorStore();
    const climateList = myLayerColorStore.climateList[0].children;
    if (climateGeoIdSet.has(geoId11)) {
        let val = keyValueList[geoId11];
        let item = climateList.filter((item) => item.id === climateType);
        let color = '';
        if (climateType.includes('PercentRank')) {
            val = val * 100;
        }
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
export const setClimateGeoIdSet = (idsObj, type) => {
    climateGeoIdSet.clear();
    keyValueList = idsObj;
    climateType = type;
    Object.keys(idsObj).forEach((id) => {
        climateGeoIdSet.add(id);
    });
    setClimatelayerStyle();
};
export const setClimatelayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    climateLayer.setVisible(true);
    if (isNotInZoom) {
        climateLayer.setStyle((feature) => {
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
            return getClimateStyle(geoId11);
        });
    } else {
        climateLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getClimateStyle(geoId11);
        });
    }
};
