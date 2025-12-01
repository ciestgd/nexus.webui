<template>
    <div class="monitor-dialog">
        <div class="monitor-data">
            <div class="monitor-select">
                <div class="pollutants">
                    <div class="select-header">
                        <div class="sites-first">
                            <div class="parameter-item">
                                Top X Sites:
                                <ParameterTip
                                    content="Users can set the X value by clicking the up and down arrow or inputting a number, to display the top X sites in concentration rank. The default value is 100."
                                />
                                <el-input-number v-model="topCount" class="sites-number" @change="resetTox" size="small" :min="1" controls-position="right" />
                            </div>
                            <div class="parameter-item" style="margin-left: 5px">
                                Monitor Year:
                                <!-- <ParameterTip
                                    content="Users can select a year in the drop-down box, and the species concentration in the Display Panel will be sorted according to the data from the current year of selection."
                                /> -->
                                <el-select class="select" style="width: 65px" @change="resetYear" v-model="monitorYear" placeholder="Select" size="small">
                                    <el-option v-for="item in monitorYearOptions" :key="item" :label="item" :value="item" />
                                </el-select>
                            </div>
                            <div class="radio-content">
                                <el-radio-group v-model="dataType">
                                    <el-radio :value="1">Table</el-radio>
                                    <el-radio :value="2">Chart</el-radio>
                                </el-radio-group>
                            </div>
                        </div>
                        <div class="pollutants-first">
                            <!-- <div class="parameter-item">
                                Include Monitor Year Since:
                                <ParameterTip
                                    content="Users can select a year in the drop-down box, it supports filtering the monitoring sites that have data for the current year of selection and subsequent years"
                                />
                                <el-select class="select" style="width: 65px" v-model="sinceYear" @change="resetYear" placeholder="Select" size="small">
                                    <el-option v-for="item in monitorYearOptions" :key="item" :label="item" :value="item" />
                                </el-select>
                            </div> -->
                            <el-button type="primary" size="small" @click="exportData" style="margin-left: 3px">Output</el-button>
                        </div>
                    </div>
                    <div class="pollutants-second">
                        <div class="select-box" v-for="(item, index) in monitorList">
                            <el-checkbox v-model="item.check" :style="[index == 3 ? 'margin-right: 0px' : '']" :label="item.checkboxLable" size="small" />
                            <el-select
                                v-if="item.key === 'GAS' || item.key === 'HAPs'"
                                class="select"
                                style="width: 90px; margin-left: 5px"
                                v-model="item.pollutantType"
                                @change="handlePollutantTypeChange(item.key)"
                                placeholder="Select"
                                size="small"
                            >
                                <el-option v-for="_item in item.key === 'GAS' ? GASOptions : HAPsOptions" :key="_item.value" :label="_item.label" :value="_item.value" />
                            </el-select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="monitor-content" v-loading="loading" element-loading-background="#fff" element-loading-text="Loading...">
                <div class="monitor-content-main" ref="monitorContent">
                    <div class="monitor-content-list" v-show="dataType === 1">
                        <div class="monitor-content-item" v-for="_item in monitorList.filter((item) => item.check)">
                            <div
                                class="monitor-content-header-item"
                                :class="[activeLayerType === _item.key && checkModel ? 'active-header-item' : '']"
                                @click="handleHeaderClick(_item.key)"
                            >
                                {{ _item.label }}
                                <span class="head_icon" :class="_item.className"></span>
                            </div>
                            <MonitorSite
                                v-for="(item, index) in _item.data"
                                @handleHover="setActiveItem"
                                @handleMenu="setMenu"
                                :colorList="monitorSiteStore.colorList"
                                :activeSiteId="activeSiteData.data.siteId"
                                :key="index"
                                :data="item"
                                @handleChoose="(val) => setMapIcon(val, _item.key)"
                                :type="
                                    _item.key === 'GAS'
                                        ? _item.pollutantType === 'gas_VOC_HAPs'
                                            ? 'Total'
                                            : _item.pollutantType
                                        : _item.key === 'HAPs'
                                        ? _item.pollutantType === 'heavy_Metal_HAPs'
                                            ? 'Total'
                                            : _item.pollutantType
                                        : _item.pollutantType
                                "
                            />
                        </div>
                    </div>
                    <div class="monitor-content-list" style="flex-wrap: wrap" v-show="dataType === 2">
                        <div class="monitor-chart-item" v-for="item in monitorList.filter((item) => item.check)">
                            <MonitorChart
                                :dataType="props.dataType"
                                :unit="item.unit"
                                :topCount="topCount"
                                :data="item.data"
                                :label="getChartLabel(item)"
                                :type="item.key"
                                :rankingYear="monitorYear"
                            />
                        </div>
                    </div>
                </div>
                <div class="tips-box">
                    <div class="monitor-content-tips">Click the pollutant title to overlay monitor sites on Map;Click the marker to view in Map</div>
                </div>
            </div>
        </div>
        <Tooltip :append-ref="monitorContent" ref="tooltipRef" effect="customized">
            <div class="popper-detail-content">
                <div class="detail-content-item">Location: {{ activeSiteData.data.countyName }},{{ activeSiteData.data.stateAbbrName }}</div>
                <div class="detail-content-item">Site:{{ activeSiteData.data.siteId }},{{ activeSiteData.data.siteName }}</div>
                <div class="detail-content-item">
                    {{ activeSiteData.type }}{{ activeSiteData.type === 'O3' ? '(ppb)' : '(μg/m³)' }}:
                    <span>{{ activeSiteData.data.value !== null ? activeSiteData.data.value : 'N/A' }}</span>
                </div>
            </div>
        </Tooltip>
        <Tooltip ref="menuRef" :append-ref="monitorContent" effect="light" placement="right" trigger="contextmenu" :enterable="true">
            <div class="menu-content">
                <div class="color-list">
                    <span class="color-item" @click="setSourceColor(item)" v-for="item in markColorList" :style="{ background: item }"></span>
                </div>
                <div @click="handleColorClear" class="color-clear-btn">Clear Selected Color</div>
                <div @click="handleColorAllClear" class="color-clear-btn">Clear All Colors</div>
            </div>
        </Tooltip>
    </div>
