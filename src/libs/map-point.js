import { mapManager } from './map/map-manager.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import markerIcon from '@/assets/images/marker-icon.png';
import proximityMarkerIcon from '@/assets/images/proximity-marker.png';
import { RegularShape, Style, Fill, Stroke, Icon, Circle } from 'ol/style.js';
import { getStyleColor } from './color-list.js';
export const useMapPoints = () => {
    // 缓存多个图标的图层
    let ponitsLayer;
    // 缓存单个特定坐标图层
    let localLayer;
    let steps = 100;
    // 设置多个坐标
    const setMapLayer = (options, type, fn) => {
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
                geometry: new Point(fromLonLat([item.siteLon, item.siteLat])),
            });
            if (fn) {
                featureItem = fn(featureItem, item);
            }

            features.push(featureItem);
        });
        const vectorSource = new VectorSource({
            features: features,
        });
        const selectionLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 4,
            style: function (feature) {
                return getStyle(type, feature.get('ranking'), feature.get('value'));
            },
        });
        ponitsLayer = selectionLayer;
        mapIns.addLayer(ponitsLayer);
    };

    const getStyle = (type, index, value) => {
        // let colorStyle = value !== null ? getStyleColor(index, steps) : '204,204,204';
        // const stroke = new Stroke({
        //     color: `rgb(128, 128, 128)`,
        //     size: 2,
        // });
        const stroke = new Stroke({
            // color: `rgb(128, 128, 128)`,
            color: '#332288',
            size: 2,
        });
        // const fill = new Fill({
        //     color: `rgb(${colorStyle})`,
        // });
        const fill = new Fill({
            color: '#332288',
        });
        const styles = {
            triangle: new Style({
                image: new RegularShape({
                    points: 3,
                    radius: 10,
                    rotation: Math.PI,
                    angle: 0,
                    stroke: stroke,
                    fill: fill,
                }),
            }),
            start: new Style({
                image: new RegularShape({
                    points: 5,
                    radius1: 10,
                    radius2: 5,
                    stroke: stroke,
                    fill: fill,
                }),
            }),
            square: new Style({
                image: new RegularShape({
                    points: 4,
                    radius: 10,
                    angle: Math.PI / 4,
                    rotation: Math.PI / 4,
                    stroke: stroke,
                    fill: fill,
                }),
            }),
            rhombus: new Style({
                image: new RegularShape({
                    points: 4,
                    radius: 10,
                    angle: Math.PI / 4,
                    stroke: stroke,
                    fill: fill,
                }),
            }),
            circle: new Style({
                image: new Circle({
                    radius: 8,
                    fill: fill,
                    stroke: stroke,
                }),
            }),
        };
        return styles[type];
        // return type == 'circle' ? styles[type] : styles['triangle'];
    };

    const showMapLayer = (options, type, fn) => {
        let mapIns = mapManager.getMapIns();
        if (localLayer) {
            mapIns.removeLayer(localLayer);
            localLayer = null;
        }
        setMapLayer(options, type, fn);
    };
    const setOneMapIcon = (options, fn, isProximity = false) => {
        let mapIns = mapManager.getMapIns();
        if (localLayer) {
            mapIns.removeLayer(localLayer);
            localLayer = null;
        }
        if (options.length === 0) {
            return;
        }
        let features = [];
        options.forEach((item) => {
            let { siteLon, siteLat } = item;
            let feature = new Feature({
                geometry: new Point(fromLonLat([siteLon, siteLat])),
            });
            if (fn) {
                feature = fn(feature, item);
            }
            features.push(feature);
        });

        const vectorOneSource = new VectorSource({
            features: features,
        });
        const selectionOneLayer = new VectorLayer({
            source: vectorOneSource,
            zIndex: 4,
            style: function (feature) {
                return new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: isProximity ? proximityMarkerIcon : markerIcon,
                    }),
                });
            },
        });
        localLayer = selectionOneLayer;
        mapIns.addLayer(localLayer);
    };
    const clearMap = () => {
        let mapIns = mapManager.getMapIns();
        clearLocalLayer();
        if (ponitsLayer) {
            mapIns.removeLayer(ponitsLayer);
        }
    };
    const clearLocalLayer = () => {
        let mapIns = mapManager.getMapIns();
        if (localLayer) {
            mapIns.removeLayer(localLayer);
        }
    };
    const getPointsLayer = () => ponitsLayer;
    const getLocalLayer = () => localLayer;
    const setSteps = (val) => {
        steps = val;
    };
    return {
        getStyle,
        showMapLayer,
        setOneMapIcon,
        clearMap,
        getPointsLayer,
        setSteps,
        getLocalLayer,
        clearLocalLayer,
    };
};
