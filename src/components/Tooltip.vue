<template>
    <el-tooltip
        ref="tooltipRef"
        v-if="tooltipVisible"
        :trigger="trigger"
        :hide-after="0"
        :enterable="enterable"
        v-model:visible="tooltipVisible"
        :virtual-ref="detailRef"
        virtual-triggering
        :append-to="appendRef"
        :effect="effect"
        :placement="placement"
    >
        <template #content>
            <slot></slot>
        </template>
    </el-tooltip>
</template>
<script setup>
const props = defineProps({
    appendRef: {
        type: Object,
        default: () => {},
    },
    effect: {
        type: String,
        default: 'dark',
    },
    placement: {
        type: String,
        default: 'top-start',
    },
    enterable: {
        type: Boolean,
        default: false,
    },
    trigger: {
        type: String,
        default: 'hover',
    },
});
const { appendRef, effect, placement, enterable } = toRefs(props);
const tooltipVisible = ref(false);
const detailRef = ref();
const tooltipRef = ref();

const resetData = (currentTarget) => {
    detailRef.value = currentTarget;
    tooltipVisible.value = true;
};
const hiddenTips = () => {
    detailRef.value = null;
    tooltipVisible.value = false;
};
defineExpose({ resetData, hiddenTips });
</script>
<style scoped lang="scss"></style>
