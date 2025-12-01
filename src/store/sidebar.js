import { defineStore } from 'pinia';
import { useProjectYearStore } from './project-year';
import { useAdvancedOptionStore } from './advanced-option';
import { useDataScaleStore } from '@/store/data-scale';

import { getDetail } from '@/api/detail';
import { detailOptions } from '@/libs/detail-options.js';
import { getCancerRiskRecordById } from '@/api/cancer-risk';
import censusTractTopBlockData from '@/libs/block/CancerRisk/censusTractData.js';
import countyTopBlockData from '@/libs/block/CancerRisk/countyData.js';
import hazardIndexCountyData from '@/libs/block/HazardIndex/countyData.js';
import hazardIndexCensusTractData from '@/libs/block/HazardIndex/censusTractData.js';
import { format, roundTo } from '@/libs/utils';
export const useSidebarStore = defineStore('sidebar', {
    state: () => {
        return {
            collapse: false,
            ejSelect: false,
            heatIndexSelect: false,
            /*
             * 展示数据的类型
             * info: 信息
             * monitirSite: 监测站点
             * majorSelectData: 重点监测站点
             */
            infoType: 'info',
            // 信息数据
            infoData: null,
            // 判断是否恢复默认设置
            isSetDefault: false,
            activeGeoId: null,
            activeTabName: 'home',
        };
    },
    actions: {
        handleCollapse() {
            this.collapse = !this.collapse;
        },
        handleSetDefault() {
            this.isSetDefault = !this.isSetDefault;
        },
        async handleInfoData() {
            let geoId = this.activeGeoId;
            if (!geoId) {
                this.infoData = [];
                return true;
            }
            const projectYearStore = useProjectYearStore();
            const advancedOption = useAdvancedOptionStore();
            const dataScaleStore = useDataScaleStore();
            const [json, cancerDetail] = await Promise.all([getDetail(projectYearStore.projectYear, geoId, projectYearStore.ejYear), getCancerRiskRecordById(2020, geoId)]);
            if (!json || json.length === 0) {
                this.infoData = [];
                return true;
            }
            let cancerRiskBlockId = null;
            let hazardIndexBlockId = null;

            if (geoId.length === 5) {
                cancerRiskBlockId = countyTopBlockData[geoId] ? countyTopBlockData[geoId] : null;
                hazardIndexBlockId = hazardIndexCountyData[geoId] ? hazardIndexCountyData[geoId] : null;
            } else if (geoId.length === 11) {
                cancerRiskBlockId = censusTractTopBlockData[geoId] ? censusTractTopBlockData[geoId] : null;
                hazardIndexBlockId = hazardIndexCensusTractData[geoId] ? hazardIndexCensusTractData[geoId] : null;
            }
            const obj = json;
            let objKeys = Object.keys(obj);
            let array = [
                {
                    type: 'Geographic boundaries',
                    value: '',
                    key: 'geographicBoundaries',
                    childrenID: ['epaRegionId', 'stateAbbrName', 'countyName', 'cbsaGeoId', 'cbsaName', 'advanceAreasType', 'tribeName'],
                    children: [],
                },
                {
                    type: 'AQ Ambient',
                    value: '',
                    key: 'aqAmbient',
                    // childrenID: ['annual_PM25_DV', 'daily_PM25_DV', 'o3_DV', 'fused_PM25', 'fused_O3', 'satellite_NO2'],
                    childrenID: ['annual_PM25_DV', 'daily_PM25_DV', 'o3_DV', 'fused_PM25', 'fused_O3'],
                    children: [],
                },
                {
                    type: 'PM2.5 & O3 Mortality',
                    value: '',
                    key: 'mortality',
                    childrenID: [
                        'mortality_PM25_Max_Value',
                        'mortality_PM25_Max_PercentRank',
                        'mortality_PM25_Num_Value',
                        'mortality_PM25_Num_PercentRank',
                        'mortality_O3_Max_Value',
                        'mortality_O3_Max_PercentRank',
                        'mortality_O3_Num_Value',
                        'mortality_O3_Num_PercentRank',
                    ],
                    children: [],
                },
                {
                    type: 'PM2.5 & O3 Morbidity',
                    value: '',
                    key: 'morbidity',
                    childrenID: [
                        'morbidity_ERVR_PM25_Max_Value',
                        'morbidity_ERVR_PM25_Max_PercentRank',
                        'morbidity_ERVR_PM25_Num_Value',
                        'morbidity_ERVR_PM25_Num_PercentRank',
                        'morbidity_ERVR_O3_Max_Value',
                        'morbidity_ERVR_O3_Max_PercentRank',
                        'morbidity_ERVR_O3_Num_Value',
                        'morbidity_ERVR_O3_Num_PercentRank',
                        'morbidity_HAD_PM25_Max_Value',
                        'morbidity_HAD_PM25_Max_PercentRank',
                        'morbidity_HAD_PM25_Num_Value',
                        'morbidity_HAD_PM25_Num_PercentRank',
                        'morbidity_HAD_O3_Max_Value',
                        'morbidity_HAD_O3_Max_PercentRank',
                        'morbidity_HAD_O3_Num_Value',
                        'morbidity_HAD_O3_Num_PercentRank',
                        'morbidity_SLD_O3_Max_Value',
                        'morbidity_SLD_O3_Max_PercentRank',
                        'morbidity_SLD_O3_Num_Value',
                        'morbidity_SLD_O3_Num_PercentRank',
                        'morbidity_WLD_PM25_Max_Value',
                        'morbidity_WLD_PM25_Max_PercentRank',
                        'morbidity_WLD_PM25_Num_Value',
                        'morbidity_WLD_PM25_Num_PercentRank',
                        'morbidity_AsthmaSymptoms_Max_Value',
                        'morbidity_AsthmaSymptoms_Max_PercentRank',
                        'morbidity_AsthmaSymptoms_Num_Value',
                        'morbidity_AsthmaSymptoms_Num_PercentRank',
                    ],
                    children: [],
                },
                {
                    type: 'Air Toxics Risk',
                    value: '',
                    key: 'airToxicsRisk',
                    // childrenID: ['cancerRisk_Max_Value', 'cancerRisk_Max_PercentRank', 'hazardIndex_Max_Value', 'hazardIndex_Max_PercentRank'],
                    childrenID: ['cancerRisk_Max_Value', 'hazardIndex_Max_Value'],
                    children: [],
                },
                {
                    // type: 'Demographics',
                    type: 'Age Demographics',
                    value: '',
                    key: 'demographics',
                    // childrenID: ['under5_PCT', 'over62_PCT'],
                    childrenID: ['acs_Under5_PCT', 'acs_Over62_PCT'],
                    children: [],
                },

            ];
            const formatValue = (key, value) => {
                if (key.includes('PercentRank') || key === 'demographicIndex_Value') {
                    return format(value * 100) + '%';
                } else if (key === 'epaRegionId' && value) {
                    return 'EPA Region ' + format(value);
                } else if (['cancerRisk_Max_Value', 'hazardIndex_Max_Value'].includes(key)) {
                    if (key == 'cancerRisk_Max_Value') {
                        let val = cancerDetail ? cancerDetail['total_Value'] : null;
                        return val ? roundTo(val) : null;
                    }
                    return roundTo(value);
                } else if (key.endsWith('_PCT')) {
                    return format(value) + '%';
                } else {
                    return format(value);
                }
            };
            if (dataScaleStore.dataScale == 1) {
                let keyArr = ['mortality', 'morbidity'];
                array = array.filter((arr) => !keyArr.includes(arr.key));
            }
            array.forEach((arr) => {
                let childrenID = arr.childrenID;
                if (!advancedOption.advancedMode) {
                    childrenID = childrenID.filter((key) => !key.includes('PercentRank'));
                }
                if (arr.type == 'Air Toxics Risk' && (geoId.length === 11 || geoId.length === 5)) {
                    childrenID = childrenID.concat(['cancerRisk_block_id', 'hazardIndex_block_id']);
                }
                childrenID.forEach((key) => {
                    const isBlockId = key === 'cancerRisk_block_id';
                    const isHazBlockId = key === 'hazardIndex_block_id';
                    let value = isBlockId ? cancerRiskBlockId : isHazBlockId ? hazardIndexBlockId : obj[key];
                    let type = detailOptions[key];


                    if (isBlockId || isHazBlockId || objKeys.includes(key)) {
                        const formattedValue = isBlockId || isHazBlockId ? value : formatValue(key, value);
                        const typeWithYear = type;
                        arr.children.push({ type: typeWithYear, value: formattedValue });
                    }
                });
            });
            const id = geoId.length === 5 ? obj['countyGeoId'] : obj['geoId'];
            array[0].children.unshift({ type: 'FIPS', value: id });
            this.infoType = 'info';
            this.infoData = array;
        },
    },
});
