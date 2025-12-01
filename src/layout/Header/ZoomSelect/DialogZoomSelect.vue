<template>
    <Dialog title="Select Area" height="350" width="330" :isCollapse="true" :isContentDraggable="false">
        <DistrictSelector
            v-model="zoomSelectorStore.model"
            @on-change="handleChange"
            size="large"
            label-prefix="Select "
            :show-divider="false"
            divider-height="76px"
            label-class="label"
            :icon-size="24"
            item-width="100%"
        />
    </Dialog>
</template>
<script setup>
import { useZoomSelect } from '@/libs/zoom-select.js';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
const zoomSelectorStore = useZoomSelectorStore();
const zoomSelect = useZoomSelect();

const handleChange = (model, optionValue) => {
    zoomSelect.handleZoom(model, optionValue);
};
</script>
<style scoped lang="scss">
:deep(.label) {
    font-size: large;
    line-height: 32px;
    font-weight: bolder;
}
</style>
