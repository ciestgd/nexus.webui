<template>
    <div class="header">
        <img class="logo" style="color: #fff" :src="epaLogo" />
        <img class="logo" src="/favicon.ico" />
        <!-- <el-tooltip
            effect="customized"
            content="NEXUS is a multi-pollutant risk based analysis tool to identify and evaluate overlapping areas of high ambient level and health risks associated with PM2.5, O3, and air toxics."
            placement="bottom"
        >
        </el-tooltip> -->
        <div class="title">
            <div class="main">
                Nexus Web Beta
                <el-tooltip effect="customized" content="version notes" placement="bottom">
                    <span class="version" @click="goto('/version')">{{ version }}</span>
                </el-tooltip>
            </div>
            <div class="sub">Multi-Pollutant Air Quality Planning Screening Tool</div>
        </div>

        <div class="right-float">
            <ZoomSelect :activeName="activeComponent" @setName="handleActiveName" />
            <div style="display: flex; align-items: center" id="BaseMapDivContent">
                <BaseMapIndex :activeName="activeComponent" @setName="handleActiveName" />
                <MapLayer :activeName="activeComponent" @setName="handleActiveName" />
            </div>
            <DataContent :activeName="activeComponent" @setName="handleActiveName" />
            <!-- <MPRiskRanking :activeName="activeComponent" @setName="handleActiveName" /> -->
            <div style="display: flex; align-items: center" id="MonitorAndEmissionDivContent">
                <EmissionSources :activeName="activeComponent" @setName="handleActiveName" />
                <MonitorSites :activeName="activeComponent" @setName="handleActiveName" />
            </div>

            <MeteorologicalSites :activeName="activeComponent" @setName="handleActiveName" />
            <ProximityAnalysis v-if="advancedOptionStore.advancedMode" :activeName="activeComponent" @setName="handleActiveName" />
            <ReportingRegionalPacket :activeName="activeComponent" @setName="handleActiveName" v-if="isDemo && false" />
            <Configurations :activeName="activeComponent" @setName="handleActiveName" />
        </div>
    </div>
</template>

<script setup>
import epaLogo from '@/assets/images/epa_logo.svg';
import { versionList } from '@/libs/version';
import ZoomSelect from './ZoomSelect/index.vue';
import BaseMapIndex from './BaseMap/index.vue';
import MapLayer from './MapLayer/index.vue';
import DataContent from './Data/index.vue';
// import MPRiskRanking from './MPRiskRanking/index.vue';
import EmissionSources from './EmissionSources/index.vue';
import MonitorSites from './MonitorSites/index.vue';
import MeteorologicalSites from './MeteorologicalSites/index.vue';
import ProximityAnalysis from './ProximityAnalysis/index.vue';
import ReportingRegionalPacket from './ReportingRegionalPacket/index.vue';
import Configurations from './Configuration/index.vue';
import { useSidebarStore } from '@/store/sidebar';
import { useAdvancedOptionStore } from '@/store/advanced-option';

const version = 'V' + (versionList[0].version || '1.0');
const sidebarStore = useSidebarStore();
const advancedOptionStore = useAdvancedOptionStore();

const activeComponent = ref('');
const handleActiveName = (name) => {
    activeComponent.value = name;
};
const router = useRouter();

const isDemo = computed(() => {
    return location.hostname.includes('demo') || location.hostname == 'localhost';
});

const goto = (path) => {
    router.push(path);
};
watch(
    () => sidebarStore.isSetDefault,
    (val) => {
        if (val) {
            activeComponent.value = '';
        }
    }
);
</script>
<style lang="scss">
.icon-item {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #076fe5;
    margin-right: 8px;
    cursor: pointer;
    img {
        width: 40px;
        height: 40px;
    }
    &:hover {
        background-color: #65adff;
    }
}

.active {
    background-color: #65adff;
}
</style>
<style scoped lang="scss">
.header {
    height: 100%;
    display: flex;
    align-items: center;
    color: white;
    // background-color: #0071bc;
    background-color: #004ca3;
    white-space: nowrap;
    overflow: hidden;

    .logo {
        height: 48px;
        padding-left: 2px;
    }

    .title {
        padding-left: 4px;
        .main {
            font-weight: bold;
            font-size: 24px;
            position: relative;
            display: flex;
            align-items: center;
        }
        .sub {
            margin-top: 4px;
            font-size: 14px;
        }
    }
    .version {
        font-size: 12px;
        margin-left: 5px;
        // margin-top: -14px;
        // position: relative;
        // top: -10px;
        // left: -75px;
        cursor: pointer;
        text-decoration: underline;
    }
    .nav-bar {
        height: 100%;
        display: flex;
        align-items: end;
        ul {
            display: flex;
            margin: 0;
            padding-left: 14px;
            li {
                list-style-type: none;
                margin: 3px 5px 0 3px;

                button {
                    width: 90px;
                    padding: 7px 12px 10px;
                    border: none;
                    border-radius: 6px 6px 0 0;
                    color: rgba(26, 26, 26, 0.6);
                    background-color: #bfdbee;
                    font-weight: 400;
                    &.active {
                        color: #363a28;
                        background-color: #fff;
                    }

                    &:hover {
                        cursor: pointer;
                    }

                    &:not(.active):hover {
                        background-color: #e6f1f8;
                    }
                }
            }
        }
    }

    .right-float {
        display: flex;
        box-sizing: border-box;

        margin-left: auto;
        .selector {
            display: inline-flex;
            align-items: center;
            margin-right: 16px;
            .label {
                // font-family: 'Times New Roman', Arial, sans-serif;

                font-size: 18px;
                font-weight: bold;
            }
            .el-select {
                margin-left: 8px;
            }
        }
        .el-link {
            color: white;
        }
        .full-screen {
            margin-right: 8px;
        }
        // :deep(.el-link__inner) {
        //     // font-family: 'Times New Roman', Arial, sans-serif;
        // }
    }
}
</style>
