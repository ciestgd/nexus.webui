<template>
    <div class="individual-site-table" v-loading="allLoading" element-loading-text="Loading...">
        <div class="individual-tabs-box">
            <el-tabs v-model="activeTab" class="individual-tabs" v-if="props.isNation">
                <el-tab-pane label="Individual Sites Table" :name="1"></el-tab-pane>
                <el-tab-pane label="National & State avg. Table" :name="2"></el-tab-pane>
            </el-tabs>
        </div>
        <div class="individual-site-header">
            <div class="header-title">
                Screening Proximity Tabular Data Summary
                <div>
                    <span v-if="activeTab === 1" style="margin-right: 5px">Total: {{ tableData.length }}</span>
                    <Icon class="icon-button icon" :class="{ deactiveIcon: !showSelect }" name="d-arrow-right" size="14" @click="handleClickIcon" />
                </div>
            </div>

            <div class="select-box" :class="{ hiddenSelect: !showSelect }" v-if="type !== 'censusTract'">
                <div v-if="type !== 'censusTract'">
                    Radius of Analysis (km): {{ radiusValue }}
                    <!-- <el-input-number class="number-box" v-model="radiusValue" @change="handleChange" :readonly="true" :min="0.5" :max="50" size="small" controls-position="right" /> -->
                </div>
                <div>
                    <el-button size="small" @click="handleApply" v-if="false">Apply</el-button>
                    <el-button size="small" @click="exportTable" v-if="false">Output</el-button>
                </div>
            </div>
        </div>
        <div class="individual-site-table-box" v-show="activeTab == 1">
            <el-auto-resizer>
                <template #default="{ height, width }">
                    <el-table-v2 :columns="tableOneColumns" class="individual-table" :header-height="[40, 40]" :data="tableData" fixed :width="width" :height="height">
                        <template #header="props">
                            <customized-header v-bind="props" />
                        </template>
                    </el-table-v2>
                </template>
            </el-auto-resizer>
        </div>
        <div class="individual-site-table-box" v-show="activeTab == 2">
            <el-auto-resizer>
                <template #default="{ height, width }">
                    <el-table-v2 :columns="tableTwoColumns" class="individual-table" :header-height="[40, 40]" :data="nationStateData" fixed :width="width" :height="height">
                        <template #header="props">
                            <customized-header v-bind="props" />
                        </template>
                    </el-table-v2>
                </template>
            </el-auto-resizer>
        </div>
    </div>
