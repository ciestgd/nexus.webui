<template>
    <Dialog title="App Configuration" height="400" width="450" ref="advancedOptionRef">
        <div class="advanced-option">
            <div class="advanced-content">
                <el-form :model="form" label-width="222px" class="form-box">
                    <el-form-item label="Default boundary">
                        <el-select v-model="form.boundary" collapse-tags size="small">
                            <el-option v-for="item in boundaryOption" :key="item.key" :label="item.label" :value="item.key" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Default online base map">
                        <el-select v-model="form.baseMap" size="small">
                            <el-option v-for="item in baseMapOption" :key="item.key" :label="item.label" :value="item.key" />
                        </el-select>
                    </el-form-item>
                    <!-- <el-form-item label="Default Project Year">
                        <el-select v-model="form.projectYear" size="small">
                            <el-option v-for="item in dataYearOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item> -->
                    <el-form-item label="Default Data Scale">
                        <el-select v-model="form.dataScale" size="small">
                            <el-option v-for="item in dataScaleStore.options" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Default Top X Sites">
                        <el-input-number v-model="form.topCount" size="small" :min="1" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="Default Top X Emission Sources">
                        <el-input-number v-model="form.topXEmissionSources" size="small" :min="1" controls-position="right" />
                    </el-form-item>
                    <el-form-item label="Default Zoom in/out delta">
                        <el-input-number v-model="form.zoomDelta" size="small" :min="0.1" controls-position="right" />
                    </el-form-item>
                </el-form>
            </div>
            <div class="advanced-btn">
                <el-button type="primary" @click="handleSubmit">Submit</el-button>
                <el-button @click="handleClose">Cancel</el-button>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { useDataScaleStore } from '@/store/data-scale.js';
import { useProjectYearStore } from '@/store/project-year.js';
import { useAdvancedOptionStore } from '@/store/advanced-option';
import baseLayers from '@/libs/map/layers/base-layers';
const dataScaleStore = useDataScaleStore();
const projectYearStore = useProjectYearStore();
const advancedOptionStore = useAdvancedOptionStore();
const dataYearOptions = [2017, 2018, 2019];
const advancedOptionRef = ref();
const form = reactive({
    boundary: 1,
    baseMap: 'Esri Light Gray',
    projectYear: '',
    dataScale: '',
    topCount: 100,
    topXEmissionSources: 20,
    zoomDelta: 0.2,
});

const baseMapOption = ref([]);
const boundaryOption = ref([
    {
        label: 'EPA Region (2017)',
        key: 0,
    },
    {
        label: 'State (2021)',
        key: 1,
    },
    {
        label: 'County (2011)',
        key: 2,
    },
    {
        label: 'County (2017)',
        key: 3,
    },
    {
        label: 'CBSA (2018)',
        key: 4,
    },
    {
        label: 'Census Tract (2019)',
        key: 5,
    },
    {
        label: 'Census Tract (2021)',
        key: 6,
    },
]);
const handleSubmit = () => {
    localStorage.setItem('advancedOption', JSON.stringify(form));
    advancedOptionStore.option = form;
    handleClose();
};
const handleClose = () => {
    advancedOptionRef.value.handleClose();
};
onMounted(async () => {
    await nextTick();
    baseLayers.forEach((item, index) => {
        baseMapOption.value.push({
            label: item.get('title'),
            key: item.get('title'),
        });
    });
    let advancedOption = localStorage.getItem('advancedOption');
    if (advancedOption) {
        advancedOption = JSON.parse(advancedOption);
        form.boundary = advancedOption.boundary;
        form.baseMap = advancedOption.baseMap || 'Open Street Map';
        form.projectYear = advancedOption.projectYear;
        form.dataScale = advancedOption.dataScale;
        form.topCount = advancedOption.topCount;
        form.topXEmissionSources = advancedOption.topXEmissionSources;
        form.zoomDelta = advancedOption.zoomDelta;
    } else {
        form.dataScale = dataScaleStore.dataScale;
        form.projectYear = projectYearStore.projectYear;
    }
});
</script>
<style scoped lang="scss">
.advanced-option {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 5px;
    .advanced-content {
        width: 100%;
        display: flex;
        align-items: center;

        flex-direction: column;
        .form-box {
            width: 100%;
            .el-form-item {
                margin-bottom: 10px;
            }
        }
    }
    .advanced-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 5px;
    }
}
.advanceMode-item {
    :deep(.el-form-item__label) {
        color: var(--advanced-color);
    }
}
</style>
