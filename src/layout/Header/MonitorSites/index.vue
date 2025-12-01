<template>
    <el-tooltip effect="customized" content="Monitor Sites" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="monitorSite" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import monitorSite from '@/assets/images/header-icon/monitor.png';
import DialogMonitorSites from './DialogMonitorSites.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const dialogName = ref();
const imgRef = ref();
const isActive = computed(() => props.activeName === 'MonitorSites');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'MonitorSites');
    showDialog(
        DialogMonitorSites,
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
        if (val !== 'MonitorSites') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogMonitorSites['__name'];
});
</script>
<style scoped lang="scss">
.icon-item {
    margin-right: 0;
}
</style>
