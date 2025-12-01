<template>
    <Dialog title="Proximity Plot" height="543" width="850" :unFullScreen="false">
        <div class="proximity-plot-content">
            <div class="aside-content" :class="{ deactiveContent: !showDetail }">
                <div class="aside-content-title">
                    <span class="content-title">Plot Setting: </span>
                    <Icon class="icon-button icon" :class="{ deactiveIcon: !showDetail }" name="d-arrow-left" size="14" @click="handleClickIcon" />
                </div>
                <div class="select-content">
                    <CheckboxGroup title="AQ Risk" :height="100" :options="AQRiskOptions" v-model="AQRisks" @change="handleChange" />
                    <CheckboxGroup title="EJ Indicators" :height="150" :options="EJIndicatorOptions" v-model="EJIndicators" @change="handleChange" />
                    <div class="aside-content-submit">
                        <el-button type="primary" @click="handleApply">Apply</el-button>
                        <el-button type="success" @click="handleExport">Output</el-button>
                    </div>
                </div>
                <div v-if="!showDetail" class="select-title">Plot Settings:</div>
            </div>
            <div class="main-content" v-loading="loading" element-loading-text="Loading...">
                <SummaryPlotCanvas
                    :title="canvasTitle"
                    :dataSets="canvasDataSets"
                    :chartLabel="chartLabel"
                    @handleLabelChange="handleLabelChange"
                    @handleChange="handleNationalAvg"
                    :options="avgOptions"
                    :defaultCheckList="avgCheckList"
                />
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import SummaryPlotCanvas from './SummaryPlotCanvas.vue';
import { getIndividualSummary } from '@/api/emissions-facility';
import { useProjectYearStore } from '@/store/project-year';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import CheckboxGroup from './CheckboxGroup.vue';
import { ElMessageBox } from 'element-plus';
import exportExcel from '@/libs/export-excel';
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
    radius: {
        type: Number,
        default: 5,
    },
});

let myChart;
const projectYearStore = useProjectYearStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const zoomSelectorStore = useZoomSelectorStore();
const loading = ref(false);

const countyCheck = ref(true);
const cbsaCheck = ref(true);
const stateCheck = ref(true);
const epaCheck = ref(true);

const canvasTitle = ref();
const canvasDataSets = ref([]);
const avgCheckList = ref(['mortality_PM25_Max_PercentRank', 'mortality_O3_Max_PercentRank', 'cancerRisk_Max_Value']);

const AQRisks = ref(['mortality_PM25_Max_PercentRank', 'mortality_O3_Max_PercentRank', 'cancerRisk_Max_Value']);
const EJIndicators = ref(['demographicIndex_PercentRank']);

