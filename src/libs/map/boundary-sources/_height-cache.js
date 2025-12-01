import tileGrid from '../tile-grid';

const cache = {};

export const getHeight = (zoom) => {
    let height = cache[zoom];

    if (height === undefined) {
        height = tileGrid.getFullTileRange(zoom).getHeight() - 1;
        cache[zoom] = height;
    }

    return height;
};
