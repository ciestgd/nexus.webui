<template>
    <div class="aside-content-select-box">
        <div class="select-box-title">
            {{ title }}
            <div class="title-checkbox">
                <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange"></el-checkbox>
                <Icon class="icon-button icon" :class="{ deactiveIcon: !showDetail }" name="d-arrow-right" size="14" @click="handleClickIcon" />
            </div>
        </div>
        <div class="select-box-content" :class="{ deactiveClass: !showDetail }">
            <div class="checkout-group">
                <el-checkbox-group v-model="value" @change="handleCheckedChange">
                    <el-checkbox v-for="item in options" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
                </el-checkbox-group>
            </div>
        </div>
    </div>
</template>
<script setup>
import { toRefs, computed } from 'vue';
// 抛出的回调函数
const emit = defineEmits(['valueChange', 'update:modelValue']);
const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    options: {
        type: Array,
        default: () => [],
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
    height: {
        type: Number,
        default: 100,
    },
});
const { title, options } = toRefs(props);
const checkAll = ref(false);
const isIndeterminate = ref(true);
const handleCheckAllChange = (val) => {
    value.value = val ? options.value.map((item) => item.value) : [];
    isIndeterminate.value = false;
};
const handleCheckedChange = (val) => {
    const checkedCount = val.length;
    checkAll.value = checkedCount === options.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < options.value.length;
};

const value = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
        emit('valueChange', value);
    },
});
const heightPx = computed(() => props.height + 'px');
const showDetail = ref(true);
const handleClickIcon = () => {
    showDetail.value = !showDetail.value;
};
</script>
<style scoped lang="scss">
.aside-content-select-box {
    --hightPx: v-bind(heightPx);
    border: 1px solid #ccc;
    .select-box-title {
        height: 24px;
        font-size: 14px;
        display: flex;
        box-sizing: border-box;
        padding: 0 5px;
        background: #f4f4f4;
        display: flex;
        align-items: center;
        font-weight: bold;
        justify-content: space-between;
        .title-checkbox {
            display: flex;
            align-items: center;
            .icon {
                margin-left: 5px;
                transform: rotate(270deg);
                transition: all 0.5s;
            }
            .deactiveIcon {
                transform: rotate(90deg);
            }
        }
    }
    .select-box-content {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #ccc;
        background: #fff;
        min-height: 100px;
        padding: 0 3px;
        overflow: hidden;
        transition: all 0.5s;
        .checkout-group {
            width: 100%;
            height: var(--hightPx);
            overflow-y: auto;
            .el-checkbox {
                display: flex;
                height: 18px;
                margin-right: 0px;
                :deep(.el-checkbox__label) {
                    font-size: 12px;
                }
            }
        }
    }
    .deactiveClass {
        height: 0;
        min-height: 0;
        .checkout-group {
            height: 0;
        }
    }
}
</style>
