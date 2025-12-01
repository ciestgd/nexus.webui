import axios from 'axios';
import nProgress from '../plugins/nprogress';
import { ElMessage } from 'element-plus';
import router from '../router';
import qs from 'qs';
import { setupCache } from 'axios-cache-interceptor';

const ins = axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL,
    timeout: import.meta.env.VITE_APP_API_TIMEOUT,
    paramsSerializer: {
        serialize: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
        },
    },
});

const service = setupCache(ins, { cacheTakeover: false });

service.interceptors.request.use(
    (config) => {
        nProgress.start();
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response) => {
        nProgress.done();
        return response.data;
    },
    (error) => {
        nProgress.done();

        if (!error.response) {
            ElMessage.error(error.message);
            return Promise.reject(error);
        }

        const status = error.response.status;
        switch (status) {
            case 401:
                router.push('/login');
                break;
            case 403:
                router.push('/403');
                break;
            case 404:
                ElMessage.error('The requested resource does not exist.');
                break;
            case 400:
            case 500:
                ElMessage.error(error.response.data.error.message);
                break;
            default:
                if (error.code === 'ECONNABORTED') {
                    ElMessage.error('Network timeout. Please check the network or try again later.');
                } else {
                    ElMessage.error(error.message);
                }
        }

        return Promise.reject(error);
    }
);

export default service;
