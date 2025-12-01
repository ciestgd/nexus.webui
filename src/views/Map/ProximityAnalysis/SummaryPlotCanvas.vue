<template>
    <div class="chart-content" ref="mainContentRef" @contextmenu.prevent="setContextMenu">
        <canvas class="canvas-box" :id="props.type" style="background: #fff"></canvas>
    </div>
    <Tooltip ref="menuRef" popper-class="menu-list" :append-ref="mainContentRef" placement="right-end" :show-arrow="false" effect="light" trigger="contextmenu" :enterable="true">
        <div class="menu-content">
            <div class="menu-item"><el-checkbox v-model="pointValueCheck" @change="handlePointValue" label="Show Point Values" size="small" /></div>
            <div class="menu-item national-content">
                <el-checkbox v-model="nationalCheck" :indeterminate="isIndeterminate" @change="handleCheckAllChange" label="Show National Avg Line" size="small" />
                <div class="second-menu">
                    <el-checkbox-group v-model="avgCheckList" @change="handleNationalAvg">
                        <el-checkbox :label="item.value" size="small" v-for="item in avgOptions">{{ item.label }}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
            <div class="menu-item"><el-checkbox v-model="countyCheck" @change="handleLabelChange" label="Show County Avg" size="small" /></div>
            <div class="menu-item"><el-checkbox v-model="cbsaCheck" @change="handleLabelChange" label="Show CBSA Avg" size="small" /></div>
            <div class="menu-item"><el-checkbox v-model="stateCheck" @change="handleLabelChange" label="Show State Avg" size="small" /></div>
            <div class="menu-item"><el-checkbox v-model="epaCheck" @change="handleLabelChange" label="Show EPA_Region Avg" size="small" /></div>
            <div class="menu-item"><el-checkbox v-model="tooltipCheck" @change="handleTooltipAvg" label="Show Tooltip" size="small" /></div>
            <div class="menu-item" @click="saveImage">Save Image to Clipboard</div>
        </div>
    </Tooltip>
</template>
<script setup>
import Chart from 'chart.js/auto';
import linePlugin from '@/libs/line-plugin';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const props = defineProps({
    type: {
        type: String,
        default: 'proximityCanvas',
    },
    title: {
        type: String,
        default: '',
    },
    dataSets: {
        type: Array,
        default: [],
    },
    chartLabel: {
        type: Array,
        default: [],
    },
    options: {
        type: Array,
        default: [],
    },
    defaultCheckList: {
        type: Array,
        default: [],
    },
});
const emits = defineEmits(['handleLabelChange', 'handleChange']);
let myChart;
const pointValueCheck = ref(true);
const nationalCheck = ref(true);
const countyCheck = ref(true);
const cbsaCheck = ref(true);
const stateCheck = ref(true);
const epaCheck = ref(true);
const tooltipCheck = ref(false);

