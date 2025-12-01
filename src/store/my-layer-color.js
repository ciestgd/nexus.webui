import { defineStore } from 'pinia';
import { useLegendColorStore } from './legend-color';
import { useAreaLayerStore } from './area-layer';
import { useMortalityLayerStore } from './mortality-layer';
import { useMorbidityLayerStore } from './morbidity-layer';
import { useCancerRiskLayerStore } from './cancer-risk-layer';
import { useConcentrationLayerStore } from './concentration-layer';
import { useIndicatorsLayerStore } from './indicators-layer';
import { useClimateLayerStore } from './climate-layer';

export const useMyLayerColorStore = defineStore('myLayerColor', {
    state: () => {
        return {
            climateRiskIndicatorId: null,
            isResetLayer: false,
            activeLayerId: '',
        };
    },
    getters: {},
    actions: {
        handleResetMapLayer() {
            useLegendColorStore().init();
            useAreaLayerStore().init();
            useMortalityLayerStore().init();
            useCancerRiskLayerStore().init();
            useMorbidityLayerStore().init();
            useConcentrationLayerStore().init();
            useIndicatorsLayerStore().init();
            useClimateLayerStore().init();
        },
    },
});
