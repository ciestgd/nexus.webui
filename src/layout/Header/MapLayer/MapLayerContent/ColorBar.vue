<template>
    <Dialog title="Configure Legend" width="430" ref="colorBarRef" height="690">
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
                <div class="header-item">
                    Palette Type:
                    <el-select v-model="paletteTypeValue" @change="hanglePaleteChange" class="palette-type-select" size="small" placeholder="Select">
                        <el-option v-for="item in paletteTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
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
                <div class="configuration">
                    <span>Scale: </span>
                    <el-select v-model="scaleValue" class="configuration-input" size="small" placeholder="Select">
                        <el-option v-for="item in scaleOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>
                <div class="range-box">
                    <div class="configuration"><span>Min:</span> <el-input v-model="minValue" @change="checkMinValue" class="configuration-input" size="small"></el-input></div>
                    <div class="configuration"><span>Max:</span> <el-input v-model="maxValue" @change="checkMaxValue" class="configuration-input" size="small"></el-input></div>
                    <el-button size="small" @click="resetRange">Rebuild</el-button>
                </div>
                <div class="set-list">
                    <div class="set-content">
                        <div class="set-title set-color-item">Symbol</div>
                        <div class="set-color-item" v-for="item in labelList">
                            <el-color-picker class="color-picker" color-format="hex" v-model="item.color" show-alpha />
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
            </div>
        </div>
    </Dialog>
