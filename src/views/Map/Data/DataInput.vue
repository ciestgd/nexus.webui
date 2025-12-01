<template>
    <div class="data-input">
        <div class="breadcrumb-content">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/map' }">Map</el-breadcrumb-item>
                <el-breadcrumb-item>Data Input Files</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="returnBtn">
                <el-tooltip effect="customized" content="Back home" placement="bottom">
                    <el-button type="danger" @click="gotoHome">
                        <Icon class="icon-button icon" name="close" size="20" />
                    </el-button>
                </el-tooltip>
                <!-- <el-tooltip effect="customized" content="Back home" placement="bottom">
                    <el-button @click="gotoHome" type="primary">Back Home<Icon class="icon-button icon" style="margin-left: 5px" name="forward" size="20" /> </el-button>
                </el-tooltip> -->
            </div>
        </div>
        <div class="data-input-content">
            <div class="sidebar-content" :class="[!sidebarShow ? 'sidebar-deactive' : '']">
                <div class="sidebar-title">
                    <div v-if="sidebarShow">Data Input Files</div>
                    <div>
                        <Icon class="icon-button icon" v-if="!sidebarShow" name="d-arrow-left" size="18" @click="sidebarSet" />
                        <Icon class="icon-button icon" v-if="sidebarShow" name="d-arrow-right" size="18" @click="sidebarSet" />
                    </div>
                </div>
                <div class="sidebar-box" v-if="sidebarShow" ref="sidebarRef">
                    <el-collapse v-model="activeNames" class="collapse">
                        <el-collapse-item :name="index" v-for="(item, index) in fileList" :key="index">
                            <template #title>
                                <span class="title" @mouseover="(e) => hoverItem(index, e.currentTarget)">{{ item.title }}</span>
                            </template>
                            <div class="file-list">
                                <FileItem :activeTitle="activeTitle" v-for="item in item.list" @on-tables="handleTablesData" @on-view="handleView" :data="item" />
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
            <div class="main-content">
                <div class="main-select">
                    <el-dropdown trigger="click" :hide-on-click="false" :max-height="200">
                        <div class="column-select"><Icon class="icon-button icon" name="sort" size="18" />Column</div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-checkbox style="margin-left: 10px" v-model="checkboxAll" @change="handleCheckAllChange" :indeterminate="isIndeterminate" size="small">
                                    All Select
                                </el-checkbox>
                                <el-dropdown-item v-for="item in columnList">
                                    <el-checkbox v-model="item.checkbox" :label="item.value" size="small">{{ item.label }}</el-checkbox>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <div class="select-item" v-if="tableSelectOptions.length">
                        Table:
                        <el-select v-model="activeTable" placeholder="Select" style="margin-left: 5px; width: 250px" @change="handleTableChange" size="small">
                            <el-option v-for="item in tableSelectOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </div>
                    <div class="select-item">
                        KeyWord:<el-input style="margin-left: 5px" @input="filterData" v-model="quaram.keyword" placeholder="Please input" size="small" />
                    </div>
                    <div class="select-item">
                        <el-checkbox v-model="checkbox" @click="checkboxChange"></el-checkbox>
                        <div class="select-item-title">Use filter</div>
                        <el-select v-model="sqlQuaram.key" :disabled="!checkbox" placeholder="Select" style="margin-left: 5px" size="small">
                            <el-option v-for="item in options" :key="item" :label="item" :value="item" />
                        </el-select>
                        <el-select v-model="sqlQuaram.term" :disabled="!checkbox" placeholder="Select" style="margin-left: 5px" size="small">
                            <el-option v-for="item in filterConditionOptions" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                        <el-input v-model="sqlQuaram.keyword" :disabled="!checkbox" style="margin-left: 5px; width: 200px" placeholder="Please input" size="small" />
                        <Icon class="icon-button icon" name="add" size="20" v-if="checkbox" @click="addSelectItem" />
                    </div>
                    <el-button size="small" type="primary" style="margin-left: 5px" @click="handleFilter">Apply</el-button>
                    <el-button size="small" type="primary" @click="resetData">Reset</el-button>
                    <!-- <el-button size="small" type="primary" @click="exportRecord">Export</el-button> -->
                    <el-dropdown trigger="hover" :hide-on-click="true" :max-height="200">
                        <el-button size="small" type="primary" style="margin-left: 10px">Export</el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="exportRecord">Save current page records</el-dropdown-item>
                                <el-dropdown-item @click="downloadFile">Save all records</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <div class="more-condition">
                    <div class="more-condition-item" v-for="(item, index) in selectlist">
                        <el-select v-model="item.type" placeholder="Select" style="width: 80px" size="small">
                            <el-option v-for="item in andOrOptions" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                        <el-select v-model="item.key" placeholder="Select" style="margin-left: 5px" size="small">
                            <el-option v-for="item in options" :key="item" :label="item" :value="item" />
                        </el-select>
                        <el-select v-model="item.term" placeholder="Select" style="margin-left: 5px; width: 80px" size="small">
                            <el-option v-for="item in filterConditionOptions" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                        <el-input v-model="item.keyword" style="margin-left: 5px; width: 300px" placeholder="Please input" size="small" />
                        <Icon class="icon-button icon" name="close" size="20" @click="delectSelectItem(index)" />
                    </div>
                </div>

                <div class="main-table">
                    <el-table
                        border
                        class="table-box"
                        highlight-current-row
                        v-loading="loading"
                        element-loading-text="Loading..."
                        :data="tableData"
                        size="small"
                        @sort-change="handleSortChange"
                    >
                        <el-table-column
                            :prop="item.value"
                            align="center"
                            min-width="250"
                            max-width="400"
                            :label="item.label"
                            v-for="item in columnList.filter((val) => val.checkbox)"
                            :key="item.value"
                            sortable="custom"
                        >
                            <template #header="scope">
                                <div class="table-box-header">{{ scope.column.label }}</div>
                            </template>
                            <template #default="scope">
                                <div class="table-box-row">{{ scope.row[item.value] }}</div>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="main-pagination">
                        <el-pagination
                            class="pagination"
                            v-model:current-page="quaram.pageNumber"
                            v-model:page-size="quaram.pageSize"
                            :page-sizes="[50, 100, 200, 500, 1000]"
                            size="small"
                            layout="total, sizes, prev, pager, next"
                            :total="total"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                        />
                    </div>
                </div>
            </div>
        </div>
        <el-tooltip
            placement="top-start"
            ref="tooltipRef"
            :hide-after="0"
            :enterable="false"
            v-model:visible="tooltipVisible"
            :virtual-ref="detailRef"
            virtual-triggering
            :append-to="sidebarRef"
            effect="customized"
            :content="getTooltip(activeNames.indexOf(activeIndex) === -1)"
        >
        </el-tooltip>
    </div>
