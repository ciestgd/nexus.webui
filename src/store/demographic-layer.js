import { defineStore } from 'pinia';
import demographicLayer, { setDemographicGeoIdSet, setDemographiclayerStyle } from '@/libs/map/map-layer/demographic-layer';
import { mapManager } from '@/libs/map/map-manager.js';
import demographicCensusTractData from '@/libs/demographicData/censusTract.js';
export const useDemographicLayerStore = defineStore('demographicLayer', {
    state: () => {
        return {
            layerList: [
                {
                    id: 'Demographics',
                    label: 'Age Demographics',
                    children: [
                        {
                            id: 'under5_PCT',
                            label: 'Individuals under age 5',
                            min: 0,
                            max: 100,
                            type: 'percent',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'tile_100',
                                    label: '95 - 100 %',
                                    color: '#CF9395',
                                    min: 95,
                                    max: 100,
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %',
                                    color: '#E7CC95',
                                    min: 90,
                                    max: 92,
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %',
                                    color: '#F0F3C1',
                                    min: 80,
                                    max: 90,
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %',
                                    color: '#B8BBBD',
                                    min: 70,
                                    max: 80,
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %',
                                    color: '#C6C9CC',
                                    min: 60,
                                    max: 70,
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %',
                                    color: '#D4D7DA',
                                    min: 50,
                                    max: 60,
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %',
                                    color: '#E2E4E7',
                                    min: 0,
                                    max: 50,
                                },
                            ],
                        },
                        {
                            id: 'over62_PCT',
                            label: 'Individuals over age 62',
                            min: 0,
                            max: 100,
                            type: 'percent',
                            opacityValue: 75,
                            scaleValue: 3,
                            isCheck: true,
                            disabled: false,
                            children: [
                                {
                                    id: 'tile_100',
                                    label: '95 - 100 %',
                                    color: '#CF9395',
                                    min: 95,
                                    max: 100,
                                },
                                {
                                    id: 'tile_95',
                                    label: '90 - 95 %',
                                    color: '#E7CC95',
                                    min: 90,
                                    max: 92,
                                },
                                {
                                    id: 'tile_90',
                                    label: '80 - 90 %',
                                    color: '#F0F3C1',
                                    min: 80,
                                    max: 90,
                                },
                                {
                                    id: 'tile_80',
                                    label: '70 - 80 %',
                                    color: '#B8BBBD',
                                    min: 70,
                                    max: 80,
                                },
                                {
                                    id: 'tile_70',
                                    label: '60 - 70 %',
                                    color: '#C6C9CC',
                                    min: 60,
                                    max: 70,
                                },
                                {
                                    id: 'tile_60',
                                    label: '50 - 60 %',
                                    color: '#D4D7DA',
                                    min: 50,
                                    max: 60,
                                },
                                {
                                    id: 'tile_50',
                                    label: '0 - 50 %',
                                    color: '#E2E4E7',
                                    min: 0,
                                    max: 50,
                                },
                            ],
                        },
                    ],
                },
            ],

            checkList: [],
        };
    },
    actions: {
        init() {
            this.checkList = [];
            setDemographicGeoIdSet({}, '');
        },
        handleWatcher() {
            if (this.checkList.length) {
                setDemographiclayerStyle();
            }
        },
        async handleLayerChange() {
            const mapIns = mapManager.getMapIns();
            let layers = mapIns.getAllLayers();
            let layerIndex = layers.findIndex((item) => item === demographicLayer);
            if (this.checkList.length) {
                if (layerIndex === -1) {
                    mapIns.addLayer(demographicLayer);
                }
                let key = this.checkList[0];

                let result = {};
                await Object.keys(demographicCensusTractData).forEach((geoId) => {
                    let item = demographicCensusTractData[geoId];
                    if (item) {
                        let value = item[key];
                        if (value != 'NaN') {
                            result[geoId] = value;
                        }
                    }
                });
                setDemographicGeoIdSet(result, key);
            } else {
                setDemographicGeoIdSet({}, '');
                if (layerIndex !== -1) {
                    mapIns.removeLayer(demographicLayer);
                }
            }
        },
    },
});
