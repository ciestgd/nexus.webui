<template>
    <el-tooltip effect="customized" content="Boundaries and Base Maps" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="map" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import map from '@/assets/images/header-icon/map.png';
import DialogBaseMap from './DialogBaseMap.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const imgRef = ref();
const dialogName = ref();
const isActive = computed(() => props.activeName === 'BaseMap');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'BaseMap');
    showDialog(DialogBaseMap, {
        pointLocation: point,
    });
};
watch(
    () => props.activeName,
    (val) => {
        if (val !== 'BaseMap') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);

onMounted(() => {
    dialogName.value = DialogBaseMap['__name'];
});
</script>
<style scoped lang="scss">
// .icon-item {
//     width: 60px;
//     height: 60px;
//     border-radius: 50%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     background-color: #076fe5;
//     margin-right: 8px;
//     cursor: pointer;
//     img {
//         width: 40px;
//         height: 40px;
//     }
//     &:hover {
//         background-color: #65adff;
//     }
// }
// .active {
//     background-color: #65adff;
// }
</style>
