<template>
    <MyDrawer
        title="View Attribute Table"
        :store="viewCurrentDataStore"
        direction="btt"
        :isShowClose="true"
        :unFullScreen="false"
        :defaultShow="viewCurrentDataStore.collapse"
        @onCollapse="handleCollaps"
        @on-closed="handleClose"
        minHeight="340"
    >
        <div class="view-current-data-content">
            <div class="content-fn">
                <el-dropdown trigger="click" :hide-on-click="false" :max-height="200">
                    <div class="fn-item"><Icon class="icon-button icon" name="sort" size="20" />Column</div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-checkbox style="margin-left: 10px" v-model="checkboxAll" @change="handleCheckAllChange" :indeterminate="isIndeterminate" size="small">
                                All Select
                            </el-checkbox>
                            <el-dropdown-item v-for="item in columnList">
                                <el-checkbox v-model="item.checkbox" :value="item.value" size="small">
                                    <span :style="[handleStyle(item.value)]">
                                        {{ item.label }}
                                    </span>
                                </el-checkbox>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <div class="fn-item" @click="showFilter"><Icon class="icon-button icon" name="filter" size="20" />{{ isFilter ? 'Hide Filter' : 'Show Filter' }}</div>
                <div class="fn-item" @click="showRecord"><Icon class="icon-button icon" name="map-location" size="20" />Show selected record on map</div>
                <div class="fn-item" @click="clearRecord"><Icon class="icon-button icon" name="backdelete" size="20" />Clear selection</div>
                <div class="fn-item" @click="getTableData"><Icon class="icon-button icon" name="refresh" size="20" />Refresh</div>
                <el-dropdown trigger="click" :hide-on-click="false" :max-height="200">
                    <div class="fn-item"><Icon class="icon-button icon" name="download" size="20" />Export</div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="exportCurrentPage"><el-button text>Save current page records</el-button></el-dropdown-item>
                            <el-dropdown-item @click="exportAll" :disabled="exportLoading"><el-button :loading="exportLoading" text>Save all records</el-button></el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="content-select" v-show="isFilter">
                <div class="content-select-box">
                    <div class="select-item">KeyWord:<el-input style="margin-left: 5px" v-model="quaram.keyword" placeholder="Please input" size="small" /></div>
                    <div class="select-item">
                        <el-checkbox v-model="filterArgsFlag"></el-checkbox>
                        <div class="select-item-title">Use filter</div>
                        <el-select
                            v-model="sqlQuaram.fieldName"
                            :disabled="!filterArgsFlag"
                            @change="handleSqlColumnChange"
                            placeholder="Select"
                            style="margin-left: 5px"
                            size="small"
                        >
                            <el-option v-for="item in columnList" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                        <el-select v-model="sqlQuaram.operation" :disabled="!filterArgsFlag" placeholder="Select" style="margin-left: 5px" size="small">
                            <el-option v-for="item in filterConditionOptions" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                        <el-input v-model="sqlQuaram.value" :disabled="!filterArgsFlag" style="margin-left: 5px; width: 200px" placeholder="Please input" size="small" />
                        <Icon class="icon-button icon" name="add" size="20" v-if="filterArgsFlag" @click="addSelectItem" />
                    </div>
                    <el-button size="small" type="primary" @click="getTableData" style="margin-left: 5px">Apply/Refresh</el-button>
                    <el-button size="small" type="primary" @click="resetQuaram">Reset</el-button>
                </div>
                <div class="all-data-box"><el-checkbox v-model="isShowHighlight" @change="getTableData">Show those data exceeding the setting thresholds </el-checkbox></div>
            </div>
            <div class="more-condition" v-show="isFilter">
                <div class="more-condition-item" v-for="(item, index) in selectlist">
                    <el-select v-model="item.operator" placeholder="Select" :disabled="!filterArgsFlag" style="width: 80px" size="small">
                        <el-option v-for="_item in andOrOptions" :key="_item.value" :label="_item.label" :value="_item.value" />
                    </el-select>
                    <el-select v-model="item.fieldName" placeholder="Select" :disabled="!filterArgsFlag" style="margin-left: 5px" size="small" @change="handleColumnChange(index)">
                        <el-option v-for="_item in columnList" :key="_item.value" :label="_item.label" :value="_item.value" />
                    </el-select>
                    <el-select v-model="item.operation" placeholder="Select" :disabled="!filterArgsFlag" style="margin-left: 5px; width: 80px" size="small">
                        <el-option v-for="_item in filterConditionOptions" :key="_item.value" :label="_item.label" :value="_item.value" />
                    </el-select>
                    <el-input v-model="item.value" style="margin-left: 5px; width: 250px" :disabled="!filterArgsFlag" placeholder="Please input" size="small" />
                    <Icon class="icon-button icon" name="close" size="20" @click="delectSelectItem(index)" />
                </div>
            </div>
            <div class="content-table" v-loading="loading" element-loading-text="Loading...">
                <el-table
                    border
                    highlight-current-row
                    @row-dblclick="handleRowdbClick"
                    @current-change="handleColumn"
                    class="table-box"
                    :data="tableData"
                    size="small"
                    style="width: 100%"
                >
                    <el-table-column
                        :prop="item.value"
                        align="center"
                        min-width="250"
                        :label="item.label"
                        v-for="item in columnList.filter((item) => item.checkbox)"
                        :key="item.value"
                        sortable
                    >
                        <template #header>
                            <span :style="[handleStyle(item.value)]">{{ item.label }}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                    class="pagination"
                    v-model:current-page="quaram.pageNumber"
                    v-model:page-size="quaram.pageSize"
                    :page-sizes="[5, 10, 20, 100, 200]"
                    size="small"
                    layout="total, sizes, prev, pager, next"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>
    </MyDrawer>
