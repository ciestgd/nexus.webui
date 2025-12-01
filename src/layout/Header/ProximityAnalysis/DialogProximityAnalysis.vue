<template>
    <Dialog title="Proximity Analysis" height="145" width="300"  :isCollapse="true" :isContentDraggable="false">
        <div class="data-content">
            <ul>
                <li @click="showProximity"><img :src="analysisPng" alt="" />Display Proximity Analysis</li>
                <el-divider style="margin: 0px" />
                <li @click="handleProximityClear"><img :src="clearPng" alt="" />Clear Proximity Analysis</li>
            </ul>
        </div>
    </Dialog>
</template>
<script setup>
import analysisPng from '@/assets/images/header-icon/analysis.png';
import clearPng from '@/assets/images/header-icon/clear.png';

import { useMonitorSiteStore } from '@/store/monitor-site';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useEJReportStore } from '@/store/ejscreen-report';
const monitorSiteStore = useMonitorSiteStore();
const majorEissionStore = useMajorEissionStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const EJReportStore = useEJReportStore();
const emits = defineEmits(['handleDialogClose']);
const initCollapse = () => {
    if (majorEissionStore.isShow && majorEissionStore.isCollapse) {
        majorEissionStore.handleMarjorEissionCollapse();
    }
    if (monitorSiteStore.isShow && monitorSiteStore.isCollapse) {
        monitorSiteStore.handleMonitorSiteCollapse();
    }
    if (proximityAnalysisStore.isShow && proximityAnalysisStore.isCollapse) {
        proximityAnalysisStore.handleProximityAnalysisCollapse();
    }
    if (EJReportStore.isShow && EJReportStore.isCollapse) {
        EJReportStore.handleEJReportCollapse();
    }
};
const showProximity = () => {
    emits('handleDialogClose');
    initCollapse();
    proximityAnalysisStore.showProximityAnalysis();
};
const handleProximityClear = () => {
    emits('handleDialogClose');
    proximityAnalysisStore.layer.clearMap();
    proximityAnalysisStore.radiusValue = 5;
};
</script>
<style scoped lang="scss">
.data-content {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    height: 100%;
    display: flex;
    flex-direction: column;
    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
        li {
            padding: 5px;
            height: 40px;
            font-size: 14px;
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            align-items: center;
            color: #606266;
            img {
                width: 20px;
                height: 20px;
                margin-right: 5px;
            }
            &:hover {
                background-color: #ecf5ff;
                color: #50a6ff;
            }
        }
    }
}
</style>
