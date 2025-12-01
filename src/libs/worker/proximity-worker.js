import http from '../file-request';
const readFile = async (filePath) => {
    let result = await http.get(filePath);
    return result;
};
const getGeoJSONData = async () => {
    let filePath = '/censusTractData/tribalAreas.json';
    let result = await readFile(filePath);
    let features = result.features;
    let obj = {};
    features.forEach((item) => {
        obj[item.properties.id] = item;
    });
    return obj;
};
onmessage = async function (event) {
    let result = await getGeoJSONData();
    this.postMessage({
        state: 200,
        data: result,
    });
};
