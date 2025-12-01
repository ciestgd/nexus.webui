<template>
    <el-drawer
        ref="drawerRef"
        class="drawer"
        v-model="visible"
        :modal="false"
        :show-close="false"
        style="pointer-events: auto"
        @opened="handleOpened"
        @closed="handleClosed"
        :direction="direction"
        :size="size"
    >
        <template #header="{ close, titleId, titleClass }">
            <div class="header">
                <h1 :id="titleId" :class="titleClass">{{ title }}</h1>
                <el-tooltip effect="customized" content="Close" placement="bottom-start">
                    <el-button type="danger" @click="close">
                        <Icon name="close" />
                    </el-button>
                </el-tooltip>
            </div>
        </template>
        <slot></slot>
    </el-drawer>
</template>

<script setup>
import { onMounted, ref, createVNode, render, computed } from 'vue';
import Icon from './Icon.vue';
const props = defineProps({
    title: {
        type: String,
    },
    visible: {
        type: Boolean,
    },
    unlockPointerEvents: {
        type: Boolean,
        default: true,
    },
    unlockDragEvent: {
        type: Boolean,
        default: true,
    },
    direction: {
        type: String,
        default: 'rtl',
    },
    minWidth: {
        type: Number,
        default: 500,
    },
    minHeight: {
        type: Number,
        default: 400,
    },
    size: {
        type: [Number, String],
        default: '30%',
    },
});

const visible = ref(props.visible);

const emit = defineEmits(['onClosed']);
const handleClosed = () => {
    emit('onClosed');
};

const drawerRef = ref();
const handleOpened = () => {
    if (props.unlockPointerEvents) {
        drawerRef.value.$el.parentNode.style.pointerEvents = 'none';
    }
    if (props.unlockDragEvent) {
        dragFn();
        flodFn();
    }
};
const isShow = ref(true);
const iconName = computed(() => {
    let nameList = {
        up: '',
        down: '',
    };
    if (props.direction === 'rtl') {
        nameList.up = 'caret-left';
        nameList.down = 'caret-right';
    } else if (props.direction === 'ltr') {
        nameList.up = 'caret-right';
        nameList.down = 'caret-left';
    } else if (props.direction === 'btt') {
        nameList.up = 'triangleupfill';
        nameList.down = 'triangledownfill';
    } else if (props.direction === 'ttb') {
        nameList.up = 'triangledownfill';
        nameList.down = 'triangleupfill';
    }
    return isShow.value ? nameList.down : nameList.up;
});
const flodFn = () => {
    const dragDom = drawerRef.value.$el.parentNode.querySelector('.el-drawer');
    dragDom.style.overflow = 'unset';
    const flodBtn = document.createElement('div');
    flodBtn.style.position = 'absolute';
    flodBtn.className = `drawer-fold-button drawer-fold-${props.direction}`;
    const minWidth = props.minWidth;
    const minHeight = props.minWidth;
    const direction = props.direction;
    const vNode = createVNode(Icon, {
        name: iconName.value,
        size: '26',
        class: `icon-button`,
    });
    render(vNode, flodBtn);
    dragDom.appendChild(flodBtn);
    flodBtn.onclick = function (e) {
        isShow.value = !isShow.value;
        if (direction === 'rtl' || direction === 'ltr') {
            dragDom.style.width = isShow.value ? minWidth + 'px' : 0;
        } else if (direction === 'btt' || direction === 'ttb') {
            dragDom.style.height = isShow.value ? minHeight + 'px' : 0;
        }
    };
};
const dragFn = () => {
    const dragDom = drawerRef.value.$el.parentNode.querySelector('.el-drawer');
    const resizeElL = document.createElement('div');
    resizeElL.className = `drawer-resize drawer-resize-${props.direction}`;
    dragDom.appendChild(resizeElL);

    resizeElL.onmousedown = (e) => {
        const elW = dragDom.clientWidth;
        const elH = dragDom.clientHeight;
        const EloffsetLeft = dragDom.offsetLeft;
        const EloffsetTop = dragDom.offsetTop;
        const clientX = e.clientX;
        const clientY = e.clientY;
        document.onmousemove = function (e) {
            e.preventDefault();
            if (props.direction === 'rtl') {
                if (clientX > EloffsetLeft && clientX < EloffsetLeft + 10) {
                    if (clientX > e.clientX) {
                        dragDom.style.width = elW + (clientX - e.clientX) + 'px';
                    }
                    if (clientX < e.clientX) {
                        dragDom.style.width = elW - (e.clientX - clientX) + 'px';
                    }
                }
            } else if (props.direction === 'ltr') {
                if (clientX >= 0) {
                    if (clientX < e.clientX) {
                        dragDom.style.width = elW + (e.clientX - clientX) + 'px';
                    }
                    if (clientX > e.clientX) {
                        dragDom.style.width = elW - (clientX - e.clientX) + 'px';
                    }
                }
            } else if (props.direction === 'btt') {
                if (clientY > EloffsetTop && clientY < EloffsetTop + 10) {
                    if (clientY > e.clientY) {
                        dragDom.style.height = elH + (clientY - e.clientY) + 'px';
                    }
                    if (clientY < e.clientY) {
                        dragDom.style.height = elH - (e.clientY - clientY) + 'px';
                    }
                }
            } else if (props.direction === 'ttb') {
                if (clientY >= 0) {
                    if (clientY < e.clientY) {
                        dragDom.style.height = elH + (e.clientY - clientY) + 'px';
                    }
                    if (clientY > e.clientY) {
                        dragDom.style.height = elH - (clientY - e.clientY) + 'px';
                    }
                }
            }
        };
        document.onmouseup = function (e) {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
};
</script>

<style scoped lang="scss">
.drawer {
    .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
<style lang="scss">
.drawer {
    &.rtl,
    &.ltr {
        --header-height: 60px;
        top: var(--header-height) !important;
        height: calc(100vh - var(--header-height)) !important;
    }
    transition: all 0.5s;
    .el-drawer__header {
        margin-bottom: 0px;
        padding: 10px;
        padding-bottom: 0px;
    }
    .el-drawer__body {
        padding: 10px;
    }
}
.drawer-fold-button {
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .icon {
        color: rgba($color: #fff, $alpha: 0.8);
    }
}
.drawer-fold-rtl,
.drawer-fold-ltr {
    top: 50%;
    transform: translateY(-50%);
    width: 17px;
    height: 60px;
}
.drawer-fold-rtl {
    border-radius: 5px 0 0 5px;
    left: -17px;
}
.drawer-fold-ltr {
    border-radius: 0px 5px 0px 5px;
    right: -17px;
}

.drawer-fold-btt,
.drawer-fold-ttb {
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 17px;
}
.drawer-fold-btt {
    border-radius: 5px 5px 0 0;
    top: -17px;
}
.drawer-fold-ltr {
    border-radius: 0px 0 5px 5px;
    bottom: -17px;
}
.drawer-resize {
    position: absolute;
    background: rgba(0, 0, 0, 0.7);
}
.drawer-resize-rtl,
.drawer-resize-ltr {
    cursor: w-resize;
    width: 5px;
    height: 100%;
    top: 0px;
}
.drawer-resize-btt,
.drawer-resize-ttb {
    cursor: w-resize;
    height: 5px;
    width: 100%;
    left: 0px;
}
.drawer-resize-rtl {
    left: 0px;
}
.drawer-resize-ltr {
    left: 0px;
}
.drawer-resize-btt {
    top: 0;
}
.drawer-resize-ttb {
    bottom: 0;
}
</style>
