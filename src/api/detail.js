import http from '../libs/request';
import { getDataScale } from '../store/data-scale';

/**
 * Get
 * @returns
 */
export const getDetail = (year, geoId, ejYear) => {
    return http.get(`/Detail/${getDataScale(geoId)}/${geoId}`, { params: { year, ejYear } });
};

export const getDetailTable = (params) => {
    return http.post(`/Detail/${getDataScale()}`, params);
};