</template>
<script setup>
// import { useMyLayerColorStore } from '@/store/my-layer-color';
import { ElMessageBox } from 'element-plus';
// const myLayerColorStore = useMyLayerColorStore();
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
});
const emit = defineEmits(['handleSubmit']);
const colorBarRef = ref();
const activeIndex = ref();
const scaleOptions = ref([
    { label: 'Linear', value: 1 },
    { label: 'Logarithmic', value: 2 },
    { label: 'Custom', value: 3 },
]);
const paletteTypeOptions = ref([
    { label: 'Color Ramp', value: 1 },
    { label: 'Single Sequential', value: 2 },
    { label: 'Double Sequential', value: 3 },
    { label: 'Rscale', value: 4 },
    { label: 'Others', value: 5 },
]);
const opacityValue = ref(props.data.opacityValue);
const minValue = ref(props.data.min);
const maxValue = ref(props.data.max);
const scaleValue = ref(props.data.scaleValue);
const labelList = ref(props.data.children);
const paletteTypeValue = ref(1);
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
const checkMinValue = () => {
    let min = minValue.value;
    let max = maxValue.value;
    if (checkNumber(min)) {
        ElMessageBox.alert(`Please enter the correct data`, 'Tip', {
            confirmButtonText: 'OK',
        });
        minValue.value = '';
        return;
    }
    if (Number(max) < Number(min)) {
        ElMessageBox.alert(`Please enter the correct data`, 'Tip', {
            confirmButtonText: 'OK',
        });
        minValue.value = '';
        return;
    }
};
const checkMaxValue = () => {
    let min = minValue.value;
    let max = maxValue.value;
    if (checkNumber(max)) {
        ElMessageBox.alert(`Please enter the correct data`, 'Tip', {
            confirmButtonText: 'OK',
        });
        maxValue.value = '';
        return;
    }
    if (Number(max) < Number(min)) {
        ElMessageBox.alert(`Please enter the correct data`, 'Tip', {
            confirmButtonText: 'OK',
        });
        maxValue.value = '';
        return;
    }
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
    let step = 0;
    if (min < 0) {
        step = (Math.abs(min) + Math.abs(max)) / 7;
    } else {
        step = (Math.abs(max) - Math.abs(min)) / 7;
    }

    step = Math.ceil(step * 100) / 100;
    labelList.value.forEach((item, index) => {
        let minVal = max - (index + 1) * step;
        let maxVal = max - index * step;
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
    if (index !== 0) {
        labelList.value[index - 1].min = Number(max);
    }
};
const resetList = () => {
    labelList.value.forEach((item) => {
        let color = item.color;
        if (color.length > 8) {
            color = color.slice(0, color.length - 2);
        }
        item.color = getHexOpacityColor(color, opacityValue.value);
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
const colorList = ref([]);
const colorRamp = ref([
    {
        name: 'GreyToRed',
        colors: ['#E5E5FF', '#0043FF', '#00AAFF', '#72FF00', '#F6FF00', '#FF9000', '#FF0C00'],
    },
    {
        name: 'Newton RGB (InkJet)',
        colors: ['#0000FF', '#00AAFF', '#00FFAA', '#00FF00', '#AAFF00', '#FFAA00', '#B30000'],
    },
    {
        name: 'BlueDarkRed',
        colors: ['#00007F', '#0010FF', '#00A0FF', '#D2D2D2', '#C1FF3D', '#FFAC00', '#FF1C00'],
    },
    {
        name: 'BlueWhiteRed',
        colors: ['#1B2C62', '#0010FF', '#97D6F4', '#E8F6FC', '#FEF5CD', '#FEB032', '#E54829'],
    },
    {
        name: 'red2black',
        colors: ['#fd0000', '#c500ff', '#0071fd', '#4ce700', '#fffe00', '#C88438', '#000000'],
    },
    {
        name: 'RedYellowGray',
        colors: ['#D8DBDF', '#C6C9CD', '#B3B7BB', '#A0A4A7', '#EBEFAC', '#DFBB72', '#BF6F72'],
    },
    {
        name: 'DeepBlueGray',
        colors: ['#C1E7F8', '#9FDBF7', '#74BBE5', '#4C94CE', '#2F69B1', '#20468A', '#1B2C62'],
    },
]);
const singleSel = ref([
    {
        name: 'light to dark red',
        colors: ['#FFFFFF', '#FFAAAA', '#FF5555', '#FF0000', '#FF0000', '#CC0000', '#990000'],
    },
    {
        name: 'light to dark orange',
        colors: ['#FFFFFF', '#FFD5AA', '#FFAA55', '#FF8000', '#FF8000', '#CC6600', '#994D00'],
    },
    {
        name: 'light to dark yellow',
        colors: ['#FFFFFF', '#FFF9AA', '#FFF455', '#FFEE00', '#FFEE00', '#CCBE00', '#998F00'],
    },
    {
        name: 'light to dark green',
        colors: ['#FFFFFF', '#C6FFAA', '#8EFF55', '#55FF00', '#55FF00', '#44CC00', '#339900'],
    },
    {
        name: 'light to dark cyan',
        colors: ['#FFFFFF', '#AAFFF7', '#55FFEE', '#00FFE6', '#00FFE6', '#00CCB8', '#00998A'],
    },
    {
        name: 'ligh to dark blue',
        colors: ['#FFFFFF', '#AADEFF', '#55BEFF', '#009DFF', '#009DFF', '#007ECC', '#005E99'],
    },
    {
        name: 'light to dark purple',
        colors: ['#FFFFFF', '#CDAAFF', '#9C55FF', '#6A00FF', '#6A00FF', '#5500CC', '#400099'],
    },
    {
        name: 'GreyToRed',
        colors: ['#FFFFFF', '#E6E6E6', '#B6B6B6', '#929292', '#6D6D6D', '#494949', '#242424'],
    },
]);
const doubleSel = ref([
    {
        name: 'blue to light to red',
        colors: ['#0011FF', '#404CFF', '#8088FF', '#BFC4FF', '#FFAAAA', '#FF5555', '#FF0000'],
    },
    {
        name: 'green to light to red',
        colors: ['#00FF37', '#40FF69s', '#80FF9B', '#BFFFCD', '#FFAAAA', '#FF5555', '#FF0000'],
    },
    {
        name: 'blue to light to yellow',
        colors: ['#0055FF', '#407FFF', '#80AAFF', '#BFD5FF', '#FFF7AA', '#FFEE55', '#FFE600'],
    },
    {
        name: 'light blue to light ti red',
        colors: ['#00FFFF', '#40FFFF', '#80FFFF', '#BFFFFF', '#FFAAF1', '#FF55E3', '#FF00D5'],
    },
    {
        name: 'green to light to yellow',
        colors: ['#1AFF00', '#53FF40', '#8CFF80', '#C6FFBF', '#F4FFAA', '#E9FF5F', '#DDFF00'],
    },
]);
const rscale = ref([
    {
        name: 'Viridis',
        colors: ['#FEE825', '#A0DB39', '#4CC36D', '#20A387', '#27818F', '#355E8D', '#463681'],
    },
    {
        name: 'Magma',
        colors: ['#FEEDB0', '#F7B27B', '#EA7758', '#CD4257', '#9C2363', '#63185B', '#2C2B57'],
    },
    {
        name: 'Plasma',
        colors: ['#E8FA5B', '#F9C641', '#FA9541', '#E17262', '#B56180', '#88528D', '#5E3F9A'],
    },
]);
const otherColor = ref([
    {
        name: 'Spring',
        colors: ['#FF0000', '#FF2A00', '#FF5500', '#FF7F00', '#FFAA00', '#FFD400', '#FFFF00'],
    },
    {
        name: 'Summer',
        colors: ['#007F66', '#2A9466', '#55AA66', '#7FBF66', '#AAD466', '#D4E966', '#FFFF66'],
    },
    {
        name: 'Autumn',
        colors: ['#FF2F2F', '#FF2A00', '#FF5500', '#FF7F00', '#FFAA00', '#FFD400', '#FFFF00'],
    },
    {
        name: 'Winter',
        colors: ['#0000FF', '#002AE9', '#0055D4', '#007FBF', '#00AAA9', '#00D494', '#00FF7F'],
    },
    {
        name: 'Gray',
        colors: ['#000000', '#2A2A2A', '#555555', '#7F7F7F', '#AAAAAA', '#D4D4D4', '#FFFFFF'],
    },
    {
        name: 'Jet',
        colors: ['#0000FF', '#007FFF', '#00FFFF', '#7FFF7F', '#FFFF00', '#FF7F00', '#FF0000'],
    },
    {
        name: 'Hot',
        colors: ['#7F0000', '#FF0000', '#FF7F00', '#FFFF00', '#FFFF55', '#FFFFAA', '#FFFFFF'],
    },
    {
        name: 'Cool',
        colors: ['#00FFFF', '#2AD4FF', '#55A9FF', '#7F7FFF', '#AA54FF', '#D42AFF', '#FF00FF'],
    },
]);
colorList.value = colorRamp.value;
const hanglePaleteChange = () => {
    let val = paletteTypeValue.value;
    let optionsList = {
        1: colorRamp.value,
        2: singleSel.value,
        3: doubleSel.value,
        4: rscale.value,
        5: otherColor.value,
    };
    colorList.value = optionsList[val];
    let data = colorList.value[0];
    handleColorSelect(data, 0);
};
const handleColorSelect = (data, index) => {
    activeIndex.value = index;
    let colors = data.colors;
    colors.forEach((item, _index) => {
        let labelIndex = labelList.value.length - 1 - _index;
        let color = getHexOpacityColor(item, opacityValue.value);
        labelList.value[labelIndex].color = color;
    });
};
const setColor = () => {
    let id = props.data.id;
    emit('handleSubmit', {
        id: id,
        data: {
            children: labelList.value,
            min: minValue.value,
            max: maxValue.value,
            scaleValue: scaleValue.value,
            opacityValue: opacityValue.value,
        },
    });
    // let list = myLayerColorStore[props.type][0];
    // list.children.forEach((item) => {
    //     if (item.id === id) {
    //         item.children = labelList.value;
    //         item.min = minValue.value;
    //         item.max = maxValue.value;
    //         item.scaleValue = scaleValue.value;
    //         item.opacityValue = opacityValue.value;
    //     }
    // });
    // sessionStorage.setItem(props.type, JSON.stringify(myLayerColorStore[props.type]));
};
const handleSelect = () => {
    setColor();
    colorBarRef.value.handleClose();
};
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
        height: 265px;
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
