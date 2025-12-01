import http from '../libs/request';
import { getDataScale } from '../store/data-scale';

export const getPM25GeoIdsByMinPercentRank = (year, endpointId, min, valueType, districtData = null) => {
    let params = { year, endpointId, min: min, pollutantType: 'PM25', dataType: 'percentRank' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/Morbidity/${getDataScale()}/GeoIds`, { params });
};

export const getPM25GeoIdsByMinValue = (year, endpointId, min, valueType) => {
    let params = { year, endpointId, min, pollutantType: 'PM25', dataType: 'Value' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }
    return http.get(`/RiskData/Morbidity/${getDataScale()}/GeoIds`, { params });
};

export const getO3GeoIdsByMinPercentRank = (year, endpointId, min, valueType, districtData) => {
    let params = { year, endpointId, min: min, pollutantType: 'O3', dataType: 'percentRank' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }
    if (districtData) {
        params = {
            ...params,
            ...districtData,
        };
    }
    return http.get(`/RiskData/Morbidity/${getDataScale()}/GeoIds`, { params });
};

export const getO3GeoIdsByMinValue = (year, endpointId, min, valueType) => {
    let params = { year, endpointId, min, pollutantType: 'O3', dataType: 'Value' };
    if (getDataScale() === 'County') {
        params.valueType = valueType;
    }
    return http.get(`/RiskData/Morbidity/${getDataScale()}/GeoIds`, { params });
};
