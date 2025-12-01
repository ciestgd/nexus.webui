import VectorTileLayer from 'ol/layer/VectorTile';
import { countySource } from '../../boundary-sources/index.js';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { Style, Fill, Stroke } from 'ol/style';
import { getEpaRegionId, getCbsaId } from '@/libs/geoId-enums';
const countyGeoIdSet = new Set();
const countyAreaLayer = new VectorTileLayer({
    source: countySource,
    visible: false,
});

export default countyAreaLayer;
const getCountyStyle = (geoId5) => {
    if (countyGeoIdSet.has(geoId5)) {
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
export const setCountyAreaGeoIdSet = (ids) => {
    countyGeoIdSet.clear();
    ids.forEach((id) => {
        countyGeoIdSet.add(id);
    });
    setCountyArealayerStyle();
};
export const setCountyArealayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;

    countyAreaLayer.setVisible(true);

    if (isNotInZoom) {
        countyAreaLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            const geoId5 = geoId11.substr(0, 5);
            let regionId = getEpaRegionId(geoId5);
                        let cbsaId = getCbsaId(geoId5);
            const args = [regionId, geoId5.substr(0, 2), cbsaId, geoId5];
            if (isNotInZoom(args)) {
                return;
            }

            return getCountyStyle(geoId5);
        });
    } else {
        countyAreaLayer.setStyle((feature) => {
            const geoId11 = feature.getId();
            const geoId5 = geoId11.substr(0, 5);
            return getCountyStyle(geoId5);
        });
    }
};
