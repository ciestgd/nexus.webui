<template>
    <div>
        <el-radio-group v-model="checkbox">
            <el-tree ref="treeRef" class="activeTree" :data="labelList" node-key="label" :props="treeProps" :default-expanded-keys="expandedKeys">
                <template #default="{ node, data }">
                    <el-radio :value="data['label']" v-if="data.isCheck" @change="(val) => checkboxChange(val)">
                        <div class="custom-tree-node">
                            <div class="color-box" @click="(e) => setColor(e, node)">
                                <span class="layer-line-color" :style="{ background: data.color }"></span>
                            </div>
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
import { showDialog } from '@/libs/utils';
import { useBoundaryLayersStyleStore } from '@/store/boundary-layers-style.js';
import { useAdvancedOptionStore } from '@/store/advanced-option';
import boundaryLayers from '@/libs/map/layers/boundary-layers';
import BoundaryStyleBar from './BoundaryStyleBar.vue';
const checkbox = ref();

const boundaryLayersStyleStore = useBoundaryLayersStyleStore();
const advancedOptionStore = useAdvancedOptionStore();

const advancedOption = computed(() => advancedOptionStore.option);

const expandedKeys = ref(['Boundaries']);
const labelList = ref([
    {
        label: 'Boundaries',
        isCheck: false,
        children: [],
    },
]);
const treeProps = ref({
    children: 'children',
    label: 'label',
});
const checkboxChange = (val) => {
    boundaryLayers.forEach((item) => {
        let title = item.get('title');
        item.setVisible(checkbox.value == title);
    });
};
const setColor = (e, node) => {
    e.stopPropagation();
    e.preventDefault();
    showDialog(
        BoundaryStyleBar,
        {},
        {
            onHandleSetColor: () => {
                getLableList();
            },
        }
    );
};
const getLableList = () => {
    let boundaryChildren = [];
    checkbox.value = [];
    boundaryLayers.forEach((item) => {
        let title = item.get('title');
        let color = item.get('color');
        let width = item.get('width');
        boundaryChildren.push({
            label: title,
            isCheck: true,
            width,
            color,
        });
    });
    if (!boundaryLayersStyleStore.list.length) {
        boundaryLayersStyleStore.list = boundaryLayers;
    }
    getDefaultCheckBox();
    labelList.value[0].children = boundaryChildren;
};
const getDefaultCheckBox = () => {
    let list = boundaryLayers.filter((item) => item.get('visible')).map((item) => item.get('title'));
    // checkbox.value = [].concat(list);
    checkbox.value = list.length ? list[0] : '';
};

watch(
    () => advancedOption.value,
    () => {
        getDefaultCheckBox();
    },
    {
        deep: true,
    }
);
onMounted(async () => {
    await nextTick();
    getLableList();
});
</script>
<style scoped lang="scss">
.custom-tree-node {
    display: flex;
    align-items: center;
    // font-family: 'Times New Roman';
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
