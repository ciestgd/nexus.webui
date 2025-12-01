import http from '../libs/request';

export const getAgeDataCounty = (params) => {
    return http.get('/AmericanCommunitySurvey/AgeData_County', { params });
};

export const getAgeDataTract = (params) => {
    return http.get('/AmericanCommunitySurvey/AgeData_CensusTract', { params });
};