<template>
    <el-table
        :data="tableData"
        size="small"
        border
        class="sourcesTable"
        style="width: 100%"
        height="100%"
        :header-cell-style="getHeaderCellColor"
        :cell-style="handleColor"
        @header-click="handleHeaderClick"
        ref="tableRef"
    >
        <el-table-column class-name="percentile-cell" align="center" v-for="item in tableColumns">
            <template #header v-if="item.key === 'driver'">
                <div>
                    <div v-for="_item in props.siteList">
                        <el-tooltip>
                            <template #content>
                                <div style="max-width: 400px">
                                    <span>{{ _item.siteType }}</span
                                    >: {{ _item.siteName }}
                                </div>
                            </template>
                            <div class="driver-content">
                                <span style="color: blue">{{ _item.siteType }}</span
                                >: {{ _item.siteName }}
                            </div>
                        </el-tooltip>
                    </div>
                    <div><span style="color: blue">Top Air Toxics Risk Drivers</span>:{{ driverContent }}</div>
                </div>
            </template>
            <template #header v-if="item.key === 'options'">
                <div>
                    <div style="color: blue">Selected Options:</div>
                    <div><span style="color: #00b0f0">Radius of Impact</span>: {{ props.radiusValue }}km</div>
                    <!-- <div><span style="color: #00b0f0">Air Toxics Risk threshold</span>:{{ props.airToxic }}("x"-in-a million)</div> -->
                </div>
            </template>
            <el-table-column class-name="percentile-cell" align="center" v-for="_item in item.children" :label="_item.header" :prop="_item.key">
                <template #default="scope" v-if="_item.key == 'title'">
                    <div v-if="scope.row.parent" style="color: red">{{ scope.row.parent }}</div>
                    <div>
                        <span :style="geSpanColor(scope.row.title, false)">{{ scope.row.title }}</span> <span v-if="scope.row.unit">{{ scope.row.unit }}</span>
                    </div>
                </template>
                <el-table-column align="center" v-for="child in _item.children" :label="child.header" :prop="child.key"> </el-table-column>
            </el-table-column>
        </el-table-column>
    </el-table>
</template>
<script setup>
import exportExcel from '@/libs/export-excel';
import airToxicPollutant from '@/libs/airToxic-pollutant';
import PercentileColorBar from './PercentileColorBar.vue';
import { showDialog } from '@/libs/utils';
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    columnList: {
        type: Array,
        default: () => [],
    },
    colorList: {
        type: Array,
        default: () => [],
    },
    radiusValue: {
        type: Number,
        default: 5,
    },
    siteList: {
        type: Array,
        default: () => [],
    },
    airToxic: {
        type: Number,
        default: 40,
    },
    storeType: {
        type: String,
        default: 'proximityAnalysisStore',
    },
});

