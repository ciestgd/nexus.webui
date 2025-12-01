import VectorTileLayer from 'ol/layer/VectorTile';
import { censusTractSource } from '../boundary-sources/index.js';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { useCancerRiskLayerStore } from '@/store/cancer-risk-layer';
import { Style, Fill, Stroke } from 'ol/style';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const cancerRiskGeoIdSet = new Set();
let keyValueList = {};
const cancerRiskLayer = new VectorTileLayer({
    source: censusTractSource,
    visible: false,
    zIndex: 1,
});
let cancerRiskType = '';
let status = false
export default cancerRiskLayer;
const getCancerRiskStyle = (geoId11) => {
    const cancerRiskLayerStore = useCancerRiskLayerStore();
    const cancerRiskList = cancerRiskLayerStore.layerList[0].children;
    if (cancerRiskGeoIdSet.has(geoId11)) {
        let val = keyValueList[geoId11];
        let item = cancerRiskList.filter((item) => item.id === cancerRiskType);
        let color = '';
        if (cancerRiskType.includes('PercentRank')) {
            val = val * 100;
        }
        if (item.length) {
            const childrenList = item[0].children;
            for (let i = 0; i < childrenList.length; i++) {
                const data = childrenList[i];
                if (val <= data.max) {
                    if (val > data.min) {
                        color = data.color;
                        break;
                    } else if (childrenList[i + 1] && childrenList[i + 1].max < val) {
                        color = data.color;
                        break;
                    }
                }
            }

            if (!color) {
                const { max, min } = item[0];
                if (val < min) {
                    color = childrenList[childrenList.length - 1].color;
                } else if (val > max) {
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
export const setCancerRiskGeoIdSet = (idsObj, type) => {
    cancerRiskGeoIdSet.clear();
    keyValueList = idsObj;
    cancerRiskType = type;
    let keys = Object.keys(idsObj);
    if (keys.length) {
        keys.forEach((key) => {
            cancerRiskGeoIdSet.add(key);
        });
    }
    setCancerRiskLayerStyle();
};
export const setCancerRiskLayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    cancerRiskLayer.setVisible(useCancerRiskLayerStore().checkList.length > 0);

    if (isNotInZoom) {
        cancerRiskLayer.setStyle((feature) => {
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
            return getCancerRiskStyle(geoId11);
        });
    } else {
        cancerRiskLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getCancerRiskStyle(geoId11);
        });
    }
};
