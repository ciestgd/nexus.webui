import { defineStore } from 'pinia';
import { useMeteorologicalMapPoints, getMeteorologicalSite, getSiteDetail } from '../libs/meteorological-data.js';
let layer = useMeteorologicalMapPoints();
/**
 * A Vuex store module for managing meteorological site data.
 *
 * @typedef {Object} MeteorologicalSiteState
 * @property {string} layer - The layer of the meteorological site.
 * @property {boolean} isShow - Indicates whether the meteorological site is shown or not.
 * @property {number|null} stationID - The ID of the meteorological station.
 * @property {Array} options - The options for the meteorological site.
 * @property {Object|null} windRoseData - The wind rose data for the meteorological site.
 */

/**
 * A Vuex store module for managing meteorological site data.
 *
 * @param {string} name - The name of the meteorological site.
 * @returns {Promise<void>} - A promise that resolves when the wind rose data is fetched.
 */
export const useMeteorologicalSite = defineStore('meteorologicalSite', {
    state: () => {
        return {
            layer: layer,
            isShow: false,
            stationID: null,
            stationName: null,
            options: [],
            windRoseData: null,
        };
    },
    actions: {
        /**
         * Fetches the options for the meteorological site.
         *
         * @returns {Promise<void>} - A promise that resolves when the options are fetched.
         */
        async getOptions() {
            let results = await getMeteorologicalSite();
            this.options = results.filter((item) => item.StationID && item.County_GeoID && item.State_GeoID && item.CBSA_GeoID && item.EPA_Region_ID);
        },
        /**
         * Fetches the wind rose data for the meteorological site.
         *
         * @param {string} name - The name of the meteorological site.
         * @returns {Promise<void>} - A promise that resolves when the wind rose data is fetched.
         */
        async getWindRoseData(name, stationName) {
            this.stationID = name;
            this.stationName = stationName;
            let results = await getSiteDetail(name);
            this.windRoseData = results;
        },
    },
});
