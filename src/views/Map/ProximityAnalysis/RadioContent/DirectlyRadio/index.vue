<template>
    <div class="radio-main">
        <el-radio class="radio-title" :value="2">Select tracts directly</el-radio>
        <div class="radio-content" v-show="activeRadio == '2'">
            <el-radio-group v-model="radio" @change="handleRadioChange">
                <CensustractContent ref="censustractContentRef" :active-radio="radio" />
                <CensusTractOnMapContent ref="censusTractOnMapContentRef" :active-radio="radio" />
                <CensusTractOnMapByShapeContent ref="censusTractOnMapByShapeContentRef" :active-radio="radio" />
            </el-radio-group>
        </div>
    </div>
</template>
<script setup>
import censusTractAllData from '@/libs/census-tract-all-data';
import CensustractContent from './CensusTractContent/index.vue';
import CensusTractOnMapContent from './CensusTractOnMapContent/index.vue';
import CensusTractOnMapByShapeContent from './CensusTractOnMapByShapeContent/index.vue';
const props = defineProps({
    activeRadio: {
        type: Number,
        default: 1,
    },
});

const radio = ref('censusTractList');
const censusTractOnMapContentRef = ref();
const censustractContentRef = ref();
const censusTractOnMapByShapeContentRef = ref();
const initCensusTractSelect = async (geoIds) => {
    censusTractOnMapContentRef.value.setCensusTractList(geoIds);
};
const clearData = () => {
    censustractContentRef.value.clearData();
    censusTractOnMapContentRef.value.clearData();
    censusTractOnMapByShapeContentRef.value.clearData();
};
const handleRadioChange = () => {
    censusTractOnMapByShapeContentRef.value.clearDraw();
    if (radio.value == 'censusTractOnMapByShapeContentRef') {
        censusTractOnMapByShapeContentRef.value.handleDraw();
    }
};
const getCensusTractData = async (list) => {
    let result = list
        .map((item) => {
            let detail = censusTractAllData[item];
            return detail;
        })
        .filter((item) => item);
    result.forEach((item) => {
        item.lng = item.centerLon;
        item.lat = item.centerLat;
        item.name = item.geoId;
        item.id = item.geoId;
        item.center = [item.lng, item.lat];
    });

    return result;
};
const getSites = async () => {
    let data = [];
    if (radio.value === 'censusTractList') {
        data = await censustractContentRef.value.getSites();
    } else if (radio.value === 'censusTractOnMap') {
        data = await censusTractOnMapContentRef.value.getSites();
    } else if (radio.value === 'censusTractListOnMapByShape') {
        data = await censusTractOnMapByShapeContentRef.value.getSites();
    }
    let censusTractData = await getCensusTractData(data);
    return censusTractData;
};
defineExpose({
    initCensusTractSelect,
    clearData,
    getSites,
});
</script>
<style lang="scss" scoped>
.radio-main {
    width: 100%;
    .radio-title {
        :deep(.el-radio__label) {
            font-size: 18px;
            font-weight: bold;
        }
    }
    .radio-content {
        width: 100%;
        box-sizing: border-box;
        padding: 0 10px;
    }
}
</style>