</template>

<script setup>
import MonitorSite from './MonitorSite.vue';
import MonitorChart from './MonitorChart.vue';
import { initYear, monitorYearOptions } from '@/libs/year-options';
import { gasVocHapsOptions, heavyMetalHapsOptions } from '@/libs/haps-options';
import { useMonitorSiteStore } from '@/store/monitor-site';
import { markColorList } from '@/libs/color-list';
import { OverlayScrollbars } from 'overlayscrollbars';
import { getPM25MonitorData, getO3MonitorData, getAirToxicMonitorData } from '@/api/monitor-data.js';
import exportExcel from '@/libs/export-excel';
const monitorSiteStore = useMonitorSiteStore();
const { showMapLayer, setOneMapIcon, clearMap, setSteps } = monitorSiteStore.layer;
const props = defineProps({
    count: {
        type: Number,
        default: 20,
    },
    data: {
        type: Array,
        default: [],
    },

    loading: {
        type: Boolean,
        default: false,
    },
    fileName: {
        type: String,
        default: 'Major Point Scources',
    },
    dataType: {
        type: String,
        default: 'MonitorSites',
    },
    model: {
        type: Object,
        default: () => {},
    },
});
const emits = defineEmits(['handlePollutantChange', 'resetTopx', 'resetYear', 'handleLoading']);

const loading = ref(false);
const checkModel = computed(() => monitorSiteStore.dataType === props.dataType);
const topCount = ref(props.count);
const dataType = ref(1);
// const rankingYear = ref(2020);
// const sinceYear = ref(2020);
const monitorYear = ref(2020);
const menuActiveId = ref();
const activeColor = ref();

