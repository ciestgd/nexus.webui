import axios from 'axios';
import { ElMessage } from 'element-plus';
import qs from 'qs';
const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: import.meta.env.VITE_APP_FILE_TIMEOUT,
    paramsSerializer: {
        serialize: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
        },
    },
});
service.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            ElMessage.error('Network timeout. Please check the network or try again later.');
        }
        return Promise.reject(error);
    }
);
export default service;