</template>
<script>
export default {
    name: 'ViewCurrentData',
};
</script>
<script setup>
import { ref } from 'vue';
import { andOrOptions, filterConditionOptions } from '@/libs/filter-options.js';
import { useViewCurrentDataStore } from '../../../store/view-current-data';
import { getDetailTable } from '@/api/detail.js';
import { getCountyById, getCensusTractsById } from '@/api/district.js';
import { detailOptions } from '@/libs/detail-options';
import { useProjectYearStore } from '@/store/project-year';
import { useDataScaleStore } from '@/store/data-scale';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
import { useAdvancedOptionStore } from '@/store/advanced-option';
import { getAllGeoIds } from '@/libs/geoid-cache.js';
import Point from 'ol/geom/Point.js';
import { Style, Stroke } from 'ol/style.js';
import VectorTileLayer from 'ol/layer/VectorTile';
import { mapManager } from '@/libs/map/map-manager.js';
import { countySource, censusTractSource } from '@/libs/map/boundary-sources/index.js';
import exportExcel from '@/libs/export-excel';
import exportCsv from '@/libs/export-csv';
import demographicCountyData from '@/libs/demographicData/county';
import demographicCensusTractData from '@/libs/demographicData/censusTract';
const projectYearStore = useProjectYearStore();

const dataScaleStore = useDataScaleStore();
const zoomSelectorStore = useZoomSelectorStore();
const advancedOptionStore = useAdvancedOptionStore();

