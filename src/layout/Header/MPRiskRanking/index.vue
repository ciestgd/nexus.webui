<template>
    <el-tooltip effect="customized" content="MP Risk Ranking" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="ranking" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import ranking from '@/assets/images/header-icon/ranking.png';
import DialogRank from './DialogRank.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const dialogName = ref();
const imgRef = ref();
const isActive = computed(() => props.activeName === 'Ranking');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'Ranking');
    showDialog(DialogRank, {
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
        if (val !== 'Ranking') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogRank['__name'];
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
