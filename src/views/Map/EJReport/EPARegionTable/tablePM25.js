import Worker from '@/libs/worker/data-input-worker.js?worker';
import { getDvData, getDesignateData, getTableList } from './generator.js';
import { useEJReportStore } from '@/store/ejscreen-report';
import { getXlsxOtions } from '@/libs/read-file';
const worker = new Worker();
const filePath = '/dataInput/designValue/PM25/pm25_designvalues_2018_2020_final_05_24_21.xlsx';
const sheetDesignatedAreaInfoAnn12PM = 'Table1a. NAA Status Ann 2012';
const sheetDesignatedAreaDVAnn12PM = 'Table3a. NAA Trends Ann 2012';

const sheetDesignatedAreaInfoHr06PM = 'Table1b. NAA Status 24hr 2006';
const sheetDesignatedAreaDVHr06PM = 'Table3b. NAA Trends 24hr 2006';
const years = [2018, 2019, 2020];
const fileList = [
    {
        key: '2018',
        path: 'pm25_designvalues_20162018_final_12_03_19.xlsx',
    },
    {
        key: '2019',
        path: 'pm25_designvalues_2017_2019_final_05_26_20.xlsx',
    },
];
const annualColumns = ref([
    {
        label: 'PM2.5',
        prop: '',
        children: [
            {
                label: 'Annual PM2.5 (2012) Designated Areas - 12 ug/m3',
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
                    // {
                    //     label: 'Current Classification',
                    //     prop: 'classfication',
                    //     width: '200',
                    // },
                    {
                        label: 'Counties',
                        prop: 'county',
                        width: '200',
                    },
                    {
                        label: '2016-2018 DV (ug/m3)',
                        prop: '2018DV',
                        width: '200',
                    },
                    {
                        label: '2017-2019 DV (ug/m3)',
                        prop: '2019DV',
                        width: '200',
                    },
                    {
                        label: '2018-2020 DV (ug/m3)',
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
const annualCountyColumns = ref([
    {
        label: 'PM2.5',
        prop: '',
        children: [
            {
                label: 'County-Level Design Values for 2012 Annual PM2.5 NAAQS close to the standard (10-12ug/m3)',
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
                        label: '2016-2018 DV (ug/m3)',
                        prop: '2018DV',
                        width: '200',
                    },
                    {
                        label: '2017-2019 DV (ug/m3)',
                        prop: '2019DV',
                        width: '200',
                    },
                    {
                        label: '2018-2020 DV (ug/m3)',
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
const pm25Hr6Columns = ref([
    {
        label: 'PM2.5',
        prop: '',
        children: [
            {
                label: '24-Hour PM2.5 (2006) Designated Areas - 35 ug/m3',
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
                    // {
                    //     label: 'Current Classification',
                    //     prop: 'classfication',
                    //     width: '200',
                    // },
                    {
                        label: 'Counties',
                        prop: 'county',
                        width: '200',
                    },
                    {
                        label: '2016-2018 DV (ug/m3)',
                        prop: '2018DV',
                        width: '200',
                    },
                    {
                        label: '2017-2019 DV (ug/m3)',
                        prop: '2019DV',
                        width: '200',
                    },
                    {
                        label: '2018-2020 DV (ug/m3)',
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
const pm25Hr6CountyColumns = ref([
    {
        label: 'PM2.5',
        prop: '',
        children: [
            {
                label: 'County-Level Design Value for 2006 24-Hour PM2.5 NAAQS Close to the Standard(30-35 ug/m3)',
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
                        label: '2016-2018 DV (ug/m3)',
                        prop: '2018DV',
                        width: '200',
                    },
                    {
                        label: '2017-2019 DV (ug/m3)',
                        prop: '2019DV',
                        width: '200',
                    },
                    {
                        label: '2018-2020 DV (ug/m3)',
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
const initAnnualTable = async (epaRegionValue) => {
    const EjReportStore = useEJReportStore();
    let data = EjReportStore.dicAnnualInfo;
    let list = await getDesignateData(data, 'PM-2.5 (2012)', epaRegionValue);
    let dvData = EjReportStore.dicAnnualDv;
    let tableData = await getTableList(list, dvData, 'pm25');
    return tableData;
};
const initAnnualCountyTable = async (epaRegionValue) => {
    let list = await initCountyTable(epaRegionValue, 'annual');
    let tableList = await getCountyTableList(list);
    return tableList;
};

const initHr06CountyTable = async (epaRegionValue) => {
    let list = await initCountyTable(epaRegionValue, 'hr06');
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
                            countyObj[year + 'DV'] = county.areaData[year] ? Number(county.areaData[year]) : '';
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
const initCountyTable = async (epaRegionValue, type = 'annual') => {
    const EjReportStore = useEJReportStore();
    let desiredCBSAs = type == 'annual' ? getCBSAsAnnual(2020, epaRegionValue) : getCBSAsHr06(2020, epaRegionValue);
    let dicCBSA2DVCounties = Object.assign({}, EjReportStore.dicCountyInfo);
    let dicPM25CountyData = EjReportStore.dicPM25CountyData;
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
            let id = county['FIPS'];
            let countyInfo = dicPM25CountyData.filter((info) => info['FIPS'] == id);
            let countyObj = { ...county };
            if (countyInfo.length) {
                let desingValue = type === 'annual' ? countyInfo[0].dicAnnualValues : countyInfo[0].dicHr06Values;
                countyObj.areaData = desingValue;
            }
            obj.counties.push(countyObj);
        });
        list.push(obj);
    }
    return list;
};
const initHr6Table = async (epaRegionValue) => {
    const EjReportStore = useEJReportStore();
    let data = EjReportStore.dicHr6Info;
    let list = await getDesignateData(data, 'PM-2.5 (2006)', epaRegionValue);
    let dvData = EjReportStore.dicHr6Dv;
    let tableData = await getTableList(list, dvData, 'pm25');
    return tableData;
};
const getAnnualInfoData = () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let tableList = data[sheetDesignatedAreaInfoAnn12PM].list.filter((item) => item['Met NAAQS?'] === 'No');
    EjReportStore.dicAnnualInfo = tableList;
};
const getAnnualDvData = () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let tableList = data[sheetDesignatedAreaDVAnn12PM];
    let tableHeaders = tableList.headList;
    let tableData = tableList.list;
    let dicAnnualDv = getDvData(tableData, tableHeaders);
    EjReportStore.dicAnnualDv = dicAnnualDv;
};
const getCountyStateData = async () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let dataSet = {};
    await getCountyAnnualData(data, 2020, dataSet, true);
    await getCountyHr06Data(data, 2020, dataSet);
    let promiseArr = fileList.map((item) => {
        return getCountyFileData(item.key, item.path, dataSet);
    });
    await Promise.all(promiseArr);
    let list = [];
    for (const id in dataSet) {
        list.push(dataSet[id]);
    }
    EjReportStore.dicPM25CountyData = list;
};

const getCBSAsAnnual = (year, epaRegionValue, standardValue = 10) => {
    const EjReportStore = useEJReportStore();
    let list = EjReportStore.dicPM25CountyData || [];
    let arr = list
        .filter((item) => item.dicAnnualValues[year] > standardValue && item.EPARegion == epaRegionValue)
        .map((item) => item.CBSAName1)
        .filter((item) => item && item != ' ');
    let setArr = new Set(arr);
    return [...setArr];
};
const getCBSAsHr06 = (year, epaRegionValue, standardValue = 30) => {
    const EjReportStore = useEJReportStore();
    let list = EjReportStore.dicPM25CountyData || [];
    let arr = list
        .filter((item) => item.dicHr06Values[year] > standardValue && item.EPARegion == epaRegionValue)
        .map((item) => item.CBSAName1)
        .filter((item) => item && item != ' ');
    let setArr = new Set(arr);
    return [...setArr];
};

const getCountyFileData = (year, path, dataSet) => {
    return new Promise(async (resolve, reject) => {
        let filePath = '/dataInput/designValue/PM25/' + path;
        let result = await getXlsxOtions(filePath);
        let data = result.data;
        if (year == 2019) {
            await getCountyAnnualData(data, year, dataSet);
            await getCountyHr06Data(data, year, dataSet);
        } else {
            let tableList = data['Table 4, County Summary'];
            let list = tableList.list;
            let headList = tableList.headList;
            let designValueAnnualName = '';
            let designValueHr06Name = '';
            headList.forEach((item) => {
                if (item.includes('Design Value')) {
                    if (item.includes('Annual')) {
                        designValueAnnualName = item;
                    } else {
                        designValueHr06Name = item;
                    }
                }
            });
            list.forEach((item) => {
                let countyId = item['County FIPS'];
                let stateId = item['State FIPS'];
                let id = getFipsId(stateId, countyId);
                let designValueAnnual = item[designValueAnnualName];
                let designValueHr06 = item[designValueHr06Name];
                if (dataSet[id]) {
                    dataSet[id].dicAnnualValues[year] = designValueAnnual;
                    dataSet[id].dicHr06Values[year] = designValueHr06;
                }
            });
        }
        resolve(dataSet);
    });
};
const getCountyAnnualData = (data, year, dataSet, initData = false) => {
    return new Promise((resolve, reject) => {
        let tableList = data['Table4a. County Status Ann'];
        let list = tableList.list;
        let headList = tableList.headList;
        let designValueName = '';
        headList.forEach((item) => {
            if (item.includes('Design Value')) {
                designValueName = item;
            }
        });

        list.forEach((item) => {
            let countyId = item['County FIPS'];
            let stateId = item['State FIPS'];
            let id = getFipsId(stateId, countyId);
            let designValue = item[designValueName];
            if (!dataSet[id] && initData) {
                let meetnaaqsValue = item['Meets NAAQS?'] ? item['Meets NAAQS?'] == 'Yes' : false;
                let info = {
                    FIPS: id,
                    STATE: item['State Name'],
                    EPARegion: item['EPA Region'],
                    COUNTY: item['County Name'],
                    AQSSiteId: item['AQS Site ID'],
                    CBSAName1: item['CBSA Name'],
                    MeetNAAQS: meetnaaqsValue,
                    dicAnnualValues: {},
                    dicHr06Values: {},
                };
                info.dicAnnualValues[year] = designValue;
                dataSet[id] = info;
            }
            if (dataSet[id]) {
                dataSet[id].dicAnnualValues[year] = designValue;
            }
        });
        resolve(dataSet);
    });
};

const getCountyHr06Data = (data, year, dataSet) => {
    return new Promise((resolve, reject) => {
        let tableList = data['Table4b. County Status 24hr'];
        let list = tableList.list;
        let headList = tableList.headList;
        let designValueName = '';
        headList.forEach((item) => {
            if (item.includes('Design Value')) {
                designValueName = item;
            }
        });
        list.forEach((item) => {
            let countyId = item['County FIPS'];
            let stateId = item['State FIPS'];
            let id = getFipsId(stateId, countyId);
            let designValue = item[designValueName];
            if (dataSet[id]) {
                dataSet[id].dicHr06Values[year] = designValue;
            }
        });
        resolve(dataSet);
    });
};
const getFipsId = (stateFips, countyFips) => {
    let stateId = String(stateFips);
    let countyId = String(countyFips);
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
    return id;
};
const getHr6InfoData = () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let tableList = data[sheetDesignatedAreaInfoHr06PM].list.filter((item) => item['Met NAAQS?'] === 'No');
    EjReportStore.dicHr6Info = tableList;
};
const getHr6DvData = () => {
    const EjReportStore = useEJReportStore();
    let data = fileData.data;
    let tableList = data[sheetDesignatedAreaDVHr06PM];
    let tableHeaders = tableList.headList;
    let tableData = tableList.list;
    let dicAnnualDv = getDvData(tableData, tableHeaders);
    EjReportStore.dicHr6Dv = dicAnnualDv;
};

const formatData = async () => {
    getAnnualInfoData();
    getAnnualDvData();
    getCountyStateData();

    getHr6InfoData();
    getHr6DvData();
};
const initData = () => {
    const EjReportStore = useEJReportStore();
    if (!EjReportStore.dicAnnualInfo) {
        worker.postMessage(filePath);
    }
};
const getAnnualTableColumns = (type) => {
    return type == 'tableOne' ? annualColumns.value : annualCountyColumns.value;
};
const getHr06TableColumns = (type) => {
    return type == 'tableOne' ? pm25Hr6Columns.value : pm25Hr6CountyColumns.value;
};
export default {
    initData,
    initAnnualTable,
    initHr6Table,
    initAnnualCountyTable,
    initHr06CountyTable,
    getAnnualTableColumns,
    getHr06TableColumns
};
