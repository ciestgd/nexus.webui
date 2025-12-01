<template>
    <div>
        <span class="label" v-if="!isLogo">{{ label }}<Icon name="caret-bottom" :size="20" /></span>
        <el-tooltip effect="customized" v-if="isLogo">
            <template #content>
                <div class="tool-tip-content">{{ label }}</div>
            </template>
            <Icon :name="iconName" v-if="isLogo" class="icon-content" :color="iconColor" />
        </el-tooltip>
    </div>
</template>
<script setup>
const props = defineProps({
    label: {
        type: String,
        required: true,
        default: '',
    },
    isLogo: {
        type: Boolean,
        // required: false,
        default: false,
    },
    iconName: {
        type: String,
        default: '',
    },
    iconColor: {
        type: String,
        default: '#409eff',
    },
});
</script>
<style scoped lang="scss">
.icon-content {
    cursor: pointer;
    outline: none;
}
.label {
    // font-family: 'Times New Roman';
    font-weight: bold;
    font-size: 18px;
    color: black;
    cursor: pointer;
    &:focus {
        outline: none;
    }
}
</style>
