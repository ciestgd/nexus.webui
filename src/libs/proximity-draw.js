import markerIcon from '@/assets/images/proximity-marker.png';
import Point from 'ol/geom/Point.js';
import { mapManager } from './map/map-manager.js';
import VectorSource from 'ol/source/Vector.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import Feature from 'ol/Feature.js';
import { Style, Icon } from 'ol/style.js';
import { Draw } from 'ol/interaction.js';
import { createRegularPolygon, createBox } from 'ol/interaction/Draw';
import Circle from 'ol/geom/Circle.js';
import { useProximityAnalysisStore } from '../store/proximity-analysis.js';
export const useDrawCircle = () => {
    let localLayer;
    let circleLayer;
    let drawInteraction;
    let drawLayer;
    let interactionList = [];
    let radius = 5000;
    let circleList = [];
    let circleFetures = [];
    const drawSource = new VectorSource();
    const setCircle = (options) => {
        circleList = [];
        circleFetures = [];
        let mapIns = mapManager.getMapIns();
        if (circleLayer) {
            mapIns.removeLayer(circleLayer);
            circleLayer = null;
        }

        options.forEach((item) => {
            let circle = new Circle(item.center, radius);
            var circleFeature = new Feature({
                geometry: circle,
            });
            circleFeature.setStyle(
                new Style({
                    renderer(coordinates, state) {
                        const [[x, y], [x1, y1]] = coordinates;
                        const ctx = state.context;
                        const dx = x1 - x;
                        const dy = y1 - y;
                        const radius = Math.sqrt(dx * dx + dy * dy);
                        const innerRadius = 0;
                        const outerRadius = radius * 1.4;
                        const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
                        gradient.addColorStop(0, 'rgba(0,0,255,0)');
                        gradient.addColorStop(0.6, 'rgba(0,0,255,0.2)');
                        gradient.addColorStop(1, 'rgba(0,0,255,0.8)');
                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
                        ctx.fillStyle = gradient;
                        ctx.fill();

                        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
                        ctx.strokeStyle = 'rgba(0,0,255,1)';
                        ctx.stroke();
                    },
                })
            );
            circleFeature.set('siteId', item.id);
            circleFetures.push(circleFeature);
            circleList.push(circle);
        });
        const circleSource = new VectorSource({
            features: circleFetures,
        });

        const selectionCircleLayer = new VectorLayer({
            source: circleSource,
            zIndex: 3,
        });
        circleLayer = selectionCircleLayer;
        mapIns.addLayer(circleLayer);
    };

    const setMapIcon = (options) => {
        let mapIns = mapManager.getMapIns();
        if (localLayer) {
            mapIns.removeLayer(localLayer);
            localLayer = null;
        }
        const features = [];
        options.forEach((item) => {
            let featureItem = new Feature({
                geometry: new Point(item.center),
            });
            features.push(featureItem);
        });

        const vectorSource = new VectorSource({
            features: features,
        });

        const selectionLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 5,
            style: function (feature) {
                return new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: markerIcon,
                    }),
                });
            },
        });

        localLayer = selectionLayer;
        mapIns.addLayer(localLayer);
    };
    const clearMap = () => {
        let mapIns = mapManager.getMapIns();
        circleList.length = [];
        if (circleLayer) {
            mapIns.removeLayer(circleLayer);
        }
        if (localLayer) {
            mapIns.removeLayer(localLayer);
        }
        clearInteractionLayer();
    };
    const setRadius = (val) => {
        radius = val;
        if (circleFetures.length) {
            circleFetures.forEach((item) => {
                item.getGeometry().setRadius(radius);
            });
        }
    };
    const addInteraction = (type) => {
        let mapIns = mapManager.getMapIns();
        let drawType = type;
        clearInteractionLayer();
        if (!drawLayer) {
            drawLayer = new VectorLayer({
                source: drawSource,
                zIndex: 3,
                style: {
                    'stroke-color': 'rgba(100, 255, 0, 1)',
                    'stroke-width': 2,
                    'fill-color': 'rgba(100, 255, 0, 0.3)',
                },
            });
            mapIns.addLayer(drawLayer);
        }

        let drawObj = {
            source: drawLayer.getSource(),
            stopClick: true,
            style: {
                'stroke-color': 'rgba(255, 255, 100, 1)',
                'stroke-width': 2,
                'fill-color': 'rgba(255, 255, 100, 0.8)',
                'circle-radius': 8,
                'circle-fill-color': 'rgba(128,0,0, 0.5)',
            },
        };
        if (type === 'Square') {
            drawType = 'Circle';
            drawObj.geometryFunction = createRegularPolygon(4);
        } else if (type === 'Box') {
            drawType = 'Circle';
            drawObj.geometryFunction = createBox();
        } else if (type === 'Circle') {
            drawObj.geometryFunction = createRegularPolygon(32);
        }
        drawObj.type = drawType;
        drawInteraction = new Draw(drawObj);

        mapIns.addInteraction(drawInteraction);
        drawInteraction.on('drawstart', function (event) {
            const proximityAnalysisStore = useProximityAnalysisStore();
            proximityAnalysisStore.isDrawing = true;
            interactionList.length = [];
            drawSource.clear();
        });
        drawInteraction.on('drawend', function (event) {
            const proximityAnalysisStore = useProximityAnalysisStore();
            proximityAnalysisStore.isDrawing = false;
            var feature = event.feature;
            interactionList.push(feature);
        });
    };
    const removeInteraction = () => {
        let mapIns = mapManager.getMapIns();
        mapIns.removeInteraction(drawInteraction);
    };
    const abortDrawing = () => {
        if (drawInteraction) {
            const proximityAnalysisStore = useProximityAnalysisStore();
            proximityAnalysisStore.isDrawing = false;
            drawInteraction.abortDrawing();
        }
    };
    const getCircleList = () => circleFetures;
    const getInteractionList = () => interactionList;
    const clearInteractionLayer = () => {
        let mapIns = mapManager.getMapIns();
        drawSource.clear();
        interactionList.length = [];
        removeInteraction();
        if (drawLayer) {
            mapIns.removeLayer(drawLayer);
            drawLayer = null;
        }
    };
    return {
        setMapIcon,
        setCircle,
        setRadius,
        getCircleList,
        clearMap,
        clearInteractionLayer,
        addInteraction,
        removeInteraction,
        getInteractionList,
        abortDrawing,
    };
};
