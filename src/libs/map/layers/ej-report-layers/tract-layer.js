import VectorTileLayer from 'ol/layer/VectorTile';
import { censusTractSource } from '../../boundary-sources/index.js';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { Style, Fill, Stroke } from 'ol/style';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const tractGeoIdSet = new Set();
const tractAreaLayer = new VectorTileLayer({
    source: censusTractSource,
    visible: false,
});

export default tractAreaLayer;
const getCensusTractStyle = (geoId) => {
    if (tractGeoIdSet.has(geoId)) {
        let color = '#FF0000';
        let width = 8;
        return new Style({
            stroke: new Stroke({
                color: color,
                width,
            }),
            fill: new Fill({
                color: 'rgba(160,244,188,0.8)',
            }),
        });
    }
};
export const setTractAreaGeoIdSet = (ids) => {
    tractGeoIdSet.clear();
    ids.forEach((id) => {
        tractGeoIdSet.add(id);
    });
    setTractArealayerStyle();
};
export const setTractArealayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;

    tractAreaLayer.setVisible(true);

    if (isNotInZoom) {
        tractAreaLayer.setStyle((feature) => {
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
        tractAreaLayer.setStyle((feature) => {
            const geoId = feature.getId();
            return getCensusTractStyle(geoId);
        });
    }
};
