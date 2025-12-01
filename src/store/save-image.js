import { defineStore } from 'pinia';

export const useSaveImageStore = defineStore('saveImage', {
    state: () => {
        return {
            isSave: false,
        };
    },
    actions: {},
});
