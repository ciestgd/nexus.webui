<template>
    <Dialog title="Mulit-Pollutant Risk Ranking" :unFullScreen="false">
        <div class="individual-site-table">
            <div class="individual-site-header">
                <div class="header-title">
                    <div class="header-content">
                        CBSA Risk Ranking<el-select v-model="rankType" class="rankTypeSelect" placeholder="Select" size="small" @change="getTable">
                            <el-option v-for="item in rankingTypeList" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </div>
                    <Icon class="icon-button icon" :class="{ deactiveIcon: !showSelect }" name="d-arrow-right" size="14" @click="handleClickIcon" />
                </div>
                <div class="select-box" :class="{ hiddenSelect: !showSelect }">
                    <div class="select-input">
                        <div class="radio-box">
                            Region Type
                            <el-radio-group class="radioGroup" v-model="regionTypeValue" size="small" @change="getTable">
                                <el-radio value="cbsa" size="small">CBSA</el-radio>
                                <el-radio value="county" size="small">County</el-radio>
                            </el-radio-group>
                        </div>
                        <div class="select-input-box">
                            Number of {{ regionTypeValue === 'cbsa' ? 'CBSA' : 'County' }} with top ranked MP risk:
                            <el-input-number class="number-box" v-model="topCount" @change="getTable" :min="1" :max="100" size="small" controls-position="right" />
                        </div>
                        <div class="checkbox-box"><el-checkbox v-model="includeCheck" label="" size="small" />Include EJ/Demographic index</div>
                    </div>
                    <div class="select-btn">
                        <el-button size="small" @click="getTable">Apply</el-button>
                        <el-button size="small" @click="exportXlsx">Output</el-button>
                    </div>
                </div>
            </div>
            <div class="individual-site-table-box">
                <el-table
                    :data="tableData"
                    size="small"
                    ref="tableRef"
                    id="riskRankingTable"
                    v-loading="loading"
                    element-loading-text="Loading..."
                    border
                    class="sourcesTable"
                    style="width: 100%"
                    height="100%"
                >
                    <el-table-column type="index" width="50" label="FID" />
                    <el-table-column align="center" label="EPA_REGION" prop="epaRegionId"> </el-table-column>
                    <el-table-column align="center" label="STATE" prop="stateAbbrName"> </el-table-column>
                    <el-table-column align="center" label="CBSA_ID" prop="cbsaGeoId"> </el-table-column>
                    <el-table-column align="center" label="CBSA_NAME" prop="cbsaName"> </el-table-column>
                    <el-table-column align="center" label="COUNTY" prop="countyName"> </el-table-column>
                    <!-- <el-table-column align="center" label="CBSA_TYPE" prop="withinRadiusOfCentroid"> </el-table-column> -->
                    <el-table-column align="center" label="PM Mortality Rate %ile" prop="mortality_PM25_PercentRank"> </el-table-column>
                    <el-table-column align="center" label="O3 Mortality Rate %ile" prop="mortality_O3_PercentRank"> </el-table-column>
                    <el-table-column align="center" label="Cancer Risk Rate %ile" prop="cancerRisk_PercentRank"> </el-table-column>
                    <el-table-column align="center" v-if="includeCheck" label="EJ/Demographic Index %ile" prop="demographicIndex_PercentRank"> </el-table-column>
                    <el-table-column align="center" label="Overall Rank" prop="rank"> </el-table-column>
                </el-table>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { getMpRiskRanking } from '@/api/mp-risk-ranking';
import { useProjectYearStore } from '@/store/project-year';
import exportExcel from '@/libs/export-excel';
const projectYearStore = useProjectYearStore();
const props = defineProps({});
const showSelect = ref(true);
const loading = ref(false);
const tableData = ref([]);
const tableRef = ref();
const rankType = ref('max');
const rankingTypeList = ref([
    {
        label: 'Based on mortality rate (max tract-level)',
        value: 'max',
    },
    {
        label: 'Based on mortality number',
        value: 'num',
    },
]);
const topCount = ref(50);
const regionTypeValue = ref('cbsa');
const includeCheck = ref(true);
const handleClickIcon = () => {
    showSelect.value = !showSelect.value;
};