const activeSiteData = ref({
    data: {},
    type: '',
});
const tooltipRef = ref();
const menuRef = ref();
const monitorList = ref([
    {
        label: 'PM2.5',
        pollutantType: 'PM2.5',
        checkboxLable: 'PM2.5 (Annual avg).',
        key: 'PM25',
        check: true,
        unit: 'μg/m³',
        className: 'header_triangle',
        data: [],
    },
    {
        label: 'O3',
        pollutantType: 'O3',
        checkboxLable: 'O3 (MDA8 DVs)',
        key: 'O3',
        check: true,
        unit: 'ppb',
        className: 'header_start',
        data: [],
    },
    {
        label: 'GAS.VOC HAPS',
        pollutantType: 'gas_VOC_HAPs',
        checkboxLable: 'GAS & VOC HAPs: ',
        key: 'GAS',
        check: true,
        unit: 'μg/m³',
        className: 'header_rhombus',
        data: [],
    },
    {
        label: 'HEAVY METAL HAPS',
        pollutantType: 'heavy_Metal_HAPs',
        checkboxLable: 'Heavy Metal HAPs: ',
        key: 'HAPs',
        check: true,
        unit: 'μg/m³',
        className: 'header_square',
        data: [],
    },
]);

const GASOptions = ref([
    {
        value: 'gas_VOC_HAPs',
        label: 'Total',
    },
]);
const HAPsOptions = ref([
    {
        value: 'heavy_Metal_HAPs',
        label: 'Total',
    },
]);
gasVocHapsOptions.forEach((item) => {
    GASOptions.value.push({
        value: item,
        label: item,
    });
});

heavyMetalHapsOptions.forEach((item) => {
    HAPsOptions.value.push({
        value: item,
        label: item,
    });
});
const getChartLabel = (data) => {
    let label = data.label;
    if (data.key === 'GAS') {
        let pollutantType = GASOptions.value.find((item) => item.value === data.pollutantType)?.label;
        if (pollutantType) {
            label = `${label}(${pollutantType})`;
        }
    } else if (data.key === 'HAPs') {
        let pollutantType = HAPsOptions.value.find((item) => item.value === data.pollutantType)?.label;
        if (pollutantType) {
            label = `${label}(${pollutantType})`;
        }
    }
    return `${label}`;
};
const setActiveItem = (data, currentTarget) => {
    activeSiteData.value = data;
    tooltipRef.value.resetData(currentTarget);
};
const showLayer = (type) => {
    let options = [];
    monitorList.value.forEach((item) => {
        if (item.key === type) {
            options = item.data;
        }
    });

    const imgType = {
        PM25: 'triangle',
        O3: 'start',
        HAPs: 'rhombus',
        GAS: 'square',
    };
    setSteps(options.length);
    showMapLayer(options, imgType[type], monitorSiteStore.setFeatureFn);
};

const resetTox = () => {
    setSteps(topCount.value);
    emits('resetTopx', topCount.value);
    getAllData();
};
const resetYear = () => {
    getAllData();
};

let activeLayerType = ref(monitorSiteStore.type);
watch(
    () => props.count,
    (val) => {
        topCount.value = val;
        getAllData();
    },
    { deep: true }
);
watch(
    () => props.model,
    () => {
        if (props.dataType === 'MonitorSites') {
            getAllData();
        } else {
            if (props.model['countyGeoId'].length) {
                getAllData();
            } else {
                monitorList.value.forEach((item) => (item.data = []));
                resetLayer();
            }
        }
    },
    { deep: true }
);
watch(
    () => monitorSiteStore.type,
    (val) => {
        activeLayerType.value = val;
        if (!val) {
            monitorSiteStore.selectId = null;
        }
    }
);
watch(loading, (val) => emits('handleLoading', val), { deep: true });
const setMapIcon = (val, key) => {
    let { type, pollutantType, siteId } = val.value;
    monitorSiteStore.selectId = siteId;
    handleHeaderClick(key);
    monitorSiteStore.clearOtherLayer();
    setOneMapIcon([val.value], monitorSiteStore.setFeatureFn);
    getSelectData(siteId, type, pollutantType);
};
const handleHeaderClick = (type) => {
    if (activeLayerType.value !== type || monitorSiteStore.dataType !== props.dataType) {
        monitorSiteStore.type = type;
        monitorSiteStore.dataType = props.dataType;
        showLayer(type);
    }
};
const handlePollutantTypeChange = async (type) => {
    if (type === 'GAS') {
        await getGASVOCHAPsData();
    } else if (type === 'HAPs') {
        await getHeavyMetalHAPsData();
    }
    if (activeLayerType.value === type) {
        showLayer(type);
    }
};

