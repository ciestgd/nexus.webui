<template>
    <Dialog title="Configure Circle Color Bar" width="400" height="135" ref="colorBarRef">
        <div class="color-main">
            <div class="color-header">
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
            <div class="color-content color-palette" v-show="false">
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
            <div class="color-content color-title" v-show="false">
                <span class="title">Title</span>
                <div class="title-list">
                    <div class="title-item" v-for="item in labelList.filter(filterListFn)">
                        <div class="title-item-text"><span>Text:</span> <el-input style="width: 130px" v-model="item.text" :readonly="item.display" size="small"></el-input></div>
                        <div class="title-item-color"><span>Color:</span> <el-color-picker :disabled="item.colorDisplay" color-format="hex" v-model="item.color" show-alpha /></div>
                        <div class="title-item-color"><span>Width:</span> <el-input v-model="item.width" :step="0.1" :min="0.5" type="number" size="small"></el-input></div>
                        <div class="title-item-checkbox" v-if="!item.display"><el-checkbox v-model="item.checkbox">Show Title</el-checkbox></div>
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
import { useLegendColorStore } from '@/store/legend-color';
import { useSidebarStore } from '@/store/sidebar';
const legendColorStore = useLegendColorStore();
const sidebarStore = useSidebarStore();
const props = defineProps({
    list: {
        type: Array,
        default: () => [],
    },
});

const colorBarRef = ref();
const activeIndex = ref();
const opacityValue = ref(70);
if (sessionStorage.getItem('opacityValue')) {
    opacityValue.value = Number(sessionStorage.getItem('opacityValue'));
}
const filterListFn = (item, index) => {
    if ([7, 8].indexOf(index) === -1) {
        return true;
    } else if (index === 7) {
        return sidebarStore.ejSelect;
    } else {
        return sidebarStore.heatIndexSelect;
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
const colorList = ref([
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
]);
const labelList = ref(props.list);
const handleColorSelect = (data, index) => {
    activeIndex.value = index;
    let colors = data.colors;
    colors.forEach((item, _index) => {
        let color = getHexOpacityColor(item, opacityValue.value);
        labelList.value[_index].color = color;
    });
};
const setColor = () => {
    sessionStorage.setItem('labelList', JSON.stringify(labelList.value));
    sessionStorage.setItem('opacityValue', opacityValue.value);
    legendColorStore.labelList = JSON.parse(JSON.stringify(labelList.value));
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
        height: 180px;
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
        height: 350px;
        .title-list {
            .title-item {
                display: flex;
                align-items: center;
                .title-item-text,
                .title-item-color,
                .title-item-checkbox {
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    span {
                        margin-right: 5px;
                    }
                }
                .title-item-color,
                .title-item-checkbox {
                    margin-left: 10px;
                }
            }
            .title-item + .title-item {
                margin-top: 5px;
            }
        }
    }
    .color-footer {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
