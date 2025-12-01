<template>
    <div class="setor-summary-box">
        <div class="sources-select">
            <div class="select-item pollutants">
                <div class="select-header">
                    Select Pollutants:
                    <div class="select-detail">
                        <div class="sources-item">
                            Emission Year:
                            <el-select v-model="emissionYear" class="sites-number" @change="initData" placeholder="Select" size="small">
                                <el-option v-for="item in emissionYearOptions" :key="item" :label="item" :value="item" />
                            </el-select>
                        </div>
                        <div class="sources-item" style="padding: 0">
                            Top X Sources:
                            <ParameterTip
                                content="Users can select a specific number of emission sources and regions. The emission sources are listed in ascending order of emissions. The default value is 20 and 50, respectively. Note that “Top X Regions” only applies to the “Selected Region” option."
                            />
                            <el-input-number @change="initData" v-model="topXEmissionSources" class="sites-number" size="small" :min="1" :max="100" controls-position="right" />
                        </div>
                        <div class="sources-item">
                            Sort By:
                            <el-select v-model="sortValue" style="width: 80px; margin-left: 5px" placeholder="Select" size="small" @change="handleChartChange">
                                <el-option v-for="item in typeList" :key="item.type" :label="item.label" :value="item.type" />
                            </el-select>
                        </div>
                        <div class="sources-item">
                            <el-checkbox size="small" @change="handleShowPoint" v-model="isShowPoint">Show Point Values</el-checkbox>
                        </div>
                        <div class="sources-item">
                            <el-button type="primary" size="small" @click="exportData">Output</el-button>
                        </div>
                    </div>
                </div>

                <div class="select-content pollutants-content">
                    <el-checkbox-group class="checkbox-content" v-model="checkedList" @change="handlePollutantChange">
                        <el-checkbox size="small" v-for="item in emissionList" :key="item.type" :value="item.type" :label="item.label"></el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
        </div>
        <div class="sources-content" v-loading="loading">
            <canvas ref="summaryPlotCanvasRef" class="summaryPlotCanvas"></canvas>
        </div>
    </div>
</template>
<script setup>
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getEpaRegion, getState, getCounty, getCBSA } from '@/api/district.js';
import { getSectorGroupEmissionsCombined, getSectoreGroupEmission, getEmissionsDataFacility } from '@/api/emissions-data.js';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import exportExcel from '@/libs/export-excel';
const props = defineProps({
    emissionYear: {
        type: Number,
        default: 2017,
    },
});
const zoomSelectorStore = useZoomSelectorStore();
const majorEissionStore = useMajorEissionStore();
let myChart;
const emissionList = ref([
    {
        label: 'CO',
        type: 'CO',
        unit: 'TON',
        color: '#E81E63',
    },
    {
        label: 'NOx',
        type: 'NOx',
        unit: 'TON',
        color: '#F34336',
    },
    {
        label: 'VOC',
        type: 'VOC',
        unit: 'TON',
        color: '#FEC007',
    },
    {
        label: 'PM10',
        type: 'PM10',
        unit: 'TON',
        color: '#009587',
    },

    {
        label: 'PM2.5',
        type: 'PM25',
        unit: 'TON',
        color: '#00BBD3',
    },
    {
        label: 'CO2e',
        type: 'CO2e',
        unit: 'TON',
        color: '#3F51B3',
    },
    {
        label: 'NH3',
        type: 'NH3',
        unit: 'TON',
        color: '#3F51B3',
    },
    {
        label: 'GAS & VOC HAPs',
        type: 'Gas_VOC_HAPs',
        unit: 'LB',
        color: '#607D8A',
    },
    {
        label: 'Heavy Metal HAPs',
        type: 'Heavy_Metal_HAPs',
        unit: 'LB',
        color: '#CCDB39',
    },

    {
        label: 'Diesel PM',
        type: 'Diesel_PM_HAPs',
        unit: 'TON',
        color: '#4CAE50',
    },
    {
        label: 'SO2',
        type: 'SO2',
        unit: 'TON',
        color: '#2195F2',
    },

    {
        label: 'Lead',
        type: 'Lead',
        unit: 'LB',
        color: '#FE5722',
    },
]);
const checkedList = ref(['NOx']);

