import { defineStore } from 'pinia';

export const useQuickStartStore = defineStore('quickStart', {
    state: () => {
        return {
            visible: false,
            tourVisible: false,
        };
    },
    actions: {},
});
