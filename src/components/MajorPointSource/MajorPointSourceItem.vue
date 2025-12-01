<template>
    <div class="major-content-item-detail" @mouseover="(e) => handleHover(e)" @click="handleClick" @contextmenu.prevent="setContextMenu" :style="{ background: backgroundStyle }">
        <img :src="markerIcon" alt="" />
        <div class="detail-content">
            <div class="detail-content-item facility">Facility: {{ data.siteName }}</div>
            <div class="detail-content-item sector">Sector:{{ data.sectorProjectGroup }}</div>
            <div class="detail-content-item statistics">
                <span class="label">{{ label }} ({{ labelUnit }}):</span> <span class="total">{{ data.value }}</span>
            </div>
        </div>
    </div>
</template>
<script setup>
import markerIcon from '@/assets/images/marker-icon.png';
const labelUnit = computed(() => {
    return type.value == 'Gas_VOC_HAPs' || type.value === 'Heavy_Metal_HAPs' ? 'LB' : type.value === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY';
});
const emits = defineEmits(['handleChoose', 'handleHover', 'handleMenu']);
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    type: {
        type: String,
        default: 'PM25',
    },
    label: {
        type: String,
        default: 'PM2.5',
    },
    // hover时的id
    activeId: {
        type: String,
        default: '',
    },
    // select时的id
    selectId: {
        type: String,
        default: '',
    },
    colorList: {
        type: Object,
        default: () => {},
    },
});
let { data, type, label } = toRefs(props);
const bgColor = ref('');
const selectTime = ref(0);
const colorTime = ref(0);
watch(
    () => props.colorList,
    (val) => {
        let facilityId = data.value.facilityId;
        if (val && val[facilityId]) {
            bgColor.value = val[facilityId];
        } else {
            bgColor.value = '';
        }
    },
    {
        deep: true,
        immediate: true,
    }
);
const isSelected = computed(() => props.selectId === data.value.facilityId);
const backgroundStyle = computed(() => (props.activeId === data.value.facilityId ? '#bbdfc8' : showColor.value));
const showColor = computed(() => {
    let color = '';
    if (isSelected.value) {
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
    () => props.selectId,
    (val) => {
        if (isSelected.value) {
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
const handleHover = (e) => {
    emits(
        'handleHover',
        {
            data,
            type,
            label,
        },
        e.currentTarget
    );
};

const handleClick = () => {
    emits('handleChoose', props.data);
};
const setContextMenu = (e) => {
    emits('handleMenu', props.data, e.currentTarget);
};
</script>
<style lang="scss" scoped>
.major-content-item-detail {
    width: 100%;
    height: 80px;
    cursor: pointer;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 5px 5px;
    background: #f0f0f0;
    border-bottom: 1px solid #000;
    &:hover {
        background: #bbdfc8;
    }
    img {
        height: 20px;
        margin-right: 10px;
    }
    .detail-content {
        width: 85%;
        font-size: 12px;
        .facility {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .sector {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .statistics {
            display: flex;
            align-items: center;
            .label {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                max-width: 80px;
                display: inline-block;
            }
            .total {
                color: #af5656;
            }
        }
        .detail-content-item + .detail-content-item {
            margin-top: 5px;
        }
    }
}
.major-select-item {
    background: #b9d1ea;
}
.major-acitiveItem {
    background: #bbdfc8;
}
</style>
