import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const getDepth = (arr) => {
    if (!Array.isArray(arr)) {
        // 判断是否为数组
        return 0;
    }
    let depth = 1; // 初始化深度为 1
    for (let i = 0; i < arr.length; i++) {
        const cur = arr[i];
        if (cur.children && Array.isArray(cur.children)) {
            const curDepth = getDepth(cur.children) + 1;
            depth = Math.max(depth, curDepth);
        }
    }
    return depth;
};
const getColumnById = (list, id) => {
    let data = null;
    const getColumn = (list) => {
        for (let index = 0; index < list.length; index++) {
            const item = list[index];
            if (item.key === id) {
                data = item;
                break;
            } else {
                if (item.children) {
                    getColumn(item.children);
                }
            }
        }
    };
    getColumn(list);
    return data;
};
const getAllChildNumber = (list) => {
    let sum = 0;
    const getNumber = (list) => {
        list.forEach((item) => {
            if (item.children) {
                getNumber(item.children);
            } else {
                sum += 1;
            }
        });
    };
    getNumber(list);
    return sum;
};
const resetColum = (columList) => {
    let nameList = [];
    let headerKeys = [];
    let depth = getDepth(columList);
    const handleHeaderData = (list, index) => {
        if (!nameList[index]) {
            nameList.push([]);
        }
        list.forEach((item) => {
            if (item.children) {
                let number = getAllChildNumber([item]);
                for (let i = 0; i < number; i++) {
                    nameList[index].push(item.header);
                }
                handleHeaderData(item.children, index + 1);
            } else {
                headerKeys.push(item.key);
                if (index < depth - 1) {
                    for (let i = index; i < depth; i++) {
                        if (!nameList[i]) {
                            nameList.push([]);
                        }
                        nameList[i].push(item.header);
                    }
                } else {
                    nameList[index].push(item.header);
                }
            }
        });
    };
    handleHeaderData(columList, 0);
    return { nameList, headerKeys };
};
const setTablePromise = (item, _workbook, sheetList) => {
    return new Promise(async (resolve, reject) => {
        const _sheet1 = _workbook.addWorksheet(item.tableName);
        _sheet1.properties.defaultRowHeight = 15;
        let tableData = item.data;
        let columList = item.columList;
        let cellStyleFn = item.cellStyleFn;
        let headerStyleFn = item.headerStyleFn;

        let { nameList, headerKeys } = resetColum(columList);
        handleHeader(_sheet1, columList, nameList, headerStyleFn);
        await addData2Table(_sheet1, headerKeys, columList, tableData, cellStyleFn);
        if (item.callbackFn) {
            item.callbackFn(_workbook, _sheet1);
        }
        headerKeys.forEach((item, index) => {
            let data = getColumnById(columList, item);
            _sheet1.getColumn(index + 1).width = data.width || 20;
            _sheet1.getColumn(index + 1).alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
        });
        sheetList.push(_sheet1);
        resolve(true);
    });
};
const exportExcel = (filename, tableOptions, callbackFn) => {
    let name = filename;
    if (!name.includes('.xlsx')) {
        name += '.xlsx';
    }
    const _workbook = new ExcelJS.Workbook();
    _workbook.creator = 'NEXUS System';
    _workbook.lastModifiedBy = 'NEXUS System';
    _workbook.created = new Date();
    _workbook.modified = new Date();
    _workbook.lastPrinted = new Date();
    // 确保工作表名称唯一
    const sheetNames = new Set();
    tableOptions.forEach(item => {
        let sheetName = item.tableName || 'Sheet';
        let counter = 1;
        while (sheetNames.has(sheetName)) {
            sheetName = `${item.tableName || 'Sheet'}${counter}`;
            counter++;
        }
        sheetNames.add(sheetName);
        item.tableName = sheetName;
    });

    let sheetList = [];
    let promiseArr = [];
    tableOptions.forEach((item) => {
        promiseArr.push(setTablePromise(item, _workbook, sheetList));
    });
    Promise.all(promiseArr).then((res) => {
        if (callbackFn) {
            callbackFn(_workbook, sheetList);
        }
        // 导出表格
        _workbook.xlsx.writeBuffer({
            useStyles: true,
            useSharedStrings: true
        }).then((buffer) => {
            let _file = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(_file, name);
        });
    });
};

