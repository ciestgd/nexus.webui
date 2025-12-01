import VectorTileLayer from 'ol/layer/VectorTile';
import { countySource } from '../boundary-sources/index';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { useMortalityLayerStore } from '@/store/mortality-layer';
import { Style, Fill, Stroke } from 'ol/style';

const mortalityGeoIdSet = new Set();
let keyValueList = {};
const mortalityLayer = new VectorTileLayer({
    source: countySource,
    visible: false,
    zIndex: 1,
});
let mortalityType = '';

export default mortalityLayer;
const getMortalityStyle = (geoId11) => {
    const mortalityLayerStore = useMortalityLayerStore();
    const mortalityList = mortalityLayerStore.layerList[0].children;
    if (mortalityGeoIdSet.has(geoId11)) {
        let val = keyValueList[geoId11];
        let item = mortalityList.filter((item) => item.id === mortalityType);
        let color = '';
        if (mortalityType.includes('PercentRank')) {
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
export const setMortalityGeoIdSet = (idsObj, type) => {
    mortalityGeoIdSet.clear();
    keyValueList = idsObj;
    mortalityType = type;
    let keys = Object.keys(idsObj);
    if (keys.length) {
        keys.forEach((key) => {
            mortalityGeoIdSet.add(key);
        });
    }
    setMortalitylayerStyle();
};
export const setMortalitylayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    mortalityLayer.setVisible(useMortalityLayerStore().checkList.length > 0);

    if (isNotInZoom) {
        mortalityLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            const geoId5 = geoId11.substr(0, 5);
            const args = [feature.get('region'), geoId5.substr(0, 2), feature.get('cbsa'), geoId5];
            if (isNotInZoom(args)) {
                return;
            }
            return getMortalityStyle(geoId11);
        });
    } else {
        mortalityLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getMortalityStyle(geoId11);
        });
    }
};
