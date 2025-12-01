<template>
    <div class="radio-main">
        <el-radio value="censusTractList">Select from list</el-radio>
        <div class="radio-content" v-show="activeRadio === 'censusTractList'">
            <div class="transfer-content">
                <MyTransfer :titles="['Census tracts', 'Selected']" filterable v-model="censusTractsList" :data="options" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { useZoomSelectorStore } from '@/store/zoom-selector';
import censusTractAllData, { getCensusTractDetail } from '@/libs/census-tract-all-data';
const zoomSelectorStore = useZoomSelectorStore();
const props = defineProps({
    activeRadio: {
        type: String,
        default: 'censusTractList',
    },
});
const emit = defineEmits(['handleHover']);
const censusTractsList = ref([]);
const locationsList = ref([]);
const options = computed(() => {
    let data = [];
    if (zoomSelectorStore.isZoomIn) {
        const isInZoom = zoomSelectorStore.isInZoom;
        if (isInZoom) {
            data = locationsList.value.filter((item) => {
                let geoId11 = item.value;
                const geoId5 = geoId11.substr(0, 5);
                let detail = getCensusTractDetail(geoId11);
                let region = null;
                let cbsa = null;
                if (detail) {
                    region = detail.epaRegionId;
                    cbsa = detail.cbsaGeoId;
                }
                const args = [region, geoId5.substr(0, 2), cbsa, geoId5];
                return isInZoom(args);
            });
        }
    } else {
        data = data.concat(locationsList.value);
    }
    return data;
});
const initData = () => {
    let geoIds = Object.keys(censusTractAllData);
    locationsList.value = geoIds.map((item) => ({
        key: item,
        value: item,
    }));
};
const getSites = async () => {
    return censusTractsList.value;
};
const clearData = () => {
    censusTractsList.value = [];
};
onMounted(() => {
    initData();
});
defineExpose({
    getSites,
    clearData,
});
</script>
<style scoped lang="scss">
.radio-content {
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
}
.transfer-content {
    min-width: 690px;
    // margin-top: 15px;
    .tips {
        font-size: 12px;
        color: #6fa76f;
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 5px;
    }
    .el-transfer {
        :deep(.el-transfer-panel) {
            width: 280px;
        }
        :deep(.el-transfer__buttons) {
            padding: 0 12px;
        }
        :deep(.el-transfer-panel__filter) {
            width: 100%;
            margin: 0;
        }
        :deep(.el-transfer-panel__header) {
            height: 32px;
        }
    }
}
</style>
