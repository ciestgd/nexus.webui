<template>
    <div class="legend-box" :class="{ collapse: sidebarStore.collapse }">
        <div class="legend-color" ref="monitorLegendRef">
            <div class="legeng-item" v-if="majorEissionStore.isShow">
                <span class="header_circle icon-span"></span>
                <span>Emission Sources</span>
            </div>
            <div class="legeng-item" v-if="monitorSiteStore.isShow">
                <span :class="[handleClassName(), 'icon-span']"></span>
                <span>Monitor Sites</span>
            </div>
            <!-- <div class="legend-title">Legend for monitor sites or facilities (concentration/emission amount):</div>
            <div class="legend-content">
                Low
                <div class="color-box">
                    <span class="color-item no-data-color" v-if="monitorSiteStore.isShow" :style="{ background: `rgb(204,204,204)` }"></span>
                    <span class="color-item" v-for="item in list" :style="{ background: `rgb(${item})` }"></span>
                </div>
                High
            </div> -->
        </div>
    </div>
</template>
<script setup>
import domtoimage from 'dom-to-image';
// import { colorList } from '@/libs/color-list.js';
import { useSidebarStore } from '../../../store/sidebar';
import { useMonitorSiteStore } from '@/store/monitor-site';
import { useMajorEissionStore } from '@/store/major-eission-sources.js';
const monitorSiteStore = useMonitorSiteStore();
const majorEissionStore = useMajorEissionStore();
const sidebarStore = useSidebarStore();
// const list = ref(colorList);
const monitorLegendRef = ref();
const handleClassName = () => {
    const imgType = {
        PM25: 'triangle',
        O3: 'start',
        GAS: 'rhombus',
        HAPs: 'square',
    };
    return `header_${imgType[monitorSiteStore.type]}`;
};
const getImage = () => {
    return new Promise((resolve, reject) => {
        domtoimage
            .toPng(monitorLegendRef.value)
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
.legend-box {
    position: fixed;
    bottom: 40px;
    left: 525px;
    z-index: 1;
    transition: 0.5s;
    &.collapse {
        left: 163px;
    }
}
.legend-color {
    height: 70px;
    box-sizing: border-box;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    box-sizing: border-box;
    // padding-top: 30px;
    .legeng-item {
        display: flex;
        // justify-content: center;
        align-items: center;
        font-size: 20px;
        .icon-span {
            margin-right: 5px;
        }
        .header_triangle {
            display: inline-block;
            width: 0;
            height: 0;
            border: 10px solid var(--point-color);
            border-bottom-color: transparent;
            border-left-color: transparent;
            border-right-color: transparent;
            position: relative;
            top: 6px;
        }
        .header_start {
            position: relative;
            width: 0px;
            height: 0px;
            border-color: var(--point-color) transparent transparent transparent;
            border-width: 7.26px 10.62px;
            border-style: solid;
            top: 4px;
            margin-left: 7px;
        }

        .header_start::before {
            content: '';
            display: block;
            position: absolute;
            left: -10.62px;
            top: -7.26px;
            border-color: var(--point-color) transparent transparent transparent;
            border-width: 7.26px 10.62px;
            border-style: solid;
            transform: rotate(72deg);
            transform-origin: 50% 22.5%;
        }

        .header_start::after {
            content: '';
            display: block;
            position: absolute;
            left: -10.62px;
            top: -7.26px;
            border-color: var(--point-color) transparent transparent transparent;
            border-width: 7.26px 10.62px;
            border-style: solid;
            transform: rotate(-72deg);
            transform-origin: 50% 22.5%;
        }
        .header_rhombus {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: var(--point-color);
            margin-left: 10px;
            transform: rotate(45deg);
        }
        .header_square {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: var(--point-color);
            margin-left: 10px;
        }
        .header_circle {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--point-color);
            // position: relative;
            // top: 8px;
        }
    }
    .legeng-item + .legeng-item {
        margin-top: 20px;
    }

    // padding: 5px;
    // .legend-content {
    //     display: flex;
    //     align-items: center;
    //     margin-top: 5px;
    //     .color-box {
    //         flex: 1;
    //         height: 15px;
    //         margin: 0 5px;
    //         .color-item {
    //             display: inline-block;
    //             height: 100%;
    //             width: 1.41px;
    //         }
    //         .no-data-color {
    //             width: 3px;
    //         }
    //     }
    // }
}
</style>
