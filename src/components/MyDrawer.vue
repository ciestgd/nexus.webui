<template>
    <div :class="['my-drawer', , isfullscreen ? 'my-drawer-full' : `my-drawer-${props.direction}`]">
        <el-tooltip effect="customized" :content="tooltip" placement="top">
            <div :class="['my-drawer-fold-button', `my-drawer-fold-${props.direction}`]" @click="setDrawerShow">
                <Icon class="icon-button icon" :name="iconName" size="26" />
            </div>
        </el-tooltip>
        <div class="my-drawer-content" :class="[contentClassName]">
            <div :class="['my-drawer-resize', `my-drawer-resize-${props.direction}`]" v-show="!isfullscreen" ref="resizeElL"></div>
            <div class="main-box" ref="dragDom">
                <div v-if="tabLists.length > 1">
                    <el-tabs v-if="props.direction === 'rtl'" v-model="rtlName" type="card" class="dragDom-tabs" @tab-change="handleTabChange">
                        <el-tab-pane :label="item" :name="item" v-for="item in tabLists"></el-tab-pane>
                    </el-tabs>
                    <el-tabs v-if="props.direction === 'ltr'" v-model="ltrName" type="card" class="dragDom-tabs" @tab-change="handleTabChange">
                        <el-tab-pane :label="item" :name="item" v-for="item in tabLists"></el-tab-pane>
                    </el-tabs>
                    <el-tabs v-if="props.direction === 'btt'" v-model="bttName" type="card" class="dragDom-tabs" @tab-change="handleTabChange">
                        <el-tab-pane :label="item" :name="item" v-for="item in tabLists"></el-tab-pane>
                    </el-tabs>
                    <el-tabs v-if="props.direction === 'ttb'" v-model="ttbName" type="card" class="dragDom-tabs" @tab-change="handleTabChange">
                        <el-tab-pane :label="item" :name="item" v-for="item in tabLists"></el-tab-pane>
                    </el-tabs>
                </div>

                <div class="my-drawer-header">
                    <h1>{{ props.title }}</h1>
                    <div>
                        <el-tooltip effect="customized" v-if="!unFullScreen" content="Full Screen" placement="bottom-start">
                            <el-button v-if="!unFullScreen" @click="setFullScreen">
                                <Icon name="full-screen" />
                            </el-button>
                        </el-tooltip>
                        <el-tooltip effect="customized" v-if="isShowClose" content="Close" placement="bottom-start">
                            <el-button type="danger" v-if="isShowClose" @click="handleClosed">
                                <Icon name="close" />
                            </el-button>
                        </el-tooltip>
                    </div>
                </div>
                <div class="slot-box" :class="[isDrag ? 'no-pointer' : '']">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { useDrawerStore } from '@/store/drawer.js';
import { pxToRem } from '@/libs/utils';
const drawerStore = useDrawerStore();
const props = defineProps({
    // 方向
    direction: {
        type: String,
        default: 'rtl',
    },
    title: {
        type: String,
        default: '',
    },
    minWidth: {
        type: String,
        default: '400',
    },
    minHeight: {
        type: String,
        default: '400',
    },
    isShowClose: {
        type: Boolean,
        default: false,
    },
    defaultShow: {
        type: Boolean,
        default: true,
    },
    // 是否现实全屏按钮
    unFullScreen: {
        type: Boolean,
        default: true,
    },
    // 是否默认全屏
    defaultFullScreen: {
        type: Boolean,
        default: false,
    },
    store: {
        type: Object,
        default: () => {},
    },
});
const rtlName = ref();
const ltrName = ref();
const bttName = ref();
const ttbName = ref();
// 判断是否处于拖拽状态
const isDrag = ref(false);
const tabLists = computed(() => drawerStore[props.direction + 'List'].map((item) => item.name));
const emit = defineEmits(['onClosed', 'onCollapse', 'onDrag']);
const handleClosed = () => {
    emit('onClosed');
};
const isfullscreen = ref(props.defaultFullScreen);
const setFullScreen = () => {
    isfullscreen.value = !isfullscreen.value;
};
watch(
    () => props.defaultFullScreen,
    (val) => {
        isfullscreen.value = val;
    }
);
const tooltip = computed(() => (!isShow.value ? 'Expand this panel' : 'Collapse this panel'));

