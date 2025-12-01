<template>
    <Dialog title="Summary Plot" :unFullScreen="false" height="520">
        <SummaryPlot :typeList="props.typeList" :topX="props.topX" :regionType="props.regionType" :regionList="props.regionList" :emissionYear="props.emissionYear" />
    </Dialog>
</template>
<script setup>
import SummaryPlot from './SummaryPlot.vue';
const props = defineProps({
    typeList: {
        type: Array,
        default: () => [],
    },
    topX: {
        type: Number,
        default: 20,
    },
    regionList: {
        type: Array,
        default: () => [],
    },
    regionType: {
        type: String,
        default: '',
    },
    emissionYear: {
        type: Number,
        default: 2017,
    },
});
</script>
