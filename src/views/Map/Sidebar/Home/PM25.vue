<template>
    <div class="sub-container">
        <div class="flex-box">
            <span class="sub-title">Ambient:</span>
            <ParameterTip
                content="Ambient data is displayed based on the selected value. The default value is the National Ambient Air Quality Standard (NAAQS), however, the data displayed does not correspond to attainment status."
            />
        </div>
        <div class="select-container">
            <span class="label">Data (County highest DV) Year:</span>
            <el-select class="select" style="width: 100px" v-model="year" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in dvYearOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
        <div class="checkbox-container">
            <div class="parameter">
                <el-checkbox class="checkbox" v-model="annual.isChecked" @change="handleData">Annual PM2.5 Standard (μg/m³) </el-checkbox>
                <!-- <ParameterTip content="The county or census tract will be marked on the map if the annual PM2.5 standard is greater than or equal to the preset value" /> -->
            </div>
            <el-slider
                class="slider"
                v-model="annual.currentValue"
                v-show="annual.isChecked"
                show-input
                size="small"
                :max="annual.maxValue"
                @change="handleData"
                :format-tooltip="formatTooltip"
            />
            <div class="detail-tips">Note: Current annual NAAQS 9 μg/m³</div>
        </div>
        <div class="checkbox-container">
            <div class="parameter">
                <el-checkbox class="checkbox" v-model="daily.isChecked" @change="handleData">Daily PM2.5 Standard (μg/m³)</el-checkbox>
                <!-- <ParameterTip content="The county or census tract will be marked on the map if the daily PM2.5 standard is greater than or equal to the preset value" /> -->
            </div>
            <el-slider
                class="slider"
                v-model="daily.currentValue"
                v-show="daily.isChecked"
                show-input
                size="small"
                :max="daily.maxValue"
                @change="handleData"
                :format-tooltip="formatTooltip"
            />
            <div class="detail-tips">Note: Current 24-hr NAAQS 35 μg/m³</div>
        </div>
    </div>
    <div class="sub-container" v-if="!isCensusTract">
        <span class="sub-title">Risk (Data Year: 2020):</span>
        <div class="checkbox-container">
            <div class="flex-box" style="justify-content: space-between">
                <el-checkbox class="checkbox" v-model="mortalityRate.isChecked" label="Mortality Rate" @change="handleData" />
                <el-select
                    class="select"
                    v-show="dataScaleStore.isCountyLevel"
                    style="width: 90px"
                    v-model="mortalityRate.valueType"
                    @change="handleMortalityRateChange"
                    placeholder="Select"
                    size="small"
                >
                    <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <el-radio-group class="radio-group" v-show="mortalityRate.isChecked" v-model="mortalityRate.radio" size="small" @change="handleData">
                <div class="parameter">
                    <el-radio class="radio" :value="0">Risk value ({{ mortalityRate.valueType === 'max' ? 'person per 10k per year' : 'total number in county' }})</el-radio>
                    <!-- <ParameterTip
                        content="The county or census tract will be marked on the map if the risk value (census tract)  or the maximum mortality rate (county level) of PM2.5 is greater than or equal to the preset value"
                    /> -->
                </div>
                <el-slider
                    class="slider"
                    v-model="mortalityRate.currentValue"
                    v-show="mortalityRate.radio === 0"
                    show-input
                    size="small"
                    :max="mortalityRate.maxValue"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                />
                <div class="parameter" v-if="advancedMode">
                    <el-radio class="radio advanced-model" :value="1">Top Risk Percentile (greater than or equal to %)</el-radio>
                    <!-- <ParameterTip
                     :is-advanced-model="true"
                        content="The county or census tract will be marked on the map if the top risk percentile of the mortality rate of PM2.5 is higher than or equal to the preset value"
                    /> -->
                </div>
                <el-slider
                    class="slider"
                    v-model="mortalityRate.currentPercentRank"
                    v-show="mortalityRate.radio === 1"
                    show-input
                    size="small"
                    :max="100"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                />
            </el-radio-group>
        </div>
        <div class="checkbox-container">
            <div class="flex-box" style="justify-content: space-between">
                <el-checkbox class="checkbox" v-model="morbidityRate.isChecked" label="Morbidity Rate" @change="handleData" />
                <el-select
                    class="select"
                    v-show="dataScaleStore.isCountyLevel"
                    style="width: 90px"
                    v-model="morbidityRate.valueType"
                    @change="handleData"
                    placeholder="Select"
                    size="small"
                >
                    <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <el-radio-group class="radio-group" v-show="morbidityRate.isChecked" v-model="morbidityRate.radio" size="small" @change="handleData">
                <el-select class="select" style="width: 160px" v-show="morbidityRate.isChecked" v-model="morbidityRate.endpoint" size="small" @change="handleEndPointChange">
                    <el-option v-for="item in morbidityRate.endpointOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="parameter">
                    <el-radio class="radio" :value="0">Risk value ({{ morbidityRate.valueType === 'max' ? 'person per 10k per year' : 'total number in county' }})</el-radio>
                    <!-- <ParameterTip
                        content="The county or census tract will be marked on the map if the risk value (census tract) or the maximum morbidity rate (county level) of PM2.5 is greater than or equal to the preset value"
                    /> -->
                </div>
                <el-slider
                    class="slider"
                    v-model="morbidityRate.currentValue"
                    v-show="morbidityRate.radio === 0"
                    show-input
                    size="small"
                    :max="morbidityRateMaxValue"
                    :min="morbidityRateMinValue"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                />
                <div class="parameter" v-if="advancedMode">
                    <el-radio class="radio advanced-model" :value="1">Top Risk Percentile (greater than or equal to %)</el-radio>
                    <!-- <ParameterTip
                     :is-advanced-model="true"
                        content="The county or census tract will be marked on the map if the top risk percentile of the morbidity rate of PM2.5 is higher than or equal to the preset value"
                    /> -->
                </div>
                <el-slider
                    class="slider"
                    v-model="morbidityRate.currentPercentRank"
                    v-show="morbidityRate.radio === 1"
                    show-input
                    size="small"
                    :max="100"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                />
            </el-radio-group>
        </div>
    </div>
