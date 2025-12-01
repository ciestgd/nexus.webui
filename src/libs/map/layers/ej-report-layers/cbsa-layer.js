import VectorTileLayer from 'ol/layer/VectorTile';
import cbsaSource from '../../boundary-sources/2018-cbsa.js';
import { Style, Fill, Stroke } from 'ol/style';

const cbsaGeoIdSet = new Set();
const cbsaAreaLayer = new VectorTileLayer({
    source: cbsaSource,
    visible: false,
});

export default cbsaAreaLayer;
const getStyle = (geoId) => {
    if (cbsaGeoIdSet.has(geoId)) {
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
export const setCBSAAreaGeoIdSet = (ids) => {
    cbsaGeoIdSet.clear();
    ids.forEach((id) => {
        cbsaGeoIdSet.add(id);
    });
    setCbsaArealayerStyle();
};
export const setCbsaArealayerStyle = () => {

    cbsaAreaLayer.setVisible(true);

    cbsaAreaLayer.setStyle((feature) => {
        const geoId = feature.getId();
        // const geoId5 = geoId11.substr(0, 5);
        return getStyle(geoId);
    });
};
