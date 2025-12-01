<template>
    <div class="home">
        <div class="configuration-content" id="configurationDivContent">
            <!-- <div class="selector">
                <span class="label">Project Year:</span>
                <el-select v-model="projectYearStore.projectYear" size="small" style="width: 66px">
                    <el-option v-for="item in dataYearOptions" :key="item" :label="item" :value="item" />
                </el-select>
            </div> -->
            <div class="selector">
                <span class="label">Data Scale:</span>
                <el-select v-model="dataScaleStore.dataScale" size="small" style="width: 108px">
                    <el-option v-for="item in dataScaleStore.options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </div>
            <div class="configuration-tips">Data selected below will be displayed on the map if greater than or equal to the chosen value.</div>
            <PercentileRank v-if="advancedMode" />
        </div>
        <el-collapse v-model="activeNames" class="collapse">
            <div id="pmAndOzoneDivContent">
                <el-collapse-item :name="0">
                    <template #title>
                        <el-tooltip effect="customized" :content="getTooltip(activeNames.indexOf(0) === -1)"><span class="title">PM2.5</span></el-tooltip>
                    </template>
                    <PM25 ref="pm25Ref" :format-tooltip="formatTooltip" @on-data-change="handleData" />
                </el-collapse-item>
                <el-collapse-item :name="1" style="margin-bottom: 0px">
                    <template #title>
                        <el-tooltip effect="customized" :content="getTooltip(activeNames.indexOf(1) === -1)"><span class="title">Ozone</span></el-tooltip>
                    </template>
                    <Ozone ref="ozoneRef" :format-tooltip="formatTooltip" @on-data-change="handleData" />
                </el-collapse-item>
            </div>
            <el-collapse-item :name="2" id="toxicsDivContent">
                <template #title>
                    <el-tooltip effect="customized" :content="getTooltip(activeNames.indexOf(2) === -1)">
                        <span class="title">Air Toxics </span>
                    </el-tooltip>
                </template>
                <Toxics ref="toxicsRef" :format-tooltip="formatTooltip" @on-data-change="handleData" />
            </el-collapse-item>
            <el-collapse-item :name="3">
                <template #title>
                    <el-tooltip effect="customized" :content="getTooltip(activeNames.indexOf(3) === -1)"><span class="title">Age Demographics</span></el-tooltip>
                </template>
                <Demographic ref="demographicRef" :format-tooltip="formatTooltip" @on-data-change="handleData" />
            </el-collapse-item>
            <!-- <el-collapse-item :name="3">
                <template #title>
                    <el-tooltip effect="customized" :content="getTooltip(activeNames.indexOf(3) === -1)"><span class="title">Demographics</span></el-tooltip>
                </template>
                <EJ ref="ejRef" :format-tooltip="formatTooltip" @on-data-change="handleData" />
            </el-collapse-item> -->
            <!-- <el-collapse-item :name="4">
                <template #title>
                    <el-tooltip effect="customized" :content="getTooltip(activeNames.indexOf(4) === -1)"><span class="title">Heat Risk</span></el-tooltip>
                </template>
                <HeatIndex ref="heatIndexRef" :format-tooltip="formatTooltip" @on-data-change="handleData" />
            </el-collapse-item> -->
        </el-collapse>
        <el-dropdown @command="handleReset" class="reset-dropdow" size="large" id="resetDivContent">
            <el-button type="primary">
                Reset<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item :command="0">Set all to default settings</el-dropdown-item>
                    <el-dropdown-item :command="1">Set all to risk-based default value</el-dropdown-item>
                    <!-- <el-dropdown-item :command="2">Set all to risk-based default %ile</el-dropdown-item> -->
                    <el-dropdown-item :command="3" v-if="advancedMode" class="advanceMode-item">Set all to risk-based desired %ile</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup>
import PM25 from './PM25.vue';
import Ozone from './Ozone.vue';
import Toxics from './Toxics.vue';
import Demographic from './Demographic.vue';
// import EJ from './EJ.vue';
// import HeatIndex from './HeatIndex.vue';

import PercentileRank from './PercentileRank.vue';

import { setOverlayerStyle } from '../../../../libs/map/layers/overlayer';
import { clearAllSet } from '../../../../libs/geoid-cache';
import myprompt from '@/libs/myprompt';
import { ArrowDown } from '@element-plus/icons-vue';
import { useSidebarStore } from '@/store/sidebar';
import { useDataScaleStore } from '@/store/data-scale';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
import { useProjectYearStore } from '@/store/project-year.js';
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useAdvancedOptionStore } from '@/store/advanced-option';
const projectYearStore = useProjectYearStore();
const sidebarStore = useSidebarStore();
const dataScaleStore = useDataScaleStore();
const zoomSelectorStore = useZoomSelectorStore();
const riskRankingStore = useRiskRankingStore();
const advancedOptionStore = useAdvancedOptionStore();
const advancedMode = computed(() => advancedOptionStore.advancedMode);
const resetDropdowDisplay = computed(() => (sidebarStore.collapse ? 'none' : 'inline-flex'));

const getTooltip = (collapse) => (collapse ? 'Expand this panel' : 'Collapse this panel');

