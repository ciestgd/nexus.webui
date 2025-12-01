import VectorTileLayer from 'ol/layer/VectorTile';
import { countySource, censusTractSource } from '../boundary-sources/index.js';
import { Style, Fill, Stroke } from 'ol/style';
import { pm25GeoIdSet, pm25DV_GeoIdSet, o3GeoIdSet, o3DV_GeoIdSet, toxicsGeoIdSet, ejGeoIdSet, heatIndexGeoIdSet } from '../../geoid-cache';
import { useDataScaleStore } from '../../../store/data-scale';
import { useZoomSelectorStore } from '../../../store/zoom-selector';
import { useLegendColorStore } from '@/store/legend-color';
import { getEpaRegionId, getCbsaId } from '@/libs/geoId-enums';
import { getCensusTractDetail } from '@/libs/census-tract-all-data.js'
const size = 8;
const space = 0.3;

// cc:0.8   bf:0.75 b2: 0.70
let pm25Color = '#fd0000b2';
let pm25_o3Color = '#c500ffb2';
let o3Color = '#0071fdb2';
let o3_toxicsColor = '#4ce700b2';
let toxicsColor = '#fffe00b2';
let pm25_toxicsColor = '#fd6900b2';
let pm25_o3_toxicsColor = '#000000b2';
let ejColor = '#88BF6Cb2';
let heatIndexColor = '#c84200b2'; // '#d14500'

let pm25Width = 0.5;
let pm25_o3Width = 0.5;
let o3Width = 0.5;
let o3_toxicsWidth = 0.5;
let toxicsWidth = 0.5;
let pm25_toxicsWidth = 0.5;
let pm25_o3_toxicsWidth = 0.5;
let ejWidth = 0.5;
let heatIndexWidth = 0.5;

const makeEjPattern = (fillColor) => {
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    cnv.width = size;
    cnv.height = size;

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, size, size);
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(space, size - space);
    ctx.lineTo(size - space, space);
    ctx.strokeStyle = ejColor;
    ctx.stroke();

    return ctx.createPattern(cnv, 'repeat');
};
const makeHeatIndexPattern = (fillColor) => {
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    cnv.width = size;
    cnv.height = size;

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, size, size);
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(space, space);
    ctx.lineTo(size, size);
    ctx.strokeStyle = heatIndexColor;
    ctx.stroke();

    return ctx.createPattern(cnv, 'repeat');
};
const makeEjAndHeatIndexPattern = (fillColor) => {
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    cnv.width = size;
    cnv.height = size;

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, size, size);
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(space, size - space);
    ctx.lineTo(size - space, space);
    ctx.strokeStyle = ejColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(space, space);
    ctx.lineTo(size, size);
    ctx.strokeStyle = heatIndexColor;
    ctx.stroke();

    return ctx.createPattern(cnv, 'repeat');
};
// const makePattern = (fillColor) => {
//     const cnv = document.createElement('canvas');
//     const ctx = cnv.getContext('2d');
//     cnv.width = size;
//     cnv.height = size;

//     ctx.fillStyle = fillColor;
//     ctx.fillRect(0, 0, size, size);

//     ctx.globalCompositeOperation = 'source-over';

//     ctx.fillStyle = 'green';
//     for (let i = 0; i < size; i++) {
//         ctx.fillRect(i, size - i, 0.8, 1.2);
//     }

//     return ctx.createPattern(cnv, 'repeat');
// };

