<template>
    <div class="indicator-main" v-loading="loading" element-loading-text="Loading..." ref="indicatorRef">
        <div class="select-box">
            <el-radio-group v-model="activeTab" class="radio-group">
                <el-radio :value="1">Summary Plot</el-radio>
                <el-radio :value="2">Summary Table</el-radio>
            </el-radio-group>
            <el-button size="small" @click="exportTable" v-show="activeTab === 2">Output</el-button>
        </div>
        <SummaryPlot :data="baseData" :cbsaData="props.cbsaData" :tractData="props.tractData" :countyData="props.countyData" v-show="activeTab === 1" />
        <SummaryTable ref="tableRef" :data="baseData" :cbsaData="props.cbsaData" :tractData="props.tractData" :countyData="props.countyData" v-show="activeTab === 2" />
    </div>
</template>
<script setup>
import { OverlayScrollbars } from 'overlayscrollbars';

import { useProjectYearStore } from '@/store/project-year';
import censusTractAllData from '@/libs/census-tract-all-data';
import { getIndividualSummary } from '@/api/emissions-facility';
import SummaryPlot from './SummaryPlot.vue';
import SummaryTable from './SummaryTable.vue';
const projectYearStore = useProjectYearStore();
const props = defineProps({
    countyIds: {
        type: Array,
        default: () => [],
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
const activeTab = ref(1);
const emits = defineEmits(['handleData']);
const loading = ref(false);
const indicatorRef = ref();
const tableRef = ref();
const baseData = ref({});

const getGeoIds = () => {
    let list = Object.keys(censusTractAllData);
    return list.filter((item) => props.countyIds.indexOf(item.substr(0, 5)) !== -1);
};
const getTable = async () => {
    try {
        loading.value = true;
        let list = getGeoIds();
        let params = {
            year: projectYearStore.projectYear,
            ejYear: projectYearStore.ejYear,
            geoIds: list,
            airToxicRiskThreshold: 40,
        };
        if (props.cbsaData.length === 1) {
        }
        let result = await getIndividualSummary(params);
        baseData.value = result;
        // setChartLabel();
    } finally {
        loading.value = false;
    }
};

watch(
    () => props.countyIds,
    async (val) => {
        if (val.length) {
            await getTable();
        } else {
            baseData.value = {};
        }
        // handleChange();
    },
    { deep: true }
);
watch(
    loading,
    (val) => {
        emits('handleData', val);
    },
    { deep: true }
);
onMounted(async () => {
    await nextTick();
    OverlayScrollbars(indicatorRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
});
const exportTable = () => {
    tableRef.value.exportTable();
};
</script>
<style scoped lang="scss">
.indicator-main {
    width: 100%;
    height: 100%;
    .select-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>
