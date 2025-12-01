<template>
    <div class="EPARegionTable" ref="epaRegionRef">
        <div class="sider">
            <div class="sider-item">
                <div class="title">Select EPA Region:</div>
                <el-select v-model="epaRegionValue" size="small" style="width: 100%">
                    <el-option v-for="item in epaOptions" :key="item.id" :label="'EPA ' + item.name" :value="item.id" />
                </el-select>
            </div>
            <div class="sider-item">
                <div class="title">Select Desired Tables:</div>
                <el-checkbox-group v-model="checkList" @change="handleDesireChange">
                    <el-checkbox v-for="item in checkboxOptions" :label="item.value">{{ item.label }}</el-checkbox>
                </el-checkbox-group>
            </div>
            <div class="btn-box"><el-button @click="resetTable">Generate</el-button><el-button @click="exportData">Output</el-button></div>
        </div>
        <div class="main">
            <el-tabs v-model="activeName" class="demo-tabs" @tab-change="setTable">
                <el-tab-pane v-for="item in checkboxOptions.filter((_item) => checkList.indexOf(_item.value) !== -1)" :label="item.label" :name="item.value"></el-tab-pane>
            </el-tabs>
            <div class="content" ref="contentRef" v-loading="tableLoading">
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column :label="item.label" align="center" v-for="item in tableColumn">
                        <el-table-column :label="_item.label" v-for="_item in item.children" align="center">
                            <el-table-column :prop="_key.prop" :label="_key.label" align="center" v-for="_key in _item.children" />
                        </el-table-column>
                    </el-table-column>
                </el-table>
                <el-table :data="tableTwoData" style="width: 100%; margin-top: 20px">
                    <el-table-column :label="item.label" align="center" v-for="item in tableTwoColumn">
                        <el-table-column :label="_item.label" v-for="_item in item.children" align="center">
                            <el-table-column :prop="_key.prop" :label="_key.label" align="center" v-for="_key in _item.children" />
                        </el-table-column>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import tableOzone from './tableOzone.js';
import tablePm25 from './tablePM25.js';
import { OverlayScrollbars } from 'overlayscrollbars';
import { getEpaRegion } from '@/api/district';
import { getXlsxOtions } from '@/libs/read-file';
import { useEJReportStore } from '@/store/ejscreen-report';
import { ElLoading } from 'element-plus';
import Worker from '@/libs/worker/data-input-worker.js?worker';
import exportExcel from '@/libs/export-excel';
let loading = null;
const EjReportStore = useEJReportStore();

const worker = new Worker();
const riskFilePath = '/dataInput/airToxic/National2018_CancerRisk_by_tract_poll_29Jun22.csv';
const tableData = ref([]);
const tableColumn = ref([]);
const tableTwoData = ref([]);
const tableTwoColumn = ref([]);
const tableLoading = ref(false);
const epaRegionRef = ref();
const fileData = reactive({
    type: '',
    tableNames: [],
    data: {
        headList: [],
        list: [],
    },
});
const epaRegionValue = ref('04');
const epaOptions = ref([]);
const checkList = ref(['8-Hour Ozone (2015)', 'PM-2.5 (2012)', 'PM-2.5 (2006)']);
const checkboxOptions = ref([
    {
        label: '8-hr Ozone (2015)',
        value: '8-Hour Ozone (2015)',
    },
    {
        label: 'Annual PM2.5 (2012)',
        value: 'PM-2.5 (2012)',
    },
    {
        label: '24-hr PM2.5 (2006)',
        value: 'PM-2.5 (2006)',
    },
]);
const activeName = ref('8-Hour Ozone (2015)');
const contentRef = ref();

const ozoneData = ref([]);
const ozoneTwoData = ref([]);
const annualData = ref([]);
const annualCountyData = ref([]);
const hr6Data = ref([]);
const hr6CountyData = ref([]);

