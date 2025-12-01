<template>
    <div class="baseMap" ref="mapContentRef">
        <BoundaryLayersSwitcher />
        <BaseLayersSwitcher />
    </div>
</template>
<script setup>
import BoundaryLayersSwitcher from './BoundaryLayersSwitcher.vue';
import BaseLayersSwitcher from './BaseLayersSwitcher.vue'
import { OverlayScrollbars } from 'overlayscrollbars';
const mapContentRef = ref();
onMounted(async () => {
    await nextTick();
    OverlayScrollbars(mapContentRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
});
</script>
<style scoped lang="scss">
.baseMap {
    box-sizing: border-box;
    padding: 5px;
    max-height: calc(100vh - 295px);
    // font-size: 16px;
    line-height: 1.15;
    width: 330px;
}
</style>
