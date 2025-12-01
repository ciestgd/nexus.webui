import { defineStore } from 'pinia';
export const useDataScaleStore = defineStore('dataScale', {
    state: () => {
        return {
            dataScale: 0,
            options: [
                {
                    value: 0,
                    label: 'County',
                },
                {
                    value: 1,
                    label: 'Census Tract',
                },
            ],
        };
    },
    getters: {
        isCountyLevel() {
            return this.dataScale == 0;
        },
        dataScaleType() {
            return this.isCountyLevel ? 'County' : 'CensusTract';
        },
    },
    actions: {},
});

export const getDataScale = (id) => {
    const dataScaleStore = useDataScaleStore();
    return id ? (id.length === 5 ? 'County' : 'CensusTract') : dataScaleStore.dataScaleType;
};
