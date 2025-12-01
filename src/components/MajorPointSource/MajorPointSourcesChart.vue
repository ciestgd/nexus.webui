<template>
    <div class="chart-box">
        <div class="chart-header">{{ props.label }}</div>
        <canvas class="chart-content" ref="canvasRef" style="background: #fff"></canvas>
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
        default: 'NOX',
    },
    dataType: {
        type: String,
        default: 'majorPointSources',
    },
    label: {
        type: String,
        default: 'NOX',
    },
    topCount: {
        type: Number,
        default: 100,
    },
});
let myChart;
const canvasRef = ref(null);
// const canvasId = computed(() => `barCanvas_${props.type}_${props.dataType}`);
const getChartData = () => {
    let data = props.data;
    let title = `Top ${props.topCount} ${props.label} Emissions`;
    let unitValue = props.type == 'Gas_VOC_HAPs' || props.type === 'Heavy_Metal_HAPs' ? 'LB' : props.type === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY';
    let label = `${props.label} (${unitValue})`;
    let labels = [];
    let dataList = [];
    data.forEach((item) => {
        let name = `${item.siteName}`;
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
    myChart.update();
};
watch(
    () => props.data,
    (val) => {
        getChartData();
    },
    { deep: true }
);
onMounted(async () => {
    await nextTick();

    myChart = new Chart(canvasRef.value.getContext('2d'), {
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
            },
            elements: {
                bar: {
                    borderWidth: 2,
                },
            },
        },
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
