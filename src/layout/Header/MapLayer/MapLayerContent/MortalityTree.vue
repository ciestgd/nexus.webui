<template>
    <div>
        <LayerTree
            ref="mortalityTreeRef"
            v-model="checkList"
            :active-id="myLayerColorStore.activeLayerId"
            :treeData="treeData"
            node-key="id"
            @onChange="handleChange"
            @colorSelect="handleColorSelect"
        ></LayerTree>
    </div>
</template>
<script setup>
import LayerTree from './LayerTree.vue';
import { useMortalityLayerStore } from '@/store/mortality-layer';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import ColorBar from './ColorBar.vue';
import { showDialog } from '@/libs/utils';
import { useAdvancedOptionStore } from '@/store/advanced-option';
const advancedOptionStore = useAdvancedOptionStore();
const mortalityTreeRef = ref(null);
const checkList = ref([]);
const mortalityLayerStore = useMortalityLayerStore();
const myLayerColorStore = useMyLayerColorStore();
const advancedMode = computed(() => advancedOptionStore.advancedMode);
const handleColorSelect = ({ data }) => {
    showDialog(
        ColorBar,
        {
            data,
        },
        {
            onHandleSubmit: (value) => {
                let list = mortalityLayerStore.layerList[0];
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
                sessionStorage.setItem('mortalityList', JSON.stringify(mortalityLayerStore.layerList));
            },
        }
    );
};
const treeData = computed(() => {
    let list = mortalityLayerStore.layerList.map((item) => {
        let newItem = { ...item };
        if (newItem.children) {
            newItem.children = newItem.children
                .filter((child) => {
                    return advancedMode.value ? true : !child.id.includes('PercentRank');
                })
                .map((child) => {
                    return {
                        ...child,
                        isAdvanced: advancedMode.value ? child.id.includes('PercentRank') : false,
                    };
                });
        }
        return newItem;
    });
    return list;
});
const handleChange = async (val, id) => {
    mortalityLayerStore.checkList = checkList.value;
    mortalityLayerStore.handleLayerChange();
    if (checkList.value.length > 0) {
        let key = checkList.value[0];
        myLayerColorStore.activeLayerId = key;
    }
};
const reset = (value = []) => {
    mortalityTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = mortalityLayerStore.checkList.concat([]);
    mortalityTreeRef.value.resetTree(list);
};
defineExpose({
    reset,
    initLayer,
});
watch(
    () => mortalityLayerStore.layerList,
    (val) => {
        mortalityLayerStore.handleWatcher();
    },
    { deep: true }
);
watch(
    () => advancedMode.value,
    async (val) => {
        checkList.value = checkList.value.filter((item) => {
            return advancedMode.value ? true : !item.includes('PercentRank');
        });
        handleChange();
    }
);
</script>
<style scoped lang="scss"></style>