worker.onmessage = (e) => {
    try {
        let result = e.data;
        if (result.state === 200) {
            if (result.type == 'other') {
                let { type, tableNames, headList } = result.data;
                fileData.type = type;
                fileData.tableNames = tableNames;
                fileData.data.headList = headList;
            } else if (result.type == 'list') {
                let arr = result.data;
                fileData.data.list.push(...arr);
            } else if (result.type == 'all') {
                let { type, tableNames, data } = result.data;
                fileData.type = type;
                fileData.tableNames = tableNames;
                fileData.data = data;
            }
        }
        if (result.status === 'end') {
            formatData();
            worker.terminate();
        }
    } finally {
    }
};
const startLoading = () => {
    loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
        target: epaRegionRef.value,
    });
    // return loading;
};
const endLoading = (loading) => {
    loading.close();
};
const handleDesireChange = () => {
    if (checkList.value.indexOf(activeName.value) == -1) {
        activeName.value = checkList.value.length ? checkList.value[0] : '';
        setTable();
    }
};
const getDicNayro = async () => {
    let { data } = await getXlsxOtions('/EPARegion/nayro.xls');
    EjReportStore.dtNayro = data['nayro'].list || [];
};
const formatData = async () => {
    let data = fileData.data.list;
    let dicPop = {};
    let dicEpa = {};
    let dicMaxRisk = {};
    data.forEach((item) => {
        let id = item['FIPS'];
        let pop = item['Population'];
        let riskMax = item['Total Risk\n (in a million)'];
        if (!dicPop[id]) {
            dicPop[id] = pop;
        } else if (Number(pop) > Number(dicPop[id])) {
            dicPop[id] = pop;
        }
        if (!dicEpa[id]) {
            dicEpa[id] = item['EPA Region'];
        }
        if (!dicMaxRisk[id]) {
            dicMaxRisk[id] = riskMax;
        } else if (Number(riskMax) > Number(dicMaxRisk[id])) {
            dicMaxRisk[id] = riskMax;
        }
    });

    EjReportStore.dicPop = dicPop;
    EjReportStore.dicEpa = dicEpa;
    EjReportStore.dicMaxRisk = dicMaxRisk;
    await getDicNayro();
    await getCbsaInfo();
    endLoading(loading);
    resetTable();
};
const exportData = () => {
    let fileName = '';
    let tableOneName = '';
    let tableTwoName = '';
    if (activeName.value === '8-Hour Ozone (2015)') {
        fileName = 'table_generator_O3';
        tableOneName = '8-hr Ozone Designated Areas';
        tableTwoName = '8-hr Ozone County-Level DVs';
    } else if (activeName.value === 'PM-2.5 (2012)') {
        fileName = 'table_generator_PM_Annual';
        tableOneName = 'Annual PM2.5 Designated Areas';
        tableTwoName = 'Annual PM2.5 County-Level DVs';
    } else if (activeName.value === 'PM-2.5 (2006)') {
        fileName = 'table_generator_PM_24hr';
        tableOneName = '24-hr PM2.5 Designated Areas';
        tableTwoName = '24-hr PM2.5 County-Level DVs';
    }
    let columnOneList = getExportColumn(tableColumn.value);
    let columnTwoList = getExportColumn(tableTwoColumn.value);

    exportExcel(fileName, [
        {
            tableName: tableOneName,
            columList: columnOneList,
            data: tableData.value,
            cellStyleFn: null,
            headerStyleFn: null,
        },
        {
            tableName: tableTwoName,
            columList: columnTwoList,
            data: tableTwoData.value,
            cellStyleFn: null,
            headerStyleFn: null,
        },
    ]);
};
const getExportColumn = (list) => {
    let columns = [];
    list.forEach((item) => {
        let obj = {
            header: item.label,
            key: item.prop,
        };
        if (item.children && item.children.length) {
            obj.children = getExportColumn(item.children);
        }
        columns.push(obj);
    });
    return columns;
};
const getEPAList = async () => {
    let result = await getEpaRegion();
    epaOptions.value = result;
};
const setTable = () => {
    let oneList = [];
    let oneColumn = [];

    let twoList = [];
    let twoColumn = [];
    if (activeName.value === '8-Hour Ozone (2015)') {
        oneList = ozoneData.value;
        oneColumn = tableOzone.getTableColumns('tableOne');
        twoList = ozoneTwoData.value;
        twoColumn = tableOzone.getTableColumns('tableTwo');
    } else if (activeName.value === 'PM-2.5 (2012)') {
        oneList = annualData.value;
        oneColumn = tablePm25.getAnnualTableColumns('tableOne');

        twoList = annualCountyData.value;
        twoColumn = tablePm25.getAnnualTableColumns('tableTwo');
    } else if (activeName.value === 'PM-2.5 (2006)') {
        oneList = hr6Data.value;
        oneColumn = tablePm25.getHr06TableColumns('tableOne');
        twoList = hr6CountyData.value;
        twoColumn = tablePm25.getHr06TableColumns('tableTwo');
    }
    tableColumn.value = oneColumn;
    tableData.value = oneList;

    tableTwoData.value = twoList;
    tableTwoColumn.value = twoColumn;
};
const resetTable = async () => {
    try {
        tableLoading.value = true;
        let epaRegion = epaRegionValue.value.replace(/0/, '');
        ozoneData.value = await tableOzone.initTable(epaRegion);
        ozoneTwoData.value = await tableOzone.initCountyTable(epaRegion);
        annualData.value = await tablePm25.initAnnualTable(epaRegion);
        hr6Data.value = await tablePm25.initHr6Table(epaRegion);
        annualCountyData.value = await tablePm25.initAnnualCountyTable(epaRegion);
        hr6CountyData.value = await tablePm25.initHr06CountyTable(epaRegion);
        setTable();
    } catch (err) {
    } finally {
        tableLoading.value = false;
    }
};
const getCbsaInfo = async () => {
    const EjReportStore = useEJReportStore();
    let dicPop = EjReportStore.dicPop;
    let dicMaxRisk = EjReportStore.dicMaxRisk;
    let { data } = await getXlsxOtions('/EPARegion/list1.xls');
    let { list } = data['List 1'];
    let cbsaData = {};
    list.forEach((item) => {
        let name = item['CBSA Title'];
        let id = item['FIPS State Code'] + item['FIPS County Code'];
        let cbsaInfo = {
            Name: item['County/County Equivalent'],
            FIPS: id,
            Population: dicPop[id] || 0,
            MaxCancerRisk: dicMaxRisk[id],
        };
        if (!cbsaData[name]) {
            cbsaData[name] = [];
        }
        cbsaData[name].push(cbsaInfo);
    });
    EjReportStore.dicCountyInfo = cbsaData;
};
onMounted(async () => {
    await nextTick();

    if (!EjReportStore.dicPop) {
        startLoading();
        worker.postMessage(riskFilePath);
        tableOzone.initData();
        tablePm25.initData();
    } else {
        resetTable();
    }
    OverlayScrollbars(contentRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
    getEPAList();
});
</script>
<style scoped lang="scss">
.EPARegionTable {
    width: 100%;
    height: 100%;
    display: flex;
    .sider {
        width: 200px;
        height: 100%;
        box-sizing: border-box;
        padding: 5px;
        padding-top: 10px;
        .sider-item {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #ccc;
            padding: 3px;
            padding-top: 10px;
            position: relative;
            .title {
                font-size: 16px;
                font-weight: bold;
                position: absolute;
                background: #fff;
                top: -10px;
                left: 5px;
            }
        }
        .sider-item + .sider-item {
            margin-top: 20px;
        }
        .btn-box {
            margin-top: 10px;
        }
    }
    .main {
        flex: 1;
        box-sizing: border-box;
        border: 1px solid #ccc;
        padding: 5px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .content {
            width: 100%;
            flex: 1;
            overflow: hidden;
        }
    }
}
</style>
