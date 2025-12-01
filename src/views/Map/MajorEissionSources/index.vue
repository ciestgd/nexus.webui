<template>
    <MyDrawer
        :title="dialogTitle"
        :store="majorEissionStore"
        :default-show="majorEissionStore.isCollapse"
        @on-collapse="handleCollapse"
        @on-closed="handleClose"
        @on-drag="handleDrag"
        :isShowClose="true"
        :unFullScreen="false"
        minWidth="840"
    >
        <div class="major-emission-dialog">
            <el-tabs v-model="activeName" class="demo-tabs" @tab-change="handleTabChange">
                <el-tab-pane label="Major Point Sources" name="majorPointSources">
                    <MajorPointSources ref="marjorRef" :emissionYear="emissionYear" />
                </el-tab-pane>
                <el-tab-pane label="Source Category Emissions" name="sourceCategoryEmissions">
                    <SourceCategoryEmissions :emissionYear="emissionYear" />
                </el-tab-pane>
                <!-- <el-tab-pane label="Top X Emission Sources" name="topXEmissionSources">
                    <TopXEmissionSources :activeTab="activeName" :emissionYear="emissionYear" ref="emissionRef"/>
                </el-tab-pane> -->
                <el-tab-pane label="Sector Emissions Summary" name="setorEmissionSummary">
                    <SetorEmissionSummary :emissionYear="emissionYear" />
                </el-tab-pane>
            </el-tabs>
            <div class="year-select">
                Emission Year:
                <el-select class="select" v-model="emissionYear" placeholder="Select" size="small">
                    <el-option v-for="item in yearOptions" :key="item" :label="item" :value="item" />
                </el-select>
            </div>
        </div>
    </MyDrawer>
</template>
<script>
export default {
    name: 'MajorEissionSources',
};
</script>
<script setup>
import { ref } from 'vue';
import MajorPointSources from './MajorPointSources.vue';
import SourceCategoryEmissions from './SourceCategoryEmissions.vue';
// import TopXEmissionSources from './TopXEmissionSources.vue';
import SetorEmissionSummary from './SetorEmissionSummary.vue';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import { useSidebarStore } from '@/store/sidebar';
import { useZoomSelectorStore } from '@/store/zoom-selector';
const majorEissionStore = useMajorEissionStore();
const sidebarStore = useSidebarStore();
const zoomSelectorStore = useZoomSelectorStore();
const { clearMap } = majorEissionStore.layer;
const activeName = ref('majorPointSources');
const yearOptions = ref([2017, 2020]);
const emissionYear = ref(2017);
const handleCollapse = (val) => {
    majorEissionStore.isCollapse = val;
};
const handleClose = () => {
    clearLayer();
    // majorEissionStore.type = 'NOx';
    if (majorEissionStore.isShow) {
        majorEissionStore.handleMarjorShow();
    }
};
const marjorRef = ref();
// const emissionRef = ref();
const handleTabChange = (name) => {
    if (name === 'majorPointSources') {
        majorEissionStore.selectId = null;
        marjorRef.value.resetLayer();
        majorEissionStore.dataType = name;
    }
};
const areaName = ref();
const dialogTitle = computed(() => {
    let label = 'Source/Sector Emissions';
    if (areaName.value) {
        label += ': ' + areaName.value;
    } else {
        label += ': United States';
    }
    return label;
});
const handleDrag = () => {
    // emissionRef.value.resetChartSize();
};
watch(
    () => zoomSelectorStore.model,
    (val) => {
        getFileName();
    },
    { deep: true }
);
const getFileName = async () => {
    let nameList = zoomSelectorStore.nameList;
    let epaRegionData = nameList[0];
    let stateData = nameList[1];
    let cbsaData = nameList[2];
    let countyData = nameList[3];
    let detail = '';
    if (countyData) {
        detail = `${countyData}, ${stateData}`;
    } else if (cbsaData) {
        detail = cbsaData;
    } else if (stateData) {
        detail = stateData;
    } else if (epaRegionData) {
        detail = epaRegionData;
    }
    areaName.value = detail;
};
const clearLayer = () => {
    if (majorEissionStore.dataType === 'majorPointSources') {
        clearMap();
        majorEissionStore.type = 'NOx';
        majorEissionStore.selectId = null;
    }

    majorEissionStore.siteSelectList = [];
    if (sidebarStore.infoType === 'majorSelectData') {
        sidebarStore.infoType = null;
        sidebarStore.infoData = null;
    }
};
onMounted(() => {
    getFileName();
});
</script>
<style scoped lang="scss">
.major-emission-dialog {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: relative;
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
