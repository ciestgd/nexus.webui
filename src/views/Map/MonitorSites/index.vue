<template>
    <MyDrawer
        :title="dialogTitle"
        :store="monitorSiteStore"
        :default-show="monitorSiteStore.isCollapse"
        @on-collapse="handleCollapse"
        @on-closed="handleClose"
        :isShowClose="true"
        :unFullScreen="false"
        minWidth="820"
    >
        <MonitorSiteContent :count="topCount" :model="geoIdList" :fileName="fileName" @resetTopx="resetTopx" />
    </MyDrawer>
</template>
<script>
export default {
    name: 'MonitorSites',
};
</script>
<script setup>
import MonitorSiteContent from '@/components/MonitorSites/index.vue';
import { useMonitorSiteStore } from '@/store/monitor-site';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
import { useSidebarStore } from '@/store/sidebar';
import { getCountyById, getStateById, getCbsaById } from '@/api/district';
const monitorSiteStore = useMonitorSiteStore();
const zoomSelectorStore = useZoomSelectorStore();
const sidebarStore = useSidebarStore();
const { clearMap } = monitorSiteStore.layer;
const topCount = ref(100);
const distritSelectModel = ref(zoomSelectorStore.model);
const fileName = ref();
const areaName = ref();
const geoIdList = computed(() => {
    let obj = {};
    let keyArr = ['epaRegionId', 'stateGeoId', 'cbsaGeoId', 'countyGeoId'];
    distritSelectModel.value.forEach((item, index) => {
        let key = null;
        if (item) {
            key = keyArr[index];
            if (key) {
                obj[key] = [item];
            }
        }
    });
    return obj;
});
const dialogTitle = computed(() => {
    let label = 'Monitoring Sites';
    if (areaName.value) {
        label += ': ' + areaName.value;
    } else {
        label += ': United States';
    }
    return label;
});
watch(
    () => zoomSelectorStore.model,
    (val) => {
        distritSelectModel.value = val;
        getFileName();
        getAreaName();
    }
);

const handleCollapse = (val) => {
    monitorSiteStore.isCollapse = val;
};
const handleClose = () => {
    clearLayer();
    if (monitorSiteStore.isShow) {
        monitorSiteStore.handleShow();
    }
};
const clearLayer = () => {
    if (monitorSiteStore.dataType === 'MonitorSites') {
        clearMap();
        monitorSiteStore.type = 'PM25';
        monitorSiteStore.selectId = null;
    }

    if (sidebarStore.infoType === 'monitorSite') {
        sidebarStore.infoType = null;
        sidebarStore.infoData = null;
    }
    monitorSiteStore.siteSelectList = [];
};
const getAreaName = async () => {
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
const resetTopx = (num) => {
    topCount.value = num;
    getFileName();
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
    fileName.value = `Top ${topCount.value} Monitoring Sites in ${areaName}`;
};
onMounted(async () => {
    await nextTick();
    let advancedOption = localStorage.getItem('advancedOption');
    if (advancedOption) {
        advancedOption = JSON.parse(advancedOption);
        topCount.value = advancedOption.topCount || 100;
    }
    getFileName();
    getAreaName();
});
</script>
