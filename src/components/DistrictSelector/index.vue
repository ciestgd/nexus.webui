<template>
    <div class="district-selector">
        <div class="item" :style="{ width: itemWidth }">
            <div class="center">
                <div :class="labelClass">{{ labelPrefix + 'EPA Region' }}</div>
                <EpaRegionSelector class="region-select" ref="epaRegionSelectorRef" v-model="models.epaRegion" :size="size" @change="handleEpaRegionChange" />
                <ClearIcon class="clear-btn" v-if="models.epaRegion" @click="handleEpaClear" />
            </div>
        </div>
        <el-divider v-if="showDivider" direction="vertical" class="divider" :style="{ height: dividerHeight }" />
        <div class="item" :style="{ width: itemWidth }">
            <div class="center">
                <div :class="labelClass">{{ labelPrefix + 'State' }}</div>
                <StateSelector class="region-select" ref="stateSelectorRef" v-model="models.state" :size="size" :clear-icon="ClearIcon" @change="handleStateChange" />
                <ClearIcon class="clear-btn" v-if="models.state" @click="handleStateClear" />
            </div>
        </div>

        <el-divider v-if="showDivider" direction="vertical" class="divider" :style="{ height: dividerHeight }" />
        <div class="item" :style="{ width: itemWidth }">
            <div class="center">
                <div :class="labelClass">{{ labelPrefix + 'County' }}</div>
                <CountySelector class="region-select" ref="countySelectorRef" v-model="models.county" :size="size" :clear-icon="ClearIcon" @change="handleCountyChange" />
                <ClearIcon class="clear-btn" v-if="models.county" @click="handleCountyClear" />
            </div>
        </div>
        <el-divider v-if="showDivider" direction="vertical" class="divider" :style="{ height: dividerHeight }" />
        <div class="item" :style="{ width: itemWidth }">
            <div class="center">
                <div :class="labelClass">{{ labelPrefix + 'CBSA' }}</div>
                <CbsaSelector class="region-select" ref="cbsaSelectorRef" v-model="models.cbsa" :size="size" :clear-icon="ClearIcon" @change="handleCbsaChange" />
                <ClearIcon class="clear-btn" v-if="models.cbsa" @click="handleCbsaClear" />
            </div>
        </div>
    </div>
</template>

<script setup>
import EpaRegionSelector from './EpaRegionSelector.vue';
import StateSelector from './StateSelector.vue';
import CbsaSelector from './CbsaSelector.vue';
import CountySelector from './CountySelector.vue';
import Icon from '@/components/Icon.vue';
import { createVNode } from 'vue';
import { getCbsaById } from '@/api/district.js';

const props = defineProps({
    modelValue: {
        type: Array,
    },
    size: {
        type: String,
        default: 'default',
    },
    labelPrefix: {
        type: String,
        default: '',
    },
    labelClass: {
        type: String,
    },
    showDivider: {
        type: Boolean,
        default: false,
    },
    dividerHeight: {
        type: String,
        default: '2em',
    },
    iconSize: {
        type: Number,
        default: 16,
    },
    itemWidth: {
        type: String,
        default: '210px',
    },
});

const iconSize = computed(() => props.iconSize + 'px');

const ClearIcon = defineComponent({
    render() {
        return createVNode(Icon, {
            name: 'roundclosefill',
            color: 'red',
            size: props.iconSize,
        });
    },
});

const epaRegionSelectorRef = ref();
const stateSelectorRef = ref();
const cbsaSelectorRef = ref();
const countySelectorRef = ref();

const models = reactive({
    epaRegion: props.modelValue[0],
    state: props.modelValue[1],
    cbsa: props.modelValue[2],
    county: props.modelValue[3],
});

