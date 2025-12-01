import { defineStore } from 'pinia';
import cejstJson from '@/libs/cejst-data.js';
import { getOptions } from '../libs/read-file';
import { useProjectYearStore } from '@/store/project-year';
import { setPm25AreaGeoIdSet, setPm25ArealayerStyle } from '../libs/map/layers/pm25-area-layer';
import { setOzoneAreaGeoIdSet, setOzoneArealayerStyle } from '../libs/map/layers/ozone-area-layer';
import { setAdvanceAreaLayerStyle } from '@/libs/map/layers/advance-area-layer';
import { setClassAreasLayerStyle } from '@/libs/map/layers/class-area-layer';
import { setTribalAreaLayerStyle } from '@/libs/map/layers/tribar-area-layer';
import { setCejstGeoIdSet, setCejstlayerStyle } from '@/libs/map/layers/cejst-layer.js';
export const useAreaLayerStore = defineStore('areaLayer', {
    state: () => {
        return {
            layerList: [
                {
                    id: 'area',
                    label: 'Areas',
                    opacityValue: 75,
                    children: [
                        {
                            id: 'pm25',
                            label: 'PM2.5 Non-attainment Areas',
                            isCheck: true,
                            disabled: false,
                            // color: '#7E229A',
                            color: '#A0263A',
                            year: '',
                            width: 2,
                        },
                        {
                            id: 'o3',
                            label: 'O3 Non-attainment Areas',
                            // color: '#0A189E',
                            color: '#2A8492',
                            isCheck: true,
                            disabled: false,
                            year: '',
                            width: 2,
                        },
                        {
                            id: 'advance',
                            label: 'Advance Areas',
                            color: '#AA000E',
                            isCheck: true,
                            disabled: false,
                            year: '',
                            width: 2,
                        },
                        {
                            id: 'class',
                            label: 'Class I Areas',
                            color: '#735148',
                            isCheck: true,
                            disabled: false,
                            year: '',
                            width: 2,
                        },
                        {
                            id: 'tribal',
                            label: 'Tribal Areas',
                            color: '#A69B29',
                            isCheck: true,
                            disabled: false,
                            year: '',
                            width: 2,
                        },
                        // {
                        //     id: 'cejst',
                        //     label: 'CEJST-Disadvantaged Areas',
                        //     color: '#000',
                        //     isCheck: true,
                        //     disabled: false,
                        //     width: 2,
                        // },
                    ],
                },
            ],
            // 缓存CEJST的geoId
            cejstGeoIds: [],
            areaCheckList: [],
            nonAttainmentData: [],
            // 判断pm25是否被选中
            pm25AreaCheckbox: false,
            // 判断o3是否被选中
            o3AreaCheckbox: false,
            // 判断cejst是否被选中
            cejstAreaCheckbox: false,
            // 判断advance是否被选中
            advanceAreaCheckbox: false,
            // 判断class是否被选中
            classAreaCheckbox: false,
            // 判断tribal是否被选中
            tribalAreaCheckbox: false,
        };
    },
    actions: {
        init() {
            this.areaCheckList = []
            this.handlePM25AreaCheckbox(false)
            this.handleO3AreaCheckbox(false)
            this.handleCEJSTAreaCheckbox(false)
            this.advanceAreaCheckbox = false
            this.classAreaCheckbox = false
            this.tribalAreaCheckbox = false
            this.handleOtherMapChange()
        },
        handleGetLayerColor(id) {
            return this.layerList[0].children.filter((val) => val.id === id)[0];
        },
        handleOtherMapChange() {
            setAdvanceAreaLayerStyle(this.advanceAreaCheckbox);
            setClassAreasLayerStyle(this.classAreaCheckbox);
            setTribalAreaLayerStyle(this.tribalAreaCheckbox);
        },
        handleCEJSTWatcher() {
            if (this.cejstAreaCheckbox) {
                setCejstlayerStyle();
            }
        },
        handleCEJSTAreaCheckbox(checked) {
            this.cejstAreaCheckbox = checked;
            if (this.cejstGeoIds.length === 0) {
                let setArr = new Set(cejstJson);
                this.cejstGeoIds = Array.from(setArr);
            }
            if (checked) {
                setCejstGeoIdSet(this.cejstGeoIds);
            } else {
                setCejstGeoIdSet([]);
            }
        },
        // 处理 缩放监听
        handleZoomWatcher() {
            if (this.pm25AreaCheckbox) {
                setPm25ArealayerStyle();
            }
            if (this.o3AreaCheckbox) {
                setOzoneArealayerStyle();
            }
        },
        handlePM25AreaYearWatcher() {
            if (this.pm25AreaCheckbox) {
                this.handleNonAttainmentData('pm25', true);
            }
        },
        handleO3AreaYearWatcher() {
            if (this.o3AreaCheckbox) {
                this.handleNonAttainmentData('o3', true);
            }
        },
        async handlePM25AreaCheckbox(checked) {
            this.pm25AreaCheckbox = checked;
            await this.handleNonAttainmentData('pm25', checked);
        },
        async handleO3AreaCheckbox(checked) {
            this.o3AreaCheckbox = checked;
            await this.handleNonAttainmentData('o3', checked);
        },
        async handleNonAttainmentData(pollutant, checked) {
            if (this.nonAttainmentData.length === 0) {
                await this.getNonAttainmentData();
            }
            if (checked) {
                let ids = [];
                if (pollutant === 'pm25') {
                    ids = this.getPM25NonAttainmentData();
                    setPm25AreaGeoIdSet(ids);
                } else if (pollutant === 'o3') {
                    ids = this.getO3NonAttainmentData();
                    setOzoneAreaGeoIdSet(ids);
                }
            } else {
                if (pollutant === 'pm25') {
                    setPm25AreaGeoIdSet([]);
                } else if (pollutant === 'o3') {
                    setOzoneAreaGeoIdSet([]);
                }
            }
        },
        async getNonAttainmentData() {
            let { headList, list } = await getOptions('/dataInput/designValue/naa_areas_phistory.csv');
            let pollutants = ['PM-2.5 (2006)', 'PM-2.5 (2012)', '8-Hour Ozone (2008)', '8-Hour Ozone (2015)'];
            let data = list.filter((item) => pollutants.includes(item['pollutant']));
            this.nonAttainmentData = data;
        },
        getCountyId(pollutant, valueLabel) {
            return this.nonAttainmentData
                .filter((item) => item['pollutant'] == pollutant && item[valueLabel])
                .map((item) => {
                    let fips_state = item.fips_state.padStart(2, '0');
                    let fips_cnty = item.fips_cnty.padStart(3, '0');
                    return fips_state + fips_cnty;
                });
        },
        getPM25NonAttainmentData() {
            const projectYearStore = useProjectYearStore();
            let pm25DvYear = projectYearStore.pm25DvYear;
            let pollutantLabel = pm25DvYear <= 2015 ? 'PM-2.5 (2006)' : 'PM-2.5 (2012)';
            let valueLabel = 'pw_' + pm25DvYear;
            return this.getCountyId(pollutantLabel, valueLabel);
        },
        getO3NonAttainmentData() {
            const projectYearStore = useProjectYearStore();
            let o3DvYear = projectYearStore.o3DvYear;
            let pollutantLabel = o3DvYear <= 2017 ? '8-Hour Ozone (2008)' : '8-Hour Ozone (2015)';
            let valueLabel = 'pw_' + o3DvYear;
            return this.getCountyId(pollutantLabel, valueLabel);
        },
    },
});