</template>
<script setup lang="jsx">
import { getIndividualCensusTract, getIndividualStateAvg } from '@/api/emissions-facility';
import { useProjectYearStore } from '@/store/project-year';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import exportExcel from '@/libs/export-excel';
import { ElMessageBox } from 'element-plus';
import { showDialog } from '@/libs/utils';
import PercentileColorBar from './PercentileColorBar.vue';
const projectYearStore = useProjectYearStore();
const proximityAnalysisStore = useProximityAnalysisStore();
let { setRadius } = proximityAnalysisStore.layer;
const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    type: {
        type: String,
        default: '',
    },
    areaRatio: {
        type: Number,
        default: 10,
    },
    isNation: {
        type: Boolean,
        default: false,
    },
    checkList: {
        type: Array,
        default: () => [],
    },
    groupType: {
        type: String,
        default: 'pollutants',
    },
    // 初始化的geoId信息
    //geoIdsObj: {
    //    type: Array,
    //    default: () => [],
    //},
});
const activeTab = ref(1);
// const dialogTitle = computed(() => (props.isNation ? 'National sites table' : 'Individual sites table'));
const showSelect = ref(true);
const loading = ref(false);
const nationLoading = ref(false);
const tableData = ref([]);
const nationStateData = ref([]);
const radiusValue = ref(proximityAnalysisStore.radiusValue);
const allLoading = computed(() => nationLoading.value || loading.value);
const percentRankList = ref([
    'demographicIndex_PercentRank',
    'peopleOfColor_PCT_PercentRank',
    'lowIncome_PCT_PercentRank',
    'lingisO_PCT_PercentRank',
    'lesshS_PCT_PercentRank',
    'under5_PCT_PercentRank',
    'over64_PCT_PercentRank',
    'mortality_PM25_Max_PercentRank',
    'mortality_O3_Max_PercentRank',
    'cancerRisk_Max_PercentRank',
    'hazardIndex_Max_PercentRank',
    'morbidity_ERVR_PM25_Max_PercentRank',
    'morbidity_ERVR_O3_Max_PercentRank',
    'morbidity_HAD_PM25_Max_PercentRank',
    'morbidity_HAD_O3_Max_PercentRank',
    'morbidity_SLD_O3_Max_PercentRank',
    'morbidity_WLD_PM25_Max_PercentRank',
]);
const percentList = ref(['acs_Under5_PCT', 'acs_Over62_PCT']);
const individualTableOption = ref([
    {
        header: '80-90th percentile',
        key: 'percentile90',
        width: 200,
        children: [
            {
                header: 'EPA Region',
                key: 'epaRegionId',
                width: 100,
            },
            {
                header: 'State / CBSA',
                key: 'stateAbbrName',
                width: 100,
            },
        ],
    },
    {
        header: '90-95th percentile',
        key: 'percentile95',
        width: 100,
        children: [
            {
                header: 'ID',
                key: 'siteId',
                width: 100,
            },
        ],
    },
    {
        header: '95-100th percentile',
        key: 'percentile100',
        width: 200,
        children: [
            {
                header: 'Name',
                key: 'name',
                width: 200,
            },
        ],
    },
    // {
    //     header: 'Demographic Indicators',
    //     key: '',
    //     children: [
    //         {
    //             header: 'Population',
    //             key: 'population_Total',
    //             width: 100,
    //         },
    //         {
    //             header: 'Deographic Index(%title)',
    //             key: 'demographicIndex_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'People of Color group(%title)',
    //             key: 'peopleOfColor_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Low-income group(%title)',
    //             key: 'lowIncome_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Linguistic Isolation (%ile)',
    //             key: 'lingisO_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Less than high schools education (%ile)',
    //             key: 'lesshS_PCT_PercentRank',
    //             width: 200,
    //         },

    //         {
    //             header: 'Individuals under age 5 (%ile)',
    //             key: 'under5_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Individuals over age 64 (%ile)',
    //             key: 'over64_PCT_PercentRank',
    //             width: 200,
    //         },
    //     ],
    // },
    {
        header: 'AQ Mortality Risk',
        key: 'Risk',
        width: 600,
        children: [
            {
                header: 'PM2.5 risk (%ile)',
                key: 'mortality_PM25_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Ozone risk (%ile)',
                key: 'mortality_O3_Max_PercentRank',
                width: 200,
            },
            {
                // header: 'Air Toxics Cancer risk (%ile)',
                header: 'Air Toxics Cancer risk value',
                key: 'cancerRisk_Max_PercentRank',
                width: 200,
            },
            {
                // header: 'Air Toxics Non-cancer risk (%ile)',
                header: 'Air Toxics Non-cancer risk value',
                key: 'hazardIndex_Max_PercentRank',
                width: 200,
            },
        ],
    },
    {
        header: 'AQ Morbidity Risk',
        key: 'Morbidity',
        width: 900,
        children: [
            {
                header: 'ER visit-respiratory_PM25  (%ile)',
                key: 'morbidity_ERVR_PM25_Max_PercentRank',
                width: 200,
            },
            {
                header: 'ER visit-respiratory_O3  (%ile)',
                key: 'morbidity_ERVR_O3_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Hosp.Adm.-Youth-respiratory (%ile)',
                key: 'morbidity_HAD_PM25_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Hosp.Adm.-Senior-respiratory (%ile)',
                key: 'morbidity_HAD_O3_Max_PercentRank',
                width: 200,
            },
            {
                header: 'School loss days (%ile)',
                key: 'morbidity_SLD_O3_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Work loss days (%ile)',
                key: 'morbidity_WLD_PM25_Max_PercentRank',
                width: 200,
            },
        ],
    },
    {
        header: 'AQ Fused Concentration',
        key: 'Concentration',
        width: 300,
        children: [
            {
                header: 'PM2.5 Fused Conc. (μg/m³)',
                key: 'fused_PM25',
                width: 200,
            },
            {
                header: 'Ozone Fused Conc. (ppb)',
                key: 'fused_O3',
                width: 200,
            },
        ],
    },
    {
        header: 'Demographics',
        key: 'Demographics',
        width: 300,
        children: [
            {
                header: 'Under 5 Years (%)',
                key: 'acs_Under5_PCT',
                width: 200,
            },
            {
                header: 'Over 62 Years (%)',
                key: 'acs_Over62_PCT',
                width: 200,
            },
        ],
    },
]);
const nationTableOption = ref([
    {
        header: '80-90th percentile',
        key: 'percentile90',
        width: 200,
        children: [
            {
                header: 'EPA Region',
                key: 'epaRegionId',
                width: 100,
            },
            {
                header: 'State',
                key: 'stateAbbrName',
                width: 100,
            },
        ],
    },
    {
        header: '90-95th percentile',
        key: 'percentile95',
        width: 100,
        children: [
            {
                header: '# of Sites',
                key: 'sitesCount',
                width: 100,
            },
        ],
    },
    {
        header: '95-100th percentile',
        key: 'percentile100',
        width: 100,
        children: [
            {
                header: 'Population',
                key: 'population_Total',
                width: 100,
            },
        ],
    },
    // {
    //     header: 'Demographic Indicators',
    //     key: '',
    //     width: 1400,
    //     children: [
    //         {
    //             header: 'Deographic Index(%title)',
    //             key: 'demographicIndex_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'People of Color group(%title)',
    //             key: 'peopleOfColor_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Low-income group(%title)',
    //             key: 'lowIncome_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Linguistic Isolation (%ile)',
    //             key: 'lingisO_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Less than high schools education (%ile)',
    //             key: 'lesshS_PCT_PercentRank',
    //             width: 200,
    //         },

    //         {
    //             header: 'Individuals under age 5 (%ile)',
    //             key: 'under5_PCT_PercentRank',
    //             width: 200,
    //         },
    //         {
    //             header: 'Individuals over age 64 (%ile)',
    //             key: 'over64_PCT_PercentRank',
    //             width: 200,
    //         },
    //     ],
    // },
    {
        header: 'AQ Mortality Risk',
        key: 'Risk',
        width: 600,
        children: [
            {
                header: 'PM2.5 risk (%ile)',
                key: 'mortality_PM25_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Ozone risk (%ile)',
                key: 'mortality_O3_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Air Toxics Cancer risk (%ile)',
                key: 'cancerRisk_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Air Toxics Non-cancer risk (%ile)',
                key: 'hazardIndex_Max_PercentRank',
                width: 200,
            },
        ],
    },
    {
        header: 'AQ Morbidity Risk',
        key: 'Morbidity',
        width: 900,
        children: [
            {
                header: 'ER visit-respiratory_PM25  (%ile)',
                key: 'morbidity_ERVR_PM25_Max_PercentRank',
                width: 200,
            },
            {
                header: 'ER visit-respiratory_O3  (%ile)',
                key: 'morbidity_ERVR_O3_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Hosp.Adm.-Youth-respiratory (%ile)',
                key: 'morbidity_HAD_PM25_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Hosp.Adm.-Senior-respiratory (%ile)',
                key: 'morbidity_HAD_O3_Max_PercentRank',
                width: 200,
            },
            {
                header: 'School loss days (%ile)',
                key: 'morbidity_SLD_O3_Max_PercentRank',
                width: 200,
            },
            {
                header: 'Work loss days (%ile)',
                key: 'morbidity_WLD_PM25_Max_PercentRank',
                width: 200,
            },
        ],
    },
    {
        header: 'AQ Fused Concentration',
        key: 'Concentration',
        width: 300,
        children: [
            {
                header: 'PM2.5 Fused Conc. (μg/m³)',
                key: 'fused_PM25',
                width: 200,
            },
            {
                header: 'Ozone Fused Conc. (ppb)',
                key: 'fused_O3',
                width: 200,
            },
        ],
    },
    {
        header: 'Demographics',
        key: 'Demographics',
        width: 300,
        children: [
            {
                header: 'Under 5 Years (%)',
                key: 'acs_Under5_PCT',
                width: 200,
            },
            {
                header: 'Over 62 Years (%)',
                key: 'acs_Over62_PCT',
                width: 200,
            },
        ],
    },
]);
const geoIdsObjList = ref([]);
const tableOneColumns = ref([]);
const tableTwoColumns = ref([]);
const percentilColor = ref([]);
watch(
    () => proximityAnalysisStore.percentilColor.list,
    (val) => {
        percentilColor.value = val;
        percentilColor.value.forEach((item, index) => {
            individualTableOption.value[index].header = item.label;
            nationTableOption.value[index].header = item.label;
        });
        tableOneColumns.value = getColumns(individualTableOption.value);
        tableTwoColumns.value = getColumns(nationTableOption.value);
    },
    {
        deep: true,
    }
);
const resetCell = (val) => {
    let background = '';
    percentilColor.value.forEach((item) => {
        if (val >= item.min && val <= item.max) {
            background = item.bgColor;
        }
    });
    return (
        <div class="individual-column-cell" style={{ background, width: '100%', height: '100%' }}>
            {val}%
        </div>
    );
};
const handleColorChange = (key) => {
    let labels = percentilColor.value.map((item) => item.label);
    if (labels.indexOf(key) !== -1) {
        showDialog(PercentileColorBar, {
            storeKey: 'percentilColor',
        });
    }
};
const CustomizedHeader = ({ cells, columns, headerIndex }) => {
    if (headerIndex === 1) return cells;
    const groupCells = [];

    let parentObj = {};
    columns.forEach((column, columnIndex) => {
        let parent = column.parent;
        let width = cells[columnIndex].props.column.width;
        if (!parentObj[parent]) {
            parentObj[parent] = width;
        } else {
            parentObj[parent] += width;
        }
    });
    Object.keys(parentObj).forEach((key) => {
        let backgroundColor = '#fff';
        percentilColor.value.forEach((item) => {
            if (key === item.label) {
                backgroundColor = item.bgColor;
            }
        });
        const vNode = (
            <div
                class="individual-column-header custom-header-cell"
                role="columnheader"
                onClick={() => handleColorChange(key)}
                style={{
                    width: `${parentObj[key]}px`,
                    background: backgroundColor,
                }}
            >
                {key}
            </div>
        );
        groupCells.push(vNode);
    });
    return groupCells;
};
const radiusKm = computed(() => radiusValue.value * 1000);
const handleChange = () => {
    if (!props.isNation) {
        setRadius(radiusKm.value);
    }
};
const getGeoIds = async () => {
    let objList = [];
    if (props.type == 'censusTract') {
        props.data.forEach((item) => {
            objList.push({
                id: item.geoId,
                list: [item.geoId],
            });
        });
    } else {
        if (props.isNation) {
            objList = await proximityAnalysisStore.getNationGeoId(props.data, props.areaRatio, radiusKm.value);
        } else {
            objList = await proximityAnalysisStore.getGeoIdsObj(props.areaRatio);
        }
    }
    geoIdsObjList.value = objList;
    let list = objList.map((item) => item.list);
    return list;
};
const getAllGeoIdNumber = (list) => {
    let arr = [];
    list.forEach((item) => {
        arr = arr.concat(item);
    });
    return arr.length;
};
const getData = async (list) => {
    let result = await getIndividualCensusTract({
        year: projectYearStore.projectYear,
        geoIds: list,
        ejYear: projectYearStore.ejYear,
    });
    result.forEach((item, index) => {
        let dataId = geoIdsObjList.value[index].id;
        let dataItem = props.data.filter((_item) => _item.id === dataId);
        if (dataItem.length) {
            dataItem = dataItem[0];
            Object.keys(item).forEach((key) => {
                if (percentRankList.value.indexOf(key) !== -1) {
                    item[key] = Math.floor(item[key] * 100);
                } else {
                    item[key] = Math.floor(item[key] * 100) / 100;
                }
            });
            item['epaRegionId'] = dataItem['epaRegionId'];
            item['stateAbbrName'] = dataItem['stateAbbrName'];
            item['cbsaName'] = dataItem['cbsaName'];
            item['siteId'] = dataItem['id'];
            item['name'] = dataItem['name'];
        }
    });
    console.log('result', result);
    tableData.value = result;
};
const handleApply = async () => {
    await getTable();
    if (props.isNation) {
        getNationAvg();
    }
};
const getTable = async () => {
    let list = [];
    loading.value = true;
    await nextTick();
    try {
        list = await getGeoIds();
        if (!list.length) {
            await ElMessageBox.alert(`Please wait for the map to load before opening`, 'Tips', {
                confirmButtonText: 'OK',
                callback: () => {
                    loading.value = false;
                },
            });

            tableData.value = [];
            return;
        }
        let num = list.length;
        // 估计平均每条请求80ms
        let needMs = num * 80;
        // 判断估计需要多少秒
        let needSec = needMs / 1000;
        let needMin = Math.floor(needSec / 60);
        if (needSec >= 10) {
            await ElMessageBox.confirm(`This may take up to ${needMin + 1}  minute(s), would you like to continue?`, 'Tips', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'Warning',
                closeOnClickModal: false,
            })
                .then(async () => {
                    await getData(list);
                })
                .catch(() => {});
        } else {
            await getData(list);
        }
    } catch (error) {
        console.log('error', error);
    } finally {
        loading.value = false;
    }
};