</template>

<script setup>
import { pm25GeoIdSet, pm25DV_GeoIdSet, addToSetAsync } from '../../../../libs/geoid-cache';
import { dvYearOptions } from '../../../../libs/year-options';
import * as designValuesApi from '../../../../api/design-values';
import * as mortalityApi from '../../../../api/mortality-rate';
import * as morbidityApi from '../../../../api/morbidity-rate';
import { useDataScaleStore } from '@/store/data-scale';
import { useProjectYearStore } from '@/store/project-year.js';
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useAdvancedOptionStore } from '@/store/advanced-option';
const dataScaleStore = useDataScaleStore();
const projectYearStore = useProjectYearStore();
const riskRankingStore = useRiskRankingStore();
const zoomSelectorStore = useZoomSelectorStore();
const advancedOptionStore = useAdvancedOptionStore();
const advancedMode = computed(() => advancedOptionStore.advancedMode);

const isCensusTract = computed(() => {
    return dataScaleStore.dataScale == 1;
});

defineProps({
    formatTooltip: Function,
});
const year = ref(projectYearStore.projectYear);
const projectYear = computed(() => projectYearStore.projectYear);
watch(
    () => year.value,
    (val) => {
        projectYearStore.pm25DvYear = val;
    }
);
watch(
    () => advancedOptionStore.advancedMode,
    (val) => {
        mortalityRate.radio = 0;
        morbidityRate.radio = 0;
    }
);

