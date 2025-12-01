<template>
    <MyDrawer
        title="Proximity Analysis"
        :store="proximityAnalysisStore"
        :default-show="proximityAnalysisStore.isCollapse"
        @on-collapse="handleCollapse"
        @onClosed="handleClose"
        :isShowClose="true"
        minWidth="770"
    >
        <div class="proximity-dialog" v-loading="showLodaing" element-loading-text="Loading..." ref="proximityDialog">
            <div class="proximity-dialog-header">
                <div class="radius-content">
                    <div class="radius-box">
                        Radius of Analysis (km):
                        <ParameterTip content="Users can click the up and down arrows or slide the pointer to adjust the analysis radius." />
                        <el-input-number class="number-box" v-model="radiusValue" :min="0.5" :max="50" size="small" controls-position="right" />
                    </div>
                    <el-slider class="slider-box" v-model="radiusValue" :min="0.5" :max="50" :step="0.5" :marks="sliderMarks" />
                </div>
                <div class="minimum-area">
                    Minimum Area Ratio (X%):
                    <ParameterTip
                        content="This option determines that the census tracts within the area of specified radius that has an area ratio larger than X% will be included in the table and plot calculations."
                    />
                    <el-input-number v-model="areaRatio" :min="1" :max="100" style="width: 80px" :controls="false" size="small" />
                </div>
            </div>
            <div class="proximity-dialog-main" ref="proximityAnalysisRef">
                <el-collapse v-model="activeNames" class="collapse">
                    <el-collapse-item name="1">
                        <template #title>
                            <div class="collapse-title">
                                Select Sites
                                <span class="collapse-tips">(Click ">" to expand this module to select user-defined monitors, sources, census tracts or locations)</span>
                            </div>
                        </template>
                        <el-radio-group v-model="radio" @change="handleRadioChange">
                            <el-radio :value="1">Select one or more monitor sites <span class="radio-tips">(Select type of monitor sites first)</span></el-radio>
                            <MonitorSitesTransfer @handleHover="handleHover" v-show="radio === 1" ref="monitorTransferRef" />
                            <el-radio :value="2">Select one or more sources/facilities <span class="radio-tips">(Select emissions sector groups first)</span></el-radio>
                            <FacilityTransfer @handleHover="handleHover" v-show="radio === 2" ref="facilityTransferRef" />
                            <!-- <el-radio :label="3">Select one or more CEJST-Disadvantaged communities</el-radio>
                            <CejstTransfer v-show="radio === 3" ref="cejstTransferRef" /> -->
                            <el-radio :value="4">Select user-defined locations</el-radio>
                            <LocationTransfer @handleHover="handleHover" v-show="radio === 4" ref="locationTransferRef" />
                        </el-radio-group>
                        <div class="individual-table-btn">
                            <el-button type="success" @click="showIndividualTable" :loading="individualLoading" :disabled="individualLoading"
                                >Create Individual Sites Table</el-button
                            >
                            <el-button type="success" @click="showNationTable" :loading="nationLoading" :disabled="radio === 4 || radio === 3"
                                >Create National Sites Table</el-button
                            >
                            <el-button @click="handleSubmit">Apply</el-button>
                            <el-button @click="clearAll">Clear</el-button>
                            <el-button @click="resetAll">Reset</el-button>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
            <div class="proximity-dialog-footer">
                <el-button @click="showSummaryPlot" type="primary">Summary Plot</el-button>
                <el-button @click="showIndividualSummaryTable" type="primary">Summary Table</el-button>
            </div>
            <Tooltip ref="tooltipRef" :append-ref="proximityAnalysisRef" effect="customized">
                <span>{{ activeItem }}</span>
            </Tooltip>
        </div>
    </MyDrawer>
</template>
<script setup>
import * as turf from '@turf/turf';
import RBush from 'rbush';
import SummaryPlot from './SummaryPlot.vue';
import IndividualSitesTable from './IndividualSitesTable.vue';
import NationalSitesTale from './NationalSitesTable.vue';
import SummaryTable from './SummaryTable.vue';
import { showDialog } from '@/libs/utils';
import { useProximityAnalysisStore } from '@/store/proximity-analysis.js';
import { useMonitorSiteStore } from '@/store/monitor-site';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import { ElMessageBox } from 'element-plus';
import { OverlayScrollbars } from 'overlayscrollbars';
import Worker from '@/libs/worker/proximity-worker.js?worker';
import MonitorSitesTransfer from './MonitorSitesTransfer.vue';
import FacilityTransfer from './FacilityTransfer.vue';
import LocationTransfer from './LocationTransfer.vue';
// import CejstTransfer from './CejstTransfer.vue';
let individualTimer;
const monitorTransferRef = ref();
const facilityTransferRef = ref();
const locationTransferRef = ref();
// const cejstTransferRef = ref();