const getSelectData = async (siteId, type, pollutantType) => {
    monitorSiteStore.getSelectData(siteId, type, pollutantType);
};
const monitorContent = ref();

const exportData = async () => {
    let columns = [
        {
            header: 'Ranking #',
            key: 'index',
            width: 10,
        },
    ];
    let tableData = [];
    monitorList.value.forEach((item) => {
        if (item.check) {
            let obj = {
                header: item.label,
                key: item.key,
            };
            columns.push(obj);
            let label = item.label;
            if (item.key === 'GAS') {
                label = item.pollutantType === 'gas_VOC_HAPs' ? 'Total' : item.pollutantType;
            } else if (item.key === 'HAPs') {
                label = item.pollutantType === 'heavy_Metal_HAPs' ? 'Total' : item.pollutantType;
            }
            item.data.forEach((value, index) => {
                let data = tableData[index];
                let infoData = {
                    countyName: value.countyName,
                    stateAbbrName: value.stateAbbrName,
                    siteId: value.siteId,
                    siteName: value.siteName,
                    label: `${label} (${item.unit})`,
                    value: value.value,
                };
                if (data) {
                    data[item.key] = infoData;
                } else {
                    let obj = {};
                    obj[item.key] = infoData;
                    obj['index'] = index + 1;
                    tableData.push(obj);
                }
            });
        }
    });

    const cellStyleFn = (row) => {
        row.eachCell((cell) => {
            let value = cell.value;
            if (Object.prototype.toString.call(value) === '[object Object]') {
                let arr = [
                    {
                        text: `Location: ${value.countyName}, ${value.stateAbbrName}\n`,
                    },
                    {
                        text: `Site: ${value.siteId}, ${value.siteName}\n`,
                    },
                    {
                        text: `${value.label}: ${value.value !== null ? value.value : 'N/A'}`,
                    },
                ];
                cell.value = {
                    richText: arr,
                };
                if (activeSiteData.value.data.siteId == value.siteId) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'ffffff00' },
                    };
                }
            }
            cell.alignment = { wrapText: true };
        });
        row.height = 60;
        return row;
    };
    columns.forEach((item) => {
        item.width = item.width ? item.width : 60;
    });
    let fileName = props.fileName;
    exportExcel(fileName, [
        {
            tableName: 'sheet',
            columList: columns,
            data: tableData,
            cellStyleFn,
            headerStyleFn: null,
        },
    ]);
};
const getAllData = () => {
    loading.value = true;
    setTimeout(async () => {
        await Promise.all([getPM25Data(), getO3Data(), getGASVOCHAPsData(), getHeavyMetalHAPsData()]);
        resetLayer();
        loading.value = false;
    }, 100);
};
const getDataFn = async (type, pollutantType) => {
    let geoIdList = {
        ...props.model,
    };

    let apiFn = {
        PM25: getPM25MonitorData,
        O3: getO3MonitorData,
        AirToxic: getAirToxicMonitorData,
    };
    let result = [];
    if (type === 'AirToxic') {
        result = await apiFn[type](monitorYear.value, topCount.value, pollutantType, monitorYear.value, geoIdList);
    } else {
        result = await apiFn[type](monitorYear.value, topCount.value, monitorYear.value, geoIdList);
    }
    let list = result.map((item, index) => {
        item.value = item.value !== null ? Math.floor(item.value * 100) / 100 : null;
        item.type = type;
        item.pollutantType = pollutantType;
        item.ranking = index;
        return item;
    });
    return list;
};
const getPM25Data = async () => {
    let result = await getDataFn('PM25', '');
    result.forEach((item) => (item.basePollutantType = 'PM25'));
    monitorList.value.forEach((item) => {
        if (item.key === 'PM25') {
            item.data = result.filter((item) => item.value === null || (item.value && item.value > 0));
        }
    });
};

