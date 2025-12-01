<template>
    <div class="plot-content" v-loading="loading" element-loading-text="Loading...">
        <div class="summary-plot-header">
            <div class="summary-plot-header-option">
                <div class="sources-item">
                    Sort By:
                    <el-select v-model="sortValue" class="sources-select" placeholder="Select" size="small" @change="handleChartChange">
                        <el-option v-for="item in emissionList" :key="item.type" :label="item.label" :value="item.type" />
                    </el-select>
                </div>
                <div class="sources-item">
                    <el-checkbox size="small" @change="handleShowPoint" v-model="isShowPoint">Show Point Values</el-checkbox>
                </div>
            </div>
            <el-radio-group v-model="activeTab" class="summary-plot-header-tabs" @change="handleTabChange">
                <el-radio :value="1">Emissions</el-radio>
                <el-radio :value="2">Frequency & Rank</el-radio>
            </el-radio-group>
        </div>
        <div class="summary-plot-content">
            <div class="main-content" ref="mainContentRef">
                <canvas id="ejReportCanvas" style="background: #fff"></canvas>
            </div>
        </div>
    </div>
</template>
<script setup>
let myChart;
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getSectorGroupEmissionsCombined } from '@/api/emissions-data.js';

const props = defineProps({
    topX: {
        type: Number,
        default: 20,
    },
    countyIds: {
        type: Array,
        default: () => [],
    },
    emissionYear: {
        type: Number,
        default: 2017,
    },
    list: {
        type: Array,
        default: () => [],
    },
    selected: {
        type: Array,
        default: () => [],
    },
});
const emits = defineEmits(['handleData']);
watch(
    () => props.topX,
    async (val) => {
        await getTableData();
        handleChartChange();
    },
    { deep: true }
);
watch(
    () => props.selected,
    async (val) => {
        handleChartChange();
    },
    { deep: true }
);

const topXEmissionSources = computed(() => props.topX);
const emissionList = computed(() => props.list);
const checkedList = computed(() => props.selected);
const sortValue = ref();
const isShowPoint = ref(false);
const mainContentRef = ref();
const loading = ref(false);
const activeTab = ref(1);
const chartTitle = computed(() => (activeTab.value === 1 ? 'Total Emissions from Top Sector Groups' : 'Total Sector Group Score (Frequemcy & Rank)'));

const tableList = ref([]);
const sortList = computed(() => {
    let list = [...tableList.value];
    let sortKey = sortValue.value;
    if (sortKey) {
        sortKey = activeTab.value === 1 ? sortKey.toLowerCase() : 'topXScore_' + sortKey.toLowerCase();
        list.sort((a, b) => {
            return b[sortKey] - a[sortKey];
        });
    }

    list = list.splice(0, topXEmissionSources.value);
    return list;
});
const chartLabel = computed(() => {
    return sortList.value.map((item) => item.name);
});
const handleTabChange = () => {
    handleChartChange();
};
const handleChartChange = () => {
    if (!myChart) return;
    let dataSets = getChartData();
    myChart.config.data.datasets = dataSets;
    myChart.config.data.labels = chartLabel.value;
    myChart.update();
};
const handleShowPoint = () => {
    myChart.config.options.plugins.datalabels.display = isShowPoint.value;
    myChart.update();
};
const getTableData = async () => {
    try {
        loading.value = true;
        tableList.value = [];
        let tableData = [];
        let quaram = {
            year: props.emissionYear,
            districtType: 'county',
            districtIds: props.countyIds,
            topCount: topXEmissionSources.value,
        };
        let result = await getSectorGroupEmissionsCombined(quaram);
        Object.keys(result).forEach((key) => {
            let obj = {
                name: key,
            };
            let data = result[key];
            let summary = data.summary;
            let topXFrequency = data.topXFrequency;
            let topXScore = data.topXScore;
            let top10Frequency = data.top10Frequency;
            let top10Score = data.top10Score;
            emissionList.value.forEach((item) => {
                let type = item.type.toLowerCase();
                obj[type] = Math.floor(summary[type] * 100) / 100;
                obj['topXFrequency_' + type] = topXFrequency[type];
                obj['topXScore_' + type] = topXScore[type];
                obj['top10Frequency_' + type] = top10Frequency[type];
                obj['top10Score_' + type] = top10Score[type];
            });
            tableData.push(obj);
        });
        tableList.value = tableData;
    } catch (err) {
        console.log(err);
    } finally {
        loading.value = false;
    }
};
const getChartData = () => {
    let dataSets = [];

    emissionList.value.forEach((typeItem) => {
        if (checkedList.value.indexOf(typeItem.type) !== -1) {
            let sortKey = activeTab.value === 1 ? typeItem.type.toLowerCase() : 'topXScore_' + typeItem.type.toLowerCase();
            let arr = sortList.value.map((item) => item[sortKey]);
            dataSets.push({
                label: `${typeItem.label} (${typeItem.unit})`,
                data: arr,
                backgroundColor: [typeItem.color],
                fill: true,
                borderColor: typeItem.color,
            });
        }
    });
    return dataSets;
};
watch(
    () => props.countyIds,
    async (val) => {
        if (val.length) {
            await getTableData();
        } else {
            tableList.value = [];
        }

        handleChartChange();
    },
    { deep: true }
);
watch(
    loading,
    async (val) => {
        emits('handleData', val);
    },
    { deep: true }
);
onMounted(async () => {
    await nextTick();
    if (emissionList.value.length) {
        let defaultItem = emissionList.value[0];
        sortValue.value = defaultItem.type;
    }
    let dataSets = getChartData();
    myChart = new Chart(document.getElementById('ejReportCanvas').getContext('2d'), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: chartLabel.value,
            datasets: dataSets,
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                axis: 'y',
            },
            scales: {
                y: {
                    display: true,
                    title: {
                        display: false,
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            return value;
                        },
                    },
                    beginAtZero: true,
                    grid: {
                        display: true,
                    },
                },
                x: {
                    display: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sector',
                    },
                    grid: {
                        display: true,
                    },
                },
            },
            plugins: {
                datalabels: {
                    display: false,
                    anchor: 'end',
                    align: 'end',
                    font: {
                        size: 10,
                    },
                    formatter: (val) => `${val}`,
                },
                legend: {
                    labels: {
                        usePointStyle: true,
                    },
                },
                tooltip: {
                    enabled: true,
                    usePointStyle: true,
                },
                title: {
                    display: true,
                    text: chartTitle.value,
                },
            },
            animation: {},
        },
    });
});
</script>
<style scoped lang="scss">
.plot-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .summary-plot-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        padding: 5px;
        margin-bottom: 5px;
        font-size: 12px;
        .summary-plot-header-tabs {
            :deep(.el-radio) {
                margin-right: 10px;
            }
        }
        .summary-plot-header-option {
            display: flex;
            align-items: center;
            .sources-item {
                display: flex;
                align-items: center;
                .sources-select {
                    width: 100px;
                    margin-left: 5px;
                }
            }
            .sources-item + .sources-item {
                margin-left: 5px;
            }
        }
    }

    .summary-plot-content {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        .main-content {
            width: 100%;
            flex: 1;
            #summaryPlotCanvas {
                width: 100% !important;
                height: 100%;
            }
        }
    }
}
</style>
