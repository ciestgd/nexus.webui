import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import tileGrid from '../tile-grid';
import { getHeight } from './_height-cache';

const tileUrlFunction = (tileCoord) => {
    // zoom
    const z = tileCoord[0];

    // tolerance
    const t = z <= 7 ? '_100' : '';

    const x = tileCoord[1];
    const y = getHeight(z) - tileCoord[2];
    return import.meta.env.VITE_APP_GEO_SERVER_URL_PREFIX + `gwc/service/tms/1.0.0/us-boundaries%3A2018-cbsa${t}@EPSG%3A900913x2@pbf/${z}/${x}/${y}.pbf`;
}

const tileSource = new VectorTileSource({
    format: new MVT({
        idProperty: 'id',
    }),
    tileGrid: tileGrid,
    tileUrlFunction: tileUrlFunction,
});

export default tileSource;
