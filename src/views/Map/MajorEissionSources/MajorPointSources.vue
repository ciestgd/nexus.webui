<template>
    <MajorPointSource
        ref="sourceRef"
        :count="topXEmissionSources"
        :data="emissionList"
        @resetList="resetList"
        @handleCheckbox="handleCheckbox"
        :fileName="fileName"
        :loading="loading"
    />
</template>
<script setup>
import MajorPointSource from '@/components/MajorPointSource/index.vue';
import { getEmissionsDataFacility } from '@/api/emissions-data.js';

import { useZoomSelectorStore } from '@/store/zoom-selector';
import { getCountyById, getStateById, getCbsaById } from '@/api/district';
const props = defineProps({
    emissionYear: {
        type: Number,
        default: 2017,
    },
});
const zoomSelectorStore = useZoomSelectorStore();
const topXEmissionSources = ref(20);
const sourceRef = ref();
watch(
    () => props.emissionYear,
    (val) => {
        quaram.year = val;
        getAllData();
    },
    { deep: true }
);
const quaram = reactive({
    year: props.emissionYear,
    pageNumber: 1,
    pageSize: 20,
    desc: true,
    order: '',
});
const loading = ref(false);
const distritSelectModel = ref(zoomSelectorStore.model);
const emissionList = ref([
    {
        label: 'CO',
        type: 'CO',
        list: [],
        show: false,
    },
    {
        label: 'NOx',
        type: 'NOx',
        list: [],
        show: true,
    },
    {
        label: 'VOC',
        type: 'VOC',
        list: [],
        show: false,
    },
    {
        label: 'PM10',
        type: 'PM10',
        list: [],
        show: false,
    },
    {
        label: 'PM2.5',
        type: 'PM25',
        list: [],
        show: false,
    },
    {
        label: 'CO2e',
        type: 'CO2e',
        list: [],
        show: true,
    },
    {
        label: 'NH3',
        type: 'NH3',
        list: [],
        show: false,
    },
    {
        label: 'GAS & VOC HAPs',
        type: 'Gas_VOC_HAPs',
        list: [],
        show: true,
    },
    {
        label: 'Heavy Metal HAPs',
        type: 'Heavy_Metal_HAPs',
        list: [],
        show: true,
    },
    {
        label: 'Diesel PM',
        type: 'Diesel_PM_HAPs',
        list: [],
        show: false,
    },
    {
        label: 'SO2',
        type: 'SO2',
        list: [],
        show: true,
    },
]);
const fileName = ref();
watch(
    () => zoomSelectorStore.model,
    async (val) => {
        distritSelectModel.value = val;
        getAllData();
        fileName.value = await getFileName();
    }
);

const handleCheckbox = (item) => {
    if (item.show && !item.list.length) {
        getDataFn(item.type).then((res) => {
            item.list = res || [];
        });
    }
};

const getDataFn = async (type) => {
    quaram.pageSize = topXEmissionSources.value;
    quaram.order = type;
    let geoIdList = {
        // epaRegionId: distritSelectModel.value[0],
        // stateGeoId: distritSelectModel.value[1],
        // cbsaGeoId: distritSelectModel.value[2],
        // countyGeoId: distritSelectModel.value[3],
    };
    let keyArr = ['epaRegionId', 'stateGeoId', 'cbsaGeoId', 'countyGeoId'];
    distritSelectModel.value.forEach((item, index) => {
        let key = null;
        if (item) {
            key = keyArr[index];
            if (key) {
                geoIdList[key] = [item];
            }
        }
    });
    let results = await getEmissionsDataFacility({
        ...quaram,
        ...geoIdList,
    });
    let list = results.items || [];
    list.forEach((item, index) => {
        let value = item[type.toLowerCase()];
        item.value = Math.floor(value * 100) / 100;
        item.siteLon = item.siteLongitude;
        item.siteLat = item.siteLatitude;
        item.ranking = index;
    });
    return list;
};
const resetLayer = () => {
    sourceRef.value.resetLayer();
};
const getAllData = async () => {
    loading.value = true;
    let arr = [];
    emissionList.value.forEach((item) => {
        item.list = [];
        if (item.show) {
            arr.push(
                new Promise((resolve, reject) => {
                    getDataFn(item.type).then((res) => {
                        item.list = res || [];
                        resolve();
                    });
                })
            );
        }
    });
    await Promise.all(arr).then((res) => {
        resetLayer();
    });
    setTimeout(() => {
        loading.value = false;
    }, 800);
};
const resetList = async (val) => {
    topXEmissionSources.value = val;
    emissionList.value.forEach((item) => (item.list = []));
    fileName.value = await getFileName();
    getAllData();
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
    let fileName = `Top ${topXEmissionSources.value} Major Point Scources in ${areaName}`;
    return fileName;
};
onMounted(async () => {
    let advancedOption = localStorage.getItem('advancedOption');
    if (advancedOption) {
        advancedOption = JSON.parse(advancedOption);
        topXEmissionSources.value = advancedOption.topXEmissionSources || 20;
    }
    await nextTick();
    await getAllData();
    fileName.value = await getFileName();
});
defineExpose({ resetLayer });
</script>
