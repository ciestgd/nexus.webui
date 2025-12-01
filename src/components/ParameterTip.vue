<template>
    <el-tooltip effect="customized">
        <template #content>
            <div class="tool-tip-content">{{ content }}</div>
        </template>
        <Icon name="questionfill" class="icon-content" :color="iconColor" />
    </el-tooltip>
</template>
<script setup>
const props = defineProps({
    content: {
        type: String,
        default: '',
    },
    isAdvancedModel: {
        type: Boolean,
        default: false,
    },
});
const iconColor = computed(() => (props.isAdvancedModel ? '#f700ff' : '#409eff'));
</script>
<style scoped lang="scss">
.tool-tip-content {
    max-width: 200px;
    word-wrap: break-word;
}
.icon-content {
    margin: 0 3px;
}
</style>
