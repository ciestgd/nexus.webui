import Papa from 'papaparse';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import http from './file-request';
export const readFile = async (filePath) => {
    let result = await http.get(filePath);
    return result;
};
const readXlsx = async (filePath) => {
    let result = await http.get(filePath, { responseType: 'arraybuffer' });
    return new Uint8Array(result);
};
const setXlsxData = (sheetData, name) => {
    let list = [];
    let headList = [];
    let unUseIndex = sheetData.findIndex((row) => row.length === 0);
    let headIndex = sheetData.findIndex((row) => row[0] === ' ');

    if (unUseIndex !== -1) {
        sheetData.splice(unUseIndex);
        unUseIndex = null; // Reset unUseIndex after modifying the array
    }
    if (headIndex !== -1) {
        sheetData.splice(0, headIndex + 1);
        headIndex = null; // Reset headIndex after modifying the array
    }
    if (name.includes('Information')) {
        sheetData.shift();
    }

    headList = sheetData.shift();

    list = sheetData.map((item) => {
        return headList.reduce((obj, key, index) => {
            let _item = item[index];
            obj[key] = _item instanceof Date ? dayjs(_item).format('YYYY-MM-DD') : _item;
            return obj;
        }, {});
    });

    return {
        headList,
        list,
    };
};
export const getXlsxOtions = async (filepath) => {
    let results = await readXlsx(filepath);
    let workbook = XLSX.read(results, {
        type: 'array',
        cellDates: true,
        cellStyles: true,
        sheetStubs: true,
    });
    let sheetNames = workbook.SheetNames;
    const tableList = sheetNames.reduce((acc, sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        acc[sheetName] = setXlsxData(sheetData, sheetName);
        return acc;
    }, {});
    return {
        tableNames: sheetNames,
        data: tableList,
    };
};
export const getOptions = async (filepath) => {
    let fileContent = await readFile(filepath);
    return await analysisCsv(fileContent);
};
const handlePapaParse = (fileContent) => {
    return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
            complete: (results) => resolve(results.data),
            error: (error) => reject(error),
        });
    });
};
export const analysisCsv = async (fileContent) => {
    const data = await handlePapaParse(fileContent);
    let headList = data[0].filter((item) => item !== '');

    // If the filtered headList has only one item, it might be an invalid header.
    // In such a case, we can assume the second row is the header.
    if (headList.length === 1) {
        headList = data[1];
        data.shift(); // Remove the invalid header row
    }

    // Now that we have the correct header, we can process the rest of the data.
    const list = data.map((row) => {
        return headList.reduce((obj, key, index) => {
            obj[key] = row[index];
            return obj;
        }, {});
    });
    // Exclude the header row from the data list
    list.shift();

    return {
        headList,
        list,
    };
};
const getFileData = async (filePath) => {
    let returnData = {
        data: {},
        tableNames: [],
        type: '',
    };
    if (filePath.includes('.xlsx')) {
        let { tableNames, data } = await getXlsxOtions(filePath);
        returnData.tableNames = tableNames || [];
        returnData.data = data;
        returnData.type = 'xlsx';
    } else {
        let data = await getOptions(filePath);
        returnData.data = data;
        returnData.type = 'csv';
    }
    return returnData;
};
export default getFileData;
