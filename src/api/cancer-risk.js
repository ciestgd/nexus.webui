import http from '../libs/request';
import { getDataScale } from '../store/data-scale';
/**
 * Get
 * @returns
 */
export const getGeoIdsByMinPercentRank = (year, min, pollutantType = 'total', districtData = null) => {
    let params = { year, min: min, pollutantType, dataType: 'PercentRank' };
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/AirToxics_CancerRisk/${getDataScale()}/GeoIds`, { params });
};

/**
 * Get
 * @returns
 */
export const getGeoIdsByMinValue = (year, min, pollutantType = 'total') => {
    return http.get(`/RiskData/AirToxics_CancerRisk/${getDataScale()}/GeoIds`, { params: { year, min: min, pollutantType, dataType: 'Value' } });
};

export const getCancerRiskRecord = (params) => {
    return http.get(`/RiskData/AirToxics_CancerRisk/${getDataScale()}/Records`, { params });
};
export const getCancerRiskRecordById = (year, geoId) => {
    return http.get(`/RiskData/AirToxics_CancerRisk/${getDataScale()}/Records/${geoId}`, { params: { year } });
};

export const getBlockGeoIdsByMinPercentRank = (year, min, pollutantType = 'total', districtData = null) => {
    let params = { year, min: min, pollutantType, dataType: 'PercentRank' };
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/AirToxics_CancerRisk/Block/GeoIds`, { params });
};

export const getBlockGeoIdsByMinValue = (year, min, pollutantType = 'total', districtData = null) => {
    let params = { year, min: min, pollutantType, dataType: 'Value' };
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/AirToxics_CancerRisk/Block/GeoIds`, { params });
};
export const getBlockRecord = (params) => {
    return http.get(`/RiskData/AirToxics_CancerRisk/Block/Records`, { params });
};
