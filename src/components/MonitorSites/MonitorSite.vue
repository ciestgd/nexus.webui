<template>
    <div
        class="monitor-content-item-detail"
        :style="{ background: backgroundStyle }"
        @contextmenu.prevent="setContextMenu"
        ref="detailRef"
        @mouseover="(e) => hoverItem(e)"
        @click="handleClick"
    >
        <img :src="markerIcon" alt="" />
        <div class="detail-content">
            <div class="detail-content-item">Location: {{ data.countyName }},{{ data.stateAbbrName }}</div>
            <div class="detail-content-item">Site: {{ data.siteId }},{{ data.siteName }}</div>
            <div class="detail-content-item">
                {{ type }} {{ type === 'O3' ? '(ppb)' : '(μg/m³)' }}: <span>{{ data.value !== null ? data.value : 'N/A' }}</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import markerIcon from '@/assets/images/marker-icon.png';
import { useMonitorSiteStore } from '@/store/monitor-site';
const monitorSiteStore = useMonitorSiteStore();

const emits = defineEmits(['handleChoose', 'handleHover', 'handleMenu']);
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    type: {
        type: String,
        default: 'PM2.5',
    },
    activeSiteId: {
        type: String,
        default: '',
    },
    colorList: {
        type: Object,
        default: () => {},
    },
});
let { data, type } = toRefs(props);
const bgColor = ref('');
const detailRef = ref();
const selectTime = ref(0);
const colorTime = ref(0);
const hoverItem = (e) => {
    emits('handleHover', { data: props.data, type: props.type }, e.currentTarget);
};
const setContextMenu = (e) => {
    emits('handleMenu', props.data, e.currentTarget);
};
watch(
    () => props.colorList,
    (val) => {
        let siteId = data.value.siteId;
        if (val && val[siteId]) {
            bgColor.value = val[siteId];
        } else {
            bgColor.value = '';
        }
    },
    {
        deep: true,
        immediate: true,
    }
);

const isSelect = computed(() => monitorSiteStore.selectId == data.value.siteId);

const backgroundStyle = computed(() => (props.activeSiteId === data.value.siteId ? '#bbdfc8' : showColor.value));
const showColor = computed(() => {
    let color = '';

    if (isSelect.value) {
        if (bgColor.value) {
            if (selectTime.value > colorTime.value) {
                color = '#b9d1ea';
            } else {
                color = bgColor.value;
            }
        } else {
            color = '#b9d1ea';
        }
    } else {
        if (bgColor.value) {
            color = bgColor.value;
        }
    }
    return color;
});
watch(
    () => monitorSiteStore.selectId,
    (val) => {
        if (isSelect.value) {
            selectTime.value = new Date().getTime();
        } else {
            selectTime.value = 0;
        }
    }
);
watch(
    () => bgColor.value,
    (val) => {
        colorTime.value = new Date().getTime();
    }
);
const handleClick = () => {
    emits('handleChoose', data);
};
</script>
<style lang="scss" scoped>
.monitor-content-item-detail {
    width: 100%;
    height: 75px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    padding: 5px 5px;
    background: #ffffe1;
    border-bottom: 1px solid #000;
    &:hover {
        background: greenyellow;
    }
    img {
        height: 20px;
        margin-right: 10px;
    }
    .detail-content {
        width: 80%;
        font-size: 12px;
        .detail-content-item {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            span {
                color: red;
            }
        }
        .detail-content-item + .detail-content-item {
            margin-top: 5px;
        }
    }
}
</style>
