import { defineStore } from 'pinia';
export const useDrawerStore = defineStore('drawer', {
    state: () => {
        return {
            rtlList: [],
            ltrList: [],
            ttbList: [],
            bttList: [],
            rtlName: '',
            ltrName: '',
            ttbName: '',
            bttName: '',
            width: '',
            height: ''
        };
    },
    actions: {},
});
