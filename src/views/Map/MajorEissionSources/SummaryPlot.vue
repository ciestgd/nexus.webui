<template>
    <div class="summary-plot-box">
        <div class="summary-plot-header">
            <el-tabs v-model="activeTab" class="summary-plot-header-tabs" size="small" @tab-change="handleTabChange">
                <el-tab-pane label="Emissions" :name="1"></el-tab-pane>
                <el-tab-pane label="Frequency & Rank" :name="2"></el-tab-pane>
            </el-tabs>
            <div class="summary-plot-header-option">
                <div class="sources-item">
                    Top X Emission Sources:
                    <el-input-number v-model="topXEmissionSources" class="sources-select" size="small" :min="1" :max="100" @change="handleTopXChange" controls-position="right" />
                </div>
                <div class="sources-item">
                    Sort By:
                    <el-select v-model="sortValue" class="sources-select" placeholder="Select" size="small" @change="handleChartChange">
                        <el-option v-for="item in props.typeList" :key="item.type" :label="item.label" :value="item.type" />
                    </el-select>
                </div>
                <div class="sources-item">
                    <el-checkbox size="small" @change="handleShowPoint" v-model="isShowPoint">Show Point Values</el-checkbox>
                </div>
            </div>
        </div>
        <div class="summary-plot-content">
            <div class="pollutant-box">
                <div class="checkbox-all">Pollutant</div>
                <el-checkbox-group class="checkbox-content" @change="handleChartChange" v-model="checkedList">
                    <el-checkbox size="small" v-for="item in props.typeList" :key="item.type" :label="item.type">{{ item.label }}</el-checkbox>
                </el-checkbox-group>
            </div>
            <div class="main-content" ref="mainContentRef" v-loading="loading" element-loading-text="Loading...">
                <canvas id="summaryPlotCanvas" style="background: #fff"></canvas>
            </div>
        </div>
    </div>
</template>
<script setup>
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getSectorGroupEmissionsCombined } from '@/api/emissions-data.js';
const props = defineProps({
    typeList: {
        type: Array,
        default: () => [],
    },
    topX: {
        type: Number,
        default: 20,
    },
    regionList: {
        type: Array,
        default: () => [],
    },
    regionType: {
        type: String,
        default: '',
    },
    emissionYear: {
        type: Number,
        default: 2017,
    },
});
let myChart;
const checkedList = ref([]);
const sortValue = ref();
const isShowPoint = ref(false);
const topXEmissionSources = ref(props.topX);
const handleChartChange = () => {
    let dataSets = getChartData();
    myChart.config.data.datasets = dataSets;
    myChart.config.data.labels = chartLabel.value;
    myChart.update();
};
const handleTabChange = () => {
    handleChartChange();
};
const handleTopXChange = async () => {
    await getTableData();
    handleChartChange();
};
const handleShowPoint = () => {
    myChart.config.options.plugins.datalabels.display = isShowPoint.value;
    myChart.update();
};
const mainContentRef = ref();
const tableList = ref([]);
const loading = ref(false);
const sortList = computed(() => {
    let list = [...tableList.value];
    let sortKey = sortValue.value;
    sortKey = activeTab.value === 1 ? sortKey.toLowerCase() : 'topXScore_' + sortKey.toLowerCase();
    list.sort((a, b) => {
        return b[sortKey] - a[sortKey];
    });
    list = list.splice(0, topXEmissionSources.value);
    return list;
});
const chartLabel = computed(() => {
    return sortList.value.map((item) => item.name);
});
const activeTab = ref(1);
const chartTitle = computed(() => (activeTab.value === 1 ? 'Total Emissions from Top Sector Groups' : 'Total Sector Group Score (Frequemcy & Rank)'));
const getTableData = async () => {
    try {
        loading.value = true;
        tableList.value = [];
        let tableData = [];
        let ids = props.regionList.map((item) => item.key);
        let quaram = {
            year: props.emissionYear,
            districtType: props.regionType,
            districtIds: ids,
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
            props.typeList.forEach((item) => {
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

    props.typeList.forEach((typeItem) => {
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
onMounted(async () => {
    await nextTick();
    await getTableData();
    if (props.typeList.length) {
        let defaultItem = props.typeList[0];
        checkedList.value = [defaultItem.type];
        sortValue.value = defaultItem.type;
    }

    let dataSets = getChartData();
    myChart = new Chart(document.getElementById('summaryPlotCanvas').getContext('2d'), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: chartLabel.value,
            datasets: dataSets,
        },
        options: {
            responsive: true,
            interaction: {
                // intersect: false,
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
.summary-plot-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .summary-plot-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        padding: 5px;
        margin-bottom: 5px;
        font-size: 12px;
        .summary-plot-header-tabs {
            :deep(.el-tabs__header) {
                margin: 0;
            }
            :deep(.el-tabs__item) {
                font-size: 12px;
                height: 30px;
                padding: 0 10px;
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
        // overflow: hidden;
        .pollutant-box {
            box-sizing: border-box;
            padding: 5px 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            position: relative;
            margin-top: 3px;
            .checkbox-all {
                position: absolute;
                top: -9px;
                left: 15px;
                background: #fff;
            }
            .checkbox-content {
                display: flex;
                flex-wrap: wrap;
                .el-checkbox {
                    margin-right: 10px;
                    :deep(.el-checkbox__label) {
                        font-size: 12px;
                        // height: 24px;
                    }
                }
            }
        }
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
