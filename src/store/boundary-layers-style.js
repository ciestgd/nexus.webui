import { defineStore } from 'pinia';

export const useBoundaryLayersStyleStore = defineStore('boundaryLayers', {
    state: () => {
        return {
            list: [],
            opacityValue: 75
        };
    },
    actions: {},
});
