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
            <div class="proximity-dialog-title">
                <span>Gather tracts around location(s)</span>
                <el-button @click="handleOutput" type="primary">Output</el-button>
            </div>
            <!-- <div class="proximity-dialog-header">
                <div class="select-input-box">
                    Air Toxics Risk threshold("x"-in-a million):
                    <el-input-number class="number-box" v-model="airToxic" :min="1" :max="100" size="small" controls-position="right" />
                </div>
            </div> -->
            <div class="proximity-dialog-main" ref="proximityAnalysisRef">
                <el-radio-group v-model="radio" @change="handleRadioChange">
                    <LocationRadio @handleHover="handleHover" :activeRadio="radio" ref="locationRadioRef" />
                    <DirectlyRadio @handleHover="handleHover" :activeRadio="radio" ref="directlyRadioRef" />
                </el-radio-group>
            </div>
            <div class="individual-table-btn">
                <el-button type="success" @click="showIndividualTable" :loading="individualLoading" :disabled="individualLoading">Create Individual Sites Table</el-button>
                <!-- <el-button @click="showIndividualSummaryTable" type="primary">Summary Table</el-button> -->
                <!-- <el-button type="success" @click="showNationTable" :loading="nationLoading">Create National Sites Table</el-button> -->
                <el-button @click="handleSubmit">Apply</el-button>
                <el-button @click="resetAll">Clear</el-button>
                <!-- <el-button @click="resetAll">Reset</el-button> -->
            </div>
            <Tooltip ref="tooltipRef" :append-ref="proximityAnalysisRef" effect="customized">
                <span>{{ activeItem }}</span>
            </Tooltip>
        </div>
    </MyDrawer>
</template>
<script setup>
import IndividualSitesTable from './IndividualSitesTable.vue';
import SummaryTable from './SummaryTable.vue';
import exportExcel from '@/libs/export-excel';
import airToxicPollutant from '@/libs/airToxic-pollutant';
import { getIndividualSummary } from '@/api/emissions-facility';
import * as turf from '@turf/turf';
import LocationRadio from './RadioContent/LocationRadio/index.vue';
import DirectlyRadio from './RadioContent/DirectlyRadio/index.vue';
import RBush from 'rbush';
import { useProximityAnalysisStore } from '@/store/proximity-analysis.js';
import { useMonitorSiteStore } from '@/store/monitor-site';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import { useProjectYearStore } from '@/store/project-year';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { ElMessageBox } from 'element-plus';
import { OverlayScrollbars } from 'overlayscrollbars';
import Worker from '@/libs/worker/proximity-worker.js?worker';
import { showDialog } from '@/libs/utils';
const locationRadioRef = ref();
const directlyRadioRef = ref();

const monitorSiteStore = useMonitorSiteStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const majorEissionStore = useMajorEissionStore();
const projectYearStore = useProjectYearStore();
const zoomSelectorStore = useZoomSelectorStore();
const worker = new Worker();

let { setMapIcon, setCircle, setRadius, clearMap, clearInteractionLayer } = proximityAnalysisStore.layer;

const proximityDialog = ref();
const tooltipRef = ref();
const loading = ref(false);
const geoJsonLoading = ref(false);
const dataLoading = ref(false);
const checkLoading = ref(false);
const showLodaing = computed(() => loading.value || geoJsonLoading.value || dataLoading.value || checkLoading.value);
const proximityAnalysisRef = ref();

