import http from '../libs/request';

/**
 *
 * @returns
 */
export const getEmissionsFacilityInformation = (sectorProjectGroup, year = 2017) => {
    return http.get(`/EmissionFacility/Information`, { params: { sectorProjectGroup, year } });
};
export const getEmissionsFacilityGroup = (year) => {
    return http.get(`/EmissionFacility/SectorProjectGroups`, { params: { year } });
};
export const getIndividualCensusTract = (params) => {
    return http.post(`/Individual/CensusTract`, params);
};
export const getIndividualSummary = (params) => {
    return http.post(`/Individual/Summary`, params);
};
export const getIndividualStateAvg = ({ year, ejYear, pollutants = [], sectorProjectGroups = [] }) => {
    let params = { year, ejYear };
    if (pollutants.length) {
        params.pollutants = pollutants;
    }
    if (sectorProjectGroups.length) {
        params.sectorProjectGroups = sectorProjectGroups;
    }
    return http.get(`/Individual/StateAvg`, { params: params });
};
