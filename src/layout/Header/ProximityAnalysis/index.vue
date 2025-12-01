<template>
    <el-tooltip effect="customized" content="Proximity Analysis" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="proximityPng" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import proximityPng from '@/assets/images/header-icon/proximity.png';
import DialogProximityAnalysis from './DialogProximityAnalysis.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const dialogName = ref();
const imgRef = ref();
const isActive = computed(() => props.activeName === 'ProximityAnalysis');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'ProximityAnalysis');
    showDialog(
        DialogProximityAnalysis,
        {
            pointLocation: point,
        },
        {
            onHandleDialogClose: () => {
                closeDialog(dialogName.value);
            },
        }
    );
};
watch(
    () => props.activeName,
    (val) => {
        if (val !== 'ProximityAnalysis') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogProximityAnalysis['__name'];
});
</script>
<style scoped lang="scss">
.icon-item {
    background-color: var(--advanced-color);
    &:hover {
        background-color: var(--advanced-color-active);
    }
}
.active {
    background-color: var(--advanced-color-active);
}
</style>
