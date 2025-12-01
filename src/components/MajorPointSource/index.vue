<template>
    <div class="major-point-sources-data">
        <div class="major-point-sources-select">
            <div class="select-item pollutants">
                <div class="select-header">
                    Select Pollutants:
                    <div class="select-detail">
                        <div class="sources-item" style="padding: 0">
                            Top X Emission Sources:
                            <ParameterTip
                                content="Users can select a specific number of point emission sources. The sources are listed in ascending order of emissions.The default value is 20, which shows the 20 emission sources with the largest emissions."
                            />
                            <el-input-number @change="resetList" v-model="topXEmissionSources" class="sites-number" size="small" :min="1" :max="100" controls-position="right" />
                        </div>
                        <div class="radio-box">
                            <el-radio-group v-model="dataType">
                                <el-radio :value="1">Emission Table</el-radio>
                                <el-radio :value="2">Emission Chart</el-radio>
                            </el-radio-group>
                        </div>
                        <el-button type="primary" size="small" @click="exportData">Output</el-button>
                    </div>
                </div>
                <div class="select-content pollutants-content">
                    <el-checkbox v-model="item.show" v-for="(item, index) in emissionList" @change="handleCheckbox(item)" size="small">{{ item.label }}</el-checkbox>
                </div>
            </div>
        </div>
        <div class="major-point-sources-content">
            <div class="content-main" ref="majorPointSourcesContent" v-loading="loading" element-loading-text="Loading...">
                <div class="content-list" v-show="dataType === 1">
                    <div class="content-item" v-for="(item, index) in showList">
                        <div class="content-header-item" :class="[activeLayerType === item.type && checkModel ? 'active-header-item' : '']" @click="handleHeaderClick(item.type)">
                            {{ item.label }}
                        </div>
                        <MajorPointSourceItem
                            @handleHover="hoverItem"
                            @handleMenu="setMenu"
                            @click="setMapIcon(_source, item.type)"
                            v-for="(_source, _index) in item.list"
                            :data="_source"
                            :label="item.label"
                            :type="item.type"
                            :activeId="activeItem.data.facilityId"
                            :colorList="colorList"
                            :selectId="selectId"
                            :key="item.type + _index"
                        />
                    </div>
                </div>
                <div class="content-list" style="flex-wrap: wrap" v-show="dataType === 2">
                    <div class="chart-item" v-for="(item, index) in emissionList.filter((item) => item.show)">
                        <MajroPointSourcesChart :key="index" :dataType="props.dataType" :topCount="topXEmissionSources" :data="item.list" :label="item.label" :type="item.type" />
                    </div>
                </div>
            </div>
            <div class="tips-box">
                <div class="content-tips">Click the pollutant title to overlay emission sources on Map;Click the marker to view in Map</div>
                
            </div>
        </div>
        <Tooltip ref="tooltipRef" :append-ref="majorPointSourcesContent" effect="customized">
            <div class="popper-detail-content">
                <div class="popper-detail-content">
                    <div class="detail-content-item">Facility: {{ activeItem.data.siteName }}</div>
                    <div class="detail-content-item">Sector: {{ activeItem.data.sectorProjectGroup }}</div>
                    <div class="detail-content-item">
                        {{ activeItem.label }}({{
                            activeItem.type == 'Gas_VOC_HAPs' || activeItem.type === 'Heavy_Metal_HAPs' ? 'LB' : activeItem.type === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY'
                        }}):
                        <span> {{ activeItem.data.value }}</span>
                    </div>
                </div>
            </div>
        </Tooltip>
        <Tooltip ref="menuRef" :append-ref="majorPointSourcesContent" effect="light" placement="right" trigger="contextmenu" :enterable="true">
            <div class="menu-content">
                <div class="color-list">
                    <span class="color-item" @click="setSourceColor(item)" v-for="item in markColorList" :style="{ background: item }"></span>
                </div>
                <div @click="handleColorClear" class="color-clear-btn">Clear Selected Color</div>
                <div @click="handleColorAllClear" class="color-clear-btn">Clear All Colors</div>
            </div>
        </Tooltip>
    </div>
</template>
<script setup>
import { markColorList } from '@/libs/color-list';
import MajroPointSourcesChart from './MajorPointSourcesChart.vue';
import MajorPointSourceItem from './MajorPointSourceItem.vue';
import { OverlayScrollbars } from 'overlayscrollbars';
import exportExcel from '@/libs/export-excel';
import { useMajorEissionStore } from '@/store/major-eission-sources';
const majorEissionStore = useMajorEissionStore();
const { showMapLayer, setOneMapIcon, setSteps } = majorEissionStore.layer;

