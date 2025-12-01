<template>
    <div class="zoom-selector" :class="collapse ? 'collase-box' : ''">
        <div class="district-box">
            <DistrictSelector
                v-model="zoomSelectorStore.model"
                @on-change="handleChange"
                size="large"
                label-prefix="Zoom to "
                show-divider
                divider-height="76px"
                label-class="label"
                :icon-size="24"
            />
        </div>
        <div class="selector-collase" @click="handleCollapse">
            <el-tooltip effect="customized" :hide-after="0" content="Collapse/Expand This Panel" placement="right">
                <Icon class="icon-button icon" :name="collapse ? 'd-arrow-right' : 'd-arrow-left'" size="12" />
            </el-tooltip>
        </div>
    </div>
</template>

<script setup>
import Point from 'ol/geom/Point.js';
import { Style, Stroke } from 'ol/style.js';
import VectorTileLayer from 'ol/layer/VectorTile';
import { mapManager } from '@/libs/map/map-manager.js';
import { epaRegionSource, stateSource, countySource, cbsaSource } from '@/libs/map/boundary-sources/index.js';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
import { useSidebarStore } from '@/store/sidebar';
const zoomSelectorStore = useZoomSelectorStore();
const sidebarStore = useSidebarStore();
// lookup for selection object
let selectedId;
const collapse = computed(() => zoomSelectorStore.collapse);
const handleCollapse = () => {
    // collapse.value = !collapse.value;
    zoomSelectorStore.collapse = !zoomSelectorStore.collapse;
};
const left = computed(() => (sidebarStore.collapse ? '0px' : '320px'));
// Selection
const selectionLayer = new VectorTileLayer({
    map: null,
    renderMode: 'vector',
    source: null,
    visible: false,
    zIndex: 1,
    style: (feature) => {
        if (feature.getId() === selectedId) {
            return new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 2,
                }),
            });
        }
    },
});
watch(
    () => zoomSelectorStore.isClear,
    (val) => {
        if (val) {
            handleChange([], null);
            zoomSelectorStore.isClear = false;
        }
    }
);
const handleChange = (model, optionValue) => {
    const mapIns = mapManager.getMapIns();
    const view = mapIns.getView();
    let modelNames = [];
    if (!optionValue) {
        view.fit(new Point(mapManager.initCenter), { minResolution: 4000, duration: 1000 });
        selectedId = null;
        selectionLayer.setVisible(false);
        zoomSelectorStore.nameList = [];
        return;
    }

    let id;
    let minResolution;
    let layerSource;

    if (model[3] !== undefined) {
        id = model[3];
        minResolution = 500;
        layerSource = countySource;
        modelNames[3] = optionValue.name;
        modelNames[1] = optionValue.stateAbbrName;
    } else if (model[2] !== undefined) {
        id = model[2];
        minResolution = 500;
        layerSource = cbsaSource;
        modelNames[2] = optionValue.name;
    } else if (model[1] !== undefined) {
        id = model[1];
        minResolution = id === '02' ? 5000 : 2000;
        layerSource = stateSource;
        modelNames[1] = optionValue.abbrName;
    } else if (model[0] !== undefined) {
        id = model[0];
        minResolution = id === '10' ? 12000 : 2000;
        layerSource = epaRegionSource;
        modelNames[0] = 'EPA Region ' + optionValue.id;
    }
    zoomSelectorStore.nameList = modelNames;
    selectedId = id;
    selectionLayer.setMap(mapIns);
    selectionLayer.setSource(layerSource);
    if (selectionLayer.getVisible()) {
        selectionLayer.changed();
    } else {
        selectionLayer.setVisible(true);
    }

    view.fit(new Point([optionValue.centerLon, optionValue.centerLat]), { duration: 1000, minResolution: minResolution });
};
</script>

<style scoped lang="scss">
.zoom-selector {
    position: fixed;
    top: 80px;
    // left: 320px;
    left: v-bind(left);
    z-index: 1;
    height: 76px;
    background-color: #f0f8ff;
    border: 1px solid #dfdfdf;
    min-width: 863px;
    overflow: hidden;
    display: flex;
    align-items: center;
    transition: all 0.5s;
    box-sizing: border-box;
    padding-right: 15px;
    .district-box {
        width: 848px;
        min-width: 848px;
    }
    .selector-collase {
        height: 100%;
        border-left: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 0 1px;
        cursor: pointer;
        position: absolute;
        top: 0px;
        right: 0px;
        background-color: #f0f8ff;
    }
    :deep(.label) {
        font-size: large;
        line-height: 32px;
        font-weight: bolder;
        // font-family: 'Calibri', Arial, sans-serif;
        // font-family: 'Times New Roman';
    }
}
.collase-box {
    min-width: 15px;
    width: 15px;
}
</style>
