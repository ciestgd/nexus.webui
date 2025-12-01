<template>
    <div>
        <LayerTree
            ref="metricsTreeRef"
            v-model="metricsCheckList"
            :treeData="metricsLayer"
            node-key="id"
            :props="metricsProps"
            @colorSelect="handleColorSelect"
            @onChange="metricsLayerChange"
        ></LayerTree>
    </div>
</template>
<script setup>
import LayerTree from './LayerTree.vue';
import { useLegendColorStore } from '@/store/legend-color';
import MetricsColorBar from '@/views/Map/Legend/ColorBar.vue';
import { showDialog } from '@/libs/utils';
const legendColorStore = useLegendColorStore();
const metricsProps = ref({
    children: 'children',
    label: 'text',
});
const metricsCheckList = ref(['metrics']);
const metricsTreeRef = ref(null);
const metricsLayer = ref([
    {
        id: 'metrics',
        text: 'Nexus Metrics',
        isCheck: true,
        children: legendColorStore.labelList,
    },
]);
watch(
    () => legendColorStore.labelList,
    (val) => {
        metricsLayer.value = [
            {
                id: 'metrics',
                text: 'Nexus Metrics',
                isCheck: true,
                children: legendColorStore.labelList,
            },
        ];
    },
    { deep: true }
);
const handleColorSelect = ({ data }) => {
    showDialog(MetricsColorBar, {
        list: data,
    });
};
const metricsLayerChange = (val, id) => {
    legendColorStore.handleLayerChange(metricsCheckList.value);
};
const initLayer = () => {
    let list = legendColorStore.checkList.concat([]);
    metricsTreeRef.value.resetTree(list);
};
const reset = (value = ['metrics']) => {
    metricsTreeRef.value.resetTree(value);
};
defineExpose({
    reset,
    initLayer,
});
</script>
<style scoped lang="scss"></style>
