<template>
    <div>
        <LayerTree
            ref="cancerRiskTreeRef"
            v-model="checkList"
            :active-id="myLayerColorStore.activeLayerId"
            :treeData="cancerRiskLayerStore.layerList"
            node-key="id"
            @onChange="handleChange"
            @colorSelect="handleColorSelect"
        ></LayerTree>
    </div>
</template>
<script setup>
import LayerTree from './LayerTree.vue';
import { useCancerRiskLayerStore } from '@/store/cancer-risk-layer';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import ColorBar from './ColorBar.vue';
import { showDialog } from '@/libs/utils';
const cancerRiskTreeRef = ref(null);
const checkList = ref([]);
const cancerRiskLayerStore = useCancerRiskLayerStore();
const myLayerColorStore = useMyLayerColorStore();
const handleColorSelect = ({ data }) => {
    showDialog(
        ColorBar,
        {
            data,
        },
        {
            onHandleSubmit: (value) => {
                let list = cancerRiskLayerStore.layerList[0];
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
                sessionStorage.setItem('cancerRiskList', JSON.stringify(cancerRiskLayerStore.layerList));
            },
        }
    );
};
const handleChange = async (val, id) => {
    cancerRiskLayerStore.checkList = checkList.value;
    cancerRiskLayerStore.handleLayerChange();
    if (checkList.value.length > 0) {
        let key = checkList.value[0];
        myLayerColorStore.activeLayerId = key;
    }
};
const reset = (value = []) => {
    cancerRiskTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = cancerRiskLayerStore.checkList.concat([]);
    cancerRiskTreeRef.value.resetTree(list);
};
defineExpose({
    reset,
    initLayer,
});
watch(
    () => cancerRiskLayerStore.layerList,
    (val) => {
        cancerRiskLayerStore.handleWatcher();
    },
    { deep: true }
);
</script>
<style scoped lang="scss"></style>
