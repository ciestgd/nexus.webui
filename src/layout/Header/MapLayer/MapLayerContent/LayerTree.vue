<template>
    <div>
        <el-checkbox-group v-model="checkbox">
            <el-tree ref="treeRef" class="activeTree" :data="labelList" :node-key="props.nodeKey" :props="treeProps" :default-expanded-keys="expandedKeys">
                <template #default="{ node, data }">
                    <el-checkbox
                        :value="data[props.nodeKey]"
                        v-if="data.isCheck"
                        :disabled="data.disabled"
                        @click="handleClick"
                        @change="(val) => checkboxChange(val, data[props.nodeKey])"
                    >
                        <div class="custom-tree-node">
                            <div class="color-box" @click="(e) => setColor(e, node)" v-if="data.color">
                                <span :class="[props.colorType == 'square' ? 'layer-color' : 'layer-line-color']" :style="{ background: data.color }"></span>
                            </div>

                            <span :class="[data.isAdvanced ? 'advance-model' : '']">
                                <span v-if="data.year">[{{ data.year }}]</span>{{ node.label }}
                            </span>
                        </div>
                    </el-checkbox>

                    <div class="custom-tree-node" :class="[node.parent.data.disabled ? 'unActive' : '']" v-else-if="data.color || data.imageData" @click="resetColor(node, data)">
                        <div class="color-box">
                            <span v-if="data.color" :class="[props.colorType == 'square' ? 'layer-color' : 'layer-line-color']" :style="{ background: data.color }"></span>
                            <img v-if="data.imageData" :src="data.imageData" alt="" />
                        </div>
                        <span>{{ getLabel(node, data) }}</span>
                    </div>
                    <div class="custom-tree-node" v-else>
                        <span>
                            <span v-if="data.year">[{{ data.year }}]</span>{{ node.label }}
                        </span>
                    </div>
                </template>
            </el-tree>
        </el-checkbox-group>
    </div>
</template>
<script setup>
const props = defineProps({
    // 双向数据绑定值
    modelValue: {
        type: Array,
        default: () => [],
    },
    // 节点key
    nodeKey: {
        type: String,
        default: 'id',
    },
    props: {
        type: Object,
        default: () => ({
            children: 'children',
            label: 'label',
        }),
    },
    // type: {
    //     type: String,
    //     default: '',
    // },
    activeId: {
        type: String,
        default: '',
    },
    // 是否多选
    multiple: {
        type: Boolean,
        default: false,
    },
    // 颜色方框的类型 square: 方形 line: 线型
    colorType: {
        type: String,
        default: 'square',
    },
    treeData: {
        type: Array,
        default: () => [],
    },
});
const layerNodeClass = (data, node) => {
    if (data[props.nodeKey] == props.activeId) {
        return 'layerNode';
    }
    return null;
};
const treeProps = ref({
    ...props.props,
    class: layerNodeClass,
});
const labelList = ref([]);
const expandedKeys = ref([]);
const checkboxChange = (val, id) => {
    if (props.multiple) {
        treeModel.value = [...checkbox.value];
    } else {
        if (val) {
            treeModel.value = [id];
            checkbox.value = [id];
            expandedKeys.value = [id];
        } else {
            treeModel.value = [];
            checkbox.value = [];
            expandedKeys.value = [];
        }
    }
    emits('on-change', checkbox.value, id);
};
const handleClick = (e) => {
    e.stopPropagation();
};
const checkbox = ref([]);
const treeRef = ref();
const emits = defineEmits(['update:modelValue', 'on-change', 'color-select']);
const setColor = (e, node) => {
    e.stopPropagation();
    e.preventDefault();
    let nodeData = node.parent.data;
    let data = JSON.parse(JSON.stringify(nodeData));
    emits('color-select', data);
    // showDialog(AreaColorBar, {
    //     data: JSON.parse(JSON.stringify(nodeData)),
    // });
};
const resetColor = (node) => {
    let nodeData = node.parent.data;
    if (nodeData.disabled) return;
    if (nodeData[props.nodeKey] === 'metrics') {
        emits('color-select', {
            data: JSON.parse(JSON.stringify(nodeData[props.props.children])),
        });
    } else {
        emits('color-select', {
            data: JSON.parse(JSON.stringify(nodeData)),
        });
    }
    // else if (nodeData.type === 'climateRiskIndicator') {
    //     showDialog(OpacityColorBar, {
    //         data: JSON.parse(JSON.stringify(nodeData)),
    //         type: props.type,
    //     });
    // } else if (nodeData.type === 'climateRiskIndicatorChild') {
    //     let data = node.parent.parent.data;
    //     showDialog(OpacityColorBar, {
    //         data: JSON.parse(JSON.stringify(data)),
    //         type: props.type,
    //     });
    // }
};

const getLabel = (node, data) => {
    let label = '';
    if (data.min || data.max) {
        let type = node.parent.data.type;
        if (data.min && data.max) {
            label = `${node.data.min} - ${node.data.max}`;
        } else if (data.min) {
            label = `> ${node.data.min}`;
        } else if (data.max) {
            label = `< ${node.data.max}`;
        }
        if (type === 'tile') {
            label += ' %ile';
        } else if (type === 'percent') {
            label += ' %';
        } 
    } else {
        label = data[props.props.label];
    }

    return label;
};
const treeModel = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    },
});
watch(
    () => props.treeData,
    (val) => {
        labelList.value = props.treeData;
    },
    { deep: true }
);
const resetTree = (val = []) => {
    checkbox.value = [...val];
    for (let i = 0; i < labelList.value.length; i++) {
        let key = labelList.value[i][props.nodeKey];
        treeRef.value.store.nodesMap[key].expanded = checkbox.value.indexOf(key) !== -1;
    }
    treeModel.value = [...checkbox.value];
    emits('on-change', checkbox.value, null);
};
// if (props.type) {
//     watch(
//         () => myLayerColorStore[props.type],
//         (val) => {
//             let list = myLayerColorStore[props.type];
//             labelList.value = JSON.parse(JSON.stringify(list));
//         },
//         { deep: true }
//     );
// }
watch(
    () => props.modelValue,
    (val) => {
        checkbox.value = [...props.modelValue];
        expandedKeys.value = [...props.modelValue];
    },
    {
        deep: true,
    }
);
onMounted(async () => {
    let list = [];
    list = props.treeData;
    labelList.value = list;
    if (props.modelValue.length) {
        checkbox.value = [...props.modelValue];
        expandedKeys.value = [...props.modelValue];
    }
});
defineExpose({
    resetTree,
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
        // margin-right: 5px;
    }
    .layer-line-color {
        display: inline-block;
        width: 20px;
        height: 2px;
        // margin-right: 5px;
    }
}
.unActive {
    cursor: not-allowed;
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
            font-size: 14px;
            font-weight: normal;
            // font-family: 'Times New Roman';
        }
    }
}
.advance-model {
    color: var(--advanced-color);
}
</style>
<style lang="scss">
.layerNode > .el-tree-node__content {
    background: #b9d1ea;
}
</style>