const activeItem = ref(null);
const radiusValue = ref(proximityAnalysisStore.radiusValue);
const areaRatio = ref(10);
const airToxic = ref(40);
const siteDataCopy = ref(null);
const individualLoading = ref(false);
const radio = ref(proximityAnalysisStore.radioValue);
const columnList = ref([
    {
        header: 'Drivers',
        key: 'driver',
        width: 90,
        children: [
            {
                header: '',
                key: 'title',
                width: 30,
            },
            {
                header: '80-90th percentile',
                key: 'percentile90',
                width: 60,
                children: [
                    {
                        header: 'Within Radius of A group',
                        key: 'withinRadiusOfCentroid',
                        width: 30,
                    },
                    {
                        header: 'County Avg.',
                        key: 'countyAvg',
                        width: 30,
                    },
                ],
            },
        ],
    },
    {
        header: 'options',
        key: 'options',
        width: 60,
        children: [
            {
                header: '90-95th percentile',
                key: 'percentile95',
                width: 30,
                children: [
                    {
                        header: 'CBSA Avg.',
                        key: 'cbsaAvg',
                        width: 30,
                    },
                    {
                        header: 'State Avg.',
                        key: 'stateAvg',
                        width: 30,
                    },
                ],
            },
            {
                header: '95-100th percentile',
                key: 'percentile100',
                width: 60,
                children: [
                    {
                        header: 'EPA Region Avg.',
                        key: 'epaRegionAvg',
                        width: 30,
                    },
                    {
                        header: 'Nation Avg.',
                        key: 'nationAvg',
                        width: 30,
                    },
                ],
            },
        ],
    },
]);
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
        type: 'percent',
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
        type: 'percent',
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
        title: 'Cancer risk value above selected threshold',
        key: 'cancerRisk_Max_Value_AboveSelectedThreshold',
        type: 'percent',
        unit: '(population %)',
        parent: '',
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
    // {
    //     title: 'Demographic Index',
    //     key: 'demographicIndex_PercentRank',
    //     type: 'percent',
    //     unit: '(%ile)',
    //     // parent: 'EJ/Demographics:',
    //     parent: 'Demographics',
    // },
    // {
    //     title: 'Demographic Index',
    //     key: 'demographicIndex_Value',
    //     type: 'percent',
    //     unit: '',
    //     parent: '',
    // },
    // {
    //     title: 'People of Color group',
    //     key: 'peopleOfColor_PCT_PercentRank',
    //     type: 'percent',
    //     unit: '(%ile)',
    //     parent: '',
    // },
    // {
    //     title: 'People of Color group',
    //     key: 'peopleOfColor_PCT_Value',
    //     type: 'percent',
    //     unit: '',
    //     parent: '',
    // },
    // {
    //     title: 'Low-income group',
    //     key: 'lowIncome_PCT_PercentRank',
    //     type: 'percent',
    //     unit: '(%ile)',
    //     parent: '',
    // },
    // {
    //     title: 'Low-income group',
    //     key: 'lowIncome_PCT_Value',
    //     type: 'percent',
    //     unit: '',
    //     parent: '',
    // },
    // {
    //     title: 'Linguistic Isolation',
    //     key: 'lingisO_PCT_PercentRank',
    //     type: 'percent',
    //     unit: '(%ile)',
    //     parent: '',
    // },
    // {
    //     title: 'Linguistic Isolation',
    //     key: 'lingisO_PCT_Value',
    //     type: 'percent',
    //     unit: '',
    //     parent: '',
    // },
    // {
    //     title: 'Less than high schools education',
    //     key: 'lesshS_PCT_PercentRank',
    //     type: 'percent',
    //     unit: '(%ile)',
    //     parent: '',
    // },
    // {
    //     title: 'Less than high schools education',
    //     key: 'lesshS_PCT_Value',
    //     type: 'percent',
    //     unit: '',
    //     parent: '',
    // },
    // {
    //     title: 'Individuals under age 5',
    //     key: 'under5_PCT_PercentRank',
    //     type: 'percent',
    //     unit: '(%ile)',
    //     parent: '',
    // },
    // {
    //     title: 'Individuals under age 5',
    //     key: 'under5_PCT_Value',
    //     type: 'percent',
    //     unit: '',
    //     parent: '',
    // },
    // {
    //     title: 'Individuals over age 64',
    //     key: 'over64_PCT_PercentRank',
    //     type: 'percent',
    //     unit: '(%ile)',
    //     parent: '',
    // },
    // {
    //     title: 'Individuals over age 64',
    //     key: 'over64_PCT_Value',
    //     type: 'percent',
    //     unit: '',
    //     parent: '',
    // },
]);
const includesGeoIds = reactive({
    data: [],
    type: '',
});
const openIndividualDialog = async (option) => {
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
                showDialog(IndividualSitesTable, {
                    ...option,
                    areaRatio: areaRatio.value,
                });
            })
            .catch(() => {});
    } catch (err) {
        console.log('individual-error', err);
    }
};
const showIndividualTable = async () => {
    let flag = true;
    flag = await handleSubmit();
    if (!flag) return;
    individualLoading.value = true;
    openIndividualDialog({
        data: includesGeoIds.data,
        type: includesGeoIds.type,
        areaRatio: areaRatio.value,
    });
    individualLoading.value = false;
};
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
const handleSubmit = async () => {
    let flag = true;
    loading.value = true;
    let data = [];

    if (radio.value == 1) {
        let locationData = await locationRadioRef.value.getSites();
        data = data.concat(locationData.data);
        includesGeoIds.type = locationData.type;
    } else {
        let directlyData = await directlyRadioRef.value.getSites();
        data = data.concat(directlyData);
        includesGeoIds.type = 'censusTract';
    }
    includesGeoIds.data = data;
    setMapIcon(data);
    if (includesGeoIds.type !== 'censusTract') {
        setCircle(data);
    } else {
        setCircle([]);
    }

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
    () => proximityAnalysisStore.radiusValue,
    (val) => {
        // proximityAnalysisStore.radiusValue = val;
        setRadius(val * 1000);
    }
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
const formatData = (val, type) => {
    if (type === 'percent') {
        return Math.floor(val * 100) + '%';
    } else {
        return Math.floor(val * 100) / 100;
    }
};
const exportData = (driverContent, list) => {
    // const columList = columnList;
    let name = `Proximity table for Centroid of Inyo County within ${radiusValue.value}km`;
    const data = list.map((item) => item);
    let percentilColor = proximityAnalysisStore.summaryTableColor.list;
    const cellStyleFn = (row) => {
        row.eachCell((cell) => {
            let value = cell.value;
            let reg = /^\d+%$/;
            let backgroundColor = 'ffffffff';
            if (reg.test(value)) {
                let val = value.replace(/%/gi, '');
                percentilColor.forEach((item) => {
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
            percentilColor.forEach((item) => {
                if (value === item.label) {
                    backgroundColor = item.excelColor;
                }
            });

            if (value === 'Drivers') {
                let arr = [];
                let siteName = includesGeoIds.data.map((item) => item.name).join(', ');
                let siteType = includesGeoIds.type === 'monitor' ? 'Monitor Site' : includesGeoIds.type === 'source' ? 'A group of facilities' : 'A group of census tracts';
                let siteList = [
                    {
                        siteType,
                        siteName,
                    },
                ];
                if (siteList.length) {
                    siteList.forEach((item) => {
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
                        text: driverContent,
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
                        text: `${radiusValue.value} km \n`,
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
                        text: `Air Toxics Risk threshold:`,
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
                        text: `${airToxic.value} ("x"-in-a million) \n`,
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
    exportExcel(name, [
        {
            // tableName: 'sheet',
            columList: columnList.value,
            data,
            cellStyleFn,
            headerStyleFn,
        },
    ]);
    // exportExcel();
};

const getExportData = async (result) => {
    let tableList = [];
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
    let labelArr = [];
    result.topAirToxicRiskDrivers &&
        result.topAirToxicRiskDrivers.forEach((item) => {
            let lable = airToxicPollutant[item.key];
            labelArr.push(`${lable}(${formatData(item.value, 'percent')})`);
        });
    let driverContent = labelArr.join(', ');
    exportData(driverContent, tableList);
};
const getGeoIds = async () => {
    let list = await proximityAnalysisStore.getGeoIds(areaRatio.value);
    let geoIds = new Set();
    list.forEach((item) => {
        item.forEach((id) => {
            geoIds.add(id);
        });
    });
    return [...geoIds];
};
const getData = async (list) => {
    let params = {
        year: projectYearStore.projectYear,
        ejYear: projectYearStore.ejYear,
        geoIds: list,
        airToxicRiskThreshold: airToxic.value,
    };
    let districtData = zoomSelectorStore.getZoomDetail();
    params = {
        ...params,
        ...districtData,
    };
    if (includesGeoIds.data.length === 1) {
        let id = includesGeoIds.data[0].countyGeoId;
        if (id) {
            params.districtType = 'County';
            params.districtGeoId = id;
        }
    }
    let result = await getIndividualSummary(params);
    Object.keys(result).forEach((key) => {
        let item = result[key];
        if (item) {
            item['cancerRisk_Max_Value'] = item?.['cancerRisk_Max_Value'] ? roundTo(item['cancerRisk_Max_Value']) : null;
            item['hazardIndex_Max_Value'] = item?.['hazardIndex_Max_Value'] ? roundTo(item['hazardIndex_Max_Value']) : null;
        }
    });
    getExportData(result);
};
const getTable = async () => {
    let list = [];
    try {
        if (includesGeoIds.type !== 'censusTract') {
            list = await getGeoIds();
        } else {
            list = includesGeoIds.data.map((item) => item.geoId);
        }

        if (!list.length) {
            await ElMessageBox.confirm(`Please wait for the map to load before opening`, 'Tips', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'Warning',
            })
                .then(async () => {})
                .catch(() => {});
            return;
        }
        // 估计平均每条请求40ms
        let needMs = list.length * 40;
        // 判断估计需要多少秒
        let needSec = needMs / 1000;
        let needMin = Math.floor(needSec / 60);
        if (needSec >= 30) {
            await ElMessageBox.confirm(`This may take up to ${needMin + 1}  minute(s), would you like to continue?`, 'Tips', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'Warning',
            })
                .then(async () => {
                    await getData(list);
                })
                .catch(() => {});
        } else {
            await getData(list);
        }
    } catch (error) {
        console.log('getTable-error', error);
    } finally {
        loading.value = false;
    }
};
const handleOutput = async () => {
    let flag = true;
    flag = await handleSubmit();
    if (!flag) return;
    getTable();
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
};
const resetAll = () => {
    clearAll();
    areaRatio.value = 10;
    proximityAnalysisStore.censusTracts = [];
    proximityAnalysisStore.radioValue = radio.value;
};
const clearData = () => {
    clearMap();
    locationRadioRef.value.clearData();
    directlyRadioRef.value.clearData();
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
            if (radio.value == 1) {
                if (proximityAnalysisStore.siteType === 'monitor') {
                    locationRadioRef.value.initMonitorData([value]);
                } else if (proximityAnalysisStore.siteType === 'facility') {
                    locationRadioRef.value.initFacilityData([value]);
                }
            } else {
                proximityAnalysisStore.siteData = value;
            }
        }
    }
);
watch(
    () => proximityAnalysisStore.isShift,
    (val) => {
        console.log('isShift', val);
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
        // 判断当前是否多选或者选择censusTractsSelect
        if (siteType !== 'multiSelect' && siteType !== 'censusTractsSelect') {
            let value = proximityAnalysisStore.siteData;
            // 空的或者已经点击过了不在响应
            if (!value || siteDataCopy.value === value) return;
            siteDataCopy.value = value;
            // 判断是否为monitor
            if (siteType === 'monitor') {
                radio.value = 1;
                await locationRadioRef.value.initMonitorData([value]);
            } else if (siteType === 'facility') {
                radio.value = 1;
                await locationRadioRef.value.initFacilityData([value]);
            } else if (siteType === 'censusTract') {
                radio.value = 2;
                await directlyRadioRef.value.initCensusTractSelect([value]);
            }
        } else if (siteType === 'multiSelect') {
            let monitorSites = monitorSiteStore.siteSelectList;
            let facilities = majorEissionStore.siteSelectList;
            if (!monitorSites.length && !facilities.length) {
                return true;
            }
            if (monitorSites.length) {
                radio.value = 1;
                let list = monitorSites.map((item) => item.basePollutantType + ':' + item.siteId);
                console.log('list', list);
                await locationRadioRef.value.initMonitorData(list);
            } else if (facilities.length) {
                radio.value = 1;
                let list = facilities.map((item) => item.sectorProjectGroup + ':' + item.facilityId);
                await locationRadioRef.value.initFacilityData(list);
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
            radio.value = 2;
            await directlyRadioRef.value.initCensusTractSelect(censusTractsList);
            proximityAnalysisStore.censusTracts = [];
        }
        await nextTick();
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
        await locationRadioRef.value.initData();
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
    .proximity-dialog-title {
        width: 100%;
        font-size: 24px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
    }
    .proximity-dialog-header {
        box-sizing: border-box;
        // border-bottom: 1px solid #ccc;
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
            margin-bottom: 5px;
        }
        .select-input-box {
            display: flex;
            align-items: center;
            // justify-content: center;
        }
    }
    .proximity-dialog-main {
        width: 100%;
        flex: 1;
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