</template>

<script>
export default {
    name: 'Data',
};
</script>
<script setup>
import { OverlayScrollbars } from 'overlayscrollbars';
import { andOrOptions, filterConditionOptions } from '@/libs/filter-options.js';
import exportExcel from '@/libs/export-excel';
import FileItem from './FileItem.vue';
const router = useRouter();
const activeNames = ref([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const activeFileName = ref();
const activeFilePath = ref();
const activeIndex = ref();
const activeTitle = ref();
const activeTable = ref();
const getTooltip = (collapse) => (collapse ? 'Expand this panel' : 'Collapse this panel');
const sidebarRef = ref();
const sidebarShow = ref(true);
const checkboxAll = ref(false);
const isIndeterminate = ref(true);
onMounted(async () => {
    await nextTick();
    setTimeout(() => {
        activeTitle.value = 'mortalityRiskData';
    }, 0);
    OverlayScrollbars(sidebarRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
});
const tooltipVisible = ref(false);
const detailRef = ref();
const tableData = ref([]);
const baseTableData = ref([]);
const options = ref([]);
// 原始数据
const baseData = ref([]);
// 多表的情况
const tableSelectOptions = ref([]);
const tablesData = ref({});

const columnList = ref([]);
const hoverItem = (index, currentTarget) => {
    detailRef.value = currentTarget;
    tooltipVisible.value = true;
    activeIndex.value = index;
};
const exportRecord = () => {
    let columns = options.value.map((item) => {
        return {
            header: item,
            key: item,
            width: 30,
        };
    });
    let fileName = activeFileName.value;
    if (fileName.includes('.csv')) {
        fileName = fileName.replace(/.csv/gi, '');
    }
    exportExcel(fileName, [
        {
            tableName: 'sheet',
            columList: columns,
            data: tableData.value,
            cellStyleFn: null,
            headerStyleFn: null,
        },
    ]);
};
const downloadFile = () => {
    let filePath = activeFilePath.value;
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = filePath;
    a.download = activeFileName.value;
    a.click();
};
const handleSizeChange = (val) => {
    quaram.pageNumber = 1;
    quaram.pageSize = val;
    getTableData();
};
const handleCurrentChange = (val) => {
    quaram.pageNumber = val;
    getTableData();
};
const loading = ref(false);
const formatData = (heads, data) => {
    options.value = heads;
    baseData.value = data;
    columnList.value = options.value.map((item, index) => {
        return {
            value: item,
            label: item,
            checkbox: index <= 8,
        };
    });
    resetData();
};
const handleView = (heads, data, fileName, title, filePath) => {
    activeFilePath.value = filePath;
    if (activeFileName.value === fileName) return;
    activeFileName.value = fileName;
    activeTitle.value = title;
    formatData(heads, data);
};
const handleTablesData = (options, data) => {
    tableSelectOptions.value = options || [];
    tablesData.value = data;
    activeTable.value = tableSelectOptions.value[0];
};
const handleTableChange = () => {
    let { headList, list } = tablesData.value[activeTable.value];
    formatData(headList, list);
};
const resetData = () => {
    quaram.keyword = '';
    resetSelect();
    checkbox.value = false;
    quaram.pageNumber = 1;
    quaram.pageSize = 50;
    getTableData();
};
const getFilterData = () => {
    quaram.pageNumber = 1;
    getTableData();
};
const debounce = (func, wait) => {
    var timeout;
    return function () {
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(args);
        }, wait);
    };
};
const filterData = debounce(getFilterData, 800);
const filterItem = (data, { key, term, keyword }) => {
    let flag = false;
    let word = keyword.trim();
    let _itemValue = data[key];
    if (!key) return true;
    switch (term) {
        case 'equal':
            flag = _itemValue == word;
            break;
        case 'greaterThanOrEqual':
            flag = _itemValue >= word;
            break;
        case 'lessThanOrEqual':
            flag = _itemValue <= word;
            break;
        case 'startWith':
            flag = _itemValue && _itemValue.startsWith(word);
            break;
        case 'endwith':
            flag = _itemValue && _itemValue.endsWith(word);
            break;
        case 'contains':
            flag = _itemValue && _itemValue.includes(word);
            break;
        case 'isNot':
            flag = _itemValue != word;
            break;
    }
    return flag;
};
const handleFilter = () => {
    quaram.pageNumber = 1;
    quaram.pageSize = 50;
    getTableData();
};
const useFilterFn = (item) => {
    let flag = false;
    let sqlMainflag = filterItem(item, sqlQuaram);
    if (selectlist.value.length) {
        let sqlStr = '';
        selectlist.value.forEach((val) => {
            sqlStr += (val.type === 'or' ? '||' : '&&') + filterItem(item, val);
        });
        flag = eval(sqlMainflag + sqlStr);
    } else {
        flag = sqlMainflag;
    }
    return flag;
};
const useKeyWordFilter = (item, keyword) => {
    let flag = false;
    Object.keys(item).forEach((key) => {
        if (item[key] && item[key].includes(keyword)) {
            flag = true;
        }
    });
    return flag;
};
const compare = (key, order) => {
    return function (a, b) {
        let value1 = format(a[key]);
        let value2 = format(b[key]);
        if (value2 < value1) {
            return order == 'descending' ? -1 : 1;
        } else if (value2 > value1) {
            return order == 'descending' ? 1 : -1;
        } else {
            return 0;
        }
    };
};
const handleSortChange = ({ column, prop, order }) => {
    let list = [].concat(baseTableData.value);
    if (!order) {
        tableData.value = list;
        return;
    }
    list.sort(compare(prop, order));
    tableData.value = list;
};
const getFilterTableData = () => {
    return new Promise(async (resolve, reject) => {
        let resultData = baseData.value || [];
        let keyword = quaram.keyword.trim();
        if (keyword || checkbox.value) {
            resultData = await resultData.filter((item) => {
                let flag = keyword ? useKeyWordFilter(item, keyword) : true;
                let sqlFlag = checkbox.value ? useFilterFn(item) : true;
                return flag && sqlFlag;
            });
        }
        resolve(resultData);
    });
};
const format = (text) => {
    const number = parseFloat(text);
    if (Number.isNaN(number)) {
        return text;
    } else {
        return number;
    }
};
const getTableData = async () => {
    loading.value = true;
    tableData.value = [];
    try {
        let startIndex = (quaram.pageNumber - 1) * quaram.pageSize;
        let endIndex = quaram.pageNumber * quaram.pageSize;
        setTimeout(async () => {
            let resultData = await getFilterTableData();
            total.value = resultData.length;
            let list = resultData.slice(startIndex, endIndex);
            tableData.value = [].concat(list);
            baseTableData.value = [].concat(list);
            loading.value = false;
        }, 800);
    } catch (error) {
    } finally {
    }
};
const sidebarSet = async () => {
    sidebarShow.value = !sidebarShow.value;
    if (sidebarShow.value) {
        await nextTick();
        OverlayScrollbars(sidebarRef.value, {
            overflow: {
                x: 'hidden',
                y: 'scroll',
            },
        });
    }
};
const checkbox = ref(false);
const total = ref(0);
const quaram = reactive({
    keyword: '',
    pageNumber: 1,
    pageSize: 50,
});
const sqlQuaram = reactive({
    key: '',
    term: 'equal',
    keyword: '',
});
const fileList = ref([
    {
        title: 'PM2.5/O3 risk data',
        list: [
            {
                title: 'PM2.5/O3 fused AQ & Mortality risk data',
                name: 'mortalityRiskData',
                type: 'year',
                path: {
                    2017: '/dataInput/riskdata/BenMAP_mortality_results_NEXUS_2017_20220927.csv',
                    2018: '/dataInput/riskdata/BenMAP_mortality_results_NEXUS_2018_20221212.csv',
                    2019: '/dataInput/riskdata/BenMAP_mortality_results_NEXUS_2019_20221110.csv',
                },
            },
            {
                title: 'Morbidity rish data',
                type: 'year',
                name: 'morbidityRiskData',
                path: {
                    2017: '/dataInput/riskdata/BenMAP_morbidity_results_NEXUS_2017_20220914.csv',
                    2018: '/dataInput/riskdata/BenMAP_morbidity_results_NEXUS_2018_20221212.csv',
                    2019: '/dataInput/riskdata/BenMAP_morbidity_results_NEXUS_2019_20221110.csv',
                },
            },
        ],
    },
    {
        title: 'Air toxic risk data',
        list: [
            {
                title: 'AirToxScreen Cancer Risk',
                type: 'static',
                name: 'cancerRisk',
                fileName: 'National2018_CancerRisk_by_tract_poll_29Jun22.csv',
                path: '/dataInput/airToxic/National2018_CancerRisk_by_tract_poll_29Jun22.csv',
            },
            {
                title: 'AirToxScreen Maximum Block-Level Hazard Index',
                type: 'static',
                name: 'hazardIndex',
                fileName: 'National2018_AllHI_by_tract_29Jun22.csv',
                path: '/dataInput/airToxic/National2018_AllHI_by_tract_29Jun22.csv',
            },
            {
                title: 'AirToxScreen Ambient Concentration',
                type: 'static',
                name: 'ambientConcentration',
                fileName: '2018_Toxics_Ambient_Concentrations.csv',
                path: '/dataInput/airToxic/2018_Toxics_Ambient_Concentrations.csv',
            },
        ],
    },
    {
        title: 'PM2.5/O3 design value(multi-year DVs)',
        list: [
            {
                title: 'PM2.5 DVs data',
                name: 'pm25DvsData',
                type: 'year',
                path: {
                    2017: '/dataInput/designValue/PM25/pm25_designvalues_20152017_final_07_24_18.xlsx',
                    2018: '/dataInput/designValue/PM25/pm25_designvalues_20162018_final_12_03_19.xlsx',
                    2019: '/dataInput/designValue/PM25/pm25_designvalues_2017_2019_final_05_26_20.xlsx',
                },
            },
            {
                title: 'O3 DVs data',
                type: 'year',
                name: 'ozoneDvsData',
                path: {
                    2017: '/dataInput/designValue/O3/ozone_designvalues_20152017_final_07_24_18.xlsx',
                    2018: '/dataInput/designValue/O3/ozone_designvalues_20162018_final_06_28_19.xlsx',
                    2019: '/dataInput/designValue/O3/o3_designvalues_2017_2019_final_05_26_20.xlsx',
                },
            },
        ],
    },
    {
        title: 'Emissions data',
        list: [
            {
                title: 'NEI_County',
                name: 'neiCounty',
                fileName: 'esg_cty_dc_15818.csv',
                type: 'static',
                path: '/dataInput/majorEmissionSources/esg_cty_dc_15818.csv',
            },
            {
                title: 'NEI Facility',
                name: 'neiFacility',
                fileName: 'emis_sum_fac_15420.csv',
                type: 'static',
                path: '/dataInput/majorEmissionSources/emis_sum_fac_15420.csv',
            },
        ],
    },
    {
        title: 'PM2.5/O3 and Air toxic monitor data',
        list: [
            {
                title: 'PM2.5 monitor data',
                name: 'pm25MonitorData',
                type: 'static',
                fileName: 'official_annual-PM25_2002thru2020.csv',
                path: '/dataInput/monitorData/official_annual-PM25_2002thru2020.csv',
            },
            {
                title: 'Ozone monitor data',
                name: 'ozoneMonitorData',
                type: 'static',
                fileName: 'SMAT_OZONE_MAX4DV_STD70_2002_2020.CSV',
                path: '/dataInput/monitorData/SMAT_OZONE_MAX4DV_STD70_2002_2020.CSV',
            },
            {
                title: 'Air toxic monitor data',
                name: 'airToxiceMonitorData',
                type: 'static',
                fileName: 'Air_toxic_monitor_2003_2020.csv',
                path: '/dataInput/monitorData/Air_toxic_monitor_2003_2020.csv',
            },
        ],
    },
    {
        // title: 'EJ/Demographics data',
        title: 'Demographics data',
        list: [
            {
                title: '',
                name: 'ejData',
                type: 'static',
                fileName: 'EJ&DemographicsData_2021.csv',
                path: '/dataInput/EJSCREEN/EJ&DemographicsData_2021.csv',
            },
        ],
    },
    {
        title: 'Advance areas',
        list: [
            {
                title: '',
                name: 'advanceAreas',
                type: 'static',
                fileName: 'Advance_areas 20210308.csv',
                path: '/dataInput/advanceAreas/Advance_areas 20210308.csv',
            },
        ],
    },
    {
        title: 'Class I areas',
        list: [
            {
                title: '',
                name: 'classIAreas',
                type: 'static',
                fileName: 'Class1_FederalAreas.csv',
                path: '/dataInput/classIAreas/Class1_FederalAreas.csv',
            },
        ],
    },
    {
        title: 'Tribal areas',
        list: [
            {
                title: '',
                name: 'tribalAreas',
                type: 'layers',
                fileName: 'Tribal_Boundaries_022117.xlsx',
                options: ['STATE10G', 'LOWER48_TRIBES', 'ALSKA_NATIVE_ALLOTMENTS', 'ALASKA_RESERVATIONS', 'ALASKA_NATIVE_VILLAGES'],
                path: {
                    STATE10G: '/dataInput/tribalAreas/STATE10G.csv',
                    LOWER48_TRIBES: '/dataInput/tribalAreas/LOWER48_TRIBES.csv',
                    ALSKA_NATIVE_ALLOTMENTS: '/dataInput/tribalAreas/ALSKA_NATIVE_ALLOTMENTS.csv',
                    ALASKA_RESERVATIONS: '/dataInput/tribalAreas/ALASKA_RESERVATIONS.csv',
                    ALASKA_NATIVE_VILLAGES: '/dataInput/tribalAreas/ALASKA_NATIVE_VILLAGES.csv',
                },
            },
        ],
    },
    {
        title: 'PM2.5/O3 Nonattainment Areas',
        list: [
            {
                title: '',
                name: 'nonattainmentAreas',
                type: 'static',
                fileName: 'naa_areas_phistory.csv',
                path: '/dataInput/designValue/naa_areas_phistory.csv',
            },
        ],
    },
    // {
    //     title: 'CEJST Data',
    //     list: [
    //         {
    //             title: '',
    //             name: 'cejstData',
    //             type: 'static',
    //             fileName: '1.0-communities.csv',
    //             path: '/dataInput/cjest/1.0-communities.csv',
    //         },
    //     ],
    // },
    {
        title: 'NO2 Satellite Concentration',
        list: [
            {
                title: '',
                name: 'satelliteConcentration',
                type: 'static',
                fileName: 'NO2_Concentration_tract_level.csv',
                path: '/dataInput/no2/NO2_Concentration_tract_level.csv',
            },
        ],
    },
    {
        // title: 'Climate Risk Data',
        title: 'Heat Risk Data',
        list: [
            {
                title: 'Heat index data',
                name: 'heatIndexData',
                type: 'static',
                fileName: 'climate_layer_Heat_Index_Feb2022.csv',
                path: '/dataInput/climateRisk/climate_layer_Heat_Index_Feb2022.csv',
            },
        ],
    },
]);

const selectlist = ref([]);

const delectSelectItem = (index) => {
    selectlist.value.splice(index, 1);
};
const addSelectItem = () => {
    selectlist.value.push({
        type: 'and',
        key: '',
        term: 'equal',
        keyword: '',
    });
};
const resetSelect = () => {
    selectlist.value = [];
    sqlQuaram.key = '';
    sqlQuaram.term = 'equal';
    sqlQuaram.keyword = '';
};
const checkboxChange = () => {
    resetSelect();
};
const gotoHome = () => {
    router.push({
        path: '/map',
    });
};
const handleCheckAllChange = (val) => {
    checkboxAll.value = val;
    columnList.value.forEach((item) => (item.checkbox = val));
    isIndeterminate.value = false;
};
const columnSelect = computed(() => {
    return columnList.value.filter((item) => item.checkbox);
});
watch(
    () => columnSelect.value,
    (val) => {
        const checkedCount = val.length;
        checkboxAll.value = checkedCount === columnList.value.length;
        isIndeterminate.value = checkedCount > 0 && checkedCount < columnList.value.length;
    }
);
</script>
<style lang="scss" scoped>
.data-input {
    width: 100%;
    height: calc(100vh - var(--header-height));
    // height: 100%;
    .breadcrumb-content {
        height: 30px;
        width: 100%;
        box-sizing: border-box;
        padding-left: 5px;
        border-bottom: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .returnBtn {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    .data-input-content {
        width: 100%;
        height: calc(100% - 30px);
        display: flex;
        align-items: center;

        .sidebar-content {
            width: 320px;
            height: 100%;
            box-sizing: border-box;
            padding: 5px;
            padding-right: 0px;
            box-shadow: 6px 2px 8px -6px rgba(105, 104, 104, 0.75);
            display: flex;
            flex-direction: column;
            .collapse {
                :deep(.el-collapse-item__header) {
                    height: 24px;
                    line-height: 24px;
                    width: 100%;
                }
                :deep(.el-collapse-item__content) {
                    padding-bottom: 5px;
                }
                .title {
                    font-size: 14px;
                    font-weight: bold;
                }
            }
            .sidebar-box {
                width: 100%;
                flex: 1;
                box-sizing: border-box;
                padding-right: 5px;
            }
            .sidebar-title {
                box-sizing: border-box;
                padding-right: 5px;
                font-size: 16px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .project-file {
                margin-top: 5px;
                margin-bottom: 5px;
                .project-file-title {
                    font-size: 14px;
                    font-weight: bold;
                }
                .project-file-name {
                    display: flex;
                    align-items: center;
                    margin-top: 5px;
                    .icon {
                        margin-left: 5px;
                    }
                }
            }
        }
        .sidebar-deactive {
            width: 36px;
        }
        .main-content {
            flex: 1;
            height: 100%;
            box-sizing: border-box;
            padding: 10px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            .table-select {
                font-size: 12px;
                display: flex;
                align-items: center;
            }
            .main-select {
                font-size: 12px;
                display: flex;
                align-items: center;
                // flex-wrap: wrap;
                .select-item {
                    display: flex;
                    align-items: center;
                    // flex-wrap: wrap;
                    .select-item-title {
                        margin-left: 5px;
                    }
                }
                .select-item + .select-item {
                    margin-left: 5px;
                }
                .column-select {
                    font-size: 12px;
                    color: #000;
                    display: flex;
                    align-items: center;
                    margin-right: 10px;
                    cursor: pointer;
                    .icon {
                        margin-right: 5px;
                    }
                }
            }
            .more-condition {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                .more-condition-item {
                    display: flex;
                    align-items: center;
                    margin-top: 5px;
                    margin-right: 5px;
                }
            }

            .main-table {
                width: 100%;
                flex: 1;
                margin-top: 5px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                .table-box {
                    width: 100%;
                    flex: 1;
                    .table-box-row {
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .table-box-header {
                        // width: 100%;
                        height: 100%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    :deep(.is-sortable) {
                        .cell {
                            width: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                    }
                    :deep(.el-table__body tr.current-row > td.el-table__cell) {
                        background-color: #0078d7;
                        color: #fff;
                    }
                }
                .main-pagination {
                    margin-top: 5px;
                    display: flex;
                }
            }
        }
    }
}
.file-list {
    width: 100%;
    .file-item + .file-item {
        margin-top: 5px;
    }
}
</style>
