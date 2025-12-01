import { defineStore } from 'pinia';

export const useViewCurrentDataStore = defineStore('viewCurrentData', {
    state: () => {
        return {
            name: 'View Attribute Table',
            collapse: false,
            selectId: null,
            isShow: true,
            isShowDefault: false,
        };
    },
    actions: {
        handleViewCollapse() {
            this.collapse = !this.collapse;
        },
        handleViewShow() {
            this.isShow = !this.isShow;
        },
    },
});
