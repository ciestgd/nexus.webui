<template>
    <el-tooltip effect="customized" content="Reporting regional packet" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="reportPng" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import reportPng from '@/assets/images/header-icon/report.png';
import DialogReporting from './DialogReporting.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const dialogName = ref();
const imgRef = ref();
const isActive = computed(() => props.activeName === 'ReportingRegionalPacket');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'ReportingRegionalPacket');
    showDialog(DialogReporting, {
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
        if (val !== 'ReportingRegionalPacket') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogReporting['__name'];
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
