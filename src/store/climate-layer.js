import { defineStore } from 'pinia';
import { mapManager } from '@/libs/map/map-manager.js';
import { getMapLayerData } from '@/api/map-layer.js';
import { useProjectYearStore } from '@/store/project-year.js';
import climateLayer, { setClimateGeoIdSet, setClimatelayerStyle } from '@/libs/map/map-layer/climate-layer';
export const useClimateLayerStore = defineStore('climateLayer', {
    state: () => {
        return {
            layerList: [
                {
                    id: 'climate',
                    // label: 'Climate Risk',
                    label: 'Heat Risk',
                    children: [
                        {
                            id: 'heatIndexPresent_PercentRank',
                            label: 'Heat Index Present (%ile)',
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
                                    color: '#616081',
                                    min: 95,
                                    max: 100,
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %ile',
                                    color: '#8A5284',
                                    min: 90,
                                    max: 95,
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %ile',
                                    color: '#B55A8A',
                                    min: 80,
                                    max: 90,
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %ile',
                                    color: '#DA7181',
                                    min: 70,
                                    max: 80,
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %ile',
                                    color: '#EF9982',
                                    min: 60,
                                    max: 70,
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %ile',
                                    color: '#F9C59C',
                                    min: 50,
                                    max: 60,
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %ile',
                                    color: '#FEF2C4',
                                    min: 0,
                                    max: 50,
                                },
                            ],
                        },
                        {
                            id: 'heatIndex2050_PercentRank',
                            label: 'Heat Index 2050 (%ile)',
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
                                    color: '#616081',
                                    min: 95,
                                    max: 100,
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %ile',
                                    color: '#8A5284',
                                    min: 90,
                                    max: 95,
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %ile',
                                    color: '#B55A8A',
                                    min: 80,
                                    max: 90,
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %ile',
                                    color: '#DA7181',
                                    min: 70,
                                    max: 80,
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %ile',
                                    color: '#EF9982',
                                    min: 60,
                                    max: 70,
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %ile',
                                    color: '#F9C59C',
                                    min: 50,
                                    max: 60,
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %ile',
                                    color: '#FEF2C4',
                                    min: 0,
                                    max: 50,
                                },
                            ],
                        },
                        {
                            id: 'heatIndex2100_PercentRank',
                            label: 'Heat Index 2100 (%ile)',
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
                                    color: '#616081',
                                    min: 95,
                                    max: 100,
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %ile',
                                    color: '#8A5284',
                                    min: 90,
                                    max: 95,
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %ile',
                                    color: '#B55A8A',
                                    min: 80,
                                    max: 90,
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %ile',
                                    color: '#DA7181',
                                    min: 70,
                                    max: 80,
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %ile',
                                    color: '#EF9982',
                                    min: 60,
                                    max: 70,
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %ile',
                                    color: '#F9C59C',
                                    min: 50,
                                    max: 60,
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %ile',
                                    color: '#FEF2C4',
                                    min: 0,
                                    max: 50,
                                },
                            ],
                        },
                        {
                            id: 'heatIndexPresent_Value',
                            label: 'Heat Index Present (value)',
                            min: 0,
                            max: 104.2,
                            type: 'value',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_104',
                                    label: '89.3 - 104.2',
                                    color: '#616081',
                                    min: 89.3,
                                    max: 104.2,
                                },
                                {
                                    id: 'value_89',
                                    label: '74.4 - 89.3',
                                    color: '#8A5284',
                                    min: 74.4,
                                    max: 89.3,
                                },
                                {
                                    id: 'value_74',
                                    label: '59.5 - 74.4',
                                    color: '#B55A8A',
                                    min: 59.5,
                                    max: 74.4,
                                },
                                {
                                    id: 'value_59',
                                    label: '44.6 - 59.5',
                                    color: '#DA7181',
                                    min: 44.6,
                                    max: 59.5,
                                },
                                {
                                    id: 'value_44',
                                    label: '29.7 - 44.6',
                                    color: '#EF9982',
                                    min: 29.7,
                                    max: 44.6,
                                },
                                {
                                    id: 'value_29',
                                    label: '14.8 - 29.7',
                                    color: '#F9C59C',
                                    min: 14.8,
                                    max: 29.7,
                                },
                                {
                                    id: 'value_14',
                                    label: '0 - 14.8',
                                    color: '#FEF2C4',
                                    min: 0,
                                    max: 14.8,
                                },
                            ],
                        },
                        {
                            id: 'heatIndex2050_Value',
                            label: 'Heat Index 2050 (value)',
                            min: 0,
                            max: 106.8,
                            type: 'value',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_106',
                                    label: '91.7 - 106.8',
                                    color: '#616081',
                                    min: 91.7,
                                    max: 106.8,
                                },
                                {
                                    id: 'value_91',
                                    label: '76.4 - 91.7',
                                    color: '#8A5284',
                                    min: 76.4,
                                    max: 91.7,
                                },
                                {
                                    id: 'value_76',
                                    label: '61.1 - 76.4',
                                    color: '#B55A8A',
                                    min: 61.1,
                                    max: 76.4,
                                },
                                {
                                    id: 'value_61',
                                    label: '45.8 - 61.1',
                                    color: '#DA7181',
                                    min: 45.8,
                                    max: 61.1,
                                },
                                {
                                    id: 'value_45',
                                    label: '30.5 - 45.8',
                                    color: '#EF9982',
                                    min: 30.5,
                                    max: 45.8,
                                },
                                {
                                    id: 'value_30',
                                    label: '15.2 - 30.5',
                                    color: '#F9C59C',
                                    min: 15.2,
                                    max: 30.5,
                                },
                                {
                                    id: 'value_15',
                                    label: '0 - 15.2',
                                    color: '#FEF2C4',
                                    min: 0,
                                    max: 15.2,
                                },
                            ],
                        },
                        {
                            id: 'heatIndex2100_Value',
                            label: 'Heat Index 2100 (value)',
                            min: 0,
                            max: 108.8,
                            type: 'value',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_108',
                                    label: '93.5 - 108.8',
                                    color: '#616081',
                                    min: 93.5,
                                    max: 108.8,
                                },
                                {
                                    id: 'value_93',
                                    label: '77.9 - 93.5',
                                    color: '#8A5284',
                                    min: 77.9,
                                    max: 93.5,
                                },
                                {
                                    id: 'value_77',
                                    label: '62.3 - 77.9',
                                    color: '#B55A8A',
                                    min: 62.3,
                                    max: 77.9,
                                },
                                {
                                    id: 'value_62',
                                    label: '46.7 - 62.3',
                                    color: '#DA7181',
                                    min: 46.7,
                                    max: 62.3,
                                },
                                {
                                    id: 'value_46',
                                    label: '31.1 - 46.7',
                                    color: '#EF9982',
                                    min: 31.1,
                                    max: 46.7,
                                },
                                {
                                    id: 'value_31',
                                    label: '15.5 - 31.1',
                                    color: '#F9C59C',
                                    min: 15.5,
                                    max: 31.1,
                                },
                                {
                                    id: 'value_15',
                                    label: '0 - 15.5',
                                    color: '#FEF2C4',
                                    min: 0,
                                    max: 15.5,
                                },
                            ],
                        },
                        // {
                        //     id: 'wildFireHazard',
                        //     label: 'Wildfire Hazard Potential',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [],
                        // },
                        // {
                        //     id: 'drought',
                        //     label: 'Drought',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [],
                        // },
                        // {
                        //     id: 'coastal',
                        //     label: 'Coastal Flood Hazard',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [],
                        // },
                        // {
                        //     id: 'floodPlain',
                        //     label: '100 Year Flood Plain',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'estimatedFloodplain',
                        //             label: 'Area in Estimated Floodplain',
                        //             color: '#6699CC',
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'seaLevel1',
                        //     label: '1ft Sea Level Rise (NOAA)',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'lowLying',
                        //             label: 'SLR Low-lying Areas',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: '#66FF00',
                        //                     label: '',
                        //                     id: 'lying',
                        //                 },
                        //             ],
                        //         },
                        //         {
                        //             id: 'depth',
                        //             label: 'SLR Depth',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: `linear-gradient(#66CCFF, #A6CAF0)`,
                        //                     label: 'Low',
                        //                     id: 'low',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#3366CC, #6699FF)`,
                        //                     label: '',
                        //                     id: 'middle',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#330099, #3366CC)`,
                        //                     label: 'High',
                        //                     id: 'high',
                        //                 },
                        //             ],
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'seaLevel2',
                        //     label: '2ft Sea Level Rise (NOAA)',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'lowLying',
                        //             label: 'SLR Low-lying Areas',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: '#66FF00',
                        //                     label: '',
                        //                     id: 'lying',
                        //                 },
                        //             ],
                        //         },
                        //         {
                        //             id: 'depth',
                        //             label: 'SLR Depth',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: `linear-gradient(#66CCFF, #A6CAF0)`,
                        //                     label: 'Low',
                        //                     id: 'low',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#3366CC, #6699FF)`,
                        //                     label: '',
                        //                     id: 'middle',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#330099, #3366CC)`,
                        //                     label: 'High',
                        //                     id: 'high',
                        //                 },
                        //             ],
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'seaLevel3',
                        //     label: '3ft Sea Level Rise (NOAA)',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'lowLying',
                        //             label: 'SLR Low-lying Areas',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: '#66FF00',
                        //                     label: '',
                        //                     id: 'lying',
                        //                 },
                        //             ],
                        //         },
                        //         {
                        //             id: 'depth',
                        //             label: 'SLR Depth',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: `linear-gradient(#66CCFF, #A6CAF0)`,
                        //                     label: 'Low',
                        //                     id: 'low',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#3366CC, #6699FF)`,
                        //                     label: '',
                        //                     id: 'middle',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#330099, #3366CC)`,
                        //                     label: 'High',
                        //                     id: 'high',
                        //                 },
                        //             ],
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'seaLevel4',
                        //     label: '4ft Sea Level Rise (NOAA)',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'lowLying',
                        //             label: 'SLR Low-lying Areas',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: '#66FF00',
                        //                     label: '',
                        //                     id: 'lying',
                        //                 },
                        //             ],
                        //         },
                        //         {
                        //             id: 'depth',
                        //             label: 'SLR Depth',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: `linear-gradient(#66CCFF, #A6CAF0)`,
                        //                     label: 'Low',
                        //                     id: 'low',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#3366CC, #6699FF)`,
                        //                     label: '',
                        //                     id: 'middle',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#330099, #3366CC)`,
                        //                     label: 'High',
                        //                     id: 'high',
                        //                 },
                        //             ],
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'seaLevel5',
                        //     label: '5ft Sea Level Rise (NOAA)',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'lowLying',
                        //             label: 'SLR Low-lying Areas',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: '#66FF00',
                        //                     label: '',
                        //                     id: 'lying',
                        //                 },
                        //             ],
                        //         },
                        //         {
                        //             id: 'depth',
                        //             label: 'SLR Depth',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: `linear-gradient(#66CCFF, #A6CAF0)`,
                        //                     label: 'Low',
                        //                     id: 'low',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#3366CC, #6699FF)`,
                        //                     label: '',
                        //                     id: 'middle',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#330099, #3366CC)`,
                        //                     label: 'High',
                        //                     id: 'high',
                        //                 },
                        //             ],
                        //         },
                        //     ],
                        // },
                        // {
                        //     id: 'seaLevel6',
                        //     label: '6ft Sea Level Rise (NOAA)',
                        //     type: 'climateRiskIndicator',
                        //     opacityValue: 100,
                        //     isCheck: true,
                        //     disabled: false,
                        //     children: [
                        //         {
                        //             id: 'lowLying',
                        //             label: 'SLR Low-lying Areas',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: '#66FF00',
                        //                     label: '',
                        //                     id: 'lying',
                        //                 },
                        //             ],
                        //         },
                        //         {
                        //             id: 'depth',
                        //             label: 'SLR Depth',
                        //             type: 'climateRiskIndicatorChild',
                        //             children: [
                        //                 {
                        //                     color: `linear-gradient(#66CCFF, #A6CAF0)`,
                        //                     label: 'Low',
                        //                     id: 'low',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#3366CC, #6699FF)`,
                        //                     label: '',
                        //                     id: 'middle',
                        //                 },
                        //                 {
                        //                     color: `linear-gradient(#330099, #3366CC)`,
                        //                     label: 'High',
                        //                     id: 'high',
                        //                 },
                        //             ],
                        //         },
                        //     ],
                        // },
                    ],
                },
            ],
            dicKey: {
                heatIndexPresent_PercentRank: 'HeatIndexPresent',
                heatIndex2050_PercentRank: 'HeatIndex2050',
                heatIndex2100_PercentRank: 'HeatIndex2100',
                heatIndexPresent_Value: 'HeatIndexPresent',
                heatIndex2050_Value: 'HeatIndex2050',
                heatIndex2100_Value: 'HeatIndex2100',
            },
            checkList: [],
            indicatorsList: ['wildFireHazard', 'drought', 'coastal', 'floodPlain', 'seaLevel1', 'seaLevel2', 'seaLevel3', 'seaLevel4', 'seaLevel5', 'seaLevel6'],
        };
    },
    actions: {
        init() {
            this.checkList = [];
            setClimateGeoIdSet({}, '');
        },
        handleWatcher() {
            if (this.checkList.length) {
                setClimatelayerStyle();
            }
        },
        async handleLayerChange() {
            const mapIns = mapManager.getMapIns();
            // climateRiskIndicatorChange(val, id);
            let layers = mapIns.getAllLayers();
            let layerIndex = layers.findIndex((item) => item === climateLayer);
            if (this.checkList.length) {
                if (layerIndex === -1) {
                    mapIns.addLayer(climateLayer);
                }
                const projectYearStore = useProjectYearStore();
                let key = this.checkList[0];
                let params = {
                    pollutantType: this.dicKey[key],
                    dataType: key.includes('PercentRank') ? 'PercentRank' : 'value',
                    year: projectYearStore.projectYear,
                    dataScaleType: 'CensusTract',
                };
                let result = await getMapLayerData(params);
                setClimateGeoIdSet(result, key);
            } else {
                setClimateGeoIdSet({}, '');
                if (layerIndex !== -1) {
                    mapIns.removeLayer(climateLayer);
                }
            }
        },
    },
});
