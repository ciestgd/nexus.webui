<template>
    <div class="pie-box">
        <div class="pie-header">{{ props.label }}</div>
        <canvas class="pie-chart" ref="canvasRef" style="background: #fff"></canvas>
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
    label: {
        type: String,
        default: 'NOX',
    },
    dataType: {
        type: String,
        default: 'majorPointSources',
    },
});
let myChart;
const canvasRef = ref(null);
const typeUnit = computed(() => {
    return props.type == 'Gas_VOC_HAPs' || props.type === 'Heavy_Metal_HAPs' ? 'LB' : props.type === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY';
});
const getChartData = () => {
    let data = props.data;
    let labels = ['Event', 'Non-Point', 'Non-Road', 'On-Road', 'Point'];
    let dataSets = [];
    let bgList = ['#1B92F2', '#F33C2E', '#FEBC00', '#5D7A87', '#02B9D1'];
    labels.forEach((item) => {
        data.forEach((_item) => {
            if (_item.name === item) {
                let value = _item.value;
                dataSets.push(value);
            }
        });
    });
    return {
        labels,
        datasets: [
            {
                label: props.label,
                data: dataSets,
                backgroundColor: bgList,
                hoverOffset: 4,
            },
        ],
    };
};
watch(
    () => props.data,
    () => {
        let { labels, datasets } = getChartData();
        myChart.data.datasets = datasets;
        myChart.data.labels = labels;
        myChart.update();
    },
    { deep: true }
);
onMounted(async () => {
    await nextTick();
    let { labels, datasets } = getChartData();
    console.log(labels, datasets);
    myChart = new Chart(canvasRef.value.getContext('2d'), {
        type: 'pie',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            plugins: {
                tooltip: {
                    enabled: true,
                    usePointStyle: true,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}(${typeUnit.value}):${context.formattedValue}`
                        },
                    },
                },
            },
        },
    });
});
</script>
<style scoped lang="scss">
.pie-box {
    max-width: 400px;
    width: 50%;
    min-width: 300px;
    box-sizing: border-box;
    padding: 5px;
    .pie-header {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 5px;
        font-style: oblique;
        &::before {
            content: ' ';
            width: 8px;
            height: 8px;
            background: #33a14f;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
        }
    }
}
.pie-chart {
    border: 1px solid #ccc;
}
</style>
