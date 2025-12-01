import Worker from '@/libs/worker/data-input-worker.js?worker';
import { getDvData, getDesignateData, getTableList } from './generator.js';
import { useEJReportStore } from '@/store/ejscreen-report';
import { getXlsxOtions } from '@/libs/read-file';
const years = [2018, 2019, 2020];
const fileList = [
    {
        key: '2018',
        path: 'ozone_designvalues_20162018_final_06_28_19.xlsx',
    },
    {
        key: '2019',
        path: 'o3_designvalues_2017_2019_final_05_26_20.xlsx',
    },
];
const ozoneColumns = ref([
    {
        label: 'Ozone',
        prop: '',
        children: [
            {
                label: '8-Hour Ozone (2015) Designated Areas - 70 ppb',
                prop: '',
                children: [
                    {
                        label: 'Area Name',
                        prop: 'name',
                        width: '200',
                    },
                    {
                        label: 'Current Status',
                        prop: 'designationStatus',
                        width: '200',
                    },
                    {
                        label: 'Current Classification',
                        prop: 'classfication',
                        width: '200',
                    },
                    {
                        label: 'Counties',
                        prop: 'county',
                        width: '200',
                    },
                    {
                        label: '2016-2018 DV (ppb)',
                        prop: '2018DV',
                        width: '200',
                    },
                    {
                        label: '2017-2019 DV (ppb)',
                        prop: '2019DV',
                        width: '200',
                    },
                    {
                        label: '2018-2020 DV (ppb)',
                        prop: '2020DV',
                        width: '200',
                    },
                    {
                        label: '2010 Population',
                        prop: 'population',
                        width: '200',
                    },
                    {
                        label: 'Max Cancer Risk (in 1 million)',
                        prop: 'risk',
                        width: '200',
                    },
                ],
            },
        ],
    },
]);
const ozoneTwoColumns = ref([
    {
        label: 'Ozone',
        prop: '',
        children: [
            {
                label: 'County-Level Design Values 2015 8-hr O3 NAAQS Close to Standard (67-70ppb)',
                prop: '',
                children: [
                    {
                        label: 'Area Name',
                        prop: 'name',
                        width: '200',
                    },
                    {
                        label: 'Counties',
                        prop: 'county',
                        width: '200',
                    },
                    {
                        label: '2016-2018 DV (ppb)',
                        prop: '2018DV',
                        width: '200',
                    },
                    {
                        label: '2017-2019 DV (ppb)',
                        prop: '2019DV',
                        width: '200',
                    },
                    {
                        label: '2018-2020 DV (ppb)',
                        prop: '2020DV',
                        width: '200',
                    },
                    {
                        label: '2010 Population',
                        prop: 'population',
                        width: '200',
                    },
                    {
                        label: 'Max Cancer Risk (in 1 million)',
                        prop: 'risk',
                        width: '200',
                    },
                ],
            },
        ],
    },
]);
const worker = new Worker();
const filePath = '/dataInput/designValue/O3/o3_designvalues_2018_2020_final_05_11_21.xlsx';
const sheetDesignatedAreaInfoHr15Ozone = 'Table1a. NAA Status 8hr 2015';
const sheetDesignatedAreaDVHr15Ozone = 'Table3a. NAA Trends 8hr 2015';
const sheetTableCountyState = 'Table4. County Status';
const fileData = reactive({
    type: '',
    tableNames: [],
    data: {
        headList: [],
        list: [],
    },
});
worker.onmessage = (e) => {
    try {
        let result = e.data;
        if (result.state === 200) {
            if (result.type == 'other') {
                let { type, tableNames, headList } = result.data;
                fileData.type = type;
                fileData.tableNames = tableNames;
                fileData.data.headList = headList;
            } else if (result.type == 'list') {
                let arr = result.data;
                fileData.data.list.push(...arr);
            } else if (result.type == 'all') {
                let { type, tableNames, data } = result.data;
                fileData.type = type;
                fileData.tableNames = tableNames;
                fileData.data = data;
            }
        }
        if (result.status === 'end') {
            formatData();
            worker.terminate();
        }
    } finally {
    }
};
const initTable = async (epaRegionValue) => {
    const EjReportStore = useEJReportStore();
    let data = EjReportStore.dicOzoneInfo;
    let list = await getDesignateData(data, '8-Hour Ozone (2015)', epaRegionValue);
    let dvData = EjReportStore.dicOzoneDv;
    let tableData = await getTableList(list, dvData);
    return tableData;
};
const getInfoData = () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let tableList = data[sheetDesignatedAreaInfoHr15Ozone].list.filter((item) => item['Met NAAQS?'] === 'No');
    EjReportStore.dicOzoneInfo = tableList;
};
const getOzoneDvData = () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let tableList = data[sheetDesignatedAreaDVHr15Ozone];
    let tableHeaders = tableList.headList;
    let tableData = tableList.list;
    let dicOzoneDv = getDvData(tableData, tableHeaders);
    EjReportStore.dicOzoneDv = dicOzoneDv;
};
const getCountyStateData = async () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let dataSet = {};
    await getCountyData(data, 2020, dataSet);
    let promiseArr = fileList.map((item) => {
        return getCountyFileData(item.key, item.path, dataSet);
    });
    await Promise.all(promiseArr);
    let list = [];
    for (const id in dataSet) {
        list.push(dataSet[id]);
    }
    EjReportStore.dicO3CountyData = list;
};
const getCountyFileData = (year, path, dataSet) => {
    return new Promise(async (resolve, reject) => {
        let filePath = '/dataInput/designValue/O3/' + path;
        let result = await getXlsxOtions(filePath);
        let data = result.data;
        let tableList = data[sheetTableCountyState];
        let list = tableList.list;
        let headList = tableList.headList;
        let designValueName = '';
        headList.forEach((item) => {
            if (item.includes('Design Value')) {
                designValueName = item;
            }
        });
        list.forEach((item) => {
            let countyId = String(item['County FIPS']);
            let stateId = String(item['State FIPS']);
            if (countyId.length < 3) {
                let len = 3 - countyId.length;
                for (let index = 0; index < len; index++) {
                    countyId = '0' + countyId;
                }
            }
            if (stateId.length < 2) {
                let len = 2 - stateId.length;
                for (let index = 0; index < len; index++) {
                    stateId = '0' + stateId;
                }
            }
            let id = stateId + countyId;
            let designValue = item[designValueName];
            if (dataSet[id]) {
                dataSet[id].dicO3Values[year] = designValue;
            }
        });

        resolve(dataSet);
    });
};
const getCountyData = (data, year, dataSet) => {
    return new Promise((resolve, reject) => {
        let tableList = data[sheetTableCountyState];
        let list = tableList.list;
        let headList = tableList.headList;
        let designValueName = '';
        headList.forEach((item) => {
            if (item.includes('Design Value')) {
                designValueName = item;
            }
        });

        list.forEach((item) => {
            let countyId = String(item['County FIPS']);
            let stateId = String(item['State FIPS']);
            if (countyId.length < 3) {
                let len = 3 - countyId.length;
                for (let index = 0; index < len; index++) {
                    countyId = '0' + countyId;
                }
            }

            if (stateId.length < 2) {
                let len = 2 - stateId.length;
                for (let index = 0; index < len; index++) {
                    stateId = '0' + stateId;
                }
            }
            let id = stateId + countyId;
            let designValue = item[designValueName];
            let meetnaaqsValue = item['Meets NAAQS?'] ? item['Meets NAAQS?'] == 'Yes' : false;
            if (!dataSet[id]) {
                let info = {
                    FIPS: id,
                    STATE: item['State Name'],
                    EPARegion: item['EPA Region'],
                    COUNTY: item['County Name'],
                    AQSSiteId: item['AQS Site ID'],
                    CBSAName1: item['CBSA Name'],
                    MeetNAAQS: meetnaaqsValue,
                    dicO3Values: {},
                };
                info.dicO3Values[year] = designValue;
                dataSet[id] = info;
            }
            // else {
            //     dataSet[id].dicO3Values[year] = designValue;
            //     // dataSet[id].MeetNAAQS = meetnaaqsValue;
            // }
        });
        resolve(dataSet);
    });
};
const initCountyTable = async (epaRegionValue) => {
    const EjReportStore = useEJReportStore();
    let desiredCBSAs = getCBSAs(2020, epaRegionValue);
    let dicCBSA2DVCounties = Object.assign({}, EjReportStore.dicCountyInfo);
    let dicO3CountyData = EjReportStore.dicO3CountyData;
    let list = [];
    for (let index = 0; index < desiredCBSAs.length; index++) {
        const item = desiredCBSAs[index];
        if (!dicCBSA2DVCounties[item]) {
            continue;
        }
        let counties = dicCBSA2DVCounties[item] || [];
        let obj = {
            AreaName: item,
            counties: [],
        };
        counties.forEach((county) => {
            let countyObj = {
                ...county
            }
            let id = county['FIPS'];
            let countyInfo = dicO3CountyData.filter((info) => info['FIPS'] == id);
            if (countyInfo.length) {
                countyObj.areaData = countyInfo[0].dicO3Values;
            }
            obj.counties.push(countyObj)
        });
        list.push(obj);
    }
    let tableList = await getCountyTableList(list);
    return tableList;
};
const getCountyTableList = (list) => {
    let tableList = [];
    return new Promise((resolve, reject) => {
        list.forEach((item) => {
            let dataList = [];
            let obj = {
                name: item.AreaName,
                county: '',
                population: '',
                risk: '',
            };
            if (item && item.counties && item.counties.length) {
                item.counties.forEach((county) => {
                    let countyObj = {
                        name: '',
                        county: county.Name,
                        population: county.Population,
                        risk: county.MaxCancerRisk,
                    };
                    if (county.areaData) {
                        years.forEach((year) => {
                            countyObj[year + 'DV'] = county.areaData[year] ? Number(county.areaData[year]) * 1000 : '';
                        });
                    }
                    dataList.push(countyObj);
                });
            }
            dataList.unshift(obj);
            tableList.push(...dataList);
        });
        resolve(tableList);
    });
};

const getCBSAs = (year, epaRegionValue, standardValue = 0.066) => {
    const EjReportStore = useEJReportStore();
    let list = EjReportStore.dicO3CountyData || [];
    let arr = list
        .filter((item) => item.dicO3Values[year] > standardValue && item.EPARegion == epaRegionValue)
        .map((item) => item.CBSAName1)
        .filter((item) => item);
    let setArr = new Set(arr);
    return [...setArr];
};
const formatData = async () => {
    getInfoData();
    getOzoneDvData();
    getCountyStateData();
};
const getTableColumns = (type) => {
    return type == 'tableOne' ? ozoneColumns.value : ozoneTwoColumns.value;
};
const initData = () => {
    const EjReportStore = useEJReportStore();
    if (!EjReportStore.dicOzoneInfo) {
        worker.postMessage(filePath);
    }
};
export default {
    initData,
    initTable,
    initCountyTable,
    getTableColumns,
};
