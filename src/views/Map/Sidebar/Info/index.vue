<template>
    <div class="info">
        <div class="zoom-box" v-if="sidebarStore.infoType === 'info'">
            <div class="zoom-item" @click="handleZoom"><Icon class="icon-button icon" name="zoom-in" size="16" /> Zoom to</div>
            <div class="zoom-item" @click="handlePan"><Icon class="icon-button icon" name="rank1" size="16" />Pan</div>
        </div>
        <!-- default-expand-all -->
        <el-table
            :data="tableData"
            v-loading="loading"
            class="sidebar-table"
            row-key="type"
            element-loading-text="Loading..."
            :span-method="arraySpanMethod"
            border
            stripe
            empty-text="Select boundary on map to view details."
            :show-header="false"
        >
            <el-table-column prop="type" label="TYPE">
                <template #default="scoped">
                    <span :style="[handleStyle(scoped.row)]">{{ scoped.row.type }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="value" :label="tableLabel">
                <template #default="scoped">
                    <span :style="[handleStyle(scoped.row)]">{{ scoped.row.value }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { useSidebarStore } from '@/store/sidebar';
import { useDataScaleStore } from '@/store/data-scale';
import { getCountyById, getCensusTractsById } from '@/api/district.js';
import { mapManager } from '@/libs/map/map-manager.js';
import Point from 'ol/geom/Point.js';
const loading = ref(false);
const tableData = ref([]);
const dataScaleStore = useDataScaleStore();
const sidebarStore = useSidebarStore();
const tableLabel = computed(() => {
    return sidebarStore.infoType === 'info' ? 'REGION' : sidebarStore.infoType === 'monitorSite' ? 'Site' : 'Facility';
});
const handleStyle = (row) => {
    if (row.type.includes('percentile')) {
        return { color: '#f700ff' };
    }
};

watch(
    () => sidebarStore.infoData,
    (val) => {
        tableData.value = val || [];
    }
);
const clear = () => {
    tableData.value = [];
};
const arraySpanMethod = ({ row, column, rowIndex, columnIndex }) => {
    let parentsList = ['Geographic boundaries', 'AQ Ambient', 'PM2.5 & O3 Mortality', 'PM2.5 & O3 Morbidity', 'Air Toxics Risk', 'Heat Risk'];
    let type = row.type;
    if (parentsList.indexOf(type) !== -1) {
        return [1, 2];
    }
};
const getCoordData = async (id) => {
    let result;
    if (dataScaleStore.isCountyLevel) {
        result = await getCountyById(id);
    } else {
        result = await getCensusTractsById(id);
    }
    let { geoId, centerLon, centerLat } = result;
    return { geoId, centerLon, centerLat };
};
const zoomTo = ({ centerLon, centerLat }) => {
    const mapIns = mapManager.getMapIns();
    const view = mapIns.getView();
    let minResolution = dataScaleStore.isCountyLevel ? 500 : 200;
    view.fit(new Point([centerLon, centerLat]), { duration: 1000, minResolution });
};
const panTo = ({ centerLon, centerLat }) => {
    const mapIns = mapManager.getMapIns();
    const view = mapIns.getView();
    let minResolution = view.getResolution();
    view.fit(new Point([centerLon, centerLat]), { duration: 1000, minResolution });
};
const handleZoom = async () => {
    if (!tableData.value.length) return;
    let item = tableData.value[0].children[0];
    let id = item.value;
    let { geoId, centerLon, centerLat } = await getCoordData(id);
    zoomTo({ centerLon, centerLat });
};
const handlePan = async () => {
    if (!tableData.value.length) return;
    let item = tableData.value[0].children[0];
    let id = item.value;
    let { geoId, centerLon, centerLat } = await getCoordData(id);
    panTo({ centerLon, centerLat });
};
defineExpose({ clear });
</script>

<style scoped lang="scss">
.info {
    padding-right: 12px;
    :deep(.el-table__empty-text) {
        width: 100%;
    }
    .zoom-box {
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;
        font-size: 14px;
        box-sizing: border-box;
        padding: 0 5px;
        .zoom-item {
            // display: flex;
            margin-right: 5px;
            cursor: pointer;
            .icon {
                margin-left: 2px;
            }
        }
    }
}
.sidebar-table {
    :deep(.el-table__indent) {
        display: none;
    }
    :deep(.el-table__placeholder) {
        display: none;
    }
    :deep(.el-table__row--level-0) {
        font-weight: bold;
    }
}
</style>
