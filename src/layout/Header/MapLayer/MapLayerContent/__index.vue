<template>
    <div class="map-layer-box" ref="mapLayerRef">
        <LayerTree ref="metricsTreeRef" v-model="metricsCheckList" :treeData="metricsLayer" node-key="id" :props="metricsProps" @onChange="metricsLayerChange"></LayerTree>
        <LayerTree
            v-model="areaCheckList"
            ref="areaTreeRef"
            :multiple="true"
            colorType="line"
            type="areaLayerList"
            node-key="id"
            :props="treeProps"
            @onChange="areaLayerChange"
        ></LayerTree>
        <LayerTree
            ref="mortalityTreeRef"
            v-model="mortalityCheckList"
            :activeId="activeLayerId"
            type="mortalityList"
            node-key="id"
            :props="treeProps"
            @onChange="mortalityChange"
        ></LayerTree>
        <LayerTree
            ref="morbidityTreeRef"
            v-model="morbidityCheckList"
            :activeId="activeLayerId"
            type="morbidityList"
            node-key="id"
            :props="treeProps"
            @onChange="morbidityChange"
        ></LayerTree>
        <LayerTree
            v-model="concentrationCheckList"
            :activeId="activeLayerId"
            ref="concentrationTreeRef"
            type="concentrationList"
            node-key="id"
            :props="treeProps"
            @onChange="concentrationChange"
        ></LayerTree>
        <LayerTree
            v-model="indicatorsCheckList"
            :activeId="activeLayerId"
            type="indicatorsList"
            ref="indicatorsTreeRef"
            node-key="id"
            :props="treeProps"
            @onChange="indicatorsChange"
        ></LayerTree>
        <LayerTree
            ref="climateTreeRef"
            v-model="climateCheckList"
            :activeId="activeLayerId"
            type="climateList"
            node-key="id"
            :props="treeProps"
            @onChange="climateChange"
        ></LayerTree>
    </div>
</template>
<script setup>
import { getMapLayerData } from '@/api/map-layer.js';
import LayerTree from './LayerTree.vue';
import { mapManager } from '@/libs/map/map-manager.js';
import { OverlayScrollbars } from 'overlayscrollbars';
import { useMyLayerColorStore } from '@/store/my-layer-color';
import { useLegendColorStore } from '@/store/legend-color';
import { useProjectYearStore } from '@/store/project-year';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { useAreaLayerStore } from '@/store/area-layer'; 
import { setCejstGeoIdSet, setCejstlayerStyle } from '@/libs/map/layers/cejst-layer.js';
import { setPm25AreaGeoIdSet, setPm25ArealayerStyle } from '@/libs/map/layers/pm25-area-layer';
import { setOzoneAreaGeoIdSet, setOzoneArealayerStyle } from '@/libs/map/layers/ozone-area-layer';
import { setAdvanceAreaLayerStyle } from '@/libs/map/layers/advance-area-layer';
import { setClassAreasLayerStyle } from '@/libs/map/layers/class-area-layer';
import { setTribalAreaLayerStyle } from '@/libs/map/layers/tribar-area-layer';

import mortalityLayer, { setMortalityGeoIdSet, setMortalitylayerStyle } from '@/libs/map/map-layer/mortality-layer';
import morbidityLayer, { setMorbidityGeoIdSet, setMorbiditylayerStyle } from '@/libs/map/map-layer/morbidity-layer';
import concentrationLayer, { setConcentrationGeoIdSet, setConcentrationlayerStyle } from '@/libs/map/map-layer/concentration-layer';
import indicatorsLayer, { setIndicatorsGeoIdSet, setIndicatorslayerStyle } from '@/libs/map/map-layer/indicators-layer';
import climateLayer, { setClimateGeoIdSet, setClimatelayerStyle } from '@/libs/map/map-layer/climate-layer';