const valueTypeOptions = ref([
    {
        value: 'max',
        label: 'Max',
    },
    {
        value: 'num',
        label: 'Number',
    },
]);
const annual = reactive({
    isChecked: true,
    currentValue: 9,
    maxValue: 20,
});
const daily = reactive({
    isChecked: true,
    currentValue: 35,
    maxValue: 70,
});
const mortalityRate = reactive({
    isChecked: false,
    radio: 0,
    currentValue: 10,
    maxValue: 15,
    currentPercentRank: 90,
    valueType: 'max',
});
const morbidityRate = reactive({
    endpoint: 1,
    endpointOptions: [
        { value: 1, label: 'ER Visits Respiratory' },
        { value: 3, label: 'HA All Respiratory' },
        { value: 5, label: 'Work Loss Days' },
        { value: 9, label: 'Asthma Cases' },
    ],
    isChecked: false,
    radio: 0,
    currentValue: 20,
    currentPercentRank: 90,
    valueType: 'max',
});
const morbidityRateMinValue = computed(() => {
    return morbidityRate.endpoint == 9 ? (morbidityRate.valueType == 'max' ? 5000 : 0) : 0;
});
const morbidityRateMaxValue = computed(() => {
    switch (morbidityRate.endpoint) {
        case 1:
            return 50;
        case 3:
            return 50;
        case 5:
            return 1500;
        case 9:
            return morbidityRate.valueType == 'max' ? 29000 : 2800000;
    }
});
const createTasks = () => {
    const tasks = [];
    let districtData = null;
    if (!riskRankingStore.isOnNation) {
        districtData = zoomSelectorStore.getZoomDetail();
    }
    if (annual.isChecked) {
        tasks.push(addToSetAsync(dataScaleStore.isCountyLevel ? pm25GeoIdSet : pm25DV_GeoIdSet, designValuesApi.getPM25Annual(year.value, annual.currentValue)));
    }

    if (daily.isChecked) {
        tasks.push(addToSetAsync(dataScaleStore.isCountyLevel ? pm25GeoIdSet : pm25DV_GeoIdSet, designValuesApi.getPM25Daily(year.value, daily.currentValue)));
    }
    if (mortalityRate.isChecked && !isCensusTract.value) {
        if (mortalityRate.radio === 0) {
            tasks.push(addToSetAsync(pm25GeoIdSet, mortalityApi.getPM25GeoIdsByMinValue(projectYear.value, 7, mortalityRate.currentValue, mortalityRate.valueType)));
        } else {
            tasks.push(
                addToSetAsync(
                    pm25GeoIdSet,
                    mortalityApi.getPM25GeoIdsByMinPercentRank(projectYear.value, 7, mortalityRate.currentPercentRank / 100, mortalityRate.valueType, districtData)
                )
            );
        }
    }

    if (morbidityRate.isChecked && !isCensusTract.value) {
        if (morbidityRate.radio === 0) {
            tasks.push(
                addToSetAsync(pm25GeoIdSet, morbidityApi.getPM25GeoIdsByMinValue(projectYear.value, morbidityRate.endpoint, morbidityRate.currentValue, morbidityRate.valueType))
            );
        } else {
            tasks.push(
                addToSetAsync(
                    pm25GeoIdSet,
                    morbidityApi.getPM25GeoIdsByMinPercentRank(
                        projectYear.value,
                        morbidityRate.endpoint,
                        morbidityRate.currentPercentRank / 100,
                        morbidityRate.valueType,
                        districtData
                    )
                )
            );
        }
    }
    return tasks;
};
const handleEndPointChange = () => {
    if (morbidityRate.endpoint === 9) {
        morbidityRate.currentValue = 10000;
    } else {
        morbidityRate.currentValue = 20;
    }
    handleData();
};
const reset = (val, desiredTile) => {
    switch (val) {
        case 0:
            Object.assign(annual, {
                isChecked: true,
                currentValue: 9,
                maxValue: 20,
            });
            Object.assign(daily, {
                isChecked: true,
                currentValue: 35,
                maxValue: 70,
            });
            Object.assign(mortalityRate, {
                isChecked: false,
                radio: 0,
                currentValue: 10,
                maxValue: 15,
                currentPercentRank: 90,
                valueType: 'max',
            });
            Object.assign(morbidityRate, {
                endpoint: 1,
                endpointOptions: [
                    { value: 1, label: 'ER Visits Respiratory' },
                    { value: 3, label: 'HA All Respiratory' },
                    { value: 5, label: 'Work Loss Days' },
                    { value: 9, label: 'Asthma Symptoms  Albuterol use' },
                ],
                isChecked: false,
                radio: 0,
                currentValue: 20,
                currentPercentRank: 90,
                valueType: 'max',
            });
            break;
        case 1:
            annual.isChecked = false;
            annual.currentValue = 9;
            daily.isChecked = false;
            daily.currentValue = 35;

            mortalityRate.currentValue = 10;
            mortalityRate.isChecked = true;
            mortalityRate.radio = 0;

            morbidityRate.currentValue = 20;
            morbidityRate.isChecked = false;
            morbidityRate.radio = 0;
            break;
        case 2:
            annual.isChecked = false;
            daily.isChecked = false;

            mortalityRate.currentPercentRank = 90;
            mortalityRate.isChecked = true;
            mortalityRate.radio = 1;

            morbidityRate.currentValue = 90;
            morbidityRate.isChecked = false;
            morbidityRate.radio = 1;
            break;
        case 3:
            annual.isChecked = false;
            daily.isChecked = false;

            mortalityRate.currentPercentRank = desiredTile;
            mortalityRate.isChecked = true;
            mortalityRate.radio = 1;

            morbidityRate.currentPercentRank = desiredTile;
            morbidityRate.isChecked = false;
            morbidityRate.radio = 1;
            break;
    }
};
const resetYear = (val) => {
    year.value = val;
};
defineExpose({ createTasks, reset, resetYear });
const emits = defineEmits(['on-data-change']);
const handleData = () => {
    emits('on-data-change');
};
const handleMortalityRateChange = () => {
    mortalityRate.currentValue = mortalityRate.valueType === 'max' ? 10 : 30;
    mortalityRate.maxValue = mortalityRate.valueType === 'max' ? 15 : 100;
    handleData();
};
</script>
