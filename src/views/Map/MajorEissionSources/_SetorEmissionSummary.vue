<template>
    <div class="setor-emission-content" ref="setorEmissionRef">
        <div class="setor-emission-box">
            <div class="configuration-box">
                <div class="pollutant-box">
                    <el-checkbox v-model="checkAll" class="checkbox-all" :indeterminate="isIndeterminate" @change="handleCheckAllChange">Pollutant</el-checkbox>
                    <el-checkbox-group class="checkbox-content" @change="handleCheckedChange" v-model="checkedList">
                        <el-checkbox size="small" v-for="item in emissionList" :key="item.type" :label="item.type">{{ item.label }}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="sources-box">
                    <div class="sources-item">
                        Emission Year:
                        <el-select v-model="emissionYear" class="sites-number" placeholder="Select" size="small">
                            <el-option v-for="item in emissionYearOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </div>
                    <div class="sources-item">
                        Population Year:
                        <el-select v-model="populationYear" class="sites-number" placeholder="Select" size="small">
                            <el-option v-for="item in dataYearOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </div>
                </div>
                <div class="sources-box">
                    <div class="sources-item">
                        Top X Emission Sources:
                        <ParameterTip
                            content="Users can select a specific number of emission sources and regions. The emission sources are listed in ascending order of emissions. The default value is 20 and 50, respectively. Note that “Top X Regions” only applies to the “Selected Region” option."
                        />
                        <el-input-number v-model="topXEmissionSources" class="sites-number" size="small" :min="1" :max="100" controls-position="right" />
                    </div>
                    <div class="sources-item">
                        <el-checkbox v-model="isRegionFilter" size="small" class="file-item-title">Top X Region:</el-checkbox>
                        <el-input-number v-model="topXRegion" class="sites-number" size="small" :min="1" :max="100" controls-position="right" />
                    </div>
                </div>
                <div class="region-type-box">
                    <span class="title">Region Type</span>
                    <el-radio-group v-model="regionType" class="radio-group" @change="handleTypeChange">
                        <el-radio size="small" value="epaRegion">EPA Region</el-radio>
                        <el-radio size="small" value="state">State</el-radio>
                        <el-radio size="small" value="cbsa">CBSA</el-radio>
                        <el-radio size="small" value="county">County</el-radio>
                    </el-radio-group>
                </div>
                <div class="select-file">
                    <div class="file-item">
                        <el-checkbox v-model="isUseFile" size="small" class="file-item-title" @change="handleUseFile">Selected Regions:</el-checkbox>
                        <el-input v-model="fileName" size="small" class="select-box" readonly></el-input>
                        <el-button type="primary" size="small" :icon="Folder" style="margin-left: 5px" circle @click="uploadSelect" />
                        <input type="file" :accept="uploadAccept" style="display: none" ref="fileInputRef" @change="handleUpload" />
                    </div>
                </div>
                <div class="filter-box">
                    <span class="title">Filter</span>
                    <el-input v-model="filterValue" placeholder="Please input" />
                </div>
            </div>
            <div class="region-box">
                <MyTransfer class="transfer-content" :keeps="9" :titles="['Available regions', 'Selected regions']" v-model="regionList" :data="regionTransferData"> </MyTransfer>
            </div>
            <div class="btn-box">
                <el-button type="primary" @click="showSummaryTable">Summary Table</el-button>
                <el-button type="primary" @click="showSummaryPlot">Summary Plot</el-button>
            </div>
        </div>
    </div>
