<template>
    <div class="content-item-detail" :class="[activeType === data.name ? 'activeClass' : '']" @mouseover="handleHover">
        <div class="detail-content">
            <div class="detail-content-item">
                Source: <span style="font-weight: bold">{{ data.name }}</span>
            </div>
            <div class="detail-content-item">
                Emission({{ typeUnit }}): <span class="total">{{ data.value }}</span>
            </div>
            <div class="detail-content-item" v-if="data.percent">% of Total Emissions: {{ data.percent }}</div>
        </div>
        <div class="detail-content-child" v-if="data.childs.length">
            <div v-for="item in data.childs">
                <div class="detail-content-item">
                    NP: <span>{{ item.name }}</span>
                </div>
                <div class="detail-content-item">
                    Emission({{ typeUnit }}): <span class="total">{{ item.value }}</span>
                </div>
                <div class="detail-content-item" v-if="item.percent">% of Total Emissions: {{ item.percent }}</div>
            </div>
        </div>
    </div>
</template>
<script setup>
const emits = defineEmits(['handleHover']);
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    activeType: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: '',
    },
});
let { data, activeType, type } = toRefs(props);
const handleHover = () => {
    emits('handleHover', data.value.name);
};
const typeUnit = computed(() => {
    return type.value == 'Gas_VOC_HAPs' || type.value === 'Heavy_Metal_HAPs' ? 'LB' : type.value === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY';
});
</script>
<style lang="scss" scoped>
.content-item-detail {
    width: 100%;
    min-height: 65px;
    cursor: pointer;
    display: flex;
    // justify-content: center;
    align-items: center;
    box-sizing: border-box;
    flex-direction: column;
    padding: 5px 5px;
    background: #f0f0f0;
    border-bottom: 1px solid #000;
    &:hover {
        background: #bbdfc8;
    }
    .detail-content {
        width: 100%;
        font-size: 12px;
    }
    .detail-content-child {
        width: 100%;
        border-top: 1px solid #ccc;
        margin-top: 5px;
        box-sizing: border-box;
        padding: 5px 5px 0;
        font-size: 12px;
    }
    .total {
        color: #af5656;
    }
    .detail-content-item + .detail-content-item {
        margin-top: 5px;
    }
}
.activeClass {
    background: #bbdfc8;
}
</style>
