import { defineStore } from 'pinia';
import { initYear, ejYear } from '@/libs/year-options.js';
export const useProjectYearStore = defineStore('projectYear', {
    state: () => {
        return {
            projectYear: initYear,
            pm25DvYear: initYear,
            o3DvYear: initYear,
            ejYear: ejYear
        };
    },
    actions: {},
});
