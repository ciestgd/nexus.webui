import { defineStore } from 'pinia';
import indicatorsLayer, { setIndicatorsGeoIdSet, setIndicatorslayerStyle } from '@/libs/map/map-layer/indicators-layer';
import { mapManager } from '@/libs/map/map-manager.js';
import { getMapLayerData } from '@/api/map-layer.js';
export const useIndicatorsLayerStore = defineStore('indicatorsLayer', {
    state: () => {
        return {
            layerList: [
                {
                    id: 'indicators',
                    // label: 'EJ Indicators',
                    label: 'Demographics',
                    children: [
                        // {
                        //     id: 'demographicIndex_Value',
                        //     label: 'Demographic index',
                        //     min: 0,
                        //     max: 100,
                        //     type: 'tile',
                        //     opacityValue: 75,
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             color: '#CF9395',
                        //             min: 95,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             color: '#E7CC95',
                        //             min: 90,
                        //             max: 95,
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             color: '#F0F3C1',
                        //             min: 80,
                        //             max: 90,
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             color: '#B8BBBD',
                        //             min: 70,
                        //             max: 80,
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             color: '#C6C9CC',
                        //             min: 60,
                        //             max: 70,
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             color: '#D4D7DA',
                        //             min: 50,
                        //             max: 60,
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             color: '#E2E4E7',
                        //             min: 0,
                        //             max: 50,
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'lowIncome_PCT_Value',
                        //     label: '% Low-Income',
                        //     min: 0,
                        //     max: 100,
                        //     type: 'tile',
                        //     opacityValue: 75,
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             color: '#CF9395',
                        //             min: 95,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             color: '#E7CC95',
                        //             min: 90,
                        //             max: 95,
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             color: '#F0F3C1',
                        //             min: 80,
                        //             max: 90,
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             color: '#B8BBBD',
                        //             min: 70,
                        //             max: 80,
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             color: '#C6C9CC',
                        //             min: 60,
                        //             max: 70,
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             color: '#D4D7DA',
                        //             min: 50,
                        //             max: 60,
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             color: '#E2E4E7',
                        //             min: 0,
                        //             max: 50,
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'peopleOfColor_PCT_Value',
                        //     label: '% People of Color',
                        //     min: 0,
                        //     max: 100,
                        //     type: 'tile',
                        //     opacityValue: 75,
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             color: '#CF9395',
                        //             min: 95,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             color: '#E7CC95',
                        //             min: 90,
                        //             max: 95,
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             color: '#F0F3C1',
                        //             min: 80,
                        //             max: 90,
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             color: '#B8BBBD',
                        //             min: 70,
                        //             max: 80,
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             color: '#C6C9CC',
                        //             min: 60,
                        //             max: 70,
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             color: '#D4D7DA',
                        //             min: 50,
                        //             max: 60,
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             color: '#E2E4E7',
                        //             min: 0,
                        //             max: 50,
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'population_LESSHS',
                        //     label: 'Less than high school education',
                        //     min: 0,
                        //     max: 100,
                        //     type: 'tile',
                        //     opacityValue: 75,
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             color: '#CF9395',
                        //             min: 95,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             color: '#E7CC95',
                        //             min: 90,
                        //             max: 95,
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             color: '#F0F3C1',
                        //             min: 0,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             color: '#B8BBBD',
                        //             min: 0,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             color: '#C6C9CC',
                        //             min: 0,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             color: '#D4D7DA',
                        //             min: 0,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             color: '#E2E4E7',
                        //             min: 0,
                        //             max: 100,
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'population_LINGISO',
                        //     label: 'Linguistic isolation',
                        //     min: 0,
                        //     max: 100,
                        //     type: 'tile',
                        //     opacityValue: 75,
                        //     scaleValue: 3,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'tile_100',
                        //             label: '95 - 100 %ile',
                        //             color: '#CF9395',
                        //             min: 95,
                        //             max: 100,
                        //         },
                        //         {
                        //             id: 'tile_95',
                        //             label: '90 - 95 %ile',
                        //             color: '#E7CC95',
                        //             min: 90,
                        //             max: 95,
                        //         },
                        //         {
                        //             id: 'tile_90',
                        //             label: '80 - 90 %ile',
                        //             color: '#F0F3C1',
                        //             min: 80,
                        //             max: 90,
                        //         },
                        //         {
                        //             id: 'tile_80',
                        //             label: '70 - 80 %ile',
                        //             color: '#B8BBBD',
                        //             min: 70,
                        //             max: 80,
                        //         },
                        //         {
                        //             id: 'tile_70',
                        //             label: '60 - 70 %ile',
                        //             color: '#C6C9CC',
                        //             min: 60,
                        //             max: 70,
                        //         },
                        //         {
                        //             id: 'tile_60',
                        //             label: '50 - 60 %ile',
                        //             color: '#D4D7DA',
                        //             min: 50,
                        //             max: 60,
                        //         },
                        //         {
                        //             id: 'tile_50',
                        //             label: '0 - 50 %ile',
                        //             color: '#E2E4E7',
                        //             min: 0,
                        //             max: 50,
                        //         },
                        //     ],
                        // },
                        {
                            id: 'population_Under5',
                            label: 'Individuals under age 5',
                            min: 0,
                            max: 100,
                            type: 'tile',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'tile_100',
                                    label: '95 - 100 %ile',
                                    color: '#CF9395',
                                    min: 95,
                                    max: 100,
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %ile',
                                    color: '#E7CC95',
                                    min: 90,
                                    max: 92,
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %ile',
                                    color: '#F0F3C1',
                                    min: 80,
                                    max: 90,
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %ile',
                                    color: '#B8BBBD',
                                    min: 70,
                                    max: 80,
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %ile',
                                    color: '#C6C9CC',
                                    min: 60,
                                    max: 70,
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %ile',
                                    color: '#D4D7DA',
                                    min: 50,
                                    max: 60,
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %ile',
                                    color: '#E2E4E7',
                                    min: 0,
                                    max: 50,
                                },
                            ],
                        },
                        {
                            id: 'population_Over64',
                            label: 'Individuals over age 64',
                            min: 0,
                            max: 100,
                            type: 'tile',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'tile_100',
                                    label: '95 - 100 %ile',
                                    color: '#CF9395',
                                    min: 95,
                                    max: 100,
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %ile',
                                    color: '#E7CC95',
                                    min: 90,
                                    max: 92,
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %ile',
                                    color: '#F0F3C1',
                                    min: 80,
                                    max: 90,
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %ile',
                                    color: '#B8BBBD',
                                    min: 70,
                                    max: 80,
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %ile',
                                    color: '#C6C9CC',
                                    min: 60,
                                    max: 70,
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %ile',
                                    color: '#D4D7DA',
                                    min: 50,
                                    max: 60,
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %ile',
                                    color: '#E2E4E7',
                                    min: 0,
                                    max: 50,
                                },
                            ],
                        },
                    ],
                },
            ],
            dicKey: {
                demographicIndex_Value: 'DemographicIndex',
                lowIncome_PCT_Value: 'LowIncome_PCT',
                peopleOfColor_PCT_Value: 'PeopleOfColor_PCT',
                population_LESSHS: 'LESSHS_PCT',
                population_LINGISO: 'LINGISO_PCT',
                population_Under5: 'Under5_PCT',
                population_Over64: 'Over64_PCT',
            },
            checkList: [],
        };
    },
    actions: {
        init() {
            this.checkList = [];
            setIndicatorsGeoIdSet({}, '');
        },
        handleWatcher() {
            if (this.checkList.length) {
                setIndicatorslayerStyle();
            }
        },
        async handleLayerChange() {
            const mapIns = mapManager.getMapIns();
            let layers = mapIns.getAllLayers();
            let layerIndex = layers.findIndex((item) => item === indicatorsLayer);
            if (this.checkList.length) {
                if (layerIndex === -1) {
                    mapIns.addLayer(indicatorsLayer);
                }
                let key = this.checkList[0];

                let params = {
                    pollutantType: this.dicKey[key],
                    dataType: 'percentRank',
                    year: 2021,
                    dataScaleType: 'CensusTract',
                };
                let result = await getMapLayerData(params);
                setIndicatorsGeoIdSet(result, key);
            } else {
                setIndicatorsGeoIdSet({}, '');
                if (layerIndex !== -1) {
                    mapIns.removeLayer(indicatorsLayer);
                }
            }
        },
    },
});
