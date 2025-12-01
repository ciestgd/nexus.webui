<template>
    <Dialog title="MP Risk Ranking" height="180" width="300"  :isCollapse="true" :isContentDraggable="false">
        <div class="data-content">
            <ul>
                <li @click="showRiskRanking" class="unClick">Display CBSA Risk Ranking</li>
                <el-radio-group v-model="riskRankingType" @change="handleRiskRanking">
                    <li><el-radio :value="0">Top Risk %ile based on Nation</el-radio></li>
                    <li>
                        <el-tooltip
                            effect="customized"
                            content="This option is disabled due to only one region in selected area"
                            :disabled="!tiskRankingDisable"
                            placement="bottom"
                        >
                            <el-radio :value="1" :disabled="tiskRankingDisable">Top Risk %ile based on Selected Area</el-radio>
                        </el-tooltip>
                    </li>
                </el-radio-group>
            </ul>
        </div>
    </Dialog>
</template>
<script setup>
import CBSARiskRankingTable from './CBSARiskRankingTable.vue';
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { showDialog } from '../../../libs/utils';
const zoomSelectorStore = useZoomSelectorStore();
const riskRankingStore = useRiskRankingStore();
const riskRankingType = ref(riskRankingStore.riskRankingType);
const emits = defineEmits(['handleDialogClose']);
const tiskRankingDisable = computed(() => {
    let model = zoomSelectorStore.model;
    return model[3] !== undefined && dataScaleStore.isCountyLevel;
});

const handleRiskRanking = () => {
    riskRankingStore.riskRankingType = riskRankingType.value;
    emits('handleDialogClose');
};
const showRiskRanking = () => {
    showDialog(CBSARiskRankingTable);
};
</script>
<style scoped lang="scss">
.data-content {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    height: 100%;
    display: flex;
    flex-direction: column;
    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
        li {
            width: 100%;
            padding: 5px;
            height: 40px;
            font-size: 14px;
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            align-items: center;
            color: #606266;
            img {
                width: 20px;
                height: 20px;
                margin-right: 5px;
            }
            &:hover {
                background-color: #ecf5ff;
                color: #50a6ff;
            }
        }
        .unClick {
            cursor: not-allowed;
            color: #c0c4cc;
            &:hover {
                background-color: #fff;
                color: #c0c4cc;
            }
        }
    }
    .el-radio-group {
        width: 100%;
    }
}
</style>
