import { defineStore } from 'pinia';
import mortalityLayer, { setMortalityGeoIdSet, setMortalitylayerStyle } from '@/libs/map/map-layer/mortality-layer';
import { mapManager } from '@/libs/map/map-manager.js';
import { getMapLayerData } from '@/api/map-layer.js';
import { useProjectYearStore } from '@/store/project-year.js';
export const useMortalityLayerStore = defineStore('mortalityLayer', {
    state: () => {
        return {
            layerList: [
                {
                    id: 'motality',
                    label: 'AQ Mortality Risk',
                    children: [
                        {
                            id: 'mortality_PM25_Max_PercentRank',
                            label: 'PM2.5 Mortality Risk (%ile)',
                            min: 0,
                            max: 100,
                            opacityValue: 75,
                            scaleValue: 3,
                            type: 'tile',
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'tile_100',
                                    label: '95 - 100 %ile',
                                    min: 95,
                                    max: 100,
                                    color: '#546189',
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %ile',
                                    min: 90,
                                    max: 95,
                                    color: '#5874A7',
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %ile',
                                    min: 80,
                                    max: 90,
                                    color: '#638FC5',
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %ile',
                                    min: 70,
                                    max: 80,
                                    color: '#79AFDA',
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %ile',
                                    min: 60,
                                    max: 70,
                                    color: '#97CCEC',
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %ile',
                                    min: 50,
                                    max: 60,
                                    color: '#B7E4F9',
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %ile',
                                    min: 0,
                                    max: 50,
                                    color: '#D1EDFA',
                                },
                            ],
                        },
                        {
                            id: 'mortality_O3_Max_PercentRank',
                            label: 'O3 Mortality Risk (%ile)',
                            min: 0,
                            max: 100,
                            opacityValue: 75,
                            type: 'tile',
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'tile_100',
                                    label: '95 - 100 %ile',
                                    min: 95,
                                    max: 100,
                                    color: '#546189',
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %ile',
                                    min: 90,
                                    max: 95,
                                    color: '#5874A7',
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %ile',
                                    min: 80,
                                    max: 90,
                                    color: '#638FC5',
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %ile',
                                    min: 70,
                                    max: 80,
                                    color: '#79AFDA',
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %ile',
                                    min: 60,
                                    max: 70,
                                    color: '#97CCEC',
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %ile',
                                    min: 50,
                                    max: 60,
                                    color: '#B7E4F9',
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %ile',
                                    min: 0,
                                    max: 50,
                                    color: '#D1EDFA',
                                },
                            ],
                        },
                        // {
                        //     id: 'air_risk_PercentRank',
                        //     label: 'Air Toxics Cancer Risk (%ile)',
                        //     min: 0,
                        //     max: 100,
                        //     opacityValue: 75,
                        //     type: 'tile',
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             min: 95,
                        //             max: 100,
                        //             color: '#546189',
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             min: 90,
                        //             max: 95,
                        //             color: '#5874A7',
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             min: 80,
                        //             max: 90,
                        //             color: '#638FC5',
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             min: 70,
                        //             max: 80,
                        //             color: '#79AFDA',
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             min: 60,
                        //             max: 70,
                        //             color: '#97CCEC',
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             min: 50,
                        //             max: 60,
                        //             color: '#B7E4F9',
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             min: 0,
                        //             max: 50,
                        //             color: '#D1EDFA',
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'Gas_VOC_HAPs_PercentRank',
                        //     label: 'GAS & VOC HAPs (%ile)',
                        //     min: 0,
                        //     max: 100,
                        //     opacityValue: 75,
                        //     type: 'tile',
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             min: 95,
                        //             max: 100,
                        //             color: '#546189',
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             min: 90,
                        //             max: 95,
                        //             color: '#5874A7',
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             min: 80,
                        //             max: 90,
                        //             color: '#638FC5',
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             min: 70,
                        //             max: 80,
                        //             color: '#79AFDA',
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             min: 60,
                        //             max: 70,
                        //             color: '#97CCEC',
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             min: 50,
                        //             max: 60,
                        //             color: '#B7E4F9',
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             min: 0,
                        //             max: 50,
                        //             color: '#D1EDFA',
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'Heavy_Metal_HAPs_PercentRank',
                        //     label: 'Heavy Metal HAPs (%ile)',
                        //     min: 0,
                        //     max: 100,
                        //     opacityValue: 75,
                        //     type: 'tile',
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             min: 95,
                        //             max: 100,
                        //             color: '#546189',
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             min: 90,
                        //             max: 95,
                        //             color: '#5874A7',
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             min: 80,
                        //             max: 90,
                        //             color: '#638FC5',
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             min: 70,
                        //             max: 80,
                        //             color: '#79AFDA',
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             min: 60,
                        //             max: 70,
                        //             color: '#97CCEC',
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             min: 50,
                        //             max: 60,
                        //             color: '#B7E4F9',
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             min: 0,
                        //             max: 50,
                        //             color: '#D1EDFA',
                        //         },
                        //     ],
                        // },
                        {
                            id: 'mortality_PM25_Max_Value',
                            label: 'PM2.5 Mortality Risk (value)',
                            min: -0.1,
                            max: 31.6,
                            opacityValue: 75,
                            type: 'value',
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_31',
                                    label: '26.9 - 31.6',
                                    min: 26.9,
                                    max: 31.6,
                                    color: '#546189',
                                },
                                {
                                    id: 'value_26',
                                    label: '22.4 - 26.9',
                                    min: 22.4,
                                    max: 26.9,
                                    color: '#5874A7',
                                },
                                {
                                    id: 'value_22',
                                    label: '17.9 - 22.4',
                                    min: 17.9,
                                    max: 22.4,
                                    color: '#638FC5',
                                },
                                {
                                    id: 'value_17',
                                    label: '13.4 - 17.9',
                                    min: 13.4,
                                    max: 17.9,
                                    color: '#79AFDA',
                                },
                                {
                                    id: 'value_13',
                                    label: '8.9 - 13.4',
                                    min: 8.9,
                                    max: 13.4,
                                    color: '#97CCEC',
                                },
                                {
                                    id: 'value_8',
                                    label: '4.4 - 8.9',
                                    min: 4.4,
                                    max: 8.9,
                                    color: '#B7E4F9',
                                },
                                {
                                    id: 'value_4',
                                    label: '-0.1 - 4.4',
                                    min: -0.1,
                                    max: 4.4,
                                    color: '#D1EDFA',
                                },
                            ],
                        },
                        {
                            id: 'mortality_O3_Max_Value',
                            label: 'O3 Mortality Risk (value)',
                            min: -0.1,
                            max: 23.2,
                            opacityValue: 75,
                            type: 'value',
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_23',
                                    label: '19.7 - 23.2',
                                    min: 19.7,
                                    max: 23.2,
                                    color: '#546189',
                                },
                                {
                                    id: 'value_19',
                                    label: '16.4 - 19.7',
                                    min: 16.4,
                                    max: 19.7,
                                    color: '#5874A7',
                                },
                                {
                                    id: 'value_16',
                                    label: '13.1 - 16.4',
                                    min: 13.1,
                                    max: 16.4,
                                    color: '#638FC5',
                                },
                                {
                                    id: 'value_13',
                                    label: '9.8 - 13.1',
                                    min: 9.8,
                                    max: 13.1,
                                    color: '#79AFDA',
                                },
                                {
                                    id: 'value_9',
                                    label: '6.5 - 9.8',
                                    min: 6.5,
                                    max: 9.8,
                                    color: '#97CCEC',
                                },
                                {
                                    id: 'value_6',
                                    label: '3.2 - 6.5',
                                    min: 3.2,
                                    max: 6.5,
                                    color: '#B7E4F9',
                                },
                                {
                                    id: 'value_3',
                                    label: '-0.1 - 3.2',
                                    min: -0.1,
                                    max: 3.2,
                                    color: '#D1EDFA',
                                },
                            ],
                        },
                    ],
                },
            ],
            dicKey: {
                mortality_PM25_Max_PercentRank: 'Mortality_PM25',
                mortality_PM25_Max_Value: 'Mortality_PM25',
                mortality_O3_Max_PercentRank: 'Mortality_O3',
                mortality_O3_Max_Value: 'Mortality_O3',
                // air_risk_PercentRank: 'CancerRisk',
                // air_risk_value: 'CancerRisk',
                // Gas_VOC_HAPs_PercentRank: 'Gas_VOC_HAPs',
                // Heavy_Metal_HAPs_PercentRank: 'Heavy_Metal_HAPs',
                // Gas_VOC_HAPs_value: 'Gas_VOC_HAPs',
                // Heavy_Metal_HAPs_value: 'Heavy_Metal_HAPs',
            },
            checkList: [],
        };
    },
    actions: {
        init() {
            this.checkList = [];
            setMortalityGeoIdSet({}, '');
        },
        handleWatcher() {
            if (this.checkList.length) {
                setMortalitylayerStyle();
            }
        },
        async handleLayerChange() {
            const mapIns = mapManager.getMapIns();
            let layers = mapIns.getAllLayers();
            let layerIndex = layers.findIndex((item) => item === mortalityLayer);
            if (this.checkList.length) {
                if (layerIndex === -1) {
                    mapIns.addLayer(mortalityLayer);
                }
                const projectYearStore = useProjectYearStore();
                let key = this.checkList[0];
                let params = {
                    pollutantType: this.dicKey[key],
                    dataType: key.includes('PercentRank') ? 'PercentRank' : 'value',
                    year: projectYearStore.projectYear,
                    dataScaleType: 'County',
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
                    params.year = 2018;
                }
                let result = await getMapLayerData(params);
                setMortalityGeoIdSet(result, key);
            } else {
                setMortalityGeoIdSet({}, '');
                if (layerIndex !== -1) {
                    mapIns.removeLayer(mortalityLayer);
                }
            }
        },
    },
});
