import Point from 'ol/geom/Point.js';
import { Style, Stroke } from 'ol/style.js';
import VectorTileLayer from 'ol/layer/VectorTile';
import { mapManager } from '@/libs/map/map-manager.js';
import { epaRegionSource, stateSource, countySource, cbsaSource } from '@/libs/map/boundary-sources/index.js';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
let selectedId;
export const useZoomSelect = () => {
    const selectionLayer = new VectorTileLayer({
        map: null,
        renderMode: 'vector',
        source: null,
        visible: false,
        zIndex: 1,
        style: (feature) => {
            if (feature.getId() === selectedId) {
                return new Style({
                    stroke: new Stroke({
                        color: 'blue',
                        width: 2,
                    }),
                });
            }
        },
    });
    const handleZoom = (model, optionValue) => {
        const zoomSelectorStore = useZoomSelectorStore();
        const mapIns = mapManager.getMapIns();
        const view = mapIns.getView();
        let modelNames = [];
        if (!optionValue) {
            view.fit(new Point(mapManager.initCenter), { minResolution: 4000, duration: 1000 });
            selectedId = null;
            selectionLayer.setVisible(false);
            zoomSelectorStore.nameList = [];
            return;
        }

        let id;
        let minResolution;
        let layerSource;

        if (model[3] !== undefined) {
            id = model[3];
            minResolution = 500;
            layerSource = countySource;
            modelNames[3] = optionValue.name;
            modelNames[1] = optionValue.stateAbbrName;
        } else if (model[2] !== undefined) {
            id = model[2];
            minResolution = 500;
            layerSource = cbsaSource;
            modelNames[2] = optionValue.name;
        } else if (model[1] !== undefined) {
            id = model[1];
            minResolution = id === '02' ? 5000 : 2000;
            layerSource = stateSource;
            modelNames[1] = optionValue.abbrName;
        } else if (model[0] !== undefined) {
            id = model[0];
            minResolution = id === '10' ? 12000 : 2000;
            layerSource = epaRegionSource;
            modelNames[0] = 'EPA Region ' + optionValue.id;
        }
        zoomSelectorStore.nameList = modelNames;
        selectedId = id;
        selectionLayer.setMap(mapIns);
        selectionLayer.setSource(layerSource);
        if (selectionLayer.getVisible()) {
            selectionLayer.changed();
        } else {
            selectionLayer.setVisible(true);
        }

        view.fit(new Point([optionValue.centerLon, optionValue.centerLat]), { duration: 1000, minResolution: minResolution });
    };
    return {
        handleZoom,
    };
};
