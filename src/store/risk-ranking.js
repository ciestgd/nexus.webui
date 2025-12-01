import { defineStore } from 'pinia';
export const useRiskRankingStore = defineStore('riskRanking', {
    state: () => {
        return {
            riskRankingType: 0,
        };
    },
    getters: {
        isOnNation() {
            return this.riskRankingType == 0;
        },
    },
    actions: {},
});
