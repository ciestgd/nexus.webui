<template>
    <MyDrawer
        title="Reporting regional packet"
        :store="EJReportStore"
        :default-show="EJReportStore.isCollapse"
        @on-collapse="handleCollapse"
        @on-closed="handleClose"
        :isShowClose="true"
        :unFullScreen="false"
        minWidth="770"
    >
        <div class="report-dialog" ref="reportRef">
            <div class="report-header">
                <div class="select-box">
                    Select:
                    <el-select v-model="selectType" class="type-select" placeholder="Select" size="small" @change="handleSelectChange">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>
                <div class="select-content">
                    <div class="control-box">
                        <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" :disabled="!isHasList" @change="handleCheckAllChange">Select All</el-checkbox>

                        <div>
                            <el-button @click="handleSubmit" size="small"  type="primary" :loading="loading" :disabled="loading">Apply</el-button>
                            <el-button @click="handleDelect" size="small"  type="primary" :disabled="loading">Delete Selected</el-button>
                            <el-button @click="handleClear" size="small"  type="primary" :disabled="loading">Clear All</el-button>
                        </div>
                    </div>
                    <div class="check-box" ref="checkBoxRef">
                        <el-checkbox-group v-model="checkList" @change="handleGroupChange">
                            <div class="group-item" v-if="censusTractList.length">
                                <span class="item-header">Tract:</span>
                                <div class="item-content">
                                    <el-checkbox v-for="item in censusTractList" :label="item.geoId">{{ item.name }}</el-checkbox>
                                </div>
                            </div>
                            <div class="group-item" v-if="countyList.length">
                                <span class="item-header">County:</span>
                                <div class="item-content">
                                    <el-checkbox v-for="item in countyList" :label="item.geoId">{{ item.name }}, {{ item.stateAbbrName }}</el-checkbox>
                                </div>
                            </div>
                            <div class="group-item" v-if="cbsaList.length">
                                <span class="item-header">CBSA:</span>
                                <div class="item-content">
                                    <el-checkbox v-for="item in cbsaList" :label="item.geoId">{{ item.name }}</el-checkbox>
                                </div>
                            </div>
                        </el-checkbox-group>
                    </div>
                </div>
            </div>
            <el-tabs v-model="activeName" class="demo-tabs">
                <el-tab-pane label="AQ Risk & EJ Indicators" name="aqRisk">
                    <Summary @handleData="handleIndicatorLoading" :countyIds="countyIds" :cbsaData="cbsaData" :tractData="tractData" :countyData="countyData" />
                </el-tab-pane>
                <el-tab-pane label="Source/Sector Emissions" name="emission">
                    <Emission @handleData="handleEmissionLoading" :countyIds="countyIds" />
                </el-tab-pane>
                <el-tab-pane label="Monitor Sites" name="monitorSite">
                    <MonitorSites @handleData="handleSiteLoading" :countyIds="countyIds" />
                </el-tab-pane>
                <el-tab-pane label="EPA Region Table Generator" name="generator"><EPARegionTable /></el-tab-pane>
            </el-tabs>
        </div>
    </MyDrawer>
</template>
<script setup>
import censusTractAllData from '@/libs/census-tract-all-data';
import { OverlayScrollbars } from 'overlayscrollbars';
import overlayer from '@/libs/map/layers/overlayer';
import Summary from './Summary/index.vue';
import Emission from './Emission/index.vue';
import MonitorSites from './MonitorSites.vue';
import EPARegionTable from './EPARegionTable/index.vue';

import { getCounty, getCbsaById, getState } from '@/api/district';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import { useMonitorSiteStore } from '@/store/monitor-site';
import { useDataScaleStore } from '@/store/data-scale';
import { useEJReportStore } from '@/store/ejscreen-report';
import { mapManager } from '@/libs/map/map-manager.js';
import { setCountyAreaGeoIdSet } from '@/libs/map/layers/ej-report-layers/county-layer';
import { setTractAreaGeoIdSet } from '@/libs/map/layers/ej-report-layers/tract-layer';
import { setCBSAAreaGeoIdSet } from '@/libs/map/layers/ej-report-layers/cbsa-layer';
import VectorSource from 'ol/source/Vector.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Draw } from 'ol/interaction.js';

