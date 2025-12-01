<template>
    <div class="sidebar" :class="{ collapse: sidebarStore.collapse }" ref="sidebarRef">
        <el-tabs v-model="sidebarStore.activeTabName">
            <el-tab-pane name="home" lazy><Home /></el-tab-pane>
            <el-tab-pane name="info">
                <Info ref="infoRef" v-loading="loading" element-loading-text="Loading..." />
            </el-tab-pane>
        </el-tabs>
    </div>
    <div class="toolbar" :class="{ collapse: sidebarStore.collapse }">
        <el-tooltip effect="customized" :hide-after="0" content="Data Filter" placement="right">
            <Icon class="icon-button icon" name="s-operation" size="20" :class="{ active: sidebarStore.activeTabName == 'home' }" @click="handleClickIcon('home')" />
        </el-tooltip>
        <el-tooltip effect="customized" :hide-after="0" content="Information" placement="right">
            <Icon class="icon-button icon" name="info" size="20" :class="{ active: sidebarStore.activeTabName == 'info' }" @click="handleClickIcon('info')" />
        </el-tooltip>
        <el-tooltip effect="customized" :hide-after="0" content="Collapse/Expand This Panel" placement="right">
            <Icon class="icon-button icon" :name="sidebarStore.collapse ? 'd-arrow-right' : 'd-arrow-left'" size="20" @click="handleCollapse" />
        </el-tooltip>
    </div>
</template>

<script setup>
import { useSidebarStore } from '../../../store/sidebar';
import Home from './Home/index.vue';
import Info from './Info/index.vue';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useViewCurrentDataStore } from '@/store/view-current-data';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useAirToxicStore } from '@/store/air-toxic';
import { selectionLayer } from '@/libs/map-click';
import { useAdvancedOptionStore } from '@/store/advanced-option';
const sidebarRef = ref();
const sidebarStore = useSidebarStore();
const viewCurrentDataStore = useViewCurrentDataStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const airToxicStore = useAirToxicStore();
const advancedOptionStore = useAdvancedOptionStore();
const infoRef = ref();
const loading = ref(false);

const handleClickIcon = (name) => {
    sidebarStore.activeTabName = name;
};
const handleCollapse = () => {
    sidebarStore.handleCollapse();
};

onMounted(async () => {
    OverlayScrollbars(sidebarRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
    await nextTick();
});

watch(
    () => sidebarStore.infoData,
    (val) => {
        if (!val || val.length === 0) {
            infoRef.value.clear();
            return;
        }
        sidebarStore.activeTabName = 'info';
    }
);
watch(
    () => viewCurrentDataStore.selectId,
    (val) => {
        airToxicStore.handleAirToxicBlock(val);
        if (!val) {
            sidebarStore.activeGeoId = null;
            infoRef.value.clear();
            return;
        }
        sidebarStore.activeTabName = 'info';
        sidebarStore.activeGeoId = val;
        sidebarStore.handleInfoData();
    }
);
watch(
    () => sidebarStore.isSetDefault,
    (val) => {
        if (val) {
            sidebarStore.activeTabName = 'home';
            sidebarStore.infoData = null;
            proximityAnalysisStore.selectedGeoId = null;
            selectionLayer.setVisible(false);
        }
    }
);
watch(
    () => advancedOptionStore.advancedMode,
    () => {
        sidebarStore.handleInfoData();
    }
);
</script>

<style scoped lang="scss">
:deep(.el-tabs__header) {
    display: none;
}
:deep(.tabs > .el-tabs__content) {
    color: red;
    font-size: 32px;
    height: 100%;
    background-color: white;
}

.sidebar {
    width: 360px;
    position: fixed;
    z-index: 2;
    top: var(--header-height);
    left: 0;
    height: calc(100vh - var(--header-height));
    background-color: white;
    transition: 0.5s;
    box-shadow: 6px 2px 8px -6px rgb(105 104 104 / 75%);

    &.collapse {
        width: 0;
    }

    :deep(.os-scrollbar-handle) {
        width: 6px;
    }
}

.toolbar {
    position: fixed;
    top: 220px;
    left: 360px;
    z-index: 1;
    box-shadow: 2px -2px 4px -2px rgba(105, 104, 104, 0.5);
    transition: 0.5s;

    &.collapse {
        left: 0;
    }

    .icon {
        padding: 12px;
        cursor: pointer;
        display: block;
        background-color: #136fbf;
        color: white;
        border-right: 2px solid #136fbf;

        &:hover {
            background-color: #0e5491;
            border-right: 2px solid white;
        }

        &.active {
            color: #136fbf;
            background-color: white;
            border-right: 2px solid #136fbf;
        }
    }
}
</style>
