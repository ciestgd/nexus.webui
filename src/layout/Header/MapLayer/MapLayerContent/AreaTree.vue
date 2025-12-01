<template>
    <div>
        <LayerTree
            v-model="areaCheckList"
            ref="areaTreeRef"
            :multiple="true"
            colorType="line"
            :treeData="layerList"
            node-key="id"
            @onChange="areaLayerChange"
            @colorSelect="handleColorSelect"
        ></LayerTree>
    </div>
</template>
<script setup>
import { useAreaLayerStore } from '@/store/area-layer';
import LayerTree from './LayerTree.vue';
import AreaColorBar from './AreaColorBar.vue';
import { showDialog } from '@/libs/utils';
import { useProjectYearStore } from '@/store/project-year';
const areaTreeRef = ref(null);

const areaLayerStore = useAreaLayerStore();
const projectYearStore = useProjectYearStore();
const areaCheckList = ref([]);

const handleColorSelect = (data) => {
    showDialog(AreaColorBar, {
        data: data,
    });
};
const layerList = computed(() => {
    let list = areaLayerStore.layerList;
    list.forEach((item) => {
        let children = item.children || [];
        children.forEach((child) => {
            if (child.id == 'pm25') {
                child.year = projectYearStore.pm25DvYear
            } else if (child.id == 'o3') {
                child.year = projectYearStore.o3DvYear;
            }
        });
    });
    return list;
});

const areaLayerChange = (val, id) => {
    areaLayerStore.areaCheckList = areaCheckList.value;
    if (id) {
        let check = val.indexOf(id) !== -1;
        handleCheckChange(id, check);
    } else {
        let idList = ['pm25', 'o3', 'advance', 'class', 'tribal', 'cejst'];
        idList.forEach((item) => {
            let check = val.length && val.indexOf(item) !== -1;
            handleCheckChange(item, check);
        });
    }
};
const handleCheckChange = (id, checked) => {
    switch (id) {
        case 'pm25':
            areaLayerStore.handlePM25AreaCheckbox(checked);
            break;
        case 'o3':
            areaLayerStore.handleO3AreaCheckbox(checked);
            break;
        case 'advance':
            areaLayerStore.advanceAreaCheckbox = checked;
            areaLayerStore.handleOtherMapChange();
            break;
        case 'class':
            areaLayerStore.classAreaCheckbox = checked;
            areaLayerStore.handleOtherMapChange();
            break;
        case 'tribal':
            areaLayerStore.tirbalAreaCheckbox = checked;
            areaLayerStore.handleOtherMapChange();
            break;
        case 'cejst':
            areaLayerStore.handleCEJSTAreaCheckbox(checked);
            break;
    }
};

const reset = (value = []) => {
    areaTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = areaLayerStore.areaCheckList.concat([]);
    areaTreeRef.value.resetTree(list);
};
defineExpose({
    reset,
    initLayer,
});

watch(
    () => areaLayerStore.layerList,
    (val) => {
        areaLayerStore.handleOtherMapChange();
        areaLayerStore.handleCEJSTWatcher();
        areaLayerStore.handleZoomWatcher();
    },
    { deep: true }
);
</script>
<style scoped lang="scss"></style>
