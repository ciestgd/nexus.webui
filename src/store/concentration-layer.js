import { defineStore } from 'pinia';
import concentrationLayer, { setConcentrationGeoIdSet, setConcentrationlayerStyle } from '@/libs/map/map-layer/concentration-layer';
import getFileData from '@/libs/read-file';
import { mapManager } from '@/libs/map/map-manager.js';
import { getMapLayerData } from '@/api/map-layer.js';
import { useProjectYearStore } from '@/store/project-year.js';
export const useConcentrationLayerStore = defineStore('concentrationLayer', {
    state: () => {
        return {
            layerList: [
                {
                    id: 'concentration',
                    label: 'AQ Concentration',
                    children: [
                        {
                            id: 'fused_PM25',
                            label: 'Annual average fused PM2.5',
                            min: -0.1,
                            max: 12.2,
                            type: 'value',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_12',
                                    label: '10.7 - 12.2',
                                    color: '#7468A1',
                                    min: 10.7,
                                    max: 12.2,
                                },
                                {
                                    id: 'value_10',
                                    label: '8.9 - 10.7',
                                    color: '#6886AA',
                                    min: 8.9,
                                    max: 10.7,
                                },
                                {
                                    id: 'value_8',
                                    label: '7.1 - 8.9',
                                    color: '#5DA1AB',
                                    min: 7.1,
                                    max: 8.9,
                                },
                                {
                                    id: 'value_7',
                                    label: '5.3 - 7.1',
                                    color: '#58BAA5',
                                    min: 5.3,
                                    max: 7.1,
                                },
                                {
                                    id: 'value_5',
                                    label: '3.5 - 5.3',
                                    color: '#79D292',
                                    min: 3.5,
                                    max: 5.3,
                                },
                                {
                                    id: 'value_3',
                                    label: '1.7 - 3.5',
                                    color: '#B8E46B',
                                    min: 1.7,
                                    max: 3.5,
                                },
                                {
                                    id: 'value_1',
                                    label: '-0.1 - 1.7',
                                    color: '#FEEE5C',
                                    min: -0.1,
                                    max: 1.7,
                                },
                            ],
                        },
                        {
                            id: 'fused_O3',
                            // label: 'Fused O3',
                            label: 'Seasonal average fused O3',
                            min: -0.1,
                            max: 69.8,
                            type: 'value',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_69',
                                    label: '59.9 - 69.8',
                                    color: '#7468A1',
                                    min: 59.9,
                                    max: 69.8,
                                },
                                {
                                    id: 'value_59',
                                    label: '49.9 - 59.9',
                                    color: '#6886AA',
                                    min: 49.9,
                                    max: 59.9,
                                },
                                {
                                    id: 'value_49',
                                    label: '39.9 - 49.9',
                                    color: '#5DA1AB',
                                    min: 39.9,
                                    max: 49.9,
                                },
                                {
                                    id: 'value_39',
                                    label: '29.9 - 39.9',
                                    color: '#58BAA5',
                                    min: 29.9,
                                    max: 39.9,
                                },
                                {
                                    id: 'value_29',
                                    label: '19.9 - 29.9',
                                    color: '#79D292',
                                    min: 19.9,
                                    max: 29.9,
                                },
                                {
                                    id: 'value_19',
                                    label: '9.9 - 19.9',
                                    color: '#B8E46B',
                                    min: 9.9,
                                    max: 19.9,
                                },
                                {
                                    id: 'value_9',
                                    label: '-0.1 - 9.9',
                                    color: '#FEEE5C',
                                    min: -0.1,
                                    max: 9.9,
                                },
                            ],
                        },
                        {
                            id: 'Top_day_O3',
                            label: 'Top 10-day average O3',
                            min: 30,
                            max: 70,
                            type: 'value',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'value_70',
                                    label: '64.3 - 70',
                                    color: '#7468A1',
                                    min: 64.3,
                                    max: 70,
                                },
                                {
                                    id: 'value_64',
                                    label: '58.6 - 64.3',
                                    color: '#6886AA',
                                    min: 58.6,
                                    max: 64.3,
                                },
                                {
                                    id: 'value_58',
                                    label: '52.9 - 58.6',
                                    color: '#5DA1AB',
                                    min: 52.9,
                                    max: 58.6,
                                },
                                {
                                    id: 'value_52',
                                    label: '47.2 - 52.9',
                                    color: '#58BAA5',
                                    min: 47.2,
                                    max: 52.9,
                                },
                                {
                                    id: 'value_47',
                                    label: '41.5 - 47.2',
                                    color: '#79D292',
                                    min: 41.5,
                                    max: 47.2,
                                },
                                {
                                    id: 'value_41',
                                    label: '35.8 - 41.5',
                                    color: '#B8E46B',
                                    min: 35.8,
                                    max: 41.5,
                                },
                                {
                                    id: 'value_35',
                                    label: '30 - 35.8',
                                    color: '#FEEE5C',
                                    min: 30,
                                    max: 35.8,
                                },
                            ],
                        },

                    ],
                },
            ],
            checkList: [],
            dicKey: {
                fused_PM25: 'Fused_PM25',
                fused_O3: 'FUsed_O3',
            },
            topDayO3Data: null,
        };
    },
    actions: {
        init() {
            this.checkList = [];
            setConcentrationGeoIdSet({}, '');
        },
        handleWatcher() {
            if (this.checkList.length) {
                setConcentrationlayerStyle();
            }
        },
        async handleLayerChange() {
            const mapIns = mapManager.getMapIns();
            let layers = mapIns.getAllLayers();
            let layerIndex = layers.findIndex((item) => item === concentrationLayer);
            if (this.checkList.length) {
                if (layerIndex === -1) {
                    mapIns.addLayer(concentrationLayer);
                }
                let key = this.checkList[0];
                if (key === 'Top_day_O3') {
                    if (!this.topDayO3Data) {
                        await this.getTopDayO3Data();
                    }
                    setConcentrationGeoIdSet(Object.assign({}, this.topDayO3Data), key);
                } else {
                    const projectYearStore = useProjectYearStore();
                    let params = {
                        pollutantType: this.dicKey[key],
                        dataType: 'value',
                        year: key === 'satellite_NO2' ? 2019 : projectYearStore.projectYear,
                        dataScaleType: 'CensusTract',
                    };
                    let result = await getMapLayerData(params);
                    setConcentrationGeoIdSet(result, key);
                }
            } else {
                setConcentrationGeoIdSet({}, '');
                if (layerIndex !== -1) {
                    mapIns.removeLayer(concentrationLayer);
                }
            }
        },
        async getTopDayO3Data() {
            let obj = {};
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
            this.topDayO3Data = obj;
        },
    },
});
