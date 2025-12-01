<template>
    <Dialog title="Configure Boundary Style" width="400" height="420" ref="colorBarRef">
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
            <div class="color-content color-title">
                <span class="title">Title</span>
                <div class="title-list">
                    <div class="title-item" v-for="item in labelList">
                        <div class="title-item-text"><span>Text:</span> <el-input style="width: 130px" v-model="item.label" readonly size="small"></el-input></div>
                        <div class="title-item-color"><span>Color:</span> <el-color-picker color-format="hex" v-model="item.color" show-alpha /></div>
                        <div class="title-item-color"><span>Width:</span> <el-input v-model="item.width" :min="0.5" :step="0.1" type="number" size="small"></el-input></div>
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
import boundaryLayers, { getStyle } from '@/libs/map/layers/boundary-layers';
import { useBoundaryLayersStyleStore } from '@/store/boundary-layers-style.js';
const colorBarRef = ref();
const opacityValue = ref(75);
const emits = defineEmits(['handleSetColor']);
const boundaryLayersStyleStore = useBoundaryLayersStyleStore();

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

const labelList = ref([]);
onMounted(() => {
    boundaryLayers.forEach((item) => {
        let title = item.get('title');
        let color = item.get('color');
        let width = item.get('width');
        labelList.value.push({
            label: title,
            color,
            width,
        });
    });
    opacityValue.value = boundaryLayersStyleStore.opacityValue;
});
const setColor = () => {
    boundaryLayersStyleStore.opacityValue = opacityValue.value;
    labelList.value.forEach((item, index) => {
        boundaryLayers[index].set('width', item.width);
        boundaryLayers[index].set('color', item.color);
        boundaryLayers[index].setStyle(getStyle(item.width, item.color));
    });
    boundaryLayersStyleStore.list = JSON.parse(JSON.stringify(labelList.value));
    emits('handleSetColor');
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
        height: 275px;
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
