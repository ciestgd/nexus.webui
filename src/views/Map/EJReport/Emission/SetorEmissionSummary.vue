<template>
    <div class="summary-plot-box">
        <div class="pollutant-box">
            <div class="checkbox-all">Pollutant</div>
            <el-checkbox-group class="checkbox-content" v-model="checkedList">
                <el-checkbox size="small" v-for="item in emissionList" :key="item.type" :label="item.type">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
        </div>
        <div class="common-select">
            <div class="select-item">
                Top X Emission Sources:
                <el-input-number v-model="topXEmissionSources" class="sources-select" size="small" :min="1" :max="100" controls-position="right" />
            </div>
            <el-radio-group v-model="activeTab" class="radio-group">
                <el-radio :value="1">Emission Chart</el-radio>
                <el-radio :value="2">Emission Table</el-radio>
            </el-radio-group>
        </div>
        <div class="main-box">
            <SummaryPlot
                v-show="activeTab === 1"
                :countyIds="props.countyIds"
                :emissionYear="props.emissionYear"
                :list="emissionList"
                :selected="checkedList"
                :topX="topXEmissionSources"
                @handleData="handlePlotData"
            />
            <SummaryTable
                v-show="activeTab === 2"
                :typeList="typeList"
                :topX="topXEmissionSources"
                :regionList="regionList"
                regionType="county"
                :emissionYear="props.emissionYear"
                @handleData="handleTableData"
            />
        </div>
    </div>
</template>
<script setup>
import SummaryPlot from './SummaryPlot.vue';
import SummaryTable from '@/views/Map/MajorEissionSources/SummaryTable.vue';
import { useEJReportStore } from '@/store/ejscreen-report';
const props = defineProps({
    countyIds: {
        type: Array,
        default: () => [],
    },
    emissionYear: {
        type: Number,
        default: 2017,
    },
    countyDetail: {
        type: Object,
        default: {},
    },
});
const emits = defineEmits(['handleLoading']);
const ejReportStore = useEJReportStore();
const activeTab = ref(1);
const emissionList = ref([
    {
        label: 'NOx',
        type: 'NOx',
        unit: 'TON',
        color: '#F34336',
    },
    {
        label: 'PM2.5',
        type: 'PM25',
        unit: 'TON',
        color: '#00BBD3',
    },
    {
        label: 'SO2',
        type: 'SO2',
        unit: 'TON',
        color: '#2195F2',
    },
    {
        label: 'VOC',
        type: 'VOC',
        unit: 'TON',
        color: '#FEC007',
    },
    {
        label: 'CO2e',
        type: 'CO2e',
        unit: 'TON',
        color: '#3F51B3',
    },
    {
        label: 'PM10',
        type: 'PM10',
        unit: 'TON',
        color: '#009587',
    },
    {
        label: 'NH3',
        type: 'NH3',
        unit: 'TON',
        color: '#3F51B3',
    },
    {
        label: 'CO',
        type: 'CO',
        unit: 'TON',
        color: '#E81E63',
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
        label: 'Lead',
        type: 'Lead',
        unit: 'LB',
        color: '#FE5722',
    },
]);
const plotLoading = ref(false);
const tableLoading = ref(false);
const loading = computed(() => plotLoading.value || tableLoading.value);
const regionList = computed(() =>
    props.countyIds.map((item) => {
        return {
            key: item,
            label: ejReportStore.countyAllData[item].name,
        };
    })
);
const typeList = computed(() => emissionList.value.filter((item) => checkedList.value.indexOf(item.type) !== -1));
const checkedList = ref(['NOx', 'PM25', 'SO2', 'VOC']);

const topXEmissionSources = ref(20);
const handlePlotData = (val) => {
    plotLoading.value = val;
};
const handleTableData = (val) => {
    tableLoading.value = val;
};
watch(
    loading,
    (val) => {
        emits('handleLoading', val);
    },
    { deep: true }
);
onMounted(() => {});
</script>
<style scoped lang="scss">
.summary-plot-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .pollutant-box {
        box-sizing: border-box;
        padding: 5px 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
        position: relative;
        margin-top: 10px;
        .checkbox-all {
            position: absolute;
            top: -9px;
            left: 15px;
            background: #fff;
        }
        .checkbox-content {
            display: flex;
            flex-wrap: wrap;
            .el-checkbox {
                margin-right: 10px;
                :deep(.el-checkbox__label) {
                    font-size: 12px;
                }
            }
        }
    }
    .common-select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        padding: 0px 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-top: 5px;
        .select-item {
            display: flex;
            align-items: center;
            .sources-select {
                width: 100px;
                margin-left: 5px;
            }
        }
        .radio-group {
            :deep(.el-radio) {
                margin-right: 10px;
            }
        }
    }
    .main-box {
        flex: 1;
        overflow: hidden;
    }
}
</style>