const emits = defineEmits(['update:modelValue', 'on-change']);
const emitChangeEvent = (optionValue) => {
    const model = [models.epaRegion, models.state, models.cbsa, models.county];
    emits('update:modelValue', model);
    emits('on-change', model, optionValue);
};
const handleEpaClear = () => {
    epaRegionSelectorRef.value.handleClear();
    models.epaRegion = undefined;
    handleEpaRegionChange();
};
const handleStateClear = () => {
    stateSelectorRef.value.handleClear();
    models.state = undefined;
    handleStateChange();
};
const handleCbsaClear = () => {
    cbsaSelectorRef.value.handleClear();
    models.cbsa = undefined;
    handleCbsaChange();
};
const handleCountyClear = () => {
    countySelectorRef.value.handleClear();
    models.county = undefined;
    handleCountyChange();
};
const handleEpaRegionInit = async (val) => {
    const set = new Set();
    await stateSelectorRef.value.filterOptions((options) => {
        const result = [];
        for (let i = 0, len = options.length; i < len; i++) {
            const item = options[i];
            if (item.data.epaRegionId === val) {
                set.add(item.value);
                result.push(item);
            }
        }
        return result;
    });
    await handleStateInit([...set]);
};
const handleStateInit = async (geoIds) => {
    const set = new Set(geoIds);
    await countySelectorRef.value.filterOptions((options) => {
        return options.filter((item) => set.has(item.value.substr(0, 2)));
    });
};
const handleEpaRegionChange = async (val) => {
    models.state = undefined;
    models.cbsa = undefined;
    models.county = undefined;

    if (val) {
        emitChangeEvent(epaRegionSelectorRef.value.getOptionValue(val));
        await handleEpaRegionInit(val);
    } else {
        emitChangeEvent();
        await stateSelectorRef.value.filterOptions((options) => options);
        await countySelectorRef.value.filterOptions((options) => options);
    }
};

const handleStateChange = async (val) => {
    models.cbsa = undefined;
    models.county = undefined;

    if (val) {
        emitChangeEvent(stateSelectorRef.value.getOptionValue(val));
        await handleStateInit([val]);
    } else {
        if (models.epaRegion) {
            emitChangeEvent(epaRegionSelectorRef.value.getOptionValue(models.epaRegion));
        } else {
            emitChangeEvent();
        }
        await countySelectorRef.value.filterOptions((options) => options);
    }
};
const handleCbsaInit = async (val) => {
    const cbsas = await getCbsaById(val);
    const set = new Set(cbsas.map((item) => item.countyGeoId));
    await countySelectorRef.value.filterOptions((options) => {
        return options.filter((item) => set.has(item.value));
    });
};
const handleCbsaChange = async (val) => {
    models.epaRegion = undefined;
    models.state = undefined;
    models.county = undefined;

    if (val) {
        emitChangeEvent(cbsaSelectorRef.value.getOptionValue(val));
        await stateSelectorRef.value.filterOptions((options) => options);
        await handleCbsaInit(val);
    } else {
        emitChangeEvent();
        await stateSelectorRef.value.filterOptions((options) => options);
        await countySelectorRef.value.filterOptions((options) => options);
    }
};

const handleCountyChange = (val) => {
    if (val) {
        emitChangeEvent(countySelectorRef.value.getOptionValue(val));
    } else {
        if (models.cbsa) {
            emitChangeEvent(cbsaSelectorRef.value.getOptionValue(models.cbsa));
        } else if (models.state) {
            emitChangeEvent(stateSelectorRef.value.getOptionValue(models.state));
        } else if (models.epaRegion) {
            emitChangeEvent(epaRegionSelectorRef.value.getOptionValue(models.epaRegion));
        } else {
            emitChangeEvent();
        }
    }
};
watch(
    () => props.modelValue,
    async (val) => {
        initModel(val);
    }
);
const initModel = (val) => {
    models.epaRegion = val[0];
    models.state = val[1];
    models.cbsa = val[2];
    models.county = val[3];
};
onMounted(async () => {
    await nextTick();
    await initModel(props.modelValue);
    await epaRegionSelectorRef.value.initOptions();
    await stateSelectorRef.value.initOptions();
    await countySelectorRef.value.initOptions();
    await cbsaSelectorRef.value.initOptions();
    if (models.epaRegion) {
        await handleEpaRegionInit(models.epaRegion);
        await epaRegionSelectorRef.value.filterOptions((options) => options);
    }
    if (models.state) {
        await handleStateInit([models.state]);
        if (!models.epaRegion) {
            await stateSelectorRef.value.filterOptions((options) => options);
        }
    }
    if (models.cbsa) {
        await cbsaSelectorRef.value.filterOptions((options) => options);
        await handleCbsaInit(models.cbsa);
    }
    if (models.county) {
        if (!models.cbsa && !models.state && !models.epaRegion) {
            await countySelectorRef.value.filterOptions((options) => options);
        }
    }
});
</script>

<style scoped lang="scss">
.district-selector {
    display: flex;
    flex-flow: row wrap;
    .divider {
        width: 2px !important;
        box-sizing: border-box;
        margin: 0;
        border-left-width: 1px !important;
    }
    .item {
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        padding: 0 5px;
        .center {
            width: 100%;
            position: relative;
            .region-select {
                width: 100%;
            }
            .clear-btn {
                position: absolute;
                top: 40px;
                right: 13px;
                cursor: pointer;
            }
            :deep(.el-select-v2__suffix) {
                .el-icon {
                    font-size: v-bind(iconSize);
                }
            }
        }
    }
}
</style>
