<template>
    <Dialog title="App Configuration and User Manual" height="230" width="300" :isCollapse="true" :isContentDraggable="false">
        <div class="data-content">
            <ul>
                <li @click="showConfigurationDialog"><img :src="configurationPng" alt="" />App Configuration</li>
                <el-divider style="margin: 0px" />
                <li @click="handleAdvancedOptionDialog"><img :src="optionPng" alt="" />Advanced Option</li>
                <el-divider style="margin: 0px" />
                <li @click="showGuide"><img :src="guidesPng" alt="" />Quick Start Guide</li>
                <el-divider style="margin: 0px" />
                <li @click="showPdf"><img :src="helpPng" alt="" />User Manual</li>
            </ul>
        </div>
    </Dialog>
</template>
<script setup>
import { useQuickStartStore } from '@/store/quick-start.js';
import helpPng from '@/assets/images/header-icon/help-fill.png';
import guidesPng from '@/assets/images/header-icon/guides.png';
import configurationPng from '@/assets/images/header-icon/configutation.png';
import optionPng from '@/assets/images/header-icon/option.png';

import { showDialog } from '../../../libs/utils';
import AppConfiguration from './AppConfiguration/index.vue';
import AdvancedOption from './AdvancedOption/index.vue';

const emits = defineEmits(['handleDialogClose']);
const quickStartStore = useQuickStartStore();
const showConfigurationDialog = () => {
    emits('handleDialogClose');
    showDialog(AppConfiguration);
};
const handleAdvancedOptionDialog = () => {
    emits('handleDialogClose');
    showDialog(AdvancedOption);
};
const showGuide = () => {
    emits('handleDialogClose');
    quickStartStore.visible = true;
};
const showPdf = () => {
    emits('handleDialogClose');
    let url = "/pdf/User's Manual for NEXUS Web beta.pdf";
    window.open(url, '_blank');
};
</script>
<style scoped lang="scss">
.data-content {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    height: 100%;
    display: flex;
    flex-direction: column;
    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
        li {
            padding: 5px;
            height: 40px;
            font-size: 14px;
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            align-items: center;
            color: #606266;
            img {
                width: 20px;
                height: 20px;
                margin-right: 5px;
            }
            &:hover {
                background-color: #ecf5ff;
                color: #50a6ff;
            }
        }
    }
}
</style>
