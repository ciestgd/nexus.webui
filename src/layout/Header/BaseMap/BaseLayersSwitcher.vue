<template>
    <div>
        <el-radio-group v-model="radio">
            <el-tree ref="treeRef" class="activeTree" :data="labelList" node-key="label" :props="treeProps" :default-expanded-keys="expandedKeys">
                <template #default="{ node, data }">
                    <el-radio :value="data['label']" v-if="data.isCheck" @click="handleClick" @change="(val) => checkboxChange(val)">
                        <div class="custom-tree-node">
                            <span>{{ node.label }}</span>
                        </div>
                    </el-radio>
                    <div class="custom-tree-node" v-else>
                        <span>{{ node.label }}</span>
                    </div>
                </template>
            </el-tree>
        </el-radio-group>
    </div>
</template>
<script setup>
import { useAdvancedOptionStore } from '@/store/advanced-option';
import baseLayers from '@/libs/map/layers/base-layers';
const radio = ref();

const advancedOptionStore = useAdvancedOptionStore();

const advancedOption = computed(() => advancedOptionStore.option);

const expandedKeys = ref(['Base maps']);
const labelList = ref([
    {
        label: 'Base maps',
        isCheck: false,
        children: [],
    },
]);
const treeProps = ref({
    children: 'children',
    label: 'label',
});
const handleClick = () => {};
const checkboxChange = (val) => {
    baseLayers.forEach((item) => {
        let title = item.get('title');
        item.setVisible(title === radio.value);
    });
};
const getLableList = () => {
    let baseLayersChildren = [];
    radio.value = '';
    baseLayers.forEach((item) => {
        let title = item.get('title');
        baseLayersChildren.push({
            label: title,
            isCheck: true,
        });
    });

    getDefaultRadio();
    labelList.value[0].children = baseLayersChildren;
};
const getDefaultRadio = () => {
    let list = baseLayers.filter((item) => item.get('visible')).map((item) => item.get('title'));
    radio.value = list.length ? list[0] : '';
};
watch(
    () => advancedOption.value,
    () => {
        getDefaultRadio();
    },
    {
        deep: true,
    }
);

onMounted(() => {
    getLableList();
});
</script>
<style scoped lang="scss">
.custom-tree-node {
    display: flex;
    align-items: center;
    .color-box {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;
        width: 22px;
        height: 22px;
        box-sizing: border-box;
        padding: 1px;
    }

    .layer-color {
        display: inline-block;
        width: 20px;
        height: 20px;
        box-sizing: border-box;
        padding: 1px;
    }
    .layer-line-color {
        display: inline-block;
        width: 20px;
        height: 2px;
        background: black;
    }
}
.activeTree {
    :deep(.el-tree-node__content) {
        .custom-tree-node {
            font-size: 16px;
            font-weight: bold;
            // font-family: 'Microsoft YaHei';
            // font-family: 'Times New Roman';
        }
    }
    :deep(.el-tree-node__children) {
        .custom-tree-node {
            font-size: 16px;
            font-weight: normal;
            // font-family: 'Microsoft YaHei';
            // font-family: 'Times New Roman';
        }
    }
}
</style>
<style lang="scss">
.layerNode > .el-tree-node__content {
    background: #b9d1ea;
}
</style>
