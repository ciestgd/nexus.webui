import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import tileGrid from '../tile-grid';

const url = import.meta.env.VITE_APP_GEO_SERVER_URL_PREFIX + '/gwc/service/tms/1.0.0/areas%3Aadvance@EPSG%3A900913x2@pbf/{z}/{x}/{-y}.pbf';

const tileSource = new VectorTileSource({
    format: new MVT({
        idProperty: 'id',
    }),
    tileGrid: tileGrid,
    url: url,
});

export default tileSource;
