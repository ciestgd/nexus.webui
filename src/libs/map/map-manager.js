import { createVNode, render } from 'vue';
import { Map, View } from 'ol';
import { Style, Stroke } from 'ol/style';
import Group from 'ol/layer/Group';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorLayer from 'ol/layer/Vector';
// import LayerSwitcher from 'ol-layerswitcher';
import overlayer from './layers/overlayer';
import baseLayers from './layers/base-layers';
import blockLayer from './layers/block-layer';
import boundaryLayers from './layers/boundary-layers';
import areaLayers from './layers/area-layers';
// import climateRiskLayers from './layers/climate-risk-layers';
import ejReportLayers from './layers/ej-report-layers';
import ContextMenu from 'ol-contextmenu';
import ScaleLine from 'ol/control/ScaleLine';
import { Control, defaults as defaultControls } from 'ol/control.js';
import { getAllGeoIds } from '../geoid-cache';
import { useMonitorSiteStore } from '../../store/monitor-site';
import { useMajorEissionStore } from '../../store/major-eission-sources';
import { useMeteorologicalSite } from '../../store/meteorological-site';
import { useSaveImageStore } from '../../store/save-image';
import { useProximityAnalysisStore } from '../../store/proximity-analysis';
import { useZoomSelectorStore } from '../../store/zoom-selector';
import { useSidebarStore } from '@/store/sidebar';
import { useAdvancedOptionStore } from '@/store/advanced-option';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import { useDrawerStore } from '@/store/drawer';
import { useViewCurrentDataStore } from '@/store/view-current-data';
import { clearAllDialog } from '@/libs/utils';
import Icon from '@/components/Icon.vue';
import ZoomSilder from '@/components/ZoomSlider/index.vue';
let mapIns;

const addScaleLine = () => {
    // 创建比例尺控件
    const scaleLine = new ScaleLine({
        units: 'metric', // 指定单位制（可选值有 'metric', 'imperial', 'nautical'）
    });
    // 将比例尺控件添加到地图中
    mapIns.addControl(scaleLine);
};

// const addLayerSwitcher = (tooltip) => {
//     const layerSwitcher = new LayerSwitcher({
//         reverse: false,
//         activationMode: 'mouseover',
//         label: 'Base Map',
//         tipLabel: 'Open layer switcher',
//         collapseTipLabel: 'Close layer switcher',
//     });
//     layerSwitcher.once('show', (evt) => {
//         evt.target.element.addEventListener('pointermove', (e) => {
//             e.stopPropagation();
//         });
//     });
//     layerSwitcher.on('show', (evt) => {
//         tooltip.visible = false;
//     });
//     mapIns.addControl(layerSwitcher);
// };

const addHighlightStyle = (tooltip) => {
    const highlightStyle = new Style({
        stroke: new Stroke({
            color: 'rgba(200,20,20,1)',
            width: 2,
        }),
    });

    // lookup for selection object
    let selectedId;

    // Selection
    const selectionLayer = new VectorTileLayer({
        map: mapIns,
        renderMode: 'vector',
        source: null,
        zIndex: 4,
        style: (feature) => {
            if (feature.getId() === selectedId) {
                return highlightStyle;
            }
        },
    });
    const blockSelectionLayer = new VectorLayer({
        map: mapIns,
        renderMode: 'vector',
        source: null,
        zIndex: 6,
        // visible: false,
        style: (feature) => {
            let id = feature.get('Block_ID');
            if (id === selectedId) {
                return highlightStyle;
            }
        },
    });
    const clear = () => {
        tooltip.visible = false;
        selectedId = null;
        selectionLayer.changed();
        blockSelectionLayer.changed();
    };

    mapIns.on('pointermove', (event) => {
        let needClear = !!selectedId;
        mapIns.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
            const id = feature.getId();
            const blockId = feature.get('Block_ID');
            if (!layer || (!id && !blockId)) {
                return true;
            }

            needClear = false;

            tooltip.position = DOMRect.fromRect({
                width: 0,
                height: 0,
                x: event.originalEvent.clientX,
                y: event.originalEvent.clientY,
            });

            let isCensusTract = false;
            let isCounty = false;
            if (id) {
                let idList = getAllGeoIds();
                let geoId5 = id.substr(0, 5);
                isCensusTract = idList.indexOf(id) !== -1;
                isCounty = idList.indexOf(geoId5) !== -1;
                if (selectedId == id || (!isCensusTract && !isCounty)) {
                    return true;
                }
                let content = '';
                const name = feature.get('name') || id;

                if (isCensusTract || isCounty) {
                    let label = id.length === 5 ? 'County' : 'Tract';
                    content += label + ': ' + name + '<br/>';
                    content += 'Click to show detail <br/>';
                }

                tooltip.content = content;
                tooltip.visible = isCensusTract || isCounty;
                selectedId = id;
                selectionLayer.setSource(layer.getSource());
                selectionLayer.changed();
            } else {
                if (selectedId == blockId) {
                    return true;
                }
                selectedId = blockId;
                blockSelectionLayer.setSource(layer.getSource());
                blockSelectionLayer.changed();
            }

            return true;
        });

        if (needClear) {
            clear();
        }
    });
};

