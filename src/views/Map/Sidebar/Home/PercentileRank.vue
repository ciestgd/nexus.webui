<template>
    <div class="percentile-ranking-content">
        <div class="rank-title">
            Percentile Ranking
            <ParameterTip
                :isAdvancedModel="true"
                content="Please chose whether to rank the data based on the US National totals or on the area selected. NOTE: For ranking based on a selected area that is a county or CBSA, the Data Scale must be set at Census Tract level"
            />
        </div>
        <el-radio-group v-model="riskRankingType" @change="handleRiskRanking">
            <div style="width: 100%">
                <el-radio :value="0">%ile based on Nation</el-radio>
            </div>
            <div style="width: 100%">
                <el-tooltip effect="customized" content="This option is disabled due to only one region in selected area" :disabled="!tiskRankingDisable" placement="bottom">
                    <el-radio :value="1" :disabled="tiskRankingDisable">%ile based on Selected Area</el-radio>
                </el-tooltip>
            </div>
        </el-radio-group>
    </div>
</template>
<script setup>
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useZoomSelectorStore } from '@/store/zoom-selector';

const zoomSelectorStore = useZoomSelectorStore();
const riskRankingStore = useRiskRankingStore();
const riskRankingType = ref(riskRankingStore.riskRankingType);
const tiskRankingDisable = computed(() => {
    let model = zoomSelectorStore.model;
    return model[3] !== undefined && dataScaleStore.isCountyLevel;
});
const handleRiskRanking = () => {
    riskRankingStore.riskRankingType = riskRankingType.value;
};
</script>
<style scoped lang="scss">
.percentile-ranking-content {
    margin-top: 10px;
    box-sizing: border-box;
    border-top: 1px solid #000;
    padding-top: 5px;
    .rank-title {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
    }
}
</style>
