<template>
    <div class="toolbar">
        <!-- <el-dropdown popper-class="layer-switcher" trigger="click">
            <DropdownLabel label="Base Map" :isLogo="isLogo" iconName="map-location" />
            <template #dropdown>
                <BaseMap />
            </template>
        </el-dropdown> -->
        <!-- <el-divider direction="vertical" /> -->
        <!-- <el-dropdown trigger="click" :hide-on-click="false">
            <DropdownLabel label="Map Layer" :isLogo="isLogo" iconName="collection-tag" />
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="resetMap"><el-button type="primary" style="width: 100%">Reset Map Layer</el-button></el-dropdown-item>
                </el-dropdown-menu>
                <el-divider style="margin: 0" />
                <MapLayer ref="mapLayerRef" />
            </template>
        </el-dropdown> -->
        <!-- <el-divider direction="vertical" /> -->
        <!-- <el-dropdown trigger="click">
            <DropdownLabel label="Data" :isLogo="isLogo" iconName="s-data" />
            <template #dropdown>
                <el-dropdown-menu class="toolbarDropdownMenus">
                    <el-dropdown-item @click="showViewCurrentData">View Attribute Table</el-dropdown-item>
                    <el-dropdown-item @click="showDataSources">Data Sources & Weblinks</el-dropdown-item>
                    <el-dropdown-item @click="gotoDataInput">Data Input Files</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown> -->
        <!-- <el-divider direction="vertical" /> -->
        <!-- <el-dropdown trigger="click">
            <DropdownLabel label="MP Risk Ranking" :isLogo="isLogo" iconName="setting" />
            <template #dropdown>
                <el-radio-group v-model="riskRankingType" @change="handleRiskRanking">
                    <el-dropdown-menu class="toolbarDropdownMenus">
                        <el-dropdown-item @click="showRiskRanking" disabled>Display CBSA Risk Ranking</el-dropdown-item>
                        <el-dropdown-item divided><el-radio :label="0">Top Risk %ile based on Nation</el-radio></el-dropdown-item>
                        <el-dropdown-item>
                            <el-tooltip
                                effect="customized"
                                content="This option is disabled due to only one region in selected area"
                                :disabled="!tiskRankingDisable"
                                placement="bottom"
                            >
                                <el-radio :label="1" :disabled="tiskRankingDisable">Top Risk %ile based on Selected Area</el-radio>
                            </el-tooltip>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-radio-group>
            </template>
        </el-dropdown> -->
        <!-- <el-divider direction="vertical" />
        <el-dropdown trigger="click">
            <DropdownLabel label="Emission & Monitor Data" :isLogo="isLogo" iconName="s-management" />
            <template #dropdown>
                <el-dropdown-menu class="toolbarDropdownMenus">
                    <el-dropdown-item @click="showMajorEmission">Display Emission Sources</el-dropdown-item>
                    <el-dropdown-item @click="showMonistorSite">Display Monitor Sites</el-dropdown-item>
                    <el-dropdown-item @click="showMeteorologicalSite">Display Meteorological Sites</el-dropdown-item>
                    <el-dropdown-item divided @click="clearMajorEimissionMap">Clear Emission Sources</el-dropdown-item>
                    <el-dropdown-item @click="clearMonistorSiteMap">Clear Monitor Sites</el-dropdown-item>
                    <el-dropdown-item @click="clearMeteorologicalSiteMap">Clear Meteorological Sites</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown> -->
        <!-- <el-divider direction="vertical" /> -->
        <!-- <el-dropdown trigger="click">
            <DropdownLabel label="Proximity Analysis" :isLogo="isLogo" iconName="office-building" />
            <template #dropdown>
                <el-dropdown-menu class="toolbarDropdownMenus">
                    <el-dropdown-item @click="showProximity">Display Proximity Analysis</el-dropdown-item>
                    <el-dropdown-item divided @click="handleProximityClear">Clear Proximity Analysis</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown> -->
        <!-- <el-divider direction="vertical" v-if="isDemo" /> -->
        <!-- <el-dropdown trigger="click" v-if="isDemo">
            <DropdownLabel label="Reporting regional packet" :isLogo="isLogo" iconName="document" />
            <template #dropdown>
                <el-dropdown-menu class="toolbarDropdownMenus">
                    <el-dropdown-item @click="showEJReport">Display Reporting regional packet</el-dropdown-item>
                    <el-dropdown-item divided @click="handleEjReportClear">Clear Reporting regional packet</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown> -->
        <!-- <div ref="mousePositionRef" class="mouse-position"></div> -->
    </div>
