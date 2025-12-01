<template>
    <Dialog title="Proximity Table" :unFullScreen="false">
        <div class="individual-site-table">
            <div class="individual-site-header">
                <div class="header-title">
                    Screening Proximity Tabular Data Summary
                    <Icon class="icon-button icon" :class="{ deactiveIcon: !showSelect }" name="d-arrow-right" size="14" @click="handleClickIcon" />
                </div>
                <div class="select-box" :class="{ hiddenSelect: !showSelect }">
                    <div class="select-input" v-if="type !== 'censusTract'">
                        <div class="select-input-box">
                            Radius of Analysis (km): {{ radiusValue }};
                            <!-- <el-input-number
                                class="number-box"
                                v-model="radiusValue"
                                @change="handleChange"
                                :min="0.5"
                                :max="50"
                                size="small"
                                controls-position="right"
                            /> -->
                        </div>
                        <div class="select-input-box" style="margin-left: 10px" v-if="false">
                            Air Toxics Risk threshold("x"-in-a million): {{ airToxic }}
                            <!-- <el-input-number class="number-box" v-model="airToxic" :min="1" :max="100" size="small" controls-position="right" /> -->
                        </div>
                    </div>
                    <div class="select-btn">
                        <el-button size="small" @click="getTable" v-if="false">Apply</el-button>
                        <el-button size="small" @click="exportTable">Output</el-button>
                    </div>
                </div>
            </div>
            <div class="individual-site-table-box" v-loading="loading" element-loading-text="Loading...">
                <SummaryTableList
                    ref="tableRef"
                    :data="tableData"
                    :siteList="[
                        {
                            siteType,
                            siteName,
                        },
                    ]"
                    :airToxic="airToxic"
                    :radiusValue="radiusValue"
                    :columnList="columnList"
                    :colorList="percentilColor"
                />
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { getIndividualSummary } from '@/api/emissions-facility';
import { useProjectYearStore } from '@/store/project-year';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { ElMessageBox } from 'element-plus';
import SummaryTableList from './SummaryTableList.vue';
const projectYearStore = useProjectYearStore();
const proximityAnalysisStore = useProximityAnalysisStore();
const zoomSelectorStore = useZoomSelectorStore();
let { setRadius } = proximityAnalysisStore.layer;
const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    areaRatio: {
        type: Number,
        default: 10,
    },
    type: {
        type: String,
        default: '',
    },
});
const showSelect = ref(true);
const loading = ref(false);
const tableData = ref({});
const airToxic = ref(40);
const radiusValue = ref(proximityAnalysisStore.radiusValue);
const percentilColor = ref([]);
const columnList = ref([
    {
        header: 'Drivers',
        key: 'driver',
        width: 90,
        children: [
            {
                header: '',
                key: 'title',
                width: 30,
            },
            {
                header: '80-90th percentile',
                key: 'percentile90',
                width: 60,
                children: [
                    {
                        header: 'Within Radius of A group',
                        key: 'withinRadiusOfCentroid',
                        width: 30,
                    },
                    {
                        header: 'County Avg.',
                        key: 'countyAvg',
                        width: 30,
                    },
                ],
            },
        ],
    },
    {
        header: 'options',
        key: 'options',
        width: 60,
        children: [
            {
                header: '90-95th percentile',
                key: 'percentile95',
                width: 30,
                children: [
                    {
                        header: 'CBSA Avg.',
                        key: 'cbsaAvg',
                        width: 30,
                    },
                    {
                        header: 'State Avg.',
                        key: 'stateAvg',
                        width: 30,
                    },
                ],
            },
            {
                header: '95-100th percentile',
                key: 'percentile100',
                width: 60,
                children: [
                    {
                        header: 'EPA Region Avg.',
                        key: 'epaRegionAvg',
                        width: 30,
                    },
                    {
                        header: 'Nation Avg.',
                        key: 'nationAvg',
                        width: 30,
                    },
                ],
            },
        ],
    },
]);
const tableRef = ref();
const siteName = computed(() => props.data.map((item) => item.name).join(', '));
const siteType = computed(() => (props.type === 'monitor' ? 'Monitor Site' : props.type === 'source' ? 'A group of facilities' : 'A group of census tracts'));
// const handleChange = () => {
//     setRadius(radiusValue.value * 1000);
// };

