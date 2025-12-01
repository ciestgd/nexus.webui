import { defineStore } from 'pinia';
import boundaryLayers from '@/libs/map/layers/boundary-layers';
import baseLayers from '@/libs/map/layers/base-layers';
export const useAdvancedOptionStore = defineStore('advanceOption', {
    state: () => {
        return {
            option: null,
            advancedMode: false,
        };
    },
    actions: {
        handleMapChange() {
            if (this.option) {
                let form = this.option;
                baseLayers.forEach((item, index) => {
                    if (form.baseMap === item.get('title')) {
                        item.setVisible(true);
                    } else {
                        item.setVisible(false);
                    }
                });
                boundaryLayers.forEach((item, index) => {
                    if (form.boundary == index) {
                        item.setVisible(true);
                    } else {
                        item.setVisible(false);
                    }
                });
            }
        },
    },
});
