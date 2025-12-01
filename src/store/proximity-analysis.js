import { defineStore } from 'pinia';
import { useDrawCircle } from '../libs/proximity-draw';
// import overlayer from '@/libs/map/layers/overlayer';
import { fromCircle } from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle.js';
import * as turf from '@turf/turf';
import { useDataScaleStore } from './data-scale';
import { useDrawerStore } from './drawer';
let layer = useDrawCircle();
export const useProximityAnalysisStore = defineStore('proximityAnalysis', {
    state: () => {
        return {
            name: 'Proximity Analysis',
            // 邻近分析的图层
            layer: layer,
            // 选中的censusTract
            censusTracts: [],
            // 选中的geoId
            selectedGeoId: '',
            // 选中的site
            selectedSite: '',
            // 是否显示
            isShow: false,
            // 邻近分析的半径
            radiusValue: 5,
            // 全部的censusTract
            censusTractsGeoJson: null,
            // 全部的censusTract的RTree
            censusTractsRTree: null,
            // 是否折叠
            isCollapse: true,
            // 与地图交互的类型
            siteType: '',
            // 单选时的数据
            siteData: '',
            // 是否多选
            isShift: false,
            radioValue: 1,
            // 判断是否draw
            isDrawing: false,
            // 判断是否按esc
            isEsc: false,
            // 判断是否主动清除draw
            isClearDraw: false,
            // 默认宽度
            width: '770',
            percentilColor: {
                list: [
                    {
                        label: '80-90th percentile',
                        bgColor: '#ffff00',
                        excelColor: 'ffffff00',
                        min: 80,
                        max: 90,
                    },
                    {
                        label: '90-95th percentile',
                        bgColor: '#ff8c00',
                        excelColor: 'ffff8c00',
                        min: 90,
                        max: 95,
                    },
                    {
                        label: '95-100th percentile',
                        bgColor: '#ff0000',
                        excelColor: 'ffff0000',
                        min: 95,
                        max: 100,
                    },
                ],
                opacity: 100,
                max: 100,
                min: 80,
            },
            summaryTableColor: {
                list: [
                    {
                        label: '80-90th percentile',
                        bgColor: '#ffff00',
                        excelColor: 'ffffff00',
                        key: 'percentile90',
                        min: 80,
                        max: 90,
                    },
                    {
                        label: '90-95th percentile',
                        bgColor: '#ff8c00',
                        excelColor: 'ffff8c00',
                        key: 'percentile95',
                        min: 90,
                        max: 95,
                    },
                    {
                        label: '95-100th percentile',
                        bgColor: '#ff0000',
                        excelColor: 'ffff0000',
                        key: 'percentile100',
                        min: 95,
                        max: 100,
                    },
                ],
                opacity: 100,
                max: 100,
                min: 80,
            },
        };
    },
    actions: {
        handleProximityAnalysisCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        handleProximityAnalysisShow() {
            this.isShow = !this.isShow;
        },
        showProximityAnalysis() {
            if (this.siteType === 'censusTract' && this.selectedGeoId && this.selectedGeoId.length == 11) {
                this.siteData = this.selectedGeoId;
            }
            if (!this.isShow) {
                this.handleProximityAnalysisShow();
            } else {
                if (!this.isCollapse) {
                    this.handleProximityAnalysisCollapse();
                }
            }
            const dataScaleStore = useDataScaleStore();
            if (dataScaleStore.isCountyLevel) {
                dataScaleStore.dataScale = 1;
            }
            const drawerStore = useDrawerStore();
            drawerStore.rtlName = this.name;
        },
        getGeoIdSet(list, geojson, areaRatio) {
            let geoIds = new Set();
            let areaList = [];
            list.forEach((item) => {
                let id = item.properties.id;
                // 将3857的坐标转成4326坐标
                var itemData = turf.toWgs84(item);
                var intersection = turf.intersect(geojson, itemData);
                if (intersection) {
                    // 获取当前censusTract的总面积
                    let totalArea = turf.area(itemData);
                    // 获取交集的面积
                    let intersectionArea = turf.area(intersection);
                    let areaPc = intersectionArea / totalArea;
                    areaList.push({
                        id,
                        areaPc,
                    });
                }
            });
            if (areaList.length === 1) {
                areaList.forEach((item) => {
                    geoIds.add(item.id);
                });
            } else if (areaList.length) {
                let flag = false;
                areaList.forEach((item) => {
                    if (item.areaPc >= areaRatio / 100) {
                        geoIds.add(item.id);
                        flag = true;
                    }
                });
                if (!flag) {
                    areaList.sort((a, b) => b.areaPc - a.areaPc);
                    geoIds.add(areaList[0].id);
                }
            }
            return [...geoIds];
        },
        getGeoIdsByCorcle(options, areaRatio) {
            let geoIdsList = [];
            let geoIdsObjList = [];
            options.forEach((feature) => {
                let circle = feature.getGeometry();
                let id = feature.get('siteId');
                // // 获取圆的polygon
                // const circlePolygon = fromCircle(circle);
                // // 获取元的geojsonData
                // let geojsonData = circlePolygon.getLinearRing().getCoordinates();
                // const geoJsonData = {
                //     type: 'Feature',
                //     geometry: {
                //         type: 'Polygon',
                //         coordinates: [geojsonData],
                //     },
                // };
                // // 将3857的坐标转成4326坐标
                // let circleGeojson = turf.toWgs84(geoJsonData);
                let circleGeojson = this.getCircleGeoJson(circle);
                // // 获取与圆相交的census tract
                let list = this.getIntersectionData(circleGeojson);
                // let list = this.getCircleInterface(circle);
                let geoIdArr = this.getGeoIdSet(list, circleGeojson, areaRatio);
                if (geoIdArr.length) {
                    geoIdsList.push(geoIdArr);
                    geoIdsObjList.push({
                        id,
                        list: geoIdArr,
                    });
                }
            });
            return {
                geoIdsList,
                geoIdsObjList,
            };
        },

        getGeoIds(areaRatio) {
            let options = this.layer.getCircleList();
            let { geoIdsList } = this.getGeoIdsByCorcle(options, areaRatio);
            return geoIdsList;
        },
        getGeoIdsObj(areaRatio) {
            let options = this.layer.getCircleList();
            let { geoIdsObjList } = this.getGeoIdsByCorcle(options, areaRatio);
            return geoIdsObjList;
        },
        getNationGeoId(list, areaRatio, radiusValue) {
            let geoIdList = [];
            let noData = [];
            list.forEach((item) => {
                let reuslt = this.getCircle(item, radiusValue, areaRatio);
                if (reuslt.list.length) {
                    geoIdList.push(reuslt);
                } else {
                    noData.push(reuslt);
                }
            });
            return geoIdList;
        },
        getIntersectionData(polygon) {
            const bbox = turf.bbox(polygon);
            // 查询附近的 census tract
            const intersectedTracts = this.censusTractsRTree
                .search({
                    minX: bbox[0],
                    minY: bbox[1],
                    maxX: bbox[2],
                    maxY: bbox[3],
                })
                .map((item) => item.feature);
            return intersectedTracts;
        },
        getCircleGeoJson(circle) {
            // 获取圆的多边形信息
            const circlePolygon = fromCircle(circle);
            let geojsonData = circlePolygon.getLinearRing().getCoordinates();
            const geoJsonData = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [geojsonData],
                },
            };
            // 将3857的坐标转成4326坐标
            let circleGeojson = turf.toWgs84(geoJsonData);
            return circleGeojson;
        },
        getCircle(item, radiusValue, areaRatio) {
            const center = item.center;
            const radius = radiusValue;
            let geoIdArr = [];
            // 根据坐标点画圆
            let circle = new Circle(center, radius);
            let circleGeojson = this.getCircleGeoJson(circle);
            // 获取与圆有交集的censusTract
            let list = this.getIntersectionData(circleGeojson);
            if (list.length) {
                geoIdArr = this.getGeoIdSet(list, circleGeojson, areaRatio);
            }
            return {
                id: item.id,
                list: geoIdArr,
            };
        },
        handleCensusTractSelect(geoid) {
            this.siteType = 'censusTractsSelect';
            let list = this.censusTracts.find((item) => item);
            console.log(list);
            let index = list.indexOf(geoid);
            if (index === -1) {
                this.censusTracts.push(geoid);
            } else {
                this.censusTracts.splice(index, 1);
            }
        },
    },
});
