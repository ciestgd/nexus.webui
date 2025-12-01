<template>
    <div class="sub-container">
        <div class="checkbox-container">
            <div class="parameter">
                <el-checkbox class="checkbox" v-model="isValueChecked" label="Age Demographics Indicator (2023)" @change="handleData" />
                <ParameterTip content="Percentage of the population in a given age category within a geographic boundary" />
            </div>
            <el-select class="select" v-show="isValueChecked" v-model="ejValueType" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in ejOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-radio-group class="radio-group" v-show="isValueChecked" v-model="percentRadio" size="small" @change="handleData">
                <div class="parameter">
                    <el-radio class="radio" :value="0">Percentage (%)</el-radio>
                </div>
                <div class="slider-box" v-show="percentRadio === 0">
                    <el-slider
                        class="slider"
                        v-model="currentValue"
                        v-show="isValueChecked"
                        show-input
                        size="small"
                        :max="maxValue"
                        @change="handleData"
                        :format-tooltip="formatTooltip"
                    />
                </div>
            </el-radio-group>
        </div>
    </div>
</template>

<script setup>
import { ejGeoIdSet, addToSetAsync } from '../../../../libs/geoid-cache';
// import demographicCensusTractData from '@/libs/demographicData/censusTract.js';
// import demographicCountyData from '@/libs/demographicData/county.js';
import * as AmericanCommunitySurveyApi from '../../../../api/american-community-survey';
import { useSidebarStore } from '@/store/sidebar';
import { useDataScaleStore } from '@/store/data-scale';
const dataScaleStore = useDataScaleStore();

const sidebarStore = useSidebarStore();
defineProps({
    formatTooltip: Function,
});

const isValueChecked = ref(false);
const currentValue = ref(50);
const percentRadio = ref(0);
const currentPercentRank = ref(90);
const maxValue = ref(100);
const ejValueType = ref('under5_PCT');
const ejPercentRankType = ref('under5_PCT');
const ejOptions = ref([
    { value: 'under5_PCT', label: 'Under 5 Years' },
    { value: 'over62_PCT', label: '62 Year and Older' },
]);

const createTasks = () => {
    const tasks = [];
    let dataScaleType = dataScaleStore.dataScaleType;
    if (isValueChecked.value) {
        let params = {};
        if (ejValueType.value == 'under5_PCT') {
            params.min_under5_PCT = currentValue.value;
        } else {
            params.min_over62_PCT = currentValue.value;
        }
        tasks.push(
            addToSetAsync(ejGeoIdSet, dataScaleType === 'County' ? AmericanCommunitySurveyApi.getAgeDataCounty(params) : AmericanCommunitySurveyApi.getAgeDataTract(params))
        );
    }
    return tasks;
};
const handleDemographicData = (data) => {
    return new Promise(async (resolve) => {
        await Object.keys(data).forEach((key) => {
            let value = data[key][ejValueType.value];
            if (value != 'NaN' && value >= currentValue.value) {
                ejGeoIdSet.add(key);
            }
        });
        resolve();
    });
};
const reset = (val, desiredTile) => {
    switch (val) {
        case 0:
            isValueChecked.value = false;
            currentValue.value = 50;
            currentPercentRank.value = 90;
            ejValueType.value = 'under5_PCT';
            ejPercentRankType.value = 'under5_PCT';
            break;
        case 1:
            currentValue.value = 50;
            isValueChecked.value = false;
            break;
        case 2:
            currentPercentRank.value = 90;
            isValueChecked.value = false;
            break;
        case 3:
            currentPercentRank.value = desiredTile;
            isValueChecked.value = false;
            break;
    }
};

defineExpose({ createTasks, reset });

const emits = defineEmits(['on-data-change']);
const ejSelect = computed(() => isValueChecked.value);
watch(
    () => ejSelect.value,
    (val) => {
        sidebarStore.ejSelect = val;
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
.radio-group {
    .slider-box {
        width: 100%;
        display: flex;
        align-items: center;
        margin-top: 4px;
    }
}
</style>
