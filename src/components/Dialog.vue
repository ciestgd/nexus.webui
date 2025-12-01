<template>
    <!-- draggable -->
    <el-dialog
        ref="dialogRef"
        class="dialog"
        :class="{ noHeader: !isNeetHeader }"
        v-model="visible"
        :modal="isModal"
        :show-close="false"
        @opened="handleOpened"
        @closed="handleClosed"
        :fullscreen="isfullscreen"
        align-center
        style="pointer-events: auto"
        :style="{ 'max-height': dialogMaxHeight, width: dialogWidth, height: dialogHeihgt }"
    >
        <template #header="{ close, titleId, titleClass }" v-if="isNeetHeader">
            <div class="header" ref="headerRef" :class="[isCollapse ? 'collapse-header' : '']">
                <h1 :id="titleId" :class="titleClass">{{ title }}</h1>
                <div class="operation-box">
                    <el-tooltip effect="customized" :content="isDown ? 'Collapse' : 'Expand'" placement="bottom-start">
                        <Icon class="base-icon" @click="handleCollapse" :class="[isDown ? 'up-arrow-icon' : 'down-arrow-icon']" color="#fff" :size="20" name="d-arrow-right" />
                    </el-tooltip>
                    <el-tooltip effect="customized" v-if="!unFullScreen" content="Full Screen" placement="bottom-start">
                        <el-button v-if="!unFullScreen" @click="setFullScreen">
                            <Icon name="full-screen" />
                        </el-button>
                    </el-tooltip>
                    <el-tooltip effect="customized" content="Close" placement="bottom-start">
                        <el-button type="danger" v-if="!isCollapse" @click="close">
                            <Icon name="close" />
                        </el-button>
                        <Icon name="close" class="base-icon" color="#fff" :size="20" @click="close" v-else />
                    </el-tooltip>
                </div>
            </div>
        </template>
        <slot></slot>
        <div class="draggableContent" v-if="isContentDraggable" ref="draggableRef">
            <img :src="resizePng" alt="" />
        </div>
    </el-dialog>
</template>

<script setup>
import resizePng from '@/assets/images/resize.png';
const props = defineProps({
    // 标题
    title: {
        type: String,
    },
    // 是否默认显示
    visible: {
        type: Boolean,
    },
    // 是否解锁鼠标事件
    unlockPointerEvents: {
        type: Boolean,
        default: true,
    },
    // 是否需要头部
    isNeetHeader: {
        type: Boolean,
        default: true,
    },
    // 是否显示全屏按钮
    unFullScreen: {
        type: Boolean,
        default: true,
    },
    // 宽度
    width: {
        type: String,
        default: '740',
    },
    // 高度
    height: {
        type: String,
        default: '740',
    },
    // 最大高度
    maxHeight: {
        type: String,
        default: '90%',
    },
    // 是否需要遮罩层
    isModal: {
        type: Boolean,
        default: false,
    },
    // 显示点的位置
    pointLocation: {
        type: Array,
        default: () => [],
    },
    // 内容是否可拖动
    isContentDraggable: {
        type: Boolean,
        default: true,
    },
    isCollapse: {
        type: Boolean,
        default: false,
    },
});
const defaultWidth = ref(props.width);
const defaultHeight = ref(props.height);
const dialogTop = ref();
const dialogLeft = ref();
const headerRef = ref();
const isDown = ref(false);
const dialogMaxHeight = computed(() => {
    let height = '';
    if (props.maxHeight && props.maxHeight === 'unset') {
        height = 'unset';
    } else if (props.maxHeight && props.maxHeight.includes('%')) {
        height = props.maxHeight;
    } else {
        height = props.maxHeight + 'px';
    }
    return !isfullscreen.value ? (isDown.value ? '48px' : height) : 'unset';
});
const dialogWidth = computed(() => {
    let width = '';
    if (defaultWidth.value && defaultWidth.value.includes('%')) {
        width = defaultWidth.value;
    } else {
        width = defaultWidth.value + 'px';
    }
    return !isfullscreen.value ? width : '100%';
});
const dialogHeihgt = computed(() => {
    let height = '';
    if (defaultHeight.value && defaultHeight.value === 'unset') {
        height = 'unset';
    } else if (defaultHeight.value && defaultHeight.value.includes('%')) {
        height = defaultHeight.value;
    } else {
        height = defaultHeight.value + 'px';
    }
    return !isfullscreen.value ? height : '100%';
});
const visible = ref(props.visible);
const isfullscreen = ref(false);
const setFullScreen = () => {
    isfullscreen.value = !isfullscreen.value;
    let dialogBox = dialogRef.value.$el.parentNode.getElementsByClassName('el-dialog')[0];
    if (isfullscreen.value) {
        dialogBox.style.top = '0px';
        dialogBox.style.left = '0px';
        clearDialogDrag();
    } else {
        dialogBox.style.top = dialogTop.value + 'px';
        dialogBox.style.left = dialogLeft.value + 'px';
        handleDrag();
    }
    emit('onFullScreen', isfullscreen.value);
};
const draggableRef = ref();
const emit = defineEmits(['onClosed', 'onFullScreen']);

