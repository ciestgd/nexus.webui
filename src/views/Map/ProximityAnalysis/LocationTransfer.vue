<template>
    <div class="proximity-transfer-content location-content">
        <el-radio-group v-model="locationRadio" @change="handleLocationRadioChange">
            <el-radio :value="1">Census tracts <span class="radio-tips">(Click locations on map to add census tracts)</span></el-radio>
            <div v-if="locationRadio == 1">
                <div class="transfer-content">
                    <MyTransfer :titles="['Census tracts', 'Selected']" filterable v-model="censusTractsList" :data="locationsList" />
                </div>
            </div>
            <el-radio :value="2">Latitude/Longitude <span class="radio-tips">(Separate each location by semicolon)</span></el-radio>
            <div class="location-point" v-if="locationRadio == 2">
                <el-input v-model="locationValue" placeholder="Please input" />
            </div>
            <el-radio :label="3">Select one or more sites on map <span class="radio-tips">(Press "Shift" and select one or more sites on map)</span></el-radio>
            <div v-if="locationRadio == 3">
                <div class="transfer-content">
                    <MyTransfer :props="{ key: 'id' }" :titles="['Sites', 'Selected']" filterable v-model="mutiSelectValue" :data="mutiSelectList">
                        <template #default="{ option }">
                            <span @mouseover="(event) => handleMutiSelectHover(option, event)" style="color: #000">{{ option.label }}</span>
                        </template>
                    </MyTransfer>
                </div>
            </div>
            <el-radio :value="4"
                >Select a group of census tracts by shape <span class="radio-tips">(Select a geometry type, e.g., Box, click and drag a Box on map)</span></el-radio
            >
            <div v-if="locationRadio == 4">
                <div class="draw-content">
                    Geometry type:
                    <el-select v-model="drawTypeValue" class="drawTypeSelect" placeholder="Select" @change="handleDraw">
                        <el-option v-for="item in drawTypeList" :key="item" :label="item" :value="item" />
                    </el-select>
                    <el-button @click="handleClearDraw">Clear Draw</el-button>
                </div>
                <div class="transfer-content">
                    <MyTransfer :titles="['Census tracts', 'Selected']" filterable v-model="drawGeoIdSelectedList" :data="drawGeoIdList" />
                </div>
            </div>
        </el-radio-group>
    </div>
</template>
<script setup>
import { fromLonLat } from 'ol/proj';
import overlayer from '@/libs/map/layers/overlayer';
import { useProximityAnalysisStore } from '@/store/proximity-analysis';
import { useDataScaleStore } from '@/store/data-scale';
import censusTractAllData from '@/libs/census-tract-all-data';
const proximityAnalysisStore = useProximityAnalysisStore();
import { ElMessageBox } from 'element-plus';
let { addInteraction, removeInteraction, clearInteractionLayer, getInteractionList, abortDrawing } = proximityAnalysisStore.layer;
const props = defineProps();
const emit = defineEmits(['handleHover']);
const dataScaleStore = useDataScaleStore();
const locationRadio = ref(1);
const locationValue = ref('30.01,-90.61; 30.26,-90.95; 30.51,-91.23');
const locationsList = ref([]);
const mutiSelectList = ref([]);
const mutiSelectValue = ref([]);
const censusTractsList = ref([]);
const drawTypeList = ref(['Square', 'Box', 'Polygon', 'Circle']);
const drawTypeValue = ref('Circle');
const drawGeoIdList = ref([]);
const drawGeoIdSelectedList = ref([]);
watch(
    () => proximityAnalysisStore.selectedGeoId,
    (val) => {
        if (val && val.length === 11) {
            let arr = locationsList.value.map((item) => item.value);
            let list = new Set(arr);
            list.add(val);
            locationsList.value = [...list].map((item) => ({ key: item, value: item }));
        }
    },
    {
        deep: true,
    }
);
// 监听draw是否完成
watch(
    () => proximityAnalysisStore.isDrawing,
    (val) => {
        if (!val) {
            let list = getGeoIdsByInteraction();
            drawGeoIdList.value = [...list].map((item) => ({ key: item, value: item }));
        }
    }
);
// 监听是否取消draw
watch(
    () => proximityAnalysisStore.isEsc,
    (val) => {
        if (val) {
            if (proximityAnalysisStore.isDrawing) {
                abortDrawing();
            }
        }
    }
);
watch(
    () => proximityAnalysisStore.isClearDraw,
    (val) => {
        if (val) {
            handleClearDraw();
            proximityAnalysisStore.isClearDraw = false;
        }
    }
);

