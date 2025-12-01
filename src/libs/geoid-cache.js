export const pm25GeoIdSet = new Set();
export const pm25DV_GeoIdSet = new Set();
export const o3GeoIdSet = new Set();
export const o3DV_GeoIdSet = new Set();
export const toxicsGeoIdSet = new Set();
export const ejGeoIdSet = new Set();
export const heatIndexGeoIdSet = new Set();

export const addToSetAsync = (set, task) => {
    return new Promise((resolve) => {
        task.then((data) => {
            for (let i = 0, len = data.length; i < len; i++) {
                set.add(data[i]);
            }
            resolve();
        }).catch();
    });
};

export const clearAllSet = () => {
    pm25GeoIdSet.clear();
    pm25DV_GeoIdSet.clear();
    o3GeoIdSet.clear();
    o3DV_GeoIdSet.clear();
    toxicsGeoIdSet.clear();
    ejGeoIdSet.clear();
    heatIndexGeoIdSet.clear();
};
export const getAllGeoIds = () => {
    return [...pm25GeoIdSet, ...pm25DV_GeoIdSet, ...o3GeoIdSet, ...o3DV_GeoIdSet, ...toxicsGeoIdSet, ...ejGeoIdSet, ...heatIndexGeoIdSet];
};
