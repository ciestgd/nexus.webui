import http from '../libs/request';

/**
 * Get
 * @returns
 */
export const getPM25MonitorData = (rankingYear, topCount, sinceYear, geoIdList) => {
    return http.get(`/MonitorData/PM25`, { params: { rankingYear, topCount, sinceYear, ...geoIdList } });
};

/**
 * Get
 * @returns
 */
export const getO3MonitorData = (rankingYear, topCount, sinceYear, geoIdList) => {
    return http.get(`/MonitorData/O3`, { params: { rankingYear, topCount, sinceYear, ...geoIdList } });
};

export const getAirToxicMonitorData = (rankingYear, topCount, pollutantType, sinceYear, geoIdList) => {
    return http.get(`/MonitorData/AirToxic`, { params: { rankingYear, topCount, pollutantType, sinceYear, ...geoIdList } });
};

export const getMonitorSelectData = (type, siteId, pollutantType = '') => {
    return http.get(`/MonitorData/${type}/${siteId}`, { params: { pollutantType } });
};

export const getMonitorSiteInfo = (params) => {
    return http.get(`/MonitorSiteInfo`, { params });
};
export const getMonitorSiteInfoById = (siteId) => {
    return http.get(`/MonitorSiteInfo/${siteId}`);
};