</template>

<script setup>
// import { OverlayScrollbars } from 'overlayscrollbars';
// import MapLayer from './MapLayer/index.vue';
// import BaseMap from './BaseMap/index.vue';
// import CBSARiskRankingTable from './CBSARiskRankingTable.vue';
// import DataSources from '@/views/Map/Data/DataSources.vue';
// import LayerSwitcher from 'ol-layerswitcher';
import { mapManager } from '@/libs/map/map-manager.js';
// import MousePosition from 'ol/control/MousePosition';
// import { createStringXY } from 'ol/coordinate';
// import { showDialog } from '@/libs/utils';
// import { useSidebarStore } from '@/store/sidebar';
// import { useViewCurrentDataStore } from '@/store/view-current-data';
// import { useMonitorSiteStore } from '@/store/monitor-site';
// import { useMajorEissionStore } from '@/store/major-eission-sources';
// import { useMeteorologicalSite } from '@/store/meteorological-site';
// import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useDataScaleStore } from '@/store/data-scale';
// import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useProjectYearStore } from '@/store/project-year';
// import { useRiskRankingStore } from '@/store/risk-ranking';
import { useAdvancedOptionStore } from '@/store/advanced-option';
// import { useEJReportStore } from '@/store/ejscreen-report';
// import { getXlsxOtions } from '@/libs/read-file';
// import boundaryLayers from '@/libs/map/layers/boundary-layers';
// import baseLayers from '@/libs/map/layers/base-layers';

// import DropdownLabel from './DropdownLabel.vue';

// import getFileData from '@/libs/read-file.js';
// import http from '@/libs/file-request';
// import { saveAs } from 'file-saver';

// const router = useRouter();
// const sidebarStore = useSidebarStore();
// const viewCurrentDataStore = useViewCurrentDataStore();

// const monitorSiteStore = useMonitorSiteStore();
// const majorEissionStore = useMajorEissionStore();
// const meteorologicalSite = useMeteorologicalSite();
// const proximityAnalysisStore = useProximityAnalysisStore();
// const zoomSelectorStore = useZoomSelectorStore();
const dataScaleStore = useDataScaleStore();
const projectYearStore = useProjectYearStore();
// const riskRankingStore = useRiskRankingStore();
const advancedOptionStore = useAdvancedOptionStore();
// const EJReportStore = useEJReportStore();