const getStyles = () => {
    return {
        pm25: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25Width,
            }),
            fill: new Fill({
                color: pm25Color,
            }),
        }),
        pm25_o3: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_o3Width,
            }),
            fill: new Fill({
                color: pm25_o3Color,
            }),
        }),
        o3: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3Width,
            }),
            fill: new Fill({
                color: o3Color,
            }),
        }),
        o3_toxics: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3_toxicsWidth,
            }),
            fill: new Fill({
                color: o3_toxicsColor,
            }),
        }),
        toxics: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: toxicsWidth,
            }),
            fill: new Fill({
                color: toxicsColor,
            }),
        }),
        pm25_toxics: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_toxicsWidth,
            }),
            fill: new Fill({
                color: pm25_toxicsColor,
            }),
        }),
        pm25_o3_toxics: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_o3_toxicsWidth,
            }),
            fill: new Fill({
                color: pm25_o3_toxicsColor,
            }),
        }),

        ej: new Style({
            fill: new Fill({
                color: makeEjPattern(),
            }),
            stroke: new Stroke({
                color: '#808080',
                width: ejWidth,
            }),
        }),
        pm25_ej: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25Width,
            }),
            fill: new Fill({
                color: makeEjPattern(pm25Color),
            }),
        }),
        pm25_o3_ej: new Style({
            fill: new Fill({
                color: makeEjPattern(pm25_o3Color),
            }),
        }),
        o3_ej: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3Width,
            }),
            fill: new Fill({
                color: makeEjPattern(o3Color),
            }),
        }),
        o3_toxics_ej: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3_toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjPattern(o3_toxicsColor),
            }),
        }),
        toxics_ej: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjPattern(toxicsColor),
            }),
        }),
        pm25_toxics_ej: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjPattern(pm25_toxicsColor),
            }),
        }),
        pm25_o3_toxics_ej: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_o3_toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjPattern(pm25_o3_toxicsColor),
            }),
        }),

        heatIndex: new Style({
            fill: new Fill({
                color: makeHeatIndexPattern(),
            }),
            stroke: new Stroke({
                color: '#808080',
                width: heatIndexWidth,
            }),
        }),
        pm25_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25Width,
            }),
            fill: new Fill({
                color: makeHeatIndexPattern(pm25Color),
            }),
        }),
        pm25_o3_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_o3Width,
            }),
            fill: new Fill({
                color: makeHeatIndexPattern(pm25_o3Color),
            }),
        }),
        o3_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3Width,
            }),
            fill: new Fill({
                color: makeHeatIndexPattern(o3Color),
            }),
        }),
        o3_toxics_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3_toxicsWidth,
            }),
            fill: new Fill({
                color: makeHeatIndexPattern(o3_toxicsColor),
            }),
        }),
        toxics_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: toxicsWidth,
            }),
            fill: new Fill({
                color: makeHeatIndexPattern(toxicsColor),
            }),
        }),
        pm25_toxics_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_toxicsWidth,
            }),
            fill: new Fill({
                color: makeHeatIndexPattern(pm25_toxicsColor),
            }),
        }),
        pm25_o3_toxics_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_o3_toxicsWidth,
            }),
            fill: new Fill({
                color: makeHeatIndexPattern(pm25_o3_toxicsColor),
            }),
        }),

        ej_heatIndex: new Style({
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(),
            }),
            stroke: new Stroke({
                color: '#808080',
                width: heatIndexWidth,
            }),
        }),
        pm25_ej_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25Width,
            }),
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(pm25Color),
            }),
        }),
        pm25_o3_ej_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_o3Width,
            }),
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(pm25_o3Color),
            }),
        }),
        o3_ej_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3Width,
            }),
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(o3Color),
            }),
        }),
        o3_toxics_ej_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: o3_toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(o3_toxicsColor),
            }),
        }),
        toxics_ej_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(toxicsColor),
            }),
        }),
        pm25_toxics_ej_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(pm25_toxicsColor),
            }),
        }),
        pm25_o3_toxics_ej_heatIndex: new Style({
            stroke: new Stroke({
                color: '#808080',
                width: pm25_o3_toxicsWidth,
            }),
            fill: new Fill({
                color: makeEjAndHeatIndexPattern(pm25_o3_toxicsColor),
            }),
        }),
    };
};

let styles = getStyles();
export const setColor = (array, lineArray) => {
    pm25Color = array[0];
    pm25_o3Color = array[1];
    o3Color = array[2];
    o3_toxicsColor = array[3];
    toxicsColor = array[4];
    pm25_toxicsColor = array[5];
    pm25_o3_toxicsColor = array[6];
    ejColor = array[7];
    heatIndexColor = array[8];

    pm25Width = lineArray[0];
    pm25_o3Width = lineArray[1];
    o3Width = lineArray[2];
    o3_toxicsWidth = lineArray[3];
    toxicsWidth = lineArray[4];
    pm25_toxicsWidth = lineArray[5];
    pm25_o3_toxicsWidth = lineArray[6];
    ejWidth = lineArray[7];
    heatIndexWidth = lineArray[8];
    styles = getStyles();
};