const percentilColor = ref([]);
const tableColumns = ref([]);
const tableData = ref([]);
const driverContent = ref();
const keyValueList = ref([
    {
        title: 'Population total',
        key: 'population_Total',
        type: 'value',
        unit: '',
        parent: '',
    },
    {
        title: 'PM2.5 risk',
        key: 'mortality_PM25_Max_PercentRank',
        type: 'percentTile',
        unit: '(%ile)',
        parent: '',
    },
    {
        title: 'PM2.5 risk value',
        key: 'mortality_PM25_Max_Value',
        type: 'value',
        unit: '(per 10k)',
        parent: '',
    },
    {
        title: 'Ozone risk',
        key: 'mortality_O3_Max_PercentRank',
        type: 'percentTile',
        unit: '(%ile)',
        parent: '',
    },
    {
        title: 'Ozone risk value',
        key: 'mortality_O3_Max_Value',
        type: 'value',
        unit: '(per 10k)',
        parent: '',
    },
    {
        title: 'Cancer risk value',
        key: 'cancerRisk_Max_Value',
        type: 'value',
        unit: '(per million)',
        parent: 'Air Toxics risk:',
    },
    {
        title: 'Non-cancer risk',
        key: 'hazardIndex_Max_Value',
        type: 'value',
        unit: '(Maximum Block-Level Hazard Index)',
        parent: '',
    },
    {
        title: 'PM2.5 Fused Conc.',
        key: 'fused_PM25',
        type: 'value',
        unit: '(μg/m³)',
        parent: 'AQ Fused Concentration:',
    },
    {
        title: 'Ozone Fused Conc.',
        key: 'fused_O3',
        type: 'value',
        unit: '(ppbv)',
        parent: '',
    },
    {
        title: 'Under 5 Years',
        key: 'acs_Under5_PCT',
        type: 'percent',
        unit: '(%)',
        parent: 'Demographics:',
    },
    {
        title: 'Over 62 Years',
        key: 'acs_Over62_PCT',
        type: 'percent',
        unit: '(%)',
        parent: '',
    },
]);
const tableRef = ref();
const tooltipRef = ref();
const activeData = ref({
    siteType: '',
    siteName: '',
});
watch(
    () => props.colorList,
    (val) => {
        percentilColor.value = val;
        tableColumns.value = getColumns();
    },
    {
        deep: true,
    }
);
watch(
    () => props.data,
    (val) => {
        getData();
    },
    { deep: true }
);
const geSpanColor = (title, isArgb = false) => {
    let redList = ['PM2.5 risk', 'Ozone risk'];
    let blueList = ['Cancer risk value', 'Cancer risk value above selected threshold'];
    let colorText = '';
    if (redList.indexOf(title) !== -1) {
        colorText = !isArgb ? 'color: red' : 'ffff0000';
    } else if (blueList.indexOf(title) !== -1) {
        colorText = !isArgb ? 'color: blue' : 'ff0000ff';
    } else {
        colorText = !isArgb ? 'color: #000' : 'ff000000';
    }
    return colorText;
};
const formatData = (val, type) => {
    if (type === 'percentTile') {
        return Math.floor(val * 100) + '%';
    } else if (type == 'percent') {
        return Math.floor(val * 100) / 100 + '%';
    } else {
        return Math.floor(val * 100) / 100;
    }
};
const getData = async () => {
    let result = props.data;
    let tableList = [];
    tableData.value = [];
    if (Object.keys(result).length == 0) return;
    keyValueList.value.forEach((item) => {
        let obj = {
            title: item.title,
            type: item.type,
            unit: item.unit,
            parent: item.parent,
        };
        obj.withinRadiusOfCentroid = result.withinRadiusOfCentroid ? formatData(result.withinRadiusOfCentroid[item.key], item.type) : 'N/A';
        obj.countyAvg = result.countyAvg ? formatData(result.countyAvg[item.key], item.type) : 'N/A';
        obj.cbsaAvg = result.cbsaAvg ? formatData(result.cbsaAvg[item.key], item.type) : 'N/A';
        obj.stateAvg = result.stateAvg ? formatData(result.stateAvg[item.key], item.type) : 'N/A';
        obj.epaRegionAvg = result.epaRegionAvg ? formatData(result.epaRegionAvg[item.key], item.type) : 'N/A';
        obj.nationAvg = result.nationAvg ? formatData(result.nationAvg[item.key], item.type) : 'N/A';
        tableList.push(obj);
    });
    driverContent.value = '';
    let labelArr = [];
    result.topAirToxicRiskDrivers &&
        result.topAirToxicRiskDrivers.forEach((item) => {
            let lable = airToxicPollutant[item.key];
            labelArr.push(`${lable}(${formatData(item.value, 'percentTile')})`);
        });
    driverContent.value = labelArr.join(', ');
    tableData.value = tableList;
};
const getColumns = () => {
    let list = props.columnList;
    list.forEach((item) => {
        item.children.forEach((_item) => {
            percentilColor.value.forEach((color) => {
                if (_item.key === color.key) {
                    _item.header = color.label;
                }
            });
        });
    });
    return list;
};
const getHeaderCellColor = ({ row, column, rowIndex, columnIndex }) => {
    let cellStyle = {};
    let label = column.label;
    cellStyle.background = `#fff `;
    percentilColor.value.forEach((item) => {
        if (label === item.label) {
            cellStyle.background = item.bgColor;
        }
    });

    return cellStyle;
};
const handleHeaderClick = (column, event) => {
    let label = column.label;
    let labels = percentilColor.value.map((item) => item.label);
    if (labels.indexOf(label) !== -1) {
        showDialog(PercentileColorBar, {
            storeKey: 'summaryTableColor',
            storeType: props.storeType,
        });
    }
};
const handleColor = ({ row, column, rowIndex, columnIndex }) => {
    let cellStyle = {};
    let val = row[column.property];
    if ((row.type === 'percentTile' || row.type === 'percent') && val && val !== 'N/A' && column.property !== 'title') {
        let value = val.replace(/%/gi, '');
        value = Number(value);
        percentilColor.value.forEach((item) => {
            if (value >= item.min && value <= item.max) {
                cellStyle.background = item.bgColor;
            }
        });
    } else {
        cellStyle.background = '#fff';
    }

    return cellStyle;
};
const exportData = (fileName) => {
    const columList = props.columnList;

    const data = tableData.value.map((item) => item);
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
            } else {
                cell.value = resetCellValue(value);
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
            cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
        });
        row.alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
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

            if (value === 'Drivers') {
                let arr = [];
                if (props.siteList.length) {
                    props.siteList.forEach((item) => {
                        let siteArr = [
                            {
                                font: {
                                    family: 1,
                                    name: 'Times New Roman',
                                    size: 11,
                                    bold: true,
                                    color: {
                                        argb: `ff0000ff`,
                                    },
                                },
                                text: item.siteType + ':',
                            },
                            {
                                font: {
                                    family: 1,
                                    name: 'Times New Roman',
                                    size: 11,
                                    bold: true,
                                    color: {
                                        argb: `ff000000`,
                                    },
                                },
                                text: item.siteName + ';\n',
                            },
                        ];
                        arr = arr.concat(siteArr);
                    });
                }
                arr = arr.concat([
                    {
                        font: {
                            family: 1,
                            name: 'Times New Roman',
                            size: 11,
                            bold: true,
                            color: {
                                argb: `ff0000ff`,
                            },
                        },
                        text: `Top Air Toxics Risk Drivers:`,
                    },
                    {
                        font: {
                            family: 1,
                            name: 'Times New Roman',
                            size: 11,
                            bold: true,
                            color: {
                                argb: `ff000000`,
                            },
                        },
                        text: driverContent.value,
                    },
                ]);
                cell.value = {
                    richText: arr,
                };
            }
            if (value === 'options') {
                let arr = [
                    {
                        font: {
                            family: 1,
                            name: 'Times New Roman',
                            size: 11,
                            bold: true,
                            color: {
                                argb: `ff0000ff`,
                            },
                        },
                        text: `Selected Options:\n`,
                    },
                    {
                        font: {
                            family: 1,
                            name: 'Times New Roman',
                            size: 11,
                            bold: true,
                            color: {
                                argb: `ff00b0f0`,
                            },
                        },
                        text: `Radius of Impact:`,
                    },
                    {
                        font: {
                            family: 1,
                            name: 'Times New Roman',
                            size: 11,
                            bold: true,
                            color: {
                                argb: `ff000000`,
                            },
                        },
                        text: `${props.radiusValue} km \n`,
                    },
                ];
                cell.value = {
                    richText: arr,
                };
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
            cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
        });
        row.alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
        row.height = 40;
    };
    console.log(columList, data);
    exportExcel(fileName, [
        {
            tableName: 'sheet',
            columList,
            data,
            cellStyleFn,
            headerStyleFn,
        },
    ]);
};
const resetCellValue = (value) => {
    let cellValue = value;
    keyValueList.value.forEach((item) => {
        if (value === item.title) {
            let textArr = [];

            if (item.parent) {
                textArr.push({
                    font: {
                        family: 1,
                        name: 'Times New Roman',
                        size: 11,
                        bold: true,
                        color: {
                            argb: `ffff0000`,
                        },
                    },
                    text: `${item.parent}\n`,
                });
            }
            let textColor = geSpanColor(item.title, true);
            textArr.push({
                font: {
                    family: 1,
                    name: 'Times New Roman',
                    size: 11,
                    bold: true,
                    color: {
                        argb: textColor,
                    },
                },
                text: `${item.title}`,
            });
            if (item.unit) {
                textArr.push({
                    font: {
                        family: 1,
                        name: 'Times New Roman',
                        size: 11,
                        bold: true,
                        color: {
                            argb: 'ff000000',
                        },
                    },
                    text: `${item.unit}`,
                });
            }
            cellValue = {
                richText: textArr,
            };
        }
    });
    return cellValue;
};
onMounted(() => {
    percentilColor.value = props.colorList;
    tableColumns.value = getColumns();
});
defineExpose({
    exportData,
});
</script>
<style scoped lang="scss">
.driver-content {
    width: 100%;
    max-height: 50px;
    word-break: break-all;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>
