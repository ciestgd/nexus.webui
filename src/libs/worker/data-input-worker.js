import getFileData from '../read-file';
onmessage = async function (event) {
    if (event.data) {
        let result = await getFileData(event.data);
        let { type, tableNames, data } = result;
        let { headList, list } = data;
        if (type === 'xlsx') {
            this.postMessage({
                state: 200,
                type: 'all',
                status: 'end',
                data: result,
            });
        } else {
            this.postMessage({
                state: 200,
                type: 'other',
                status: 'working',
                data: {
                    type,
                    tableNames,
                    headList,
                },
            });
            if (list.length <= 1000) {
                this.postMessage({
                    state: 200,
                    type: 'list',
                    status: 'end',
                    data: list,
                });
            } else {
                let step = Math.ceil(list.length / 100);
                let index = 0;
                for (let i = 0; i < 100; i++) {
                    let end = (i + 1) * step;
                    let arr = list.slice(index, end);
                    index = end;
                    this.postMessage({
                        state: 200,
                        type: 'list',
                        status: arr.length < step ? 'end' : 'working',
                        data: arr,
                    });
                }
            }
        }
    }
};
