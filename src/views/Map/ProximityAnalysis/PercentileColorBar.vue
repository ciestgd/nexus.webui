<template>
    <Dialog title="Configure Legend" width="430" ref="colorBarRef" height="590">
        <div class="color-main">
            <div class="color-header">
                <div class="header-item">
                    Color Opacity:<el-input-number
                        style="margin-left: 5px"
                        @change="resetList"
                        v-model="opacityValue"
                        class="sites-number"
                        size="small"
                        :min="0"
                        :max="100"
                        controls-position="right"
                    />
                </div>
            </div>
            <div class="color-content color-palette">
                <span class="title">Palette</span>
                <div class="color-list">
                    <div
                        class="color-item"
                        :class="[activeIndex == index ? 'activeClass' : '']"
                        @click="handleColorSelect(colorItem, index)"
                        v-for="(colorItem, index) in colorList"
                    >
                        <span class="color-box" :style="{ background: item }" v-for="item in colorItem.colors"></span>
                        <span class="color-name">{{ colorItem.name }}</span>
                    </div>
                </div>
            </div>
            <div class="color-title">
                <div class="range-box">
                    <div class="configuration"><span>Min:</span> <el-input v-model="minValue" class="configuration-input" size="small"></el-input></div>
                    <div class="configuration"><span>Max:</span> <el-input v-model="maxValue" class="configuration-input" size="small"></el-input></div>
                    <el-button size="small" @click="resetRange">Rebuild</el-button>
                </div>
                <div class="set-list">
                    <div class="set-content">
                        <div class="set-title set-color-item">Symbol</div>
                        <div class="set-color-item" v-for="item in labelList">
                            <el-color-picker class="color-picker" color-format="hex" v-model="item.bgColor" show-alpha />
                        </div>
                    </div>
                    <div class="set-content" style="margin: 0 5px">
                        <div class="set-title set-color-item">Range</div>
                        <div class="set-color-item" v-for="item in labelList">
                            {{ item.min }}
                        </div>
                    </div>
                    <div class="set-content">
                        <div class="set-title set-color-item">Max</div>
                        <div class="set-color-item" v-for="(item, index) in labelList">
                            <el-input v-model="item.max" @change="setMaxValue(index)" class="range-input"></el-input>
                        </div>
                    </div>
                </div>
            </div>
            <div class="color-footer">
                <el-button @click="setColor">Apply</el-button>
                <el-button @click="handleSelect">OK</el-button>
                <el-button @click="handleCancel">Cancel</el-button>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useEJReportStore } from '@/store/ejscreen-report';
import { ElMessageBox } from 'element-plus';
const proximityAnalysisStore = useProximityAnalysisStore();
const ejReportStore = useEJReportStore();

const props = defineProps({
    storeKey: {
        type: String,
        default: 'percentilColor',
    },
    storeType: {
        type: String,
        default: 'proximityAnalysisStore',
    },
});

const colorBarRef = ref();
const activeIndex = ref();

