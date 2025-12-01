import { mapManager } from './map/map-manager.js';
import { useMajorEissionStore } from '../store/major-eission-sources.js';
import { useMonitorSiteStore } from '../store/monitor-site.js';
import { useProximityAnalysisStore } from '../store/proximity-analysis.js';
import { useEJReportStore } from '../store/ejscreen-report.js';
import { useSidebarStore } from '../store/sidebar.js';
import { useAirToxicStore } from '@/store/air-toxic.js';
import { useAdvancedOptionStore } from '@/store/advanced-option.js';
import { Style, Stroke } from 'ol/style.js';
import { cbsaLayer } from '@/libs/map/layers/boundary-layers';
import overlayer from '@/libs/map/layers/overlayer';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorLayer from 'ol/layer/Vector';
import blockLayer from '@/libs/map/layers/block-layer';

export const selectionLayer = new VectorTileLayer({
    map: null,
    renderMode: 'vector',
    source: null,
    zIndex: 4,
    visible: false,
    style: (feature) => {
        let id = feature.getId();
        const proximityAnalysisStore = useProximityAnalysisStore();
        if (id === proximityAnalysisStore.selectedGeoId || proximityAnalysisStore.censusTracts.indexOf(id) !== -1) {
            return new Style({
                stroke: new Stroke({
                    color: 'rgba(0,0,254,0.8)',
                    width: 4,
                }),
            });
        }
    },
});
const blockSelectionLayer = new VectorLayer({
    map: null,
    renderMode: 'vector',
    source: null,
    zIndex: 6,
    visible: false,
    style: (feature) => {
        let id = feature.get('Block_ID');
        const airToxicStore = useAirToxicStore();
        if (id === airToxicStore.selectBlockId) {
            return new Style({
                stroke: new Stroke({
                    color: 'rgba(0,0,254,0.8)',
                    width: 4,
                }),
            });
        }
    },
});
export const setupMapClick = () => {
    const mapIns = mapManager.getMapIns();
    const majorEissionStore = useMajorEissionStore();
    const monitorSiteStore = useMonitorSiteStore();
    const proximityAnalysisStore = useProximityAnalysisStore();
    const ejReportStore = useEJReportStore();
    const sidebarStore = useSidebarStore();
    const airToxicStore = useAirToxicStore();
    const advancedOptionStore = useAdvancedOptionStore();

    let timer = null;

    const addClickHighlightStyle = (geoid, layer) => {
        if (proximityAnalysisStore.selectedGeoId === geoid) {
            proximityAnalysisStore.selectedGeoId = null;
            selectionLayer.setVisible(false);
        } else {
            proximityAnalysisStore.selectedGeoId = geoid;
            selectionLayer.setMap(mapIns);
            selectionLayer.setSource(layer.getSource());
            if (selectionLayer.getVisible()) {
                selectionLayer.changed();
            } else {
                selectionLayer.setVisible(true);
            }
        }
    };

    const handleMapClick = (event) => {
        event.map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
            let geoid = feature.getId();
            if (layer == blockLayer) {
                let blockId = feature.get('Block_ID');
                if (airToxicStore.selectBlockId === blockId) {
                    airToxicStore.selectBlockId = null;
                    blockSelectionLayer.setVisible(false);
                    airToxicStore.handleAirToxicBlockMapClick(feature, event, false);
                } else {
                    airToxicStore.selectBlockId = blockId;
                    blockSelectionLayer.setMap(mapIns);
                    blockSelectionLayer.setSource(blockLayer.getSource());
                    if (blockSelectionLayer.getVisible()) {
                        blockSelectionLayer.changed();
                    } else {
                        blockSelectionLayer.setVisible(true);
                    }
                    airToxicStore.handleAirToxicBlockMapClick(feature, event, true);
                }
            }
            if (!geoid || geoid.length < 5) {
                return true;
            }
            if (layer === cbsaLayer) {
                let name = feature.get('name');
                ejReportStore.handleCBSASelect(geoid, name);
                return true;
            }
            addClickHighlightStyle(geoid, layer);
            if (geoid.length === 11) {
                proximityAnalysisStore.siteType = 'censusTract';
                if (proximityAnalysisStore.isShift) {
                    proximityAnalysisStore.handleCensusTractSelect(geoid);
                    return true;
                }
                ejReportStore.handleCensusTractSelect(geoid);
            } else {
                let name = feature.get('name');
                ejReportStore.handleCountySelect(geoid, name);
            }

            if (sidebarStore.activeGeoId === geoid && sidebarStore.activeTabName === 'info') {
                airToxicStore.handleAirToxicBlock(null);
                sidebarStore.activeGeoId = null;
                sidebarStore.handleInfoData();
                sidebarStore.activeTabName = 'home';
            } else {
                airToxicStore.handleAirToxicBlock(geoid);
                sidebarStore.activeGeoId = geoid;
                sidebarStore.handleInfoData();
            }

            return true;
        });
    };
    const handleMapDBclick = (event) => {
        event.map.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
            let geoid = feature.getId();
            if (!geoid || geoid.length < 5) {
                return true;
            }
            if (overlayer === layer) {
                event.stopPropagation();
                addClickHighlightStyle(geoid, layer);
                if (geoid.length === 11 && advancedOptionStore.advancedMode) {
                    proximityAnalysisStore.siteType = 'censusTract';
                    proximityAnalysisStore.siteData = geoid;
                    proximityAnalysisStore.showProximityAnalysis();
                }
            }
        });
    };
    const shiftListen = () => {
        document.onkeydown = (e) => {
            if (e.key === 'Shift') {
                e.preventDefault();
                proximityAnalysisStore.isShift = true;
            }
            if (e.key === 'Escape') {
                if (proximityAnalysisStore.isDrawing) {
                    proximityAnalysisStore.isEsc = true;
                }
                if (ejReportStore.isDrawing) {
                    ejReportStore.isEsc = true;
                }
            }
        };
        document.onkeyup = (e) => {
            if (e.key === 'Shift') {
                e.preventDefault();
                proximityAnalysisStore.isShift = false;
            }
            if (e.key === 'Escape') {
                proximityAnalysisStore.isEsc = false;
            }
        };
    };
    mapIns.on('click', (event) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            handleMapClick(event);
            majorEissionStore.onMapClickFn(event);
            monitorSiteStore.onMapClickFn(event);
        }, 500);
    });
    mapIns.on('dblclick', (event) => {
        if (timer) {
            clearTimeout(timer);
        }
        handleMapDBclick(event);
        majorEissionStore.onMapDBClick(event);
        monitorSiteStore.onMapDBClick(event);
    });
    shiftListen();
};
