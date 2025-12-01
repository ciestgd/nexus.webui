import http from '../libs/request';
import { getDataScale } from '../store/data-scale';
/**
 * Get
 * @returns
 */
export const getGeoIdsByMinPercentRank = (year, min, districtData = null) => {
    let params = { min: min, year, dataType: 'percentRank' };
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/AirToxics_HazardIndex/${getDataScale()}/GeoIds`, { params });
};

/**
 * Get
 * @returns
 */
export const getGeoIdsByMinValue = (year, min) => {
    return http.get(`/RiskData/AirToxics_HazardIndex/${getDataScale()}/GeoIds`, { params: { min, year, dataType: 'value' } });
};
