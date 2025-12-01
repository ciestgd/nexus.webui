import VectorTileLayer from 'ol/layer/VectorTile';
import { countySource } from '../boundary-sources/index';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { useMorbidityLayerStore } from '@/store/morbidity-layer';
import { Style, Fill, Stroke } from 'ol/style';

const morbidityGeoIdSet = new Set();
let keyValueList = {};
const morbidityLayer = new VectorTileLayer({
    source: countySource,
    visible: false,
    zIndex: 1,
});
let morbidityType = '';

export default morbidityLayer;
const getMorbidityStyle = (geoId11) => {
    const morbidityLayerStore = useMorbidityLayerStore();
    const morbidityList = morbidityLayerStore.layerList[0].children;
    if (morbidityGeoIdSet.has(geoId11)) {
        let val = keyValueList[geoId11];
        let item = morbidityList.filter((item) => item.id === morbidityType);
        let color = '';
        if (morbidityType.includes('PercentRank')) {
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
export const setMorbidityGeoIdSet = (idsObj, type) => {
    morbidityGeoIdSet.clear();
    keyValueList = idsObj;
    morbidityType = type;
    let keysList = Object.keys(idsObj);
    if (keysList.length) {
        keysList.forEach((item) => {
            morbidityGeoIdSet.add(item);
        });
    }
    setMorbiditylayerStyle();
};
export const setMorbiditylayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    morbidityLayer.setVisible(useMorbidityLayerStore().checkList.length > 0);
    if (isNotInZoom) {
        morbidityLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            const geoId5 = geoId11.substr(0, 5);
            const args = [feature.get('region'), geoId5.substr(0, 2), feature.get('cbsa'), geoId5];
            if (isNotInZoom(args)) {
                return;
            }
            return getMorbidityStyle(geoId11);
        });
    } else {
        morbidityLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getMorbidityStyle(geoId11);
        });
    }
};
