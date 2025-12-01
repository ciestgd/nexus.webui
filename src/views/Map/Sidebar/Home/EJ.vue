<template>
    <div class="sub-container">
        <div class="select-container">
            <span class="label">Data Year: </span>
            <el-select class="select" style="width: 100px" v-model="year" placeholder="Select" size="small" @change="handleYearChange">
                <el-option v-for="item in [2021, 2023]" :key="item" :label="item" :value="item" />
            </el-select>
        </div>
        <div class="checkbox-container">
            <div class="parameter">
                <el-checkbox class="checkbox" v-model="isValueChecked" label="Age Demographics Indicator" @change="handleData" />
                <!-- <ParameterTip content="The county or census tract will be marked on the map if the Demographics indicator is greater than or equal to the preset value" /> -->
            </div>
            <el-select class="select" v-show="isValueChecked" v-model="ejValueType" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in ejOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-slider class="slider" v-model="currentValue" v-show="isValueChecked" show-input size="small" :max="maxValue" @change="handleData" :format-tooltip="formatTooltip" />
        </div>
        <!-- <div class="checkbox-container">
            <div class="parameter">
                <el-checkbox class="checkbox" v-model="isPercentRankChecked" label="Top Percentile (greater than or equal to %)" @change="handleData" />
            </div>
            <el-select class="select" v-show="isPercentRankChecked" v-model="ejPercentRankType" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in ejOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        </div> -->
    </div>
</template>

<script setup>
import { ejGeoIdSet, addToSetAsync } from '../../../../libs/geoid-cache';
import * as api from '../../../../api/ej-demographic';
import { useSidebarStore } from '@/store/sidebar';
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useProjectYearStore } from '@/store/project-year';
const riskRankingStore = useRiskRankingStore();
const zoomSelectorStore = useZoomSelectorStore();
const sidebarStore = useSidebarStore();
const projectYearStore = useProjectYearStore();
defineProps({
    formatTooltip: Function,
});

const year = ref(projectYearStore.ejYear);
const isValueChecked = ref(false);
const isPercentRankChecked = ref(false);
const currentValue = ref(50);
const currentPercentRank = ref(90);
const maxValue = ref(100);
const ejValueType = ref('Under5_PCT');
const ejPercentRankType = ref('Under5_PCT');
const ejOptions = ref([
    // { value: 'DemographicIndex', label: 'Demographic index' },
    // { value: 'LowIncome_PCT', label: '% low income' },
    // { value: 'PeopleOfColor_PCT', label: '% people of color' },
    // { value: 'Under5_PCT', label: '% under age 5' },
    // { value: 'Over64_PCT', label: '% over age 64' },
    // { value: 'LESSHS_PCT', label: '% less than high school education' },
    // { value: 'LINGISO_PCT', label: '% linguistically isolated' },
    // { value: 'PRE1960_PCT', label: 'Lead paint' },

    { value: 'Under5_PCT', label: 'Under 5 Years' },
    { value: 'Over64_PCT', label: '64 Years and Over' },
]);

const createTasks = () => {
    const tasks = [];
    let districtData = null;
    if (!riskRankingStore.isOnNation) {
        districtData = zoomSelectorStore.getZoomDetail();
    }
    if (isValueChecked.value) {
        tasks.push(addToSetAsync(ejGeoIdSet, api.getGeoIdsByMinValue(year.value, ejValueType.value, currentValue.value / 100)));
    }

    if (isPercentRankChecked.value) {
        tasks.push(addToSetAsync(ejGeoIdSet, api.getGeoIdsByMinPercentRank(year.value, ejPercentRankType.value, currentPercentRank.value / 100, districtData)));
    }

    return tasks;
};
const handleYearChange = () => {
    projectYearStore.ejYear = year.value;
    handleData();
};
const reset = (val, desiredTile) => {
    switch (val) {
        case 0:
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            currentValue.value = 50;
            currentPercentRank.value = 90;
            ejValueType.value = 'DemographicIndex';
            ejPercentRankType.value = 'DemographicIndex';
            break;
        case 1:
            currentValue.value = 50;
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            break;
        case 2:
            currentPercentRank.value = 90;
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            break;
        case 3:
            currentPercentRank.value = desiredTile;
            isValueChecked.value = false;
            isPercentRankChecked.value = false;
            break;
    }
};

defineExpose({ createTasks, reset });

const emits = defineEmits(['on-data-change']);
const ejSelect = computed(() => isValueChecked.value || isPercentRankChecked.value);
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
</style>
