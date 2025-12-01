<template>
    <div class="radio-main">
        <el-radio class="radio-title" :value="1">Select tracts around location(s)</el-radio>
        <div class="radio-content" v-show="activeRadio === 1">
            <div class="proximity-dialog-header">
                <div class="radius-content">
                    <div class="radius-box">
                        Radius of Analysis (km):
                        <ParameterTip content="Users can click the up and down arrows or slide the pointer to adjust the analysis radius." />
                        <el-input-number class="number-box" v-model="radiusValue" :min="0.5" :max="50" size="small" controls-position="right" />
                    </div>
                    <el-slider class="slider-box" v-model="radiusValue" :min="0.5" :max="50" :step="0.5" :marks="sliderMarks" />
                </div>
                <div class="minimum-area">
                    Minimum Area Ratio (X%):
                    <ParameterTip
                        content="This option determines that the census tracts within the area of specified radius that has an area ratio larger than X% will be included in the table and plot calculations."
                    />
                    <el-input-number v-model="areaRatio" :min="1" :max="100" style="width: 80px" :controls="false" size="small" />
                </div>
            </div>
            <div class="location-type">
                <span>Location type:</span>
                <el-select v-model="radio" placeholder="Select location type">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <div class="loaction-main">
                <MonitorSitesTransfer @handleHover="handleHover" v-show="radio === 'monitorSites'" ref="monitorTransferRef" />
                <FacilityTransfer @handleHover="handleHover" v-show="radio === 'facilities'" ref="facilityTransferRef" />
                <LocationPoint v-show="radio == 'latLon'" ref="loactionPointRef" />
                <MonitorSiteByMap v-show="radio == 'monitorSiteByMap'" @handleHover="handleHover" ref="monitorSiteByMapRef" />
                <FacilityByMap v-show="radio == 'facilityByMap'" @handleHover="handleHover" ref="facilityByMapRef" />
            </div>
        </div>
    </div>
</template>
<script setup>
import MonitorSitesTransfer from '../../MonitorSitesTransfer.vue';
import FacilityTransfer from '../../FacilityTransfer.vue';
import LocationPoint from './LocationPoint/index.vue';
import MonitorSiteByMap from './MonitorSiteByMap/index.vue';
import FacilityByMap from './FacilityByMap/index.vue';
import { useProximityAnalysisStore } from '@/store/proximity-analysis.js';

const props = defineProps({
    activeRadio: {
        type: Number,
        default: 1,
    },
});
const emit = defineEmits(['handleHover']);
const proximityAnalysisStore = useProximityAnalysisStore();
const sliderMarks = reactive({
    1: {
        style: {
            fontSize: '12px',
        },
        label: '1km',
    },
    50: {
        style: {
            fontSize: '12px',
        },
        label: '50km',
    },
});
const radiusValue = ref(proximityAnalysisStore.radiusValue);
const areaRatio = ref(10);
const radio = ref('monitorSites');
const monitorTransferRef = ref();
const facilityTransferRef = ref();
const monitorSiteByMapRef = ref();
const facilityByMapRef = ref();
const loactionPointRef = ref();
const options = ref([
    { label: 'Monitoring Sites', value: 'monitorSites' },
    { label: 'Facilities', value: 'facilities' },
    { label: 'Latitude(s)/Longitude(s)', value: 'latLon' },
    { label: 'Monitoring Sites on map', value: 'monitorSiteByMap' },
    { label: 'Facilities on map', value: 'facilityByMap' },
]);
const handleHover = (data, target) => {
    emit('handleHover', data, target);
};
const initData = async () => {
    await nextTick();
    await monitorTransferRef.value.resetOptions();
    await facilityTransferRef.value.resetOptions();
};

const initMonitorData = async (list) => {
    radio.value = 'monitorSiteByMap';
    let monitorSitesData = await monitorTransferRef.value.getSiteDetail(list);
    await monitorSiteByMapRef.value.setMultiSelect(monitorSitesData);
};
const initFacilityData = async (list) => {
    radio.value = 'facilityByMap';
    let facilitiesData = await facilityTransferRef.value.getFacilityDetail(list);
    await facilityByMapRef.value.setMultiSelect(facilitiesData);
};
const clearData = () => {
    monitorTransferRef.value.clearData();
    facilityTransferRef.value.clearData();
    monitorSiteByMapRef.value.clearData();
    facilityByMapRef.value.clearData();
};
const getSites = async () => {
    let data = [];
    let type = '';
    if (radio.value === 'monitorSites') {
        data = await monitorTransferRef.value.getSites();
        console.log('monitorTransferRef', data);
        type = 'monitor';
    } else if (radio.value === 'facilities') {
        data = facilityTransferRef.value.getSites();
        type = 'source';
    } else if (radio.value === 'latLon') {
        data = loactionPointRef.value.getSites();
        type = 'censusTract';
    } else if (radio.value === 'monitorSiteByMap') {
        data = monitorSiteByMapRef.value.getSites();
        type = 'monitor';
    } else if (radio.value === 'facilityByMap') {
        data = facilityByMapRef.value.getSites();
        type = 'source';
    }
    console.log('getSites', data, type);
    return {
        data,
        type,
    };
};
watch(
    () => radiusValue.value,
    (val) => {
        proximityAnalysisStore.radiusValue = val;
    }
);
defineExpose({
    initData,
    initMonitorData,
    initFacilityData,
    clearData,
    getSites,
});
</script>
<style lang="scss" scoped>
.radio-main {
    width: 100%;
    .radio-title {
        :deep(.el-radio__label) {
            font-size: 18px;
            font-weight: bold;
        }
    }
    .location-type {
        display: flex;
        align-items: center;
        margin-top: 10px;
        span {
            font-size: 14px;
            margin-right: 10px;
        }
        .el-select {
            width: 200px;
        }
    }
    .radio-content {
        width: 100%;
        box-sizing: border-box;
        padding: 0 10px;
    }
    .proximity-transfer-content {
        width: 100%;
        margin-top: 10px;
        .proximity-transfer-content-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            padding-left: 15px;
            .el-checkbox-group {
                .el-checkbox {
                    height: 24px;
                    margin-right: 10px;
                    :deep(.el-checkbox__label) {
                        font-size: 12px;
                    }
                }
            }
            .year-select {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
        }
        .transfer-content {
            min-width: 690px;
            margin-top: 5px;
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
    }
    .proximity-dialog-header {
        box-sizing: border-box;
        padding: 5px;
        font-size: 14px;
        color: #000;
        .radius-content {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 5px;
            .radius-box {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .slider-box {
                width: 200px;
                margin-left: 15px;
                :deep(.el-slider__marks-text) {
                    margin-top: 10px;
                }
            }
            .number-box {
                width: 80px;
                // margin-left: 10px;
            }
        }
        .minimum-area {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .select-input-box {
            display: flex;
            align-items: center;
            // justify-content: center;
        }
    }
}
</style>
