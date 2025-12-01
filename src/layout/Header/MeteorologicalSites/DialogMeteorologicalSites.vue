<template>
    <Dialog title="Meteorological Sites" height="145" width="300"  :isCollapse="true" :isContentDraggable="false">
        <div class="data-content">
            <ul>
                <li @click="showMeteorologicalSite"><img :src="MeteorologicalSitesPng" alt="" />Display Meteorological Sites</li>
                <el-divider style="margin: 0px" />
                <li @click="clearMeteorologicalSiteMap"><img :src="clearPng" alt="" />Clear Meteorological Sites</li>
            </ul>
        </div>
    </Dialog>
</template>
<script setup>
import MeteorologicalSitesPng from '@/assets/images/header-icon/MeteorologicalSites.png';
import clearPng from '@/assets/images/header-icon/clear.png';

import { useMonitorSiteStore } from '@/store/monitor-site';
import { useMajorEissionStore } from '@/store/major-eission-sources';
import { useMeteorologicalSite } from '@/store/meteorological-site';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useEJReportStore } from '@/store/ejscreen-report';
const monitorSiteStore = useMonitorSiteStore();
const majorEissionStore = useMajorEissionStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const EJReportStore = useEJReportStore();
const meteorologicalSite = useMeteorologicalSite();
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
const showMeteorologicalSite = () => {
    emits('handleDialogClose');
    if (!meteorologicalSite.isShow) {
        initCollapse();
        meteorologicalSite.isShow = true;
    }
};
const clearMeteorologicalSiteMap = () => {
    emits('handleDialogClose');
    const meteorologicalSiteLayer = meteorologicalSite.layer;
    meteorologicalSite.isShow = false;
    meteorologicalSiteLayer.clearMap();
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
