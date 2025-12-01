<template>
    <div class="sub-container">
        <div class="select-container">
            <!-- <span class="label">Data Year: {{ year }}</span> -->
            <!-- <el-select class="select" style="width: 100px" v-model="year" placeholder="Select" size="small" @change="handleData">
                <el-option v-for="item in dvYearOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select> -->
        </div>
        <div class="flex-box">
            <span class="sub-title">Risk :</span>
            <ParameterTip
                content="This data comes from 2020 AirToxScreen, which displays the block-level cancer risk. However, Nexus is displaying the maximum cancer risk (calculated at the block-level) within the county or census tract."
            />
        </div>

        <div class="checkbox-container">
            <el-checkbox class="checkbox" v-model="cancerRisk.isChecked" label="Maximum Block-level Cancer Risk (2020)" @change="handleData" />
            <div v-show="cancerRisk.isChecked">
                <el-cascader
                    placeholder="Select"
                    v-model="cancerRisk.pollutantType"
                    size="small"
                    :options="pollutantTypeOptions"
                    @change="handleData"
                    :show-all-levels="false"
                    :props="cascaderProps"
                    filterable
                    style="width: 220px; margin-bottom: 4px"
                />
            </div>

            <el-radio-group class="radio-group" v-show="cancerRisk.isChecked" v-model="cancerRisk.radio" size="small" @change="handleData">
                <div class="parameter">
                    <el-radio class="radio" :value="0">Risk value (x-in-1 million)</el-radio>
                    <!-- <ParameterTip
                        content="The county or census tract will be marked on the map if the cancer risk value of air toxics is greater than or equal to the preset value"
                    /> -->
                </div>
                <!-- <el-slider
                    class="slider"
                    v-model="cancerRisk.currentValue"
                    v-show="cancerRisk.radio === 0"
                    show-input
                    size="small"
                    :max="cancerRisk.maxValue"
                    @change="handleRiskValue"
                    :step="currentValueStep"
                    :format-tooltip="formatTooltip"
                /> -->
                <div class="slider-box" v-show="cancerRisk.radio === 0">
                    <el-slider
                        class="slider"
                        v-model="cancerRisk.currentValue"
                        size="small"
                        :max="cancerRisk.maxValue"
                        @change="handleRiskValue"
                        :step="currentValueStep"
                        :format-tooltip="formatTooltip"
                    />
                    <div class="input-box">
                        <span class="input-btn input-btn-left" @click="handleCancerRiskValue('reduce')" :class="[cancerRisk.currentValue == 0 ? 'disabled-btn' : '']">
                            <Icon class="icon-button icon" name="minus" color="#606266" size="11" />
                        </span>
                        <el-input-number
                            class="input-content"
                            v-model="cancerRisk.currentValue"
                            size="small"
                            :max="cancerRisk.maxValue"
                            @change="handleRiskValue"
                            :step="currentValueStep"
                            :format-tooltip="formatTooltip"
                        />
                        <span
                            class="input-btn input-btn-right"
                            @click="handleCancerRiskValue('add')"
                            :class="[cancerRisk.currentValue == cancerRisk.maxValue ? 'disabled-btn' : '']"
                        >
                            <Icon class="icon-button icon" color="#606266" name="plus" size="11" />
                        </span>
                    </div>
                </div>
                <!-- <el-radio class="radio" :label="1">Top Risk Percentile (greater than or equal to %)</el-radio>
                <el-slider
                    class="slider"
                    v-model="cancerRisk.currentPercentRank"
                    v-show="cancerRisk.radio === 1"
                    show-input
                    size="small"
                    :max="100"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                /> -->
            </el-radio-group>
        </div>
        <div class="checkbox-container">
            <el-checkbox class="checkbox" v-model="hazardIndex.isChecked" @change="handleData">
                <div class="parameter">
                    Maximum Block-level Hazard Index (2020)
                    <ParameterTip content="Refer to User Guide for information on the non-cancer hazard index. For 2020, only respiratory HI is available." />
                </div>
            </el-checkbox>
            <el-radio-group class="radio-group" v-show="hazardIndex.isChecked" v-model="hazardIndex.radio" size="small" @change="handleData">
                <div class="parameter">
                    <el-radio class="radio" :value="0">Hazard Index (HI)</el-radio>
                    <!-- <ParameterTip
                        content="The county or census tract will be marked on the map if the non-cancer Maximum Block-Level Hazard Index of air toxics is greater than or equal to the preset value"
                    /> -->
                </div>
                <!-- <el-slider
                    class="slider"
                    v-model="hazardIndex.currentValue"
                    v-show="hazardIndex.radio === 0"
                    show-input
                    size="small"
                    :max="hazardIndex.maxValue"
                    :step="hazardIndex.currentValue < 1 ? 0.1 : 1"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                /> -->
                <div class="slider-box" v-show="hazardIndex.radio === 0">
                    <el-slider
                        class="slider"
                        v-model="hazardIndex.currentValue"
                        size="small"
                        :max="hazardIndex.maxValue"
                        @input="handleHazardIndexData"
                        @change="handleData"
                        :step="hazardIndexStep"
                        :format-tooltip="formatTooltip"
                    />
                    <div class="input-box">
                        <span class="input-btn input-btn-left" @click="handleHazardIndex('reduce')" :class="[cancerRisk.currentValue == 0 ? 'disabled-btn' : '']">
                            <Icon class="icon-button icon" name="minus" color="#606266" size="11" />
                        </span>
                        <el-input-number
                            class="input-content"
                            v-model="hazardIndex.currentValue"
                            size="small"
                            :max="hazardIndex.maxValue"
                            @change="handleHazardIndexData"
                            :step="hazardIndexStep"
                            :format-tooltip="formatTooltip"
                        />
                        <span class="input-btn input-btn-right" @click="handleHazardIndex('add')" :class="[hazardIndex.currentValue == hazardIndex.maxValue ? 'disabled-btn' : '']">
                            <Icon class="icon-button icon" color="#606266" name="plus" size="11" />
                        </span>
                    </div>
                </div>
                <!-- <el-radio class="radio" :label="1">Top Maximum Block-Level Hazard Index Percentile (%)</el-radio>
                <el-slider
                    class="slider"
                    v-model="hazardIndex.currentPercentRank"
                    v-show="hazardIndex.radio === 1"
                    show-input
                    size="small"
                    :max="100"
                    @change="handleData"
                    :format-tooltip="formatTooltip"
                /> -->
            </el-radio-group>
        </div>
    </div>
