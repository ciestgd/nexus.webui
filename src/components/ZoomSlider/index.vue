<template>
    <div class="slider-demo-block">
        <el-slider v-model="zoomPercent" vertical height="200px" :format-tooltip="handleTooltip" @change="handleValueChange" />
    </div>
</template>
<script setup>
import { mapManager } from '@/libs/map/map-manager.js';
const zoomPercent = ref(50);
let maxZoom = ref(27);
let minZoom = ref(4);

const handleTooltip = (value) => {
    return `${value}%`;
};
const handleValueChange = (value) => {
    const mapIns = mapManager.getMapIns();
    let view = mapIns.getView();
    let newZoom = Math.round((value / 100) * (maxZoom.value - minZoom.value) + minZoom.value);
    view.setZoom(newZoom);
    zoomPercent.value = value;
};
const calculateZoomPercent = (newZoom) => {
    let Percent = Math.round(((newZoom - minZoom.value) / (maxZoom.value - minZoom.value)) * 10000) / 100;
    zoomPercent.value = Percent;
};
const initData = () => {
    const mapIns = mapManager.getMapIns();
    let view = mapIns.getView();
    maxZoom.value = view.getMaxZoom();
    let newZoom = view.getZoom();
    calculateZoomPercent(newZoom);
};
// 挂载监听事件
const setViewZoomListener = () => {
    const mapIns = mapManager.getMapIns();
    mapIns.on('moveend', () => {
        let view = mapIns.getView();
        calculateZoomPercent(view.getZoom());
    });
};
const removeViewZoomListener = () => {
    const mapIns = mapManager.getMapIns();
    mapIns.un('moveend', () => {
        let view = mapIns.getView();
        calculateZoomPercent(view.getZoom());
    });
};
onMounted(() => {
    initData();
    setViewZoomListener();
});
onBeforeUnmount(() => {
    removeViewZoomListener();
});
</script>
<style scoped lang="scss">
.slider-demo-block {
    padding: 5px 0;
}
</style>
