import { defineStore } from 'pinia';
import { useDrawerStore } from './drawer';
export const useEJReportStore = defineStore('EJSCREENReport', {
    state: () => {
        return {
            name: 'EJSCREEN Report',
            // 判断是否折叠
            collapse: true,
            // 判断是否显示
            isShow: false,
            //判断当前选中的是哪个tab
            selectType: 'county',
            // 选中的censusTract
            censusTractList: [],
            // 选中的county
            countyList: [],
            // 选中的cbsa
            cbsaList: [],
            // 是否正在绘制
            isDrawing: false,
            // 是否退出绘制
            isEsc: false,
            countyAllData: {},
            // epa table population
            dicPop: null,
            // epa table epa region data
            dicEpa: null,
            // epa table max risk data
            dicMaxRisk: null,
            // nayro.xlsx table data
            dtNayro: [],
            // epa table O3 info data
            dicOzoneInfo: null,
            // epa table O3 dv data
            dicOzoneDv: null,
            //
            dicAnnualInfo: null,
            dicAnnualDv: null,
            dicHr6Info: null,
            dicHr6Dv: null,
            dicCbsaList: null,
            dicO3CountyData: null,
            dicO3CountyInfo: null,
            dicPM25CountyData: null,
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
        handleEJReportCollapse() {
            this.collapse = !this.collapse;
        },
        handleEJReportShow() {
            this.isShow = !this.isShow;
        },
        handleCBSASelect(geoid, name) {
            if (this.isShow && this.selectType === 'cbsa') {
                let item = this.cbsaList.find((item) => item.geoId == geoid);
                if (!item) {
                    this.cbsaList.push({
                        geoId: geoid,
                        name,
                    });
                }
            }
        },
        handleCensusTractSelect(geoid) {
            if (this.isShow && this.selectType === 'censusTract') {
                let item = this.censusTractList.find((item) => item.geoId == geoid);
                if (!item) {
                    this.censusTractList.push({
                        geoId: geoid,
                        name: geoid,
                    });
                }
            }
        },
        handleCountySelect(geoid, name) {
            if (this.isShow && this.selectType === 'county') {
                let item = this.countyList.find((item) => item.geoId == geoid);
                if (!item) {
                    this.countyList.push({
                        geoId: geoid,
                        name,
                    });
                }
            }
        },
        showEJReport() {
            if (!this.isShow) {
                this.handleEJReportShow();
            } else {
                if (!this.isCollapse) {
                    this.handleEJReportCollapse();
                }
            }
            const drawerStore = useDrawerStore();
            drawerStore.rtlName = this.name;
        },
    },
});