const getO3Data = async () => {
    let result = await getDataFn('O3', '');
    result.forEach((item) => (item.basePollutantType = 'O3'));
    monitorList.value.forEach((item) => {
        if (item.key === 'O3') {
            item.data = result.filter((item) => item.value === null || (item.value && item.value > 0));
        }
    });
};
const getGASVOCHAPsData = async () => {
    let item = monitorList.value.filter((item) => item.key === 'GAS')[0];
    let result = await getDataFn('AirToxic', item.pollutantType);
    result.forEach((item) => (item.basePollutantType = 'Gas_VOC_HAPs'));
    monitorList.value.forEach((item) => {
        if (item.key === 'GAS') {
            item.data = result;
        }
    });
};
const getHeavyMetalHAPsData = async () => {
    let item = monitorList.value.filter((item) => item.key === 'HAPs')[0];
    let result = await getDataFn('AirToxic', item.pollutantType);
    result.forEach((item) => (item.basePollutantType = 'Heavy_Metal_HAPs'));
    monitorList.value.forEach((item) => {
        if (item.key === 'HAPs') {
            item.data = result;
        }
    });
};
onMounted(async () => {
    await nextTick();
    OverlayScrollbars(monitorContent.value, {
        overflow: {
            x: 'scroll',
            y: 'scroll',
        },
    });
    monitorSiteStore.dataType = props.dataType;
    if (props.dataType === 'MonitorSites') {
        getAllData();
    }
});
const setMenu = (data, currentTarget) => {
    menuActiveId.value = data.siteId;
    let color = monitorSiteStore.colorList && monitorSiteStore.colorList[menuActiveId.value];
    activeColor.value = color ? color : '';
    menuRef.value.resetData(currentTarget);
};
const closeMenu = () => {
    menuRef.value.hiddenTips();
};
const setSourceColor = (item) => {
    monitorSiteStore.colorList[menuActiveId.value] = item;
    closeMenu();
};
const handleColorClear = () => {
    if (monitorSiteStore.colorList[menuActiveId.value]) {
        monitorSiteStore.colorList[menuActiveId.value] = null;
    }
    closeMenu();
};
const handleColorAllClear = () => {
    monitorSiteStore.colorList = {};
    closeMenu();
};
const resetLayer = () => {
    showLayer(activeLayerType.value);
};
defineExpose({ resetLayer });
</script>
<style lang="scss" scoped>
.monitor-dialog {
    box-sizing: border-box;
    padding: 5px;
    height: 100%;
    .monitor-data {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .monitor-select {
        display: flex;
        width: 100%;
        font-size: 12px;
        overflow: hidden;
        .pollutants {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #ccc;
            .select-header {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                justify-content: space-between;
                padding: 5px;
            }
            .sites-first {
                height: 34px;
                display: flex;
                align-items: center;
                .sites-number {
                    width: 80px;
                }
                .radio-content {
                    margin-left: 5px;
                    :deep(.el-radio) {
                        margin-right: 10px;
                    }
                }
            }
            .pollutants-first {
                display: flex;
                align-items: center;
            }
            .pollutants-second {
                border-top: 1px solid #ccc;
                box-sizing: border-box;
                padding: 5px 5px;
                display: flex;
                flex-wrap: wrap;
                .district-select-box {
                    :deep(.item) {
                        margin-right: 5px;
                    }
                }
                .el-checkbox {
                    margin-right: 5px;
                    margin-bottom: 5px;
                }
                .select-box {
                    display: flex;
                    align-items: center;
                    margin-right: 5px;
                }
            }
        }
    }
    .monitor-content {
        margin-top: 5px;
        overflow: hidden;
        flex: 1;
        display: flex;
        flex-direction: column;

        .monitor-content-main {
            flex: 1;
            width: 100%;
            .monitor-content-list {
                display: flex;
                min-height: 100%;
                width: 100%;
                .monitor-content-item {
                    min-height: 100%;
                    width: 24.5%;
                    min-width: 150px;
                    border: 1px solid #000;
                    border-top: none;
                    box-sizing: border-box;
                    position: relative;
                    .monitor-content-header-item {
                        border-top: 1px solid #000;
                        position: sticky;
                        top: 0px;
                        width: 100%;
                        font-size: 12px;
                        font-style: italic;
                        cursor: pointer;
                        color: var(--point-color);
                        text-decoration: underline;
                        height: 26px;
                        line-height: 26px;
                        background: #ffffe1;
                        display: flex;
                        align-items: center;
                        box-sizing: border-box;
                        padding-left: 5px;
                        .header_triangle {
                            display: inline-block;
                            width: 0;
                            height: 0;
                            border: 7px solid var(--point-color);
                            border-bottom-color: transparent;
                            border-left-color: transparent;
                            border-right-color: transparent;
                            margin-left: 5px;
                            position: relative;
                            top: 5px;
                        }
                        .header_start {
                            position: relative;
                            width: 0px;
                            height: 0px;
                            border-color: var(--point-color) transparent transparent transparent;
                            border-width: 7.26px 10.62px;
                            border-style: solid;
                            top: 4px;
                            margin-left: 7px;
                        }

                        .header_start::before {
                            content: '';
                            display: block;
                            position: absolute;
                            left: -10.62px;
                            top: -7.26px;
                            border-color: var(--point-color) transparent transparent transparent;
                            border-width: 7.26px 10.62px;
                            border-style: solid;
                            transform: rotate(72deg);
                            transform-origin: 50% 22.5%;
                        }

                        .header_start::after {
                            content: '';
                            display: block;
                            position: absolute;
                            left: -10.62px;
                            top: -7.26px;
                            border-color: var(--point-color) transparent transparent transparent;
                            border-width: 7.26px 10.62px;
                            border-style: solid;
                            transform: rotate(-72deg);
                            transform-origin: 50% 22.5%;
                        }
                        .header_rhombus {
                            display: inline-block;
                            width: 12px;
                            height: 12px;
                            background: var(--point-color);
                            margin-left: 10px;
                            transform: rotate(45deg);
                        }
                        .header_square {
                            display: inline-block;
                            width: 12px;
                            height: 12px;
                            background: var(--point-color);
                            margin-left: 10px;
                        }
                    }
                    .active-header-item {
                        color: #fff;
                        background: var(--point-color);
                        .header_triangle {
                            border: 7px solid #fff;
                            border-bottom-color: transparent;
                            border-left-color: transparent;
                            border-right-color: transparent;
                        }
                        .header_start {
                            border-color: #fff transparent transparent transparent;
                            &::before {
                                border-color: #fff transparent transparent transparent;
                            }
                            &::after {
                                border-color: #fff transparent transparent transparent;
                            }
                        }
                        .header_rhombus {
                            background: #fff;
                        }
                        .header_square {
                            background: #fff;
                        }
                    }
                    .monitor-content-item-detail-active {
                        background: #b9d1ea;
                    }
                }
                .monitor-chart-item {
                    width: 100%;
                    // min-height: 100%;
                    // min-width: 150px;
                    // display: flex;
                    // flex-wrap: wrap;
                }
                .monitor-content-item + .monitor-content-item {
                    margin-left: 5px;
                }
            }
        }
        .tips-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .monitor-content-tips {
            // height: 26px;
            line-height: 26px;
            font-size: 12px;
            color: green;
            width: 100%;
        }
    }
}
.menu-content {
    width: 140px;
    background: #fff;

    .color-list {
        display: flex;
        align-items: center;
        // justify-content: space-around;
        flex-wrap: wrap;
        .color-item {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 2px 2px;
        }
    }
    .color-clear-btn {
        font-size: 14px;
        cursor: pointer;
        height: 20px;
        margin-top: 5px;
    }
}
.parameter-item {
    display: flex;
    align-items: center;
}
</style>
