<template>
    <Dialog :title="title" @on-closed="handleClose" height="420">
        <div class="trends">
            <div class="trendsType" v-if="measurementScale">Monitor Site Type:{{ measurementScale }}</div>
            <canvas :id="chartId"></canvas>
        </div>
    </Dialog>
</template>
<script setup>
import Chart from 'chart.js/auto';
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
});
const title = ref('');
const chartId = computed(() => 'trendsChart_' + props.data.siteId);
let measurementScale = ref(props.data.measurementScale);
let pollutant = props.data.pollutant === 'AirToxic' ? props.data.pollutantType : props.data.pollutant;
pollutant = pollutant.slice(0, 1).toUpperCase() + pollutant.slice(1);
pollutant = pollutant.split('_').join(' ');
pollutant = pollutant === 'PM25' ? 'PM2.5' : pollutant;
title.value = `Trends: ${pollutant} at ${props.data.siteId} ${props.data.siteName} (${props.data.countyName}, ${props.data.stateName})`;
const yearOptions = ref([]);
const valueOptions = ref([]);
const lineLable = ref('');
Object.keys(props.data.values).forEach((year) => {
    let value = props.data.values[year];
    if (value >= 0) {
        yearOptions.value.push(year);
        valueOptions.value.push(Math.round(value * 100) / 100);
    }
});
const turbidityUnit = props.data.pollutant === 'O3' ? 'ppb' : 'μg/m³';
lineLable.value = `${pollutant}(${props.data.pollutant === 'O3' ? 'MDA8 DVs' : 'Annual avg'})`;
let myChart;
const handleClose = () => {
    myChart = null;
};
onMounted(async () => {
    await nextTick();
    const dataSets = [
        {
            label: lineLable.value,
            data: valueOptions.value,
            fill: true,
            borderColor: '#2597F2', // 设置线的颜色
            backgroundColor: ['rgba(222,239,253,0.5)'], // 设置点的填充色
            pointStyle: 'circle', // 设置点类型为圆点
            pointRadius: 5, // 设置圆点半径
            pointHoverRadius: 8, // 设置鼠标移动上去后圆点半径
            tension: 0.1,
        },
    ];
    if (props.data.pollutant === 'PM25' || props.data.pollutant === 'O3') {
        const naaqsLabel = ref(`${pollutant} NAAQS (${turbidityUnit})`);
        const naaqsValues = ref([]);
        yearOptions.value.forEach((item) => {
            let val = props.data.pollutant === 'PM25' ? 9 : 70;
            naaqsValues.value.push(val);
        });
        dataSets.push({
            label: naaqsLabel.value,
            data: naaqsValues.value,
            fill: false,
            borderColor: 'red',
            pointStyle: 'line',
        });
    }
    myChart = new Chart(document.getElementById(chartId.value), {
        type: 'line',
        data: {
            labels: yearOptions.value,
            datasets: dataSets,
        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
            },
            scales: {
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: `Conccentration,${turbidityUnit}`,
                    },
                },
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year',
                    },
                },
            },
            plugins: {
                legend: {
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                    },
                    onClick: function (e, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const ci = legend.chart;
                        if (legendItem.pointStyle === 'line') {
                            if (ci.isDatasetVisible(index)) {
                                ci.hide(index);
                                legendItem.hidden = true;
                            } else {
                                ci.show(index);
                                legendItem.hidden = false;
                            }
                        }
                    },
                },
                tooltip: {
                    usePointStyle: true,
                },
            },
        },
    });
});
</script>
<style scoped lang="scss">
.trends {
    width: 100%;
    height: 100%;
    position: relative;
    .trendsType {
        position: absolute;
        font-size: 14px;
        top: 5px;
        left: 10px;
    }
    .trendsChart {
        box-sizing: border-box;
        padding: 5px;
    }
}
</style>