const EJReportStore = useEJReportStore();
const majorEissionStore = useMajorEissionStore();
const monitorSiteStore = useMonitorSiteStore();
const dataScaleStore = useDataScaleStore();

const activeName = ref('aqRisk');
const countyIds = ref([]);
const reportRef = ref();
const drawSource = new VectorSource();
let drawLayer = null;
let drawInteraction = null;
const selectType = ref('county');
const countyAllData = ref({});
const stateAllData = ref({});
const checkList = ref([]);
const checkAll = ref(false);
const isIndeterminate = ref(false);
const options = ref([
    {
        label: 'Select County',
        value: 'county',
    },
    {
        label: 'Select Tract',
        value: 'censusTract',
    },

    {
        label: 'Select CBSA',
        value: 'cbsa',
    },
    {
        label: 'Draw an Area',
        value: 'area',
    },
]);
const censusTractList = computed(() => EJReportStore.censusTractList);
const countyList = computed(() => {
    let list = EJReportStore.countyList.map((item) => {
        let geoId = item.geoId;
        let stateId = geoId.substr(0, 2);
        let stateData = stateAllData.value[stateId];
        let obj = { ...item, stateName: '', stateAbbrName: '' };
        if (stateData) {
            obj.stateName = stateData.name;
            obj.stateAbbrName = stateData.abbrName;
        }
        return obj;
    });
    return list;
});
const cbsaList = computed(() => EJReportStore.cbsaList);
const countyGeoIds = computed(() => countyList.value.map((item) => item.geoId));
const censusTractGeoIds = computed(() => censusTractList.value.map((item) => item.geoId));
const cbsaGeoIds = computed(() => cbsaList.value.map((item) => item.geoId));
const countyData = computed(() => countyList.value.filter((item) => checkList.value.indexOf(item.geoId) !== -1));
const tractData = computed(() => censusTractList.value.filter((item) => checkList.value.indexOf(item.geoId) !== -1));
const cbsaData = computed(() => cbsaList.value.filter((item) => checkList.value.indexOf(item.geoId) !== -1));

const isHasList = computed(() => censusTractList.value.length || countyList.value.length || cbsaList.value.length);
const emissionLoading = ref(false);
const indicatorLoading = ref(false);
const siteLoading = ref(false);
const loading = computed(() => emissionLoading.value || indicatorLoading.value || siteLoading.value);
const checkBoxRef = ref();

