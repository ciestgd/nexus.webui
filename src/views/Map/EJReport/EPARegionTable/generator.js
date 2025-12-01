import { useEJReportStore } from '@/store/ejscreen-report';
const years = ['2016-2018', '2017-2019', '2018-2020'];
export const getDicCounties = (pollutant) => {
    const EjReportStore = useEJReportStore();
    let dicCounties = {};
    if (EjReportStore.dtNayro.length) {
        let list = EjReportStore.dtNayro.filter((item) => item['pollutant'] == pollutant);
        list.forEach((item) => {
            let id = item['fips_state'] + item['fips_cnty'];
            let area_name = item['area_name'];
            let data = {
                name: item['countyname'],
                fips: id,
                epaRegion: EjReportStore.dicEpa[id] || '99999',
                population: EjReportStore.dicPop[id] || 0,
                maxCancerRisk: EjReportStore.dicMaxRisk[id],
            };
            if (!dicCounties[area_name]) {
                dicCounties[area_name] = [data];
            } else {
                dicCounties[area_name].push(data);
            }
        });
    }
    return dicCounties;
};

export const getTableList = (list, dvData, type = 'ozone') => {
    return new Promise((resolve, reject) => {
        let tableList = [];
        list.forEach((item) => {
            let dataList = [];
            let obj = {
                name: item.name,
                designationStatus: item.designationStatus,
                classfication: item.classfication,
                county: '',
                population: 0,
                risk: '',
            };
            let dvDatas = dvData[item.name];
            let keyArr = ['2018DV', '2019DV', '2020DV'];
            Object.keys(dvDatas).forEach((key, index) => {
                let value = dvDatas[key] ? (type === 'ozone' ? dvDatas[key] * 1000 : dvDatas[key]) : '';
                obj[keyArr[index]] = value;
            });
            let population = 0;
            if (item && item.counties && item.counties.length) {
                item.counties.forEach((county) => {
                    population += Number(county.population);
                    let countyObj = {
                        name: '',
                        designationStatus: '',
                        classfication: '',
                        county: county.name,
                        population: county.population,
                        risk: county.maxCancerRisk,
                    };
                    dataList.push(countyObj);
                });
            }

            obj.population = population;
            dataList.unshift(obj);
            tableList.push(...dataList);
        });
        resolve(tableList);
    });
};
export const getDesignateData = (infoList, pollutant, epaRegionValue) => {
    let list = [];
    let dicCounties = getDicCounties(pollutant);
    infoList.forEach((item) => {
        if ((item['EPA Region(s)'] && item['EPA Region(s)'].includes(epaRegionValue)) || (item['EPA Region'] && item['EPA Region'].includes(epaRegionValue))) {
            let obj = {
                name: item['Designated Area'],
                epaRegion: item['EPA Region(s)'] || item['EPA Region'],
                designationStatus: item['Designation Status [1]'],
                classfication: item['Classification [1]'],
                counties: dicCounties[item['Designated Area']] || null,
            };
            list.push(obj);
        }
    });
    return list;
};
export const getDvData = (data, header) => {
    let obj = {};
    let list = header.filter((item) => {
        let flag = false;
        years.forEach((key) => {
            if (item.includes(key)) {
                flag = true;
            }
        });
        return flag;
    });
    data.forEach((item) => {
        let area = item['Designated Area'];
        if (!obj[area]) {
            let dataObj = {};
            list.forEach((key) => {
                dataObj[key] = item[key];
            });
            obj[area] = dataObj;
        }
    });
    return obj;
};
