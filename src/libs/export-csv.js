function isMSbrowser() {
    const userAgent = window.navigator.userAgent;
    return userAgent.indexOf('Edge') !== -1 || userAgent.indexOf('Trident') !== -1;
}

function format(data) {
    return String(data)
        .replace(/"/g, '""')
        .replace(/(^[\s\S]*$)/, '"$1"');
}

function exportCsv(title, head, data) {
    let wordSeparator = ',';
    let lineSeparator = '\n';
    let reTitle = title + '.csv';
    let headBOM = '\ufeff';
    let dataList = [];
    for (let i = 0; i < data.length; i++) {
        let temp = [];
        for (let j = 0; j < head.length; j++) {
            temp.push(data[i][head[j].value]);
        }
        dataList.push(temp.join(wordSeparator) + '\r\n');
    }
    let dataStr = dataList.join('');
    let headStr = head ? head.map((item) => format(item.label)).join(wordSeparator) + lineSeparator : '';
    return isMSbrowser()
        ? new Promise((resolve) => {
              // Edge、IE11
              let blob = new Blob([headBOM + headStr + dataStr], { type: 'text/plain;charset=utf-8' });
              window.navigator.msSaveBlob(blob, reTitle);
              resolve();
          })
        : new Promise((resolve) => {
              // Chrome、Firefox
              let a = document.createElement('a');
              a.href = 'data:text/csv;charset=utf-8,' + headBOM + encodeURIComponent(headStr + dataStr);
              a.download = reTitle;
              a.click();
              resolve();
          });
}
export default exportCsv;