const isShow = ref(true);
const iconNames = reactive({
    up: '',
    down: '',
});
onMounted(async () => {
    await nextTick();
    let storeName = props.store.name;
    if (props.direction === 'rtl') {
        iconNames.up = 'caret-left';
        iconNames.down = 'caret-right';
        rtlName.value = storeName;
    } else if (props.direction === 'ltr') {
        iconNames.up = 'caret-right';
        iconNames.down = 'caret-left';
        ltrName.value = storeName;
    } else if (props.direction === 'btt') {
        iconNames.up = 'triangleupfill';
        iconNames.down = 'triangledownfill';
        bttName.value = storeName;
    } else if (props.direction === 'ttb') {
        iconNames.up = 'triangledownfill';
        iconNames.down = 'triangleupfill';
        ttbName.value = storeName;
    }
    isShow.value = props.defaultShow;
    setDrawerList();
    dragFn();
    drawerStore[props.direction + 'Name'] = storeName;
    drawerStore.width = calculatePercent(props.minWidth, 'width');
    drawerStore.height = calculatePercent(props.minHeight, 'height');
    collapseOther();
});
const collapseOther = () => {
    let type = props.direction + 'List';
    let activeName = getActiveName();
    drawerStore[type].forEach((item) => {
        if (item.name !== activeName) {
            item.isCollapse = false;
        }
    });
};
const getActiveName = () => {
    let activeName = '';
    if (props.direction === 'rtl') {
        activeName = rtlName.value;
    } else if (props.direction === 'ltr') {
        activeName = ltrName.value;
    } else if (props.direction === 'btt') {
        activeName = bttName.value;
    } else if (props.direction === 'ttb') {
        activeName = ttbName.value;
    }
    return activeName;
};
const handleTabChange = () => {
    let type = props.direction + 'List';
    let activeName = getActiveName();
    let width = drawerStore.width;
    let height = drawerStore.height;
    drawerStore[type].forEach((item) => {
        if (item.name === activeName) {
            if (props.direction === 'rtl' || props.direction === 'ltr') {
                let storeWidth = calculatePercent(item.width, 'width');
                if (storeWidth < width) {
                    item.width = width;
                } else {
                    drawerStore.width = storeWidth;
                }
            } else {
                let storeHeight = calculatePercent(item.height, 'height');
                if (storeHeight < height) {
                    item.height = height;
                } else {
                    drawerStore.height = storeHeight;
                }
            }
            item.isCollapse = true;
        } else {
            item.isCollapse = false;
        }
    });
    drawerStore[props.direction + 'Name'] = activeName;
};
const calculatePercent = (val, type = 'width') => {
    if (val.toString().indexOf('%') > -1) {
        let num = val.replace(/%/g, '');
        let percent = num / 100;
        let returnValue = 0;
        if (type == 'width') {
            returnValue = document.body.clientWidth * percent;
        } else {
            returnValue = document.body.clientHeight * percent;
        }
        return Math.floor(returnValue);
    } else {
        return val;
    }
};
onUnmounted(() => {
    let type = props.direction + 'List';
    let index = null;
    drawerStore[type].forEach((item, _index) => {
        if (item.name === props.store.name) {
            index = _index;
        }
    });

    if (index !== null) {
        drawerStore[type].splice(index, 1);
    }
});
const setDrawerList = () => {
    let type = props.direction;
    let list = drawerStore[type + 'List'].filter((item) => item.name === props.store.name);
    if (!list.length) {
        drawerStore[type + 'List'].push(props.store);
    }
};
const iconName = computed(() => {
    return isShow.value ? iconNames.down : iconNames.up;
});
const draweClassName = computed(() => (props.direction === 'rtl' || props.direction === 'ltr' ? 'my-drawer-content-width' : 'my-drawer-content-height')).value;
const contentClassName = ref('');
watch(
    () => props.store.width,
    (val) => {
        if (props.direction === 'rtl' || props.direction === 'ltr') {
            // dragDom.value.style.width = props.store.width + 'px';
            dragDom.value.style.width = pxToRem(props.store.width);
        }
    },
    {
        deep: true,
    }
);
watch(
    () => props.store.height,
    () => {
        if (props.direction === 'btt' || props.direction === 'ttb') {
            // dragDom.value.style.height = props.store.height + 'px';
            dragDom.value.style.height = pxToRem(props.store.height);
        }
    },
    {
        deep: true,
    }
);
watch(isShow, (val) => (contentClassName.value = !val ? draweClassName : ''));
watch(
    () => props.defaultShow,
    (val) => (isShow.value = val)
);
watch(
    () => drawerStore.rtlName,
    (val) => {
        rtlName.value = val;
    }
);
watch(
    () => drawerStore.ltrName,
    (val) => {
        ltrName.value = val;
    }
);
watch(
    () => drawerStore.bttName,
    (val) => {
        bttName.value = val;
    }
);
watch(
    () => drawerStore.ttbName,
    (val) => {
        ttbName.value = val;
    }
);
const setDrawerShow = () => {
    isShow.value = !isShow.value;
    emit('onCollapse', isShow.value);
    if (isShow.value) {
        let storeName = props.store.name;
        if (props.direction === 'rtl') {
            rtlName.value = storeName;
        } else if (props.direction === 'ltr') {
            ltrName.value = storeName;
        } else if (props.direction === 'btt') {
            bttName.value = storeName;
        } else if (props.direction === 'ttb') {
            ttbName.value = storeName;
        }
    }
};
const resizeElL = ref();
const dragDom = ref();

