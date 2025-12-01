<template>
    <div class="proximity-transfer-content monitorSites" v-loading="loading" element-loading-text="Loading...">
        <div class="pollutant-select">
            <span>Pollutant(s):</span>
            <el-select v-model="monitorCheckList" :multiple="true" collapse-tags placeholder="Select pollutants" @change="resetOptions">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
        <div class="transfer-content">
            <MyTransfer
                :titles="['Monitoring Sites', 'Selected']"
                v-model="monitorSiteList"
                :data="monitorSiteOptions"
                :props="{ key: 'value', label: 'siteCity' }"
                filterable
                :filter-method="filterMethod"
            >
                <template #default="{ option }">
                    <span @mouseover="(event) => handleMonitorHover(option, event)" style="color: #000">
                        {{ setMonitorSiteType(option.pollutant) }}: {{ option.siteId }}
                        {{ option.siteCity || option.siteAddress }}
                    </span>
                </template>
            </MyTransfer>
        </div>
    </div>
</template>
<script setup>
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { getMonitorSiteInfo } from '@/api/monitor-data.js';
import { fromLonLat } from 'ol/proj';
const zoomSelectorStore = useZoomSelectorStore();

const props = defineProps();
const emit = defineEmits(['handleHover']);
const options = ref([
    {
        label: 'PM2.5',
        value: 'PM25',
    },
    {
        label: 'O3',
        value: 'O3',
    },
    {
        label: 'HAPs - metals only',
        value: 'Gas_VOC_HAPs',
    },
    {
        label: 'HAPs - non-metals only',
        value: 'Heavy_Metal_HAPs',
    },
    {
        label: 'HAPs - NATTS only',
        value: 'NATTS',
    },
]);
const monitorCheckList = ref(['PM25']);
const monitorSiteOptions = ref([]);
const monitorSiteList = ref([]);
const PM25List = ref([]);
const O3List = ref([]);
const GC_HAPList = ref([]);
const HM_HAPList = ref([]);
const NATTSList = ref([]);

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
        return item.siteId.includes(queryString) || item.siteCity.includes(queryString);
    } else {
        return item;
    }
};
const setMonitorSiteType = (type) => {
    let names = {
        PM25: 'PM2.5',
        O3: 'O3',
        Gas_VOC_HAPs: 'GC_HAP',
        Heavy_Metal_HAPs: 'HM_HAP',
        NATTS: 'NATTS',
    };
    return names[type];
};
const getMonitorSitesData = async (pollutant) => {
    try {
        let result = await getMonitorSiteInfo({ pollutants: [pollutant] });
        result.forEach((item) => {
            item.value = pollutant + ':' + item.siteId;
            item.pollutant = pollutant;
        });
        let unUseStateId = ['78', '60', '66', '69'];
        result = result.filter((item) => item.stateGeoId && unUseStateId.indexOf(item.stateGeoId) === -1);
        if (pollutant === 'PM25') {
            PM25List.value = result;
        } else if (pollutant === 'O3') {
            O3List.value = result;
        } else if (pollutant === 'Gas_VOC_HAPs') {
            GC_HAPList.value = result;
        } else if (pollutant === 'Heavy_Metal_HAPs') {
            HM_HAPList.value = result;
        } else if (pollutant === 'NATTS') {
            NATTSList.value = result;
        }
    } catch (error) {
    } finally {
    }
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
const resetItem = (item) => {
    let obj = { ...item };
    obj.id = obj.siteId;
    obj.name = obj.siteCity || obj.siteName || obj.siteAddress;
    obj.lng = obj.siteLon;
    obj.lat = obj.siteLat;
    obj.center = fromLonLat([obj.lng, obj.lat]);
    return obj;
};
const getSiteDetail = async (options) => {
    let arr = options.map((value) => {
        return new Promise(async (resolve, reject) => {
            let type = value.split(':')[0];
            let listOptions = {
                PM25: PM25List,
                O3: O3List,
                Gas_VOC_HAPs: GC_HAPList,
                Heavy_Metal_HAPs: HM_HAPList,
                NATTS: NATTSList,
            };
            let list = listOptions[type].value;
            if (!list.length) {
                await getMonitorSitesData(type);
            }
            let monitorData = list.filter((item) => item.value === value).map(resetItem);
            resolve(monitorData.length ? monitorData[0] : null);
        });
    });
    let resultList = await Promise.all(arr);
    return resultList;
};
const resetOptions = async () => {
    let data = [];
    loading.value = true;
    if (monitorCheckList.value.indexOf('PM25') !== -1) {
        if (!PM25List.value.length) {
            await getMonitorSitesData('PM25');
        }
        data = data.concat(filterData(PM25List.value));
    }
    if (monitorCheckList.value.indexOf('O3') !== -1) {
        if (!O3List.value.length) {
            await getMonitorSitesData('O3');
        }
        data = data.concat(filterData(O3List.value));
    }
    if (monitorCheckList.value.indexOf('Gas_VOC_HAPs') !== -1) {
        if (!GC_HAPList.value.length) {
            await getMonitorSitesData('Gas_VOC_HAPs');
        }
        data = data.concat(filterData(GC_HAPList.value));
    }
    if (monitorCheckList.value.indexOf('Heavy_Metal_HAPs') !== -1) {
        if (!HM_HAPList.value.length) {
            await getMonitorSitesData('Heavy_Metal_HAPs');
        }
        data = data.concat(filterData(HM_HAPList.value));
    }
    if (monitorCheckList.value.indexOf('NATTS') !== -1) {
        if (!NATTSList.value.length) {
            await getMonitorSitesData('NATTS');
        }
        data = data.concat(filterData(NATTSList.value));
    }
    monitorSiteOptions.value = data;
    loading.value = false;
};
const handleMonitorHover = (option, event) => {
    let data = `${setMonitorSiteType(option.pollutant)}:${option.siteId} ${option.siteCity || option.siteAddress}`;
    emit('handleHover', data, event.currentTarget);
};
const getSites = () => {
    console.log('monitorSiteList', monitorSiteList.value);
    return monitorSiteOptions.value.filter((item) => monitorSiteList.value.indexOf(item.value) !== -1).map(resetItem);
};
const getAllSites = () => {
    let data = [];
    if (monitorCheckList.value.indexOf('PM25') !== -1) {
        data = data.concat(PM25List.value);
    }
    if (monitorCheckList.value.indexOf('O3') !== -1) {
        data = data.concat(O3List.value);
    }
    if (monitorCheckList.value.indexOf('Gas_VOC_HAPs') !== -1) {
        data = data.concat(GC_HAPList.value);
    }
    if (monitorCheckList.value.indexOf('Heavy_Metal_HAPs') !== -1) {
        data = data.concat(HM_HAPList.value);
    }
    if (monitorCheckList.value.indexOf('NATTS') !== -1) {
        data = data.concat(NATTSList.value);
    }
    let monitorData = data.map(resetItem);
    return monitorData;
};
const getCheckListData = () => {
    return monitorCheckList.value;
};
const handleSelect = async (monitorSites) => {
    let typeFlag = false;
    let list = new Set(monitorSiteList.value);

    monitorSites.forEach((item) => {
        let valArr = item.split(':');
        let type = valArr[0];
        if (monitorCheckList.value.indexOf(type) === -1) {
            monitorCheckList.value.push(type);
            typeFlag = true;
        }
        list.add(item);
    });
    if (typeFlag) {
        await resetOptions();
    }
    monitorSiteList.value = [...list];
};
const clearData = () => {
    monitorSiteList.value = [];
};
const resetData = () => {
    monitorCheckList.value = ['PM25'];
    resetOptions();
};
defineExpose({
    resetOptions,
    getSites,
    getAllSites,
    getCheckListData,
    handleSelect,
    clearData,
    getSiteDetail,
    resetData,
});
</script>
<style lang="scss" scoped>
.monitorSites {
    .pollutant-select {
        display: flex;
        align-items: center;
        margin-top: 10px;
        span {
            font-size: 14px;
            margin-right: 10px;
        }
        .el-select {
            width: 200px;
        }
    }
}
</style>
