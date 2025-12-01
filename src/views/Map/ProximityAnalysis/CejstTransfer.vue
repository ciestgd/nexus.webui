<template>
    <div class="proximity-transfer-content" v-loading="loading" element-loading-text="Loading...">
        <div class="transfer-content">
            <MyTransfer :titles="['CEJST', 'Selected']" v-model="cejstList" :data="cejstOptions" filterable :filter-method="filterMethod"> </MyTransfer>
        </div>
    </div>
</template>
<script setup>
import { useZoomSelectorStore } from '@/store/zoom-selector';
import cejstJson from '@/libs/cejst-data.js';
import censusTractAllData from '@/libs/census-tract-all-data';
const zoomSelectorStore = useZoomSelectorStore();

const props = defineProps();

const cejstOptions = ref([]);
const cejstList = ref([]);

const loading = ref(false);
watch(
    () => zoomSelectorStore.model,
    () => {
        resetOptions();
    }
);
const filterMethod = (query, item) => {
    let queryString = query && query.trim();
    if (queryString) {
        return item.key.includes(queryString);
    } else {
        return item;
    }
};

const filterData = (list) => {
    let data = [];

    if (zoomSelectorStore.isZoomIn) {
        const isInZoom = zoomSelectorStore.isInZoom;
        if (isInZoom) {
            data = list.filter((item) => {
                let detail = censusTractAllData[item];
                if (detail) {
                    let { epaRegionId, stateGeoId, cbsaGeoId, countyGeoId } = censusTractAllData[item];
                    let args = [epaRegionId, stateGeoId, cbsaGeoId, countyGeoId];
                    return isInZoom(args);
                } else false;
            });
        }
    } else {
        data = data.concat(list.filter((item) => censusTractAllData[item]));
    }
    return data;
};
const getCensusTractData = async (list) => {
    let result = list.map((item) => {
        let detail = censusTractAllData[item];
        return detail;
    });
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
    let censusTractData = await getCensusTractData(cejstList.value);
    data = data.concat(censusTractData);
    return data;
};

const resetOptions = async () => {
    loading.value = true;
    cejstOptions.value = filterData([...cejstJson]).map((item) => ({ key: item, value: item }));
    loading.value = false;
};

const clearData = () => {
    cejstList.value = [];
};
defineExpose({
    resetOptions,
    clearData,
    getSites
});
</script>
<style lang="scss" scoped></style>