const dragFn = () => {
    // let domWidth =  props.minWidth > drawerStore.width ? props.minWidth : drawerStore.width;
    let domWidth = calculatePercent(props.minWidth, 'width');
    domWidth = domWidth > drawerStore.width ? domWidth : drawerStore.width;
    // let domHeight = props.minHeight > drawerStore.height ? props.minHeight : drawerStore.height;
    let domHeight = calculatePercent(props.minHeight, 'height');
    domHeight = domHeight > drawerStore.height ? domHeight : drawerStore.height;
    if (props.direction === 'rtl' || props.direction === 'ltr') {
        // dragDom.value.style.width = domWidth + 'px';
        dragDom.value.style.width = pxToRem(domWidth);
    } else if (props.direction === 'btt' || props.direction === 'ttb') {
        // dragDom.value.style.height = domHeight + 'px';
        dragDom.value.style.height = pxToRem(domHeight);
    }
    resizeElL.value.onmousedown = (e) => {
        // 阻止默认事件
        e.preventDefault();
        const elH = dragDom.value.clientHeight;
        const elW = dragDom.value.clientWidth;
        const clientY = e.clientY;
        const clientX = e.clientX;
        isDrag.value = true;
        document.onmousemove = function (e) {
            e.preventDefault();
            if (props.direction === 'rtl') {
                if (e.clientX > 0) {
                    if (clientX > e.clientX) {
                        // dragDom.value.style.width = elW + (clientX - e.clientX) + 'px';
                        dragDom.value.style.width = pxToRem(elW + (clientX - e.clientX));
                    }
                    if (clientX < e.clientX) {
                        // dragDom.value.style.width = elW - (e.clientX - clientX) + 'px';
                        dragDom.value.style.width = pxToRem(elW - (e.clientX - clientX));
                    }
                }
            } else if (props.direction === 'ltr') {
                if (e.clientX >= 0) {
                    if (clientX < e.clientX) {
                        // dragDom.value.style.width = elW + (e.clientX - clientX) + 'px';
                        dragDom.value.style.width = pxToRem(elW + (e.clientX - clientX));
                    }
                    if (clientX > e.clientX) {
                        // dragDom.value.style.width = elW - (clientX - e.clientX) + 'px';
                        dragDom.value.style.width = pxToRem(elW - (clientX - e.clientX));
                    }
                }
            } else if (props.direction === 'btt') {
                if (e.clientY > 0) {
                    if (clientY > e.clientY) {
                        // dragDom.value.style.height = elH + (clientY - e.clientY) + 'px';
                        dragDom.value.style.height = pxToRem(elH + (clientY - e.clientY));
                    }
                    if (clientY < e.clientY) {
                        // dragDom.value.style.height = elH - (e.clientY - clientY) + 'px';
                        dragDom.value.style.height = pxToRem(elH - (e.clientY - clientY));
                    }
                }
            } else if (props.direction === 'ttb') {
                if (e.clientY >= 0) {
                    if (clientY < e.clientY) {
                        // dragDom.value.style.height = elH + (e.clientY - clientY) + 'px';
                        dragDom.value.style.height = pxToRem(elH + (e.clientY - clientY));
                    }
                    if (clientY > e.clientY) {
                        // dragDom.value.style.height = elH - (clientY - e.clientY) + 'px';
                        dragDom.value.style.height = pxToRem(elH - (clientY - e.clientY));
                    }
                }
            }
        };
        document.onmouseup = function (e) {
            isDrag.value = false;
            emit('onDrag');
            document.onmousemove = null;
            document.onmouseup = null;
            let width = dragDom.value.clientWidth;
            let height = dragDom.value.clientHeight;
            if (props.direction === 'rtl' || props.direction === 'ltr') {
                drawerStore.width = width;
            } else {
                drawerStore.height = height;
            }
            let type = props.direction + 'List';
            let activeName = getActiveName();
            drawerStore[type].forEach((item) => {
                if (item.name === activeName) {
                    if (props.direction === 'rtl' || props.direction === 'ltr') {
                        item.width = width;
                    } else {
                        item.height = height;
                    }
                }
            });
        };
    };
};
</script>
<style lang="scss" scoped>
.my-drawer {
    position: fixed;
    z-index: 99;
    background: #fff;
    box-sizing: border-box;
    display: flex;
}
.my-drawer-rtl,
.my-drawer-ltr {
    height: calc(100vh - var(--header-height));
    top: var(--header-height);
}
.my-drawer-btt,
.my-drawer-ttb {
    width: 100%;
    left: 0;
}
.my-drawer-rtl {
    right: 0;
}
.my-drawer-ltr {
    left: 0;
}

