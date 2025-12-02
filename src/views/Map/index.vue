<template>
    <div>
        <Sidebar />
        <div class="map" ref="mapRef" id="mapDivContent" style="height: calc(100vh - var(--header-height))"></div>

        <Legend ref="legendRef" />
        <!-- 颜色图例 -->
        <MonitroLegend ref="monitorLegendRef" v-if="monitorSiteStore.isShow || majorEissionStore.isShow" />
        <ViewCurrentData v-show="viewCurrentDataStore.isShow" />
        <MonitorSites v-if="monitorSiteStore.isShow" />
        <MajorEissionSources v-if="majorEissionStore.isShow" />
        <ProximityAnalysis v-if="proximityAnalysisStore.isShow" />
        <MeteorologicalSite />
        <el-tooltip
            v-model:visible="tooltip.visible"
            :content="tooltip.content"
            placement="bottom-start"
            effect="customized"
            trigger="click"
            virtual-triggering
            :show-arrow="false"
            :virtual-ref="tooltip.triggerRef"
            raw-content
            :offset="24"
            :enterable="false"
        >
            <template v-slot="{ content }">{{ content }}</template>
        </el-tooltip>

        <el-tooltip
            v-model:visible="airToxicStore.tooltip.visible"
            :content="airToxicStore.tooltip.content"
            placement="bottom-start"
            effect="light"
            trigger="click"
            virtual-triggering
            :show-arrow="true"
            :virtual-ref="airToxicStore.tooltip.triggerRef"
            raw-content
            :offset="24"
            :enterable="false"
        >
            <template v-slot="{ content }">{{ content }}</template>
        </el-tooltip>
        <!-- 快速开始 -->
        <QuickStart v-if="quickStartStore.visible" />
        <QuickStartTour />
    </div>
</template>

<script>
export default {
    name: 'Map',
};
</script>

<script setup>
import majorLegend from '@/assets/images/majorLegend.png';
import monitorLegend from '@/assets/images/monitorLegend.png';
import domtoimage from 'dom-to-image';
import { setupMapClick } from '@/libs/map-click';
import { ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';
import Sidebar from './Sidebar/index.vue';
import Legend from './Legend/index.vue';
import MonitroLegend from './Legend/MonitorLegend.vue';
import QuickStart from './QuickStart/index.vue';
import QuickStartTour from './QuickStart/QuickStartTour.vue';
import { mapManager } from '@/libs/map/map-manager';
import { useMonitorSiteStore } from '@/store/monitor-site';
import { useMajorEissionStore } from '@/store/major-eission-sources.js';
import { useViewCurrentDataStore } from '@/store/view-current-data';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useSaveImageStore } from '@/store/save-image';
import { useAirToxicStore } from '@/store/air-toxic';
import { useQuickStartStore } from '@/store/quick-start.js';
import ViewCurrentData from './Data/ViewCurrentData.vue';
import MonitorSites from './MonitorSites/index.vue';
import MajorEissionSources from './MajorEissionSources/index.vue';
import MeteorologicalSite from './MeteorologicalSite/index.vue';
import ProximityAnalysis from './ProximityAnalysis/index.vue';

const quickStartStore = useQuickStartStore();
const monitorSiteStore = useMonitorSiteStore();
const majorEissionStore = useMajorEissionStore();
const viewCurrentDataStore = useViewCurrentDataStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const saveImageStore = useSaveImageStore();
const airToxicStore = useAirToxicStore();
const mapRef = ref();
const legendRef = ref();
const monitorLegendRef = ref();
const tooltip = reactive({
    visible: false,
    position: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    content: '',
    triggerRef: {
        getBoundingClientRect() {
            return tooltip.position;
        },
    },
});
onMounted(() => {
    mapManager.initMap(mapRef.value, tooltip);
    setupMapClick();
});

