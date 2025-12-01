<template>
    <div class="individual-site-table">
        <div class="individual-site-header">
            <el-tabs v-model="activeTab" class="individual-site-header-tabs">
                <el-tab-pane label="Table 1" :name="1"></el-tab-pane>
                <el-tab-pane label="Table 2" :name="2"></el-tab-pane>
            </el-tabs>
            <el-button type="primary" size="small" @click="exportXlsx" :disabled="isExport">Save</el-button>
        </div>
        <div class="individual-site-table-box" ref="tableContentRef" v-loading="loading" element-loading-text="Loading...">
            <div :style="{ width: tableWidth + 'px' }" v-show="activeTab === 1">
                <el-table v-for="item in tableList" :id="'table_' + item.id" :data="item.tableData" size="small" border>
                    <el-table-column>
                        <template #header>
                            <div>
                                <div>{{ typeName + ': ' }}{{ item.name }}. Population: {{ item.total }}</div>
                            </div>
                        </template>

                        <el-table-column v-for="column in item.columns" :width="column.type === 'info' ? 400 : 100" :label="column.label" :prop="column.prop">
                            <template #default="scope" v-if="column.type === 'info'">
                                <div>
                                    <div>Facility name: {{ scope.row[column.prop].facilityName }}</div>
                                    <div>
                                        County/City/State: {{ scope.row[column.prop].countyName }}/{{ scope.row[column.prop].cityName }}/{{ scope.row[column.prop].stateName }}
                                    </div>
                                    <div>EIS_ID: {{ scope.row[column.prop].id }}</div>
                                    <div>Sector Group: {{ scope.row[column.prop].sectorProjectGroup }}</div>
                                    <div>% of Sector Group: {{ scope.row[column.prop].sectorGroupPrecent }}</div>
                                    <div>NAICS code: {{ scope.row[column.prop].naicsCode }}</div>
                                    <div>NAICS description: {{ scope.row[column.prop].naicsDescription }}</div>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table-column>
                </el-table>
            </div>
            <div v-show="activeTab === 2" :style="{ width: tableTwoColumn.length * 100 + 'px' }">
                <el-table :data="tableTwoList" size="small" id="tableTwo" border>
                    <el-table-column>
                        <template #header>
                            <div>
                                <div>
                                    Total “Sector group” emissions combined for all selected {{ typeTitle }} (based on Top {{ props.topX }} facility emissions in each
                                    {{ typeTips }}).
                                </div>
                            </div>
                        </template>

                        <el-table-column v-for="column in tableTwoColumn" :width="100" :label="column.label" :prop="column.prop"> </el-table-column>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>
<script setup>
import { OverlayScrollbars } from 'overlayscrollbars';
import { getEmissionsDataFacility, getSectorGroupEmissionsCombined, getSectoreGroupEmission } from '@/api/emissions-data.js';
import { getPopulation } from '@/api/ej-demographic';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import exportExcel from '@/libs/export-excel';