const viewCurrentDataStore = useViewCurrentDataStore();
const total = ref(0);
const filterArgsFlag = ref(false);
const isShowHighlight = ref(false);
const checkboxAll = ref(false);
const isIndeterminate = ref(true);
const columnList = ref([]);
watch(
    () => dataScaleStore.dataScale,
    () => {
        getRow();
        if (viewCurrentDataStore.collapse) {
            setTimeout(() => resetQuaram(), 0);
            clearRecord();
        } else {
            tableData.value = [];
        }
    }
);
watch(
    () => zoomSelectorStore.model,
    () => {
        if (viewCurrentDataStore.collapse) {
            resetQuaram();
            // clearRecord();
        } else {
            tableData.value = [];
        }
    }
);
watch(
    () => projectYearStore.projectYear,
    () => {
        if (viewCurrentDataStore.collapse && viewCurrentDataStore.isShow) {
            resetQuaram();
            clearRecord();
        } else {
            // clearRecord();
            tableData.value = [];
        }
    }
);
watch(
    () => projectYearStore.ejYear,
    () => {
        if (viewCurrentDataStore.collapse && viewCurrentDataStore.isShow) {
            resetQuaram();
            clearRecord();
        } else {
            tableData.value = [];
        }
    }
);
const viewCurrentShow = computed(() => viewCurrentDataStore.collapse && viewCurrentDataStore.isShow);
watch(
    () => viewCurrentShow.value,
    (val) => {
        if (val && tableData.value.length === 0) {
            resetQuaramData();
            getTableData();
        }
    }
);
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
watch(
    () => viewCurrentDataStore.isShowDefault,
    (val) => {
        if (val) {
            clearRecord();
            tableData.value = [];
            viewCurrentDataStore.isShowDefault = false;
            if (viewCurrentDataStore.collapse) {
                viewCurrentDataStore.handleViewCollapse();
            }
        }
    }
);
const handleClose = () => {
    clearRecord();
    tableData.value = [];
    if (viewCurrentDataStore.isShow) {
        viewCurrentDataStore.handleViewShow();
    }
};
const handleCheckAllChange = (val) => {
    checkboxAll.value = val;
    columnList.value.forEach((item) => (item.checkbox = val));
    isIndeterminate.value = false;
};
const handleCollaps = () => {
    viewCurrentDataStore.handleViewCollapse();
};

let selectRow;

let selectedId;

