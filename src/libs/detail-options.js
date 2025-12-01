export const detailOptions = {
    // countyGeoId: 'FIPS',
    // geoId: 'FIPS',
    // Geographic boundaries
    epaRegionId: 'EPA_Region',
    stateAbbrName: 'STATE',
    countyName: 'COUNTY',
    cbsaGeoId: 'CBSA Code',
    cbsaName: 'CBSA',
    advanceAreasType: 'Advance Areas Type',
    tribeName: 'Tribe Name',
    // AQ Ambient
    annual_PM25_DV: 'Annual PM2.5 design value (μg/m³)',
    daily_PM25_DV: 'Daily PM2.5 design value (μg/m³)',
    o3_DV: 'O3 design value (ppbv)',
    fused_PM25: 'Fused PM2.5 concentrations ( μg/m³)',
    fused_O3: 'Fused O3 concentrations (ppbv)',
    // satellite_NO2: 'NO2 Satellite Concentration (ppbv)',

    // PM2.5 & O3 Mortality
    mortality_PM25_Max_Value: 'PM2.5 mortality max rate (per 10k)',
    mortality_PM25_Max_PercentRank: 'PM2.5 mortality max rate percentile',
    mortality_PM25_Num_Value: 'PM2.5 mortality number',
    mortality_PM25_Num_PercentRank: 'PM2.5 mortality number percentile',
    mortality_O3_Max_Value: 'O3 mortality max rate (per 10k)',
    mortality_O3_Max_PercentRank: 'O3 mortality max rate percentile',
    mortality_O3_Num_Value: 'O3 mortality number',
    mortality_O3_Num_PercentRank: 'O3 mortality number percentile',

    // PM2.5 & O3 Morbidity
    morbidity_ERVR_PM25_Max_Value: 'PM2.5 emergency room visits respiratory max rate (per 10k)',
    morbidity_ERVR_PM25_Max_PercentRank: 'PM2.5 emergency room visits respiratory max rate percentile',
    morbidity_ERVR_PM25_Num_Value: 'PM2.5 emergency room visits respiratory number',
    morbidity_ERVR_PM25_Num_PercentRank: 'PM2.5 emergency room visits respiratory number percentile',

    morbidity_ERVR_O3_Max_Value: 'O3 emergency room visits respiratory max rate (per 10k)',
    morbidity_ERVR_O3_Max_PercentRank: 'O3 emergency room visits respiratory max rate percentile',
    morbidity_ERVR_O3_Num_Value: 'O3 emergency room visits respiratory number',
    morbidity_ERVR_O3_Num_PercentRank: 'O3 emergency room visits respiratory number percentile',

    morbidity_HAD_PM25_Max_Value: 'Hospital admissions respiratory for youth (PM2.5) max rate (per 10k)',
    morbidity_HAD_PM25_Max_PercentRank: 'Hospital admissions respiratory for youth (PM2.5) max rate percentile',
    morbidity_HAD_PM25_Num_Value: 'Hospital admissions respiratory for youth (PM2.5) number',
    morbidity_HAD_PM25_Num_PercentRank: 'Hospital admissions respiratory for youth (PM2.5) number percentile',

    morbidity_HAD_O3_Max_Value: 'Hospital admissions respiratory for senior (O3)  max rate (per 10k)',
    morbidity_HAD_O3_Max_PercentRank: 'Hospital admissions respiratory for senior (O3)  max rate percentile',
    morbidity_HAD_O3_Num_Value: 'Hospital admissions respiratory for senior (O3) number',
    morbidity_HAD_O3_Num_PercentRank: 'Hospital admissions respiratory for senior (O3) number percentile',

    morbidity_SLD_O3_Max_Value: 'School loss days (O3) max rate (per 10k)',
    morbidity_SLD_O3_Max_PercentRank: 'School loss days (O3) max rate percentile',
    morbidity_SLD_O3_Num_Value: 'School loss days (O3) number',
    morbidity_SLD_O3_Num_PercentRank: 'School loss days (O3) number percentile',

    morbidity_WLD_PM25_Max_Value: 'Work loss days (PM2.5) max rate (per 10k)',
    morbidity_WLD_PM25_Max_PercentRank: 'Work loss days (PM2.5) max rate percentile',
    morbidity_WLD_PM25_Num_Value: 'Work loss days (PM2.5) number',
    morbidity_WLD_PM25_Num_PercentRank: 'Work loss days (PM2.5) number percentile',

    morbidity_AsthmaSymptoms_Max_Value: 'Asthma Cases max rate (per 10k)',
    morbidity_AsthmaSymptoms_Max_PercentRank: 'Asthma Cases max rate percentile',
    morbidity_AsthmaSymptoms_Num_Value: 'Asthma Cases number',
    morbidity_AsthmaSymptoms_Num_PercentRank: 'Asthma Cases number percentile',

    // Air Toxics Risk
    cancerRisk_block_id: 'Block ID of Maximum Cancer Risk',
    hazardIndex_block_id: 'Block ID of Maximum Block-level Hazard Index',
    // cancerRisk_Max_Value: 'Total cancer risk max rate',
    // cancerRisk_Max_Value: 'Total Maximum Block-level Cancer Risk',
    cancerRisk_Max_Value: 'Maximum Block-level Cancer Risk (per million)',
    // cancerRisk_Max_PercentRank: 'Total cancer risk percentile',
    hazardIndex_block_id: 'Block ID of Maximum Hazard Index',
    hazardIndex_Max_Value: 'Maximum Block-Level Hazard Index',
    // hazardIndex_Max_PercentRank: 'NonCancer risk rate percentile',

    // EJ/Demographics
    // population_Total: 'Total Population',
    // population_Under5: 'Under Age 5',
    // population_Over25: 'Population age 25 and above',
    // population_Over64: 'Over Age 64',
    // population_Poverty: 'Persons for whom income status has been determined',
    // population_LowIncome: 'Low Income (<2x poverty level)',
    // population_PeopleOfColor: 'Minority Population',

    // population_LESSHS: 'Less than High School Education',
    // population_LINGISO: 'Linguistically Isolated',
    // housingUnits: 'Housing Units',
    // housingUnits_PRE1960: 'Housing Units Built Prior to 1960 (lead paint indicator)',
    // households: 'Households',

    // demographicIndex_Value: 'Demographic Index',
    // lowIncome_PCT_Value: 'Pct. Low Income (<2x poverty level)',

    // peopleOfColor_PCT_Value: 'Pct. Minority Population',
    // lesshS_PCT_Value: 'Pct. Less than High School Education',
    // lingisO_PCT_Value: 'Pct. Linguistically Isolated',
    // under5_PCT_Value: 'Pct. Under Age 5 ',
    // over64_PCT_Value: 'Pct. Over Age 64',
    // demographicIndex_PercentRank: 'Demographic Index percentile',
    // lowIncome_PCT_PercentRank: 'Pct. Low Income (<2x poverty level) percentile',

    // peopleOfColor_PCT_PercentRank: 'Pct. Minority Population percentile',
    // lesshS_PCT_PercentRank: 'Pct. Less than High School Education percentile',
    // lingisO_PCT_PercentRank: 'Pct. Linguistically Isolated percentile',
    // under5_PCT_PercentRank: 'Pct. Under Age 5 percentile',
    // over64_PCT_PercentRank: 'Pct. Over Age 64 percentile',
    // prE1960_PCT_PercentRank: 'Pct. Housing Units Built Prior to 1960 (lead paint indicator) percentile',
    // Climate Risk
    // heatIndexPresent_Value: 'Heat Index in 2010 (°F)',
    // heatIndex2050_Value: 'Heat Index in 2050 (°F)',
    // heatIndex2100_Value: 'Heat Index in 2100 (°F)',
    // heatIndex2050_PercentRank: 'Heat Index in 2050 percentile',
    // heatIndex2100_PercentRank: 'Heat Index in 2100 percentile',
    // heatIndexPresent_PercentRank: 'Heat Index in 2010 percentile',

    'acs_Under5_PCT': 'Under 5 Years',
    'acs_Over62_PCT': 'Over 62 Years'
};
