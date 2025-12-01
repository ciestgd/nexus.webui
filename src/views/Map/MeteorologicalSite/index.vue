<template></template>
<script setup>
import { useMeteorologicalSite } from '@/store/meteorological-site.js';
import { useZoomSelectorStore } from '@/store/zoom-selector';
import { mapManager } from '../../../libs/map/map-manager';
import { showDialog } from '@/libs/utils';
import WindRose from './WindRose.vue';
const meteorologicalSite = useMeteorologicalSite();
const zoomSelectorStore = useZoomSelectorStore();
const options = ref([]);
onMounted(() => {
    nextTick(onMapClick);
});
watch(
    () => meteorologicalSite.isShow,
    (val) => {
        if (val) {
            showMeteorologicalSite();
        }
    }
);
watch(
    () => zoomSelectorStore.model,
    () => {
        if (meteorologicalSite.isShow) {
            showMeteorologicalSite();
        }
    },
    {
        deep: true,
    }
);
const showMeteorologicalSite = async () => {
    let { showMapLayer } = meteorologicalSite.layer;
    if (!options.value.length) {
        await meteorologicalSite.getOptions();
        options.value = meteorologicalSite.options;
    }
    let result = options.value;
    if (zoomSelectorStore.isZoomIn) {
        const isInZoom = zoomSelectorStore.isInZoom;
        if (isInZoom) {
            result = result.filter((item) => {
                let epaId = item.EPA_Region_ID;
                epaId = epaId.length == 1 ? '0' + epaId : epaId;
                let stateId = item.State_GeoID;
                stateId = stateId.length == 1 ? '0' + stateId : stateId;
                let countyId = item.County_GeoID;
                countyId = countyId.length == 4 ? '0' + countyId : countyId;
                const args = [epaId, stateId, item.CBSA_GeoID, countyId];
                return isInZoom(args);
            });
        }
    }
    showMapLayer(result);
};
const showWindChart = async (name,stationName, point) => {
    await meteorologicalSite.getWindRoseData(name, stationName);
    showDialog(WindRose, {
        pointLocation: point,
    });
};
const onMapClick = () => {
    const mapIns = mapManager.getMapIns();
    mapIns.on('click', (event) => {
        event.map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
            let stationID = feature.get('StationID');
            let stationName = feature.get('StationName');
            if (!stationID) {
                return false;
            }
            let { clientX, clientY } = event.originalEvent;
            showWindChart(stationID,stationName, [clientX, clientY]);
            return true;
        });
    });
    mapIns.on('dblclick', (event) => {
        let meteorologicalPointsLayer = meteorologicalSite.layer.getPointsLayer();
        event.map.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
            let isMeteorlogicalLayer = meteorologicalPointsLayer && layer === meteorologicalPointsLayer;
            if (isMeteorlogicalLayer) {
                event.stopPropagation();
            }
        });
    });
};
</script>
