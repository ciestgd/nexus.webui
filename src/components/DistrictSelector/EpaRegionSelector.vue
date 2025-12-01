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
    >
    </el-select-v2>
    <!-- clearable
        @clear="handleClear" -->
</template>

<script setup>
import { getEpaRegion } from '@/api/district.js';
const loading = ref(false);

let cachedOptions = [];
const options = ref([]);

const getOptions = async () => {
    try {
        loading.value = true;
        const result = [];
        const data = await getEpaRegion();
        for (let i = 0, len = data.length; i < len; i++) {
            const item = data[i];
            result.push({
                data: item,
                value: item.id,
                label: item.id,
            });
        }
        return result;
    } catch {
        return [];
    } finally {
        loading.value = false;
    }
};

const handleVisibleChange = async () => {
    initOptions();
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
