<template>
    <div>
        <LayerTree
            v-model="indicatorsCheckList"
            :active-id="myLayerColorStore.activeLayerId"
            :treeData="indicatorsLayerStore.layerList"
            ref="indicatorsTreeRef"
            node-key="id"
            @onChange="indicatorsChange"
            @colorSelect="handleColorSelect"
        ></LayerTree>
    </div>
</template>
<script setup>
import LayerTree from './LayerTree.vue';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import { useIndicatorsLayerStore } from '@/store/indicators-layer';
import ColorBar from './ColorBar.vue';
import { showDialog } from '@/libs/utils';
const indicatorsLayerStore = useIndicatorsLayerStore();
const myLayerColorStore = useMyLayerColorStore();
const indicatorsCheckList = ref([]);
const indicatorsTreeRef = ref(null);
const handleColorSelect = ({ data }) => {
    showDialog(
        ColorBar,
        {
            data,
        },
        {
            onHandleSubmit: (value) => {
                let list = indicatorsLayerStore.layerList[0];
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
                sessionStorage.setItem('indicatorsList', JSON.stringify(indicatorsLayerStore.layerList));
            },
        }
    );
};
const indicatorsChange = async () => {
    indicatorsLayerStore.checkList = indicatorsCheckList.value;
    indicatorsLayerStore.handleLayerChange();
    if (indicatorsCheckList.value.length > 0) {
        let key = indicatorsCheckList.value[0];
        myLayerColorStore.activeLayerId = key;
    }
};
const reset = (value = []) => {
    indicatorsTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = indicatorsLayerStore.checkList.concat([]);
    indicatorsTreeRef.value.resetTree(list);
};
defineExpose({
    reset,
    initLayer,
});
watch(
    () => indicatorsLayerStore.layerList,
    (val) => {
        indicatorsLayerStore.handleWatcher();
    },
    { deep: true }
);
</script>
<style scoped lang="scss"></style>