const props = defineProps({
    count: {
        type: Number,
        default: 20,
    },
    data: {
        type: Array,
        default: [],
    },

    loading: {
        type: Boolean,
        default: false,
    },
    fileName: {
        type: String,
        default: 'Major Point Scources',
    },
    dataType: {
        type: String,
        default: 'majorPointSources',
    },
});
const emits = defineEmits(['resetList', 'handleCheckbox']);
const colorList = computed(() => majorEissionStore.colorList);
const selectId = computed(() => majorEissionStore.selectId);
const checkModel = computed(() => majorEissionStore.dataType === props.dataType);
const topXEmissionSources = ref(props.count);
const dataType = ref(1);
const majorPointSourcesContent = ref();
const emissionList = computed(() => props.data);
const loading = computed(() => props.loading);
const activeLayerType = ref(majorEissionStore.type);
const tooltipRef = ref();
const menuRef = ref();
const menuActiveId = ref();
const activeItem = reactive({
    data: {},
    type: '',
    label: '',
});
watch(
    () => props.count,
    (val) => {
        topXEmissionSources.value = val;
        setSteps(topXEmissionSources.value);
    },
    {
        deep: true,
    }
);
watch(
    () => majorEissionStore.type,
    (val) => {
        activeLayerType.value = val;
        if (!majorEissionStore.type) {
            majorEissionStore.selectId = null;
        }
    }
);
const showList = computed(() => emissionList.value.filter((item) => item.show));
const resetList = () => {
    setSteps(topXEmissionSources.value);
    emits('resetList', topXEmissionSources.value);
};
const handleCheckbox = (item) => {
    emits('handleCheckbox', item);
};
const handleHeaderClick = (type) => {
    if (activeLayerType.value !== type || majorEissionStore.dataType !== props.dataType) {
        majorEissionStore.type = type;
        majorEissionStore.dataType = props.dataType;
        showLayer(type);
    }
};
const showLayer = (type) => {
    let options = ref([]);
    emissionList.value.forEach((item) => {
        if (item.type === type) {
            options.value = item.list;
        }
    });
    setSteps(options.value.length);
    let dataList = options.value.map((item) => {
        let { facilityId, siteLon, siteLat, ranking, value, sectorProjectGroup, siteName } = item;
        let data = {
            facilityId,
            siteLon,
            siteLat,
            ranking,
            value,
            sectorProjectGroup,
            siteName,
        };
        data.baseData = JSON.stringify(item);
        return data;
    });

    showMapLayer(dataList, 'circle', majorEissionStore.setFeature);
};