const handleClickIcon = () => {
    showSelect.value = !showSelect.value;
};
const exportTable = () => {
    let name = `${props.isNation ? 'National' : 'Individual'} sites table within ${radiusValue.value}km`;
    exportXlsx(name);
};
const getNationAvg = async () => {
    try {
        nationStateData.value = [];
        nationLoading.value = true;
        let params = {
            year: projectYearStore.projectYear,
            ejYear: projectYearStore.ejYear,
        };
        if (props.groupType === 'pollutants') {
            params.pollutants = props.checkList;
        } else {
            params.sectorProjectGroups = props.checkList;
        }
        let result = await getIndividualStateAvg(params);
        result = result.splice(0);
        if (result.length) {
            let statesNum = 0;
            let allSites = 0;
            result.forEach((item, index) => {
                Object.keys(item).forEach((key) => {
                    if (percentRankList.value.indexOf(key) !== -1) {
                        item[key] = Math.floor(item[key] * 100);
                    } else if (['fused_PM25', 'fused_O3'].indexOf(key) !== -1) {
                        item[key] = Math.floor(item[key] * 100) / 100;
                    }
                });
                if (item.stateGeoId) {
                    statesNum += 1;
                }
                allSites += item.sitesCount;
            });
            result[0].epaRegionId = `CONUS (${statesNum} States)`;
            result[0].stateAbbrName = `US`;
            result[0].sitesCount = allSites;
            nationStateData.value = result;
        }
    } catch (err) {
        console.log('err', err);
    } finally {
        nationLoading.value = false;
    }
};
const cellStyleFn = (row) => {
    row.eachCell((cell) => {
        let value = cell.value;
        let reg = /^\d+%$/;
        let backgroundColor = 'ffffffff';
        if (reg.test(value)) {
            let val = value.replace(/%/gi, '');
            percentilColor.value.forEach((item) => {
                if (val >= item.min && val <= item.max) {
                    backgroundColor = item.excelColor;
                }
            });
        }
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: backgroundColor },
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'ff000000' } },
            left: { style: 'thin', color: { argb: 'ff000000' } },
            right: { style: 'thin', color: { argb: 'ff000000' } },
            bottom: { style: 'thin', color: { argb: 'ff000000' } },
        };
    });
    row.height = 40;
    return row;
};
const headerStyleFn = (row) => {
    row.eachCell((cell, colNumber) => {
        let value = cell.value;
        let backgroundColor = 'ffffffff';
        percentilColor.value.forEach((item) => {
            if (value === item.label) {
                backgroundColor = item.excelColor;
            }
        });
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: backgroundColor },
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'ff000000' } },
            left: { style: 'thin', color: { argb: 'ff000000' } },
            right: { style: 'thin', color: { argb: 'ff000000' } },
            bottom: { style: 'thin', color: { argb: 'ff000000' } },
        };
    });
    row.height = 40;
};
const getIndividualTableOption = (tableName) => {
    const columList = JSON.parse(JSON.stringify(individualTableOption.value));
    columList.forEach((item) => {
        item.width = item.width ? item.width / 10 : 20;
        if (item.children) {
            item.children.forEach((_child) => {
                _child.width = _child.width ? _child.width / 10 : 20;
            });
        }
    });
    let list = JSON.parse(JSON.stringify(tableData.value));
    const data = list.map((item) => {
        Object.keys(item).forEach((key) => {
            if (percentRankList.value.indexOf(key) !== -1 || percentList.value.indexOf(key) !== -1) {
                item[key] += '%';
            }
        });
        return item;
    });
    return {
        tableName,
        columList,
        data,
        cellStyleFn,
        headerStyleFn,
    };
};
const getNationTableOption = (tableName) => {
    const columList = JSON.parse(JSON.stringify(nationTableOption.value));
    columList.forEach((item) => {
        item.width = item.width ? item.width / 10 : 20;
        if (item.children) {
            item.children.forEach((_child) => {
                _child.width = _child.width ? _child.width / 10 : 20;
            });
        }
    });
    const list = JSON.parse(JSON.stringify(nationStateData.value));
    const data = list.map((item) => {
        Object.keys(item).forEach((key) => {
            if (percentRankList.value.indexOf(key) !== -1 || percentList.value.indexOf(key) !== -1) {
                item[key] += '%';
            }
        });
        return item;
    });
    return {
        tableName,
        columList,
        data,
        cellStyleFn,
        headerStyleFn,
    };
};
const exportXlsx = (fileName) => {
    let tableOptions = [];
    let individualOption = getIndividualTableOption('Individual Sites Table');
    tableOptions.push(individualOption);
    if (props.isNation) {
        let nationOption = getNationTableOption('National & State avg. Table');
        tableOptions.push(nationOption);
    }
    exportExcel(fileName, tableOptions);
};
const getColumns = (data) => {
    let list = [];
    data.forEach((item) => {
        let children = item.children;
        children.forEach((child) => {
            let obj = {
                key: child.key,
                dataKey: child.key,
                title: child.header,
                width: child.width ? child.width : 200,
                align: 'center',
                parent: item.header,
            };
            if (percentRankList.value.indexOf(child.key) !== -1 || percentList.value.indexOf(child.key) !== -1) {
                obj.cellRenderer = ({ cellData }) => resetCell(cellData);
            }
            list.push(obj);
        });
    });
    return list;
};
const initTable = async () => {
    try {
        loading.value = true;

        //  props.geoIdsObj;
        // let list = props.geoIdsObj
        //     .map((item) => {
        //         return item.list.filter((_item) => _item);
        //     })
        //     .filter((item) => item.length);
        setTimeout(async () => {
            console.log('initTable');
            let list = await getGeoIds();
            await getData(list);
            if (props.isNation) {
                getNationAvg();
            }
            loading.value = false;
        }, 10);
    } catch (err) {
        console.log('err', err);
        loading.value = false;
    } finally {
    }
};
onMounted(async () => {
    tableOneColumns.value = getColumns(individualTableOption.value);
    tableTwoColumns.value = getColumns(nationTableOption.value);
    percentilColor.value = proximityAnalysisStore.percentilColor.list;
    await nextTick();
    initTable();
});
</script>
<style scoped lang="scss">
.individual-site-table {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    // overflow: hidden;
    .individual-tabs-box {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0 5px;
        justify-content: space-between;
        .individual-tabs {
            :deep(.el-tabs__header) {
                margin: 0;
            }
            :deep(.el-tabs__item) {
                height: 30px;
            }
        }
    }
    .individual-site-header {
        .header-title {
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            font-size: 14px;
            font-weight: bold;
            background: #f0f0f0;
            box-sizing: border-box;
            border-bottom: 1px solid #ccc;
            .icon {
                transform: rotate(270deg);
                transition: all 0.5s;
            }
            .deactiveIcon {
                transform: rotate(90deg);
            }
        }
        .select-box {
            width: 100%;
            overflow: hidden;
            height: 30px;
            border-bottom: 1px solid #ccc;
            box-sizing: border-box;
            padding: 0 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f0f0f0;
            transition: all 0.5s;
        }
        .hiddenSelect {
            height: 0;
        }
    }
    .individual-site-table-box {
        width: 100%;
        flex: 1;
        overflow: hidden;
        .individual-table {
            :deep(.el-table-v2__row-cell) {
                padding: 0;
                color: #000;
            }
            :deep(.el-table-v2__row-cell + .el-table-v2__row-cell) {
                border-left: 1px solid #ebeef5;
            }
            :deep(.el-table-v2__header-cell) {
                color: #000;
            }
            :deep(.el-table-v2__header-cell + .el-table-v2__header-cell) {
                border-left: 1px solid #ebeef5;
            }
        }

        .sourcesTable {
            height: 100%;
            // max-height: 100%;
        }
        // overflow: hidden;
        :deep(.percentile-cell) {
            color: #000;
        }

        :deep(.el-table__cell) {
            .cell {
                color: #000;
            }
        }
    }
    &:deep(.el-vl__horizontal) {
        height: 12px !important;
    }
    &:deep(.el-vl__vertical) {
        width: 12px !important;
    }
}
</style>
<style lang="scss">
.individual-column-header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    color: #000;
    box-sizing: border-box;
}
.individual-column-header + .individual-column-header {
    border-left: 1px solid #ebeef5;
}
.individual-column-cell {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