// 污染物排名前几名
const topXEmissionSources = ref(20);
const sortValue = ref('NOx');
const isShowPoint = ref(false);
const emissionYear = ref(props.emissionYear);
const emissionYearOptions = ref([2017, 2020]);
const typeTitle = ref('');
const typeTips = ref('');
const tableList = ref([]);
const tableOneList = ref([]);
const epaRegionData = ref([]);
const stateRegionData = ref([]);
const cbsaRegionData = ref([]);
const countyRegionData = ref([]);
const sortList = computed(() => {
    let list = [...tableList.value];
    let sortKey = sortValue.value;
    if (sortKey) {
        sortKey = sortKey.toLowerCase();
        list.sort((a, b) => {
            return b[sortKey] - a[sortKey];
        });
    }
    list = list.splice(0, topXEmissionSources.value);
    return list;
});
const chartLabel = computed(() => {
    return sortList.value.map((item) => item.name);
});
watch(
    () => props.emissionYear,
    (val) => {
        emissionYear.value = val;
    },
    { deep: true }
);
watch(
    () => zoomSelectorStore.model,
    async (val) => {
        initData();
    },
    { deep: true }
);
const summaryPlotCanvasRef = ref();
const loading = ref(false);
const typeList = computed(() => {
    return emissionList.value.filter((item) => checkedList.value.indexOf(item.type) !== -1);
});
const initData = async () => {
    await getTableData();
    handleChartChange();
};
const handleShowPoint = () => {
    myChart.options.plugins.datalabels.display = isShowPoint.value;
    myChart.update();
};
const handleChartChange = () => {
    let dataSets = getChartData();
    myChart.data.datasets = dataSets;
    myChart.data.labels = chartLabel.value;
    myChart.update();
};
const handlePollutantChange = () => {
    sortValue.value = checkedList.value.length ? checkedList.value[0] : '';
    handleChartChange();
};
const exportData = () => {
    exportTableTwo();
    exportTableOneData();
};
const getChartData = () => {
    let dataSets = [];
    typeList.value.forEach((typeItem) => {
        let sortKey = typeItem.type.toLowerCase();
        let arr = sortList.value.map((item) => item[sortKey]);
        dataSets.push({
            label: `${typeItem.label} (${typeItem.unit})`,
            data: arr,
            backgroundColor: [typeItem.color],
            fill: true,
            borderColor: typeItem.color,
        });
    });
    return dataSets;
};
const initChart = () => {
    myChart = new Chart(summaryPlotCanvasRef.value, {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: '',
            datasets: [],
        },
        options: {
            responsive: true,
            interaction: {
                // intersect: false,
                mode: 'index',
                axis: 'y',
            },
            scales: {
                y: {
                    display: true,
                    title: {
                        display: false,
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            return value;
                        },
                    },
                    beginAtZero: true,
                    grid: {
                        display: true,
                    },
                },
                x: {
                    display: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sector',
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            let val = this.getLabelForValue(value);
                            if (val.length > 8) {
                                return val.substring(0, 9) + '...';
                            } else {
                                return val;
                            }
                        },
                    },
                    grid: {
                        display: true,
                    },
                },
            },
            plugins: {
                datalabels: {
                    display: false,
                    anchor: 'end',
                    align: 'end',
                    font: {
                        size: 10,
                    },
                    formatter: (val) => `${val}`,
                },
                legend: {
                    labels: {
                        usePointStyle: true,
                    },
                },
                tooltip: {
                    enabled: true,
                    usePointStyle: true,
                },
                title: {
                    display: true,
                    text: 'Total Emissions from Top Sector Groups',
                    font: {
                        size: 18,
                    },
                },
            },
            animation: {},
        },
    });
};
const tableTwoHeaderStyleFn = (row) => {
    row.eachCell((cell, colNumber) => {
        let value = cell.value;
        if (value === 'Drivers') {
            let arr = [
                {
                    text: `Total “Sector group” emissions combined for all selected ${typeTitle.value} (based on Top ${topXEmissionSources.value} facility emissions in each ${typeTips.value}).`,
                },
            ];
            cell.value = {
                richText: arr,
            };
            cell.alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
        }
    });
    row.height = 40;
};
const exportTableTwo = () => {
    let type = typeTitle.value;

    let excelTitle = `table2 with top ${checkedList.value.length} ${type} with top ${topXEmissionSources.value} facilities`;
    let tableTwoColumn = getTableTwoColumns();
    let columns = tableTwoColumn.map((_item) => {
        return {
            header: _item.label,
            key: _item.prop,
            width: 30,
        };
    });
    exportExcel(excelTitle, [
        {
            tableName: 'Table 2',
            columList: [
                {
                    header: 'Drivers',
                    key: 'header',
                    children: columns,
                },
            ],
            data: tableList.value,
            cellStyleFn: null,
            headerStyleFn: tableTwoHeaderStyleFn,
        },
    ]);
};
const getTableTwoColumns = () => {
    let arr = [
        {
            label: 'Sector Group',
            prop: 'name',
        },
    ];
    typeList.value.forEach((item) => {
        let obj = {
            label: `${item.label} (${item.unit})`,
            prop: item.type.toLowerCase(),
        };
        arr.push(obj);
    });
    return arr;
};
const getTableData = async () => {
    try {
        loading.value = true;
        tableList.value = [];
        let districtData = zoomSelectorStore.getZoomDetail();
        if (districtData.districtType === 'Nation') {
            return;
        }
        switch (districtData.districtType.toLowerCase()) {
            case 'epaRegion':
                typeTitle.value = 'EPA Regions';
                typeTips.value = 'EPA Region';
                break;
            case 'state':
                typeTitle.value = 'states';
                typeTips.value = 'state';
                break;
            case 'cbsa':
                typeTitle.value = 'CBSAs';
                typeTips.value = 'CBSA';
                break;
            case 'county':
                typeTitle.value = 'counties';
                typeTips.value = 'county';
                break;
        }

        let tableData = [];
        let quaram = {
            year: emissionYear.value,
            districtType: districtData.districtType,
            districtIds: [districtData.districtGeoId],
            topCount: topXEmissionSources.value,
        };
        let result = await getSectorGroupEmissionsCombined(quaram);
        Object.keys(result).forEach((key) => {
            let obj = {
                name: key,
            };
            let data = result[key];
            let summary = data.summary;
            emissionList.value.forEach((item) => {
                let type = item.type.toLowerCase();
                obj[type] = Math.floor(summary[type] * 100) / 100;
            });
            tableData.push(obj);
        });
        tableList.value = tableData;
    } catch (err) {
        console.log(err);
    } finally {
        loading.value = false;
    }
};
const exportCallbackFn = (workbook, sheetList) => {
    let columns = tableOneList.value[0].columns;
    const targetWorksheet = workbook.addWorksheet('Table 1');
    sheetList.forEach((sheet, index) => {
        let startRowIndex = 0;
        if (index !== 0) {
            startRowIndex = targetWorksheet.lastRow.number;
        }
        sheet.eachRow((row, rowNumber) => {
            const targetRow = targetWorksheet.getRow(startRowIndex + rowNumber);
            targetRow.height = row.height;
            row.eachCell((cell, colNumber) => {
                const targetCell = targetRow.getCell(colNumber);
                targetCell.value = cell.value;
                targetCell.style = cell.style;
            });
        });
        sheet.model.merges.forEach((mergeCell) => {
            let mergeCells = mergeCell.split(':');
            const [[startRow, startCol], [endRow, endCol]] = mergeCells;
            let startBeginIndex = startRow + (startCol * 1 + startRowIndex);
            let endBeginIndex = endRow + (endCol * 1 + startRowIndex);
            targetWorksheet.mergeCells(startBeginIndex, endBeginIndex);
        });
        columns.forEach((item, _index) => {
            targetWorksheet.getColumn(_index + 1).width = sheet.getColumn(_index + 1).width;
            targetWorksheet.getColumn(_index + 1).alignment = sheet.getColumn(_index + 1).alignment;
        });
        workbook.removeWorksheet(sheet.id);
    });
};
const cellStyleFn = (row) => {
    row.eachCell((cell) => {
        let value = cell.value;
        if (Object.prototype.toString.call(value) === '[object Object]') {
            let arr = [
                {
                    text: `Facility name: ${value.facilityName}\n`,
                },
                {
                    text: `County/City/State: ${value.countyName}/${value.cityName}/${value.stateName}\n`,
                },
                {
                    text: `EIS_ID: ${value.id}\n`,
                },
                {
                    text: `Sector Group: ${value.sectorProjectGroup}\n`,
                },
                {
                    text: `% of Sector Group: ${value.sectorGroupPrecent}\n`,
                },
                {
                    text: `NAICS code: ${value.naicsCode}\n`,
                },
                {
                    text: `NAICS description: ${value.naicsDescription}`,
                },
            ];
            cell.value = {
                richText: arr,
            };
        }
        cell.alignment = { wrapText: true };
    });
    row.height = 120;
    return row;
};
const headerStyleFn = (row, label) => {
    row.eachCell((cell, colNumber) => {
        let value = cell.value;
        if (value === 'Drivers') {
            let arr = [
                {
                    text: label,
                },
            ];
            cell.value = {
                richText: arr,
            };
            cell.alignment = { vertical: 'middle', wrapText: true, horizontal: 'left' };
        }
    });
    row.height = 40;
};
const exportTableOne = () => {
    let type = typeTitle.value;
    let typeName = '';
    let districtData = zoomSelectorStore.getZoomDetail();
    if (districtData.districtType === 'Nation') {
        return;
    }
    switch (districtData.districtType.toLowerCase()) {
        case 'epaRegion':
            typeName = 'EPA REGOPM NAME';
            break;
        case 'state':
            typeName = 'STATE NAME';
            break;
        case 'cbsa':
            typeName = 'CBSA NAME';
            break;
        case 'county':
            typeName = 'COUNTY NAME';
            break;
    }
    let excelTitle = `table1 with top ${checkedList.value.length} ${type} with top ${topXEmissionSources.value} facilities`;
    let tableOptions = tableOneList.value.map((item) => {
        let columns = item.columns.map((_item) => {
            return {
                header: _item.label,
                key: _item.prop,
                width: _item.type === 'info' ? 70 : 20,
            };
        });
        let label = `${typeName}: ${item.name}.`;
        return {
            tableName: item.name,
            columList: [
                {
                    header: 'Drivers',
                    key: 'header',
                    children: columns,
                },
            ],
            data: item.tableData,
            cellStyleFn: cellStyleFn,
            headerStyleFn: (row) => headerStyleFn(row, label),
        };
    });
    exportExcel(excelTitle, tableOptions, exportCallbackFn);
};
const getEmissionBySectoreGroup = async () => {
    let result = await getSectoreGroupEmission(props.emissionYear);
    if (result && result.length) {
        let obj = {};
        result.forEach((item) => {
            let name = item['sectorProjectGroup'];
            if (!obj[name]) {
                obj[name] = item;
            }
        });
        majorEissionStore.sectorGroupEmissionData[props.emissionYear] = obj;
    }
};
const processEmissionData = (resData, key, sectorGroupEmissionData) => {
    const dataValue = Math.floor(resData[key] * 100) / 100;
    const sectorProjectGroup = resData.sectorProjectGroup;
    const sectorGroupData = sectorGroupEmissionData[sectorProjectGroup] || {};
    const sectorGroupEmissionAll = sectorGroupData[key];

    const sectorGroupPrecent = sectorGroupEmissionAll ? `${Math.floor((dataValue / sectorGroupEmissionAll) * 10000) / 100}%` : 'NULL';

    return {
        [`info_${key}`]: {
            facilityName: resData.companyName,
            countyName: resData.countyName,
            cityName: resData.city,
            stateName: resData.stateAbbrName,
            id: resData.facilityId,
            sectorProjectGroup,
            naicsCode: resData.naicsCode,
            naicsDescription: resData.naicsDescription,
            sectorGroupPrecent,
        },
        [key]: dataValue,
    };
};
const generateColumns = (typeList) => {
    return typeList.flatMap((_item) => [
        {
            label: 'FacilityInfo',
            prop: `info_${_item.type.toLowerCase()}`,
            type: 'info',
        },
        {
            label: `${_item.label} (${_item.unit})`,
            prop: _item.type.toLowerCase(),
            type: 'value',
        },
    ]);
};

