import { useAdvancedOptionStore } from '../store/advanced-option';
import { useProjectYearStore } from '../store/project-year';
import { useZoomSelectorStore } from '../store/zoom-selector';
import { useAreaLayerStore } from '../store/area-layer';
import { useMortalityLayerStore } from '../store/mortality-layer';
import { useCancerRiskLayerStore } from '../store/cancer-risk-layer';
import { useMorbidityLayerStore } from '../store/morbidity-layer';
import { useConcentrationLayerStore } from '../store/concentration-layer';
import { useIndicatorsLayerStore } from '../store/indicators-layer';
import { useClimateLayerStore } from '../store/climate-layer';
export const setupWatchers = () => {
    const advancedOptionStore = useAdvancedOptionStore();
    const projectYearStore = useProjectYearStore();
    const zoomSelectorStore = useZoomSelectorStore();
    const areaLayerStore = useAreaLayerStore();
    const mortalityLayerStore = useMortalityLayerStore();
    const cancerRiskLayerStore = useCancerRiskLayerStore();
    const morbidityLayerStore = useMorbidityLayerStore();
    const concentrationLayerStore = useConcentrationLayerStore();
    const indicatorsLayerStore = useIndicatorsLayerStore();
    const climateLayerStore = useClimateLayerStore();
    // 监听默认配置变化
    watch(
        () => advancedOptionStore.option,
        (value) => {
            advancedOptionStore.handleMapChange();
        },
        {
            deep: true,
        }
    );
    // 监听缩放
    watch(
        () => zoomSelectorStore.model,
        () => {
            areaLayerStore.handleZoomWatcher();
            areaLayerStore.handleCEJSTWatcher();
            mortalityLayerStore.handleWatcher();
            cancerRiskLayerStore.handleWatcher();
            morbidityLayerStore.handleWatcher();
            concentrationLayerStore.handleWatcher();
            indicatorsLayerStore.handleWatcher();
            climateLayerStore.handleWatcher();
        }
    );

    watch(
        () => projectYearStore.pm25DvYear,
        () => {
            areaLayerStore.handlePM25AreaYearWatcher();
        }
    );
    watch(
        () => projectYearStore.o3DvYear,
        () => {
            areaLayerStore.handleO3AreaYearWatcher();
        }
    );

    watch(
        () => projectYearStore.projectYear,
        () => {
            mortalityLayerStore.handleLayerChange();
            cancerRiskLayerStore.handleLayerChange();
            morbidityLayerStore.handleLayerChange();
            concentrationLayerStore.handleLayerChange();
            indicatorsLayerStore.handleLayerChange();
        }
    );
};
