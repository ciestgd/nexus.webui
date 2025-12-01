<template>
    <Dialog title="Data" height="140" width="300"  :isCollapse="true" :isContentDraggable="false">
        <div class="data-content">
            <ul>
                <li @click="showViewCurrentData"><img :src="viewAttributeTable" alt="" />View Attribute Table</li>
                <li @click="showDataSources"><img :src="dataSources" alt="" />Data Sources & Weblinks</li>
                <!-- <li @click="gotoDataInput"><img :src="dataInputFile" alt="" />Data Input Files</li> -->
            </ul>
        </div>
    </Dialog>
</template>
<script setup>
import viewAttributeTable from '@/assets/images/header-icon/viewAttributeTable.png';
import dataSources from '@/assets/images/header-icon/dataSources.png';
import dataInputFile from '@/assets/images/header-icon/dataInputFile.png';
import DataSources from '@/views/Map/Data/DataSources.vue';

import { showDialog } from '../../../libs/utils';
import { useViewCurrentDataStore } from '@/store/view-current-data';
import router from '@/router/index';
const emit = defineEmits(['handleDialogClose']);
const viewCurrentDataStore = useViewCurrentDataStore();

const showViewCurrentData = () => {
    if (!viewCurrentDataStore.isShow) {
        viewCurrentDataStore.handleViewShow();
    } else {
        viewCurrentDataStore.handleViewCollapse();
    }
    emit('handleDialogClose');
};

const showDataSources = () => {
    showDialog(DataSources);
    emit('handleDialogClose');
};
const gotoDataInput = () => {
    emit('handleDialogClose');
    router.push({
        path: '/data',
    });
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
