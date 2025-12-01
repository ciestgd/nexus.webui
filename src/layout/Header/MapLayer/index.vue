<template>
    <el-tooltip effect="customized" content="Map Layer" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="layers" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import layers from '@/assets/images/header-icon/layers.png';
import DialogMapLayer from './DialogMapLayer.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const imgRef = ref();
const dialogName = ref();
const isActive = computed(() => props.activeName === 'MapLayer');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;

    let point = [dialogX, dialogY + 70];
    emits('setName', 'MapLayer');
    showDialog(DialogMapLayer, {
        pointLocation: point,
    });
};
watch(
    () => props.activeName,
    (val) => {
        if (val !== 'MapLayer') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogMapLayer['__name'];
});
</script>
<style scoped lang="scss">
.icon-item {
    margin-right: 0px;
}
</style>
