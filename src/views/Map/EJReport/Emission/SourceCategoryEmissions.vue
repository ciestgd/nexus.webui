<template>
    <SourceCategoryEmissions v-loading="loading" element-loading-text="Loading..." dataType="ejReport" :data="emissionList" :fileName="fileName" />
</template>
<script setup>
import SourceCategoryEmissions from '@/components/SourceCategoryEmissions/index.vue';
import { getEmissionsDataCounty } from '@/api/emissions-data';
const props = defineProps({
    emissionYear: {
        type: Number,
        default: 2017,
    },
    countyIds: {
        type: Array,
        default: () => [],
    },
});
const emits = defineEmits(['handleLoading']);
const year = ref(props.emissionYear);
const fileName = ref(`Source Category Emissions`);
const loading = ref(false);
watch(
    () => props.emissionYear,
    (val) => {
        year.value = val;
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
        }
    },
    { deep: true }
);
const emissionList = ref([
    {
        label: 'NOx',
        type: 'NOX',
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
const resetData = (key, item, total) => {
    let type = {
        point: 'Point',
        event: 'Event',
        nonPoint: 'Non-Point',
        onRoad: 'On-Road',
        nonRoad: 'Non-Road',
        total: 'Total',
        residentialCombustion: 'Resident Wood Combustion',
    };
    let value = Math.round(item[key]);
    let percent = null;
    if (total) {
        percent = value / total;
        percent = Math.round(percent * 10000) / 100 + '%';
    }
    return { value, percent, name: type[key], childs: [] };
};
watch(
    loading,
    (val) => {
        emits('handleLoading', val);
    },
    { deep: true }
);
const getAllData = async () => {
    try {
        loading.value = true;
        let geoIdList = {
            countyGeoId: props.countyIds,
        };
        let result = await getEmissionsDataCounty({
            year: year.value,
            ...geoIdList,
        });

        let noSetKey = ['pollutant', 'total', 'residentialCombustion'];
        result.forEach((item) => {
            let arr = [];
            let total = Math.round(item['total']);
            Object.keys(item).forEach((key) => {
                if (noSetKey.indexOf(key) === -1) {
                    let obj = resetData(key, item, total);
                    if (key === 'nonPoint') {
                        let childObj = resetData('residentialCombustion', item, total);
                        obj.childs.push(childObj);
                    }
                    arr.push(obj);
                }
            });
            arr.sort((a, b) => b.value - a.value);
            arr.push(resetData('total', item));
            emissionList.value.forEach((_item) => {
                if (_item.type === item.pollutant) {
                    _item.list = arr;
                }
            });
        });
    } finally {
        loading.value = false;
    }
};
onMounted(async () => {
    await nextTick();
});
</script>
<style scoped lang="scss">
.major-point-sources-data {
    height: 100%;
    display: flex;
    flex-direction: column;
    .major-point-sources-select {
        display: flex;
        border: 1px solid #ccc;
        .select-item {
            width: 100%;
            box-sizing: border-box;
            .select-header {
                height: 32px;
                font-size: 12px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                padding: 0 5px;
                border-bottom: 1px solid #ccc;
                background: #f7f7f7;
                .sites-number {
                    width: 100px;
                }
                .radio-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    // margin-right: 10px;
                    :deep(.el-radio) {
                        margin-right: 10px;
                    }
                }
            }
            .select-content {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                box-sizing: border-box;
                padding: 5px;
                font-size: 12px;
                .sites-content-item {
                    display: flex;
                    width: 48%;
                    justify-content: space-between;
                    align-items: center;
                    margin-right: 5px;
                }
            }
            .pollutants-content {
                :deep(.el-checkbox) {
                    margin-right: 10px;
                    // margin-bottom: 5px;
                }
            }
        }
        .select-item + .select-item {
            border-left: 1px solid #ccc;
        }
    }
    .major-point-sources-content {
        margin-top: 10px;
        // height: 390px;
        flex: 1;
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .content-main {
            flex: 1;
            overflow: auto;
            position: relative;
            box-sizing: border-box;
            .content-list {
                display: flex;
                width: 100%;
                .content-item {
                    position: relative;
                    // min-height: 360px;
                    min-width: 210px;
                    border: 1px solid #000;
                    // border-top: none;
                    box-sizing: border-box;
                    border-radius: 5px 5px 0 0;
                    .content-item-detail-active {
                        background: #b9d1ea;
                    }
                    .content-header-item {
                        position: sticky;
                        top: 0px;
                        width: 100%;
                        box-sizing: border-box;
                        padding: 5px;
                        background: #f0f0f0;
                        border-radius: 5px 5px 0 0;
                        font-size: 14px;
                        font-weight: bold;
                        display: flex;
                        cursor: pointer;
                        align-items: center;
                        font-style: oblique;
                        &::before {
                            content: ' ';
                            width: 8px;
                            height: 8px;
                            background: #33a14f;
                            border-radius: 50%;
                            display: inline-block;
                            margin-right: 5px;
                        }
                    }
                }
                .content-item + .content-item {
                    margin-left: 5px;
                }
            }
            .pie-content {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
            }
        }
    }
}
</style>
