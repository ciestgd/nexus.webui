import { defineStore } from 'pinia';

export const useZoomSelectorStore = defineStore('zoomSelector', {
    state: () => {
        return {
            model: [],
            nameList: [],
            isClear: false,
            collapse: true,
            epaRegionList: [],
            stateList: [],
            cbsaList: [],
            countyList: [],
        };
    },
    getters: {
        isZoomIn() {
            return this.model.some((i) => i !== undefined);
        },
        isNotInZoom() {
            const model = this.model;
            if (model[3] !== undefined) {
                return (args) => args[3] !== model[3];
            } else if (model[2] !== undefined) {
                return (args) => args[2] !== model[2];
            } else if (model[1] !== undefined) {
                return (args) => args[1] !== model[1];
            } else if (model[0] !== undefined) {
                return (args) => args[0] !== model[0];
            }
        },
        isInZoom() {
            const model = this.model;
            if (model[3] !== undefined) {
                return (args) => args[3] == model[3];
            } else if (model[2] !== undefined) {
                return (args) => args[2] == model[2];
            } else if (model[1] !== undefined) {
                return (args) => args[1] == model[1];
            } else if (model[0] !== undefined) {
                return (args) => args[0] == model[0];
            }
        },
    },
    actions: {
        getZoomDetail() {
            let districtData = {
                districtType: 'Nation',
                districtGeoId: '',
            };
            if (this.isZoomIn) {
                let model = this.model;
                if (model[3] !== undefined) {
                    districtData.districtType = 'County';
                    districtData.districtGeoId = model[3];
                } else if (model[2] !== undefined) {
                    districtData.districtType = 'Cbsa';
                    districtData.districtGeoId = model[2];
                } else if (model[1] !== undefined) {
                    districtData.districtType = 'State';
                    districtData.districtGeoId = model[1];
                } else if (model[0] !== undefined) {
                    districtData.districtType = 'EpaRegion';
                    districtData.districtGeoId = model[0];
                }
            }
            return districtData;
        },
    },
});