function addData2Table(worksheet, headerKeys, headers, tableData, cellStyleFn) {
    return new Promise((resolve, reject) => {
        function handleData(index) {
            let currentIndex = index;
            const startIndex = (currentIndex - 1) * 1000;
            const endIndex = startIndex + 1000;
            const pageData = tableData.slice(startIndex, endIndex);
            if (!pageData.length) {
                resolve(true);
                return;
            }
            pageData.forEach((item) => {
                // const rowData = headerKeys?.map((key) => item[key]);
                const rowData = headerKeys?.map((key) => {
                    const value = item[key];
                    return value === undefined ? '' : value;
                });
                const row = worksheet.addRow(rowData);
                // mergeRowCell(headers, row, worksheet);
                row.alignment = { vertical: 'middle', wrapText: false, shrinkToFit: false };
                row.font = { size: 11, name: 'Times New Roman', family: 1, bold: true };
                row.height = 20;
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'ff000000' } },
                        left: { style: 'thin', color: { argb: 'ff000000' } },
                        right: { style: 'thin', color: { argb: 'ff000000' } },
                        bottom: { style: 'thin', color: { argb: 'ff000000' } },
                    };
                    cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
                });
                row.alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
                if (cellStyleFn) {
                    cellStyleFn(row);
                }
            });
            if (endIndex < tableData.length) {
                currentIndex++;
                setTimeout(() => handleData(currentIndex), 0);
            } else {
                resolve(true);
            }
        }
        handleData(1);
    });
}
const handleHeader = (worksheet, headers, nameList, headerStyleFn) => {
    if (nameList.length > 1) {
        let rowHeaderList = [];
        nameList.forEach((item) => {
            let rowHeader = worksheet.addRow(item);
            addHeaderStyle(rowHeader, { color: 'ffffffff' }, headerStyleFn);
            rowHeaderList.push(rowHeader);
        });
        mergeAllColumnCell(rowHeaderList, nameList, worksheet);
        return;
    }
    // 加表头数据
    const rowHeader = worksheet.addRow(nameList[0]);
    // 表头根据内容宽度合并单元格
    // mergeRowCell(headers, rowHeader, worksheet);
    // 添加表头样式
    addHeaderStyle(rowHeader, { color: 'ffffffff' }, headerStyleFn);
};
// 合并行和列，用于处理表头合并
const mergeAllColumnCell = (rowHeaderList, nameList, worksheet) => {
    let len = nameList.length;
    nameList.forEach((item, index) => {
        if (index !== len - 1) {
            let names1 = item;
            let names2 = nameList[index + 1];
            let rowHeader1 = rowHeaderList[index];
            let rowHeader2 = rowHeaderList[index + 1];
            mergeColumnCell(rowHeader1, rowHeader2, names1, names2, worksheet);
        }
    });
};
// 合并行和列，用于处理表头合并
const mergeColumnCell = (rowHeader1, rowHeader2, nameRow1, nameRow2, worksheet) => {
    // 当前 index 的指针
    let pointer = -1;
    nameRow1.forEach((name, index) => {
        // 当 index 小于指针时，说明这一列已经被合并过了，不能再合并
        if (index <= pointer) return;
        // 是否应该列合并
        const shouldVerticalMerge = name === nameRow2[index];
        const shouldHorizontalMerge = index !== nameRow1.lastIndexOf(name);
        pointer = nameRow1.lastIndexOf(name);
        if (shouldVerticalMerge && shouldHorizontalMerge) {
            // 两个方向都合并
            worksheet.mergeCells(Number(rowHeader1.number), index + 1, Number(rowHeader2.number), nameRow1.lastIndexOf(name) + 1);
        } else if (shouldVerticalMerge && !shouldHorizontalMerge) {
            // 只在垂直方向上同一列的两行合并
            worksheet.mergeCells(Number(rowHeader1.number), index + 1, Number(rowHeader2.number), index + 1);
        } else if (!shouldVerticalMerge && shouldHorizontalMerge) {
            // 只有水平方向同一行的多列合并
            worksheet.mergeCells(Number(rowHeader1.number), index + 1, Number(rowHeader1.number), nameRow1.lastIndexOf(name) + 1);
            const cell = rowHeader1.getCell(index + 1);
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
    });
};
// // 行合并单元格
// function mergeRowCell(headers, row, worksheet) {
//     // 当前列的索引
//     let colIndex = 1;
//     headers.forEach((header) => {
//         const { width, children } = header;
//         if (children) {
//             children.forEach((child) => {
//                 colIndex += 1;
//             });
//         }
//         // else {
//         //     const colNum = getColumnNumber(width);
//         //     if (colNum > 1) {
//         //         worksheet.mergeCells(Number(row.number), colIndex, Number(row.number), colIndex + colNum - 1);
//         //     }
//         //     colIndex += colNum;
//         // }
//     });
// }

const addHeaderStyle = (row, attr, headerStyleFn) => {
    const { color, fontSize, horizontal, bold } = attr || {};
    row.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color },
        };
        cell.font = {
            family: 1,
            bold: bold ?? true,
            size: fontSize ?? 11,
            name: 'Times New Roman',
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'ff000000' } },
            left: { style: 'thin', color: { argb: 'ff000000' } },
            right: { style: 'thin', color: { argb: 'ff000000' } },
            bottom: { style: 'thin', color: { argb: 'ff000000' } },
        };
        // cell.alignment = { vertical: 'middle', wrapText: true, horizontal: horizontal ?? 'center' };
    });
    row.height = 40;
    row.alignment = { vertical: 'middle', wrapText: true, horizontal: 'center' };
    if (headerStyleFn) {
        headerStyleFn(row);
    }
};

export default exportExcel;
