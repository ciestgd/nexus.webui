<template>
    <Dialog width="80%" style="height: 90%" :isModal="true" @closed="closeFn" :isNeetHeader="false" ref="quickStartRef">
        <div class="quick-start-content">
            <div class="quick-start-main">
                <el-carousel ref="carouselRef" class="carousel-box" :autoplay="false" arrow="always" @change="handleCarouselChange">
                    <el-carousel-item v-for="(item, index) in imgLength" :key="item">
                        <div class="img-box">
                            <img :src="getImage(index)" alt="" />
                            <!-- <div class="img-menus" v-if="index === 0">
                                <div class="img-menus-title">Quick Start Guide for Nexus Web Tool</div>
                                <div class="img-menus-content">
                                    Below are the main modules for Nexus web tool. Click on the module of interest to access the corresponding start guide. See the location of each
                                    module according to the arrow (<img :src="arrowImg" class="arrowImg" />) in the following start guide.
                                    <ol class="menus-list" ref="menusRef">
                                        <li v-for="(_item, _index) in menusList" @click="handleClick(_item)">{{ _item.label }}</li>
                                    </ol>
                                </div>
                            </div> -->
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
            <div class="quick-start-footer">
                <div class="quick-close-tips">
                    <div>Press Esc or click "Close" button to exit.</div>
                    <div>Show it again by clicking on the "Quick Start Guide" menu located on the top-right corner of the home page.</div>
                </div>
                <div class="button-box">
                    <el-button type="primary" class="quick-start-close" size="large" @click="closeDialog">Close</el-button>
                    <div class="quick-start-tips"><el-checkbox style="margin-right: 5px" v-model="checked" size="small" />Don't show again</div>
                </div>
                <div class="image-index">
                    <el-button type="primary" class="quick-start-close" style="margin-right: 10px" v-if="false" size="large" @click="gotoFirstPage">Back to 1st page</el-button
                    >{{ activeIndex }}/{{ imgLength }}
                </div>
            </div>
        </div>
    </Dialog>
</template>
<script>
export default {
    name: 'QuickStart',
};
</script>
<script setup>
// import arrowImg from '@/assets/images/arrow.png';
const checked = ref(false);
const quickStartRef = ref(null);
const activeIndex = ref(1);
const carouselRef = ref();
const imgLength = 4
const closeFn = () => {
    if (checked.value) {
        localStorage.setItem('quickStart', 'true');
    }
};
const menusRef = ref();
const getImage = (index) => {
    let name = 'nexus_' + (index + 1);
    return new URL(`../../../assets/images/carousel-img/${name}.png`, import.meta.url).href;
};
const handleCarouselChange = (index) => {
    activeIndex.value = index + 1;
};
const closeDialog = () => {
    quickStartRef.value.handleClose();
};
const handleClick = (item) => {
    carouselRef.value.setActiveItem(item.index - 1);
};
const gotoFirstPage = () => {
    carouselRef.value.setActiveItem(0);
};
const menusList = ref([
    { label: 'Set-up threshold', index: 5 },
    { label: 'Base Map', index: 6 },
    { label: 'Map Layer', index: 7 },
    { label: 'Data', index: 8 },
    { label: 'MP Risk Ranking', index: 12 },
    { label: 'Emission Sources', index: 14 },
    { label: 'Monitoring Sites/Data', index: 19 },
    { label: 'Meteorological Sites', index: 20 },
    { label: 'Proximity Analysis', index: 21 },
]);
</script>
<style scoped lang="scss">
.quick-start-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    .quick-start-main {
        flex: 1;
        // background: #99a9bf;
        .carousel-box {
            width: 100%;
            height: 100%;
            :deep(.el-carousel__container) {
                height: 100%;
            }
            :deep(.el-carousel__arrow) {
                background-color: rgba(31, 45, 61, 0.51);
                height: 56px;
                width: 56px;
                .el-icon {
                    width: 26px;
                    height: 26px;
                    svg {
                        width: 26px;
                        height: 26px;
                    }
                }
            }
        }
        .img-box {
            width: 100%;
            height: 100%;
            position: relative;
            img {
                width: 100%;
                height: 100%;
            }
            .img-menus {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 60%;
                height: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                flex-direction: column;
                .img-menus-title {
                    width: 100%;
                    height: 40px;
                    line-height: 40px;
                    background: #0071bc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 1.5rem;
                    // font-family: 'Times New Roman';
                    font-weight: 500;
                }
                .img-menus-content {
                    width: 100%;
                    flex: 1;
                    background: rgba(134, 134, 134, 0.7);
                    // background: #868686;
                    box-sizing: border-box;
                    padding: 0.625rem;
                    color: #fff;
                    font-size: 1.5rem;
                    font-family: Calibri, sans-serif;
                    font-weight: bold;
                    .arrowImg {
                        width: 1.25rem;
                        height: 1.5625rem;
                        position: relative;
                        top: 0.3125rem;
                    }
                    .menus-list {
                        li {
                            cursor: pointer;
                            text-decoration: underline;
                            margin-bottom: 0.1875rem;
                            // color: #0563C1;
                        }
                    }
                }
            }
        }
    }
    .quick-start-footer {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 60px;
        box-sizing: border-box;
        padding: 10px;
        // background: #ccc;
        background: #99a9bf;
        .quick-start-tips {
            font-size: 20px;
            color: #000;
            display: flex;
            align-items: center;
            // margin-left: 5px;
        }
        .quick-start-close {
            margin-right: 5px;
            font-size: 20px;
            height: unset;
        }
        .quick-close-tips {
            line-height: 16px;
            font-size: 14px;
            color: green;
            width: 40%;
        }
        .button-box {
            display: flex;
            align-items: center;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }
        .image-index {
            font-size: 18px;
            color: #000;
            font-weight: bold;
            // align-self: flex-end;
            justify-self: flex-end;
        }
    }
}
@media screen and (max-width: 1440px) and (min-width: 1024px) {
    .quick-start-content {
        .quick-start-main {
            .img-box {
                .img-menus {
                    .img-menus-title {
                        font-size: 18px;
                    }
                    .img-menus-content {
                        font-size: 18px;
                        .arrowImg {
                            width: 16px;
                            height: 20px;
                        }
                    }
                }
            }
        }
    }
}

@media screen and (max-width: 1024px) {
    .quick-start-content {
        .quick-start-main {
            .img-box {
                .img-menus {
                    .img-menus-title {
                        font-size: 14px;
                    }
                    .img-menus-content {
                        font-size: 14px;
                        .arrowImg {
                            width: 12px;
                            height: 16px;
                        }
                    }
                }
            }
        }
    }
}
</style>
