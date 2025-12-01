import { defineStore } from 'pinia';
import { useMapPoints } from '../libs/map-point';
import { useDrawerStore } from './drawer';
import { useProximityAnalysisStore } from './proximity-analysis';
import { useMajorEissionStore } from './major-eission-sources';
import { useSidebarStore } from './sidebar';
import { getMonitorSelectData, getMonitorSiteInfoById } from '@/api/monitor-data.js';
import Trends from '@/components/MonitorSites/Trends.vue';
import { showDialog } from '@/libs/utils';
import { mapManager } from '@/libs/map/map-manager.js';
let layer = useMapPoints();
export const useMonitorSiteStore = defineStore('monitorSite', {
    state: () => {
        return {
            name: 'Monitor Sites',
            layer: layer,
            type: 'PM25',
            selectId: null,
            isShow: false,
            isCollapse: true,
            siteSelectList: [],
            // 被标记的点颜色
            colorList: {},
            width: '400',
            selectContentData: null,
            dataType: 'MonitorSites',
        };
    },
    actions: {
        handleShow() {
            this.isShow = !this.isShow;
        },
        handleMonitorSiteCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        clearMonitorData() {
            this.type = null;
            this.layer.clearMap();
        },
        showMonitorSite() {
            if (!this.isShow) {
                this.handleShow();
            } else {
                if (!this.isCollapse) {
                    this.handleMonitorSiteCollapse();
                }
            }
            const drawerStore = useDrawerStore();
            drawerStore.rtlName = this.name;
        },
        clearOtherLayer() {
            const mapIns = mapManager.getMapIns();
            const majorEissionStore = useMajorEissionStore();
            let majorPointLayer = majorEissionStore.layer.getLocalLayer();
            if (majorPointLayer) {
                mapIns.removeLayer(majorPointLayer);
            }
        },
        formatSelectData(data) {
            let array = [];
            let { siteId, siteName, countyName, stateName, epaRegionId, values, pollutant, pollutantType } = data;
            array.push({ type: 'Site ID', value: siteId });
            array.push({ type: 'Site Name', value: siteName });
            array.push({ type: 'COUNTY', value: countyName });
            array.push({ type: 'STATE', value: stateName });
            array.push({ type: 'EPA Region', value: epaRegionId });
            Object.keys(values).forEach((year) => {
                let value = Math.round(values[year] * 100) / 100;
                let label = '';
                let pollutantName = '';
                if (pollutant === 'AirToxic') {
                    if (pollutantType === 'gas_VOC_HAPs') {
                        pollutantName = 'Gas & VOC HAPs';
                    } else if (pollutantType === 'heavy_Metal_HAPs') {
                        pollutantName = 'Heavy Metal HAPs';
                    } else {
                        pollutantName = pollutantType;
                    }
                } else {
                    pollutantName = pollutant;
                }
                label = pollutantName + '_' + year;
                array.push({ type: label, value: value });
            });
            return array;
        },
        async getSelectData(siteId, type, pollutantType) {
            const sidebarStore = useSidebarStore();
            let result = await getMonitorSelectData(type, siteId, pollutantType);
            let detailResult = await getMonitorSiteInfoById(siteId);
            result.pollutant = type;
            result.pollutantType = pollutantType;
            result.measurementScale = detailResult.measurementScale;
            sidebarStore.infoType = 'monitorSite';
            sidebarStore.infoData = this.formatSelectData(result);
            this.selectContentData = result;
        },
        setFeatureFn(featureItem, data) {
            featureItem.set('siteId', data.siteId);
            featureItem.set('siteName', data.siteName);
            featureItem.set('siteLon', data.siteLon);
            featureItem.set('siteLat', data.siteLat);
            featureItem.set('type', data.type);
            featureItem.set('ranking', data.ranking);
            featureItem.set('pollutantType', data.pollutantType || '');
            featureItem.set('value', data.value);
            featureItem.set('basePollutantType', data.basePollutantType);
            return featureItem;
        },
        onMapClickFn(event) {
            const proximityAnalysisStore = useProximityAnalysisStore();
            let monitorPointsLayer = this.layer.getPointsLayer();
            let monitorLocalLayer = this.layer.getLocalLayer();
            event.map.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
                let featureData = feature.getProperties();
                let id = featureData.siteId || '';
                if (!id || (layer !== monitorLocalLayer && layer !== monitorPointsLayer)) {
                    return true;
                }

                if (proximityAnalysisStore.isShift) {
                    proximityAnalysisStore.siteType = 'multiSelect';
                    let list = this.siteSelectList.map((item) => item.siteId);
                    let index = list.indexOf(id);
                    if (index === -1) {
                        this.siteSelectList.push(featureData);
                    } else {
                        this.siteSelectList.splice(index, 1);
                    }
                    this.layer.setOneMapIcon(
                        this.siteSelectList.map((item) => item),
                        this.setFeatureFn,
                        true
                    );
                    return true;
                }
                this.clearOtherLayer();
                if (this.siteSelectList.length) {
                    this.siteSelectList = [];
                }
                this.selectId = id;
                let { siteId, type, pollutantType, basePollutantType } = featureData;
                let selectType = basePollutantType;
                proximityAnalysisStore.siteType = 'monitor';
                proximityAnalysisStore.selectedSite = selectType + ':' + siteId;
                this.layer.setOneMapIcon([featureData], this.setFeatureFn, proximityAnalysisStore.isShow);

                await this.getSelectData(id, type, pollutantType);
                let { clientX, clientY } = event.originalEvent;
                showDialog(Trends, {
                    data: this.selectContentData,
                    pointLocation: [clientX, clientY],
                });
            });
        },
        onMapDBClick(event) {
            let monitorPointsLayer = this.layer.getPointsLayer();
            let monitorLocalLayer = this.layer.getLocalLayer();
            const proximityAnalysisStore = useProximityAnalysisStore();
            event.map.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
                let isMonitorLayer = (monitorPointsLayer && layer === monitorPointsLayer) || (monitorLocalLayer && layer === monitorLocalLayer);
                if (isMonitorLayer) {
                    event.stopPropagation();
                    let featureData = feature.getProperties();
                    proximityAnalysisStore.showProximityAnalysis();
                    proximityAnalysisStore.siteType = 'monitor';
                    let type = featureData.basePollutantType;
                    proximityAnalysisStore.siteData = type + ':' + featureData.siteId;
                }
            });
        },
    },
});