const handleCollapse = (val) => {
    EJReportStore.isCollapse = val;
};
const handleClose = () => {
    if (majorEissionStore.dataType === 'ejReport') {
        majorEissionStore.layer.clearMap();
        majorEissionStore.type = 'NOx';
        majorEissionStore.selectId = null;
    }
    if (monitorSiteStore.dataType === 'ejReport') {
        monitorSiteStore.layer.clearMap();
        monitorSiteStore.type = 'PM25';
        monitorSiteStore.selectId = null;
    }
    handleClear();
    if (EJReportStore.isShow) {
        EJReportStore.handleEJReportShow();
    }
};
const handleSubmit = () => {
    handleData();
    hanleMapStyle()
};
const hanleMapStyle = () => {
    let tractGeoIds = tractData.value.map((item) => item.geoId);
    let countyGeoIds = countyData.value.map((item) => item.geoId);
    let cbsaGeoIds = cbsaData.value.map((item) => item.geoId);
    setCountyAreaGeoIdSet(countyGeoIds)
    setTractAreaGeoIdSet(tractGeoIds)
    setCBSAAreaGeoIdSet(cbsaGeoIds)
};
const handleData = async () => {
    let tractGeoId5 = tractData.value.map((item) => item.geoId.substr(0, 5));
    let countyIdList = countyData.value.map((item) => item.geoId).concat(tractGeoId5);
    let proArr = cbsaData.value.map((item) => {
        return new Promise(async (resolve, reject) => {
            let result = await getCbsaById(item.geoId);
            resolve(result);
        });
    });
    await Promise.all(proArr).then((res) => {
        res.forEach((data) => {
            let countyGeoIdData = data.map((item) => item.countyGeoId);
            countyIdList = countyIdList.concat(countyGeoIdData);
        });
    });
    let countySet = new Set(countyIdList);
    countyIds.value = [...countySet];
};
const handleClear = () => {
    if (loading.value) return;
    EJReportStore.countyList = [];
    EJReportStore.cbsaList = [];
    EJReportStore.censusTractList = [];
    clearInteractionLayer();
    checkAll.value = false;
    isIndeterminate.value = false;
    countyIds.value = [];
    hanleMapStyle()
};
const handleDelect = () => {
    if (loading.value) return;
    checkList.value.forEach((item) => {
        let countyIndex = countyGeoIds.value.indexOf(item);
        let tractIndex = censusTractGeoIds.value.indexOf(item);
        let cbsaIndex = cbsaGeoIds.value.indexOf(item);
        if (countyIndex !== -1) {
            EJReportStore.countyList.splice(countyIndex, 1);
        }
        if (tractIndex !== -1) {
            EJReportStore.censusTractList.splice(tractIndex, 1);
        }
        if (cbsaIndex !== -1) {
            EJReportStore.cbsaList.splice(cbsaIndex, 1);
        }
    });
    checkList.value = [];
    checkAll.value = false;
    isIndeterminate.value = false;
    countyIds.value = [];
    hanleMapStyle()
};
const handleCheckAllChange = (val) => {
    let list = [];
    list = [...countyGeoIds.value, ...censusTractGeoIds.value, ...cbsaGeoIds.value];
    checkList.value = val ? list : [];
    isIndeterminate.value = false;
};
const handleGroupChange = (val) => {
    const checkedCount = val.length;
    let allNumber = countyList.value.length + censusTractList.value.length + cbsaList.value.length;
    checkAll.value = checkedCount === allNumber;
    isIndeterminate.value = checkedCount > 0 && checkedCount < allNumber;
};

