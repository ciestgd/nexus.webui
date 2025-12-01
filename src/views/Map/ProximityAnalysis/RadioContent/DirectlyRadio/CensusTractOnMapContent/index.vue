<template>
    <div class="radio-main">
        <el-radio value="censusTractOnMap">Select from map</el-radio>
        <div class="radio-content" v-show="activeRadio === 'censusTractOnMap'">
            <div class="tips">Click locations on map to add census tracts</div>
            <div class="transfer-content">
                <MyTransfer :titles="['Census tracts', 'Selected']" filterable v-model="censusTractsList" :data="locationsList" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
const props = defineProps({
    activeRadio: {
        type: String,
        default: 'censusTractOnMap',
    },
});
const censusTractsList = ref([]);
const locationsList = ref([]);
const proximityAnalysisStore = useProximityAnalysisStore();
watch(
    () => proximityAnalysisStore.selectedGeoId,
    (val) => {
        if (val && val.length === 11) {
            let arr = locationsList.value.map((item) => item.value);
            let list = new Set(arr);
            list.add(val);
            locationsList.value = [...list].map((item) => ({ key: item, value: item }));
        }
    },
    {
        deep: true,
    }
);
const setCensusTractList = (geoIds) => {
    let arr = locationsList.value.map((item) => item.value);
    let list = new Set(arr);
    let valArr = new Set(censusTractsList.value);
    geoIds.forEach((value) => {
        list.add(value);
        valArr.add(value);
    });
    locationsList.value = [...list].map((item) => ({ key: item, value: item }));
    censusTractsList.value = [...valArr];
};
const getSites = async () => {
    return censusTractsList.value;
};
const clearData = () => {
    censusTractsList.value = [];
    locationsList.value = [];
};
defineExpose({
    setCensusTractList,
    getSites,
    clearData,
});
</script>
<style scoped lang="scss">
.radio-content {
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
    .tips {
        font-size: 12px;
        color: #6fa76f;
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 5px;
    }
}

.transfer-content {
    min-width: 690px;
    margin-top: 15px;

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
