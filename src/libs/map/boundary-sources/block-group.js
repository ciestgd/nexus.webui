import VectorSource from 'ol/source/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { useAirToxicStore } from '@/store/air-toxic';
const Gas_VOC_HAPs = {
    Acetaldehyde: 'ACETALDEHYDE',
    Acetamide: 'ACETAMIDE',
    Acrylamide: 'ACRYLAMIDE ',
    Acrylonitrile: 'ACRYLONITRILE',
    F_2_Acetylaminofluorene: 'F2_ACETYLAMINOFLUORENE',
    Allyl_Chloride: 'ALLYL_CHLORIDE',
    Aniline: 'ANILINE',
    Benzene: 'BENZENE',
    Benzidine: 'BENZIDINE',
    Benzoapyrene: 'BENZOAPYRENE',
    Benzyl_Chloride: 'BENZYL_CHLORIDE',
    Bis_Chloromethyl__Ether: 'BIS_CHLOROMETHYL__ETHER',
    Bromoform: 'BROMOFORM',
    Bis_2_Ethylhexyl_Phthalate__Dehp_: 'BIS_2_ETHYLHEXYL_PHTHALATE__DEH',
    F_1_3_Butadiene: 'F1_3_BUTADIENE',
    Carbon_Tetrachloride: 'CARBON_TETRACHLORIDE',
    Chlordane: 'CHLORDANE',
    Chloroprene: 'CHLOROPRENE',
    Chlorobenzilate: 'CHLOROBENZILATE',
    Ethylene_Dichloride__1_2_Dichloroethane_: 'ETHYLENE_DICHLORIDE__1_2_DICHLO',
    Trichloroethylene: 'TRICHLOROETHYLENE',
    Coke_Oven_Emissions: 'COKE_OVEN_EMISSIONS',
    F_1_2_Dibromo_3_Chloropropane: 'F1_2_DIBROMO_3_CHLOROPROPANE',
    F_3_3P_Dichlorobenzidine: 'F3_3__DICHLOROBENZIDINE',
    F_1_4_Dichlorobenzene: 'F1_4_DICHLOROBENZENE',
    Dichloroethyl_Ether__Bis_2_Chloroethyl_Ether_: 'DICHLOROETHYL_ETHER__BIS_2_CHLO',
    F_1_3_Dichloropropene: 'F1_3_DICHLOROPROPENE',
    F_4_Dimethylaminoazobenzene: 'F4_DIMETHYLAMINOAZOBENZENE',
    F_2_4_Dinitrotoluene: 'F2_4_DINITROTOLUENE',
    F_1_2_Diphenylhydrazine: 'F1_2_DIPHENYLHYDRAZINE',
    Epichlorohydrin: 'EPICHLOROHYDRIN',
    Ethylene_Dibromide__Dibromoethane_: 'ETHYLENE_DIBROMIDE__DIBROMOETHA',
    Ethylidene_Dichloride__1_1_Dichloroethane_: 'ETHYLIDENE_DICHLORIDE__1_1_DICH',
    Ethylene_Thiourea: 'ETHYLENE_THIOUREA',
    Ethylbenzene: 'ETHYLBENZENE',
    Ethyl_Carbamate__Urethane__Chloride__Chloroethane_: 'ETHYL_CARBAMATE__URETHANE__CHLO',
    Ethylene_Oxide: 'ETHYLENE_OXIDE',
    Formaldehyde: 'FORMALDEHYDE',
    Heptachlor: 'HEPTACHLOR',
    Hexachlorobutadiene: 'HEXACHLOROBUTADIENE',
    Hexachlorobenzene: 'HEXACHLOROBENZENE',
    F_1_2_3_4_5_6_Hexachlorocyclyhexane: 'F1_2_3_4_5_6_HEXACHLOROCYCLYHEX',
    F_4_4P_Methylene_Bis_2_Chloroaniline_: 'F4_4__METHYLENE_BIS_2_CHLOROANI',
    Methyl_Tert_Butyl_Ether: 'METHYL_TERT_BUTYL_ETHER',
    F_4_4P_Methylenedianiline: 'F4_4__METHYLENEDIANILINE',
    Naphthalene: 'NAPHTHALENE',
    Nitrobenzene: 'NITROBENZENE',
    F_2_Nitropropane: 'F2_NITROPROPANE',
    N_Nitrosodimethylamine: 'N_NITROSODIMETHYLAMINE',
    N_Nitrosomorpholine: 'N_NITROSOMORPHOLINE',
    O_Toluidine: 'O_TOLUIDINE',
    F_1_4_Dioxane: 'F1_4_DIOXANE',
    Pahpom: 'PAHPOM',
    Polychlorinated_Biphenyls__Aroclors_: 'POLYCHLORINATED_BIPHENYLS__AROC',
    Pentachlorophenol: 'PENTACHLOROPHENOL',
    F_1_3_Propane_Sultone: 'F1_3_PROPANE_SULTONE',
    Propylene_Oxide: 'PROPYLENE_OXIDE',
    F_2_4_Toluene_Diisocyanate: 'F2_4_TOLUENE_DIISOCYANATE',
    F_2_4_Toluene_Diamine: 'F2_4_TOLUENE_DIAMINE',
    Toxaphene__Chlorinated_Camphene_: 'TOXAPHENE__CHLORINATED_CAMPHENE',
    F_2_4_6_Trichlorophenol: 'F2_4_6_TRICHLOROPHENOL',
    F_1_1_2_Trichloroethane: 'F1_1_2_TRICHLOROETHANE',
    Methylene_Chloride: 'METHYLENE_CHLORIDE',
    Tetrachloroethylene: 'TETRACHLOROETHYLENE',
    Vinyl_Bromide: 'VINYL_BROMIDE',
    Vinyl_Chloride: 'VINYL_CHLORIDE',
};
const Heavy_Metal_HAPs = {
    Arsenic_Compounds_Inorganic_Including_Arsine_: 'ARSENIC_COMPOUNDS_INORGANIC_INC',
    Beryllium_Compounds: 'BERYLLIUM_COMPOUNDS',
    Cadmium_Compounds: 'CADMIUM_COMPOUNDS',
    Chromium_Vi__Hexavalent_: 'CHROMIUM_VI__HEXAVALENT_',
    Nickel_Compounds: 'NICKEL_COMPOUNDS',
};
const tileSource = new VectorSource({
    format: new EsriJSON(),
    loader: async function (extent, resolution, projection) {
        const airToxicStore = useAirToxicStore();
        if (!airToxicStore.selectGeoId || !airToxicStore.cancerRiskChecked) {
            this.addFeatures([]);
        } else {
            const url = 'https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/Cancer_Risk_2020/FeatureServer/0/query';
            let cancerRiskPollutantType = airToxicStore.cancerRiskPollutantType;
            let cancerRiskValue = airToxicStore.cancerRiskValue;
            let sqlStr = '';
            if (cancerRiskPollutantType === 'total') {
                sqlStr = 'Total_Cancer_Risk__per_million_ >=' + cancerRiskValue;
            } else if (cancerRiskPollutantType === 'Gas_VOC_HAPs') {
                let arr = Object.values(Gas_VOC_HAPs);
                sqlStr = arr.join(' + ');
                sqlStr = sqlStr + ' >=' + cancerRiskValue;
            } else if (cancerRiskPollutantType === 'Heavy_Metal_HAPs') {
                let arr = Object.values(Heavy_Metal_HAPs);
                sqlStr = arr.join(' + ');
                sqlStr = sqlStr + ' >=' + cancerRiskValue;
            } else {
                if (Gas_VOC_HAPs.hasOwnProperty(cancerRiskPollutantType)) {
                    sqlStr = Gas_VOC_HAPs[cancerRiskPollutantType] + ' >=' + cancerRiskValue;
                } else if (Heavy_Metal_HAPs.hasOwnProperty(cancerRiskPollutantType)) {
                    sqlStr = Heavy_Metal_HAPs[cancerRiskPollutantType] + ' >=' + cancerRiskValue;
                }
            }
            sqlStr += ` AND Block_ID LIKE '${airToxicStore.selectGeoId}%'`;
            const params = {
                f: 'json',
                // quantizationParameters: JSON.stringify(quantizationParameters),
                // geometry: geometry,
                geometryType: 'esriGeometryEnvelope',
                // inSR: '102100',
                outFields: 'Block_ID,County_Name,County_FIPS_Code,State,EPA_Region,Population,Total_Cancer_Risk__per_million_',
                orderByFields: 'Block_ID ',
                // outSR: '102100',
                // where: `County = '${countyDetail.name} County'`,
                // where: `Block_ID LIKE '${airToxicStore.selectGeoId}%'`,
                where: sqlStr,
                maxRecordCountFactor: 4,
                resultOffset: 0,
                resultRecordCount: 8000,
                resultType: 'tile',
                spatialRel: 'esriSpatialRelIntersects',
                defaultSR: 102100,
            };
            fetch(url + '?' + new URLSearchParams(params).toString())
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.error) {
                        throw new Error(data.error.message);
                    }
                    const features = this.getFormat().readFeatures(data, {
                        featureProjection: projection,
                    });
                    this.addFeatures(features);
                })
                .catch((error) => {
                    console.error('Error loading features:', error);
                });
        }
    },
    strategy: bboxStrategy,
});
export default tileSource;
