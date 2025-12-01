import { createXYZ, extentFromProjection } from 'ol/TileGrid';

const projection = 'EPSG:3857';

const extent = extentFromProjection(projection);

const tileGrid = createXYZ({
    extent: extent,
    tileSize: 512,
});

export default tileGrid;
