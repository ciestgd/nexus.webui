<template>
    <MonitorSiteContent @handleLoading="handleLoading" :count="topCount" :model="geoIdList" :fileName="fileName" dataType="ejReport" @resetTopx="resetTopx" />
</template>
<script setup>
import MonitorSiteContent from '@/components/MonitorSites/index.vue';
const props = defineProps({
    countyIds: {
        type: Array,
        default: () => [],
    },
});
const emits = defineEmits(['handleData']);
const topCount = ref(20);
const fileName = computed(() => `Top ${topCount.value} Monitoring Sites`);
const geoIdList = computed(() => ({ countyGeoId: props.countyIds }));
const handleLoading = (val) => {
    emits('handleData', val);
};
const resetTopx = (num) => {
    topCount.value = num;
};
</script>
<style scoped lang="scss"></style>
