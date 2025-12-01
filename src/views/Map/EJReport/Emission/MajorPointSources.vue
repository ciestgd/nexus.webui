<template>
    <MajorPointSource
        ref="sourceRef"
        dataType="ejReport"
        :count="topXEmissionSources"
        :data="emissionList"
        @resetList="resetList"
        @handleCheckbox="handleCheckbox"
        :fileName="fileName"
        :loading="loading"
    />
</template>
<script setup>
import { getEmissionsDataFacility } from '@/api/emissions-data.js';
import MajorPointSource from '@/components/MajorPointSource/index.vue';
import { useMajorEissionStore } from '@/store/major-eission-sources';
const majorEissionStore = useMajorEissionStore();
const props = defineProps({
    countyIds: {
        type: Array,
        default: () => [],
    },
    emissionYear: {
        type: Number,
        default: 2017,
    },
});
const emits = defineEmits(['handleLoading']);
watch(
    () => props.emissionYear,
    (val) => {
        quaram.year = val;
        getAllData();
    },
    { deep: true }
);
watch(
    () => props.countyIds,
    (val) => {
        if (val.length) {
            getAllData();
        } else {
            emissionList.value.forEach((item) => (item.list = []));
            sourceRef.value.resetLayer();
        }
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
const sourceRef = ref();
const loading = ref(false);
const topXEmissionSources = ref(10);
const emissionList = ref([
    {
        label: 'NOx',
        type: 'NOx',
        list: [],
        show: true,
    },
    {
        label: 'SO2',
        type: 'SO2',
        list: [],
        show: true,
    },
    {
        label: 'CO2e',
        type: 'CO2e',
        list: [],
        show: true,
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
        label: 'PM2.5',
        type: 'PM25',
        list: [],
        show: false,
    },
    {
        label: 'Diesel PM',
        type: 'Diesel_PM_HAPs',
        list: [],
        show: false,
    },
    {
        label: 'VOC',
        type: 'VOC',
        list: [],
        show: false,
    },
    {
        label: 'NH3',
        type: 'NH3',
        list: [],
        show: false,
    },
    {
        label: 'CO',
        type: 'CO',
        list: [],
        show: false,
    },
    {
        label: 'PM10',
        type: 'PM10',
        list: [],
        show: false,
    },
]);
const fileName = computed(() => `Top ${topXEmissionSources.value} Major Point Scources`);
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
        sourceRef.value.resetLayer();
    });
    setTimeout(() => {
        loading.value = false;
    }, 800);
};
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

    let results = await getEmissionsDataFacility({
        ...quaram,
        countyGeoId: props.countyIds,
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

const resetList = (val) => {
    topXEmissionSources.value = val;
    emissionList.value.forEach((item) => (item.list = []));
    getAllData();
};
watch(
    loading,
    (val) => {
        emits('handleLoading', val);
    },
    { deep: true }
);
onMounted(async () => {
    await nextTick();
    majorEissionStore.type = emissionList.value[0].type;
});
</script>
<style scoped lang="scss"></style>