import wildFireHazrdLayer, {
    setWildFireHazrdLayerVisible,
    resetWildFireHazardLayerLegend,
    setWildFireHazrdLayerOpacity,
} from '@/libs/map/layers/climate-risk-layers/wild-fire-hazard-layer';
import droughtLayer, { setDroughtLayerVisible, resetDroughtLayerLegend, setDroughtLayerOpacity } from '@/libs/map/layers/climate-risk-layers/drought-layer';
import coastalFloodHazrdLayer, {
    setCoastalFloodHazrdLayerVisible,
    setCoastalFloodHazrdLayerOpacity,
    resetCoastalFloodHazardLayerLegend,
} from '@/libs/map/layers/climate-risk-layers/coastal-flood-hazard-layer';
import floodPlainLayer, { setFloodPlainLayerVisible, setFloodPlainLayerOpacity } from '@/libs/map/layers/climate-risk-layers/flood-plain-layer';
import seaLevelRiskLayer, {
    setSeaLevelRiskLayerVisible,
    setSeaLevelRiskLayerSource,
    setSeaLevelRiskLayerOpacity,
} from '@/libs/map/layers/climate-risk-layers/sea-level-risk-layer';
import overlayer from '@/libs/map/layers/overlayer';
import cejstJson from '@/libs/cejst-data.js';
import getFileData from '@/libs/read-file';

const myLayerColorStore = useMyLayerColorStore();
const legendColorStore = useLegendColorStore();
const projectYearStore = useProjectYearStore();
const zoomSelectorStore = useZoomSelectorStore();
const areaLayerStore = useAreaLayerStore();
const mapLayerRef = ref();
const advanceAreaCheckbox = ref(false);
const classAreaCheckbox = ref(false);
const tirbalAreaCheckbox = ref(false);
const cejstAreaCheckbox = ref(false);
const pm25AreaCheckbox = ref(false);
const o3AreaCheckbox = ref(false);
const activeMapType = ref();
const cejstGeoIds = ref([]);
const metricsCheckList = ref(['metrics']);
const areaCheckList = ref([]);
const mortalityCheckList = ref([]);
const morbidityCheckList = ref([]);
const concentrationCheckList = ref([]);
const indicatorsCheckList = ref([]);
const climateCheckList = ref([]);
const activeLayerId = ref();

const metricsTreeRef = ref();
const areaTreeRef = ref();
const mortalityTreeRef = ref();
const morbidityTreeRef = ref();
const concentrationTreeRef = ref();
const indicatorsTreeRef = ref();
const climateTreeRef = ref();

const treeProps = ref({
    children: 'children',
    label: 'label',
});
const metricsProps = ref({
    children: 'children',
    label: 'text',
});

const nonAttainmentMapChange = (type) => {
    let flag = type === 'pm25' ? pm25AreaCheckbox.value : o3AreaCheckbox.value;
    areaLayerStore.handleNonAttainmentData(type, flag);
};
const cejstMapChange = () => {
    activeMapType.value = 'cejst';
    if (cejstAreaCheckbox.value) {
        if (!cejstGeoIds.value.length) {
            let setArr = new Set(cejstJson);
            cejstGeoIds.value = [...setArr];
        }
        setCejstGeoIdSet(cejstGeoIds.value);
    } else {
        setCejstGeoIdSet([]);
    }
};
const mapChange = () => {
    setAdvanceAreaLayerStyle(advanceAreaCheckbox.value);
    setClassAreasLayerStyle(classAreaCheckbox.value);
    setTribalAreaLayerStyle(tirbalAreaCheckbox.value);
};
const handleCheckChange = (id, checked) => {
    switch (id) {
        case 'pm25':
            pm25AreaCheckbox.value = checked;
            nonAttainmentMapChange('pm25');
            break;
        case 'o3':
            o3AreaCheckbox.value = checked;
            nonAttainmentMapChange('o3');
            break;
        case 'advance':
            advanceAreaCheckbox.value = checked;
            mapChange();
            break;
        case 'class':
            classAreaCheckbox.value = checked;
            mapChange();
            break;
        case 'tribal':
            tirbalAreaCheckbox.value = checked;
            mapChange();
            break;
        case 'cejst':
            cejstAreaCheckbox.value = checked;
            cejstMapChange();
            break;
    }
};