</template>

<script setup>
import { toxicsGeoIdSet, addToSetAsync } from '../../../../libs/geoid-cache';
import * as cancerRiskApi from '../../../../api/cancer-risk';
import * as hazardIndexApi from '../../../../api/hazard-index';
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useProjectYearStore } from '@/store/project-year';
import { useAirToxicStore } from '@/store/air-toxic';
const riskRankingStore = useRiskRankingStore();
const zoomSelectorStore = useZoomSelectorStore();
const projectYearStore = useProjectYearStore();
const airToxicStore = useAirToxicStore();
defineProps({
    formatTooltip: Function,
});
const cascaderProps = ref({
    checkStrictly: true,
    emitPath: false,
});
const currentValueStep = ref(10);
const hazardIndexStep = ref(1);
// 没有2017年数据
// const year = 2018;
// const year = ref(2018);
// const year = ref(projectYearStore.projectYear);
const year = ref(2020);
const hazardIndexYear = ref(2020);
// watch(
//     () => projectYearStore.projectYear,
//     (val) => {
//         //if (val === 2017) {
//         //  year.value = 2018;
//         //} else {
//         console.log('year', val);
//         year.value = val;
//         //}
//     }
// );

// const pollutantType = ref('total');
const cancerRisk = reactive({
    isChecked: true,
    radio: 0,
    currentValue: 50,
    maxValue: 100,
    currentPercentRank: 90,
    pollutantType: 'total',
});
const hazardIndex = reactive({
    isChecked: false,
    radio: 0,
    currentValue: 1,
    maxValue: 3,
    currentPercentRank: 90,
});
const pollutantTypeOptions = ref([
    { value: 'total', label: 'Total' },
    {
        value: 'Gas_VOC_HAPs',
        label: 'GAS & VOC HAPs',
        children: [
            { value: 'Acetaldehyde', label: 'ACETALD' },
            { value: 'Acetamide', label: 'ACETAMIDE' },
            { value: 'Acrylamide', label: 'ACRYLMID' },
            { value: 'Acrylonitrile', label: 'ACRYLONITRL' },
            { value: 'F_2_Acetylaminofluorene', label: 'ACTYALFLUR2' },
            { value: 'Allyl_Chloride', label: 'ALLYLCHLORD' },
            { value: 'Aniline', label: 'ANILINE' },
            { value: 'Benzene', label: 'BENZENE' },
            { value: 'Benzidine', label: 'BENZIDINE' },
            { value: 'Benzoapyrene', label: 'BENZOAPYRENE' },
            { value: 'Benzyl_Chloride', label: 'BENZYLCHLO' },
            { value: 'Bis_Chloromethyl__Ether', label: 'BISCHLROME' },
            { value: 'Bromoform', label: 'BROMOFORM' },
            { value: 'Bis_2_Ethylhexyl_Phthalate__Dehp_', label: 'BS2TYLHXYLP' },
            { value: 'F_1_3_Butadiene', label: 'BUTADIE' },
            { value: 'Carbon_Tetrachloride', label: 'CARBONTET' },
            { value: 'Chlordane', label: 'CHLORDANE' },
            { value: 'Chloroprene', label: 'CHLOROPRENE' },
            { value: 'Chlorobenzilate', label: 'CHLROBZLAT' },
            { value: 'Ethylene_Dichloride__1_2_Dichloroethane_', label: 'CL2_C2_12' },
            { value: 'Trichloroethylene', label: 'CL3_ETHE' },
            { value: 'Coke_Oven_Emissions', label: 'COKEOVEN' },
            { value: 'F_1_2_Dibromo_3_Chloropropane', label: 'DIBRM3CHLPR' },
            { value: 'F_3_3P_Dichlorobenzidine', label: 'DICHLBZD33P' },
            { value: 'F_1_4_Dichlorobenzene', label: 'DICHLRBNZN' },
            { value: 'Dichloroethyl_Ether__Bis_2_Chloroethyl_Ether_', label: 'DICHLROETET' },
            { value: 'F_1_3_Dichloropropene', label: 'DICLPRO13' },
            { value: 'F_4_Dimethylaminoazobenzene', label: 'DIMTHYLAMAZ' },
            { value: 'F_2_4_Dinitrotoluene', label: 'DINITOTOL24' },

            { value: 'F_1_2_Diphenylhydrazine', label: 'DIPYLHYZ12' },
            { value: 'Epichlorohydrin', label: 'EPICHLORO' },
            { value: 'Ethylene_Dibromide__Dibromoethane_', label: 'ETHDIBROM' },
            { value: 'Ethylidene_Dichloride__1_1_Dichloroethane_', label: 'ETHIDDICHLD' },
            { value: 'Ethylene_Thiourea', label: 'ETHTHUREA' },
            { value: 'Ethylbenzene', label: 'ETHYLBENZ' },
            { value: 'Ethyl_Carbamate__Urethane__Chloride__Chloroethane_', label: 'ETHYLCARBA' },
            { value: 'Ethylene_Oxide', label: 'ETOX' },
            { value: 'Formaldehyde', label: 'FORMALD' },
            { value: 'Heptachlor', label: 'HEPTACHLOR' },
            { value: 'Hexachlorobutadiene', label: 'HEXCHLRBT' },
            { value: 'Hexachlorobenzene', label: 'HEXCHLROBZ' },
            { value: 'F_1_2_3_4_5_6_Hexachlorocyclyhexane', label: 'HXCCL123456' },
            { value: 'F_4_4P_Methylene_Bis_2_Chloroaniline_', label: 'MB2CLRAN44P' },
            { value: 'Methyl_Tert_Butyl_Ether', label: 'MTBE' },
            { value: 'F_4_4P_Methylenedianiline', label: 'MTHYDIAN44P' },
            { value: 'Naphthalene', label: 'NAPHTH' },
            { value: 'Nitrobenzene', label: 'NITROBNZNE' },
            { value: 'F_2_Nitropropane', label: 'NITROPROPA2' },
            { value: 'N_Nitrosodimethylamine', label: 'NNITROSDIM' },
            { value: 'N_Nitrosomorpholine', label: 'NNITROSMPH' },
            { value: 'O_Toluidine', label: 'O_TOLUIDINE' },
            { value: 'F_1_4_Dioxane', label: 'P_DIOXANE' },
            { value: 'Pahpom', label: 'PAHPOM' },
            { value: 'Polychlorinated_Biphenyls__Aroclors_', label: 'PCB' },
            { value: 'Pentachlorophenol', label: 'PNTCLPHENOL' },
            { value: 'F_1_3_Propane_Sultone', label: 'PROPNESLT13' },
            { value: 'Propylene_Oxide', label: 'PROPYLENEOX' },
            { value: 'F_2_4_Toluene_Diisocyanate', label: 'TOL_DIIS' },
            { value: 'F_2_4_Toluene_Diamine', label: 'TOLDIAM24' },
            { value: 'Toxaphene__Chlorinated_Camphene_', label: 'TOXAPHENE' },
            { value: 'F_2_4_6_Trichlorophenol', label: 'TRCLPHNL246' },
            { value: 'F_1_1_2_Trichloroethane', label: 'TTCLE1122' },
            // { value: 'Hydrazine', label: 'HYDRAZINE' },
            { value: 'Methylene_Chloride', label: 'MECL' },
            { value: 'Tetrachloroethylene', label: 'PERC' },
            { value: 'Vinyl_Bromide', label: 'VINYLBROM' },
            { value: 'Vinyl_Chloride', label: 'VINYCHLRI' },
        ],
    },
    {
        value: 'Heavy_Metal_HAPs',
        label: 'Heavy Metal HAPs',
        children: [
            { value: 'Arsenic_Compounds_Inorganic_Including_Arsine_', label: 'ARSENIC' },
            { value: 'Beryllium_Compounds', label: 'BERYLLIUM' },
            { value: 'Cadmium_Compounds', label: 'CADMIUM' },
            { value: 'Chromium_Vi__Hexavalent_', label: 'CHROMHEX' },
            { value: 'Nickel_Compounds', label: 'NICKEL' },
        ],
    },
]);
const handleAirToxicBlock = () => {
    airToxicStore.cancerRiskChecked = cancerRisk.isChecked;
    airToxicStore.cancerRiskValue = cancerRisk.currentValue;
    airToxicStore.hazardIndexChecked = hazardIndex.isChecked;
    airToxicStore.hazardIndexValue = hazardIndex.currentValue;
    airToxicStore.cancerRiskPollutantType = cancerRisk.pollutantType;
    if (airToxicStore.selectGeoId) {
        airToxicStore.getBlockGeoIds();
    }
};
const handleRiskValue = () => {
    if (cancerRisk.currentValue > 10) {
        currentValueStep.value = 10;
        cancerRisk.currentValue = Math.floor(cancerRisk.currentValue / 10) * 10;
    } else {
        currentValueStep.value = 1;
    }
    handleData();
};
const handleCancerRiskValue = (type) => {
    if (cancerRisk.currentValue == 10) {
        if (type === 'add') {
            currentValueStep.value = 10;
        } else {
            currentValueStep.value = 1;
        }
    }
    if (type === 'add') {
        if (cancerRisk.currentValue === cancerRisk.maxValue) {
            return;
        }

        cancerRisk.currentValue += currentValueStep.value;
    } else {
        if (cancerRisk.currentValue === 0) {
            return;
        }
        cancerRisk.currentValue -= currentValueStep.value;
    }
    handleRiskValue();
};
const createTasks = () => {
    const tasks = [];
    let districtData = null;
    if (!riskRankingStore.isOnNation) {
        districtData = zoomSelectorStore.getZoomDetail();
    }
    if (cancerRisk.isChecked) {
        if (cancerRisk.radio === 0) {
            let currentValue = cancerRisk.currentValue;
            // if (cancerRisk.pollutantType === 'total') {
            //     currentValue = currentValue < 10 ? currentValue : currentValue - 5;
            // }
            tasks.push(addToSetAsync(toxicsGeoIdSet, cancerRiskApi.getGeoIdsByMinValue(year.value, currentValue, cancerRisk.pollutantType)));
        } else {
            tasks.push(
                addToSetAsync(toxicsGeoIdSet, cancerRiskApi.getGeoIdsByMinPercentRank(year.value, cancerRisk.currentPercentRank / 100, cancerRisk.pollutantType, districtData))
            );
        }
    }

    if (hazardIndex.isChecked) {
        if (hazardIndex.radio === 0) {
            tasks.push(addToSetAsync(toxicsGeoIdSet, hazardIndexApi.getGeoIdsByMinValue(hazardIndexYear.value, hazardIndex.currentValue)));
        } else {
            tasks.push(addToSetAsync(toxicsGeoIdSet, hazardIndexApi.getGeoIdsByMinPercentRank(hazardIndexYear.value, hazardIndex.currentPercentRank / 100, districtData)));
        }
    }

    return tasks;
};
const reset = (val, desiredTile) => {
    switch (val) {
        case 0:
            Object.assign(cancerRisk, {
                isChecked: true,
                radio: 0,
                currentValue: 50,
                maxValue: 100,
                currentPercentRank: 90,
                pollutantType: 'total',
            });
            Object.assign(hazardIndex, {
                isChecked: false,
                radio: 0,
                currentValue: 1,
                maxValue: 3,
                currentPercentRank: 90,
            });
            break;
        case 1:
            cancerRisk.currentValue = 50;
            cancerRisk.isChecked = true;
            cancerRisk.radio = 0;
            cancerRisk.pollutantType = 'total';

            hazardIndex.currentValue = 1;
            hazardIndex.isChecked = false;
            hazardIndex.radio = 0;
            break;
        case 2:
            cancerRisk.currentPercentRank = 90;
            cancerRisk.isChecked = true;
            cancerRisk.radio = 1;
            cancerRisk.pollutantType = 'total';

            hazardIndex.currentPercentRank = 90;
            hazardIndex.isChecked = false;
            hazardIndex.radio = 1;
            break;
        case 3:
            cancerRisk.currentPercentRank = desiredTile;
            cancerRisk.isChecked = true;
            cancerRisk.radio = 1;
            cancerRisk.pollutantType = 'total';

            hazardIndex.currentPercentRank = desiredTile;
            hazardIndex.isChecked = false;
            hazardIndex.radio = 1;
            break;
    }
};
const resetYear = (val) => {
    year.value = val;
};
defineExpose({ createTasks, reset, resetYear });