const exportXlsx = () => {
    let excelTitle = `Top ${topCount.value} ${regionTypeValue.value === 'cbsa' ? 'CBSAs' : 'Counties'} ranked MP risk data`;
    let columns = [
        {
            header: 'FID',
            key: 'index',
            width: 20,
            show: true,
        },
        {
            header: 'EPA_REGION',
            key: 'epaRegionId',
            width: 20,
            show: true,
        },
        {
            header: 'STATE',
            key: 'stateAbbrName',
            width: 20,
            show: true,
        },
        {
            header: 'CBSA_ID',
            key: 'cbsaGeoId',
            width: 20,
            show: true,
        },
        {
            header: 'CBSA_NAME',
            key: 'cbsaName',
            width: 20,
            show: true,
        },
        {
            header: 'COUNTY',
            key: 'countyName',
            width: 20,
            show: true,
        },
        {
            header: 'PM Mortality Rate %ile',
            key: 'mortality_PM25_PercentRank',
            width: 20,
            show: true,
        },
        {
            header: 'O3 Mortality Rate %ile',
            key: 'mortality_O3_PercentRank',
            width: 20,
            show: true,
        },
        {
            header: 'Cancer Risk Rate %ile',
            key: 'cancerRisk_PercentRank',
            width: 20,
            show: true,
        },
        {
            header: 'EJ/Demographic Index %ile',
            key: 'demographicIndex_PercentRank',
            width: 20,
            show: includeCheck.value,
        },
        {
            header: 'Overall Rank',
            key: 'rank',
            width: 20,
            show: true,
        },
    ];
    let columnsList = columns.filter((item) => item.show);
    let data = tableData.value.map((item, index) => {
        return {
            index: index + 1,
            ...item,
        };
    });
    exportExcel(excelTitle, [
        {
            tableName: 'sheet',
            columList: columnsList,
            data,
            cellStyleFn: null,
            headerStyleFn: null,
        },
    ]);
};

const getTable = async () => {
    try {
        tableData.value = [];
        let params = {
            regionType: regionTypeValue.value,
            year: projectYearStore.projectYear,
            topCount: topCount.value,
            isIncludeEj: includeCheck.value,
            valueType: rankType.value,
        };
        loading.value = true;
        let result = await getMpRiskRanking(params);
        let keyArr = ['mortality_PM25_PercentRank', 'mortality_O3_PercentRank', 'cancerRisk_PercentRank', 'demographicIndex_PercentRank'];
        let list = result.map((item, index) => {
            let obj = { ...item };
            obj.rank = index + 1;
            Object.keys(obj).forEach((key) => {
                if (key === 'epaRegionId') {
                    obj[key] = 'EPA Region ' + obj[key];
                } else if (keyArr.indexOf(key) !== -1) {
                    let val = obj[key];
                    val = Math.floor(val * 1000) / 10;
                    obj[key] = val;
                }
            });
            return obj;
        });
        tableData.value = list;
    } catch (err) {
    } finally {
        loading.value = false;
    }
};
onMounted(async () => {
    await nextTick();
    getTable();
});
</script>
<style scoped lang="scss">
.individual-site-table {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .individual-site-header {
        .header-title {
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            font-size: 14px;
            font-weight: bold;
            background: #f0f0f0;
            box-sizing: border-box;
            border-bottom: 1px solid #ccc;
            .icon {
                // margin-left: 5px;
                transform: rotate(270deg);
                transition: all 0.5s;
            }
            .deactiveIcon {
                transform: rotate(90deg);
            }
            .header-content {
                display: flex;
                align-items: center;
                .rankTypeSelect {
                    margin-left: 5px;
                    width: 270px;
                }
            }
        }
        .select-box {
            width: 100%;
            overflow: hidden;
            min-height: 30px;
            border-bottom: 1px solid #ccc;
            box-sizing: border-box;
            padding: 0 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f0f0f0;
            transition: all 0.5s;
            font-size: 12px;
            .select-input {
                display: flex;
                align-items: center;
                flex: 1;
                // height: 30px;
                flex-wrap: wrap;
                .select-input-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    height: 30px;
                    padding: 0 5px;
                    border-bottom: 1px solid #ccc;
                    border-right: 1px solid #ccc;
                    .number-box {
                        margin-left: 5px;
                    }
                }
                .radio-box {
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    // margin-right: 5px;
                    box-sizing: border-box;
                    border-bottom: 1px solid #ccc;
                    border-right: 1px solid #ccc;
                    .radioGroup {
                        margin-left: 5px;

                        .el-radio {
                            margin-right: 4px;
                        }
                    }
                }
                .checkbox-box {
                    display: flex;
                    align-items: center;
                    margin-left: 5px;
                }
            }
            .select-btn {
                display: flex;
                align-items: center;
            }
        }
        .hiddenSelect {
            height: 0;
            min-height: 0;
        }
    }
    .individual-site-table-box {
        width: 100%;
        flex: 1;
        overflow: hidden;
        :deep(.percentile-cell) {
            color: #000;
        }

        :deep(.el-table__cell) {
            .cell {
                color: #000;
            }
        }
    }
    .percentle-box {
        display: flex;
        align-items: center;
        justify-content: center;
        .percentle-item {
            flex: 1;
            font-size: 12px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