const monitorSiteStore = useMonitorSiteStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const majorEissionStore = useMajorEissionStore();
const worker = new Worker();

let { setMapIcon, setCircle, setRadius, clearMap, clearInteractionLayer } = proximityAnalysisStore.layer;

const proximityDialog = ref();
const activeNames = ref([]);
const tooltipRef = ref();
const loading = ref(false);
const geoJsonLoading = ref(false);
const dataLoading = ref(false);
const checkLoading = ref(false);
const individualLoading = ref(false);
const nationLoading = ref(false);
const showLodaing = computed(() => loading.value || geoJsonLoading.value || dataLoading.value || checkLoading.value);
const proximityAnalysisRef = ref();

const activeItem = ref(null);
const radiusValue = ref(proximityAnalysisStore.radiusValue);
const areaRatio = ref(10);
const siteDataCopy = ref(null);
const sliderMarks = reactive({
    1: {
        style: {
            fontSize: '12px',
        },
        label: '1km',
    },
    50: {
        style: {
            fontSize: '12px',
        },
        label: '50km',
    },
});
const radio = ref(proximityAnalysisStore.radioValue);

const includesGeoIds = reactive({
    data: [],
    type: '',
});

const handleRadioChange = () => {
    proximityAnalysisStore.radioValue = radio.value;
    clearInteractionLayer();
    monitorSiteStore.siteSelectList = [];
    majorEissionStore.siteSelectList = [];
};
// tooltip 提示
const handleHover = (data, currentTarget) => {
    activeItem.value = data;
    tooltipRef.value.resetData(currentTarget);
};

const handleSubmit = async () => {
    let flag = true;
    loading.value = true;
    let data = [];
    if (radio.value == 1) {
        let monitorData = await monitorTransferRef.value.getSites();
        data = data.concat(monitorData);
        includesGeoIds.type = 'monitor';
    } else if (radio.value == 2) {
        let sourceData = await facilityTransferRef.value.getSites();
        data = data.concat(sourceData);
        includesGeoIds.type = 'source';
    } else if (radio.value == 3) {
        // let cejstData = await cejstTransferRef.value.getSites();
        // data = data.concat(cejstData);
        // includesGeoIds.type = 'cejst';
    } else if (radio.value == 4) {
        let locationData = await locationTransferRef.value.getSites();
        data = data.concat(locationData);
        let locationRadio = locationTransferRef.value.getLocationRadio();
        includesGeoIds.type = locationRadio == 3 ? 'sites' : 'censusTract';
    }
    includesGeoIds.data = data;
    setMapIcon(data);
    setCircle(data);
    loading.value = false;
    if (!includesGeoIds.data.length) {
        flag = false;

        ElMessageBox.alert(`Please select a facility, monitor site or census tract first!`, 'Tip', {
            confirmButtonText: 'OK',
        });
        return;
    }
    return flag;
};

watch(
    () => radiusValue.value,
    (val) => {
        proximityAnalysisStore.radiusValue = val;
        setRadius(radiusValue.value * 1000);
    }
);
const showSummaryPlot = async () => {
    let flag = true;
    flag = await handleSubmit();
    if (!flag) return;
    showDialog(SummaryPlot, {
        data: includesGeoIds.data,
        type: includesGeoIds.type,
        areaRatio: areaRatio.value,
        radius: radiusValue.value,
    });
};
const getGeoIds = async (isNation, data = []) => {
    let objList = [];
    if (isNation) {
        objList = await proximityAnalysisStore.getNationGeoId(data, areaRatio.value, radiusValue.value * 1000);
    } else {
        objList = await proximityAnalysisStore.getGeoIdsObj(areaRatio.value);
    }
    return objList;
};