const metricsLayer = ref([
    {
        id: 'metrics',
        text: 'Nexus Metrics',
        isCheck: true,
        children: legendColorStore.labelList,
    },
]);
watch(
    () => legendColorStore.labelList,
    (val) => {
        metricsLayer.value = [
            {
                id: 'metrics',
                text: 'Nexus Metrics',
                isCheck: true,
                children: legendColorStore.labelList,
            },
        ];
    },
    { deep: true }
);
watch(
    () => myLayerColorStore.isResetLayer,
    (val) => {
        if (val) {
            initMapLayer();
            myLayerColorStore.isResetLayer = false;
        }
    },
    { deep: true }
);
const resetMap = () => {
    metricsTreeRef.value.resetTree(['metrics']);
    areaTreeRef.value.resetTree();
    mortalityTreeRef.value.resetTree();
    morbidityTreeRef.value.resetTree();
    concentrationTreeRef.value.resetTree();
    indicatorsTreeRef.value.resetTree();
    climateTreeRef.value.resetTree();
    activeLayerId.value = '';
};
const metricsLayerChange = (val, id) => {
    myLayerColorStore.metricsCheckList = metricsCheckList.value;
    if (metricsCheckList.value.length) {
        overlayer.setVisible(true);
    } else {
        overlayer.setVisible(false);
    }
};
const areaLayerChange = (val, id) => {
    myLayerColorStore.areaCheckList = areaCheckList.value;
    if (id) {
        let check = val.indexOf(id) !== -1;
        handleCheckChange(id, check);
    } else {
        if (!val.length) return;
        let idList = ['pm25', 'o3', 'advance', 'class', 'tribal', 'cejst'];
        idList.forEach((item) => {
            let check = val.indexOf(item) !== -1;
            handleCheckChange(item, check);
        });
    }
};
const mortalityChange = async (val, id) => {
    myLayerColorStore.mortalityCheckList = mortalityCheckList.value;
    const mapIns = mapManager.getMapIns();
    mapIns.removeLayer(mortalityLayer);
    if (mortalityCheckList.value.length) {
        mapIns.addLayer(mortalityLayer);
        let key = mortalityCheckList.value[0];
        activeLayerId.value = key;
        let idEum = {
            mortality_PM25_Max_PercentRank: 'Mortality_PM25',
            mortality_PM25_Max_Value: 'Mortality_PM25',
            mortality_O3_Max_PercentRank: 'Mortality_O3',
            mortality_O3_Max_Value: 'Mortality_O3',
            air_risk_PercentRank: 'CancerRisk',
            air_risk_value: 'CancerRisk',
            Gas_VOC_HAPs_PercentRank: 'Gas_VOC_HAPs',
            Heavy_Metal_HAPs_PercentRank: 'Heavy_Metal_HAPs',
            Gas_VOC_HAPs_value: 'Gas_VOC_HAPs',
            Heavy_Metal_HAPs_value: 'Heavy_Metal_HAPs',
        };
        let params = {
            pollutantType: idEum[key],
            dataType: key.includes('PercentRank') ? 'PercentRank' : 'value',
            year: projectYearStore.projectYear,
        };
        let keyList = ['air_risk_value', 'air_risk_PercentRank', 'Gas_VOC_HAPs_PercentRank', 'Heavy_Metal_HAPs_PercentRank', 'Gas_VOC_HAPs_value', 'Heavy_Metal_HAPs_value'];
        if (keyList.indexOf(key) !== -1) {
            params.year = 2018;
        }
        let result = await getMapLayerData(params);
        setMortalityGeoIdSet(result, key);
    } else {
        setMortalityGeoIdSet({}, '');
    }
};
const morbidityChange = async () => {
    myLayerColorStore.morbidityCheckList = morbidityCheckList.value;
    const mapIns = mapManager.getMapIns();
    mapIns.removeLayer(morbidityLayer);
    if (morbidityCheckList.value.length) {
        mapIns.addLayer(morbidityLayer);
        let key = morbidityCheckList.value[0];
        activeLayerId.value = key;
        let idEum = {
            morbidity_ERVR_PM25_Max_PercentRank: 'Morbidity_ERVR_PM25',
            morbidity_ERVR_O3_Max_PercentRank: 'Morbidity_ERVR_O3',
            morbidity_HAD_PM25_Max_PercentRank: 'Morbidity_HAD_PM25',
            morbidity_HAD_O3_Max_PercentRank: 'Morbidity_HAD_O3',
            morbidity_SLD_O3_Max_PercentRank: 'Morbidity_SLD_O3',
            morbidity_WLD_PM25_Max_PercentRank: 'Morbidity_WLD_PM25',
            morbidity_ERVR_PM25_Max_Value: 'Morbidity_ERVR_PM25',
            morbidity_ERVR_O3_Max_Value: 'Morbidity_ERVR_O3',
            morbidity_HAD_PM25_Max_Value: 'Morbidity_HAD_PM25',
            morbidity_HAD_O3_Max_Value: 'Morbidity_HAD_O3',
            morbidity_SLD_O3_Max_Value: 'Morbidity_SLD_O3',
            morbidity_WLD_PM25_Max_Value: 'Morbidity_WLD_PM25',
        };
        let params = {
            pollutantType: idEum[key],
            dataType: key.includes('PercentRank') ? 'PercentRank' : 'value',
            year: projectYearStore.projectYear,
        };
        let result = await getMapLayerData(params);
        setMorbidityGeoIdSet(result, key);
    } else {
        setMorbidityGeoIdSet({}, '');
    }
};
const concentrationChange = async () => {
    myLayerColorStore.concentrationCheckList = concentrationCheckList.value;
    const mapIns = mapManager.getMapIns();
    mapIns.removeLayer(concentrationLayer);
    if (concentrationCheckList.value.length) {
        mapIns.addLayer(concentrationLayer);
        let key = concentrationCheckList.value[0];
        activeLayerId.value = key;
        if (key === 'Top_day_O3') {
            let obj = {};
            let arr = [];
            if (myLayerColorStore.topDayO3Data) {
                obj = myLayerColorStore.topDayO3Data;
            } else {
                let filePath = '/mapLayer/EJscreen.ozone_2010.csv';
                let result = await getFileData(filePath);
                let list = result.data.list || [];
                list.forEach((item) => {
                    let id = item['FIPs'];
                    if (id) {
                        if (id.length < 11) {
                            id = '0' + id;
                        }
                        let value = item['O3Top10Mean'];
                        obj[id] = value;
                    }
                });
                myLayerColorStore.topDayO3Data = obj;
            }
            setConcentrationGeoIdSet(obj, key);
        } else {
            let idEum = {
                fused_PM25: 'Fused_PM25',
                fused_O3: 'FUsed_O3',
                satellite_NO2: 'SatelliteData_NO2',
            };
            let params = {
                pollutantType: idEum[key],
                dataType: 'value',
                year: key === 'satellite_NO2' ? 2019 : projectYearStore.projectYear,
            };
            let result = await getMapLayerData(params);
            setConcentrationGeoIdSet(result, key);
        }
    } else {
        setConcentrationGeoIdSet({}, '');
    }
};
const indicatorsChange = async () => {
    myLayerColorStore.indicatorsCheckList = indicatorsCheckList.value;
    const mapIns = mapManager.getMapIns();
    mapIns.removeLayer(indicatorsLayer);
    if (indicatorsCheckList.value.length) {
        mapIns.addLayer(indicatorsLayer);
        let key = indicatorsCheckList.value[0];
        activeLayerId.value = key;
        let idEum = {
            demographicIndex_Value: 'DemographicIndex',
            lowIncome_PCT_Value: 'LowIncome_PCT',
            peopleOfColor_PCT_Value: 'PeopleOfColor_PCT',
            population_LESSHS: 'LESSHS_PCT',
            population_LINGISO: 'LINGISO_PCT',
            population_Under5: 'Under5_PCT',
            population_Over64: 'Over64_PCT',
        };
        let params = {
            pollutantType: idEum[key],
            dataType: 'percentRank',
            year: 2021,
        };
        let result = await getMapLayerData(params);
        setIndicatorsGeoIdSet(result, key);
    } else {
        setIndicatorsGeoIdSet({}, '');
    }
};
const climateRiskIndicatorChange = (list, id) => {
    let seaIdList = ['seaLevel1', 'seaLevel2', 'seaLevel3', 'seaLevel4', 'seaLevel5', 'seaLevel6'];
    setWildFireHazrdLayerVisible(list.indexOf('wildFireHazard') !== -1);
    setDroughtLayerVisible(list.indexOf('drought') !== -1);
    setCoastalFloodHazrdLayerVisible(list.indexOf('coastal') !== -1);
    setFloodPlainLayerVisible(list.indexOf('floodPlain') !== -1);
    if (seaIdList.indexOf(id) !== -1) {
        if (list.indexOf(id) !== -1) {
            let obj = {
                seaLevel1: '1ft',
                seaLevel2: '2ft',
                seaLevel3: '3ft',
                seaLevel4: '4ft',
                seaLevel5: '5ft',
                seaLevel6: '6ft',
            };
            let type = obj[id];
            setSeaLevelRiskLayerSource(type, id);
        }
        setSeaLevelRiskLayerVisible(list.indexOf(id) !== -1);
    } else {
        setSeaLevelRiskLayerVisible(false);
    }
};
const climateChange = async (val, id) => {
    myLayerColorStore.climateCheckList = climateCheckList.value;
    let indicatorsList = ['wildFireHazard', 'drought', 'coastal', 'floodPlain', 'seaLevel1', 'seaLevel2', 'seaLevel3', 'seaLevel4', 'seaLevel5', 'seaLevel6'];
    const mapIns = mapManager.getMapIns();
    mapIns.removeLayer(climateLayer);

    climateRiskIndicatorChange(val, id);

    if (climateCheckList.value.length && indicatorsList.indexOf(id) == -1) {
        mapIns.addLayer(climateLayer);
        let key = climateCheckList.value[0];
        activeLayerId.value = key;
        let idEum = {
            heatIndexPresent_PercentRank: 'HeatIndexPresent',
            heatIndex2050_PercentRank: 'HeatIndex2050',
            heatIndex2100_PercentRank: 'HeatIndex2100',
            heatIndexPresent_Value: 'HeatIndexPresent',
            heatIndex2050_Value: 'HeatIndex2050',
            heatIndex2100_Value: 'HeatIndex2100',
        };
        let params = {
            pollutantType: idEum[key],
            dataType: key.includes('PercentRank') ? 'PercentRank' : 'value',
            year: projectYearStore.projectYear,
        };
        let result = await getMapLayerData(params);
        setClimateGeoIdSet(result, key);
    } else {
        setClimateGeoIdSet({}, '');
    }
};

