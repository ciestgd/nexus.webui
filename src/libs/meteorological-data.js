import Papa from 'papaparse';
import { mapManager } from './map/map-manager.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { RegularShape, Style, Fill, Stroke, Icon, Circle } from 'ol/style.js';
import http from './file-request';
const baseUrl = '/meteorologicalData/2017/';

const readFile = async (filePath) => {
    let result = await http.get(filePath);
    return result;
};

const getOptions = async (filepath) => {
    let list = [];
    let headList = [];
    let fileContent = await readFile(filepath);
    Papa.parse(fileContent, {
        complete: function (results) {
            let data = results.data;
            headList = data.shift();
            data.forEach((item) => {
                let obj = {};
                headList.forEach((key, index) => {
                    obj[key] = item[index];
                });
                list.push(obj);
            });
        },
    });
    return {
        headList,
        list,
    };
};
export const useMeteorologicalMapPoints = () => {
    let ponitsLayer;
    const setMapLayer = (options, fn) => {
        let mapIns = mapManager.getMapIns();
        if (ponitsLayer) {
            mapIns.removeLayer(ponitsLayer);
            ponitsLayer = null;
        }
        if (options.length === 0) {
            return;
        }
        const features = [];
        options.forEach((item) => {
            let featureItem = new Feature({
                geometry: new Point(fromLonLat([item.Longitude, item.Latitude])),
            });
            if (fn) {
                featureItem = fn(featureItem, item);
            }
            featureItem.set('StationID', item.StationID);
            featureItem.set('StationName', item.StationName);
            features.push(featureItem);
        });
        const vectorSource = new VectorSource({
            features: features,
        });
        const selectionLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 3,
            style: function (feature) {
                return getStyle();
            },
        });
        ponitsLayer = selectionLayer;
        mapIns.addLayer(ponitsLayer);
    };

    const getStyle = () => {
        const stroke = new Stroke({
            color: `rgb(128, 128, 128)`,
            size: 2,
        });
        const fill = new Fill({
            color: `green`,
        });
        const style = new Style({
            image: new Circle({
                radius: 6,
                fill: fill,
                stroke: stroke,
            }),
        });
        return style;
    };

    const showMapLayer = (options, fn) => {
        setMapLayer(options, fn);
    };

    const clearMap = () => {
        let mapIns = mapManager.getMapIns();

        if (ponitsLayer) {
            mapIns.removeLayer(ponitsLayer);
        }
    };
    const getPointsLayer = () => ponitsLayer;
    return {
        showMapLayer,
        clearMap,
        getPointsLayer,
    };
};
export const mapLayer = useMeteorologicalMapPoints();
export const getMeteorologicalSite = async () => {
    const fileName = 'meteorological_station_info.csv';
    let results = await getOptions(baseUrl + fileName);
    let options = results.list || [];
    return options;
};
export const getSiteDetail = (name) => {
    let filePath = baseUrl + 'hourlyData/' + name + '.csv';
    return getDetailData(filePath);
};
const getDetailData = async (fileName) => {
    let results = await getOptions(fileName);
    let data = {
        N: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        NNE: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        NE: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        ENE: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        E: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        ESE: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        SE: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        SSE: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        S: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        SSW: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        SW: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        WSW: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        W: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        WNW: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        NW: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
        NNW: {
            lessThree: [],
            threeToFour: [],
            fourToSix: [],
            overSix: [],
        },
    };
    let list = results.list || [];
    const filteWS = (item, option) => {
        let ws = item.WS;
        if (ws >= 0 && ws < 3) {
            option.lessThree.push(item);
        } else if (ws >= 3 && ws < 4) {
            option.threeToFour.push(item);
        } else if (ws >= 4 && ws < 6) {
            option.fourToSix.push(item);
        } else if (ws >= 6) {
            option.overSix.push(item);
        }
    };
    list.forEach((item) => {
        let wd = item.WD;
        if ((wd > 348.75 && wd < 360) || (wd >= 0 && wd <= 11.25)) {
            // N
            filteWS(item, data.N);
            // data.N.push(item);
        } else if (wd > 11.25 && wd <= 33.75) {
            // NNE
            filteWS(item, data.NNE);
            // data.NNE.push(item);
        } else if (wd > 33.75 && wd <= 56.25) {
            filteWS(item, data.NE);
            // data.NE.push(item);
        } else if (wd > 56.25 && wd <= 78.75) {
            filteWS(item, data.ENE);
            // data.ENE.push(item);
        } else if (wd > 78.75 && wd <= 101.25) {
            filteWS(item, data.E);
            // data.E.push(item);
        } else if (wd > 101.25 && wd <= 123.75) {
            filteWS(item, data.ESE);
            // data.ESE.push(item);
        } else if (wd > 123.75 && wd <= 146.25) {
            filteWS(item, data.SE);
            // data.SE.push(item);
        } else if (wd > 146.25 && wd <= 168.75) {
            filteWS(item, data.SSE);
            // data.SSE.push(item);
        } else if (wd > 168.75 && wd <= 191.25) {
            filteWS(item, data.S);
            // data.S.push(item);
        } else if (wd > 191.25 && wd <= 213.75) {
            filteWS(item, data.SSW);
            // data.SSW.push(item);
        } else if (wd > 213.75 && wd <= 236.25) {
            filteWS(item, data.SW);
            // data.SW.push(item);
        } else if (wd > 236.25 && wd <= 258.75) {
            filteWS(item, data.WSW);
            // data.WSW.push(item);
        } else if (wd > 258.75 && wd <= 281.25) {
            filteWS(item, data.W);
            // data.W.push(item);
        } else if (wd > 281.25 && wd <= 303.75) {
            filteWS(item, data.WNW);
            // data.WNW.push(item);
        } else if (wd > 303.75 && wd <= 326.25) {
            filteWS(item, data.NW);
            // data.NW.push(item);
        } else if (wd > 326.25 && wd <= 348.75) {
            filteWS(item, data.NNW);
            // data.NNW.push(item);
        }
    });

    return data;
};