const baseData = ref([]);
const chartLabel = ref([]);
const AQRiskOptions = ref([
    {
        label: 'PM2.5 risk',
        value: 'mortality_PM25_Max_PercentRank',
        data: [],
        color: '#F34336',
    },
    {
        label: 'O3 risk',
        value: 'mortality_O3_Max_PercentRank',
        data: [],
        color: '#2195F2',
    },
    {
        label: 'Air Toxics risk',
        // value: 'cancerRisk_Max_PercentRank',
        value: 'cancerRisk_Max_Value',
        data: [],
        color: '#FEC007',
    },
]);
const EJIndicatorOptions = ref([
    {
        label: 'Demographic index',
        value: 'demographicIndex_PercentRank',
        data: [],
        color: '#4CAE50',
    },
    {
        label: '% Low-Income',
        value: 'lowIncome_PCT_PercentRank',
        data: [],
        color: '#009587',
    },
    {
        label: '% People of Color',
        value: 'peopleOfColor_PCT_Value',
        data: [],
        color: '#FFC0CB',
    },
    {
        label: 'Less than high school education',
        value: 'lesshS_PCT_PercentRank',
        data: [],
        color: '#696969',
    },
    {
        label: 'Linguistic isolation',
        value: 'lingisO_PCT_PercentRank',
        data: [],
        color: '#E81E63',
    },

    {
        label: 'Individuals under age 5',
        value: 'under5_PCT_PercentRank',
        data: [],
        color: '#00008F',
    },
    {
        label: 'Individuals over age 64',
        value: 'over64_PCT_PercentRank',
        data: [],
        color: '#90ee90',
    },
]);
const avgOptions = computed(() => {
    let list = [];
    AQRiskOptions.value.forEach((item) => {
        if (AQRisks.value.indexOf(item.value) !== -1) {
            list.push({
                label: item.label,
                value: item.value,
            });
        }
    });
    EJIndicatorOptions.value.forEach((item) => {
        if (EJIndicators.value.indexOf(item.value) !== -1) {
            list.push({
                label: item.label,
                value: item.value,
            });
        }
    });
    return list;
});
const showDetail = ref(true);
const handleClickIcon = () => {
    showDetail.value = !showDetail.value;
    myChart.resize();
};
const getGeoIds = () => {
    let list = proximityAnalysisStore.getGeoIds(props.areaRatio);
    let geoIds = new Set();
    list.forEach((item) => {
        item.forEach((id) => {
            geoIds.add(id);
        });
    });
    return [...geoIds];
};
const formatData = (val, type) => {
    if (type === 'percent') {
        return Math.floor(val * 100);
    } else {
        return Math.floor(val * 100) / 100;
    }
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
const getTable = async (list) => {
    let params = {
        year: projectYearStore.projectYear,
        ejYear: projectYearStore.ejYear,
        geoIds: list,
        airToxicRiskThreshold: 40,
    };
    let districtData = zoomSelectorStore.getZoomDetail();
    params = {
        ...params,
        ...districtData,
    };
    if (props.data.length === 1) {
        let id = props.data[0].countyGeoId;
        if (id) {
            params.districtType = 'County';
            params.districtGeoId = id;
        }
    }
    let result = await getIndividualSummary(params);
    Object.keys(result).forEach((key) => {
        let item = result[key];
        item['cancerRisk_Max_Value'] = item['cancerRisk_Max_Value'] ? roundTo(item['cancerRisk_Max_Value']) : null;
        item['hazardIndex_Max_Value'] = item['hazardIndex_Max_Value'] ? roundTo(item['hazardIndex_Max_Value']) : null;
    });
    baseData.value = result;
    setChartLabel();
};
const setChartLabel = () => {
    let result = baseData.value;
    chartLabel.value = [];
    if (result.withinRadiusOfCentroid) {
        chartLabel.value.push('Within_Radius');
    }
    if (result.countyAvg && countyCheck.value) {
        chartLabel.value.push('County');
    }

    if (result.cbsaAvg && cbsaCheck.value) {
        chartLabel.value.push('CBSA');
    }
    if (result.stateAvg && stateCheck.value) {
        chartLabel.value.push('State');
    }
    if (result.epaRegionAvg && epaCheck.value) {
        chartLabel.value.push('EPA_Region');
    }
    if (result.nationAvg) {
        chartLabel.value.push('Nation');
    }
};
const getData = async () => {
    let list = [];
    loading.value = true;
    try {
        list = await getGeoIds();
        if (!list.length) {
            chartLabel.value = [];
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
                    await getTable(list);
                })
                .catch(() => {});
        } else {
            await getTable(list);
        }
    } catch (error) {
        console.log('error', error);
    } finally {
        loading.value = false;
    }
};
const setDataNumber = (key, label) => {
    let item = baseData.value[label];
    return item ? formatData(item[key], key == 'cancerRisk_Max_Value' ? 'value' : 'percent') : 0;
};
const resetItem = (item) => {
    let arr = [];
    let totalArr = [];
    let withinRadiusOfCentroid = setDataNumber(item.value, 'withinRadiusOfCentroid');
    let countyAvg = setDataNumber(item.value, 'countyAvg');
    let cbsaAvg = setDataNumber(item.value, 'cbsaAvg');
    let stateAvg = setDataNumber(item.value, 'stateAvg');
    let epaRegionAvg = setDataNumber(item.value, 'epaRegionAvg');
    let nationAvg = setDataNumber(item.value, 'nationAvg');
    chartLabel.value.forEach((key) => {
        totalArr.push(nationAvg);
        if (key === 'Within_Radius') {
            arr.push(withinRadiusOfCentroid);
        } else if (key === 'County') {
            arr.push(countyAvg);
        } else if (key === 'CBSA') {
            arr.push(cbsaAvg);
        } else if (key === 'State') {
            arr.push(stateAvg);
        } else if (key === 'EPA_Region') {
            arr.push(epaRegionAvg);
        } else if (key === 'Nation') {
            arr.push(nationAvg);
        }
    });
    return {
        allData: arr,
        totalArr,
    };
};
const getChartList = (item, list) => {
    let arr = [];
    if (list.indexOf(item.value) !== -1) {
        arr = [
            {
                type: 'bar',
                yAxisID: item.value == 'cancerRisk_Max_Value' ? 'yValue' : 'y',
                label: item.label,
                data: item.data,
                fill: true,
                borderColor: item.color, // 设置线的颜色
                backgroundColor: [item.color],
            },
        ];
        if (avgCheckList.value.indexOf(item.value) !== -1) {
            arr.push({
                type: 'line',
                label: 'National avg.',
                yAxisID: item.value == 'cancerRisk_Max_Value' ? 'yValue' : 'y',
                data: item.totalData,
                borderColor: item.color,
                borderWidth: 3,
                pointStyle: 'line',
                borderDash: [5, 5],
                // tension: 0.1,
            });
        }
    }
    return arr;
};
const getChartData = () => {
    let dataSets = [];
    AQRiskOptions.value.forEach((item) => {
        let { allData, totalArr } = resetItem(item);
        item.data = allData;
        item.totalData = totalArr;
        let arr = getChartList(item, AQRisks.value);
        dataSets.push(...arr);
    });
    EJIndicatorOptions.value.forEach((item) => {
        let { allData, totalArr } = resetItem(item);
        item.data = allData;
        item.totalData = totalArr;
        let arr = getChartList(item, EJIndicators.value);
        dataSets.push(...arr);
    });
    return dataSets;
};
const handleNationalAvg = (val) => {
    avgCheckList.value = val;
    handleChange();
};
const handleChange = () => {
    let dataSets = getChartData();
    canvasDataSets.value = dataSets;
};
const handleExport = () => {
    const sheetData = [];
    const columns = [
        {
            header: 'Indicators',
            key: 'Indicators',
            width: 20,
        },
    ];
    chartLabel.value.forEach((key, index) => {
        let label = key + '(%ile)';
        columns.push({
            header: label,
            key: label,
            width: 20,
        });
    });
    AQRiskOptions.value.forEach((item) => {
        if (AQRisks.value.indexOf(item.value) !== -1) {
            let obj = {
                Indicators: item.label,
            };
            chartLabel.value.forEach((key, index) => {
                let label = key + '(%ile)';
                obj[label] = item.data[index];
            });
            sheetData.push(obj);
        }
    });
    EJIndicatorOptions.value.forEach((item) => {
        if (EJIndicators.value.indexOf(item.value) !== -1) {
            let obj = {
                Indicators: item.label,
            };
            chartLabel.value.forEach((key, index) => {
                obj[key + '(%ile)'] = item.data[index];
            });
            sheetData.push(obj);
        }
    });
    exportExcel('Summary Plot', [
        {
            tableName: 'Summary Plot',
            columList: columns,
            data: sheetData,
            cellStyleFn: null,
            headerStyleFn: null,
        },
    ]);
};
const handleApply = async () => {
    await getData();
    let dataSets = getChartData();
    canvasDataSets.value = dataSets;
};

