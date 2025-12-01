import { defineStore } from 'pinia';
// import { getBlockGeoIdsByMinValue } from '@/api/cancer-risk';
import { setBlockLayerStyle } from '@/libs/map/layers/block-layer';
export const useAirToxicStore = defineStore('airToxic', {
    state: () => {
        return {
            selectGeoId: '',
            selectBlockId: null,
            cancerRiskChecked: true,
            cancerRiskValue: 50,
            cancerRiskPollutantType: 'total',
            hazardIndexChecked: false,
            hazardIndexValue: 1,
            cancerRiskBlockIds: [],
            hazardIndexBlockIds: [],
            tooltip: {
                visible: false,
                position: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                },
                content: '',
                triggerRef: null,
            },
        };
    },
    getters: {},
    actions: {
        handleAirToxicBlock(geoId) {
            this.selectGeoId = geoId && (geoId.length === 11 || geoId.length === 5) ? geoId : null;
            this.getBlockGeoIds();
        },
        getBlockGeoIds() {
            setBlockLayerStyle();
        },
        handleAirToxicBlockMapClick(feature, event, visible = true) {
            const _this = this;
            let blockId = feature.get('Block_ID');
            let countyName = feature.get('County_Name');
            let countyCode = feature.get('County_FIPS_Code');
            let state = feature.get('State');
            let epaRegion = feature.get('EPA_Region');
            let population = feature.get('Population');
            let totalCancer = feature.get('Total_Cancer_Risk__per_million_');
            let clientX = event.originalEvent.clientX;
            let clientY = event.originalEvent.clientY;

            let content = `
            <table class='block-table'>
                <tbody>
                    <tr>
                        <th>Block ID</th>
                        <td>${blockId}</td>
                    </tr>
                    <tr>
                        <th>County Name</th>
                        <td>${countyName}</td>
                    </tr>
                    <tr>
                        <th>County Code</th>
                        <td>${countyCode}</td>
                    </tr>
                    <tr>
                        <th>State</th>
                        <td>${state}</td>
                    </tr>
                    <tr>
                        <th>EPA Region</th>
                        <td>${epaRegion}</td>
                    </tr>
                    <tr>
                        <th>Population</th>
                        <td>${population}</td>
                    </tr>
                    <tr>
                        <th>Total Cancer Risk</th>
                        <td>${totalCancer}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><a href="https://www.epa.gov/AirToxScreen/airtoxscreen-mapping-tool" target="_blank">https://www.epa.gov/AirToxScreen/airtoxscreen-mapping-tool</a></td>
                    <tr>
                </tbody>
            </table>
        `;
            this.tooltip.content = content;
            this.tooltip.position = DOMRect.fromRect({
                width: 0,
                height: 0,
                x: clientX,
                y: clientY,
            });
            this.tooltip.triggerRef = {
                getBoundingClientRect() {
                    return _this.tooltip.position;
                },
            };
            this.tooltip.visible = visible;
        },
    },
});