</template>
<script setup>
import SummaryTable from './SummaryTableDialog.vue';
import SummaryPlot from './SummaryPlotDialog.vue';
import { showDialog } from '@/libs/utils';
import { OverlayScrollbars } from 'overlayscrollbars';
import { Folder } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { getEpaRegion, getState, getCounty, getCBSA } from '@/api/district.js';
import * as XLSX from 'xlsx';
import cbsaFileDefaultData from '@/libs/cbsa-file-default-data';
import { useProjectYearStore } from '@/store/project-year';
const projectYearStore = useProjectYearStore();
const props = defineProps({
    emissionYear: {
        type: Number,
        default: 2017,
    },
});
// 选中的污染物列表
const checkedList = ref(['NOx', 'SO2', 'PM25', 'CO2e', 'VOC', 'Gas_VOC_HAPs', 'Heavy_Metal_HAPs']);
// 污染物是否全选
const checkAll = ref(false);
// 全选状态
const isIndeterminate = ref(true);
// 污染物排名前几名
const topXEmissionSources = ref(20);
const topXRegion = ref(50);
const regionType = ref('cbsa');
// 文件上传名字
const fileName = ref('Template_CBSAs_rank.xlsx');
// 文件上传值
const filterValue = ref();
const populationYear = ref(2021);
const dataYearOptions = [2021];
const emissionYear = ref(props.emissionYear);
const emissionYearOptions = ref([2017, 2020]);
watch(
    () => props.emissionYear,
    (val) => {
        emissionYear.value = val;
    },
    { deep: true }
);
const emissionList = ref([
    {
        label: 'CO',
        type: 'CO',
        unit: 'TON',
        color: '#E81E63',
    },
    {
        label: 'NOx',
        type: 'NOx',
        unit: 'TON',
        color: '#F34336',
    },
    {
        label: 'VOC',
        type: 'VOC',
        unit: 'TON',
        color: '#FEC007',
    },
    {
        label: 'PM10',
        type: 'PM10',
        unit: 'TON',
        color: '#009587',
    },

    {
        label: 'PM2.5',
        type: 'PM25',
        unit: 'TON',
        color: '#00BBD3',
    },
    {
        label: 'CO2e',
        type: 'CO2e',
        unit: 'TON',
        color: '#3F51B3',
    },
    {
        label: 'NH3',
        type: 'NH3',
        unit: 'TON',
        color: '#3F51B3',
    },
    {
        label: 'GAS & VOC HAPs',
        type: 'Gas_VOC_HAPs',
        unit: 'LB',
        color: '#607D8A',
    },
    {
        label: 'Heavy Metal HAPs',
        type: 'Heavy_Metal_HAPs',
        unit: 'LB',
        color: '#CCDB39',
    },

    {
        label: 'Diesel PM',
        type: 'Diesel_PM_HAPs',
        unit: 'TON',
        color: '#4CAE50',
    },
    {
        label: 'SO2',
        type: 'SO2',
        unit: 'TON',
        color: '#2195F2',
    },

    // {
    //     label: 'CO2',
    //     type: 'CO2',
    //     unit: 'TON',
    // },

    {
        label: 'Lead',
        type: 'Lead',
        unit: 'LB',
        color: '#FE5722',
    },
]);
const isUseFile = ref(true);
const isRegionFilter = ref(true);
const regionList = ref([]);
const regionData = computed(() => {
    let list = [];
    if (isUseFile.value) {
        list = cbsaFileData.value;
    } else {
        if (regionType.value === 'epaRegion') {
            list = epaRegionData.value;
        } else if (regionType.value === 'state') {
            list = stateRegionData.value;
        } else if (regionType.value === 'cbsa') {
            list = cbsaRegionData.value;
        } else if (regionType.value === 'county') {
            list = countyRegionData.value;
        }
    }

    return list;
});
const regionTransferData = computed(() => {
    let list = regionData.value;
    list = [...list];
    if (filterValue.value) {
        list = list.filter((item) => {
            if (item.label.includes(filterValue.value) || item.key.includes(filterValue.value)) {
                return item;
            }
        });
    }
    if (isRegionFilter.value) {
        list = list.splice(0, topXRegion.value);
    }
    return list;
});
const setorEmissionRef = ref();
const fileInputRef = ref();
const uploadAccept = ref('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

const cbsaFileData = ref([]);
const epaRegionData = ref([]);
const stateRegionData = ref([]);
const cbsaRegionData = ref([]);
const countyRegionData = ref([]);

const handleTypeChange = () => {
    regionList.value = [];
    isUseFile.value = false;
};
const handleUseFile = () => {
    regionList.value = [];
};

const handleCheckAllChange = (val) => {
    checkedList.value = val ? emissionList.value.map((item) => item.type) : [];
    isIndeterminate.value = false;
};
const handleCheckedChange = (value) => {
    const checkedCount = value.length;
    checkAll.value = checkedCount === emissionList.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < emissionList.value.length;
};
const getAllEpaRegionData = async () => {
    let result = await getEpaRegion();
    let list = result.map((item) => {
        let label = 'EPA Region ' + item.id;
        return {
            key: item.id,
            label,
        };
    });
    epaRegionData.value = list;
};
const getStateRegionData = async () => {
    let result = await getState('');
    let list = result.map((item) => {
        return {
            key: item.geoId,
            label: item.abbrName,
        };
    });
    stateRegionData.value = list;
};
const getCbsaRegionData = async () => {
    let result = await getCBSA('');
    let list = result.map((item) => {
        return {
            key: item.geoId,
            label: item.name,
        };
    });
    cbsaRegionData.value = list;
};
const getCountyData = async () => {
    let result = await getCounty('');
    let stateObj = {};
    stateRegionData.value.forEach((item) => {
        stateObj[item.key] = item.label;
    });
    let list = result.map((item) => {
        let stateId = item.geoId.substr(0, 2);
        let stateName = stateObj[stateId];
        return {
            key: item.geoId,
            label: item.name + ', ' + stateName,
        };
    });
    countyRegionData.value = list;
};
const uploadSelect = () => {
    fileInputRef.value.click();
};
const handleUpload = () => {
    const selectedFile = fileInputRef.value.files[0];
    cbsaFileData.value = [];
    regionList.value = [];
    fileName.value = selectedFile.name;
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = e.target.result;
        let wb = XLSX.read(data, { type: 'binary' });
        let jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        jsonData.forEach((item) => {
            let key = String(item['CBSA_ID']);
            let label = item['CBSA_NAME'];
            if (key && label) {
                cbsaFileData.value.push({
                    label,
                    key,
                });
            }
        });
        if (!cbsaFileData.value.length) {
            ElMessageBox.alert('The file is not valid. Please upload it again', {
                confirmButtonText: 'OK',
            });
            fileName.value = '';
        }
        fileInputRef.value.value = null;
    };

    reader.readAsBinaryString(selectedFile);
};
const showSummaryTable = () => {
    if (!checkedList.value.length || !regionList.value.length) {
        let tips = !regionList.value.length ? 'Please select region first!' : !checkedList.value.length ? 'Please check at least one pollutant' : '';
        ElMessageBox.alert(tips, 'Tip', {
            confirmButtonText: 'OK',
        });
        return;
    }
    let regionSelectData = regionData.value.filter((item) => regionList.value.indexOf(item.key) !== -1);
    let typeList = emissionList.value.filter((item) => checkedList.value.indexOf(item.type) !== -1);
    showDialog(SummaryTable, {
        typeList: typeList,
        topX: topXEmissionSources.value,
        regionList: regionSelectData,
        regionType: isUseFile.value ? 'cbsa' : regionType.value,
        emissionYear: emissionYear.value,
        populationYear: populationYear.value,
    });
};
const showSummaryPlot = () => {
    if (!checkedList.value.length || !regionList.value.length) {
        let tips = !regionList.value.length ? 'Please select region first!' : !checkedList.value.length ? 'Please check at least one pollutant' : '';
        ElMessageBox.alert(tips, 'Tip', {
            confirmButtonText: 'OK',
        });
        return;
    }
    let regionSelectData = regionData.value.filter((item) => regionList.value.indexOf(item.key) !== -1);
    let typeList = emissionList.value.filter((item) => checkedList.value.indexOf(item.type) !== -1);
    showDialog(SummaryPlot, {
        typeList: typeList,
        topX: topXEmissionSources.value,
        regionList: regionSelectData,
        regionType: isUseFile.value ? 'cbsa' : regionType.value,
        emissionYear: emissionYear.value,
        // populationYear: populationYear.value,
    });
};
onMounted(async () => {
    let advancedOption = localStorage.getItem('advancedOption');
    if (advancedOption) {
        advancedOption = JSON.parse(advancedOption);
        topXEmissionSources.value = advancedOption.topXEmissionSources || 20;
    }
    OverlayScrollbars(setorEmissionRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
    getAllEpaRegionData();
    getStateRegionData();
    getCbsaRegionData();
    getCountyData();
    cbsaFileData.value = cbsaFileDefaultData.map((item) => {
        item.key = String(item.key);
        return item;
    });
});
</script>
<style lang="scss" scoped>
.setor-emission-content {
    height: 100%;
}
.setor-emission-box {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 5px;
    display: flex;
    flex-direction: column;
    .pollutant-box {
        box-sizing: border-box;
        padding: 5px 15px;
        border: 1px solid #ccc;
        border-radius: 5px;
        position: relative;
        margin-top: 3px;
        .checkbox-all {
            position: absolute;
            top: -17px;
            left: 15px;
            background: #fff;
        }
        .checkbox-content {
            display: flex;
            flex-wrap: wrap;
            .el-checkbox {
                margin-right: 10px;
                :deep(.el-checkbox__label) {
                    font-size: 12px;
                    // height: 24px;
                }
            }
        }
    }
    .sources-box {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 2px 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-top: 5px;
        flex-wrap: wrap;
        .sources-item {
            flex: 1;
            display: flex;
            align-items: center;
            .sites-number {
                margin-left: 5px;
            }
        }
    }
    .region-type-box {
        box-sizing: border-box;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-top: 10px;
        position: relative;
        .title {
            position: absolute;
            top: -10px;
            left: 15px;
            font-size: 14px;
            background: #fff;
            color: #606266;
        }
        .el-radio {
            margin-right: 5px;
        }
    }
    .select-file {
        margin-top: 5px;
        box-sizing: border-box;
        padding: 0 5px;
        .file-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            .file-item-title {
                display: flex;
                font-size: 12px;
                width: 130px;
                :deep(.el-checkbox__label) {
                    color: #000;
                }
            }
            .select-box {
                flex: 1;
                margin-left: 5px;
            }
        }
        .file-item + .file-item {
            margin-top: 5px;
        }
    }
    .filter-box {
        margin-top: 10px;
        box-sizing: border-box;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        position: relative;
        .title {
            position: absolute;
            top: -10px;
            left: 15px;
            font-size: 14px;
            background: #fff;
            color: #606266;
        }
    }
    .configuration-box {
        margin-bottom: 5px;
    }
    .region-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        .collapse-box {
            display: flex;
            align-items: center;
            justify-content: center;
            .icon {
                color: #ccc;
            }
        }
        .transfer-content {
            width: 100%;
            // flex: 1;
            :deep(.transfer-panel) {
                flex: 1;
            }
        }
    }
    .btn-box {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
}
</style>
