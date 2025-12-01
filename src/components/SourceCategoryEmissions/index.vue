<template>
    <div class="major-point-sources-data">
        <div class="major-point-sources-select">
            <div class="select-item pollutants">
                <div class="select-header">
                    <div>Select Pollutants:</div>
                    <div class="radio-box">
                        <el-radio-group v-model="dataType">
                            <el-radio :value="1">Category Emission Table</el-radio>
                            <el-radio :value="2">Category Emission Pie</el-radio>
                        </el-radio-group>
                        <el-button type="primary" size="small" @click="exportData">Output</el-button>
                    </div>
                </div>
                <div class="select-content pollutants-content">
                    <el-checkbox v-model="item.show" size="small" v-for="item in emissionList">{{ item.label }}</el-checkbox>
                </div>
            </div>
        </div>
        <div class="major-point-sources-content">
            <div class="content-main" ref="majorPointSourcesContent">
                <div class="content-list" v-if="dataType === 1">
                    <div class="content-item" v-for="item in emissionList.filter((item) => item.show)">
                        <div class="content-header-item">{{ item.label }}</div>
                        <SourceCategoryEmissionItem
                            @handle-hover="handelHover"
                            :type="item.type"
                            :activeType="activeType"
                            v-for="(_item, index) in item.list"
                            :data="_item"
                            :key="index"
                        />
                    </div>
                </div>
                <div class="pie-content" v-if="dataType === 2">
                    <SourceCategoryEmissionPie
                        :dataType="props.dataType"
                        v-for="item in emissionList.filter((item) => item.show)"
                        :type="item.type"
                        :label="item.label"
                        :data="item.list"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import SourceCategoryEmissionItem from './SourceCategoryEmissionItem.vue';
import SourceCategoryEmissionPie from './SourceCategoryEmissionPie.vue';
import { OverlayScrollbars } from 'overlayscrollbars';
import exportExcel from '@/libs/export-excel';
const props = defineProps({
    data: {
        type: Array,
        default: [],
    },
    fileName: {
        type: String,
        default: '',
    },
    dataType: {
        type: String,
        default: 'majorPointSources',
    },
});
const emits = defineEmits(['exportData']);
const emissionList = computed(() => props.data);
const dataType = ref(1);
const activeType = ref();
const majorPointSourcesContent = ref();
const handelHover = (val) => {
    activeType.value = val;
};
const exportData = async () => {
    let exportList = emissionList.value.filter((item) => item.show);
    let columns = [];
    let tableData = [];
    exportList.forEach((item) => {
        let list = item.list;
        let key = item.type.toLowerCase();
        columns.push({
            header: `${item.label}`,
            key: key,
            width: 60,
        });
        list.forEach((value, index) => {
            let data = tableData[index];
            let infoData = {
                name: value.name,
                percent: value.percent,
                value: value.value,
                childs: value.childs,
            };
            if (data) {
                data[key] = infoData;
            } else {
                let obj = {};
                obj[key] = infoData;
                tableData.push(obj);
            }
        });
    });
    const cellStyleFn = (row) => {
        row.eachCell((cell) => {
            let value = cell.value;
            if (Object.prototype.toString.call(value) === '[object Object]') {
                let arr = [
                    {
                        text: `Source: ${value.name}\n`,
                    },
                    {
                        text: `Emission(TPY): ${value.value}\n`,
                    },
                ];
                if (value.percent) {
                    arr.push({
                        text: `% of Total Emissions: ${value.percent}\n`,
                    });
                }
                if (value.childs.length) {
                    let childsArr = [];
                    value.childs.forEach((item) => {
                        let itemArr = [
                            {
                                text: `\n`,
                            },
                            {
                                text: `NP: ${item.name}\n`,
                            },
                            {
                                text: `Emission(TPY): ${item.value}\n`,
                            },
                            {
                                text: `% of Total Emissions: ${item.percent}\n`,
                            },
                        ];
                        childsArr = childsArr.concat(itemArr);
                    });
                    arr = arr.concat(childsArr);
                }
                cell.value = {
                    richText: arr,
                };
            }
            cell.alignment = { wrapText: true };
        });
        row.height = 90;
        return row;
    };
    let fileName = props.fileName;
    exportExcel(fileName, [
        {
            tableName: 'sheet',
            columList: columns,
            data: tableData,
            cellStyleFn,
            headerStyleFn: null,
        },
    ]);
};
onMounted(async () => {
    OverlayScrollbars(majorPointSourcesContent.value, {
        overflow: {
            x: 'scroll',
            y: 'scroll',
        },
    });
});
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
                }
                .radio-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    // margin-right: 10px;
                    :deep(.el-radio) {
                        margin-right: 10px;
                    }
                }
            }
            .select-content {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                box-sizing: border-box;
                padding: 5px;
                font-size: 12px;
                .sites-content-item {
                    display: flex;
                    width: 48%;
                    justify-content: space-between;
                    align-items: center;
                    margin-right: 5px;
                }
            }
            .pollutants-content {
                :deep(.el-checkbox) {
                    margin-right: 10px;
                    // margin-bottom: 5px;
                }
            }
        }
        .select-item + .select-item {
            border-left: 1px solid #ccc;
        }
    }
    .major-point-sources-content {
        margin-top: 10px;
        // height: 390px;
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
                .content-item {
                    position: relative;
                    // min-height: 360px;
                    min-width: 210px;
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
                        display: flex;
                        cursor: pointer;
                        align-items: center;
                        font-style: oblique;
                        // &::before {
                        //     content: ' ';
                        //     width: 8px;
                        //     height: 8px;
                        //     background: #33a14f;
                        //     border-radius: 50%;
                        //     display: inline-block;
                        //     margin-right: 5px;
                        // }
                    }
                }
                .content-item + .content-item {
                    margin-left: 5px;
                }
            }
            .pie-content {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
            }
        }
    }
}
</style>
