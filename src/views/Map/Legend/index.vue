<template>
    <div class="mainlegend" :class="{ collapse: sidebarStore.collapse }">
        <div class="legend" ref="legendRef">
            <div class="left" @click="handleColorChange">
                <canvas class="chart" ref="chartRef"></canvas>
                <div class="circle-container">
                    <div class="circle" :style="{ 'background-color': allLabel.color }">{{ allLabel.checkbox ? allLabel.text : '' }}</div>
                </div>
            </div>
            <div class="right">
                <!-- <div class="heat-index" v-if="sidebarStore.heatIndexSelect">
                    <div @click="handleColorChange" class="example-box heat-index-box"></div>
                    <div class="label">Heat Risk</div>
                </div> -->
                <div class="ej" v-if="sidebarStore.ejSelect">
                    <div @click="handleColorChange" class="example-box ej-box"></div>
                    <div class="label">Age Demographics</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import domtoimage from 'dom-to-image';
import { useSidebarStore } from '../../../store/sidebar';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ColorBar from './ColorBar.vue';
import { showDialog } from '../../../libs/utils';
import { useLegendColorStore } from '@/store/legend-color.js';
import { setOverlayerStyle, setColor } from '@/libs/map/layers/overlayer';
const sidebarStore = useSidebarStore();
const legendColorStore = useLegendColorStore();
const labels = ref([]);
const backgroundColor = ref([]);
const lineWidth = ref([]);
const labelList = ref(legendColorStore.labelList);
const chartRef = ref();
const legendRef = ref();
let myChart;
onActivated(() => {
    myChart.resize(136, 136);
});
const resetLabels = () => {
    labels.value = labelList.value.map((item) => item.text);
    backgroundColor.value = labelList.value.map((item) => item.color);
    lineWidth.value = labelList.value.map((item) => item.width);
    setColor(backgroundColor.value, lineWidth.value);
    setOverlayerStyle();
};
const allLabel = computed(() => labelList.value[6]);
// const ejColor = computed(() => labelList.value[7].color);
// const heatIndexColor = computed(() => labelList.value[8].color);
onMounted(() => {
    if (sessionStorage.getItem('labelList')) {
        legendColorStore.labelList = JSON.parse(sessionStorage.getItem('labelList'));
    }
    labelList.value = legendColorStore.labelList;
    resetLabels();
    myChart = new Chart(chartRef.value, {
        plugins: [ChartDataLabels],
        type: 'doughnut',
        data: {
            labels: labels.value,
            datasets: [
                {
                    backgroundColor: backgroundColor.value,
                    data: [1, 1, 1, 1, 1, 1],
                    datalabels: {
                        anchor: 'center',
                        backgroundColor: null,
                        borderWidth: 0,
                    },
                    borderColor: 'black',
                    borderWidth: 0.5,
                },
            ],
        },
        options: {
            cutout: '40%',
            rotation: -90,
            animation: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                },
                datalabels: {
                    backgroundColor: (context) => {
                        return context.dataset.backgroundColor;
                    },
                    borderColor: 'white',
                    borderRadius: 25,
                    borderWidth: 2,
                    color: 'black',
                    display: true,
                    font: {
                        weight: 'bold',
                        size: 12,
                        family: '"Calibri", Arial, sans-serif',
                    },
                    padding: 6,
                    formatter: (value, context) => {
                        let labelItem = labelList.value[context.dataIndex];
                        return labelItem.checkbox ? labelItem.text : '';
                    },
                },
            },

            // Core options
            aspectRatio: 1,
            cutoutPercentage: 32,
            layout: {
                padding: 0,
            },
            elements: {
                line: {
                    fill: false,
                },
                point: {
                    hoverRadius: 7,
                    radius: 5,
                },
            },
        },
    });
});
const handleColorChange = () => {
    showDialog(ColorBar, {
        list: JSON.parse(JSON.stringify(labelList.value)),
    });
};
watch(
    () => legendColorStore.labelList,
    (val) => {
        labelList.value = val;
        resetLabels();
        myChart.config.data.datasets[0].backgroundColor = backgroundColor.value;
        myChart.update();
    },
    { deep: true }
);
const getImage = () => {
    return new Promise((resolve, reject) => {
        domtoimage
            .toPng(legendRef.value)
            .then(async function (dataUrl) {
                resolve(dataUrl);
            })
            .catch(function (error) {
                console.error('oops, something went wrong!', error);
            });
    });
};
defineExpose({
    getImage,
});
</script>

<style scoped lang="scss">
.mainlegend {
    position: fixed;
    bottom: 20px;
    left: 380px;
    // z-index: 1;
    transition: 0.5s;
    &.collapse {
        left: 20px;
    }
}
.legend {
    // --ejColor: v-bind(ejColor);
    // --heatIndexColor: v-bind(heatIndexColor);
    // position: fixed;
    // bottom: 20px;
    // left: 340px;
    // z-index: 1;
    // transition: 0.5s;
    display: flex;

    // &.collapse {
    //     left: 20px;
    // }
    .left {
        cursor: pointer;
        .chart {
            width: 136px;
            height: 136px;
        }
        .circle-container {
            z-index: -1;
            position: absolute;
            width: 136px;
            height: 136px;
            display: flex;
            top: 0;
            align-items: center;
            justify-content: center;
            .circle {
                width: 54px;
                height: 54px;
                border-radius: 50%;
                text-align: center;
                line-height: 54px;
                background-color: #000000;
                font-family: 'Calibri', Arial, sans-serif;
                color: white;
                font-size: 12px;
                user-select: none;
            }
        }
    }

    .right {
        // .heat-index {
        //     // padding-top: 40px;
        //     padding-left: 8px;
        // }
        // .ej {
        //     padding-top: 8px;
        //     padding-left: 8px;
        // }
        .example-box {
            width: 24px;
            height: 24px;
            border: 1px solid #000;
            box-sizing: border-box;
            background-size: 10px 10px;
            background-color: #fff;
            cursor: pointer;
        }
        // .heat-index-box {
        //     background-image: linear-gradient(
        //         45deg,
        //         var(--heatIndexColor) 0,
        //         var(--heatIndexColor) 25%,
        //         transparent 25%,
        //         transparent 50%,
        //         var(--heatIndexColor) 50%,
        //         var(--heatIndexColor) 75%,
        //         transparent 75%,
        //         transparent
        //     );
        // }
        // .ej-box {
        //     background-image: linear-gradient(
        //         -45deg,
        //         var(--ejColor) 0,
        //         var(--ejColor) 25%,
        //         transparent 25%,
        //         transparent 50%,
        //         var(--ejColor) 50%,
        //         var(--ejColor) 75%,
        //         transparent 75%,
        //         transparent
        //     );
        // }
        .img {
            width: 24px;
            cursor: pointer;
        }
        .label {
            font-family: 'Calibri', Arial, sans-serif;
            font-weight: bold;
            font-size: 14px;
        }
    }
}
</style>
