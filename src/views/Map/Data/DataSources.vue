<template>
    <Dialog width="90%" height="90%" @onFullScreen="setFullScreen" :unFullScreen="false" title="Data Input Description and Web Links">
        <div class="data-sources-content">
            <el-table :data="tableData" size="small" border class="sourcesTable">
                <el-table-column prop="data" label="Data Input File Names" />
                <el-table-column class-name="level-cell" align="center" prop="source" label="Source">
                    <template #default="scope">
                        <div v-if="scope.row.sourceType && scope.row.sourceType === 'tips'" class="level-item">
                            Hybrid <a :href="scope.row.sources[0].link" class="source-link" target="_blank" rel="noopener noreferrer">{{ scope.row.sources[0].name }}</a
                            >/<a :href="scope.row.sources[1].link" class="source-link" target="_blank" rel="noopener noreferrer">{{ scope.row.sources[1].name }}</a> output for
                            toxics
                        </div>
                        <div v-else-if="scope.row.sourceType && scope.row.sourceType === 'and'" class="level-item level-item-flex-box">
                            <div v-for="(item, index) in scope.row.sources">
                                <!-- andLink -->
                                <a :href="item.link" class="source-link" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
                                <span v-if="index !== scope.row.sources.length - 1">&</span>
                            </div>
                        </div>
                        <div v-else>
                            <div class="level-item" v-for="item in scope.row.sources">
                                <a :href="item.link" class="source-link" v-if="item.link" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
                                <div v-if="!item.link">{{ item.name }}</div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="level" class-name="level-cell" align="center" label="Level of Data">
                    <template #default="scope">
                        <div>
                            <div class="level-item" v-for="item in scope.row.level">{{ item }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="date" align="center" label="Data Years in Nexus" />
            </el-table>
        </div>
    </Dialog>
</template>
<script setup>
import { ref } from 'vue';
const tableData = ref([
    {
        data: 'O3 and PM2.5 emissions & source data ',
        sources: [
            {
                name: 'NEI',
                link: 'https://www.epa.gov/air-emissions-inventories/national-emissions-inventory-nei',
            },
        ],
        level: ['County and facility-level'],
        date: '2017, 2020',
    },
    {
        data: 'Air Toxics emissions & source data',
        sources: [
            {
                name: 'NEI',
                link: 'https://www.epa.gov/air-emissions-inventories/national-emissions-inventory-nei',
            },
        ],
        level: ['County and facility-level'],
        date: '2017, 2020',
    },
    {
        data: 'O3 and PM2.5 modeled concentration data',
        sources: [
            {
                name: 'Fused air quality surfaces',
                link: 'https://www.epa.gov/hesc/rsig-related-downloadable-data-files',
            },
        ],
        level: ['County/Census tract level'],
        date: '2019/2018/2017',
    },
    {
        data: 'Air Toxics modeled concentration data',
        sourceType: 'tips',
        sources: [
            {
                name: 'CMAQ',
                link: 'https://www.epa.gov/cmaq',
            },
            {
                name: 'AERMOD',
                link: 'https://www.epa.gov/scram/air-quality-dispersion-modeling-preferred-and-recommended-models#aermod',
            },
        ],
        level: ['County/Census tract level'],
        date: '2019/2018/2017',
    },
    {
        data: 'O3 and PM2.5 risk data',
        sources: [
            {
                name: 'BenMAP',
                link: 'https://www.epa.gov/benmap',
            },
        ],
        level: ['County/Census tract level'],
        date: '2020/2019/2018/2017',
    },
    {
        data: 'Air Toxics risk data',
        sources: [
            {
                name: 'AirToxScreen',
                link: 'https://www.epa.gov/AirToxScreen',
            },
        ],
        // level: ['County/Census tract level'],
        // level: ['Census tract level'],
        level: ['Census block level'],
        // date: '2019/2018/2017 & 2014',
        // date: '2020/2019/2018/2017'
        date: '2020',
    },
    {
        data: 'Advance areas',
        sources: [
            {
                name: 'OAQPS/AQPD',
                link: 'https://www.epa.gov/advance',
            },
        ],
        level: ['County level'],
        date: '2021',
    },
    {
        data: 'Nonattainment Areas and Design Values (DV)',
        sources: [
            {
                name: 'EPA Greenbook',
                link: 'https://www.epa.gov/green-book',
            },
            {
                name: 'Air Trends',
                link: 'https://www.epa.gov/air-trends/air-quality-design-values',
            },
        ],
        level: ['County level'],
        date: '2012-2020',
    },
    {
        data: 'Tribal boundaries',
        sources: [
            {
                name: 'EPA Public Website',
                link: 'https://www.epa.gov/geospatial/guidance-using-tribal-boundaries-areas-and-names-resources',
            },
        ],
        level: ['County level'],
        date: '2018',
    },
    // {
    //     data: 'Socio-economic & demographic data',
    //     sources: [
    //         {
    //             name: 'EJSCREEN',
    //             link: 'https://www.epa.gov/ejscreen',
    //         },
    //     ],
    //     level: ['County/Census tract level'],
    //     date: '2020',
    // },
    {
        data: 'O3 and PM2.5 Monitoring data (DVs)',
        sources: [
            {
                name: 'OAQPS/AQPD',
                link: 'https://www.epa.gov/aqs',
            },
        ],
        level: ['Site-level'],
        date: '2002-2022',
    },
    {
        data: 'Air toxics monitoring data (22 HAPs)',
        sources: [
            {
                name: 'Air Toxics Data Archive',
                link: 'https://www.epa.gov/amtic/amtic-ambient-monitoring-archive-haps',
            },
        ],
        level: ['Site-level'],
        date: '2003-2020',
    },
    {
        data: 'GHG emissions',
        sourceType: 'and',
        sources: [
            {
                name: 'NEI',
                link: 'https://www.epa.gov/air-emissions-inventories/national-emissions-inventory-nei',
            },
            {
                name: 'GHG Inventory',
                link: 'https://www.epa.gov/ghgemissions/inventory-us-greenhouse-gas-emissions-and-sinks',
            },
        ],
        level: ['County and facility-level'],
        date: '2017, 2020',
    },
    {
        data: 'Class I areas',
        sources: [
            {
                name: 'EPA Class 1 Federal Areas Website',
                link: 'https://edg.epa.gov/data/public/OAR/OAQPS/Class1/Class1Areas.zip',
            },
        ],
        level: ['County level'],
        date: '2016',
    },
    // {
    //     data: 'CEJST disadvantaged community areas',
    //     sources: [
    //         {
    //             name: 'CEJST data',
    //             link: 'https://screeningtool.geoplatform.gov/en/downloads',
    //         },
    //     ],
    //     level: ['Census tract level'],
    //     date: '2021',
    // },
    // {
    //     data: 'NO2 satellite data',
    //     sources: [
    //         {
    //             name: 'From OAQPS team',
    //             link: '',
    //         },
    //     ],
    //     level: ['Census tract '],
    //     date: '2019',
    // },
    // {
    //     data: 'Heat Index',
    //     sources: [
    //         {
    //             name: 'OAQPS & ORD',
    //             link: '',
    //         },
    //     ],
    //     level: ['Site-level'],
    //     date: '2000, 2050, 2100',
    // },
    {
        data: 'Meteorological data',
        sources: [
            {
                name: 'NOAA website',
                link: 'https://www.ncei.noaa.gov/maps/hourly',
            },
        ],
        level: [],
        date: '2017',
    },
    {
        data: 'Age Demographics',
        sources: [
            {
                name: 'U.S. Census Bureau',
                link: 'https://data.census.gov/table/ACSST5Y2023.S0101?t=Age+and+Sex&g=010XX00US$1400000',
            },
        ],
        level: ['Census tract level'],
        date: '2023',
    },
    // {
    //     data: 'Climate risk data',
    //     sources: [
    //         {
    //             name: 'From OAQPS team',
    //             link: '',
    //         },
    //     ],
    //     level: ['Census tract'],
    //     date: '',
    // },
]);
const isfullscreen = ref(false);
const setFullScreen = (val) => {
    isfullscreen.value = val;
};
</script>
<style lang="scss" scoped>
.data-sources-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 5px;
    // display: flex;
    // overflow: hidden;
    .sourcesTable {
        // height: 300px;
        height: 100%;
        width: 100%;
        // flex: 1;
        font-size: 14px;
        color: #000;
        --el-table-border: 1px solid #000;
        --el-table-border-color: #000;
        // border-color: #000 !important;
        :deep(.el-table__cell) {
            padding: 0;
        }
        :deep(.level-cell) {
            .cell {
                padding: 0 !important;
            }
        }
        .level-item {
            text-align: center;
        }
        .level-item-flex-box {
            display: flex;
            align-items: center;
            justify-content: center;
            span {
                margin: 3px;
                color: #000;
            }
        }
        .source-link {
            color: blue;
        }

        .level-item + .level-item {
            // border-top: 1px solid #ebeef5;
            border-top: 1px solid #000;
        }
    }
}
</style>
