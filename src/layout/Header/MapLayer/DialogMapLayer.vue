<template>
    <Dialog title="Map Layer" height="525" width="400" :isCollapse="true" :isContentDraggable="true">
        <div class="layer-content">
            <el-button type="primary" style="width: 100%" @click="resetMap">Reset Map Layer</el-button>
            <el-divider style="margin: 0" />
            <MapLayerContent ref="mapLayerRef" />
        </div>
    </Dialog>
</template>
<script setup>
import MapLayerContent from './MapLayerContent/index.vue';
const mapLayerRef = ref();
const resetMap = () => {
    mapLayerRef.value.resetMap();
};
</script>
<style scoped lang="scss">
.layer-content {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
