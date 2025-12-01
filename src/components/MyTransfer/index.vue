<template>
    <div class="transfer-box">
        <div class="transfer-panel">
            <div class="transfer-panel-header">
                <div class="title">{{ leftTitle }}</div>
                <span class="list-number">{{ leftCheckList.length }}/{{ leftList.length }}</span>
            </div>
            <div class="transfer-panel-body">
                <el-input v-if="filterable" class="transfer-panel-filter" v-model="listFilterValue" placeholder="Enter keyword" :prefix-icon="Search" />
                <VirtualList ref="leftVirtualRef" :size="props.size" :keeps="props.keeps" :arrayData="leftList" :keyType="props.props" v-model="leftCheckList">
                    <template #default="{ option }">
                        <slot name="default" :option="option"></slot>
                    </template>
                </VirtualList>
            </div>
        </div>
        <div class="transfer-buttons">
            <el-button type="primary" :disabled="!leftCheckList.length" @click="transferToRight" :icon="ArrowRight"></el-button>
            <el-button type="primary" :disabled="!rightCheckList.length" @click="transferToLeft" :icon="ArrowLeft"></el-button>
            <el-button type="primary" :disabled="!leftList.length" @click="transferAllToRight" :icon="DArrowRight"></el-button>
            <el-button type="primary" :disabled="!rightList.length" @click="transferAllToLeft" :icon="DArrowLeft"></el-button>
        </div>
        <div class="transfer-panel">
            <div class="transfer-panel-header">
                <div class="title">{{ rightTitle }}</div>
                <span class="list-number">{{ rightCheckList.length }}/{{ rightList.length }}</span>
            </div>
            <div class="transfer-panel-body">
                <el-input v-if="filterable" class="transfer-panel-filter" v-model="rightFilterValue" placeholder="Enter keyword" :prefix-icon="Search" />
                <VirtualList ref="rightVirtualRef" :size="props.size" :keeps="props.keeps" :arrayData="rightList" :keyType="props.props" v-model="rightCheckList">
                    <template #default="{ option }">
                        <slot name="default" :option="option"></slot>
                    </template>
                </VirtualList>
            </div>
        </div>
    </div>
</template>
<script setup>
import VirtualList from './VirtualList.vue';
import { Search, ArrowLeft, ArrowRight, DArrowRight, DArrowLeft } from '@element-plus/icons-vue';
const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
    props: {
        type: Object,
        default: () => ({
            key: 'key',
            label: 'label',
        }),
    },
    titles: {
        type: Array,
        default: () => ['List', 'Selected'],
    },
    filterable: {
        type: Boolean,
        default: false,
    },
    filterMethod: {
        type: Function,
        default: null,
    },
    size: {
        type: Number,
        default: 32,
    },
    keeps: {
        type: Number,
        default: 7,
    },
});
const emits = defineEmits(['update:modelValue']);
const leftList = computed(() => {
    let list = props.data.filter((item) => props.modelValue.indexOf(item[props.props.key]) === -1);
    if (props.filterable) {
        let fn = props.filterMethod ? props.filterMethod : defalutFilterMethod;
        list = list.filter((item) => {
            return fn(listFilterValue.value, item);
        });
    }
    return list;
});
const rightList = computed(() => {
    let list = props.data.filter((item) => props.modelValue.indexOf(item[props.props.key]) !== -1);
    if (props.filterable) {
        let fn = props.filterMethod ? props.filterMethod : defalutFilterMethod;
        list = list.filter((item) => {
            return fn(rightFilterValue.value, item);
        });
    }
    return list;
});
const leftTitle = computed(() => (props.titles && props.titles[0] ? props.titles[0] : 'List'));
const rightTitle = computed(() => (props.titles && props.titles[1] ? props.titles[1] : 'Selected'));
const defalutFilterMethod = (query, item) => {
    let queryString = query && query.trim();
    if (queryString) {
        return (item[props.props.label] && item[props.props.label].includes(queryString)) || (item[props.props.key] && item[props.props.key].includes(queryString));
    } else {
        return item;
    }
};
const selectList = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    },
});
const leftCheckList = ref([]);
const rightCheckList = ref([]);
const listFilterValue = ref('');
const rightFilterValue = ref('');
const leftVirtualRef = ref();
const rightVirtualRef = ref();
watch(
    () => props.data,
    (val) => {
        if (val.length === 0) {
            leftCheckList.value = [];
            leftVirtualRef.value.clearCheckBox();
            rightCheckList.value = [];
            rightVirtualRef.value.clearCheckBox();
        }
    },
    { deep: true }
);
const transferToRight = () => {
    selectList.value.push(...leftCheckList.value);
    leftCheckList.value = [];
    leftVirtualRef.value.clearCheckBox();
};
const transferToLeft = () => {
    rightCheckList.value.forEach((item) => {
        let index = selectList.value.indexOf(item);
        if (index !== -1) {
            selectList.value.splice(index, 1);
        }
    });
    rightCheckList.value = [];
    rightVirtualRef.value.clearCheckBox();
};
const transferAllToRight = () => {
    let list = leftList.value.map((item) => item[props.props.key]);
    selectList.value.push(...list);
};
const transferAllToLeft = () => {
    selectList.value = [];
};
</script>
<style scoped lang="scss">
.transfer-box {
    display: flex;
    height: 320px;
    align-items: center;
    .transfer-panel {
        width: 250px;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        border: 1px solid #ebeef5;
        .transfer-panel-header {
            width: 100%;
            height: 40px;
            background: #f5f7fa;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            padding-left: 15px;
            padding-right: 15px;
            .title {
                font-size: 16px;
                color: #000;
            }
            .list-number {
                font-size: 12px;
                color: #909399;
            }
        }
        .transfer-panel-body {
            width: 100%;
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            .transfer-panel-filter {
                width: 100%;
                text-align: center;
                padding: 15px;
                box-sizing: border-box;
            }
        }
    }
    .transfer-buttons {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 0 30px;
        .el-button + .el-button {
            margin-left: 0;
            margin-top: 10px;
        }
    }
}
</style>
