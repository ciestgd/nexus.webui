import VectorTileLayer from 'ol/layer/VectorTile';
import { censusTractSource } from '../boundary-sources/index.js';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { Style, Fill, Stroke } from 'ol/style';
import { useAreaLayerStore } from '@/store/area-layer.js';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const cejstGeoIdSet = new Set();
const cejstlayer = new VectorTileLayer({
    source: censusTractSource,
    visible: false,
});

export default cejstlayer;
const getCensusTractStyle = (geoId11) => {
    if (cejstGeoIdSet.has(geoId11)) {
        const areaLayerStore = useAreaLayerStore();
        let item = areaLayerStore.handleGetLayerColor('cejst');
        let color = item.color;
        let width = item.width || 2;
        return new Style({
            stroke: new Stroke({
                color: color,
                width,
            }),
        });
    }
};
export const setCejstGeoIdSet = (ids) => {
    cejstGeoIdSet.clear();
    ids.forEach((id) => {
        cejstGeoIdSet.add(id);
    });
    setCejstlayerStyle();
};
export const setCejstlayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;

    cejstlayer.setVisible(true);

    if (isNotInZoom) {
        cejstlayer.setStyle((feature) => {
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

            return getCensusTractStyle(geoId11);
        });
    } else {
        cejstlayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            return getCensusTractStyle(geoId11);
        });
    }
};
