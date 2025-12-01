import http from '../libs/request';

export const getEpaRegion = () => {
    return http.get('/District/EPA_Regions');
};

export const getState = (name) => {
    return http.get('/District/States', { params: { name } });
};
export const getStateById = (geoId) => {
    return http.get('/District/States/' + geoId);
};

export const getCounty = (name) => {
    return http.get('/District/Countys', { params: { name } });
};
export const getCountyById = (geoId) => {
    return http.get('/District/Countys/' + geoId);
};

export const getCBSA = (name) => {
    return http.get('/District/CBSAs', { params: { name } });
};

export const getCbsaById = (geoId) => {
    return http.get('/District/CBSAs/' + geoId);
};

export const getCensusTractsById = (geoId) => {
    return http.get('/District/CensusTracts/' + geoId);
};
