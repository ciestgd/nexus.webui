import http from '../libs/request';

/**
 * Get endpoints
 * @returns 
 */
 export const getEndpoints = () => {
    return http.get(`/Endpoints`);
};
