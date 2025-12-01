<template>
    <el-tour v-model="quickStartStore.tourVisible" :current="current">
        <el-tour-step
            v-for="step in stepList"
            :target="step.target"
            :next-button-props="step.nextButtonProps"
            :prev-button-props="step.prevButtonProps"
            :show-arrow="step.showArrow"
            :placement="step.placement"
            :content-style="step.contentStyle"
            :title="step.title"
            :description="step.description"
            @close="step.handleClose"
        ></el-tour-step>
    </el-tour>
</template>
<script setup>
import { useQuickStartStore } from '@/store/quick-start.js';
import { useSidebarStore } from '@/store/sidebar';
const quickStartStore = useQuickStartStore();
const sidebarStore = useSidebarStore();
const current = ref(0);
const handleMapNext = async () => {
    console.log('handleMapNext', current.value);
    sidebarStore.activeTabName = 'home';
    sidebarStore.collapse = false;
    await nextTick();
};
const stepList = ref([
    {
        target: '#mapDivContent',
        nextButtonProps: {
            onClick: handleMapNext,
        },
        prevButtonProps: null,
        title: 'Main Map',
        showArrow: false,
        placement: 'bottom-end',
        contentStyle: {
            top: '10%',
            left: '30%',
        },
        description:
            'The map shows areas with PM2.5, ozone, and/or air toxics metrics based on the users input in the left panel. The default values for PM2.5 and O3 are the NAAQS. For air toxics, the default is 50-in-1 million for the maximum block-level cancer risk and 1 for the non-cancer Hazard Index.',
    },
    {
        target: '#configurationDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'Choosing a Data Scale',
        showArrow: true,
        placement: 'right',
        contentStyle: null,
        description: 'The top left panel allows you to switch between county and census tract-level data. Changes to the year of the data can be made where applicable. See the user manual for more information.',
    },
    {
        target: '#pmAndOzoneDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'PM2.5 and Ozone',
        showArrow: true,
        contentStyle: null,
        placement: 'right',
        description:
            'PM2.5 and O3 data can be viewed as ambient concentration data or mortality/morbidity data. You may toggle on and off the data of interest and change the scale as desired. The map will reflect data including and above the chosen scale value.',
    },
    {
        target: '#toxicsDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'Air Toxics',
        showArrow: true,
        contentStyle: null,
        placement: 'right',
        description:
            'Air toxics data is defaulted to the maximum block-level cancer risk in the census tract.  You may also toggle to look at non-cancer risk (respiratory Hazard Index). When clicking on a census tract or county, the census block(s) with a risk equal to or greater than the user selected risk will be displayed with a dotted pattern. When clicking on a census block, a pop-up with information, such as the census block ID number, will appear. Please visit AirToxScreen for a further detailed air toxics analysis.  https://www.epa.gov/AirToxScreen',
    },
    {
        target: '#resetDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'Reset Data',
        showArrow: true,
        contentStyle: null,
        placement: 'right',
        description:
            'Values in the home panel can be changed under Reset. You may reset to the default or change to risk-based default. The risk-based default changes PM2.5 and O3 displays from concentration to mortality rate risk value of 10person per 10k.',
    },
    {
        target: '#mapDivContent',
        nextButtonProps: null,
        prevButtonProps: {
            onClick: handleMapNext,
        },
        title: 'View Data for Selected Area',
        showArrow: false,
        placement: 'bottom-end',

        contentStyle: {
            top: '10%',
            left: '30%',
            // top: 'unset',
            // left: 'unset',
            // bottom: '10%',
            // right: '10%',
        },
        description: 'To view data, click on a county or census tract of interest. The home panel will automatically switch to the information panel for the selected area. ',
    },
    {
        target: '#BaseMapDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'Base Map and Map Layer',
        showArrow: true,
        placement: 'bottom-end',

        contentStyle: null,
        description: 'These two functions allow you to make modifications to the map by changing the base map display and adding or removing boundaries or layers. ',
    },
    {
        target: '#MonitorAndEmissionDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'Emission Sources and Monitor Sites ',
        showArrow: true,
        placement: 'bottom-end',

        contentStyle: null,
        description:
            'You can choose to display emission sources and/or monitor sites for your zoomed-to area or nation-wide. In the right panel you can select pollutants, make additional specification, and generate tables or figures.',
    },
    {
        target: '#MeteorologicalDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'Meteorological Sites',
        showArrow: true,
        placement: 'bottom-end',
        contentStyle: null,
        description: 'You can display meteorological sites for your zoomed-to area or nation-wide. Click on a site of interest for wind rose data.  ',
    },
    {
        target: '#mapDivContent',
        nextButtonProps: null,
        prevButtonProps: null,
        title: 'Right Click Function',
        showArrow: false,
        placement: 'bottom-end',
        contentStyle: {
            top: '10%',
            left: '30%',
        },
        description: 'You can right click on the map to clear all functions, reset to the default, reset the selected area, or save an image.',
    },
]);
</script>
<style lang="scss">
.el-tour__header {
    .el-tour__title {
        font-size: 18px;
    }
}
.el-tour__body {
    font-size: 16px;
}
</style>
<style scoped lang="scss"></style>
