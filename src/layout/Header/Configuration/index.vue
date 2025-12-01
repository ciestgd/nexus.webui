<template>
    <el-tooltip effect="customized" content="App Configuration and User Manual" placement="bottom">
        <div class="icon-item" :class="[isActive ? 'active' : '']" ref="imgRef" @click="handleShowMap">
            <img :src="showHelp" alt="" />
        </div>
    </el-tooltip>
</template>
<script setup>
import showHelp from '@/assets/images/header-icon/showhelp.png';
import DialogConfiguration from './DialogConfiguration.vue';
import { showDialog, closeDialog } from '../../../libs/utils';
import { mapManager } from '@/libs/map/map-manager.js';
import { useDataScaleStore } from '@/store/data-scale.js';
import { useProjectYearStore } from '@/store/project-year.js';
import { useAdvancedOptionStore } from '@/store/advanced-option';
import { useQuickStartStore } from '@/store/quick-start.js';
const props = defineProps({
    activeName: String,
});
const emits = defineEmits(['setName']);
const dataScaleStore = useDataScaleStore();
const quickStartStore = useQuickStartStore();
const projectYearStore = useProjectYearStore();
const advancedOptionStore = useAdvancedOptionStore();

const imgRef = ref();
const advancedOption = computed(() => advancedOptionStore.option);
const zoomDelta = ref(1);
const dialogName = ref();
const isActive = computed(() => props.activeName === 'Configuration');
const handleShowMap = () => {
    let dialogX = imgRef.value.getBoundingClientRect().x;
    let dialogY = imgRef.value.getBoundingClientRect().y;
    let point = [dialogX, dialogY + 70];
    emits('setName', 'Configuration');
    showDialog(
        DialogConfiguration,
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
const setDefaultOption = () => {
    if (advancedOption.value) {
        let form = advancedOption.value;
        dataScaleStore.dataScale = form.dataScale;
        projectYearStore.projectYear = form.projectYear;
        zoomDelta.value = form.zoomDelta || 1;
    }
};
watch(
    () => props.activeName,
    (val) => {
        if (val !== 'Configuration') {
            closeDialog(dialogName.value);
        }
    },
    {
        deep: true,
    }
);
watch(
    () => advancedOption.value,
    () => {
        setDefaultOption();
    },
    {
        deep: true,
    }
);
onMounted(async () => {
    dialogName.value = DialogConfiguration['__name'];
    let quickStart = JSON.parse(localStorage.getItem('quickStart'));
    if (!quickStart) {
        quickStartStore.visible = true;
    }
    await nextTick();
    const mapIns = mapManager.getMapIns();
    let option = localStorage.getItem('advancedOption');
    if (option) {
        advancedOptionStore.option = JSON.parse(option);
    }
    let isAdvancedModel = localStorage.getItem('advancedMode');
    if (isAdvancedModel) {
        advancedOptionStore.advancedMode = JSON.parse(isAdvancedModel);
    }
    const view = mapIns.getView();
    mapIns.on('wheel', function (event) {
        event.preventDefault();
        const delta = event.originalEvent.deltaY;
        let zoomLevel = view.getZoom();
        if (delta < 0) {
            zoomLevel = zoomLevel + zoomDelta.value;
        } else {
            zoomLevel = zoomLevel - zoomDelta.value;
        }
        view.setZoom(zoomLevel);
    });
});
</script>
<style scoped lang="scss"></style>
