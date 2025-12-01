<template>
    <div class="map-layer-box" ref="mapLayerRef">
        <MetricsTree ref="metricsTreeRef" />
        
        <AreaTree ref="areaTreeRef" />

        <MortalityTree ref="mortalityTreeRef" />
        <CancerRiskTree ref="cancerRiskTreeRef" />
        <MorbidityTree ref="morbidityTreeRef" />

        <ConcentrationTree ref="concentrationTreeRef" />
        <DemographicTree ref="demographicTreeRef" />
        <!-- <IndicatorsTree ref="indicatorsTreeRef" /> -->

        <!-- <ClimateTree ref="climateTreeRef" /> -->
    </div>
</template>
<script setup>
import MetricsTree from './MetricsTree.vue';
import AreaTree from './AreaTree.vue';
import MortalityTree from './MortalityTree.vue';
import CancerRiskTree from './CancerRiskTree.vue';
import MorbidityTree from './MorbidityTree.vue';
import ConcentrationTree from './ConcentrationTree.vue';
import DemographicTree from './DemographicTree.vue';
// import IndicatorsTree from './IndicatorsTree.vue';
// import ClimateTree from './ClimateTree.vue';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useMyLayerColorStore } from '@/store/my-layer-color';
const myLayerColorStore = useMyLayerColorStore();

const mapLayerRef = ref();

const metricsTreeRef = ref();
const areaTreeRef = ref();
const mortalityTreeRef = ref();
const cancerRiskTreeRef = ref();
const morbidityTreeRef = ref();
const concentrationTreeRef = ref();
const demographicTreeRef = ref();
// const indicatorsTreeRef = ref();
// const climateTreeRef = ref();

watch(
    () => myLayerColorStore.isResetLayer,
    (val) => {
        if (val) {
            initMapLayer();
            myLayerColorStore.isResetLayer = false;
        }
    },
    { deep: true }
);
const resetMap = () => {
    metricsTreeRef.value.reset();
    areaTreeRef.value.reset();
    mortalityTreeRef.value.reset();
    cancerRiskTreeRef.value.reset();
    morbidityTreeRef.value.reset();
    concentrationTreeRef.value.reset();
    demographicTreeRef.value.reset();
    // indicatorsTreeRef.value.reset();
    // climateTreeRef.value.reset();
    myLayerColorStore.activeLayerId = '';
};
const initMapLayer = () => {
    myLayerColorStore.activeLayerId = '';
    metricsTreeRef.value.initLayer();
    areaTreeRef.value.initLayer();
    mortalityTreeRef.value.initLayer();
    cancerRiskTreeRef.value.initLayer();
    morbidityTreeRef.value.initLayer();
    concentrationTreeRef.value.initLayer();
    demographicTreeRef.value.initLayer();
    // indicatorsTreeRef.value.initLayer();
    // climateTreeRef.value.initLayer();
};
onMounted(async () => {
    await nextTick();
    OverlayScrollbars(mapLayerRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
    initMapLayer();
});
defineExpose({
    resetMap,
});
</script>
<style scoped lang="scss">
.map-layer-box {
    flex: 1;
    width: 100%;
    max-height: calc(100vh - 18.4375rem);
    box-sizing: border-box;
    padding: 0.3125rem;
}
</style>