const getImage = async (url) => {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.src = url;
        img.onload = function () {
            resolve(img);
        };
    });
};
// const saveImg = (img, name) => {
//     let canvasBox = document.createElement('canvas');
//     const ctx = canvasBox.getContext('2d');
//     canvasBox.width = img.width;
//     canvasBox.height = img.height;
//     ctx.drawImage(img, 0, 0);
//     canvasBox.toBlob((blob) => {
//         saveAs(blob, name);
//     });
// };
const getDomImg = (el) => {
    return new Promise((resolve, reject) => {
        domtoimage
            .toPng(el)
            .then(async function (dataUrl) {
                let result = await getImage(dataUrl);
                resolve(result);
            })
            .catch(function (error) {
                console.error('oops, something went wrong!', error);
            });
    });
};
// const saveMap = async (fn = null) => {
//     try {
//         const mapIns = mapManager.getMapIns();
//         mapIns.once('rendercomplete', async function () {
//             const mapCanvas = document.createElement('canvas');
//             const size = mapIns.getSize();
//             mapCanvas.width = size[0];
//             mapCanvas.height = size[1];
//             const mapContext = mapCanvas.getContext('2d');
//             Array.prototype.forEach.call(mapIns.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'), function (canvas) {
//                 if (canvas.width > 0) {
//                     const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
//                     mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
//                     let matrix;
//                     const transform = canvas.style.transform;
//                     if (transform) {
//                         matrix = transform
//                             .match(/^matrix\(([^\(]*)\)$/)[1]
//                             .split(',')
//                             .map(Number);
//                     } else {
//                         matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
//                     }
//                     CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
//                     const backgroundColor = canvas.parentNode.style.backgroundColor;
//                     if (backgroundColor) {
//                         mapContext.fillStyle = backgroundColor;
//                         mapContext.fillRect(0, 0, canvas.width, canvas.height);
//                     }
//                     mapContext.drawImage(canvas, 0, 0);
//                 }
//             });
//             mapContext.globalAlpha = 1;
//             mapContext.setTransform(1, 0, 0, 1, 0, 0);
//             if (fn) {
//                 await fn(mapCanvas, mapContext);
//             }
//             mapCanvas.toBlob(function (blob) {
//                 navigator.clipboard.write([
//                     new ClipboardItem({
//                         'image/png': blob,
//                     }),
//                 ]);
//                 ElMessage({
//                     message: 'Image saved successfully',
//                     type: 'success',
//                 });
//             });
//         });
//         mapIns.renderSync();
//     } catch (err) {
//         console.log('err', err);
//     } finally {
//     }
// };
const setLegend = async () => {
    const mapIns = mapManager.getMapIns();
    let attributionCanvas = await getDomImg(mapRef.value);

    let legendUrl = await legendRef.value.getImage();
    let legendCanvas = await getImage(legendUrl);

    const mapCanvas = document.createElement('canvas');
    const mapContext = mapCanvas.getContext('2d');
    const size = mapIns.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    mapContext.drawImage(attributionCanvas, 0, 0);

    let canvasHeiht = legendCanvas.height;
    mapContext.drawImage(legendCanvas, 5, mapCanvas.height - canvasHeiht - 5);
    if (monitorSiteStore.isShow || majorEissionStore.isShow) {
        let monitorUrl = monitorSiteStore.isShow ? monitorLegend : majorLegend;
        // let monitorUrl = await monitorLegendRef.value.getImage();
        let monitorImg = await getImage(monitorUrl);
        // saveImg(monitorImg, 'monitorLegend.png');
        mapContext.drawImage(monitorImg, 10 + 136, mapCanvas.height - monitorImg.height - 5);
    }
    mapCanvas.toBlob(function (blob) {
        let ClipboardItem = window.ClipboardItem;
        if (ClipboardItem) {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob,
                }),
            ]);
        } else {
            saveAs(blob, 'map.png');
        }

        ElMessage({
            message: 'Image saved successfully',
            type: 'success',
        });
    });
};
const saveImage = async () => {
    try {
        setLegend();
        // saveMap(setLegend);
    } catch (err) {
        console.log('saveImageError', err);
    } finally {
        saveImageStore.isSave = false;
    }
};
watch(
    () => saveImageStore.isSave,
    (val) => {
        if (val) {
            saveImage();
        }
    }
);
</script>

<style scoped lang="scss">
.map {
    :deep(.ol-zoom) {
        left: unset;
        top: 40px;
        right: 10px;
    }

    :deep(.ol-scale-line) {
        border-radius: unset;
        bottom: 20px;
        left: unset;
        right: 10px;
    }

    :deep(.ol-rotate) {
        top: 92px;
        right: 10px;
    }
}
</style>
<style lang="scss">
.block-table {
    border-collapse: collapse;
    font-size: 14px;
    th,
    td {
        border: 1px solid #000000;
        text-align: left;
        box-sizing: border-box;
        padding: 5px;
    }
}
</style>
