<template>
    <div>
        <LayerTree
            ref="morbidityTreeRef"
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
import { useMorbidityLayerStore } from '@/store/morbidity-layer';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import ColorBar from './ColorBar.vue';
import { showDialog } from '@/libs/utils';
import { useAdvancedOptionStore } from '@/store/advanced-option';
const advancedOptionStore = useAdvancedOptionStore();
const myLayerColorStore = useMyLayerColorStore();
const morbidityLayerStore = useMorbidityLayerStore();
const advancedMode = computed(() => advancedOptionStore.advancedMode);
const checkList = ref([]);
const morbidityTreeRef = ref(null);
const handleChange = async () => {
    morbidityLayerStore.checkList = checkList.value;
    morbidityLayerStore.handleLayerChange();
    if (checkList.value.length > 0) {
        let key = checkList.value[0];
        myLayerColorStore.activeLayerId = key;
    }
};
const treeData = computed(() => {
    let list = morbidityLayerStore.layerList.map((item) => {
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

const handleColorSelect = ({ data }) => {
    showDialog(
        ColorBar,
        {
            data,
        },
        {
            onHandleSubmit: (value) => {
                let list = morbidityLayerStore.layerList[0];
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
                sessionStorage.setItem('morbidityList', JSON.stringify(morbidityLayerStore.layerList));
            },
        }
    );
};
const reset = (value = []) => {
    morbidityTreeRef.value.resetTree(value);
};
const initLayer = () => {
    let list = morbidityLayerStore.checkList.concat([]);
    morbidityTreeRef.value.resetTree(list);
};
watch(
    () => morbidityLayerStore.layerList,
    (val) => {
        morbidityLayerStore.handleWatcher();
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
defineExpose({
    reset,
    initLayer,
});
</script>
<style scoped lang="scss"></style>
