<template>
    <div class="radio-main">
        <el-radio value="censusTractListOnMapByShape">Select from map by shape</el-radio>
        <div class="radio-content" v-show="activeRadio === 'censusTractListOnMapByShape'">
            <div class="tips">Select geometry type, e.g., “Box”, click and drag on map.</div>
            <div class="draw-content">
                Geometry type:
                <el-select v-model="drawTypeValue" class="drawTypeSelect" placeholder="Select" @change="handleDraw">
                    <el-option v-for="item in drawTypeList" :key="item" :label="item" :value="item" />
                </el-select>
                <el-button @click="handleDraw">Draw</el-button>
                <el-button @click="handleClearDraw">Clear Draw</el-button>
            </div>
            <div class="transfer-content">
                <MyTransfer :titles="['Census tracts', 'Selected']" filterable v-model="drawGeoIdSelectedList" :data="drawGeoIdList" />
            </div>
        </div>
    </div>
</template>
<script setup>
import overlayer from '@/libs/map/layers/overlayer';
import censusTractAllData from '@/libs/census-tract-all-data';
import { useDataScaleStore } from '@/store/data-scale';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
const props = defineProps({
    activeRadio: {
        type: String,
        default: 'censusTractListOnMapByShape',
    },
});
const dataScaleStore = useDataScaleStore();
const proximityAnalysisStore = useProximityAnalysisStore();
let { addInteraction, removeInteraction, clearInteractionLayer, getInteractionList, abortDrawing } = proximityAnalysisStore.layer;

const drawTypeList = ref(['Square', 'Box', 'Polygon', 'Circle']);
const drawTypeValue = ref('Circle');
const drawGeoIdList = ref([]);
const drawGeoIdSelectedList = ref([]);

// 监听draw是否完成
watch(
    () => proximityAnalysisStore.isDrawing,
    (val) => {
        if (!val) {
            let list = getGeoIdsByInteraction();
            drawGeoIdList.value = [...list].map((item) => ({ key: item, value: item }));
        }
    }
);
// 监听是否取消draw
watch(
    () => proximityAnalysisStore.isEsc,
    (val) => {
        if (val) {
            if (proximityAnalysisStore.isDrawing) {
                abortDrawing();
            }
        }
    }
);
watch(
    () => proximityAnalysisStore.isClearDraw,
    (val) => {
        if (val) {
            handleClearDraw();
            proximityAnalysisStore.isClearDraw = false;
        }
    }
);
const getGeoIdsByInteraction = () => {
    let options = getInteractionList();
    if (dataScaleStore.dataScale === 0) {
        ElMessageBox.alert(`Please make sure the data scale is census tract!`, 'Tip', {
            confirmButtonText: 'OK',
        });
        clearInteractionLayer();
        return [];
    }
    let geoIdsList = new Set();
    let vectorTileSource = overlayer.getSource();
    options.forEach((feature) => {
        var geometry = feature.getGeometry();
        let list = vectorTileSource.getFeaturesInExtent(geometry.getExtent());
        list.forEach(async (item) => {
            let id = item.getId();
            if (id) {
                let censusTractItem = censusTractAllData[id];
                if (censusTractItem) {
                    let center = censusTractItem.center;
                    var isInside = geometry.intersectsCoordinate(center);
                    if (isInside) {
                        geoIdsList.add(id);
                    }
                }
            }
        });
    });
    return [...geoIdsList];
};
const handleDraw = () => {
    removeInteraction();
    addInteraction(drawTypeValue.value);
};
const handleClearDraw = () => {
    clearData();
    handleDraw();
};
const clearDraw = () => {
    clearInteractionLayer();
};
const clearData = () => {
    clearDraw();
    drawTypeValue.value = 'Circle';
    drawGeoIdList.value = [];
    drawGeoIdSelectedList.value = [];
};
const getSites = async () => {
    return drawGeoIdSelectedList.value;
};
defineExpose({
    clearDraw,
    clearData,
    handleClearDraw,
    getSites,
});
</script>
<style scoped lang="scss">
.radio-content {
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
    .tips {
        font-size: 12px;
        color: #6fa76f;
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 5px;
    }
    .draw-content {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #000;
        box-sizing: border-box;
        padding-left: 5px;
        .drawTypeSelect {
            margin: 0 5px;
            width: 100px;
        }
    }
}
.transfer-content {
    min-width: 690px;
    margin-top: 15px;

    .el-transfer {
        :deep(.el-transfer-panel) {
            width: 280px;
        }
        :deep(.el-transfer__buttons) {
            padding: 0 12px;
        }
        :deep(.el-transfer-panel__filter) {
            width: 100%;
            margin: 0;
        }
        :deep(.el-transfer-panel__header) {
            height: 32px;
        }
    }
}
</style>