const opacityValue = ref();
const minValue = ref();
const maxValue = ref();
const labelList = ref();
const baseColor = ref();
const checkNumber = (val) => {
    let exp = /^[+-]?\d*(\.\d*)?(e[+-]?\d+)?$/;
    let value = val;
    let flag = false;
    if (value.constructor === String) {
        value = value.trim();
    }
    if (value === '' || !exp.test(value)) {
        flag = true;
    }
    return flag;
};
const resetRange = () => {
    let min = minValue.value;
    let max = maxValue.value;
    if (checkNumber(min) || checkNumber(max)) {
        ElMessageBox.alert(`Please enter the correct data`, 'Tip', {
            confirmButtonText: 'OK',
        });
        return;
    }
    min = Number(min);
    max = Number(max);
    let num = Math.abs(max) - Math.abs(min);
    let step = Math.ceil(num / 3);
    labelList.value.forEach((item, index) => {
        let minVal = max - (3 - index) * step;
        let maxVal = max - (3 - index - 1) * step;
        minVal = Math.floor(minVal * 100) / 100;
        maxVal = Math.floor(maxVal * 100) / 100;
        item.max = maxVal;
        item.min = minVal < min ? min : minVal;
    });
};
const setMaxValue = (index) => {
    let item = labelList.value[index];
    let max = item.max;
    let min = item.min;
    if (checkNumber(max)) {
        ElMessageBox.alert(`Please enter the correct data`, 'Tip', {
            confirmButtonText: 'OK',
        });
        item.max = '';
        return;
    }
    if (Number(max) < Number(min)) {
        ElMessageBox.alert(`Please enter the correct data`, 'Tip', {
            confirmButtonText: 'OK',
        });
        item.max = '';
        return;
    }
    if (index !== 12) {
        labelList.value[index + 1].min = Number(max);
    }
};
const resetList = () => {
    labelList.value.forEach((item) => {
        let color = item.bgColor;
        if (color.length > 8) {
            color = color.slice(0, color.length - 2);
        }
        item.bgColor = getHexOpacityColor(color, opacityValue.value);
    });
};
function getHexOpacityColor(color = '#000', opacityVulue) {
    let opacity = opacityVulue / 100;
    opacity = Math.max(opacity, 0);
    opacity = Math.min(opacity, 1);
    color = color.replace(/\#/g, '').toUpperCase();
    if (color.length === 3) {
        let arr = color.split('');
        color = '';
        for (let i = 0; i < arr.length; i++) {
            color += arr[i] + arr[i]; //将简写的3位字符补全到6位字符
        }
    }
    let num = Math.round(255 * opacity); //四舍五入
    let str = '';
    let arrHex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']; //十六进制数组
    while (num > 0) {
        let mod = num % 16;
        num = (num - mod) / 16;
        str = arrHex[mod] + str;
    }
    if (str.length == 1) str = '0' + str;
    if (str.length == 0) str = '00';
    return `#${color + str}`;
}
const colorList = ref([
    {
        name: 'Red2Blue',
        colors: ['#FFFF00', '#FF8C00', '#FF0000'],
    },
    {
        name: 'Autumn',
        colors: ['#FF0000', '#FF5500', '#FFAA00'],
    },
    {
        name: 'Cool',
        colors: ['#00FFFF', '#55A9FF', '#AA54FF'],
    },
    {
        name: 'Gray',
        colors: ['#000000', '#555555', '#AAAAAA'],
    },
    {
        name: 'Hot',
        colors: ['#0A0000', '#E90000', '#FFC900'],
    },
    {
        name: 'Jet',
        colors: ['#00008F', '#00DFFF', '#FFCF00'],
    },
    {
        name: 'Spring',
        colors: ['#FF0000', '#FF5500', '#FFAA00'],
    },
    {
        name: 'Summer',
        colors: ['#007F66', '#55AA66', '#AAD466'],
    },
    {
        name: 'Winter',
        colors: ['#0000FF', '#0055D4', '#00AAA9'],
    },
]);
const hex = (num) => {
    if (num > 255) {
        throw "'" + num + "'' is greater than 255(0xff);";
    }
    let str = Number(num).toString(16);
    return ('0' + str).slice(-2);
};
const hexToArgb = (hexData, opacityVulue) => {
    let hexColor = hexData;
    if (hexColor.length > 8) {
        hexColor = hexColor.slice(0, hexColor.length - 2);
    }
    hexColor = hexColor.toLowerCase();
    hexColor = hexData.replace(/#/gi, '');
    let opacity = opacityVulue / 100;
    opacity = Math.max(opacity, 0);
    opacity = Math.min(opacity, 1);
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const argb = hex(Math.round(opacity * 256 - 1)) + hex(r) + hex(g) + hex(b);
    return argb;
};

const handleColorSelect = (data, index) => {
    activeIndex.value = index;
    let colors = data.colors;
    colors.forEach((item, _index) => {
        let labelIndex = _index;
        let color = getHexOpacityColor(item, opacityValue.value);
        labelList.value[labelIndex].bgColor = color;
    });
};
const setColor = () => {
    labelList.value.forEach((item) => {
        let color = item.bgColor;
        if (color.length > 8) {
            color = color.slice(0, color.length - 2);
        }
        item.bgColor = getHexOpacityColor(color, opacityValue.value);
        let excelColor = hexToArgb(item.bgColor, opacityValue.value);
        item.excelColor = excelColor;
        item.label = `${item.min}-${item.max}th percentile`;
    });
    handleSetData({
        list: labelList.value,
        max: maxValue.value,
        min: minValue.value,
        opacity: opacityValue.value,
    });
};
const handleSetData = ({ list, max, min, opacity }) => {
    if (props.storeType === 'proximityAnalysisStore') {
        proximityAnalysisStore[props.storeKey].opacity = opacity;
        proximityAnalysisStore[props.storeKey].min = min;
        proximityAnalysisStore[props.storeKey].max = max;
        proximityAnalysisStore[props.storeKey].list = list;
    } else {
        ejReportStore[props.storeKey].opacity = opacity;
        ejReportStore[props.storeKey].min = min;
        ejReportStore[props.storeKey].max = max;
        ejReportStore[props.storeKey].list = list;
    }
};
const handleSelect = () => {
    setColor();
    colorBarRef.value.handleClose();
};
const handleCancel = () => {
    let initData = JSON.parse(JSON.stringify(baseColor.value));
    handleSetData(initData);
    colorBarRef.value.handleClose();
};
onMounted(() => {
    let colorData = props.storeType === 'proximityAnalysisStore' ? proximityAnalysisStore[props.storeKey] : ejReportStore[props.storeKey];
    baseColor.value = JSON.parse(JSON.stringify(colorData));
    let initData = JSON.parse(JSON.stringify(baseColor.value));
    opacityValue.value = initData.opacity;
    minValue.value = initData.min;
    maxValue.value = initData.max;
    labelList.value = initData.list;
});
</script>
<style scoped lang="scss">
.color-main {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 5px;
    .color-header {
        font-size: 12px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        .header-item {
            display: flex;
            align-items: center;
        }
        .header-item + .header-item {
            margin-left: 5px;
        }
        .palette-type-select {
            margin-left: 5px;
            width: 120px;
        }
    }
    .color-content {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 4px;
        position: relative;
        box-sizing: border-box;
        padding: 10px;
        .title {
            position: absolute;
            font-size: 14px;
            top: -9px;
            left: 10px;
            background: #fff;
        }
    }
    .color-palette {
        // height: 265px;
        margin-top: 5px;
        padding: 10px 5px;
        .color-list {
            .color-item {
                display: flex;
                align-items: center;
                cursor: pointer;
                box-sizing: border-box;
                padding: 5px;
                .color-box {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                }
                .color-box + .color-box {
                    margin-left: 5px;
                }
                .color-name {
                    font-size: 14px;
                    margin-left: 15px;
                }
            }

            .activeClass {
                background: #87cefa;
            }
        }
    }
    .color-title {
        margin-top: 20px;
        .set-list {
            display: flex;
            margin-top: 15px;
            .set-content {
                flex: 1;

                .set-color-item {
                    height: 24px;
                    font-size: 14px;
                    text-align: center;
                    border: 1px solid #ccc;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    :deep(.el-color-picker) {
                        width: 100%;
                    }
                    :deep(.el-color-picker__trigger) {
                        width: 100%;
                        height: 24px;
                        padding: 0;
                        border: none;
                        border-radius: 0;
                    }
                    :deep(.el-color-picker__color) {
                        border: none;
                        border-radius: 0;
                    }
                    :deep(.el-color-picker__icon) {
                        display: none;
                    }
                    .range-input {
                        height: 100%;
                        border: none;
                        text-align: center;
                        :deep(.el-input__wrapper) {
                            height: 100%;
                            padding: 0;
                            border-radius: 0;
                            border: 0;
                        }
                        :deep(.el-input__inner) {
                            height: 100%;
                            border: 0;
                            outline: none;
                            text-align: center;
                        }
                    }
                }
                .set-color-item + .set-color-item {
                    margin-top: 2px;
                }
            }
        }
    }
    .range-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 5px;
    }
    .configuration {
        display: flex;
        align-items: center;
        text-align: right;
        span {
            display: inline-block;
            text-align: right;
            width: 38px;
        }
        .configuration-input {
            width: 110px;
            margin-left: 5px;
        }
    }
    .color-footer {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
