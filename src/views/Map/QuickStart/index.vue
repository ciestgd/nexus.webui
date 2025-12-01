<template>
    <div class="quick-start">
        <div class="wrapper">
            <div class="top">
                <Icon class="icon-button icon" name="close" size="20" @click="handleClose" />
            </div>
            <div class="content">
                <div class="intro">
                    <h1 class="title">Welcome to Nexus</h1>
                    <p class="copy">
                        Nexus is a multipollutant screening tool that integrates data from a number of sources into one platform. This quick start guide shows you how to use the
                        main components of Nexus, identify multipollutant burdens, and more in areas across the continental U.S.
                    </p>
                    <div class="controller-content">
                        <el-button type="info" @click="handleQuickStart">Explore the Data</el-button>
                        <span class="spanItem">or</span>
                        <div class="select-content">
                            <RegionSelector v-model="regionId" @on-change="handleChange" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom">
                <el-checkbox v-model="notShow" label="Don't show this again" size="large" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { useQuickStartStore } from '@/store/quick-start.js';
import { useZoomSelect } from '@/libs/zoom-select.js';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
import { useSidebarStore } from '@/store/sidebar';
const zoomSelectorStore = useZoomSelectorStore();
const zoomSelect = useZoomSelect();
const quickStartStore = useQuickStartStore();
const sidebarStore = useSidebarStore();
const regionId = ref('');
const notShow = ref(false);
const handleClose = () => {
    if (notShow.value) {
        localStorage.setItem('quickStart', true);
    }
    quickStartStore.visible = false;
};
const handleQuickStart = async () => {
    sidebarStore.collapse = false;
    await nextTick();
    quickStartStore.visible = false;
    quickStartStore.tourVisible = true;
};
const handleChange = (value, item) => {
    zoomSelectorStore.model = [undefined, undefined, undefined, undefined];
    let data = null;
    if (value && item) {
        if (item.type == 'epaRegion') {
            zoomSelectorStore.model[0] = value;
        } else if (item.type == 'state') {
            zoomSelectorStore.model[1] = value;
        } else if (item.type == 'county') {
            zoomSelectorStore.model[3] = value;
        } else if (item.type == 'cbsa') {
            zoomSelectorStore.model[2] = value;
        }
        data = item.data;
    }
    zoomSelect.handleZoom(zoomSelectorStore.model, data);
    handleQuickStart();
};
</script>
<style scoped lang="scss">
.quick-start {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    .wrapper {
        // box-sizing: border-box;
        padding: 48px;
        background-color: #fff;
        border-radius: 0.25rem;
        display: flex;
        flex-direction: column;
        position: relative;
        width: fit-content;
        height: fit-content;
        .top {
            position: absolute;
            right: 1rem;
            top: 1rem;
        }
        .content {
            display: flex;
            width: 100%;
            .intro {
                width: 700px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                .title {
                    font-size: 1.875rem;
                    font-weight: 600;
                    line-height: 2.25rem;
                    margin: 0 0 20px 0;
                }
                .copy {
                    font-size: 1.125rem;
                    line-height: 1.5rem;
                    max-width: 610px;
                    text-align: center;
                    margin: 0 0 20px 0;
                }
                .controller-content {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .spanItem {
                        margin: 0 10px;
                        font-size: 18px;
                        color: #666;
                    }
                    .select-content {
                        width: 200px;
                    }
                }
            }
        }

        .bottom {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }
    }
}
</style>