.my-drawer-btt {
    bottom: 0;
}
.my-drawer-ttb {
    top: var(--header-height);
}

.my-drawer-fold-button {
    position: absolute;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .icon {
        color: rgba($color: #fff, $alpha: 0.8);
    }
}
.my-drawer-fold-rtl,
.my-drawer-fold-ltr {
    top: 50%;
    transform: translateY(-50%);
    width: 1.0625rem;
    height: 3.75rem;
}
.my-drawer-fold-rtl {
    border-radius: 0.3125rem 0 0 0.3125rem;
    left: -1.0625rem;
}
.my-drawer-fold-ltr {
    border-radius: 0rem 0.3125rem 0.3125rem 0rem;
    right: -1.0625rem;
}

.my-drawer-fold-btt,
.my-drawer-fold-ttb {
    left: 50%;
    transform: translateX(-50%);
    width: 3.75rem;
    height: 1.0625rem;
}
.my-drawer-fold-btt {
    border-radius: 0.3125rem 0.3125rem 0 0;
    top: -1.0625rem;
}
.my-drawer-fold-ttb {
    border-radius: 0rem 0 0.3125rem 0.3125rem;
    bottom: -1.0625rem;
}

.my-drawer-resize {
    position: absolute;
    background: rgba(0, 0, 0, 0.7);
}
.my-drawer-resize-rtl,
.my-drawer-resize-ltr {
    cursor: w-resize;
    width: 0.3125rem;
    height: 100%;
    top: 0rem;
}
.my-drawer-resize-btt,
.my-drawer-resize-ttb {
    cursor: ns-resize;
    height: 0.3125rem;
    width: 100%;
    left: 0rem;
}
.my-drawer-resize-rtl {
    left: 0rem;
}
.my-drawer-resize-ltr {
    right: 0rem;
}
.my-drawer-resize-btt {
    top: 0;
}
.my-drawer-resize-ttb {
    bottom: 0;
}
.my-drawer-content {
    transition: all 0.5s;
    overflow: hidden;
    flex: 1;
    display: flex;
}
.my-drawer-content-width {
    width: 0;
}
.my-drawer-content-height {
    height: 0;
}
.my-drawer-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 0.625rem;
    h1 {
        font-size: 1rem;
    }
}
.main-box {
    flex: 1;
    box-sizing: border-box;
    padding: 0.625rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .slot-box {
        flex: 1;
        overflow: hidden;
    }
    .dragDom-tabs {
        :deep(.el-tabs__header) {
            margin: 0;
        }
    }
}
.my-drawer-full {
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    .main-box {
        width: 100% !important;
        height: 100% !important;
    }
}
.no-pointer {
    pointer-events: none;
}
</style>