const selectionLayer = new VectorTileLayer({
    map: null,
    renderMode: 'vector',
    source: null,
    visible: false,
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

const defalutColumns = ref(['geoId', 'countyGeoId', 'epaRegionId', 'stateAbbrName', 'countyName', 'cbsaGeoId', 'cbsaName', 'annual_PM25_DV', 'daily_PM25_DV']);

const format = (text) => {
    if (text === null) {
        return 'NULL';
    }
    const number = parseFloat(text);
    if (Number.isNaN(number)) {
        return text;
    }

    if (Number.isInteger(number)) {
        return text;
    }

    if (number > 1) {
        return Number(number.toFixed(1));
    }
    if (number > 0.1) {
        return Number(number.toFixed(2));
    }
    if (number > 0.01) {
        return Number(number.toFixed(3));
    }
    if (number > 0.001) {
        return Number(number.toFixed(4));
    }
    if (number > 0.0001) {
        return Number(number.toFixed(5));
    }
    if (number > 0.00001) {
        return Number(number.toFixed(6));
    }
    return Number(number.toFixed(7));
};
const roundTo = (num) => {
    let numStr = num.toString();
    let numArr = numStr.split('.');
    let index = numArr[0].length;
    let step = Math.pow(10, index - 1);
    if (num > 1) {
        return Math.round(num / step) * step;
    } else {
        return Math.round(num * 10) / 10;
    }
};
const formatData = (list) => {
    return list.map((_result) => {
        let obj = {};
        Object.keys(_result).forEach((key) => {
            let value = _result[key];
            if (key.includes('PercentRank') || key == 'demographicIndex_Value') {
                value = format(_result[key] * 100) + '%';
            } else if (key === 'epaRegionId' && value) {
                value = 'EPA Region ' + format(_result[key]);
            } else if (key.endsWith('_PCT')) {
                value = format(value) + '%';
            } else {
                if (key === 'cancerRisk_Max_Value' || key === 'hazardIndex_Max_Value') {
                    let val = _result[key] !== null ? roundTo(_result[key]) : null;
                    value = val;
                } else {
                    value = format(_result[key]);
                }
            }
            obj[key] = value;
        });
        return obj;
    });
};
const loading = ref(false);
const getTableData = async () => {
    try {
        loading.value = true;
        quaram.filterArgs = getFilterArgs();
        if (isShowHighlight.value) {
            let geoIds = getAllGeoIds();
            quaram.geoIds = geoIds;
            if (geoIds.length === 0) {
                tableData.value = [];
                total.value = 0;
                return;
            }
        }
        quaram.geoIds = isShowHighlight.value ? getAllGeoIds() : [];
        let result = await getDetailTable(quaram);
        total.value = result.total;
        let items = result.items || [];
        tableData.value = formatData(items);
    } catch (err) {
        tableData.value = [];
    } finally {
        loading.value = false;
    }
};
const exportCurrentPage = async () => {
    await exportData(tableData.value);
};
const exportLoading = ref(false);
const exportAllData = ref([]);
const getExportData = async (index) => {
    let currentIndex = index;
    const sizeNum = total.value > 20000 ? Math.ceil(total.value / 20) : total.value;
    let filterArgs = getFilterArgs();
    let geoIds = isShowHighlight.value ? getAllGeoIds() : [];
    let result = await getDetailTable({
        keyword: quaram.keyword,
        filterArgs,
        geoIds,
        pageNumber: currentIndex,
        pageSize: sizeNum,
        year: quaram.year,
        ejYear: quaram.ejYear,
    });
    let list = formatData(result.items || []);
    exportAllData.value = exportAllData.value.concat(list);

    if (result.items.length < sizeNum || result.total == result.items.length) {
        if (total.value < 20000) {
            exportData(exportAllData.value);
        } else {
            exportDataByCsv(exportAllData.value);
        }
        exportLoading.value = false;
    } else {
        currentIndex++;
        setTimeout(() => getExportData(currentIndex), 0);
    }
};
const exportAll = async () => {
    try {
        if (exportLoading.value) return;
        exportLoading.value = true;
        exportAllData.value = [];
        await getExportData(1);
    } catch (err) {
        console.log('err', err);
    } finally {
    }
};
const exportDataByCsv = (data) => {
    let json = JSON.parse(JSON.stringify(data));
    let columns = columnList.value
        .filter((item) => item.checkbox)
        .map((item) => {
            return {
                label: item.label,
                value: item.value,
            };
        });
    exportCsv('ViewCurrentData', columns, json);
};
const exportData = (data) => {
    let json = JSON.parse(JSON.stringify(data));
    let columns = columnList.value
        .filter((item) => item.checkbox)
        .map((item) => {
            return {
                header: item.label,
                key: item.value,
                width: 30,
            };
        });
    exportExcel('ViewCurrentData', [
        {
            tableName: 'sheet',
            columList: columns,
            data: json,
            cellStyleFn: null,
            headerStyleFn: null,
        },
    ]);
};
const resetQuaram = () => {
    clearRecord();
    resetQuaramData();
    getTableData();
};
const resetQuaramData = () => {
    quaram.keyword = '';
    quaram.pageNumber = 1;
    quaram.pageSize = 20;
    quaram.year = projectYearStore.projectYear;
    quaram.ejYear = projectYearStore.ejYear;
    quaram.filterArgs = [];
    quaram.geoIds = [];
    resetFilterSelect();
};
const titleCase = (str) => {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
};
const getFilterArgs = () => {
    let args = [];
    if (filterArgsFlag.value) {
        let selectArg = selectlist.value.filter((item) => item.fieldName);
        if (sqlQuaram.fieldName) {
            args.push({
                ...sqlQuaram,
            });
        }
        if (selectArg.length) {
            selectArg.forEach((item, index) => {
                args[args.length - 1].operator = item.operator;
                args.push({
                    ...item,
                });
            });
        }
    }

    if (zoomSelectorStore.isZoomIn) {
        let model = zoomSelectorStore.model;
        let fieldNames = ['epaRegionId', 'stateGeoId', 'cbsaGeoId', 'countyGeoId'];
        for (let i = 0; i < 4; i++) {
            let item = model[i];
            if (item) {
                if (args.length) {
                    args[args.length - 1].operator = 'and';
                }
                args.push({
                    operation: 'equal',
                    fieldName: fieldNames[i],
                    value: item,
                    operator: 'none',
                });
            }
        }
    }
    if (args.length) {
        args[args.length - 1].operator = 'none';
    }
    args.forEach((item) => {
        item.fieldName = titleCase(item.fieldName);
        if (item.fieldName === 'EpaRegionId') {
            let value = item.value.toLowerCase();
            value = value.replace(/epa region/gi, '').replace(/ /gi, '');
            item.value = value;
        }
    });
    return args;
};
const resetFilterSelect = () => {
    filterArgsFlag.value = false;
    selectlist.value = [];
    sqlQuaram.fieldName = '';
    sqlQuaram.operation = 'equal';
    sqlQuaram.value = '';
    sqlQuaram.operator = 'none';
};
const handleSizeChange = (val) => {
    quaram.pageSize = val;
    quaram.pageNumber = 1;
    getTableData();
};
const handleCurrentChange = (val) => {
    quaram.pageNumber = val;
    getTableData();
};
const handleColumn = (row) => {
    selectRow = row;
};
const handleRowdbClick = async (row, column, event) => {
    await getCoordData(row);
};
const getCoordData = async (row) => {
    let result;
    if (dataScaleStore.isCountyLevel) {
        result = await getCountyById(row.countyGeoId);
    } else {
        result = await getCensusTractsById(row.geoId);
    }
    let { geoId, centerLon, centerLat } = result;
    viewCurrentDataStore.selectId = geoId;
    zoomTo({ geoId, centerLon, centerLat });
};
const zoomTo = ({ geoId, centerLon, centerLat }) => {
    const mapIns = mapManager.getMapIns();
    const view = mapIns.getView();
    let layerSource = dataScaleStore.isCountyLevel ? countySource : censusTractSource;
    let minResolution = dataScaleStore.isCountyLevel ? 500 : 200;
    selectedId = geoId;
    selectionLayer.setMap(mapIns);
    selectionLayer.setSource(layerSource);
    if (selectionLayer.getVisible()) {
        selectionLayer.changed();
    } else {
        selectionLayer.setVisible(true);
    }
    view.fit(new Point([centerLon, centerLat]), { duration: 1000, minResolution });
};
const showRecord = async () => {
    if (!selectRow) return;
    await getCoordData(selectRow);
};
const clearRecord = () => {
    const mapIns = mapManager.getMapIns();
    const view = mapIns.getView();
    view.fit(new Point(mapManager.initCenter), { minResolution: 4000, duration: 1000 });
    selectedId = null;
    viewCurrentDataStore.selectId = null;
    selectionLayer.setVisible(false);
};
const quaram = reactive({
    keyword: '',
    pageSize: 20,
    pageNumber: 1,
    year: projectYearStore.projectYear,
    ejYear: projectYearStore.ejYear,
    filterArgs: [],
    geoIds: [],
});
const sqlQuaram = reactive({
    fieldName: '',
    operation: 'equal',
    value: '',
    operator: 'none',
});
const tableData = ref([]);
const mortalityKeys = [
    'mortality_PM25_Max_Value',
    'mortality_PM25_Max_PercentRank',
    'mortality_PM25_Num_Value',
    'mortality_PM25_Num_PercentRank',
    'mortality_O3_Max_Value',
    'mortality_O3_Max_PercentRank',
    'mortality_O3_Num_Value',
    'mortality_O3_Num_PercentRank',
];
const morbidityKeys = [
    'morbidity_ERVR_PM25_Max_Value',
    'morbidity_ERVR_PM25_Max_PercentRank',
    'morbidity_ERVR_PM25_Num_Value',
    'morbidity_ERVR_PM25_Num_PercentRank',
    'morbidity_ERVR_O3_Max_Value',
    'morbidity_ERVR_O3_Max_PercentRank',
    'morbidity_ERVR_O3_Num_Value',
    'morbidity_ERVR_O3_Num_PercentRank',
    'morbidity_HAD_PM25_Max_Value',
    'morbidity_HAD_PM25_Max_PercentRank',
    'morbidity_HAD_PM25_Num_Value',
    'morbidity_HAD_PM25_Num_PercentRank',
    'morbidity_HAD_O3_Max_Value',
    'morbidity_HAD_O3_Max_PercentRank',
    'morbidity_HAD_O3_Num_Value',
    'morbidity_HAD_O3_Num_PercentRank',
    'morbidity_SLD_O3_Max_Value',
    'morbidity_SLD_O3_Max_PercentRank',
    'morbidity_SLD_O3_Num_Value',
    'morbidity_SLD_O3_Num_PercentRank',
    'morbidity_WLD_PM25_Max_Value',
    'morbidity_WLD_PM25_Max_PercentRank',
    'morbidity_WLD_PM25_Num_Value',
    'morbidity_WLD_PM25_Num_PercentRank',
    'morbidity_AsthmaSymptoms_Max_Value',
    'morbidity_AsthmaSymptoms_Max_PercentRank',
    'morbidity_AsthmaSymptoms_Num_Value',
    'morbidity_AsthmaSymptoms_Num_PercentRank',
];
const getRow = () => {
    let list = [];
    Object.keys(detailOptions).forEach((key) => {
        let obj = {
            value: key,
            checkbox: defalutColumns.value.indexOf(key) !== -1,
            label: detailOptions[key],
        };
        list.push(obj);
    });
    let geoIdItem = {
        value: dataScaleStore.isCountyLevel ? 'countyGeoId' : 'geoId',
        checkbox: true,
        label: 'FIPS',
    };
    list.unshift(geoIdItem);
    if (!advancedOptionStore.advancedMode) {
        list = list.filter((item) => !item.value.includes('PercentRank'));
    }
    if (dataScaleStore.dataScale == 1) {
        let keys = [];
        keys = keys.concat([...mortalityKeys, ...morbidityKeys]);
        list = list.filter((item) => !keys.includes(item.value));
    }
    columnList.value = list;
};
const handleStyle = (key) => {
    if (key.includes('PercentRank')) {
        return { color: '#f700ff' };
    }
};
const handleColumnChange = (index) => {
    let item = selectlist.value[index];
    let strArr = ['epaRegionId', 'stateAbbrName', 'countyName', 'cbsaName', 'advanceAreasType', 'tribeName'];
    if (strArr.indexOf(item.fieldName) !== -1) {
        item.operation = 'contains';
    } else {
        item.operation = 'equal';
    }
};
const handleSqlColumnChange = () => {
    let strArr = ['epaRegionId', 'stateAbbrName', 'countyName', 'cbsaName', 'advanceAreasType', 'tribeName'];
    if (strArr.indexOf(sqlQuaram.fieldName) !== -1) {
        sqlQuaram.operation = 'contains';
    } else {
        sqlQuaram.operation = 'equal';
    }
};
watch(
    () => advancedOptionStore.advancedMode,
    () => {
        getRow();
        if (viewCurrentDataStore.collapse) {
            resetQuaram();
        }
    }
);
onMounted(async () => {
    getRow();
    await nextTick();
});

const selectlist = ref([]);
const delectSelectItem = (index) => {
    selectlist.value.splice(index, 1);
};
const addSelectItem = () => {
    selectlist.value.push({
        fieldName: '',
        operation: 'equal',
        value: '',
        operator: 'and',
    });
};
const isFilter = ref(true);
const showFilter = () => {
    isFilter.value = !isFilter.value;
};
</script>
<style lang="scss" scoped>
.bottom-box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 999;
}
.fold-button {
    position: absolute;
    left: 50%;
    top: -17px;
    transform: translateX(-50%);
    width: 60px;
    height: 17px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 5px 5px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .icon {
        color: rgba($color: #fff, $alpha: 0.8);
    }
}
.view-current-data-content {
    background: #fff;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .content-fn {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-bottom: 5px;
        .fn-item {
            display: flex;
            align-items: center;
            margin-right: 10px;
            cursor: pointer;
            .icon {
                margin-right: 5px;
            }
        }
    }
    .content-select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        .content-select-box {
            display: flex;
            align-items: center;
        }
        .select-item {
            display: flex;
            align-items: center;
            font-size: 12px;
            .select-item-title {
                width: 55px;
                margin-left: 5px;
            }
        }
        .select-item + .select-item {
            margin-left: 5px;
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
    .content-table {
        margin-top: 5px;
        flex: 1;
        overflow: hidden;
        .table-box {
            width: 100%;
            // height: 200px;
            height: calc(100% - 30px);
            tr th {
                font-size: 12px;
                padding: 0;
                .cell {
                    padding: 0;
                }
            }
        }
        .pagination {
            margin-top: 5px;
        }
    }
}
</style>
