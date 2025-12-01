import http from '../libs/request';
import { getDataScale } from '../store/data-scale';
/**
 * Get the specified condition 11 bit geoId array
 * @returns
 */
export const getPM25GeoIdsByMinPercentRank = (year, endpointId, min, valueType, districtData = null) => {
    let params = { year, endpointId, min: min, pollutantType: 'PM25', dataType: 'PercentRank' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/Mortality/${getDataScale()}/GeoIds`, { params });
};

export const getPM25GeoIdsByMinValue = (year, endpointId, min, valueType) => {
    let params = { year, endpointId, min, pollutantType: 'PM25', dataType: 'value' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }

    return http.get(`/RiskData/Mortality/${getDataScale()}/GeoIds`, { params });
};

export const getO3GeoIdsByMinPercentRank = (year, endpointId, min, valueType, districtData = null) => {
    let params = { year, endpointId, min: min, pollutantType: 'O3', dataType: 'PercentRank' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/Mortality/${getDataScale()}/GeoIds`, { params });
};

export const getO3GeoIdsByMinValue = (year, endpointId, min, valueType) => {
    let params = { year, endpointId, min, pollutantType: 'O3', dataType: 'value' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }
    return http.get(`/RiskData/Mortality/${getDataScale()}/GeoIds`, { params });
};
