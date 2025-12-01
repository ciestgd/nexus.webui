<template>
    <div>
        <LayerTree
            v-model="concentrationCheckList"
            :activeId="myLayerColorStore.activeLayerId"
            ref="concentrationTreeRef"
            :treeData="concentrationLayerStore.layerList"
            node-key="id"
            @onChange="concentrationChange"
            @colorSelect="handleColorSelect"
        ></LayerTree>
    </div>
</template>
<script setup>
import LayerTree from './LayerTree.vue';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import { useConcentrationLayerStore } from '@/store/concentration-layer';
import ColorBar from './ColorBar.vue';
import { showDialog } from '@/libs/utils';
const myLayerColorStore = useMyLayerColorStore();
const concentrationLayerStore = useConcentrationLayerStore();
const concentrationCheckList = ref([]);
const concentrationTreeRef = ref(null);
const handleColorSelect = ({ data }) => {
    showDialog(
        ColorBar,
        {
            data,
        },
        {
            onHandleSubmit: (value) => {
                let list = concentrationLayerStore.layerList[0];
                let id = value.id;
                let { children, min, max, scaleValue, opacityValue } = value.data;
                list.children.forEach((item) => {
                    if (item.id === id) {
                        item.children = children;
                        item.min = min;
                        item.max = max;
                        item.scaleValue = scaleValue;
                        item.opacityValue = opacityValue;
                    }
                });
                sessionStorage.setItem('concentrationList', JSON.stringify(concentrationLayerStore.layerList));
            },
        }
    );
};
const concentrationChange = async () => {
    concentrationLayerStore.checkList = concentrationCheckList.value;
    concentrationLayerStore.handleLayerChange();
    if (concentrationCheckList.value.length > 0) {
        let key = concentrationCheckList.value[0];
        myLayerColorStore.activeLayerId = key;
    }
};
const reset = (value = []) => {
    concentrationTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = concentrationLayerStore.checkList.concat([]);
    concentrationTreeRef.value.resetTree(list);
};
defineExpose({
    reset,
    initLayer,
});
watch(
    () => concentrationLayerStore.layerList,
    (val) => {
        concentrationLayerStore.handleWatcher();
    },
    { deep: true }
);
</script>
<style scoped lang="scss"></style>
