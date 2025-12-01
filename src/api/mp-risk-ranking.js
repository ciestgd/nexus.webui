import http from '../libs/request';

/**
 * Get
 * @returns
 */
export const getMpRiskRanking = ({ regionType, year, topCount, isIncludeEj, valueType }) => {
    let params = { year, regionType, topCount, isIncludeEj, valueType };
    return http.get(`/MpRiskRanking`, { params });
};