const handleClosed = () => {
    emit('onClosed');
};
const handleCollapse = () => {
    isDown.value = !isDown.value;
};
const dialogRef = ref();
const handleBeforeOpen = () => {
    let dialogBox = dialogRef.value.$el.parentNode.getElementsByClassName('el-dialog')[0];
    let width = dialogBox.getBoundingClientRect().width;
    let height = dialogBox.getBoundingClientRect().height;
    // 获取窗口的宽度和高度
    let offsetWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let offsetHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    let left = (offsetWidth - width) / 2;
    let top = (offsetHeight - height) / 2;
    if (props.pointLocation.length) {
        // let top = dialogBox.getBoundingClientRect().top;
        // let left = dialogBox.getBoundingClientRect().left;
        // let transformLeft = 0;
        // let transformTop = 0;
        let pointLeft = props.pointLocation[0];
        let pointTop = props.pointLocation[1];
        if (pointLeft + width > offsetWidth) {
            if (props.isCollapse) {
                // transformLeft = left;
                left = offsetWidth - width;
            } else {
                if (pointLeft - width > 0) {
                    // transformLeft = pointLeft - width - 10 - left;
                    left = pointLeft - width - 10;
                }
            }
        } else {
            // transformLeft = pointLeft - left;
            left = pointLeft;
        }

        if (pointTop + height > offsetHeight) {
            if (pointTop - height > 0) {
                // transformTop = pointTop - height - 10 - top;
                top = pointTop - height - 10;
            } else {
                if (props.isCollapse) {
                    // transformTop = 0;
                    top = offsetHeight - height;
                }
            }
            //  else {
            //     transformTop = -top;
            // }
        } else {
            // transformTop = pointTop - top;
            top = pointTop;
        }
        // dialogBox.style.transform = `translate(${transformLeft}px, ${transformTop}px)`;
    }
    dialogBox.style.top = top + 'px';
    dialogBox.style.left = left + 'px';
    dialogTop.value = top;
    dialogLeft.value = left;
};
onMounted(async () => {
    await nextTick();
    handleBeforeOpen();
    draggableFn();
    handleDrag();
});
const handleOpened = () => {
    if (props.unlockPointerEvents) {
        dialogRef.value.$el.parentNode.style.pointerEvents = 'none';
    }
};
const handleClose = () => {
    visible.value = false;
};
const clearDialogDrag = () => {
    if (!props.isNeetHeader) return;
    headerRef.value.onmousedown = null;
};
const handleDrag = () => {
    if (!props.isNeetHeader) return;
    let dialogBox = dialogRef.value.$el.parentNode.getElementsByClassName('el-dialog')[0];

    let moveX = 0;
    let moveY = 0;
    const updatePosition = () => {
        let newTop = dialogTop.value + moveY;
        let newLeft = dialogLeft.value + moveX;

        // 获取窗口的宽度和高度
        let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // 获取对话框的宽度和高度
        let dialogWidth = dialogBox.offsetWidth;
        let dialogHeight = dialogBox.offsetHeight;

        // 限制对话框的位置，使其不能超出页面边界
        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newTop + dialogHeight > windowHeight) newTop = windowHeight - dialogHeight;
        if (newLeft + dialogWidth > windowWidth) newLeft = windowWidth - dialogWidth;

        dialogTop.value = newTop;
        dialogLeft.value = newLeft;
        dialogBox.style.top = newTop + 'px';
        dialogBox.style.left = newLeft + 'px';
    };
    headerRef.value.onmousedown = (e) => {
        let clientX = e.clientX;
        let clientY = e.clientY;

        document.onmousemove = function (e) {
            e.preventDefault();
            moveX = e.clientX - clientX;
            moveY = e.clientY - clientY;
            requestAnimationFrame(updatePosition);
            // 更新鼠标按下时的位置
            clientX = e.clientX;
            clientY = e.clientY;
        };
        document.onmouseup = function (e) {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
};
const draggableFn = () => {
    if (!props.isContentDraggable) return;
    draggableRef.value.onmousedown = (e) => {
        let dialogBox = dialogRef.value.$el.parentNode.getElementsByClassName('el-dialog')[0];
        let elW = dialogBox.getBoundingClientRect().width;
        let elH = dialogBox.getBoundingClientRect().height;
        const clientY = e.clientY;
        const clientX = e.clientX;

        document.onmousemove = function (e) {
            e.preventDefault();
            let width = '';
            let height = '';
            if (clientX < e.clientX) {
                width = elW + (e.clientX - clientX);
            } else if (clientX > e.clientX) {
                width = elW - (clientX - e.clientX);
            }
            if (clientY < e.clientY) {
                height = elH + (e.clientY - clientY);
            } else if (clientY > e.clientY) {
                height = elH - (clientY - e.clientY);
            }
            width = width < 330 ? 330 : width;
            height = height < 170 ? 170 : height;
            defaultWidth.value = String(width);
            defaultHeight.value = String(height);
        };
        document.onmouseup = function (e) {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
};
defineExpose({ handleClose });
</script>

<style scoped lang="scss">
.dialog {
    border: 1px sold #ccc;
    position: relative;
    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        padding: 0 10px;
        cursor: move;
    }
    .draggableContent {
        position: absolute;
        bottom: 0px;
        right: 0px;
        cursor: nw-resize;
        width: 13px;
        height: 13px;
        z-index: 2;
        img {
            width: 100%;
            height: 100%;
        }
    }
}
.operation-box {
    display: flex;
    align-items: center;
    .base-icon {
        cursor: pointer;
        outline: none;
    }
    .down-arrow-icon {
        margin-right: 10px;
        transform: rotate(90deg);
        // font-size: 18px;
    }
    .up-arrow-icon {
        margin-right: 10px;
        transform: rotate(-90deg);
    }
}
.collapse-header {
    background: #076fe5;
    .el-dialog__title {
        color: #fff;
    }
}
</style>
<style lang="scss">
.dialog {
    margin: 0 !important;
    // top: 50%;
    // left: 50%;
    // transform: translate(-50%, -50%);
}
.noHeader .el-dialog__body {
    height: 100% !important;
}
.noHeader .el-dialog__header {
    height: 0;
    border: none !important;
}
.dialog .el-dialog__header {
    padding: 0 !important;
}
</style>