const openIndividualDialog = async (isNation, option) => {
    try {
        // let objList = [];
        let needMin = Math.floor(option.data.length * 0.001);
        await ElMessageBox.confirm(`This may take up to ${needMin + 4}  minute(s), would you like to continue?`, 'Tips', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'Warning',
            closeOnClickModal: false,
        })
            .then(async () => {
                // await nextTick();
                showDialog(isNation ? NationalSitesTale : IndividualSitesTable, {
                    ...option,
                    areaRatio: areaRatio.value,
                    // geoIdsObj: objList,
                });
                // setTimeout(async () => {
                //     // objList = await getGeoIds(isNation, option.data);
                //     // let list = objList.map((item) => item.list);
                //     // if (!list.length) {
                //     //     await ElMessageBox.alert(`Please wait for the map to load before opening`, 'Tips', {
                //     //         confirmButtonText: 'OK',
                //     //         callback: () => {},
                //     //     });
                //     //     return;
                //     // }

                // }, 100);
            })
            .catch(() => {});

        // let num = list.length;
        // 估计平均每条请求80ms
        // let needMs = num * 80;
        // 判断估计需要多少秒
        // let needSec = needMs / 1000;
        // let needMin = Math.floor(needSec / 60);
        // if (needSec >= 10) {
        //     await ElMessageBox.confirm(`This may take up to ${needMin + 1}  minute(s), would you like to continue?`, 'Tips', {
        //         confirmButtonText: 'OK',
        //         cancelButtonText: 'Cancel',
        //         type: 'Warning',
        //         closeOnClickModal: false,
        //     })
        //         .then(async () => {
        //             showDialog(isNation ? NationalSitesTale : IndividualSitesTable, {
        //                 ...option,
        //                 geoIdsObj: objList,
        //             });
        //         })
        //         .catch(() => {});
        // } else {
        //     showDialog(isNation ? NationalSitesTale : IndividualSitesTable, {
        //         ...option,
        //         geoIdsObj: objList,
        //     });
        // }
        // showDialog(isNation ? NationalSitesTale : IndividualSitesTable, {
        //     ...option,
        //     geoIdsObj: objList,
        // });
    } catch (err) {
        console.log('individual-error', err);
    }
};
const showIndividualTable = async () => {
    let flag = true;
    flag = await handleSubmit();
    if (!flag) return;
    individualLoading.value = true;
    openIndividualDialog(false, {
        data: includesGeoIds.data,
        areaRatio: areaRatio.value,
    });
    individualLoading.value = false;
};
const showNationTable = async () => {
    if (individualTimer) {
        return;
    }
    let list = [];
    let checkList = [];
    nationLoading.value = true;
    if (radio.value === 1) {
        list = await monitorTransferRef.value.getAllSites();
        checkList = monitorTransferRef.value.getCheckListData();
    } else if (radio.value === 2) {
        list = await facilityTransferRef.value.getAllSites();
        checkList = facilityTransferRef.value.getCheckListData();
    }

    individualTimer = setTimeout(() => {
        clearTimeout(individualTimer);
        individualTimer = null;
        openIndividualDialog(true, {
            data: list,
            areaRatio: areaRatio.value,
            isNation: true,
            checkList: checkList,
            groupType: radio.value === 1 ? 'pollutants' : 'sectorProjectGroups',
        });
        nationLoading.value = false;
    }, 500);
};
const showIndividualSummaryTable = async () => {
    let flag = true;
    flag = await handleSubmit();
    if (!flag) return;
    showDialog(SummaryTable, {
        data: includesGeoIds.data,
        areaRatio: areaRatio.value,
        type: includesGeoIds.type,
    });
};
const handleCollapse = (val) => {
    proximityAnalysisStore.isCollapse = val;
};
const handleClose = () => {
    radiusValue.value = 5;
    clearData();
    proximityAnalysisStore.radiusValue = 5;
    proximityAnalysisStore.siteData = '';
    siteDataCopy.value = '';
    proximityAnalysisStore.siteType = '';
    proximityAnalysisStore.censusTracts = [];
    if (proximityAnalysisStore.isShow) {
        proximityAnalysisStore.handleProximityAnalysisShow();
    }
};
const clearAll = () => {
    radiusValue.value = 5;
    areaRatio.value = 10;
    clearData();
    let locationRadio = locationTransferRef.value.getLocationRadio();
    if (radio.value === 4 && locationRadio === 4) {
        locationTransferRef.value.handleDraw();
    }
};
const resetAll = () => {
    clearAll();
    areaRatio.value = 10;
    proximityAnalysisStore.censusTracts = [];
    proximityAnalysisStore.radioValue = radio.value;
    monitorTransferRef.value.resetData();
    facilityTransferRef.value.resetData();
    locationTransferRef.value.resetData();
};
const clearData = () => {
    clearMap();
    monitorTransferRef.value.clearData();
    facilityTransferRef.value.clearData();
    locationTransferRef.value.clearData();
    // cejstTransferRef.value.clearData();
};
watch(
    () => proximityAnalysisStore.siteData,
    (val) => {
        clearData();
        if (monitorSiteStore.siteSelectList.length) {
            monitorSiteStore.siteSelectList = [];
        }
        if (majorEissionStore.siteSelectList.length) {
            majorEissionStore.siteSelectList = [];
        }
        if (proximityAnalysisStore.censusTracts.length) {
            proximityAnalysisStore.censusTracts = [];
        }
        checkSites();
    }
);
watch(
    () => proximityAnalysisStore.selectedSite,
    async (value) => {
        if (value) {
            let locationRadio = locationTransferRef.value.getLocationRadio();
            if (radio.value == 4 && locationRadio === 3) {
                let monitorSitesData = [];
                let facilitiesData = [];
                if (proximityAnalysisStore.siteType === 'monitor') {
                    monitorSitesData = await monitorTransferRef.value.getSiteDetail([value]);
                } else if (proximityAnalysisStore.siteType === 'facility') {
                    facilitiesData = await facilityTransferRef.value.getFacilityDetail([value]);
                }
                await locationTransferRef.value.setMultiSelect(monitorSitesData, facilitiesData, false);
            } else {
                proximityAnalysisStore.siteData = value;
            }
        }
    }
);
watch(
    () => proximityAnalysisStore.isShift,
    (val) => {
        if (!val) {
            checkSites();
        }
    },
    {
        deep: true,
    }
);
const checkSites = async () => {
    try {
        checkLoading.value = true;
        let siteType = proximityAnalysisStore.siteType;
        let locationRadio = locationTransferRef.value.getLocationRadio();
        // 判断当前是否多选或者选择censusTractsSelect
        if (siteType !== 'multiSelect' && siteType !== 'censusTractsSelect') {
            let value = proximityAnalysisStore.siteData;
            // 空的或者已经点击过了不在响应
            if (!value || siteDataCopy.value === value) return;
            siteDataCopy.value = value;
            // 判断是否为monitor
            if (siteType === 'monitor') {
                if (radio.value == 4 && locationRadio === 3) {
                    let monitorSitesData = await monitorTransferRef.value.getSiteDetail([value]);
                    await locationTransferRef.value.setMultiSelect(monitorSitesData, []);
                } else {
                    radio.value = 1;
                    await monitorTransferRef.value.handleSelect([value]);
                }
            } else if (siteType === 'facility') {
                if (radio.value == 4 && locationRadio === 3) {
                    let facilitiesData = await facilityTransferRef.value.getFacilityDetail([value]);
                    await locationTransferRef.value.setMultiSelect([], facilitiesData);
                } else {
                    radio.value = 2;
                    await facilityTransferRef.value.handleSelect([value]);
                }
            } else if (siteType === 'censusTract') {
                radio.value = 4;
                await locationTransferRef.value.setCensusTractList([value]);
            }
        } else if (siteType === 'multiSelect') {
            let monitorSites = monitorSiteStore.siteSelectList;
            let facilities = majorEissionStore.siteSelectList;
            if (!monitorSites.length && !facilities.length) {
                return true;
            }
            if ((monitorSites.length && facilities.length) || radio.value == 4) {
                radio.value = 4;
                let monitorSitesList = monitorSites.map((item) => item.basePollutantType + ':' + item.siteId);
                let facilitiesList = facilities.map((item) => item.sectorProjectGroup + ':' + item.facilityId);
                let monitorSitesData = await monitorTransferRef.value.getSiteDetail(monitorSitesList);
                let facilitiesData = await facilityTransferRef.value.getFacilityDetail(facilitiesList);
                await locationTransferRef.value.setMultiSelect(monitorSitesData, facilitiesData);
            } else if (monitorSites.length) {
                radio.value = 1;
                let list = monitorSites.map((item) => item.basePollutantType + ':' + item.siteId);
                await monitorTransferRef.value.handleSelect(list);
            } else if (facilities.length) {
                radio.value = 2;
                let list = facilities.map((item) => item.sectorProjectGroup + ':' + item.facilityId);
                await facilityTransferRef.value.handleSelect(list);
            }
            if (monitorSiteStore.siteSelectList.length) {
                monitorSiteStore.siteSelectList = [];
            }
            if (majorEissionStore.siteSelectList.length) {
                majorEissionStore.siteSelectList = [];
            }
        } else if (siteType === 'censusTractsSelect') {
            let censusTractsList = proximityAnalysisStore.censusTracts;
            if (!censusTractsList.length) {
                return true;
            }
            radio.value = 4;
            await locationTransferRef.value.setCensusTractList(censusTractsList);
            proximityAnalysisStore.censusTracts = [];
        }
        await handleSubmit();
        monitorSiteStore.layer.clearLocalLayer();
        majorEissionStore.layer.clearLocalLayer();
    } catch (error) {
        console.log('error', error);
    } finally {
        checkLoading.value = false;
    }
};
onMounted(async () => {
    dataLoading.value = true;
    await nextTick();
    setTimeout(async () => {
        await monitorTransferRef.value.resetOptions();
        await facilityTransferRef.value.resetOptions();
        // await cejstTransferRef.value.resetOptions();
        await checkSites();
        dataLoading.value = false;
    }, 0);
    OverlayScrollbars(proximityAnalysisRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
});
worker.onmessage = (e) => {
    try {
        let result = e.data;
        if (result.state === 200) {
            proximityAnalysisStore.censusTractsGeoJson = result.data;
            const rTree = new RBush();
            Object.keys(result.data).forEach((key) => {
                let obj = result.data[key];
                let geojsonData = turf.toWgs84(obj);
                const bbox = turf.bbox(geojsonData);
                rTree.insert({
                    minX: bbox[0],
                    minY: bbox[1],
                    maxX: bbox[2],
                    maxY: bbox[3],
                    feature: obj,
                });
            });
            proximityAnalysisStore.censusTractsRTree = rTree;
            worker.terminate();
        }
    } finally {
        geoJsonLoading.value = false;
    }
};
if (!proximityAnalysisStore.censusTractsGeoJson) {
    geoJsonLoading.value = true;
    worker.postMessage('Get data');
}
</script>
<style scoped lang="scss">
.proximity-dialog {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .proximity-dialog-header {
        box-sizing: border-box;
        border-bottom: 1px solid #ccc;
        padding: 5px;
        font-size: 14px;
        color: #000;
        .radius-content {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 5px;
            .radius-box {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .slider-box {
                width: 200px;
                margin-left: 15px;
                :deep(.el-slider__marks-text) {
                    margin-top: 10px;
                }
            }
            .number-box {
                width: 80px;
                // margin-left: 10px;
            }
        }
        .minimum-area {
            display: flex;
            align-items: center;
        }
    }
    .proximity-dialog-main {
        width: 100%;
        // flex: 1;
        box-sizing: border-box;
        padding: 5px;
        font-size: 12px;

        .el-radio-group {
            width: 100%;
            .el-radio {
                width: 100%;
                margin-right: 0px;
                height: 24px;
                :deep(.el-radio__label) {
                    font-size: 16px;
                    color: #000;
                    font-weight: bold;
                    .radio-tips {
                        font-size: 12px;
                        color: green;
                    }
                }
            }
        }
        .collapse {
            width: 100%;
            // height: 100%;
            :deep(.el-collapse-item) {
                height: 100%;
                --el-collapse-header-height: 32px;
                --el-collapse-border-color: black;
            }
            :deep(.el-collapse-item__header) {
                font-size: 14px;
                font-weight: bold;
            }
            :deep(.el-collapse-item__content) {
                padding-bottom: 4px;
            }
            .collapse-title {
                display: flex;
                font-size: 18px;
                // flex-wrap: wrap;
                .collapse-tips {
                    font-size: 12px;
                    color: #6fa76f;
                    margin-left: 5px;
                    display: flex;
                    flex-wrap: wrap;
                }
            }
        }
    }
    .proximity-dialog-footer {
        width: 100%;
        // border-top: 1px solid #ccc;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        flex-wrap: wrap;
        padding: 5px;
        .el-button {
            padding: 5px 10px;
        }
        .el-button + .el-button {
            margin-left: 5px;
        }
    }
}
.individual-table-btn {
    margin-top: 10px;
    border-top: 1px solid #000;
    box-sizing: border-box;
    padding-top: 5px;
}
</style>
<style lang="scss">
.proximity-transfer-content {
    width: 100%;
    .proximity-transfer-content-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        padding-left: 15px;
        .el-checkbox-group {
            .el-checkbox {
                height: 24px;
                margin-right: 10px;
                :deep(.el-checkbox__label) {
                    font-size: 12px;
                }
            }
        }
        .year-select {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
    }
    .transfer-content {
        min-width: 690px;
        margin-top: 5px;
        .el-transfer {
            :deep(.el-transfer-panel) {
                width: 280px;
            }
            :deep(.el-transfer__buttons) {
                padding: 0 12px;
            }
            :deep(.el-transfer-panel__filter) {
                width: 100%;
                margin: 0;
            }
            :deep(.el-transfer-panel__header) {
                height: 32px;
            }
        }
    }
}
</style>
