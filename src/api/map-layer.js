import http from '../libs/request';

/**
 * Get
 * @returns
 */
export const getMapLayerData = ({ pollutantType, dataType, year, dataScaleType }) => {
    return http.get(`/MapLayer`, { params: { pollutantType, dataType, year, dataScaleType } });
};