watch(
    () => zoomSelectorStore.model,
    () => {
        if (cejstAreaCheckbox.value) {
            setCejstlayerStyle();
        }
        if (pm25AreaCheckbox.value) {
            setPm25ArealayerStyle();
        }
        if (o3AreaCheckbox.value) {
            setOzoneArealayerStyle();
        }

        if (mortalityCheckList.value.length) {
            setMortalitylayerStyle();
        }
        if (morbidityCheckList.value.length) {
            setMorbiditylayerStyle();
        }
        if (concentrationCheckList.value.length) {
            setConcentrationlayerStyle();
        }
        if (indicatorsCheckList.value.length) {
            setIndicatorslayerStyle();
        }
        if (climateCheckList.value.length) {
            setClimatelayerStyle();
        }
    }
);
watch(
    () => projectYearStore.pm25DvYear,
    () => {
        if (pm25AreaCheckbox.value) {
            nonAttainmentMapChange('pm25');
        }
    }
);
watch(
    () => projectYearStore.o3DvYear,
    () => {
        if (o3AreaCheckbox.value) {
            nonAttainmentMapChange('o3');
        }
    }
);
watch(
    () => projectYearStore.projectYear,
    () => {
        if (mortalityCheckList.value.length) {
            mortalityChange();
        }
        if (morbidityCheckList.value.length) {
            morbidityChange();
        }
        if (concentrationCheckList.value.length) {
            concentrationChange();
        }
        if (climateCheckList.value.length) {
            climateChange();
        }
    }
);
watch(
    () => myLayerColorStore.mortalityList,
    (val) => {
        if (mortalityCheckList.value.length) {
            setMortalitylayerStyle();
        }
    },
    { deep: true }
);
watch(
    () => myLayerColorStore.morbidityList,
    (val) => {
        if (morbidityCheckList.value.length) {
            setMorbiditylayerStyle();
        }
    },
    { deep: true }
);
watch(
    () => myLayerColorStore.concentrationList,
    (val) => {
        if (concentrationCheckList.value.length) {
            setConcentrationlayerStyle();
        }
    },
    { deep: true }
);
watch(
    () => myLayerColorStore.indicatorsList,
    (val) => {
        if (indicatorsCheckList.value.length) {
            setIndicatorslayerStyle();
        }
    },
    { deep: true }
);
watch(
    () => myLayerColorStore.climateList,
    (val) => {
        if (climateCheckList.value.length) {
            let indicatorsList = ['wildFireHazard', 'drought', 'coastal', 'floodPlain'];
            let seaLevelList = ['seaLevel1', 'seaLevel2', 'seaLevel3', 'seaLevel4', 'seaLevel5', 'seaLevel6'];
            let id = climateCheckList.value[0];

            if (indicatorsList.indexOf(id) !== -1 || seaLevelList.indexOf !== -1) {
                if (seaLevelList.indexOf(id) !== -1) {
                    setSeaLevelRiskLayerOpacity();
                } else {
                    switch (id) {
                        case 'wildFireHazard':
                            setWildFireHazrdLayerOpacity();
                            break;
                        case 'drought':
                            setDroughtLayerOpacity();
                            break;
                        case 'coastal':
                            setCoastalFloodHazrdLayerOpacity();
                            break;
                        case 'floodPlain':
                            setFloodPlainLayerOpacity();
                            break;
                    }
                }
            } else {
                setClimatelayerStyle();
            }
        }
    },
    { deep: true }
);
watch(
    () => myLayerColorStore.areaLayerList,
    (val) => {
        mapChange();
        if (cejstAreaCheckbox.value) {
            setCejstlayerStyle();
        }
        if (pm25AreaCheckbox.value) {
            setPm25ArealayerStyle();
        }
        if (o3AreaCheckbox.value) {
            setOzoneArealayerStyle();
        }
    },
    { deep: true }
);
watch(
    () => myLayerColorStore.climateRiskIndicatorId,
    (val) => {
        const mapIns = mapManager.getMapIns();
        mapIns.removeLayer(climateLayer);
        if (val) {
            climateCheckList.value = [val];
        } else {
            climateCheckList.value = [];
        }
        climateRiskIndicatorChange(climateCheckList.value, val);
    },
    { deep: true }
);
const initMapLayer = () => {
    let metricsCheckList = myLayerColorStore.metricsCheckList.concat([]);
    let areaCheckList = myLayerColorStore.areaCheckList.concat([]);
    let mortalityCheckList = myLayerColorStore.mortalityCheckList.concat([]);
    let morbidityCheckList = myLayerColorStore.morbidityCheckList.concat([]);
    let concentrationCheckList = myLayerColorStore.concentrationCheckList.concat([]);
    let indicatorsCheckList = myLayerColorStore.indicatorsCheckList.concat([]);
    let climateCheckList = myLayerColorStore.climateCheckList.concat([]);
    resetMap();
    metricsTreeRef.value.resetTree(metricsCheckList);
    areaTreeRef.value.resetTree(areaCheckList);
    mortalityTreeRef.value.resetTree(mortalityCheckList);
    morbidityTreeRef.value.resetTree(morbidityCheckList);
    concentrationTreeRef.value.resetTree(concentrationCheckList);
    indicatorsTreeRef.value.resetTree(indicatorsCheckList);
    climateTreeRef.value.resetTree(climateCheckList);
};
onMounted(async () => {
    await nextTick();
    resetWildFireHazardLayerLegend();
    resetDroughtLayerLegend();
    resetCoastalFloodHazardLayerLegend();
    OverlayScrollbars(mapLayerRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
    initMapLayer();
});
defineExpose({
    resetMap,
});
</script>
<style scoped lang="scss">
.map-layer-box {
    flex: 1;
    width: 100%;
    max-height: calc(100vh - 18.4375rem);
    box-sizing: border-box;
    padding: 0.3125rem;
}
</style>
