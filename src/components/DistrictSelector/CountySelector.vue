<template>
    <el-select-v2
        :options="options"
        value-key="value"
        :loading="loading"
        scrollbar-always-on
        placeholder="None"
        @visible-change="handleVisibleChange"
        :height="340"
        filterable
        :filter-method="handleSearch"
        :clearable="false"
        @clear="handleClear"
        :disabled="countyDisable"
    >
        <template #default="{ item }">
            <div class="option-box">
                <span class="left">{{ item.data.name }}</span>
                <span class="right">{{ item.data.stateAbbrName }}</span>
            </div>
        </template>
    </el-select-v2>
</template>

<script setup>
import { getCounty, getState } from '@/api/district.js';
import { useRiskRankingStore } from '@/store/risk-ranking';
import { useDataScaleStore } from '@/store/data-scale';

const riskRankingStore = useRiskRankingStore();
const dataScaleStore = useDataScaleStore();
const loading = ref(false);

let cachedOptions = [];
const options = ref([]);
const countyDisable = computed(() => dataScaleStore.isCountyLevel && !riskRankingStore.isOnNation);
const getOptions = async () => {
    try {
        loading.value = true;
        const result = [];
        const stateData = await getState();
        const data = await getCounty();
        for (let i = 0, len = data.length; i < len; i++) {
            const item = data[i];
            let stateItem = stateData.filter((_item) => _item.geoId === item.geoId.substr(0, 2));
            result.push({
                data: {
                    ...item,
                    stateAbbrName: stateItem.length ? stateItem[0].abbrName : null,
                    stateId: stateItem.length ? stateItem[0].geoId : null,
                },
                value: item.geoId,
                label: item.name,
            });
        }
        result.sort((a, b) => {
            if (a.label < b.label) {
                return -1;
            }
            if (a.label > b.label) {
                return 1;
            }
            return 0;
        });
        return result;
    } catch {
        return [];
    } finally {
        loading.value = false;
    }
};

const handleVisibleChange = async () => {
    await initOptions();
};

const handleClear = () => {
    options.value = cachedOptions;
};

const handleSearch = async (query) => {
    if (query !== '') {
        query = query.toUpperCase();
        options.value = cachedOptions.filter((item) => {
            return item.label.toUpperCase().startsWith(query);
        });
    } else {
        handleClear();
    }
};

const filterOptions = async (callback) => {
    const _options = await getOptions();
    cachedOptions = callback(_options);
    options.value = cachedOptions;
    return cachedOptions;
};

const getOptionValue = (val) => {
    for (let i = 0, len = cachedOptions.length; i < len; i++) {
        const item = cachedOptions[i];
        if (item.value === val) {
            return item.data;
        }
    }
};
const initOptions = async () => {
    if (cachedOptions.length === 0) {
        cachedOptions = await getOptions();
    }
    options.value = cachedOptions;
};
defineExpose({ filterOptions, getOptionValue, handleClear, initOptions });
</script>
<style scoped lang="scss">
.option-box {
    width: 100%;
    overflow: hidden;
    display: flex;
    .left {
        margin-right: 8px;
    }
    .right {
        margin-left: auto;
        color: var(--el-text-color-secondary);
        font-size: 12px;
    }
}
</style>
