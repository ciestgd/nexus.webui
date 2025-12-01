import VectorTileLayer from 'ol/layer/VectorTile';
import { epaRegionSource, stateSource, countySource, censusTractSource, cbsaSource } from '../boundary-sources/index.js';
import { Style, Stroke, Fill } from 'ol/style';

export const getStyle = (width, color) => {
    return new Style({
        stroke: new Stroke({
            color: color,
            width: width,
        }),
        fill: new Fill({
            color: 'transparent',
        }),
    });
};
const defaultStyle = getStyle(0.5, '#000000');

export const cbsaLayer = new VectorTileLayer({
    title: 'CBSA (2018)',
    source: cbsaSource,
    visible: false,
    width: 2,
    color: '#000000',
    style: getStyle(2, '#000000'),
});
const boundaryGroud = [
    new VectorTileLayer({
        title: 'EPA Region (2017)',
        source: epaRegionSource,
        visible: false,
        width: 0.5,
        color: '#000000',
        style: defaultStyle,
    }),
    new VectorTileLayer({
        title: 'State (2021)',
        source: stateSource,
        visible: true,
        width: 0.5,
        color: '#000000',
        style: defaultStyle,
    }),
    new VectorTileLayer({
        title: 'County (2020)',
        source: countySource,
        visible: false,
        width: 0.5,
        color: '#000000',
        style: defaultStyle,
    }),
    // new VectorTileLayer({
    //     title: 'County (2017)',
    //     source: county2017Source,
    //     visible: false,
    //     width: 0.5,
    //     color: '#000000',
    //     style: defaultStyle,
    // }),
    cbsaLayer,
    // new VectorTileLayer({
    //     title: 'Census Tract (2019)',
    //     source: censusTract2019Source,
    //     visible: false,
    //     width: 0.5,
    //     color: '#000000',
    //     style: defaultStyle,
    //     zIndex: 4,
    // }),
    new VectorTileLayer({
        title: 'Census Tract (2020)',
        source: censusTractSource,
        visible: false,
        width: 0.5,
        color: '#000000',
        style: defaultStyle,
        zIndex: 4,
    }),
];
export default boundaryGroud;
