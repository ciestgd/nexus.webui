<template>
    <el-tooltip effect="customized" content="Meteorological Sites" placement="bottom">
        <div class="icon-item" id="MeteorologicalDivContent" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="meteorological" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import meteorological from '@/assets/images/header-icon/meteorological.png';
import DialogMeteorologicalSites from './DialogMeteorologicalSites.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const dialogName = ref();
const imgRef = ref();
const isActive = computed(() => props.activeName === 'MeteorologicalSites');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'MeteorologicalSites');
    showDialog(
        DialogMeteorologicalSites,
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
        if (val !== 'MeteorologicalSites') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
onMounted(() => {
    dialogName.value = DialogMeteorologicalSites['__name'];
});
</script>
<style scoped lang="scss">
.icon-item {
    margin-left: 8px;
}
</style>
