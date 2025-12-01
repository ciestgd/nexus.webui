<template>
    <div class="emission-box">
        <el-tabs v-model="activeName" class="demo-tabs">
            <el-tab-pane label="Major Point Sources" name="majorPointSources"
                ><MajorEissionSources @handleLoading="handleSourcesLoading" :countyIds="countyIds" :emissionYear="emissionYear"
            /></el-tab-pane>
            <el-tab-pane label="Source Category Emissions" name="sourceCategoryEmissions"
                ><SourceCategoryEmissions @handleLoading="handleEmissionLoading" :countyIds="countyIds" :emissionYear="emissionYear"
            /></el-tab-pane>
            <el-tab-pane label="Sector Emissions Summary" name="setorEmissionSummary"
                ><SetorEmissionSummary @handleLoading="handleSummaryLoading" :countyIds="countyIds" :emissionYear="emissionYear"
            /></el-tab-pane>
        </el-tabs>
        <div class="year-select">
            Emission Year:
            <el-select class="select" v-model="emissionYear" placeholder="Select" size="small">
                <el-option v-for="item in yearOptions" :key="item" :label="item" :value="item" />
            </el-select>
        </div>
    </div>
</template>
<script setup>
import MajorEissionSources from './MajorPointSources.vue';
import SourceCategoryEmissions from './SourceCategoryEmissions.vue';
import SetorEmissionSummary from './SetorEmissionSummary.vue';
const props = defineProps({
    countyIds: {
        type: Array,
        default: () => [],
    },
});
const emits = defineEmits(['handleData']);
const activeName = ref('majorPointSources');
const yearOptions = ref([2017, 2020]);
const emissionYear = ref(2017);
const sourceLoading = ref(false);
const emissionLoading = ref(false);
const summaryLoading = ref(false);
const loading = computed(() => sourceLoading.value || emissionLoading.value || summaryLoading.value);
const handleSourcesLoading = (val) => {
    sourceLoading.value = val;
};
const handleEmissionLoading = (val) => {
    emissionLoading.value = val;
};
const handleSummaryLoading = (val) => {
    summaryLoading.value = val;
};
watch(
    loading,
    (val) => {
        emits('handleData', val);
    },
    { deep: true }
);
</script>
<style scoped lang="scss">
.emission-box {
    width: 100%;
    height: 100%;
    .demo-tabs {
        font-size: 12px;
        height: 100%;
        :deep(.el-tabs__header) {
            margin-bottom: 5px;
            padding-right: 170px;
            box-sizing: border-box;
        }
        :deep(.el-tabs__content) {
            height: calc(100% - 35px);
            width: 100%;
            .el-tab-pane {
                height: 100%;
                width: 100%;
            }
        }
        :deep(.el-tabs__item) {
            font-size: 12px;
            padding: 0 10px;
            height: 30px;
        }
    }
    .year-select {
        position: absolute;
        top: 1px;
        right: 5px;
        font-size: 12px;
        display: flex;
        align-items: center;
        .select {
            width: 80px;
            margin-left: 5px;
        }
    }
}
</style>
