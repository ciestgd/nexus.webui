<template>
    <div class="chart-box">
        <div class="chart-header">{{ props.label }}</div>
        <canvas class="chart-content" :id="canvasId" style="background: #fff"></canvas>
    </div>
</template>
<script setup>
import Chart from 'chart.js/auto';
const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    type: {
        type: String,
        default: 'PM25',
    },
    label: {
        type: String,
        default: 'PM2.5',
    },
    topCount: {
        type: Number,
        default: 100,
    },
    unit: {
        type: String,
        default: 'ppb',
    },
    dataType: {
        type: String,
        default: 'MonitorSites',
    },
    rankingYear: {
        type: Number,
        default: 2020,
    },
});
const canvasId = computed(() => `barCanvas_${props.type}_${props.dataType}`);
let myChart;
const getChartData = () => {
    let data = props.data;
    let title = `[${props.rankingYear}] Top ${props.topCount} ${props.label} Sites`;
    let label = `${props.label} (${props.unit})`;
    let labels = [];
    let dataList = [];
    data.forEach((item) => {
        let name = `${item.countyName}, ${item.stateAbbrName}`;
        labels.push(name);
        dataList.push(item.value);
    });
    myChart.data.labels = labels;
    myChart.data.datasets = [
        {
            label: label,
            data: dataList,
            backgroundColor: '#332288', // 设置点的填充色
        },
    ];
    myChart.options.plugins.title.text = title;
    myChart.options.scales.x.title.text = `(${props.unit})`;
    myChart.update();
};
const plugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#fff';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    },
};
watch(
    () => props.data,
    () => {
        getChartData();
    },
    { deep: true }
);
onMounted(async () => {
    await nextTick();

    myChart = new Chart(document.getElementById(canvasId.value).getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            indexAxis: 'y',
            responsive: true,

            scales: {
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Site Name',
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            let val = this.getLabelForValue(value);
                            if (val.length > 8) {
                                return val.substring(0, 9) + '...';
                            } else {
                                return val;
                            }
                        },
                    },
                },
                x: {
                    beginAtZero: true,
                    display: true,
                    title: {
                        display: true,
                        text: '(10^3)',
                    },
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: '',
                    font: {
                        size: 18,
                    },
                },
                customCanvasBackgroundColor: {
                    color: '#fff',
                },
            },
            elements: {
                bar: {
                    borderWidth: 2,
                },
            },
        },
        plugins: [plugin],
    });
    getChartData();
});
</script>
<style scoped lang="scss">
.chart-box {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    // padding: 5px;
    .chart-header {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
        font-style: oblique;
        &::before {
            content: ' ';
            width: 8px;
            height: 8px;
            // background: #33a14f;
            background: var(--point-color);
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
        }
    }
}
.chart-content {
    width: 100% !important;
    // height: 100% !important;
}
</style>