watch(
    () => proximityAnalysisStore.summaryTableColor.list,
    (val) => {
        percentilColor.value = val;
    },
    {
        deep: true,
    }
);
const getGeoIds = async () => {
    let list = await proximityAnalysisStore.getGeoIds(props.areaRatio);
    let geoIds = new Set();
    list.forEach((item) => {
        item.forEach((id) => {
            geoIds.add(id);
        });
    });
    return [...geoIds];
};
const roundTo = (num) => {
    let numStr = num.toString();
    let numArr = numStr.split('.');
    let index = numArr[0].length;
    let step = Math.pow(10, index - 1);
    if (num > 1) {
        return Math.round(num / step) * step;
    } else {
        return Math.round(num * 10) / 10;
    }
};
const getData = async (list) => {
    let params = {
        year: projectYearStore.projectYear,
        ejYear: projectYearStore.ejYear,
        geoIds: list,
        airToxicRiskThreshold: airToxic.value,
    };
    let districtData = zoomSelectorStore.getZoomDetail();
    params = {
        ...params,
        ...districtData,
    };
    if (props.data.length === 1) {
        let id = props.data[0].countyGeoId;
        if (id) {
            params.districtType = 'County';
            params.districtGeoId = id;
        }
    }
    let result = await getIndividualSummary(params);
    Object.keys(result).forEach((key) => {
        let item = result[key];
        if (item) {
            item['cancerRisk_Max_Value'] = item?.['cancerRisk_Max_Value'] ? roundTo(item['cancerRisk_Max_Value']) : null;
            item['hazardIndex_Max_Value'] = item?.['hazardIndex_Max_Value'] ? roundTo(item['hazardIndex_Max_Value']) : null;
        }
    });
    tableData.value = result;
};
const getTable = async () => {
    let list = [];
    loading.value = true;
    try {
        if (props.type !== 'censusTract') {
            list = await getGeoIds();
        } else {
            list = props.data.map((item) => item.geoId);
        }
        if (!list.length) {
            await ElMessageBox.confirm(`Please wait for the map to load before opening`, 'Tips', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'Warning',
            })
                .then(async () => {})
                .catch(() => {});
            tableData.value = [];
            return;
        }
        // 估计平均每条请求40ms
        let needMs = list.length * 40;
        // 判断估计需要多少秒
        let needSec = needMs / 1000;
        let needMin = Math.floor(needSec / 60);
        if (needSec >= 30) {
            await ElMessageBox.confirm(`This may take up to ${needMin + 1}  minute(s), would you like to continue?`, 'Tips', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'Warning',
            })
                .then(async () => {
                    await getData(list);
                })
                .catch(() => {});
        } else {
            await getData(list);
        }
    } catch (error) {
    } finally {
        loading.value = false;
    }
};
getTable();

const handleClickIcon = () => {
    showSelect.value = !showSelect.value;
};
const exportTable = () => {
    let name = `Proximity table for Centroid of Inyo County within ${radiusValue.value}km`;
    tableRef.value.exportData(name);
};

onMounted(() => {
    percentilColor.value = proximityAnalysisStore.summaryTableColor.list;
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
        }
        .select-box {
            width: 100%;
            overflow: hidden;
            height: 30px;
            border-bottom: 1px solid #ccc;
            box-sizing: border-box;
            padding: 0 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f0f0f0;
            transition: all 0.5s;
            font-size: 12px;
            .select-input {
                display: flex;
                align-items: center;
                .select-input-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
            .select-btn {
                display: flex;
                align-items: center;
            }
        }
        .hiddenSelect {
            height: 0;
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
            // width: 33%;
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
