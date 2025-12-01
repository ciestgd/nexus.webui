<template>
    <div class="proximity-transfer-content sources-content" v-loading="loading" element-loading-text="Loading...">
        <div class="proximity-transfer-content-header header">
            <el-select v-model="sourceValue" filterable multiple collapse-tags placeholder="Select" @change="getFacilityOptions" style="width: 300px">
                <el-option v-for="item in sourceOptions" :key="item" :label="item" :value="item" />
            </el-select>

            <el-button type="primary" class="clearBtn" @click="handleClearSource">Clear</el-button>
            <div class="year-options">
                Emission Year:<el-select v-model="year" size="small" style="width: 66px; margin-left: 5px" @change="handleYearChange">
                    <el-option v-for="item in dataYearOptions" :key="item" :label="item" :value="item" />
                </el-select>
            </div>
        </div>
        <div class="transfer-content">
            <MyTransfer
                :props="{ key: 'facilityId' }"
                :titles="['Facilities', 'Selected']"
                filterable
                :filter-method="filterMethod"
                v-model="sourcesList"
                :data="sourceFailityOptions"
            >
                <template #default="{ option }">
                    <span @mouseover="(event) => handleSourceHover(option, event)" style="color: #000">{{ option.sectorProjectGroup }}: {{ option.siteName }}</span>
                </template>
            </MyTransfer>
        </div>
    </div>
</template>
<script setup>
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { getEmissionsFacilityGroup, getEmissionsFacilityInformation } from '@/api/emissions-facility.js';
import { fromLonLat } from 'ol/proj';
const zoomSelectorStore = useZoomSelectorStore();

const props = defineProps();
const emit = defineEmits(['handleHover']);

const sourceValue = ref([]);
const sourceOptions = ref([]);
const sourceFailityOptions = ref([]);
const sourceAllData = ref({});
const sourcesList = ref([]);
const loading = ref(false);
const year = ref(2017);
const dataYearOptions = ref([2017, 2020]);
watch(
    () => zoomSelectorStore.model,
    () => {
        getFacilityOptions();
    }
);
const handleYearChange = () => {
    resetOptions();
};
const getFacilityOptions = async () => {
    try {
        let data = [];
        let arr = [];
        loading.value = true;
        arr = sourceValue.value.map((item) => {
            return new Promise(async (resolve, reject) => {
                let list = sourceAllData.value[item];
                if (!list || !list.length) {
                    let result = await getFacilityOptionFn(item);
                    sourceAllData.value[item] = result;
                }
                resolve(sourceAllData.value[item]);
            });
        });
        let list = await Promise.all(arr);
        list.forEach((item) => {
            data = data.concat(filterData(item));
        });
        sourceFailityOptions.value = data;
    } catch (err) {
    } finally {
        loading.value = false;
    }
};
const resetOptions = async () => {
    let result = await getEmissionsFacilityGroup(year.value);
    result.sort(function (a, b) {
        var firstCharA = a.charAt(0).toLowerCase();
        var firstCharB = b.charAt(0).toLowerCase();

        if (firstCharA < firstCharB) {
            return -1;
        }
        if (firstCharA > firstCharB) {
            return 1;
        }
        return 0;
    });
    sourceOptions.value = result;
    result.forEach((item) => {
        sourceAllData.value[item] = [];
    });
    sourceValue.value = ['Electric Utilities'];
    await getFacilityOptions();
};
const filterData = (list) => {
    let data = [];
    if (zoomSelectorStore.isZoomIn) {
        const isInZoom = zoomSelectorStore.isInZoom;
        if (isInZoom) {
            data = list.filter((item) => {
                let args = [item.epaRegionId, item.stateGeoId, item.cbsaGeoId, item.countyGeoId];
                return isInZoom(args);
            });
        }
    } else {
        data = data.concat(list);
    }
    return data;
};
const filterMethod = (query, item) => {
    let queryString = query.trim();
    if (queryString) {
        return item.facilityId.includes(queryString) || item.siteName.includes(queryString);
    } else {
        return item;
    }
};

const handleSourceHover = (option, event) => {
    let data = `${option.sectorProjectGroup}: ${option.siteName}`;
    emit('handleHover', data, event.currentTarget);
};
const getFacilityOptionFn = async (name) => {
    let result = await getEmissionsFacilityInformation(name, year.value);
    let unUseStateId = ['78', '60', '66', '69'];
    result = result.filter((item) => item.stateGeoId && unUseStateId.indexOf(item.stateGeoId) == -1);
    return result;
};
const handleClearSource = () => {
    sourceValue.value = [];
    sourceFailityOptions.value = [];
};
const resetItem = (item) => {
    item.id = item.facilityId;
    item.name = item.siteName;
    item.lng = item.siteLongitude;
    item.lat = item.siteLatitude;
    item.center = fromLonLat([item.lng, item.lat]);
    return item;
};
const getSites = () => {
    let sourceData = sourceFailityOptions.value.filter((item) => sourcesList.value.indexOf(item.facilityId) !== -1).map(resetItem);
    return sourceData;
};
const getAllSites = async () => {
    let data = [];
    sourceValue.value.forEach((item) => {
        let list = sourceAllData.value[item];
        data = data.concat(list);
    });
    let sourceData = data.map(resetItem);
    return sourceData;
};
const getCheckListData = () => {
    return sourceValue.value;
};
const getFacilityDetail = async (options) => {
    let arr = options.map((value) => {
        return new Promise(async (resolve, reject) => {
            let dataArr = value.split(':');
            let type = dataArr[0];
            let id = dataArr[1];
            if (!sourceAllData.value[type].length) {
                let result = await getFacilityOptionFn(type);
                sourceAllData.value[type] = result;
            }
            let list = sourceAllData.value[type];
            let sourceData = list.filter((item) => id === item.facilityId).map(resetItem);
            resolve(sourceData.length ? sourceData[0] : null);
        });
    });
    let resultList = await Promise.all(arr);
    return resultList;
};
const handleSelect = async (facilities) => {
    let typeFlag = false;
    let list = new Set(sourcesList.value);
    facilities.forEach((item) => {
        let dataArr = item.split(':');
        let type = dataArr[0];
        let id = dataArr[1];
        if (sourceValue.value.indexOf(type) === -1) {
            sourceValue.value.push(type);
            typeFlag = true;
        }
        list.add(id);
    });
    if (typeFlag) {
        await getFacilityOptions();
    }

    sourcesList.value = [...list];
};
const clearData = () => {
    sourcesList.value = [];
};
const resetData = () => {
    sourceValue.value = ['Electric Utilities'];
    getFacilityOptions();
};
defineExpose({
    resetOptions,
    getSites,
    getAllSites,
    getCheckListData,
    handleSelect,
    clearData,
    resetData,
    getFacilityDetail,
});
</script>
<style scoped lang="scss">
.sources-content {
    .header {
        justify-content: flex-start;
        .clearBtn {
            margin-left: 5px;
            height: 24px;
        }
        :deep(.el-input__wrapper) {
            height: 24px;
        }
        .year-options {
            font-size: 14px;
            margin-left: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