const handleLabelChange = (val) => {
    countyCheck.value = val.countyCheck;
    cbsaCheck.value = val.cbsaCheck;
    stateCheck.value = val.stateCheck;
    epaCheck.value = val.epaCheck;
    setChartLabel();
    handleChange();
};
onMounted(async () => {
    await nextTick();
    await getData();
    let dataSets = await getChartData();
    let title = `MP Risk and EJ Analysis Plot for `;

    if (props.type === 'monitor') {
        if (props.data.length === 1) {
            let name = props.data[0].name;
            title += `selected monitor site (${name})`;
        } else {
            let stateArr = new Set();
            props.data.forEach((item) => {
                stateArr.add(item.stateGeoId);
            });
            let name = stateArr.size === 1 ? props.data[0].stateAbbrName : 'Nation';
            title += `a group of monitor sites in ${name}`;
        }
    } else if (props.type === 'source') {
        if (props.data.length === 1) {
            let name = props.data[0].name;
            title += `selected facility (${name})`;
        } else {
            let stateArr = new Set();
            props.data.forEach((item) => {
                stateArr.add(item.stateGeoId);
            });
            let name = stateArr.size === 1 ? props.data[0].stateAbbrName : 'Nation';
            title += `a group of facilities in ${name}`;
        }
    } else if (props.type === 'cejst') {
        if (props.data.length === 1) {
            let name = props.data[0].cbsaName;
            title += `selected CEJST-Disadvantaged community (${name})`;
        } else {
            let stateArr = new Set();
            props.data.forEach((item) => {
                stateArr.add(item.stateGeoId);
            });
            let name = stateArr.size === 1 ? props.data[0].stateAbbrName : 'Nation';
            title += `a group of CEJST-Disadvantaged communities in ${name}`;
        }
    } else if (props.type === 'censusTract') {
        if (props.data.length === 1) {
            let id = props.data[0].id;
            title += `select census tract (${id})`;
        } else {
            title += 'a group of census tracts in Nation';
        }
    } else if (props.type === 'sites') {
        let monitorList = [];
        let facilityList = [];
        let stateArr = new Set();
        props.data.forEach((item) => {
            stateArr.add(item.stateGeoId);
            if (item.value) {
                monitorList.push(item);
            } else {
                facilityList.push(item);
            }
        });
        if (props.data.length === 1) {
            if (monitorList.length) {
                let name = props.data[0].name;
                title += `selected monitor site (${name})`;
            } else if (facilityList.length) {
                let name = props.data[0].name;
                title += `selected facility (${name})`;
            }
        } else {
            if (monitorList.length && facilityList.length == 0) {
                let name = stateArr.size === 1 ? props.data[0].stateAbbrName : 'Nation';
                title += `a group of monitor sites in ${name}`;
            } else if (monitorList.length == 0 && facilityList.length) {
                let name = stateArr.size === 1 ? props.data[0].stateAbbrName : 'Nation';
                title += `a group of facilities in ${name}`;
            } else {
                let name = stateArr.size === 1 ? props.data[0].stateAbbrName : 'Nation';
                title += `a group of sites in ${name}`;
            }
        }
    }
    if (proximityAnalysisStore.radioValue !== 5) {
        title += ` within ${props.radius}km`;
    }
    canvasTitle.value = title;
    canvasDataSets.value = dataSets;
});
</script>
<style lang="scss" scoped>
.proximity-plot-content {
    display: flex;
    height: 100%;
    overflow: hidden;
    .aside-content {
        width: 220px;
        background: #f0f0f0;
        box-sizing: border-box;
        border: 1px solid #ccc;
        // transition: all 1s;
        .aside-content-title {
            font-size: 14px;
            font-weight: bold;
            height: 24px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            padding: 0 5px;
            background: #f4f4f4;
            border: 1px solid #ccc;
            justify-content: space-between;
            .icon {
                transition: all 0.5s;
                transform: rotate(0deg);
            }
            .deactiveIcon {
                transform: rotate(180deg);
            }
        }

        .aside-content-submit {
            display: flex;
            align-items: center;
            justify-content: space-around;
            margin-top: 20px;
        }
        .select-title {
            width: 30px;
            height: 470px;
            display: flex;
            align-items: center;
            justify-content: center;
            writing-mode: tb-rl;
            transform: rotate(180deg);
            font-weight: bold;
        }
    }
    .deactiveContent {
        width: 30px;
        .content-title {
            display: none;
        }
        .select-content {
            display: none;
        }
    }
    .main-content {
        flex: 1;
    }
}
</style>
