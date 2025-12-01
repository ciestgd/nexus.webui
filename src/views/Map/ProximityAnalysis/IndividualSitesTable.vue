<template>
    <Dialog title="Individual sites table" :unFullScreen="false" max-height="605" height="100%">
        <!-- :geoIdsObj="props.geoIdsObj" -->
        <SitesTable :data="props.data" :type="type" :areaRatio="props.areaRatio" :isNation="props.isNation" :checkList="props.checkList" :groupType="props.groupType" />
    </Dialog>
</template>

<script setup>
import SitesTable from './SitesTable.vue';
const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    type: {
        type: String,
        default: '',
    },
    areaRatio: {
        type: Number,
        default: 10,
    },
    isNation: {
        type: Boolean,
        default: false,
    },
    checkList: {
        type: Array,
        default: () => [],
    },
    groupType: {
        type: String,
        default: 'pollutants',
    },
    // 初始化的geoId信息
    // geoIdsObj: {
    //     type: Array,
    //     default: () => [],
    // },
});
</script>
