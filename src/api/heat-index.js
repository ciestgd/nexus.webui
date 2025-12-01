import http from '../libs/request';
import { getDataScale } from '../store/data-scale';
/**
 * Get
 * @returns
 */
export const getGeoIdsByMinPercentRank = (heatIndexType, min, districtData = null) => {
    let params = { heatIndexType, min, dataType: 'percentRank' };
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/Climate_HeatIndex/${getDataScale()}/GeoIds`, { params });
};

/**
 * Get
 * @returns
 */
export const getGeoIdsByMinValue = (heatIndexType, min) => {
    return http.get(`/RiskData/Climate_HeatIndex/${getDataScale()}/GeoIds`, { params: { heatIndexType, min, dataType: 'value' } });
};