// const addClickHighlightStyle = () => {
//     const highlightStyle = new Style({
//         stroke: new Stroke({
//             color: 'rgba(0,0,254,0.8)',
//             width: 4,
//         }),
//     });
//     let selectedId;

//     // Selection
//     const selectionLayer = new VectorTileLayer({
//         map: mapIns,
//         renderMode: 'vector',
//         source: null,
//         zIndex: 4,
//         style: (feature) => {
//             if (feature.getId() === selectedId) {
//                 return highlightStyle;
//             }
//         },
//     });

//     const clear = () => {
//         selectedId = null;
//         selectionLayer.changed();
//     };

//     mapIns.on('click', (event) => {
//         mapIns.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
//             const id = feature.getId();
//             if (!layer || !id || id.length < 5) {
//                 return true;
//             }
//             if (selectedId == id) {
//                 clear();
//                 return true;
//             }
//             selectedId = id;
//             selectionLayer.setSource(layer.getSource());
//             selectionLayer.changed();

//             return true;
//         });
//     });
// };

const clearAllFunction = () => {
    const monitorSiteStore = useMonitorSiteStore();
    const majorEissionStore = useMajorEissionStore();
    const proximityAnalysisStore = useProximityAnalysisStore();
    const drawerStore = useDrawerStore();
    const proximityAnalysisStoreLayer = proximityAnalysisStore.layer;
    majorEissionStore.clearMajorData();
    majorEissionStore.isShow = false;
    monitorSiteStore.clearMonitorData();
    monitorSiteStore.isShow = false;
    proximityAnalysisStoreLayer.clearMap();
    proximityAnalysisStore.isShow = false;
    drawerStore.rtlName = '';
    const meteorologicalSite = useMeteorologicalSite();
    const meteorologicalSiteLayer = meteorologicalSite.layer;
    meteorologicalSite.isShow = false;
    meteorologicalSiteLayer.clearMap();
    clearAllDialog();
};

