// VirtualList.vue
<template>
    <!-- 展示区域 -->
    <div class="wrap" ref="wrap" @scroll="handleScroll">
        <!-- 为了显示滚动条 -->
        <div ref="scrollHeight" :style="{ height: scrHeight + 'px' }"></div>
        <!-- 展示的内容 -->
        <div class="visible-wrap" ref="visibleWrap" :style="{ transform: `translateY(${offset}px)` }">
            <el-checkbox-group class="transfer-panel-list" v-model="checklist" @change="handleCheckboxChange">
                <el-checkbox class="transfer-panel-item" :value="item[props.keyType.key]" v-for="item in visibleData">
                    <slot name="default" :option="item">{{ item[props.keyType.label] || item[props.keyType.key] }}</slot>
                </el-checkbox>
            </el-checkbox-group>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    size: {
        type: Number,
        default: 40,
    },
    keeps: {
        type: Number,
        default: 40,
    },
    arrayData: {
        type: Array,
        default: () => [],
    },
    keyType: {
        type: Object,
        default: () => ({
            key: 'key',
            label: 'label',
        }),
    },
});
const emits = defineEmits(['update:modelValue', 'on-change']);
const start = ref(0);
const end = ref(props.keeps);
const offset = ref(0);
const checklist = ref([]);
const visibleData = computed(() => props.arrayData.slice(start.value, end.value));
const handleScroll = () => {
    const scrollTop = wrap.value.scrollTop;
    start.value = Math.ceil(scrollTop / props.size) - 1 >= 0 ? Math.ceil(scrollTop / props.size) - 1 : 0;
    end.value = start.value + props.keeps;
    offset.value = start.value * props.size;
};
const scrHeight = computed(() => props.arrayData.length * props.size);
const scrollHeight = ref();
const wrap = ref();
const handleCheckboxChange = (val) => {
    emits('update:modelValue', val);
};

onMounted(async () => {
    await nextTick();
    wrap.value.style.height = props.keeps * props.size + 'px';
});
const clearCheckBox = () => {
    checklist.value = [];
};
defineExpose({
    clearCheckBox,
});
</script>

<style scoped lang="scss">
.wrap {
    position: relative;
    overflow-y: scroll;
}

.visible-wrap {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
}
.transfer-panel-list {
    width: 100%;
    // flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    .transfer-panel-item {
        width: 100%;
        padding-left: 15px;
        color: #000;
        box-sizing: border-box;
        :deep(.el-checkbox__label) {
            width: 100%;
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 2;
        }
    }
}
</style>
