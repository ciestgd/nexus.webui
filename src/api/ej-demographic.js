import http from '../libs/request';
import { getDataScale } from '../store/data-scale';
/**
 * Get
 * @returns
 */
export const getGeoIdsByMinPercentRank = (year, ejType, min, districtData = null) => {
    let params = { year, ejType, min, dataType: 'percentRank' };
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/EJ_Demographic/${getDataScale()}/GeoIds`, { params });
};

/**
 * Get
 * @returns
 */
export const getGeoIdsByMinValue = (year, ejType, min) => {
    return http.get(`/EJ_Demographic/${getDataScale()}/GeoIds`, { params: { year, ejType, min, dataType: 'value' } });
};
/**
 * Get
 * @returns
 */
export const getPopulation = ({ year, districtType, districtIds }) => {
    return http.get(`/EJ_Demographic/CensusTract/Population`, { params: { year, districtType, districtIds } });
};
