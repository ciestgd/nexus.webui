import http from '../libs/request';

/**
 *
 * @returns
 */
export const getEmissionsDataFacility = (params) => {
    return http.get(`/EmissionsData/Facility`, { params });
};
export const getEmissionsDataCounty = (params) => {
    return http.get(`/EmissionsData/County`, { params });
};
export const getSectoreGroupEmission = (year) => {
    return http.get(`/EmissionsData/SectorGroupEmission`, { params: { year } });
};
/**
 *
 * @returns
 */
export const getSectorGroupEmissionsCombined = ({ year, districtType, districtIds, topCount }) => {
    return http.get(`/EmissionsData/SectorGroupEmissionsCombined`, { params: { year, districtType, districtIds, topCount } });
};