const setMapIcon = (val, key) => {
    let { facilityId, siteLon, siteLat, ranking, value, sectorProjectGroup, siteName } = val;
    let data = {
        facilityId,
        siteLon,
        siteLat,
        ranking,
        value,
        sectorProjectGroup,
        siteName,
    };
    data.baseData = JSON.stringify(val);
    majorEissionStore.selectId = facilityId;
    handleHeaderClick(key);
    majorEissionStore.clearOtherLayer();
    setOneMapIcon([data], majorEissionStore.setFeature);
    getSelectData(val);
};
const getSelectData = async (val) => {
    majorEissionStore.getSelectData(val);
};
const hoverItem = (data, currentTarget) => {
    activeItem.data = data.data;
    activeItem.type = data.type;
    activeItem.label = data.label;
    tooltipRef.value.resetData(currentTarget);
};
const setMenu = (data, currentTarget) => {
    menuActiveId.value = data.facilityId;
    menuRef.value.resetData(currentTarget);
};
const closeMenu = () => {
    menuRef.value.hiddenTips();
};
const setColor = (item, id) => {
    if (item) {
        majorEissionStore.colorList[id] = item;
    } else {
        if (majorEissionStore.colorList[id]) {
            majorEissionStore.colorList[id] = null;
        } else {
            majorEissionStore.colorList = {};
        }
    }
};
const setSourceColor = (item) => {
    setColor(item, menuActiveId.value);
    closeMenu();
};
const handleColorClear = () => {
    setColor(null, menuActiveId.value);
    closeMenu();
};
const handleColorAllClear = () => {
    setColor(null, null);
    closeMenu();
};
const exportData = async () => {
    let exportList = emissionList.value.filter((item) => item.show);
    let columns = [
        {
            header: 'Ranking #',
            key: 'index',
            width: 10,
        },
    ];
    let tableData = [];
    exportList.forEach((item) => {
        let list = item.list;
        let unit = item.type == 'Gas_VOC_HAPs' || item.type === 'Heavy_Metal_HAPs' ? 'LB' : item.type === 'Diesel_PM_HAPs' ? 'TONS' : 'TPY';
        let key = item.type.toLowerCase();
        let columnsItem = [
            {
                header: `${item.label}`,
                key: key,
                width: 60,
            },
        ];
        columns = columns.concat(columnsItem);
        list.forEach((value, index) => {
            let data = tableData[index];
            let infoData = {
                facility: value.siteName,
                facilityId: value.facilityId,
                sector: value.sectorProjectGroup,
                label: `${item.label}(${unit})`,
                value: value.value,
            };
            if (data) {
                data[key] = infoData;
            } else {
                let obj = {};
                obj['index'] = index + 1;
                obj[key] = infoData;
                tableData.push(obj);
            }
        });
    });
    const headerStyleFn = (row) => {
        row.height = 40;
        return row;
    };
    const cellStyleFn = (row) => {
        row.eachCell((cell) => {
            let value = cell.value;
            if (Object.prototype.toString.call(value) === '[object Object]') {
                let arr = [
                    {
                        text: `Facility: ${value.facility}\n`,
                    },
                    {
                        text: `Sector: ${value.sector}\n`,
                    },
                    {
                        text: `${value.label}: ${value.value}`,
                    },
                ];
                cell.value = {
                    richText: arr,
                };
                if (selectId.value == value.facilityId) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'ffffff00' },
                    };
                }
            }
            cell.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };
        });
        row.height = 60;
        return row;
    };
    let fileName = props.fileName;
    exportExcel(fileName, [
        {
            tableName: 'sheet',
            columList: columns,
            data: tableData,
            cellStyleFn,
            headerStyleFn,
        },
    ]);
};
const resetLayer = () => {
    showLayer(activeLayerType.value);
};
onMounted(() => {
    OverlayScrollbars(majorPointSourcesContent.value, {
        overflow: {
            x: 'scroll',
            y: 'scroll',
        },
    });
    majorEissionStore.dataType = props.dataType;
});
defineExpose({ resetLayer });
</script>
<style scoped lang="scss">
.major-point-sources-data {
    height: 100%;
    display: flex;
    flex-direction: column;
    .major-point-sources-select {
        display: flex;
        border: 1px solid #ccc;
        .select-item {
            width: 100%;
            box-sizing: border-box;
            .select-header {
                height: 32px;
                font-size: 12px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-sizing: border-box;
                padding: 0 5px;
                border-bottom: 1px solid #ccc;
                background: #f7f7f7;
                .sites-number {
                    width: 100px;
                    margin-left: 5px;
                }
                .select-detail {
                    display: flex;
                    align-items: center;
                    .radio-box {
                        margin-left: 10px;
                        :deep(.el-radio) {
                            margin-right: 10px;
                        }
                    }
                }
            }
            .select-content {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                box-sizing: border-box;
                padding: 5px;
                .sites-content-item {
                    display: flex;
                    width: 48%;
                    justify-content: space-between;
                    align-items: center;
                    margin-right: 5px;
                    font-size: 12px;
                }
            }
            .pollutants-content {
                :deep(.el-checkbox) {
                    margin-right: 10px;
                }
            }
        }
        .select-item + .select-item {
            border-left: 1px solid #ccc;
        }
    }
    .major-point-sources-content {
        margin-top: 10px;
        flex: 1;
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .content-main {
            flex: 1;
            overflow: auto;
            position: relative;
            box-sizing: border-box;
            .content-list {
                display: flex;
                width: 100%;
                min-height: 100%;
                .content-item {
                    position: relative;
                    min-height: 360px;
                    min-width: 160px;
                    border: 1px solid #000;
                    // border-top: none;
                    box-sizing: border-box;
                    border-radius: 5px 5px 0 0;
                    .content-item-detail-active {
                        background: #b9d1ea;
                    }
                    .content-header-item {
                        position: sticky;
                        top: 0px;
                        width: 100%;
                        box-sizing: border-box;
                        padding: 5px;
                        background: #f0f0f0;
                        border-radius: 5px 5px 0 0;
                        font-size: 14px;
                        font-weight: bold;
                        color: var(--point-color);
                        text-decoration: underline;
                        display: flex;
                        cursor: pointer;
                        align-items: center;
                        font-style: oblique;
                        &::before {
                            content: ' ';
                            width: 8px;
                            height: 8px;
                            // background: #33a14f;
                            background: var(--point-color);
                            border-radius: 50%;
                            display: inline-block;
                            margin-right: 5px;
                        }
                    }
                    .active-header-item {
                        color: #fff;
                        background: var(--point-color);
                        &::before {
                            background: #fff;     
                        }
                    }
                }
                .content-item + .content-item {
                    margin-left: 5px;
                }
                .chart-item {
                    width: 100%;
                }
                .chart-item + .chart-item {
                    margin-top: 5px;
                }
            }
        }
        .tips-box {
            margin-top: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .content-tips {
                color: #6fa76f;
            }
        }
    }
}
.menu-content {
    width: 140px;
    background: #fff;

    .color-list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .color-item {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 2px 2px;
        }
    }
    .color-clear-btn {
        font-size: 14px;
        cursor: pointer;
        height: 20px;
        margin-top: 5px;
    }
}
</style>
