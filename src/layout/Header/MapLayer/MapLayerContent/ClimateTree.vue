<template>
    <div>
        <LayerTree
            ref="climateTreeRef"
            v-model="climateCheckList"
            :active-id="myLayerColorStore.activeLayerId"
            :treeData="climateLayerStore.layerList"
            node-key="id"
            @onChange="climateChange"
            @colorSelect="handleColorSelect"
        ></LayerTree>
    </div>
</template>
<script setup>
import LayerTree from './LayerTree.vue';
import { useClimateLayerStore } from '@/store/climate-layer';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import ColorBar from './ColorBar.vue';
import { showDialog } from '@/libs/utils';
const myLayerColorStore = useMyLayerColorStore();
const climateLayerStore = useClimateLayerStore();
const climateCheckList = ref([]);
const climateTreeRef = ref(null);
const handleColorSelect = ({ data }) => {
    showDialog(
        ColorBar,
        {
            data,
        },
        {
            onHandleSubmit: (value) => {
                let list = climateLayerStore.layerList[0];
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
                sessionStorage.setItem('climateList', JSON.stringify(climateLayerStore.layerList));
            },
        }
    );
};
const climateChange = async (val, id) => {
    climateLayerStore.checkList = climateCheckList.value;
    climateLayerStore.handleLayerChange();
    if (climateCheckList.value.length > 0) {
        let key = climateCheckList.value[0];
        myLayerColorStore.activeLayerId = key;
    }
};
const reset = (value = []) => {
    climateTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = climateLayerStore.checkList.concat([]);
    climateTreeRef.value.resetTree(list);
};
defineExpose({
    reset,
    initLayer,
});
watch(
    () => climateLayerStore.layerList,
    (val) => {
        climateLayerStore.handleWatcher();
    },
    { deep: true }
);
</script>
<style scoped lang="scss"></style>
