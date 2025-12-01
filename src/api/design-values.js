import http from '../libs/request';

/**
 * Get ozone 8hour design values
 * @returns
 */
export const getO3EightHour = (year, min) => {
    return http.get(`/DesignValues/O3/GeoIds`, { params: { min, year } });
};

/**
 * Get pm25 annual design values
 * @returns
 */
export const getPM25Annual = (year, min) => {
    return http.get(`/DesignValues/PM25/GeoIds`, { params: { min, year, statisticType: 'Annual' } });
};

/**
 * Get pm25 daily design values
 * @returns
 */
export const getPM25Daily = (year, min) => {
    return http.get(`/DesignValues/PM25/GeoIds`, { params: { min, year, statisticType: 'Daily' } });
};