// const left = computed(() => (sidebarStore.collapse ? '0px' : '320px'));
const advancedOption = computed(() => advancedOptionStore.option);
const zoomDelta = ref(1);
// const baseMapRef = ref();
// const isLogo = ref(false);
// const mapContentRef = ref();
// const mapLayerRef = ref();
// const isDemo = computed(() => {
//     return location.hostname.includes('demo') || location.hostname == 'localhost';
// });
// const tiskRankingDisable = computed(() => {
//     let model = zoomSelectorStore.model;
//     return model[3] !== undefined && dataScaleStore.isCountyLevel;
// });
// const initCollapse = () => {
//     if (majorEissionStore.isShow && majorEissionStore.isCollapse) {
//         majorEissionStore.handleMarjorEissionCollapse();
//     }
//     if (monitorSiteStore.isShow && monitorSiteStore.isCollapse) {
//         monitorSiteStore.handleMonitorSiteCollapse();
//     }
//     if (proximityAnalysisStore.isShow && proximityAnalysisStore.isCollapse) {
//         proximityAnalysisStore.handleProximityAnalysisCollapse();
//     }
//     if (EJReportStore.isShow && EJReportStore.isCollapse) {
//         EJReportStore.handleEJReportCollapse();
//     }
// };
// const readCejst = async () => {
//     let cejstUrl = '/dataInput/cjest/1.0-communities.csv';
//     let result = await getFileData(cejstUrl);
//     let list = result.data.list
//         .filter((item) => item['Identified as disadvantaged'] == 'TRUE' || item['Identified as disadvantaged'] == 'True')
//         .map((item) => item['Census tract 2010 ID']);
//     var blob = new Blob([JSON.stringify([list], undefined, 4)], { type: 'text/json' });
//     saveAs(blob, 'cejst_data.json');
// };
// const readFile = async () => {
    // let url = '/dataInput/designValue/O3/ozone_designvalues_20162018_final_06_28_19.xlsx';
    // let url = '/dataInput/designValue/O3/o3_designvalues_2017_2019_final_05_26_20.xlsx';
    // let url = '/dataInput/designValue/O3/ozone_designvalues_20152017_final_07_24_18.xlsx';
    // let result = await getXlsxOtions(url);
    // console.log('result', result);
    // let censusTractUrl = '/proximityData/V_CensusTract_all.json';
    // let airUrl = '/proximityData/T_AirToxic_Pollutant.json';
    // let result = await http.get(airUrl);
    // let censusTractObj = {};
    // result['T_AirToxic_Pollutant'].forEach((item) => {
    //     let key = item.ColumnName;
    //     key = key.replace(/_Value/gi, '');
    //     censusTractObj[key] = item.FullName;
    // });
    // result.V_CensusTract.forEach((item) => {
    //     item.center = [item.CenterLon, item.CenterLat];
    //     censusTractObj[item.GeoId] = item;
    // });

    // var blob = new Blob([JSON.stringify(censusTractObj, undefined, 4)], { type: 'text/json' });
    // saveAs(blob, 'cejst_data.json');
// };
// readFile();
// const showRiskRanking = () => {
//     showDialog(CBSARiskRankingTable);
// };
// const resetMap = () => {
//     mapLayerRef.value.resetMap();
// };

// const handleRiskRanking = () => {
//     riskRankingStore.riskRankingType = riskRankingType.value;
// };
// const mousePositionRef = ref();
// const addMousePosition = (mapIns) => {
//     // 创建鼠标位置控件
//     const mousePosition = new MousePosition({
//         coordinateFormat: createStringXY(4), // 指定坐标系和精度
//         projection: 'EPSG:4326', // 指定坐标系（默认为 'EPSG:3857'）
//         className: '', // 指定 CSS 类名
//         target: mousePositionRef.value, // 指定 DOM 元素
//     });

//     // 将鼠标位置控件添加到地图中
//     mapIns.addControl(mousePosition);
// };
// const showEJReport = () => {
//     initCollapse();
//     EJReportStore.showEJReport();
// };
// const handleEjReportClear = () => {
//     if (majorEissionStore.dataType === 'ejReport') {
//         majorEissionStore.layer.clearMap();
//         majorEissionStore.type = 'NOx';
//         majorEissionStore.selectId = null;
//     }
//     if (monitorSiteStore.dataType === 'ejReport') {
//         monitorSiteStore.layer.clearMap();
//         monitorSiteStore.type = 'PM25';
//         monitorSiteStore.selectId = null;
//     }
// };
// const handleProximityClear = () => {
//     proximityAnalysisStore.layer.clearMap();
//     proximityAnalysisStore.radiusValue = 5;
// };
// const showProximity = () => {
//     initCollapse();
//     proximityAnalysisStore.showProximityAnalysis();
// };
const setDefaultOption = () => {
    if (advancedOption.value) {
        let form = advancedOption.value;
        dataScaleStore.dataScale = form.dataScale;
        projectYearStore.projectYear = form.projectYear;
        zoomDelta.value = form.zoomDelta || 1;
    }
};
watch(
    () => advancedOption.value,
    () => {
        setDefaultOption();
    },
    {
        deep: true,
    }
);
onMounted(async () => {
    await nextTick();
    const mapIns = mapManager.getMapIns();
    let option = localStorage.getItem('advancedOption');
    if (option) {
        advancedOptionStore.option = JSON.parse(option);
    }
    // addMousePosition(mapIns);
    const view = mapIns.getView();
    mapIns.on('wheel', function (event) {
        event.preventDefault();
        const delta = event.originalEvent.deltaY;
        let zoomLevel = view.getZoom();
        if (delta < 0) {
            zoomLevel = zoomLevel + zoomDelta.value;
        } else {
            zoomLevel = zoomLevel - zoomDelta.value;
        }
        view.setZoom(zoomLevel);
    });
});

