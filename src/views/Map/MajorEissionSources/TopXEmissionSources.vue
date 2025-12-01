<template>
    <div class="top-x-emission-sources-content">
        <div class="content-left">
            <div class="select-box">
                <div class="select-item">
                    Top X Emission Sources:
                    <el-input-number v-model="topXEmissionSources" @change="resetList" class="sites-number" size="small" :min="1" controls-position="right" />
                </div>
                <div class="select-item">
                    Pollutant:
                    <el-select v-model="pollutant" @change="resetQuestData" placeholder="Select" style="width: 110px" size="small">
                        <el-option v-for="item in emissionList" :key="item.type" :label="item.label" :value="item.type"
                    /></el-select>
                </div>
                <div class="select-item">
                    <el-radio-group v-model="dataType" @change="resetQuestData">
                        <el-radio value="facility">Facility</el-radio>
                        <el-radio value="county">Source Category</el-radio>
                    </el-radio-group>
                </div>
                <div><el-button type="primary" class="applyBtn" @click="resetList">Apply</el-button></div>
                <div><el-button type="primary" class="applyBtn" @click="exportData">Output</el-button></div>
            </div>
            <div class="result-content">
                <div class="result-title">Results</div>
                <div class="result-box">
                    <div ref="resultContent" v-loading="loading" element-loading-text="Loading...">
                        <div v-if="dataType === 'facility'">
                            <MajorPointSourceItem
                                @click="setMapIcon(item)"
                                :data="item"
                                :label="facilityData.type"
                                :type="pollutant"
                                v-for="(item, index) in facilityData.list"
                                :key="index"
                                :selectId="majorEissionStore.selectId"
                                @handleHover="hoverItem"
                            />
                        </div>
                        <div v-else>
                            <SourceCategoryEmissionItem v-for="item in countyData.list" :data="item" :type="pollutant" />
                        </div>
                    </div>
                    <div class="result-tips">Click the marker to view in Map</div>
                </div>
            </div>
        </div>
        <div class="content-right">
            <div class="canvas-box">
                <canvas id="sourceChart"></canvas>
            </div>
        </div>
        <Tooltip ref="tooltipRef" :append-ref="resultContent" effect="customized">
            <div class="popper-detail-content">
                <div class="popper-detail-content">
                    <div class="detail-content-item">Facility: {{ activeItem.data.siteName }}</div>
                    <div class="detail-content-item">Sector: {{ activeItem.data.sectorProjectGroup }}</div>
                    <div class="detail-content-item">
                        {{ activeItem.label }}({{
                            activeItem.type == 'Gas_VOC_HAPs' || activeItem.type === 'Heavy_Metal_HAPs' ? 'LB' : activeItem.type === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY'
                        }}):
                        <span> {{ activeItem.data.value }}</span>
                    </div>
                </div>
            </div>
        </Tooltip>
    </div>
</template>
<script setup>
import Chart from 'chart.js/auto';
import MajorPointSourceItem from '@/components/MajorPointSource/MajorPointSourceItem.vue';
import SourceCategoryEmissionItem from '@/components/SourceCategoryEmissions/SourceCategoryEmissionItem.vue';
import { getEmissionsDataFacility, getEmissionsDataCounty } from '@/api/emissions-data.js';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import { useSidebarStore } from '@/store/sidebar';
import { getCountyById, getStateById, getCbsaById } from '@/api/district';

import exportExcel from '@/libs/export-excel';
const props = defineProps({
    activeTab: {
        type: String,
        default: '',
    },
    emissionYear: {
        type: Number,
        default: 2017,
    },
});
const majorEissionStore = useMajorEissionStore();
const sidebarStore = useSidebarStore();
const { showMapLayer, setSteps, setOneMapIcon } = majorEissionStore.layer;
const zoomSelectorStore = useZoomSelectorStore();

const year = ref(props.emissionYear);
const topXEmissionSources = ref(10);
const pollutant = ref('NOx');
const loading = ref(false);
const dataType = ref('facility');
const distritSelectModel = ref(zoomSelectorStore.model);

const facilityData = reactive({
    list: [],
    label: '',
});
const countyData = reactive({
    list: [],
    label: '',
});