const handleSelectChange = (val) => {
    EJReportStore.selectType = val;
    removeInteraction();
    clearInteractionLayer();
    if (val === 'censusTract' && dataScaleStore.dataScale === 0) {
        dataScaleStore.dataScale = 1;
    }
    if (val === 'area') {
        addInteraction();
    }
};
const removeInteraction = () => {
    let mapIns = mapManager.getMapIns();
    mapIns.removeInteraction(drawInteraction);
};
const clearInteractionLayer = () => {
    let mapIns = mapManager.getMapIns();
    drawSource.clear();
    removeInteraction();
    if (drawLayer) {
        mapIns.removeLayer(drawLayer);
        drawLayer = null;
    }
};
const addInteraction = () => {
    let mapIns = mapManager.getMapIns();
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
        type: 'Polygon',
        style: {
            'stroke-color': 'rgba(255, 255, 100, 1)',
            'stroke-width': 2,
            'fill-color': 'rgba(255, 255, 100, 0.8)',
            'circle-radius': 8,
            'circle-fill-color': 'rgba(128,0,0, 0.5)',
        },
    };
    drawInteraction = new Draw(drawObj);

    mapIns.addInteraction(drawInteraction);
    drawInteraction.on('drawstart', function (event) {
        EJReportStore.isDrawing = true;
        drawSource.clear();
    });
    drawInteraction.on('drawend', function (event) {
        var feature = event.feature;
        EJReportStore.isDrawing = false;
        getGeoIdsByInteraction(feature);
    });
};
const getGeoIdsByInteraction = (feature) => {
    let geoIdsList = new Set();
    let vectorTileSource = overlayer.getSource();
    var geometry = feature.getGeometry();
    let list = vectorTileSource.getFeaturesInExtent(geometry.getExtent());
    list.forEach(async (item) => {
        let id = item.getId();
        if (id) {
            let data = id.length > 5 ? censusTractAllData[id] : countyAllData.value[id];
            var isInside = geometry.intersectsCoordinate(data.center);
            if (isInside) {
                geoIdsList.add(id);
            }
        }
    });
    let arr = [...geoIdsList];
    if (dataScaleStore.dataScale === 0) {
        let countyGeoIds = countyList.value.map((item) => item.geoId);
        arr.forEach((item) => {
            if (countyGeoIds.indexOf(item) === -1) {
                EJReportStore.countyList.push({
                    geoId: item,
                    name: countyAllData.value[item].name,
                });
            }
        });
    } else {
        let tractGeoIds = censusTractList.value.map((item) => item.geoId);
        arr.forEach((item) => {
            if (tractGeoIds.indexOf(item) === -1) {
                EJReportStore.censusTractList.push({
                    geoId: item,
                    name: item,
                });
            }
        });
    }
};
const abortDrawing = () => {
    if (drawInteraction) {
        EJReportStore.isDrawing = false;
        drawInteraction.abortDrawing();
    }
};
const getAllState = async () => {
    let result = await getState();
    let obj = {};
    result.forEach((item) => {
        let center = [item.centerLon, item.centerLat];
        obj[item.geoId] = {
            ...item,
            center,
        };
    });
    stateAllData.value = obj;
};
const getAllCounty = async () => {
    let result = await getCounty();
    let obj = {};
    result.forEach((item) => {
        let center = [item.centerLon, item.centerLat];
        obj[item.geoId] = {
            ...item,
            center,
        };
    });
    EJReportStore.countyAllData = obj;
    countyAllData.value = obj;
};
// 监听是否取消draw
watch(
    () => EJReportStore.isEsc,
    (val) => {
        if (val) {
            if (EJReportStore.isDrawing) {
                abortDrawing();
            }
        }
    }
);
const handleEmissionLoading = (val) => {
    emissionLoading.value = val;
};
const handleIndicatorLoading = (val) => {
    indicatorLoading.val = val;
};
const handleSiteLoading = (val) => {
    siteLoading.value = val;
};
onMounted(async () => {
    await nextTick();
    getAllState();
    getAllCounty();
    OverlayScrollbars(checkBoxRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
});
</script>
<style scoped lang="scss">
.report-dialog {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .report-header {
        width: 100%;
        .select-box {
            display: flex;
            align-items: center;
            .type-select {
                margin-left: 5px;
            }
        }
        .select-content {
            margin-top: 10px;
            box-sizing: border-box;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 5px;
            // padding-top: 25px;
            .control-box {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                margin-bottom: 5px;
                span {
                    cursor: pointer;
                    color: #409eff;
                }
                span + span {
                    margin-left: 10px;
                }
                .btnDisabled {
                    cursor: not-allowed;
                }
            }
            .group-item {
                display: flex;

                font-size: 12px;
                box-sizing: border-box;
                .item-header {
                    width: 60px;
                    display: flex;
                    line-height: 20px;
                    font-size: 12px;
                }
                .item-content {
                    flex: 1;
                    :deep(.el-checkbox) {
                        height: 20px;
                        margin-right: 10px;
                    }
                }
            }
            .group-item + .group-item {
                margin-top: 10px;
            }
            .check-box {
                width: 100%;
                max-height: 100px;
                // overflow: hidden;
            }
        }
    }

    .demo-tabs {
        font-size: 12px;
        // height: 100%;
        flex: 1;
        overflow: hidden;
        :deep(.el-tabs__header) {
            margin-bottom: 5px;
        }
        :deep(.el-tabs__content) {
            height: calc(100% - 35px);
            width: 100%;
            .el-tab-pane {
                height: 100%;
                width: 100%;
            }
        }
        :deep(.el-tabs__item) {
            font-size: 12px;
            padding: 0 10px;
            height: 30px;
        }
    }
}
</style>