// const riskRankingType = ref(riskRankingStore.riskRankingType);
// const showDataSources = () => {
//     showDialog(DataSources);
// };
// const showViewCurrentData = () => {
//     if (!viewCurrentDataStore.isShow) {
//         viewCurrentDataStore.handleViewShow();
//     } else {
//         viewCurrentDataStore.handleViewCollapse();
//     }
// };
// const gotoDataInput = () => {
//     router.push({
//         path: '/data',
//     });
// };
// const showMeteorologicalSite = () => {
//     if (!meteorologicalSite.isShow) {
//         initCollapse();
//         // if (monitorSiteStore.isShow && monitorSiteStore.isCollapse) {
//         //     monitorSiteStore.handleMonitorSiteCollapse();
//         // }
//         // if (majorEissionStore.isShow && majorEissionStore.isCollapse) {
//         //     majorEissionStore.handleMarjorEissionCollapse();
//         // }
//         // if (proximityAnalysisStore.isShow && proximityAnalysisStore.isCollapse) {
//         //     proximityAnalysisStore.handleProximityAnalysisCollapse();
//         // }
//         meteorologicalSite.isShow = true;
//     }
// };
// const showMonistorSite = () => {
//     initCollapse();
//     monitorSiteStore.showMonitorSite();
//     // if (majorEissionStore.isShow && majorEissionStore.isCollapse) {
//     //     majorEissionStore.handleMarjorEissionCollapse();
//     // }
//     // if (proximityAnalysisStore.isShow && proximityAnalysisStore.isCollapse) {
//     //     proximityAnalysisStore.handleProximityAnalysisCollapse();
//     // }
// };
// const showMajorEmission = () => {
//     initCollapse();
//     majorEissionStore.showMarjor();
// };
// const clearMonistorSiteMap = () => {
//     if (monitorSiteStore.dataType === 'MonitorSites') {
//         monitorSiteStore.clearMonitorData();
//     }
// };
// const clearMeteorologicalSiteMap = () => {
//     const meteorologicalSiteLayer = meteorologicalSite.layer;
//     meteorologicalSite.isShow = false;
//     meteorologicalSiteLayer.clearMap();
// };
// const clearMajorEimissionMap = () => {
//     if (majorEissionStore.dataType === 'marjorEission') {
//         majorEissionStore.clearMajorData();
//     }
// };
</script>

<style scoped lang="scss">
.panel {
    display: block !important;
    font-size: 16px;
    line-height: 1.15;
    height: unset !important;
}
.toolbar {
    position: fixed;
    left: v-bind(left);
    top: var(--header-height);
    height: 32px;
    width: calc(100vw - v-bind(left));
    background-color: white;
    transition: 0.5s;
    display: flex;
    align-items: center;
    min-width: 1000px;
    overflow: hidden;

    .el-dropdown {
        &:first-child {
            margin-left: 20px;
        }
    }

    .el-divider {
        --el-border-color: black;
    }
    .label {
        // font-family: 'Times New Roman';
        font-weight: bold;
        font-size: 18px;
        color: black;
        cursor: pointer;
        &:focus {
            outline: none;
        }
    }
    .no-data {
        color: #ccc;
        cursor: not-allowed;
    }

    .mouse-position {
        margin-left: auto;
        margin-right: 4px;
        font-size: 14px;
    }
}
</style>
<style lang="scss">
.layer-switcher li.group > input {
    display: none;
}
.layer-switcher li:nth-child(1).group > label {
    padding-left: 1.2em;
}
.layer-switcher li:nth-child(1).group {
    position: relative;
    &::before {
        content: '';
        position: absolute;
        left: 16px;
        top: 0;
        width: 90%;
        height: 20px;
        background: transparent;
        // z-index: 2;
    }
}
// .toolbarDropdownMenus {
//     // font-family: 'Times New Roman';
// }
</style>