const props = defineProps({
    typeList: {
        type: Array,
        default: () => [],
    },
    topX: {
        type: Number,
        default: 20,
    },
    regionList: {
        type: Array,
        default: () => [],
    },
    regionType: {
        type: String,
        default: '',
    },
    emissionYear: {
        type: Number,
        default: 2017,
    },
    populationYear: {
        type: Number,
        default: 2021,
    },
});
const majorEissionStore = useMajorEissionStore();
const emits = defineEmits(['handleData']);
const tableWidth = computed(() => 500 * props.typeList.length);
const oneLoading = ref(false);
const twoLoading = ref(false);
const loading = computed(() => oneLoading.value || twoLoading.value);
const isExport = computed(() => loading.value || !tableList.value.length || !tableTwoList.value.length);
const tableList = ref([]);
const tableTwoList = ref([]);
const tableTwoColumn = ref([]);
const tableContentRef = ref();
const activeTab = ref(1);
const typeName = computed(() =>
    props.regionType === 'epaRegion' ? 'EPA REGOPM NAME' : props.regionType === 'state' ? 'STATE NAME' : props.regionType === 'cbsa' ? 'CBSA NAME' : 'COUNTY NAME'
);
const typeTips = computed(() => (props.regionType === 'epaRegion' ? 'EPA Region' : props.regionType === 'state' ? 'state' : props.regionType === 'cbsa' ? 'CBSA' : 'county'));
const typeTitle = computed(() => (props.regionType === 'epaRegion' ? 'EPA Regions' : props.regionType === 'state' ? 'states' : props.regionType === 'cbsa' ? 'CBSAs' : 'counties'));
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
const exportCallbackFn = (workbook, sheetList) => {
    let columns = tableList.value[0].columns;
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
const exportTableOne = () => {
    let type = typeTitle.value;
    let excelTitle = `table1 with top ${props.regionList.length} ${type} with top ${props.topX} facilities`;
    let tableOptions = tableList.value.map((item) => {
        let columns = item.columns.map((_item) => {
            return {
                header: _item.label,
                key: _item.prop,
                width: _item.type === 'info' ? 70 : 20,
            };
        });
        let label = `${typeName.value}: ${item.name}. Population (${props.populationYear}): ${item.total}`;
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
const exportXlsx = () => {
    exportTableOne();
    exportTableTwo();
};
const tableTwoHeaderStyleFn = (row) => {
    row.eachCell((cell, colNumber) => {
        let value = cell.value;
        if (value === 'Drivers') {
            let arr = [
                {
                    text: `Total “Sector group” emissions combined for all selected ${typeTitle.value} (based on Top ${props.topX} facility emissions in each ${typeTips.value}).`,
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
    let excelTitle = `table2 with top ${props.regionList.length} ${type} with top ${props.topX} facilities`;
    let columns = tableTwoColumn.value.map((_item) => {
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
            data: tableTwoList.value,
            cellStyleFn: null,
            headerStyleFn: tableTwoHeaderStyleFn,
        },
    ]);
};
const resetTableList = async () => {
    let regionList = props.regionList;
    let typeList = props.typeList;
    let regionType = props.regionType;
    let typeKeys = typeList.map((item) => item.type.toLowerCase());
    let promiseArr = [];
    tableList.value = [];
    oneLoading.value = true;
    let sectorGroupEmissionData = majorEissionStore.sectorGroupEmissionData[props.emissionYear];
    regionList.forEach((item, index) => {
        let obj = {
            id: item.key,
            name: item.label,
            tableData: [],
            total: 0,
        };
        let columns = [];
        let requireList = [];
        typeList.forEach((_item) => {
            let columnsItem = [
                {
                    label: 'FacilityInfo',
                    prop: 'info_' + _item.type.toLowerCase(),
                    type: 'info',
                },
                {
                    label: `${_item.label} (${_item.unit})`,
                    prop: _item.type.toLowerCase(),
                    type: 'value',
                },
            ];
            columns = columns.concat(columnsItem);
            let requireData = new Promise((resolve, reject) => {
                let quaram = {
                    year: props.emissionYear,
                    pageNumber: 1,
                    pageSize: props.topX,
                    desc: true,
                    order: _item.type,
                };
                if (regionType === 'epaRegion') {
                    quaram.epaRegionId = [item.key];
                } else if (regionType === 'state') {
                    quaram.stateGeoId = [item.key];
                } else if (regionType === 'cbsa') {
                    quaram.cbsaGeoId = [item.key];
                } else if (regionType === 'county') {
                    quaram.countyGeoId = [item.key];
                }
                let result = getEmissionsDataFacility(quaram);
                resolve(result);
            });
            requireList.push(requireData);
        });
        obj.columns = columns;
        promiseArr.push(
            new Promise((resolve, reject) => {
                Promise.all(requireList).then(async (res) => {
                    let tableItem = tableList.value[index];
                    let tableData = tableItem.tableData;
                    tableItem.total = await getAllPopulation([tableItem.id]);
                    typeKeys.forEach((key, _index) => {
                        let result = res[_index].items;
                        result.forEach((resData, _resIndex) => {
                            let data = tableData[_resIndex];
                            let dataValue = Math.floor(resData[key] * 100) / 100;
                            let sectorProjectGroup = resData.sectorProjectGroup;
                            let sectorGroupData = sectorGroupEmissionData[sectorProjectGroup];
                            let sectorGroupEmissionAll = sectorGroupData[key];
                            let sectorGroupPrecent = null;
                            if (sectorGroupEmissionAll) {
                                sectorGroupPrecent = dataValue / sectorGroupEmissionAll;
                                sectorGroupPrecent = sectorGroupPrecent * 100;
                                sectorGroupPrecent = Math.floor(sectorGroupPrecent * 100) / 100 + '%';
                            }
                            let infoData = {
                                facilityName: resData.companyName,
                                countyName: resData.countyName,
                                cityName: resData.city,
                                stateName: resData.stateAbbrName,
                                id: resData.facilityId,
                                sectorProjectGroup: sectorProjectGroup,
                                naicsCode: resData.naicsCode,
                                naicsDescription: resData.naicsDescription,
                                sectorGroupPrecent: sectorGroupPrecent || 'NULL',
                            };
                            if (data) {
                                data['info_' + key] = infoData;
                                data[key] = dataValue;
                            } else {
                                let obj = {};
                                obj['info_' + key] = infoData;
                                obj[key] = dataValue;
                                tableData.push(obj);
                            }
                        });
                    });
                    resolve(true);
                });
            })
        );
        tableList.value.push(obj);
    });

    await Promise.all(promiseArr);
    oneLoading.value = false;
};
const getTableTwo = async () => {
    tableTwoList.value = [];
    let tableData = [];
    let ids = props.regionList.map((item) => item.key);
    let quaram = {
        year: props.emissionYear,
        districtType: props.regionType,
        districtIds: ids,
        topCount: props.topX,
    };
    twoLoading.value = true;
    let result = await getSectorGroupEmissionsCombined(quaram);
    let populationTotal = await getAllPopulation(ids);
    Object.keys(result).forEach((key) => {
        let obj = {
            name: key,
            population: populationTotal,
        };
        let data = result[key];
        let summary = data.summary;
        let topXFrequency = data.topXFrequency;
        let topXScore = data.topXScore;
        let top10Frequency = data.top10Frequency;
        let top10Score = data.top10Score;
        props.typeList.forEach((item) => {
            let type = item.type.toLowerCase();
            obj[type] = Math.floor(summary[type] * 100) / 100;
            obj['topXFrequency_' + type] = topXFrequency[type];
            obj['topXScore_' + type] = topXScore[type];
            obj['top10Frequency_' + type] = top10Frequency[type];
            obj['top10Score_' + type] = top10Score[type];
        });
        tableData.push(obj);
    });
    twoLoading.value = false;
    tableTwoList.value = tableData;
};
const getAllPopulation = async (ids) => {
    let quaram = {
        year: props.populationYear,
        districtType: props.regionType,
        districtIds: ids,
    };
    let result = await getPopulation(quaram);
    return result;
};
const getTableTwoColumns = () => {
    let arr = [
        {
            label: 'Sector Group',
            prop: 'name',
        },
    ];
    props.typeList.forEach((item) => {
        let obj = {
            label: `${item.label} (${item.unit})`,
            prop: item.type.toLowerCase(),
        };
        arr.push(obj);
    });
    arr.push({
        label: 'POP' + props.populationYear,
        prop: 'population',
    });
    props.typeList.forEach((item) => {
        let topXList = [
            {
                label: `${item.label} top${props.topX} frequency`,
                prop: 'topXFrequency_' + item.type.toLowerCase(),
            },
            {
                label: `${item.label} top${props.topX} score`,
                prop: 'topXScore_' + item.type.toLowerCase(),
            },
            {
                label: `${item.label} top10 frequency`,
                prop: 'top10Frequency_' + item.type.toLowerCase(),
            },
            {
                label: `${item.label} top10 score`,
                prop: 'top10Score_' + item.type.toLowerCase(),
            },
        ];
        arr = arr.concat(topXList);
    });
    tableTwoColumn.value = arr;
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
const initData = async () => {
    if (!majorEissionStore.sectorGroupEmissionData[props.emissionYear]) {
        await getEmissionBySectoreGroup();
    }
    getTableTwoColumns();
    resetTableList();
    getTableTwo();
};
watch(
    () => loading,
    (val) => {
        emits('handleData', val);
    }
);
watch(
    () => props.topX,
    () => {
        initData();
    },
    { deep: true }
);
watch(
    () => props.typeList,
    () => {
        initData();
    },
    { deep: true }
);
watch(
    () => props.emissionYear,
    () => {
        initData();
    },
    { deep: true }
);
watch(
    () => props.regionList,
    (val) => {
        if (val.length) {
            initData();
        } else {
            tableTwoColumn.value = [];
            tableList.value = [];
            tableTwoList.value = [];
        }
    },
    { deep: true }
);
onMounted(async () => {
    await nextTick();
    if (props.regionList.length) {
        initData();
    }
    OverlayScrollbars(tableContentRef.value, {
        overflow: {
            x: 'scroll',
            y: 'scroll',
        },
    });
});
</script>
<style scoped lang="scss">
.individual-site-table {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .individual-site-header {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0 5px;
        justify-content: space-between;
        .individual-site-header-tabs {
            :deep(.el-tabs__header) {
                margin: 0;
            }
        }
    }

    .individual-site-table-box {
        width: 100%;
        flex: 1;
        overflow: hidden;
        :deep(.percentile-cell) {
            color: #000;
        }

        :deep(.el-table__cell) {
            .cell {
                color: #000;
            }
        }
    }
}
</style>