const resetDomain = () => {
    const zoomSelectorStore = useZoomSelectorStore();
    if (zoomSelectorStore.isZoomIn) {
        zoomSelectorStore.model = [];
        zoomSelectorStore.isClear = true;
    }
};
const setDefaultConfiguration = () => {
    const sidebarStore = useSidebarStore();
    sidebarStore.handleSetDefault();
};
const setDefaultBaseMap = () => {
    const advancedOptionStore = useAdvancedOptionStore();
    let option = localStorage.getItem('advancedOption');
    if (option) {
        advancedOptionStore.option = JSON.parse(option);
    }
};
const setDefaultMapLayer = () => {
    const myLayerColorStore = useMyLayerColorStore();
    myLayerColorStore.handleResetMapLayer();
    myLayerColorStore.isResetLayer = true;
};
const resetViewCurrentData = () => {
    const viewCurrentDataStore = useViewCurrentDataStore();
    viewCurrentDataStore.isShowDefault = true;
};
const addContextmenu = (tooltip) => {
    const contextmenu = new ContextMenu({
        width: 226,
        defaultItems: false, // defaultItems are (for now) Zoom In/Zoom Out
        items: [
            {
                text: 'Clear all functions',
                callback: () => {
                    clearAllFunction();
                },
            },

            '-',
            {
                text: 'Reset All',
                callback: () => {
                    clearAllFunction();
                    setDefaultBaseMap();
                    resetDomain();
                    setDefaultConfiguration();
                    setDefaultMapLayer();
                    resetViewCurrentData();
                },
            },
            {
                text: 'Reset Area',
                callback: () => {
                    resetDomain();
                },
            },
            {
                text: 'Save Image to Clipboard',
                callback: () => {
                    const saveImageStore = useSaveImageStore();
                    saveImageStore.isSave = true;
                },
            },
        ],
    });
    contextmenu.once('open', (evt) => {
        evt.target.element.addEventListener('pointermove', (e) => {
            e.stopPropagation();
        });
    });
    contextmenu.on('open', (evt) => {
        tooltip.visible = false;
    });
    mapIns.addControl(contextmenu);
    document.body.appendChild(contextmenu.element);
};
class ResetZoomControl extends Control {
    constructor(opt_options) {
        const options = opt_options || {};

        const button = document.createElement('button');
        const vNode = createVNode(Icon, {
            name: 'house',
            size: '22px',
            class: `icon-button icon`,
        });

        const element = document.createElement('div');
        button.title = 'Reset to default map extent.';
        element.className = 'rotate-north ol-unselectable ol-control';
        render(vNode, button);
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleRotateNorth.bind(this), false);
    }

    handleRotateNorth() {
        this.getMap().getView().setZoom(8);
        this.getMap().getView().setCenter([-11547548.716614982, 4828956.382832558]);
    }
}
class ResetZoomSliderControl extends Control {
    constructor(opt_options) {
        const options = opt_options || {};

        // const button = document.createElement('button');
        const vNode = createVNode(ZoomSilder, {
            // name: 'house',
            // size: '22px',
            // class: `icon-button icon`,
        });

        const element = document.createElement('div');
        // button.title = 'Reset to default map extent.';
        element.className = 'silder-north ol-unselectable ol-control';
        render(vNode, element);

        super({
            element: element,
            target: options.target,
        });
    }
}
export let mapManager = {
    initCenter: [-11547548.716614982, 4828956.382832558], //[-12031853.727829857, 4941471.688468334],
    getMapIns: () => mapIns,
    initMap: (element, tooltip) => {
        // 设置显示地图的视图
        const view = new View({
            // 定义地图显示中心
            center: mapManager.initCenter,
            // 地图层级
            zoom: 8,
            zoomFactor: 1.5,
            // 限制地图放大最大级别
            maxZoom: 27,
            constrainResolution: false,
        });
        // 设置地图图层 -- 地图由多个图层组成
        const layers = [
            new Group({ zIndex: 4, layers: ejReportLayers }),
            // new Group({ zIndex: 4, layers: climateRiskLayers }),
            new Group({ zIndex: 3, layers: areaLayers }),
            new Group({ zIndex: 2, layers: [blockLayer] }),
            new Group({ zIndex: 2, layers: [overlayer] }),
            new Group({
                zIndex: 1,
                title: 'Boundaries',
                fold: 'open',
                layers: boundaryLayers,
            }),
            new Group({
                zIndex: 0,
                title: 'Base maps',
                fold: 'open',
                layers: baseLayers,
            }),
        ];
        // 创建地图
        mapIns = new Map({
            controls: defaultControls().extend([new ResetZoomControl(), new ResetZoomSliderControl()]),
            // 目标DOM
            target: element,
            layers: layers,
            view: view,
        });

        //addLayerSwitcher(tooltip);
        addHighlightStyle(tooltip);
        addContextmenu(tooltip);
        addScaleLine();
        // addClickHighlightStyle();
    },
};