watch(
    () => zoomSelectorStore.model,
    (val) => {
        distritSelectModel.value = val;
        resetList();
    }
);
watch(
    () => majorEissionStore.toxType,
    (val) => {
        activeLayerType.value = val;
    }
);
watch(
    () => props.emissionYear,
    (val) => {
        year.value = val;
        resetList();
    },
    { deep: true }
);
const activeLayerType = ref(null);
const tooltipRef = ref();
const activeItem = reactive({
    data: {},
    type: '',
    label: '',
});
const hoverItem = (data, currentTarget) => {
    activeItem.data = data.data;
    activeItem.type = data.type;
    activeItem.label = data.label;
    tooltipRef.value.resetData(currentTarget);
};
const resetList = () => {
    setSteps(topXEmissionSources.value);
    emissionList.value.forEach((item) => {
        item.list = [];
        item.countyData = [];
    });
    resetQuestData();
};
const resetQuestData = async () => {
    if (dataType.value == 'county') {
        getCountyData();
    } else {
        await getFacilityData();
        if (props.activeTab === 'topXEmissionSources') {
            showLayer();
        }
    }
};

const showLayer = () => {
    majorEissionStore.toxType = pollutant.value;
    setSteps(facilityData.list.length);
    let dataList = facilityData.list.map((item) => {
        let { facilityId, siteLon, siteLat, ranking, value, sectorProjectGroup, siteName } = item;
        let data = {
            facilityId,
            siteLon,
            siteLat,
            ranking,
            value,
            sectorProjectGroup,
            siteName,
        };
        data.baseData = JSON.stringify(item);
        return data;
    });
    showMapLayer(dataList, 'circle', majorEissionStore.setFeature);
};
const resetData = (key, item, total) => {
    let type = {
        point: 'Point',
        event: 'Event',
        nonPoint: 'Non-Point',
        onRoad: 'On-Road',
        nonRoad: 'Non-Road',
        total: 'Total',
        residentialCombustion: 'Resident Wood Combustion',
    };
    let value = Math.round(item[key]);
    let percent = null;
    if (total) {
        percent = value / total;
        percent = Math.round(percent * 10000) / 100 + '%';
    }
    return { value, percent, name: type[key], childs: [] };
};
const getCountyData = async () => {
    if (emissionList.value[0].countyData.length === 0) {
        let geoIdList = {
            // epaRegionId: distritSelectModel.value[0],
            // stateGeoId: distritSelectModel.value[1],
            // cbsaGeoId: distritSelectModel.value[2],
            // countyGeoId: distritSelectModel.value[3],
        };
        let keyArr = ['epaRegionId', 'stateGeoId', 'cbsaGeoId', 'countyGeoId'];
        distritSelectModel.value.forEach((item, index) => {
            let key = '';
            if (item) {
                key = keyArr[index];
                if (key) {
                    geoIdList[key] = [item];
                }
            }
        });
        let result = await getEmissionsDataCounty({
            year: year.value,
            ...geoIdList,
        });

        let noSetKey = ['pollutant', 'total', 'residentialCombustion'];
        result.forEach((item) => {
            let arr = [];
            let total = Math.round(item['total']);
            Object.keys(item).forEach((key) => {
                if (noSetKey.indexOf(key) === -1) {
                    let obj = resetData(key, item, total);
                    if (key === 'nonPoint') {
                        let childObj = resetData('residentialCombustion', item, total);
                        obj.childs.push(childObj);
                    }
                    arr.push(obj);
                }
            });
            arr.sort((a, b) => b.value - a.value);
            arr.push(resetData('total', item));
            emissionList.value.forEach((_item) => {
                if (_item.type === item.pollutant) {
                    _item.countyData = arr;
                } else if (item.pollutant === 'NOX' && _item.type === 'NOx') {
                    _item.countyData = arr;
                }
            });
        });
    }
    emissionList.value.forEach((item) => {
        if (item.type === pollutant.value) {
            countyData.list = item.countyData;
            countyData.type = item.label;
            resetChart();
        }
    });
};
const resetChart = () => {
    let type = dataType.value === 'county' ? countyData.type : facilityData.type;
    let title = `Top ${topXEmissionSources.value} ${type} Emissions`;
    let label = '';
    let unitValue = pollutant.value == 'Gas_VOC_HAPs' || pollutant.value === 'Heavy_Metal_HAPs' ? 'LB' : pollutant.value === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY';
    label = `${type}(${unitValue})`;

    let labels = [];
    let dataList = [];
    let list = dataType.value === 'county' ? countyData.list : facilityData.list;

    list.forEach((item) => {
        labels.push(item.name);
        dataList.push(item.value);
    });
    myChart.data.labels = labels;
    myChart.data.datasets = [
        {
            label: label,
            data: dataList,
            backgroundColor: '#0D0DFF', // 设置点的填充色
        },
    ];
    myChart.options.plugins.title.text = title;
    myChart.options.scales.y.title.text = dataType.value === 'county' ? 'Source Categoty' : 'Site Name';
    myChart.options.scales.x.title.text = dataType.value === 'county' ? '(10^6)' : '(10^3)';
    myChart.update();
};
const getDataFn = async (type) => {
    let geoIdList = {
        // epaRegionId: distritSelectModel.value[0],
        // stateGeoId: distritSelectModel.value[1],
        // cbsaGeoId: distritSelectModel.value[2],
        // countyGeoId: distritSelectModel.value[3],
    };
    let keyArr = ['epaRegionId', 'stateGeoId', 'cbsaGeoId', 'countyGeoId'];
    distritSelectModel.value.forEach((item, index) => {
        let key = null;
        if (item) {
            key = keyArr[index];
            if (key) {
                geoIdList[key] = [item];
            }
        }
    });
    let results = await getEmissionsDataFacility({
        year: year.value,
        pageNumber: 1,
        pageSize: topXEmissionSources.value,
        desc: true,
        order: pollutant.value,
        ...geoIdList,
    });
    let list = results.items || [];
    list.forEach((item, index) => {
        let value = item[type.toLowerCase()];
        item.value = Math.floor(value * 100) / 100;
        item.siteLon = item.siteLongitude;
        item.siteLat = item.siteLatitude;
        item.name = item.siteName;
        item.ranking = index;
    });
    return list;
};
const setMapIcon = (val) => {
    let { facilityId, siteLon, siteLat, ranking, value, sectorProjectGroup, siteName } = val;
    let data = {
        facilityId,
        siteLon,
        siteLat,
        ranking,
        value,
        sectorProjectGroup,
        siteName,
    };
    data.baseData = JSON.stringify(val);
    showLayer();
    majorEissionStore.clearOtherLayer();
    setOneMapIcon([data], majorEissionStore.setFeature);
    getSelectData(val);
};
const formatSelectData = (data) => {
    let labelList = [
        {
            label: 'FIPS',
            value: 'countyGeoId',
        },
        {
            label: 'STATE',
            value: 'stateAbbrName',
        },
        {
            label: 'COUNTY',
            value: 'countyName',
        },
        {
            label: 'Site Name',
            value: 'siteName',
        },
        {
            label: 'Facility',
            value: 'facilityId',
        },
        {
            label: 'Desciption',
            value: 'facilitySourceType',
        },
        {
            label: 'EPA Region',
            value: 'epaRegionId',
        },
        {
            label: 'NOx(TPY)',
            value: 'nox',
        },
        {
            label: 'VOC(TPY)',
            value: 'voc',
        },
        {
            label: 'SO2(TPY)',
            value: 'so2',
        },
        {
            label: 'CO2e(TPY)',
            value: 'co2e',
        },
        {
            label: 'PM2.5(TPY)',
            value: 'pm25',
        },
        {
            label: 'PM10(TPY)',
            value: 'pm10',
        },
        {
            label: 'Lead(LB)',
            value: 'lead',
        },
        {
            label: 'CO(TPY)',
            value: 'co',
        },
        {
            label: 'NH3(TPY)',
            value: 'nh3',
        },
        {
            label: 'Gas VOC HAPs (LB)',
            value: 'gas_voc_haps',
        },
        {
            label: 'Diesel PM (TONS)',
            value: 'diesel_pm_haps',
        },
        {
            label: 'Metal HAPs (LB)',
            value: 'heavy_metal_haps',
        },
    ];
    const array = [];
    let fomatList = ['nox', 'voc', 'so2', 'co2e', 'pm25', 'pm10', 'lead', 'co', 'nh3', 'gas_voc_haps', 'diesel_pm_haps', 'heavy_metal_haps'];
    labelList.forEach((item) => {
        let obj = {};
        obj.type = item.label;
        let value = data[item.value];
        if (fomatList.indexOf(item.value) !== -1 && value) {
            value = Math.floor(value * 100) / 100;
        }
        obj.value = value;
        array.push(obj);
    });
    return array;
};
const getSelectData = async (val) => {
    sidebarStore.infoData = formatSelectData(val);
    sidebarStore.infoType = 'majorSelectData';
};
const getFacilityData = async () => {
    let arr = [];
    loading.value = true;
    emissionList.value.forEach((item) => {
        if (item.type == pollutant.value) {
            let proData = null;
            if (item.list.length === 0) {
                proData = new Promise((resolve, reject) => {
                    getDataFn(item.type).then((res) => {
                        item.list = res || [];
                        resolve({
                            list: item.list,
                            label: item.label,
                        });
                    });
                });
            } else {
                proData = new Promise((resolve, reject) => {
                    resolve({
                        list: item.list,
                        label: item.label,
                    });
                });
            }
            arr.push(proData);
        }
    });
    await Promise.all(arr).then((res) => {
        let item = res[0];
        facilityData.list = item.list;
        facilityData.type = item.label;
        loading.value = false;
        resetChart();
    });
};
const emissionList = ref([
    {
        label: 'NOx',
        type: 'NOx',
        list: [],
        countyData: [],
    },
    {
        label: 'SO2',
        type: 'SO2',
        list: [],
        countyData: [],
    },
    {
        label: 'CO2e',
        type: 'CO2e',
        list: [],
        countyData: [],
    },
    {
        label: 'GAS & VOC HAPs',
        type: 'Gas_VOC_HAPs',
        list: [],
        countyData: [],
    },
    {
        label: 'Heavy Metal HAPs',
        type: 'Heavy_Metal_HAPs',
        list: [],
        countyData: [],
    },
    {
        label: 'PM2.5',
        type: 'PM25',
        list: [],
        countyData: [],
    },
    {
        label: 'Diesel PM',
        type: 'Diesel_PM_HAPs',
        list: [],
        countyData: [],
    },
    {
        label: 'VOC',
        type: 'VOC',
        list: [],
        countyData: [],
    },
    {
        label: 'NH3',
        type: 'NH3',
        list: [],
        countyData: [],
    },
    {
        label: 'CO',
        type: 'CO',
        list: [],
        countyData: [],
    },
    {
        label: 'PM10',
        type: 'PM10',
        list: [],
        countyData: [],
    },
]);
const exportData = async () => {
    let list = facilityData.list;
    let type = facilityData.type;
    let key = type.toLowerCase();
    let columns = [
        {
            header: 'Ranking #',
            key: 'index',
            width: 10,
        },
        {
            header: `${type}`,
            key: key,
            width: 60,
        },
    ];
    let unit = type == 'Gas_VOC_HAPs' || type === 'Heavy_Metal_HAPs' ? 'LB' : type === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY';
    let tableData = [];
    list.forEach((value, index) => {
        let data = tableData[index];
        let infoData = {
            facility: value.siteName,
            sector: value.sectorProjectGroup,
            label: `${type}(${unit})`,
            value: value.value,
        };
        if (data) {
            data[key] = infoData;
        } else {
            let obj = {};
            obj['index'] = index + 1;
            obj[key] = infoData;
            tableData.push(obj);
        }
    });
    const cellStyleFn = (row) => {
        row.eachCell((cell) => {
            let value = cell.value;
            if (Object.prototype.toString.call(value) === '[object Object]') {
                let arr = [
                    {
                        text: `Facility: ${value.facility}\n`,
                    },
                    {
                        text: `Sector: ${value.sector}\n`,
                    },
                    {
                        text: `${value.label}: ${value.value}`,
                    },
                ];
                cell.value = {
                    richText: arr,
                };
            }
            cell.alignment = { wrapText: true };
        });
        row.height = 40;
        return row;
    };
    const callbackFn = (_workbook, _sheet1) => {
        const canvas = document.querySelector('#sourceChart');
        let base64 = canvas.toDataURL();
        const imageId = _workbook.addImage({
            base64: base64,
            extension: 'png',
        });
        _sheet1.addImage(imageId, {
            tl: { col: 8, row: 4 },
            ext: { width: 800, height: 400 },
        });
    };
    let fileName = await getFileName();
    exportExcel(fileName, [
        {
            tableName: 'sheet',
            columList: columns,
            data: tableData,
            cellStyleFn,
            headerStyleFn: null,
            callbackFn,
        },
    ]);
};
const getFileName = async () => {
    let districtData = zoomSelectorStore.getZoomDetail();
    let type = districtData.districtType;
    let areaName = 'Nation';
    if (type === 'EpaRegion') {
        areaName = 'EPA Region' + districtData.districtGeoId;
    } else if (type === 'State') {
        let result = await getStateById(districtData.districtGeoId);
        areaName = result.abbrName;
    } else if (type === 'Cbsa') {
        let result = await getCbsaById(districtData.districtGeoId);
        areaName = result[0].name;
    } else if (type === 'County') {
        let result = await getCountyById(districtData.districtGeoId);
        areaName = result.name;
    }
    let fileName = `Top ${topXEmissionSources.value} Emission Sources in ${areaName}`;
    return fileName;
};
const resetLayer = () => {
    if (dataType.value !== 'county') {
        showLayer();
    }
};
const resetChartSize = () => {
    myChart.resize();
};
const resultContent = ref();
let myChart;
onMounted(async () => {
    await nextTick();
    resetList();

    myChart = new Chart(document.getElementById('sourceChart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            indexAxis: 'y',
            responsive: true,

            scales: {
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Site Name',
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
                },
                x: {
                    beginAtZero: true,
                    display: true,
                    title: {
                        display: true,
                        text: '(10^3)',
                    },
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: '',
                    font: {
                        size: 18,
                    },
                },
            },
            elements: {
                bar: {
                    borderWidth: 2,
                },
            },
        },
    });
    OverlayScrollbars(resultContent.value, {
        overflow: {
            x: 'none',
            y: 'scroll',
        },
    });
});
defineExpose({ resetLayer, resetChartSize });
</script>
<style lang="scss" scoped>
.top-x-emission-sources-content {
    width: 100%;
    height: 100%;
    display: flex;
    .content-left {
        width: 215px;
        height: 100%;
        display: flex;
        flex-direction: column;
        .select-box {
            font-size: 12px;
            .select-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                .sites-number {
                    width: 70px;
                }
                :deep(.el-radio__label) {
                    font-size: 12px;
                }
                :deep(.el-radio) {
                    height: 25px;
                }
            }
            .select-item + .select-item {
                margin-top: 5px;
            }
            .applyBtn {
                width: 100%;
                margin-top: 5px;
            }
        }
        .result-content {
            width: 100%;
            flex: 1;
            box-sizing: border-box;
            padding-top: 10px;
            position: relative;
            overflow: hidden;
            display: flex;
            // border: 1px solid #ccc;
            // margin-top: 10px;
            .result-title {
                font-size: 14px;
                position: absolute;
                top: 2px;
                left: 9px;
                background: #fff;
                z-index: 1;
            }
        }
        .result-box {
            width: 100%;
            flex: 1;
            border: 1px solid #ccc;
            position: relative;
            box-sizing: border-box;
            padding: 10px 5px;
            padding-bottom: 25px;
            display: flex;
            flex-direction: column;
            .result-tips {
                font-size: 12px;
                color: #6fa76f;
                position: absolute;
                bottom: 5px;
                right: 5px;
            }
            .result-content {
                width: 100%;
                flex: 1;
                display: flex;
                flex-direction: column;
                .result-content-list {
                    width: 100%;
                }
            }
        }
    }
    .content-right {
        flex: 1;
        height: 100%;
        box-sizing: border-box;
        padding-left: 15px;
        .canvas-box {
            width: 100%;
            min-width: 300px;
            height: 100%;
            box-sizing: border-box;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            #sourceChart {
                width: 100% !important;
                // height: 100% !important;
            }
        }
    }
}
</style>
