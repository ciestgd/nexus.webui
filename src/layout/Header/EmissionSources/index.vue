<template>
    <el-tooltip effect="customized" content="Emission Sources" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="emissions" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import emissions from '@/assets/images/header-icon/emission.png';
import DialogEmissionSources from './DialogEmissionSources.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const dialogName = ref();
const imgRef = ref();
const isActive = computed(() => props.activeName === 'EmissionSources');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'EmissionSources');
    showDialog(DialogEmissionSources, {
        pointLocation: point,
    }, {
        onHandleDialogClose: () => {
            closeDialog(dialogName.value);
        },
    });
};
watch(
    () => props.activeName,
    (val) => {
        if (val !== 'EmissionSources') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogEmissionSources['__name'];
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