const overlayer = new VectorTileLayer({
    source: countySource,
    visible: false,
});

export default overlayer;

const getCountyStyle = (geoId5) => {
    if (pm25GeoIdSet.has(geoId5)) {
        if (o3GeoIdSet.has(geoId5)) {
            if (toxicsGeoIdSet.has(geoId5)) {
                if (ejGeoIdSet.has(geoId5)) {
                    // all
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_o3_toxics_ej_heatIndex : styles.pm25_o3_toxics_ej;
                } else {
                    // no ej
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_o3_toxics_heatIndex : styles.pm25_o3_toxics;
                }
            } else {
                if (ejGeoIdSet.has(geoId5)) {
                    // no toxics
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_o3_ej_heatIndex : styles.pm25_o3_ej;
                } else {
                    // no toxics ej
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_o3_heatIndex : styles.pm25_o3;
                }
            }
        } else {
            if (toxicsGeoIdSet.has(geoId5)) {
                if (ejGeoIdSet.has(geoId5)) {
                    // no o3
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_toxics_ej_heatIndex : styles.pm25_toxics_ej;
                } else {
                    // no o3 ej
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_toxics_heatIndex : styles.pm25_toxics;
                }
            } else {
                if (ejGeoIdSet.has(geoId5)) {
                    // no o3 toxics
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_ej_heatIndex : styles.pm25_ej;
                } else {
                    // no o3 toxics ej
                    return heatIndexGeoIdSet.has(geoId5) ? styles.pm25_heatIndex : styles.pm25;
                }
            }
        }
    } else if (o3GeoIdSet.has(geoId5)) {
        if (toxicsGeoIdSet.has(geoId5)) {
            if (ejGeoIdSet.has(geoId5)) {
                // no pm25
                return heatIndexGeoIdSet.has(geoId5) ? styles.o3_toxics_ej_heatIndex : styles.o3_toxics_ej;
            } else {
                // no pm25 ej
                return heatIndexGeoIdSet.has(geoId5) ? styles.o3_toxics_heatIndex : styles.o3_toxics;
            }
        } else {
            if (ejGeoIdSet.has(geoId5)) {
                // no pm25 toxics
                return heatIndexGeoIdSet.has(geoId5) ? styles.o3_ej_heatIndex : styles.o3_ej;
            } else {
                // no pm25 toxics ej
                return heatIndexGeoIdSet.has(geoId5) ? styles.o3_heatIndex : styles.o3;
            }
        }
    } else if (toxicsGeoIdSet.has(geoId5)) {
        if (ejGeoIdSet.has(geoId5)) {
            // no pm25 o3
            return heatIndexGeoIdSet.has(geoId5) ? styles.toxics_ej_heatIndex : styles.toxics_ej;
        } else {
            // no pm25 o3 ej
            return heatIndexGeoIdSet.has(geoId5) ? styles.toxics_heatIndex : styles.toxics;
        }
    } else if (ejGeoIdSet.has(geoId5)) {
        // no pm25 o3 toxics
        return heatIndexGeoIdSet.has(geoId5) ? styles.ej_heatIndex : styles.ej;
    } else if (heatIndexGeoIdSet.has(geoId5)) {
        return styles.heatIndex;
    }
};

