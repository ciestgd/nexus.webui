<template>
    <el-select-v2
        v-model="model"
        filterable
        remote
        placeholder="Explore a location"
        :options="options"
        :remote-method="remoteMethod"
        :loading="loading"
        style="width: 100%"
        clearable
        @change="handleChange"
    >
        <template #default="{ item }">
            <div class="option-box">
                <el-tooltip :content="item.label" placement="bottom-start" effect="customized" trigger="hover" :offset="16" v-if="item.label.length > 18">
                    <span class="left">{{ item.label }}</span>
                </el-tooltip>
                <span class="left" v-else>{{ item.label }}</span>
                <span class="right" v-if="item.tips">{{ item.tips }}</span>
            </div>
        </template>
    </el-select-v2>
</template>
<script setup>
import { getState, getEpaRegion, getCounty, getCBSA } from '@/api/district.js';
import { useZoomSelectorStore } from '@/store/zoom-selector.js';
const zoomSelectorStore = useZoomSelectorStore();
const loading = ref(false);
const model = defineModel();
const epaRegionList = ref([]);
const stateList = ref([]);
const countyList = ref([]);
const cbsaList = ref([]);
const options = ref([]);
const emits = defineEmits(['on-change']);
const getEpaRegionData = async () => {
    if (zoomSelectorStore.epaRegionList.length == 0) {
        let res = await getEpaRegion();
        let list = res || [];
        list = list.map((item) => {
            return {
                data: item,
                value: item.id,
                label: item.id,
                tips: '',
                type: 'epaRegion',
            };
        });
        zoomSelectorStore.epaRegionList = list;
    }
    epaRegionList.value = zoomSelectorStore.epaRegionList || [];
};
const getStateData = async () => {
    if (zoomSelectorStore.stateList.length == 0) {
        let res = await getState();
        let list = res || [];
        list = list.map((item) => {
            return {
                data: item,
                value: item.geoId,
                label: item.abbrName,
                tips: item.name,
                type: 'state',
            };
        });
        zoomSelectorStore.stateList = list;
    }
    stateList.value = zoomSelectorStore.stateList || [];
};
const getCountyData = async () => {
    if (zoomSelectorStore.countyList.length == 0) {
        let res = await getCounty();
        let list = res || [];
        list = list.map((item) => {
            let stateItem = stateList.value.filter((_item) => _item.value === item.geoId.substr(0, 2));
            let stateAbbrName = stateItem.length ? stateItem[0].label : null;
            let stateId = stateItem.length ? stateItem[0].value : null;
            return {
                data: {
                    ...item,
                    stateAbbrName,
                    stateId,
                },
                value: item.geoId,
                label: item.name,
                tips: stateAbbrName,
                type: 'county',
            };
        });
        zoomSelectorStore.countyList = list;
    }
    countyList.value = zoomSelectorStore.countyList || [];
};
const getCbsaData = async () => {
    if (zoomSelectorStore.cbsaList.length == 0) {
        let res = await getCBSA();
        let list = res || [];
        list = list.map((item) => {
            return {
                data: item,
                value: item.geoId,
                label: item.name,
                tips: '',
                type: 'cbsa',
            };
        });
        zoomSelectorStore.cbsaList = list;
    }
    cbsaList.value = zoomSelectorStore.cbsaList || [];
};
const handleSearch = async (query, data) => {
    if (query !== '') {
        query = query.toUpperCase();
        let list = data.filter((item) => {
            return item.label.toUpperCase().startsWith(query) || (item.tips && item.tips.toUpperCase().startsWith(query));
        });
        return list;
    } else {
        return [];
    }
};

const remoteMethod = async (query) => {
    if (query) {
        loading.value = true;
        try {
            let epaRegionData = await handleSearch(query, epaRegionList.value);
            let stateData = await handleSearch(query, stateList.value);
            let countyData = await handleSearch(query, countyList.value);
            let cbsaData = await handleSearch(query, cbsaList.value);
            let list = [];
            if (epaRegionData.length) {
                list.push({
                    label: 'EPA Region',
                    value: 'epaRegion',
                    options: epaRegionData,
                });
            }
            if (stateData.length) {
                list.push({
                    label: 'State',
                    value: 'state',
                    options: stateData,
                });
            }
            if (countyData.length) {
                list.push({
                    label: 'County',
                    value: 'county',
                    options: countyData,
                });
            }
            if (cbsaData.length) {
                list.push({
                    label: 'CBSA',
                    value: 'cbsa',
                    options: cbsaData,
                });
            }
            options.value = list;
        } catch {
        } finally {
            loading.value = false;
        }
    } else {
        options.value = [];
    }
};
const getOptionValue = (val) => {
    return val && options.value.find((item) => item.options.find((_item) => _item.value === val));
};
const handleChange = async (val) => {
    let item = await getOptionValue(val);
    let data = null;
    if (item) {
        data = item.options.find((_item) => _item.value === val);
    }
    emits('on-change', val, data);
};
onMounted(async () => {
    await getEpaRegionData();
    await getStateData();
    await getCountyData();
    await getCbsaData();
});
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
