<template>
    <div>
        <LayerTree
            v-model="checkList"
            :active-id="myLayerColorStore.activeLayerId"
            :treeData="demographicLayerStore.layerList"
            ref="demographicTreeRef"
            node-key="id"
            @onChange="demographicChange"
            @colorSelect="handleColorSelect"
        ></LayerTree>
    </div>
</template>
<script setup>
import LayerTree from './LayerTree.vue';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import { useDemographicLayerStore } from '@/store/demographic-layer';
import ColorBar from './ColorBar.vue';
import { showDialog } from '@/libs/utils';
const demographicLayerStore = useDemographicLayerStore();
const myLayerColorStore = useMyLayerColorStore();
const checkList = ref([]);
const demographicTreeRef = ref(null);
const handleColorSelect = ({ data }) => {
    showDialog(
        ColorBar,
        {
            data,
        },
        {
            onHandleSubmit: (value) => {
                let list = demographicLayerStore.layerList[0];
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
                sessionStorage.setItem('demographicList', JSON.stringify(demographicLayerStore.layerList));
            },
        }
    );
};
const demographicChange = async () => {
    demographicLayerStore.checkList = checkList.value;
    demographicLayerStore.handleLayerChange();
    if (checkList.value.length > 0) {
        let key = checkList.value[0];
        myLayerColorStore.activeLayerId = key;
    }
};
const reset = (value = []) => {
    demographicTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = demographicLayerStore.checkList.concat([]);
    demographicTreeRef.value.resetTree(list);
};
defineExpose({
    reset,
    initLayer,
});
watch(
    () => demographicLayerStore.layerList,
    (val) => {
        demographicLayerStore.handleWatcher();
    },
    { deep: true }
);
</script>
<style scoped lang="scss"></style>
