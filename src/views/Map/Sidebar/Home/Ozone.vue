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
                <el-checkbox class="checkbox" v-model="eightHour.isChecked" label="8-hour Ozone Standard (ppb)" @change="handleData" />
                <!-- <ParameterTip content="The county or census tract will be marked on the map if the 8-hour Ozone standard is greater than or equal to the preset value" /> -->
            </div>

            <el-slider
                class="slider"
                v-model="eightHour.currentValue"
                v-show="eightHour.isChecked"
                show-input
                size="small"
                :max="eightHour.maxValue"
                @change="handleData"
                :format-tooltip="formatTooltip"
            />
            <div class="detail-tips">Note: Current 8-hour NAAQS: 70 ppb</div>
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
                        content="The county or census tract will be marked on the map if the risk value or the maximum mortality rate of Ozone is greater than or equal to the preset value"
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
                    <el-radio class="radio  advanced-model" :value="1">Top Risk Percentile (greater than or equal to %)</el-radio>
                    <!-- <ParameterTip
                        :is-advanced-model="true"
                        content="The county or census tract will be marked on the map if the top risk percentile of the mortality rate of Ozone is higher than or equal to the preset value"
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
                <el-select class="select" style="width: 160px" v-show="morbidityRate.isChecked" v-model="morbidityRate.endpoint" size="small" @change="handleData">
                    <el-option v-for="item in morbidityRate.endpointOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="parameter">
                    <el-radio :value="0">Risk value ({{ morbidityRate.valueType === 'max' ? 'person per 10k per year' : 'total number in county' }})</el-radio>
                    <!-- <ParameterTip
                        content="The county or census tract will be marked on the map if the risk value or the maximum morbidity rate of Ozone is greater than or equal to the preset value"
                    /> -->
                </div>
                <el-slider
                    class="slider"
                    v-model="morbidityRate.currentValue"
                    v-show="morbidityRate.radio === 0"
                    show-input
                    size="small"
                    :max="morbidityRateMaxValue"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                />
                <div class="parameter" v-if="advancedMode">
                    <el-radio class="radio  advanced-model" :value="1">Top Risk Percentile (greater than or equal to %)</el-radio>
                    <!-- <ParameterTip
                        :is-advanced-model="true"
                        content="The county or census tract will be marked on the map if the top risk percentile of the morbidity rate of Ozone is higher than or equal to the preset value"
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
import { o3GeoIdSet, o3DV_GeoIdSet, addToSetAsync } from '../../../../libs/geoid-cache';
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
        projectYearStore.o3DvYear = val;
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
const eightHour = reactive({
    isChecked: true,
    currentValue: 70,
    maxValue: 100,
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
    endpoint: 2,
    endpointOptions: [
        { value: 2, label: 'ER Visits Respiratory' },
        { value: 4, label: 'HA All Respiratory' },
        { value: 6, label: 'School Loss Days All Cause' },
    ],
    isChecked: false,
    radio: 0,
    currentValue: 20,
    currentPercentRank: 90,
    valueType: 'max',
});
const morbidityRateMaxValue = computed(() => {
    switch (morbidityRate.endpoint) {
        case 2:
            return 50;
        case 4:
            return 50;
        case 6:
            return 20000;
    }
});
const createTasks = () => {
    const tasks = [];
    let districtData = null;
    if (!riskRankingStore.isOnNation) {
        districtData = zoomSelectorStore.getZoomDetail();
    }
    // 8-hour Ozone Standard(ppd)
    if (eightHour.isChecked) {
        tasks.push(addToSetAsync(dataScaleStore.isCountyLevel ? o3GeoIdSet : o3DV_GeoIdSet, designValuesApi.getO3EightHour(year.value, eightHour.currentValue)));
    }
    // risk 数据年份只和ProjectYear相关
    if (mortalityRate.isChecked && !isCensusTract.value) {
        if (mortalityRate.radio === 0) {
            tasks.push(addToSetAsync(o3GeoIdSet, mortalityApi.getO3GeoIdsByMinValue(projectYear.value, 8, mortalityRate.currentValue, mortalityRate.valueType)));
        } else {
            tasks.push(
                addToSetAsync(
                    o3GeoIdSet,
                    mortalityApi.getO3GeoIdsByMinPercentRank(projectYear.value, 8, mortalityRate.currentPercentRank / 100, mortalityRate.valueType, districtData)
                )
            );
        }
    }

    if (morbidityRate.isChecked && !isCensusTract.value) {
        if (morbidityRate.radio === 0) {
            tasks.push(
                addToSetAsync(o3GeoIdSet, morbidityApi.getO3GeoIdsByMinValue(projectYear.value, morbidityRate.endpoint, morbidityRate.currentValue, morbidityRate.valueType))
            );
        } else {
            tasks.push(
                addToSetAsync(
                    o3GeoIdSet,
                    morbidityApi.getO3GeoIdsByMinPercentRank(
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

const reset = (val, desiredTile) => {
    switch (val) {
        case 0:
            Object.assign(eightHour, {
                isChecked: true,
                currentValue: 70,
                maxValue: 100,
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
                endpoint: 2,
                endpointOptions: [
                    { value: 2, label: 'ER Visits Respiratory' },
                    { value: 4, label: 'HA All Respiratory' },
                    { value: 6, label: 'School Loss Days All Cause' },
                ],
                isChecked: false,
                radio: 0,
                currentValue: 20,
                currentPercentRank: 90,
                valueType: 'max',
            });
            break;
        case 1:
            eightHour.isChecked = false;
            eightHour.currentValue = 70;

            mortalityRate.currentValue = 10;
            mortalityRate.isChecked = true;
            mortalityRate.radio = 0;

            morbidityRate.currentValue = 20;
            morbidityRate.isChecked = false;
            morbidityRate.radio = 0;
            break;
        case 2:
            eightHour.isChecked = false;

            mortalityRate.currentPercentRank = 90;
            mortalityRate.isChecked = true;
            mortalityRate.radio = 1;

            morbidityRate.currentValue = 90;
            morbidityRate.isChecked = false;
            morbidityRate.radio = 1;
            break;
        case 3:
            eightHour.isChecked = false;

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
