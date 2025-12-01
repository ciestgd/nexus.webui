<template>
    <Dialog title="Summary Tables" :unFullScreen="false">
        <SummaryTableVue
            :typeList="props.typeList"
            :topX="props.topX"
            :regionList="props.regionList"
            :regionType="props.regionType"
            :emissionYear="props.emissionYear"
            :populationYear="props.populationYear"
        />
    </Dialog>
</template>
<script setup>
import SummaryTableVue from './SummaryTable.vue';
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
    populationYear: {
        type: Number,
        default: 2021,
    },
});
</script>
<style scoped lang="scss"></style>
