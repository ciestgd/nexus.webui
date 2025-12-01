<template>
    <el-tooltip effect="customized" content="Data" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="dataSources" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import dataSources from '@/assets/images/header-icon/data.png';
import DialogData from './DialogData.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const imgRef = ref();
const dialogName = ref();
const isActive = computed(() => props.activeName === 'Data');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'Data');
    showDialog(
        DialogData,
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
        if (val !== 'Data') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogData['__name'];
});
</script>
<style scoped lang="scss">
.icon-item {
    margin-left: 8px;
}
</style>