const resetTableList = async () => {
    const { districtType, districtGeoId } = zoomSelectorStore.getZoomDetail();
    if (districtType === 'Nation') return;
    const DATA_SOURCE_MAP = {
        eparegion: epaRegionData.value,
        state: stateRegionData.value,
        cbsa: cbsaRegionData.value,
        county: countyRegionData.value,
    };

    const GEO_ID_MAPPER = {
        eparegion: 'epaRegionId',
        state: 'stateGeoId',
        cbsa: 'cbsaGeoId',
        county: 'countyGeoId',
    };
    // 获取当前数据
    const dataSource = DATA_SOURCE_MAP[districtType.toLowerCase()];
    const regionList = dataSource?.filter((item) => item.key === districtGeoId) || [];
    if (!regionList.length) return;

    const sectorGroupEmissionData = majorEissionStore.sectorGroupEmissionData[props.emissionYear];

    const typeKeys = typeList.value.map((item) => item.type.toLowerCase());

    const columns = generateColumns(typeList.value);

    const processRegionItem = async (item) => {
        const geoIdField = GEO_ID_MAPPER[districtType.toLowerCase()];
        const requests = typeList.value.map((_item) => {
            const params = {
                year: emissionYear.value,
                pageNumber: 1,
                pageSize: topXEmissionSources.value,
                desc: true,
                order: _item.type,
                [geoIdField]: [item.key],
            };
            return getEmissionsDataFacility(params);
        });

        try {
            const results = await Promise.all(requests);
            const tableData = results.flatMap((result, index) => result.items.map((resData) => processEmissionData(resData, typeKeys[index], sectorGroupEmissionData)));

            return {
                id: item.key,
                name: item.label,
                columns,
                tableData,
                total: 0,
            };
        } catch (error) {
            console.error('Error fetching emissions data:', error);
            return null;
        }
    };

    try {
        const processedResults = await Promise.all(regionList.map(processRegionItem));
        tableOneList.value = processedResults.filter(Boolean);
        console.log('Processed table data:', tableOneList.value);
    } catch (error) {
        console.error('Error processing region items:', error);
    }
};
const exportTableOneData = async () => {
    if (!majorEissionStore.sectorGroupEmissionData[props.emissionYear]) {
        await getEmissionBySectoreGroup();
    }
    await resetTableList();
    exportTableOne();
};
const getAllEpaRegionData = async () => {
    let result = await getEpaRegion();
    let list = result.map((item) => {
        let label = 'EPA Region ' + item.id;
        return {
            key: item.id,
            label,
        };
    });
    epaRegionData.value = list;
};
const getStateRegionData = async () => {
    let result = await getState('');
    let list = result.map((item) => {
        return {
            key: item.geoId,
            label: item.abbrName,
        };
    });
    stateRegionData.value = list;
};
const getCbsaRegionData = async () => {
    let result = await getCBSA('');
    let list = result.map((item) => {
        return {
            key: item.geoId,
            label: item.name,
        };
    });
    cbsaRegionData.value = list;
};
const getCountyData = async () => {
    let result = await getCounty('');
    let stateObj = {};
    stateRegionData.value.forEach((item) => {
        stateObj[item.key] = item.label;
    });
    let list = result.map((item) => {
        let stateId = item.geoId.substr(0, 2);
        let stateName = stateObj[stateId];
        return {
            key: item.geoId,
            label: item.name + ', ' + stateName,
        };
    });
    countyRegionData.value = list;
};
const initRegionData = async () => {
    await getAllEpaRegionData();
    await getStateRegionData();
    await getCbsaRegionData();
    await getCountyData();
};
onMounted(async () => {
    await nextTick();
    await initChart();
    initData();
    initRegionData();
});
</script>
<style scoped lang="scss">
.setor-summary-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .sources-select {
        display: flex;
        border: 1px solid #ccc;
        .select-item {
            width: 100%;
            box-sizing: border-box;
            .select-header {
                height: 32px;
                font-size: 12px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                padding: 0 5px;
                border-bottom: 1px solid #ccc;
                background: #f7f7f7;
                .sites-number {
                    width: 100px;
                    margin-left: 5px;
                }
                .select-detail {
                    display: flex;
                    align-items: center;
                    .sources-item {
                        display: flex;
                        align-items: center;
                        .sources-select {
                            width: 100px;
                            margin-left: 5px;
                        }
                    }
                    .sources-item + .sources-item {
                        margin-left: 5px;
                    }
                }
            }
            .select-content {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                box-sizing: border-box;
                padding: 5px;
                .sites-content-item {
                    display: flex;
                    width: 48%;
                    justify-content: space-between;
                    align-items: center;
                    margin-right: 5px;
                    font-size: 12px;
                }
            }
            .pollutants-content {
                :deep(.el-checkbox) {
                    margin-right: 10px;
                }
            }
        }
        .select-item + .select-item {
            border-left: 1px solid #ccc;
        }
    }
    .sources-content {
        width: 100%;
        flex: 1;
        overflow: hidden;
        margin-top: 5px;
    }
}
.summaryPlotCanvas {
    background: #fff;
    width: 100% !important;
    // height: 100% !important;
}
</style>
