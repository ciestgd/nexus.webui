<template>
    <el-tooltip effect="customized" content="Select Area" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleZoomSelector">
            <img :src="search" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import search from '@/assets/images/header-icon/search.png';

import DialogZoomSelect from './DialogZoomSelect.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const imgRef = ref();
const dialogName = ref();
const isActive = computed(() => props.activeName === 'ZoomSelector');
const handleZoomSelector = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'ZoomSelector');
    showDialog(DialogZoomSelect, {
        pointLocation: point,
    });
};
watch(
    () => props.activeName,
    (val) => {
        if (val !== 'ZoomSelector') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogZoomSelect['__name'];
});
</script>
<style scoped lang="scss"></style>
