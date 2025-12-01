import { defineStore } from 'pinia';
import { useMapPoints } from '../libs/map-point';
import { useDrawerStore } from './drawer';
import { useProximityAnalysisStore } from './proximity-analysis';
import { useMonitorSiteStore } from './monitor-site';
import { useSidebarStore } from './sidebar';
import { mapManager } from '@/libs/map/map-manager.js';
let layer = useMapPoints();
export const useMajorEissionStore = defineStore('majorEissionSources', {
    state: () => {
        return {
            name: 'Emission Sources',
            layer: layer,
            type: 'NOx',
            // 判断当前模块
            dataType: 'marjorEission',
            toxType: 'NOx',
            // 当前选中的id
            selectId: null,
            // 判断是否显示
            isShow: false,
            // 判断是否折叠
            isCollapse: true,
            // shift 加点击选中的点
            siteSelectList: [],
            // 被标记的点颜色
            colorList: {},
            width: '400',
            sectorGroupEmissionData: {},
        };
    },
    actions: {
        handleMarjorShow() {
            this.isShow = !this.isShow;
        },
        handleMarjorEissionCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        clearMajorData() {
            this.type = null;
            this.toxType = null;
            this.siteSelectList = [];
            this.layer.clearMap();
        },
        showMarjor() {
            if (!this.isShow) {
                this.handleMarjorShow();
            } else {
                if (!this.isCollapse) {
                    this.handleMarjorEissionCollapse();
                }
            }
            const drawerStore = useDrawerStore();
            drawerStore.rtlName = this.name;
        },
        clearOtherLayer() {
            const mapIns = mapManager.getMapIns();
            const monitorSiteStore = useMonitorSiteStore();
            let monitorLayer = monitorSiteStore.layer.getLocalLayer();
            if (monitorLayer) {
                mapIns.removeLayer(monitorLayer);
            }
        },
        getSelectData(val) {
            const formatSelectData = (data) => {
                let labelList = [
                    {
                        label: 'FIPS',
                        value: 'countyGeoId',
                    },
                    {
                        label: 'STATE',
                        value: 'stateAbbrName',
                    },
                    {
                        label: 'COUNTY',
                        value: 'countyName',
                    },
                    {
                        label: 'Site Name',
                        value: 'siteName',
                    },
                    {
                        label: 'Facility',
                        value: 'facilityId',
                    },
                    {
                        label: 'Desciption',
                        value: 'facilitySourceType',
                    },
                    {
                        label: 'EPA Region',
                        value: 'epaRegionId',
                    },
                    {
                        label: 'NOx(TPY)',
                        value: 'nox',
                    },
                    {
                        label: 'VOC(TPY)',
                        value: 'voc',
                    },
                    {
                        label: 'SO2(TPY)',
                        value: 'so2',
                    },
                    {
                        label: 'CO2e(TPY)',
                        value: 'co2e',
                    },
                    {
                        label: 'PM2.5(TPY)',
                        value: 'pm25',
                    },
                    {
                        label: 'PM10(TPY)',
                        value: 'pm10',
                    },
                    {
                        label: 'Lead(LB)',
                        value: 'lead',
                    },
                    {
                        label: 'CO(TPY)',
                        value: 'co',
                    },
                    {
                        label: 'NH3(TPY)',
                        value: 'nh3',
                    },
                    {
                        label: 'Gas VOC HAPs (LB)',
                        value: 'gas_voc_haps',
                    },
                    {
                        label: 'Diesel PM (TONS)',
                        value: 'diesel_pm_haps',
                    },
                    {
                        label: 'Metal HAPs (LB)',
                        value: 'heavy_metal_haps',
                    },
                ];
                const array = [];
                let fomatList = ['nox', 'voc', 'so2', 'co2e', 'pm25', 'pm10', 'lead', 'co', 'nh3', 'gas_voc_haps', 'diesel_pm_haps', 'heavy_metal_haps'];
                labelList.forEach((item) => {
                    let obj = {};
                    obj.type = item.label;
                    let value = data[item.value];
                    if (fomatList.indexOf(item.value) !== -1 && value) {
                        value = Math.floor(value * 100) / 100;
                    }
                    obj.value = value;
                    array.push(obj);
                });
                return array;
            };
            const sidebarStore = useSidebarStore();
            sidebarStore.infoData = formatSelectData(val);
            sidebarStore.infoType = 'majorSelectData';
        },
        setFeature(featureItem, data) {
            featureItem.set('facilityId', data.facilityId);
            featureItem.set('siteName', data.siteName);
            featureItem.set('siteLon', data.siteLon);
            featureItem.set('siteLat', data.siteLat);
            featureItem.set('ranking', data.ranking);
            featureItem.set('value', data.value);
            featureItem.set('sectorProjectGroup', data.sectorProjectGroup);
            featureItem.set('baseData', data.baseData);
            return featureItem;
        },
        onMapClickFn(event) {
            const proximityAnalysisStore = useProximityAnalysisStore();
            let majorPointsLayer = this.layer.getPointsLayer();
            let majorLocalLayer = this.layer.getLocalLayer();
            event.map.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
                let featureData = feature.getProperties();
                let id = featureData.facilityId || '';
                if (!id || (layer !== majorPointsLayer && layer !== majorLocalLayer)) {
                    return true;
                }
                if (proximityAnalysisStore.isShift) {
                    proximityAnalysisStore.siteType = 'multiSelect';
                    let list = this.siteSelectList.map((item) => item.facilityId);
                    let index = list.indexOf(id);
                    if (index === -1) {
                        this.siteSelectList.push(featureData);
                    } else {
                        this.siteSelectList.splice(index, 1);
                    }
                    this.layer.setOneMapIcon(
                        this.siteSelectList.map((item) => item),
                        this.setFeature,
                        true
                    );
                    return true;
                }
                this.clearOtherLayer();
                if (this.siteSelectList.length) {
                    this.siteSelectList = [];
                }
                this.selectId = id;
                // console.log('featureData', featureData)
                let { baseData, facilityId, sectorProjectGroup } = featureData;
                proximityAnalysisStore.siteType = 'facility';
                proximityAnalysisStore.selectedSite = sectorProjectGroup + ':' + facilityId;
                this.layer.setOneMapIcon([featureData], this.setFeature, proximityAnalysisStore.isShow);
                this.getSelectData(JSON.parse(baseData));
            });
        },
        onMapDBClick(event) {
            const proximityAnalysisStore = useProximityAnalysisStore();
            let majorPonitsLayer = this.layer.getPointsLayer();
            let majorLocalLayer = this.layer.getLocalLayer();
            event.map.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
                let isMajorLayer = (majorPonitsLayer && layer === majorPonitsLayer) || (majorLocalLayer && layer === majorLocalLayer);
                if (isMajorLayer) {
                    event.stopPropagation();
                    let featureData = feature.getProperties();
                    proximityAnalysisStore.showProximityAnalysis();
                    proximityAnalysisStore.siteType = 'facility';
                    proximityAnalysisStore.siteData = featureData.sectorProjectGroup + ':' + featureData.facilityId;
                }
            });
        },
    },
});