const getCensusTractStyle = (geoId11, geoId5) => {
    if (pm25GeoIdSet.has(geoId11) || pm25DV_GeoIdSet.has(geoId5)) {
        if (o3GeoIdSet.has(geoId11) || o3DV_GeoIdSet.has(geoId5)) {
            if (toxicsGeoIdSet.has(geoId11)) {
                if (ejGeoIdSet.has(geoId11)) {
                    // all
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_o3_toxics_ej_heatIndex : styles.pm25_o3_toxics_ej;
                } else {
                    // no ej
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_o3_toxics_heatIndex : styles.pm25_o3_toxics;
                }
            } else {
                if (ejGeoIdSet.has(geoId11)) {
                    // no toxics
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_o3_ej_heatIndex : styles.pm25_o3_ej;
                } else {
                    // no toxics ej
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_o3_heatIndex : styles.pm25_o3;
                }
            }
        } else {
            if (toxicsGeoIdSet.has(geoId11)) {
                if (ejGeoIdSet.has(geoId11)) {
                    // no o3
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_toxics_ej_heatIndex : styles.pm25_toxics_ej;
                } else {
                    // no o3 ej
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_toxics_heatIndex : styles.pm25_toxics;
                }
            } else {
                if (ejGeoIdSet.has(geoId11)) {
                    // no o3 toxics
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_ej_heatIndex : styles.pm25_ej;
                } else {
                    // no o3 toxics ej
                    return heatIndexGeoIdSet.has(geoId11) ? styles.pm25_heatIndex : styles.pm25;
                }
            }
        }
    } else if (o3GeoIdSet.has(geoId11) || o3DV_GeoIdSet.has(geoId5)) {
        if (toxicsGeoIdSet.has(geoId11)) {
            if (ejGeoIdSet.has(geoId11)) {
                // no pm25
                return heatIndexGeoIdSet.has(geoId11) ? styles.o3_toxics_ej_heatIndex : styles.o3_toxics_ej;
            } else {
                // no pm25 ej
                return heatIndexGeoIdSet.has(geoId11) ? styles.o3_toxics_heatIndex : styles.o3_toxics;
            }
        } else {
            if (ejGeoIdSet.has(geoId11)) {
                // no pm25 toxics
                return heatIndexGeoIdSet.has(geoId11) ? styles.o3_ej_heatIndex : styles.o3_ej;
            } else {
                // no pm25 toxics ej
                return heatIndexGeoIdSet.has(geoId11) ? styles.o3_heatIndex : styles.o3;
            }
        }
    } else if (toxicsGeoIdSet.has(geoId11)) {
        if (ejGeoIdSet.has(geoId11)) {
            // no pm25 o3
            return heatIndexGeoIdSet.has(geoId11) ? styles.toxics_ej_heatIndex : styles.toxics_ej;
        } else {
            // no pm25 o3 ej
            return heatIndexGeoIdSet.has(geoId11) ? styles.toxics_heatIndex : styles.toxics;
        }
    } else if (ejGeoIdSet.has(geoId11)) {
        // no pm25 o3 toxics
        return heatIndexGeoIdSet.has(geoId11) ? styles.ej_heatIndex : styles.ej;
    } else if (heatIndexGeoIdSet.has(geoId11)) {
        return styles.heatIndex;
    }
};

export const setOverlayerStyle = () => {
    const isNotInZoom = useZoomSelectorStore().isNotInZoom;
    overlayer.setVisible(useLegendColorStore().checkList.length > 0);
    if (useDataScaleStore().dataScale === 0) {
        overlayer.setSource(countySource);

        if (isNotInZoom) {
            overlayer.setStyle((feature) => {
                const geoId5 = feature.getId();
                let regionId = getEpaRegionId(geoId5);
                let cbsaId = getCbsaId(geoId5);
                const args = [regionId, geoId5.substr(0, 2), cbsaId, geoId5];
                if (isNotInZoom(args)) {
                    return;
                }
                return getCountyStyle(geoId5);
            });
        } else {
            overlayer.setStyle((feature) => {
                const geoId5 = feature.getId();
                return getCountyStyle(geoId5);
            });
        }
    } else {
        overlayer.setSource(censusTractSource);

        if (isNotInZoom) {
            overlayer.setStyle((feature) => {
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

                return getCensusTractStyle(geoId11, geoId5);
            });
        } else {
            overlayer.setStyle((feature) => {
                const geoId11 = feature.getId();
                const geoId5 = geoId11.substr(0, 5);
                return getCensusTractStyle(geoId11, geoId5);
            });
        }
    }
};