const pm25Ref = ref();
const ozoneRef = ref();
const toxicsRef = ref();
const demographicRef = ref();
// const ejRef = ref();
// const heatIndexRef = ref();
// const dataYearOptions = [2017, 2018, 2019];
const formatTooltip = (val) => {
    return val + '+';
};

const activeNames = ref([0, 1, 2, 3, 4]);

const requestData = async () => {
    await Promise.all([
        ...pm25Ref.value.createTasks(),
        ...ozoneRef.value.createTasks(),
        ...toxicsRef.value.createTasks(),
        ...demographicRef.value.createTasks(),
        // ...ejRef.value.createTasks(),
        // ...heatIndexRef.value.createTasks(),
    ]);
};

const handleData = async () => {
    clearAllSet();
    await requestData();
    setOverlayerStyle();
};
onMounted(handleData);

watch(
    () => zoomSelectorStore.model,
    () => {
        if (!riskRankingStore.isOnNation) {
            handleData();
        } else {
            setOverlayerStyle();
        }
    }
);
watch(() => dataScaleStore.dataScale, handleData);
watch(
    () => projectYearStore.projectYear,
    (val) => {
        pm25Ref.value.resetYear(val);
        ozoneRef.value.resetYear(val);
        toxicsRef.value.resetYear(val);
        handleData();
    }
);
watch(() => riskRankingStore.riskRankingType, handleData);
watch(
    () => sidebarStore.isSetDefault,
    (val) => {
        if (val) {
            handleReset(0);
            sidebarStore.isSetDefault = false;
        }
    }
);
watch(
    () => advancedOptionStore.advancedMode,
    async (val) => {
        await nextTick();
        handleData();
    }
);

const handleReset = async (val) => {
    let desiredTile;
    if (val === 3) {
        desiredTile = parseFloat(
            await myprompt({
                inputType: 'number',
                message: 'Please input a risk-based desired %ile value.',
                inputValidator: (value) => {
                    if (isNaN(value) || value < 0 || value > 100) {
                        return 'Please input a risk-based desired %ile value from 0 to 100.';
                    }
                    return true;
                },
                // inputValue: 90,
            })
        );
    }
    pm25Ref.value.reset(val, desiredTile);
    ozoneRef.value.reset(val, desiredTile);
    toxicsRef.value.reset(val, desiredTile);
    demographicRef.value.reset(val, desiredTile);
    // ejRef.value.reset(val, desiredTile);
    // heatIndexRef.value.reset(val, desiredTile);
    await handleData();
};
</script>

<style scoped lang="scss">
.home {
    padding: 0 12px;
    margin-bottom: 48px;
    .configuration-content {
        box-sizing: border-box;
        padding-top: 8px;
        margin-bottom: 10px;
        .selector {
            width: 100%;
            display: inline-flex;
            align-items: center;
            .label {
                font-size: 18px;
                font-weight: bold;
                width: 100px;
            }
            .el-select {
                flex: 1;
                margin-left: 8px;
            }
        }
        .selector + .selector {
            margin-top: 10px;
        }
        .configuration-tips {
            margin-top: 5px;
            font-size: 14px;
        }
    }
    .collapse {
        border-top: 2px solid black;
        .title {
            width: 100%;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
            padding-right: 2px;
        }
        :deep(.el-collapse-item) {
            --el-collapse-header-height: 32px;
            --el-collapse-border-color: black;
        }
        :deep(.el-collapse-item__content) {
            padding-bottom: 4px;
        }

        :deep(.sub-container) {
            .sub-title {
                font-size: 14px;
                font-weight: 700;
                margin-left: 2px;
            }
            .flex-box {
                display: flex;
                align-items: center;
            }
            .select-container {
                margin-left: auto;
                .label {
                    font-size: 12px;
                }

                .select {
                    margin-left: 4px;
                }
            }
            .checkbox-container {
                margin-left: 4px;
                .checkbox {
                    --el-checkbox-text-color: black;
                    --el-checkbox-font-size: 13px;
                    --el-checkbox-input-border: 1px solid green;
                }
                .parameter {
                    display: flex;
                    align-items: center;
                    .checkbox {
                        margin-right: 3px;
                    }
                    .el-radio {
                        margin-right: 3px;
                    }
                    .advanced-model {
                        .el-radio__label {
                            color: var(--advanced-color);
                        }
                    }
                }
                .slider {
                    margin-left: 8px;
                    width: calc(100% - 8px);
                    .el-slider__bar {
                        background-color: var(--el-slider-runway-bg-color);
                    }
                    .el-slider__runway {
                        background-color: var(--el-slider-main-bg-color);
                    }
                }
                .radio-group {
                    margin-left: 2px;
                    .radio {
                        --el-radio-text-color: black;
                        --el-radio-input-border: 1px solid green;
                    }
                }
                .detail-tips {
                    font-size: 12px;
                }
            }
        }
    }
    .reset-dropdow {
        display: v-bind(resetDropdowDisplay);
        position: fixed;
        bottom: 4px;
        left: 10px;
        z-index: 1;
        opacity: 0.9;
        width: 336px;
        :deep(.el-button) {
            font-size: 20px;
            width: 100%;
            background: #409eff;
        }
    }
}
.air-toxics-title {
    display: flex;
    align-items: center;
}
</style>
<style lang="scss">
.advanceMode-item {
    color: var(--advanced-color) !important;
}
</style>