const handleMutiSelectHover = (option, event) => {
    let data = `${option.label}`;
    emit('handleHover', data, event.currentTarget);
};
const handleLocationRadioChange = () => {
    clearInteractionLayer();
    if (locationRadio.value == 4) {
        handleDraw();
    }
};
const handleClearDraw = () => {
    clearInteractionLayer();
    drawTypeValue.value = 'Circle';
    drawGeoIdList.value = [];
    drawGeoIdSelectedList.value = [];
    handleDraw();
};
const getGeoIdsByInteraction = () => {
    let options = getInteractionList();
    if (dataScaleStore.dataScale === 0) {
        ElMessageBox.alert(`Please make sure the data scale is census tract!`, 'Tip', {
            confirmButtonText: 'OK',
        });
        clearInteractionLayer();
        return [];
    }
    let geoIdsList = new Set();
    let vectorTileSource = overlayer.getSource();
    options.forEach((feature) => {
        var geometry = feature.getGeometry();
        let list = vectorTileSource.getFeaturesInExtent(geometry.getExtent());
        list.forEach(async (item) => {
            let id = item.getId();
            if (id) {
                let center = censusTractAllData[id].center;
                var isInside = geometry.intersectsCoordinate(center);
                if (isInside) {
                    geoIdsList.add(id);
                }
            }
        });
    });
    return [...geoIdsList];
};
const handleDraw = () => {
    removeInteraction();
    addInteraction(drawTypeValue.value);
};
const getCensusTractData = async (list) => {
    let result = list.map((item) => {
        let detail = censusTractAllData[item];
        return detail;
    });
    result.forEach((item) => {
        item.lng = item.centerLon;
        item.lat = item.centerLat;
        item.name = item.geoId;
        item.id = item.geoId;
        item.center = [item.lng, item.lat];
    });

    return result;
};
const getSites = async () => {
    let data = [];
    if (locationRadio.value == 1) {
        let censusTractData = await getCensusTractData(censusTractsList.value);
        data = data.concat(censusTractData);
    } else if (locationRadio.value == 2) {
        if (locationValue.value.trim()) {
            let locationList = [];
            let arr = locationValue.value.split(';');
            arr.forEach((local) => {
                let item = local.replace(' ', '');
                let itemArr = item.split(',');
                let obj = {
                    id: item,
                    name: item,
                    lat: Number(itemArr[0]),
                    lng: Number(itemArr[1]),
                };
                obj.center = fromLonLat([obj.lng, obj.lat]);
                locationList.push(obj);
            });
            data = data.concat(locationList);
        }
    } else if (locationRadio.value === 3) {
        let mutiSelectData = mutiSelectList.value.filter((item) => mutiSelectValue.value.indexOf(item.id) !== -1);
        data = data.concat(mutiSelectData);
    } else if (locationRadio.value == 4) {
        let list = drawGeoIdSelectedList.value;
        let censusTractData = await getCensusTractData(list);
        data = data.concat(censusTractData);
    }
    return data;
};
const clearData = () => {
    clearInteractionLayer();
    censusTractsList.value = [];
    mutiSelectValue.value = [];
    drawTypeValue.value = 'Circle';
    drawGeoIdList.value = [];
    drawGeoIdSelectedList.value = [];
};
const setCensusTractList = (geoIds) => {
    locationRadio.value = 1;
    let arr = locationsList.value.map((item) => item.value);
    let list = new Set(arr);
    let valArr = new Set(censusTractsList.value);
    geoIds.forEach((value) => {
        list.add(value);
        valArr.add(value);
    });
    locationsList.value = [...list].map((item) => ({ key: item, value: item }));
    censusTractsList.value = [...valArr];
};
const setMultiSelect = (monitorSites, facilities, setValue = true) => {
    locationRadio.value = 3;
    let monitorList = monitorSites.map((item) => {
        item.label = item.value + ' ' + item.siteName;
        return item;
    });
    console.log('facilityList', facilities);
    let facilityList = facilities
        .map((item) => {
            if (!item) return null;
            // let { sectorProjectGroup, siteName } = item;
            item.label = item.sectorProjectGroup + ':' + item.siteName;
            return item;
        })
        .filter((item) => item);
    let list = monitorList.concat(facilityList);
    let idList = mutiSelectList.value.map((item) => item.id);
    let isNeetlist = list.filter((item) => idList.indexOf(item.id) === -1);
    mutiSelectList.value = mutiSelectList.value.concat(isNeetlist);

    if (setValue) {
        let mutiList = new Set(mutiSelectValue.value.concat(list.map((item) => item.id)));
        mutiSelectValue.value = [...mutiList];
    }
};
const resetData = () => {
    locationValue.value = '30.01,-90.61; 30.26,-90.95; 30.51,-91.23';
    mutiSelectList.value = [];
    locationsList.value = [];
};
const getLocationRadio = () => {
    return locationRadio.value;
};
defineExpose({
    resetData,
    getSites,
    clearData,
    setCensusTractList,
    setMultiSelect,
    getLocationRadio,
    handleDraw,
});
</script>
<style scoped lang="scss">
.location-content {
    box-sizing: border-box;
    padding-left: 10px;
    .location-point {
        box-sizing: border-box;
        padding: 0 10px;
        width: 100%;
        :deep(.el-input__wrapper) {
            height: 24px;
        }
    }
}
.el-radio-group {
    width: 100%;
    .el-radio {
        width: 100%;
        margin-right: 0px;
        height: 24px;
        :deep(.el-radio__label) {
            font-size: 16px;
            color: #000;
            font-weight: bold;
            .radio-tips {
                color: green;
                font-size: 12px;
            }
        }
    }
}
.draw-content {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #000;
    box-sizing: border-box;
    padding-left: 5px;
    .drawTypeSelect {
        margin: 0 5px;
        width: 100px;
    }
}
</style>
