import { defineStore } from 'pinia';
import cancerRiskLayer, { setCancerRiskGeoIdSet, setCancerRiskLayerStyle } from '@/libs/map/map-layer/cancer-risk-layer';
import { mapManager } from '@/libs/map/map-manager.js';
import { getMapLayerData } from '@/api/map-layer.js';
import { useProjectYearStore } from '@/store/project-year.js';
// import data from '@/libs/cejst-data';
export const useCancerRiskLayerStore = defineStore('cancerRIskLayer', {
    state: () => {
        return {
            layerList: [
                {
                    id: 'motality',
                    label: 'Air Toxics Cancer Risk',
                    children: [
                        {
                            id: 'air_risk_value',
                            label: 'Air Toxics Cancer Risk (value)',
                            min: 6,
                            max: 100,
                            opacityValue: 60,
                            type: 'value',
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_104',
                                    label: '> 100',
                                    min: 100,
                                    max: null,
                                    color: '#033a5799',
                                },
                                {
                                    id: 'value_89',
                                    label: '75 - 100',
                                    min: 75,
                                    max: 100,
                                    color: '#48799d99',
                                },
                                {
                                    id: 'value_74',
                                    label: '50 - 75',
                                    min: 50,
                                    max: 75,
                                    color: '#4d96ce99',
                                },
                                {
                                    id: 'value_59',
                                    label: '25 - 50',
                                    min: 25,
                                    max: 50,
                                    color: '#74bbed99',
                                },
                                {
                                    id: 'value_44',
                                    label: '6 - 25',
                                    min: 6,
                                    max: 25,
                                    color: '#bce6f999',
                                },
                                {
                                    id: 'value_29',
                                    label: 'Outline',
                                    min: null,
                                    max: 6,
                                    color: '#6e6e6e99',
                                },
                            ],
                        },
                        {
                            id: 'Gas_VOC_HAPs_value',
                            label: 'GAS & VOC HAPs (value)',
                            min: -0.1,
                            max: 104.3,
                            opacityValue: 75,
                            type: 'value',
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_104',
                                    label: '89.3 - 104.3',
                                    min: 89.3,
                                    max: 104.3,
                                    color: '#546189',
                                },
                                {
                                    id: 'value_89',
                                    label: '74.4 - 89.3',
                                    min: 74.4,
                                    max: 89.3,
                                    color: '#5874A7',
                                },
                                {
                                    id: 'value_74',
                                    label: '59.5 - 74.4',
                                    min: 59.5,
                                    max: 74.4,
                                    color: '#638FC5',
                                },
                                {
                                    id: 'value_59',
                                    label: '44.6 - 59.5',
                                    min: 44.6,
                                    max: 59.5,
                                    color: '#79AFDA',
                                },
                                {
                                    id: 'value_44',
                                    label: '29.7 - 44.6',
                                    min: 29.7,
                                    max: 44.6,
                                    color: '#97CCEC',
                                },
                                {
                                    id: 'value_29',
                                    label: '14.8 - 29.7',
                                    min: 14.8,
                                    max: 29.7,
                                    color: '#B7E4F9',
                                },
                                {
                                    id: 'value_14',
                                    label: '-0.1 - 14.8',
                                    min: -0.1,
                                    max: 14.8,
                                    color: '#D1EDFA',
                                },
                            ],
                        },
                        {
                            id: 'Heavy_Metal_HAPs_value',
                            label: 'Heavy Metal HAPs (value)',
                            min: -0.1,
                            max: 5,
                            opacityValue: 75,
                            type: 'value',
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_5',
                                    label: '4.26 - 5',
                                    min: 4.26,
                                    max: 5,
                                    color: '#546189',
                                },
                                {
                                    id: 'value_4',
                                    label: '3.54 - 4.26',
                                    min: 3.54,
                                    max: 4.26,
                                    color: '#5874A7',
                                },
                                {
                                    id: 'value_3',
                                    label: '2.81 - 3.54',
                                    min: 2.81,
                                    max: 3.54,
                                    color: '#638FC5',
                                },
                                {
                                    id: 'value_28',
                                    label: '2.08 - 2.81',
                                    min: 2.08,
                                    max: 2.81,
                                    color: '#79AFDA',
                                },
                                {
                                    id: 'value_2',
                                    label: '1.35 - 2.08',
                                    min: 1.35,
                                    max: 2.08,
                                    color: '#97CCEC',
                                },
                                {
                                    id: 'value_1',
                                    label: '0.62 - 1.35',
                                    min: 0.62,
                                    max: 1.35,
                                    color: '#B7E4F9',
                                },
                                {
                                    id: 'value_0',
                                    label: '-0.1 - 0.62',
                                    min: -0.1,
                                    max: 0.62,
                                    color: '#D1EDFA',
                                },
                            ],
                        },
                    ],
                },
            ],
            dicKey: {
                air_risk_PercentRank: 'CancerRisk',
                air_risk_value: 'CancerRisk',
                Gas_VOC_HAPs_PercentRank: 'Gas_VOC_HAPs',
                Heavy_Metal_HAPs_PercentRank: 'Heavy_Metal_HAPs',
                Gas_VOC_HAPs_value: 'Gas_VOC_HAPs',
                Heavy_Metal_HAPs_value: 'Heavy_Metal_HAPs',
            },
            checkList: [],
        };
    },
    actions: {
        init() {
            this.checkList = [];
            setCancerRiskGeoIdSet({}, '');
        },
        handleWatcher() {
            if (this.checkList.length) {
                setCancerRiskLayerStyle();
            }
        },
        async handleLayerChange() {
            const mapIns = mapManager.getMapIns();
            let layers = mapIns.getAllLayers();
            let layerIndex = layers.findIndex((item) => item === cancerRiskLayer);
            if (this.checkList.length) {
                if (layerIndex === -1) {
                    mapIns.addLayer(cancerRiskLayer);
                }
                const projectYearStore = useProjectYearStore();
                let key = this.checkList[0];
                let params = {
                    pollutantType: this.dicKey[key],
                    dataType: key.includes('PercentRank') ? 'PercentRank' : 'value',
                    // year: projectYearStore.projectYear,
                    year: 2020,
                    dataScaleType: 'CensusTract',
                };
                let keyList = [
                    'air_risk_value',
                    'air_risk_PercentRank',
                    'Gas_VOC_HAPs_PercentRank',
                    'Heavy_Metal_HAPs_PercentRank',
                    'Gas_VOC_HAPs_value',
                    'Heavy_Metal_HAPs_value',
                ];
                if (keyList.indexOf(key) !== -1) {
                    params.year = 2020;
                }
                let result = await getMapLayerData(params);
                setCancerRiskGeoIdSet(result, key);
            } else {
                setCancerRiskGeoIdSet({}, '');
                if (layerIndex !== -1) {
                    mapIns.removeLayer(cancerRiskLayer);
                }
            }
        },
    },
});