const isIndeterminate = ref(true);
const menuRef = ref();
const mainContentRef = ref();
const avgCheckList = ref(props.defaultCheckList);
const avgOptions = ref(props.options);
const handleLabelChange = () => {
    emits('handleLabelChange', {
        countyCheck: countyCheck.value,
        cbsaCheck: cbsaCheck.value,
        stateCheck: stateCheck.value,
        epaCheck: epaCheck.value,
    });
    closeMenu();
};
const setContextMenu = (event) => {
    let position = DOMRect.fromRect({
        width: 0,
        height: 0,
        x: event.clientX,
        y: event.clientY,
    });
    menuRef.value.resetData({
        getBoundingClientRect() {
            return position;
        },
    });
};
const handlePointValue = () => {
    if (pointValueCheck.value) {
        myChart.config.options.plugins.datalabels.display = function (context) {
            return context.dataset.type === 'bar';
        };
    } else {
        myChart.config.options.plugins.datalabels.display = false;
    }
    myChart.update();
    closeMenu();
};
const handleCheckAllChange = (val) => {
    avgCheckList.value = val ? avgOptions.value.map((item) => item.value) : [];
    isIndeterminate.value = false;
    emits('handleChange', avgCheckList.value);
    closeMenu();
};
const handleNationalAvg = (value) => {
    const checkedCount = value.length;
    nationalCheck.value = checkedCount === avgOptions.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < avgOptions.value.length;

    emits('handleChange', avgCheckList.value);
};
const closeMenu = () => {
    menuRef.value.hiddenTips();
};
const saveImage = async () => {
    const canvas = document.querySelector('#proximityCanvas');
    const dataUrl = canvas.toDataURL();
    // 解决导出图片模糊问题
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] === 0) {
                imageData.data[i] = 255;
                imageData.data[i + 1] = 255;
                imageData.data[i + 2] = 255;
                imageData.data[i + 3] = 255;
            }
        }
        tempCtx.putImageData(imageData, 0, 0);
        tempCtx.drawImage(img, 0, 0);
        tempCanvas.toBlob(function (blob) {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob,
                }),
            ]);
        });
    };

    closeMenu();
};
const handleTooltipAvg = () => {
    if (tooltipCheck.value) {
        myChart.config.options.plugins.tooltip.enabled = true;
    } else {
        myChart.config.options.plugins.tooltip.enabled = false;
    }
    myChart.update();
    closeMenu();
};
const handleDataReset = () => {
    let airItem = props.dataSets.find((item) => item.type === 'bar' && item.label == 'Air Toxics risk');
    if (airItem) {
        let maxValue = Math.max(...airItem.data);
        myChart.config.options.scales.yValue.max = maxValue + 10;
    }
    myChart.config.data.datasets = props.dataSets || [];
    myChart.config.data.labels = props.chartLabel || [];
    myChart.update();
};
watch(
    () => props.options,
    (val) => {
        avgOptions.value = val;
    },
    { deep: true }
);
watch(
    () => props.title,
    (val) => {
        myChart.config.options.plugins.title.text = val;
        myChart.update();
    },
    { deep: true }
);
watch(
    () => props.defaultCheckList,
    (val) => {
        avgCheckList.value = val;
    },
    { deep: true }
);
watch(
    () => props.dataSets,
    (val) => {
        handleDataReset();
    },
    { deep: true }
);
watch(
    () => props.chartLabel,
    (val) => {
        handleDataReset();
    },
    { deep: true }
);
onMounted(() => {
    Chart.register(linePlugin);
    myChart = new Chart(document.getElementById(props.type).getContext('2d'), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
            },
            scales: {
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: `(%ile)`,
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            return value + '%';
                        },
                        beginAtZero: true,
                    },
                    beginAtZero: true,
                    grid: {
                        display: true,
                    },
                },
                yValue: {
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: `(Air toxic risk value)`,
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            return value;
                        },
                        beginAtZero: true,
                    },
                    beginAtZero: true,
                    grid: {
                        display: true,
                    },
                },
                x: {
                    display: true,
                    // beginAtZero: true,
                    title: {
                        display: false,
                    },
                    grid: {
                        display: true,
                    },
                },
            },
            plugins: {
                datalabels: {
                    display: function (context) {
                        return context.dataset.type === 'bar';
                    },
                    anchor: 'end',
                    align: 'end',
                    font: {
                        size: 10,
                    },
                    formatter: (val, context) => {
                        return context.dataset.label == 'Air Toxics risk' ? val : `${val}%`;
                    },
                },
                legend: {
                    labels: {
                        usePointStyle: true,
                        // padding: 20,
                    },
                    onClick: function (event, legendItem, legend) {
                        const index = legendItem.datasetIndex;
                        const chart = legend.chart;
                        const meta = chart.getDatasetMeta(index);
                        meta.hidden = !meta.hidden;
                        chart.update();
                    },
                },
                tooltip: {
                    enabled: false,
                    usePointStyle: true,
                },
                title: {
                    display: true,
                    text: props.title,
                },
                extendLine: {
                    extendLength: 50, // 延长的长度，单位为像素
                },
            },
            animation: {},
        },
    });
});
</script>
<style scoped lang="scss">
.chart-content {
    width: 100%;
    height: 100%;
    .canvas-box {
        width: 100% !important;
        height: 100%;
    }
}
.menu-content {
    width: 170px;
    position: relative;
    .menu-item {
        width: 100%;

        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0 5px;
        &:hover {
            background: #87cefa;
        }
    }
    .national-content {
        &:hover {
            .second-menu {
                display: block;
            }
        }
    }
    .second-menu {
        display: none;
        position: absolute;
        top: 25px;
        left: 170px;
        background: #fff;
        width: 215px;
        box-sizing: border-box;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        padding: 5px;
        :deep(.el-checkbox-group) {
            display: flex;
            flex-direction: column;
        }
    }
}
</style>
<style lang="scss">
.menu-list {
    padding: 0px !important;
}
</style>
