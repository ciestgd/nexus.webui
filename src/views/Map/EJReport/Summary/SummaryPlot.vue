<template>
    <div class="canvas-content">
        <div class="pollutant-box">
            <div class="checkbox-all"><el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">All Select</el-checkbox></div>
            <el-checkbox-group class="checkbox-content" @change="handleCheckChange" v-model="checkedList">
                <el-checkbox size="small" v-for="item in options" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
        </div>
        <div class="main-content">
            <SummaryPlotCanvas
                type="indicator"
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
</template>
<script setup>
import SummaryPlotCanvas from '@/views/Map/ProximityAnalysis/SummaryPlotCanvas.vue';
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    cbsaData: {
        type: Array,
        default: () => [],
    },
    tractData: {
        type: Array,
        default: () => [],
    },
    countyData: {
        type: Array,
        default: () => [],
    },
});
const checkedList = ref(['mortality_PM25_Max_PercentRank', 'mortality_O3_Max_PercentRank', 'cancerRisk_Max_PercentRank', 'demographicIndex_PercentRank']);
const checkAll = ref(false);
const isIndeterminate = ref(true);
const options = ref([
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
        value: 'cancerRisk_Max_PercentRank',
        data: [],
        color: '#FEC007',
    },
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
const canvasTitle = ref(`MP Risk and EJ Analysis Plot in Nation`);
const canvasDataSets = ref([]);
const chartLabel = ref([]);
const avgOptions = computed(() => options.value.filter((item) => checkedList.value.indexOf(item.value) !== -1));
const avgCheckList = ref(['mortality_PM25_Max_PercentRank', 'mortality_O3_Max_PercentRank', 'cancerRisk_Max_PercentRank']);
const baseData = ref({});
const countyCheck = ref(true);
const cbsaCheck = ref(true);
const stateCheck = ref(true);
const epaCheck = ref(true);

watch(
    () => props.data,
    (val) => {
        baseData.value = val;
        handleCanvasTtile();
        setChartLabel();
        handleChange();
    },
    { deep: true }
);
const handleCanvasTtile = () => {
    let tractDataLen = props.tractData.length;
    let countyDataLen = props.countyData.length;
    let cbsaDataLen = props.cbsaData.length;
    if (tractDataLen !== 0 && countyDataLen == 0 && cbsaDataLen == 0) {
        if (tractDataLen == 1) {
            let id = props.tractData[0].geoId;
            canvasTitle.value = `MP Risk and EJ Analysis Plot for selected census tract (${id})`;
        } else {
            canvasTitle.value = `MP Risk and EJ Analysis Plot for A group of census tracts in Nation`;
        }
    } else if (tractDataLen == 0 && countyDataLen !== 0 && cbsaDataLen == 0) {
        if (countyDataLen == 1) {
            let item = props.countyData[0];
            canvasTitle.value = `MP Risk and EJ Analysis Plot for selected county (${item.name}, ${item.stateAbbrName})`;
        } else {
            let stateArr = new Set();
            props.countyData.forEach((item) => {
                stateArr.add(item.stateName);
            });
            let name = stateArr.size === 1 ? props.countyData[0].stateAbbrName : 'Nation';
            canvasTitle.value = `MP Risk and EJ Analysis Plot for A group of counties in ${name}`;
        }
    } else if (tractDataLen == 0 && countyDataLen == 0 && cbsaDataLen !== 0) {
        if (cbsaDataLen == 1) {
            let item = props.cbsaData[0];
            canvasTitle.value = `MP Risk and EJ Analysis Plot for selected CBSA (${item.name})`;
        } else {
            canvasTitle.value = `MP Risk and EJ Analysis Plot for A group of CBSAs in Nation`;
        }
    }
};
const handleChange = () => {
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

const handleNationalAvg = (val) => {
    avgCheckList.value = val;
    handleChange();
};

const setChartLabel = () => {
    let result = baseData.value;
    chartLabel.value = [];
    if (Object.keys(result).lenght == 0) return;
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
const handleCheckAllChange = (val) => {
    checkedList.value = val ? options.value.map((item) => item.value) : [];
    isIndeterminate.value = false;
    handleChange();
};
const handleCheckChange = (val) => {
    const checkedCount = val.length;
    checkAll.value = checkedCount === options.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < options.value.length;
    handleChange();
};

const formatData = (val, type) => {
    if (type === 'percent') {
        return Math.floor(val * 100);
    } else {
        return Math.floor(val * 100) / 100;
    }
};
const setDataNumber = (key, label) => {
    let item = baseData.value[label];
    return item ? formatData(item[key], 'percent') : 0;
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
                data: item.totalData,
                borderColor: item.color,
                borderWidth: 3,
                pointStyle: 'line',
                borderDash: [5, 5],
            });
        }
    }
    return arr;
};
const getChartData = () => {
    let dataSets = [];
    options.value.forEach((item) => {
        let { allData, totalArr } = resetItem(item);
        item.data = allData;
        item.totalData = totalArr;
        let arr = getChartList(item, checkedList.value);
        dataSets.push(...arr);
    });
    return dataSets;
};
</script>
<style scoped lang="scss">
.canvas-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    .pollutant-box {
        box-sizing: border-box;
        padding: 5px 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
        position: relative;
        .checkbox-all {
            font-size: 12px;
        }
        .checkbox-content {
            display: flex;
            flex-wrap: wrap;
            .el-checkbox {
                margin-right: 10px;
                :deep(.el-checkbox__label) {
                    font-size: 12px;
                    // height: 24px;
                }
            }
        }
    }
    .main-content {
        flex: 1;
    }
}
</style>