const emits = defineEmits(['on-data-change']);
const handleData = () => {
    handleAirToxicBlock();
    emits('on-data-change');
};
const roundFun = (value, n) => {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
};
const handleHazardIndexData = () => {
    if (hazardIndex.currentValue > 1) {
        hazardIndexStep.value = 1;
        hazardIndex.currentValue = parseInt(hazardIndex.currentValue);
    } else {
        hazardIndexStep.value = 0.1;
        hazardIndex.currentValue = roundFun(hazardIndex.currentValue, 1);
    }
};

const handleHazardIndex = (type) => {
    if (hazardIndex.currentValue == 1) {
        if (type === 'add') {
            hazardIndexStep.value = 1;
        } else {
            hazardIndexStep.value = 0.1;
        }
    }
    if (type === 'add') {
        if (hazardIndex.currentValue === hazardIndex.maxValue) {
            return;
        }

        hazardIndex.currentValue += hazardIndexStep.value;
    } else {
        if (hazardIndex.currentValue === 0) {
            return;
        }
        hazardIndex.currentValue -= hazardIndexStep.value;
    }
    hazardIndex.currentValue = roundFun(hazardIndex.currentValue, 1);
    handleData();
};
</script>
<style lang="scss" scoped>
.slider-box {
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 4px;
    .slider {
        margin-right: 30px;
        width: calc(100% - 168px) !important;
    }
    .input-box {
        width: 130px;
        display: flex;
        box-sizing: border-box;
        // border: 1px solid #dcdfe6;
        // border-radius: 4px;
        .input-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 25px;
            height: 22px;
            background-color: #f5f7fa;
            border: 1px solid #dcdfe6;
            box-sizing: border-box;
        }
        .input-btn-left {
            border-radius: 4px 0 0 4px;
            border-right: none;
        }
        .input-btn-right {
            border-radius: 0 4px 4px 0;
            border-left: none;
        }
        .disabled-btn {
            .icon {
                cursor: not-allowed;
                color: #a8abb2 !important;
            }
        }
        .input-content {
            flex: 1;
            height: 22px;
            border: none;
            :deep(.el-input) {
                border: none;
            }
            :deep(.el-input-number__decrease) {
                display: none;
            }
            :deep(.el-input-number__increase) {
                display: none;
            }
            :deep(.el-input__wrapper) {
                border-radius: 0;
                border: none;
                padding: 0;
            }
        }
    }
}
</style>
