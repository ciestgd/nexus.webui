<template>
    <div class="table-content">
        <SummaryTableList ref="tableRef" :data="props.data" :columnList="columnList" :colorList="percentilColor" :siteList="siteList" storeType="ejReportStore" />
    </div>
</template>
<script setup>
import SummaryTableList from '@/views/Map/ProximityAnalysis/SummaryTableList.vue';
import { useEJReportStore } from '@/store/ejscreen-report';
const ejReportStore = useEJReportStore();
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    cbsaData: {
        type: Array,
        default: () => [],
    },
    tractData: {
        type: Array,
        default: () => [],
    },
    countyData: {
        type: Array,
        default: () => [],
    },
});
const percentilColor = ref([]);
const siteList = ref([]);
const columnList = ref([
    {
        header: 'Drivers',
        key: 'driver',
        width: 90,
        children: [
            {
                header: '',
                key: 'title',
                width: 30,
            },
            {
                header: '80-90th percentile',
                key: 'percentile90',
                width: 60,
                children: [
                    {
                        header: 'Within Radius of A group',
                        key: 'withinRadiusOfCentroid',
                        width: 30,
                    },
                    {
                        header: 'County Avg.',
                        key: 'countyAvg',
                        width: 30,
                    },
                ],
            },
            {
                header: '90-95th percentile',
                key: 'percentile95',
                width: 30,
                children: [
                    {
                        header: 'CBSA Avg.',
                        key: 'cbsaAvg',
                        width: 30,
                    },
                    {
                        header: 'State Avg.',
                        key: 'stateAvg',
                        width: 30,
                    },
                ],
            },
            {
                header: '95-100th percentile',
                key: 'percentile100',
                width: 60,
                children: [
                    {
                        header: 'EPA Region Avg.',
                        key: 'epaRegionAvg',
                        width: 30,
                    },
                    {
                        header: 'Nation Avg.',
                        key: 'nationAvg',
                        width: 30,
                    },
                ],
            },
        ],
    },
]);
const tableRef = ref();
watch(
    () => props.data,
    (val) => {
        siteList.value = [];
        if (props.tractData.length) {
            let siteType = 'A group of census tracts';
            let siteName = props.tractData.map((item) => item.geoId).join(', ');
            siteList.value.push({
                siteType,
                siteName,
            });
        }
        if (props.countyData.length) {
            let siteType = 'A group of counties';
            let siteName = props.countyData.map((item) => `${item.name} (${item.stateAbbrName})`).join(', ');
            siteList.value.push({
                siteType,
                siteName,
            });
        }
        if (props.cbsaData.length) {
            let siteType = 'A group of CBSAs';
            let siteName = props.cbsaData.map((item) => item.name).join(', ');
            siteList.value.push({
                siteType,
                siteName,
            });
        }
    },
    { deep: true }
);
watch(
    () => ejReportStore.summaryTableColor.list,
    (val) => {
        percentilColor.value = val;
    },
    {
        deep: true,
    }
);
const exportTable = () => {
    let name = `Summary table for Centroid of Inyo County `;
    tableRef.value.exportData(name);
};
onMounted(() => {
    percentilColor.value = ejReportStore.summaryTableColor.list;
});
defineExpose({ exportTable });
</script>
<style scoped lang="scss">
.table-content {
    width: 100%;
}
</style>
