<template>
    <div class="sub-container">
        <div class="select-container">
            <span class="label">Data Year: 2019</span>
            <!-- <el-select class="select" style="width: 100px" v-model="year" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in dvYearOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select> -->
        </div>
        <div class="checkbox-container">
            <div class="parameter">
                <el-checkbox class="checkbox" v-model="isValueChecked" label="Heat Index Value (°F)" @change="handleData" />
                <!-- <ParameterTip content="Once selected, the county or census tract will be marked on the map if the heat index value is greater than or equal to the preset value" /> -->
            </div>
            <el-select class="select" v-show="isValueChecked" v-model="valueType" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-slider class="slider" v-model="currentValue" v-show="isValueChecked" show-input size="small" :max="maxValue" @change="handleData" :format-tooltip="formatTooltip" />
        </div>
        <div class="checkbox-container" v-if="advancedMode">
            <div class="parameter">
                <el-checkbox class="checkbox" v-model="isPercentRankChecked" label="Heat Index Top Percentile (greater than or equal to %)" @change="handleData" />
                <!-- <ParameterTip
                 :is-advanced-model="true"
                    content="Once selected,the county or census tract will be marked on the map if the heat index top percentile is higher than or equal to the preset value"
                /> -->
            </div>
            <el-select class="select" v-show="isPercentRankChecked" v-model="percentRankType" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-slider
                class="slider"
                v-model="currentPercentRank"
                v-show="isPercentRankChecked"
                show-input
                size="small"
                :max="100"
                @change="handleData"
                :format-tooltip="formatTooltip"
            />
        </div>
        <!-- <div class="checkbox-container">
            <el-checkbox class="checkbox" v-model="isClimateRiskIndicatorChecked" label="Climate risk indicators (EJScreen)" @change="handleClimateRisk" />
            <div class="container-tips" v-show="isClimateRiskIndicatorChecked">Select one indicator</div>
            <el-select class="select" v-show="isClimateRiskIndicatorChecked" v-model="climateRiskType" placeholder="Select" size="small" @change="handleClimateRisk">
                <el-option v-for="item in climateRiskList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div> -->
    </div>
</template>

<script setup>
import { heatIndexGeoIdSet, addToSetAsync } from '../../../../libs/geoid-cache';
import * as api from '../../../../api/heat-index';
import { useSidebarStore } from '@/store/sidebar';
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useAdvancedOptionStore } from '@/store/advanced-option';
// import { useMyLayerColorStore } from '@/store/my-layer-color';
const riskRankingStore = useRiskRankingStore();
const zoomSelectorStore = useZoomSelectorStore();
const sidebarStore = useSidebarStore();
const advancedOptionStore = useAdvancedOptionStore();
// const myLayerColorStore = useMyLayerColorStore();
const advancedMode = computed(() => advancedOptionStore.advancedMode);
defineProps({
    formatTooltip: Function,
});

const isValueChecked = ref(false);
const isPercentRankChecked = ref(false);
// const isClimateRiskIndicatorChecked = ref(false);
const currentValue = ref(96);
const currentPercentRank = ref(90);
const maxValue = ref(212);
const valueType = ref('HeatIndexPresent');
const percentRankType = ref('HeatIndexPresent');
// const climateRiskType = ref('wildFireHazard');
const options = ref([
    { value: 'HeatIndexPresent', label: 'Heat Index Present' },
    { value: 'HeatIndex2050', label: 'Heat Index 2050' },
    { value: 'HeatIndex2100', label: 'Heat Index 2100' },
]);
const climateRiskList = ref([
    {
        value: 'wildFireHazard',
        label: 'Wildfire Hazard Potential',
    },
    {
        value: 'drought',
        label: 'Drought',
    },
    {
        value: 'coastal',
        label: 'Coastal Flood Hazard',
    },
    {
        value: 'floodPlain',
        label: '100 Year Flood Plain',
    },
    {
        value: 'seaLevel1',
        label: '1ft Sea Level Rise (NOAA)',
    },
    {
        value: 'seaLevel2',
        label: '2ft Sea Level Rise (NOAA)',
    },
    {
        value: 'seaLevel3',
        label: '3ft Sea Level Rise (NOAA)',
    },
    {
        value: 'seaLevel4',
        label: '4ft Sea Level Rise (NOAA)',
    },
    {
        value: 'seaLevel5',
        label: '5ft Sea Level Rise (NOAA)',
    },
    {
        value: 'seaLevel6',
        label: '6ft Sea Level Rise (NOAA)',
    },
]);
// const handleClimateRisk = () => {
//     myLayerColorStore.climateRiskIndicatorId = isClimateRiskIndicatorChecked.value ? climateRiskType.value : null;
// };
watch(
    () => advancedOptionStore.advancedMode,
    (val) => {
        isPercentRankChecked.value = false;
    }
);
const createTasks = () => {
    const tasks = [];
    let districtData = null;
    if (!riskRankingStore.isOnNation) {
        districtData = zoomSelectorStore.getZoomDetail();
    }
    if (isValueChecked.value) {
        tasks.push(addToSetAsync(heatIndexGeoIdSet, api.getGeoIdsByMinValue(valueType.value, currentValue.value)));
    }

    if (isPercentRankChecked.value) {
        tasks.push(addToSetAsync(heatIndexGeoIdSet, api.getGeoIdsByMinPercentRank(percentRankType.value, currentPercentRank.value / 100, districtData)));
    }

    return tasks;
};

const reset = (val, desiredTile) => {
    switch (val) {
        case 0:
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            currentValue.value = 96;
            currentPercentRank.value = 90;
            valueType.value = 'HeatIndexPresent';
            percentRankType.value = 'HeatIndexPresent';
            // isClimateRiskIndicatorChecked.value = false;
            // climateRiskType.value = 'wildFireHazard';
            break;
        case 1:
            currentValue.value = 96;
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            // isClimateRiskIndicatorChecked.value = false;
            break;
        case 2:
            currentPercentRank.value = 90;
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            // isClimateRiskIndicatorChecked.value = false;
            break;
        case 3:
            currentPercentRank.value = desiredTile;
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            // isClimateRiskIndicatorChecked.value = false;
            break;
    }
    // handleClimateRisk();
};

defineExpose({ createTasks, reset });

const emits = defineEmits(['on-data-change']);
const heatIndexSelect = computed(() => isValueChecked.value || isPercentRankChecked.value);
watch(
    () => heatIndexSelect.value,
    (val) => {
        sidebarStore.heatIndexSelect = val;
    }
);
const handleData = () => {
    emits('on-data-change');
};
</script>

<style scoped>
.select {
    margin-bottom: 4px;
    width: 220px;
}
.container-tips {
    font-size: 12px;
}
</style>
