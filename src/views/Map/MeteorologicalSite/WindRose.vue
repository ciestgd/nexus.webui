<template>
    <Dialog title="Wind Rose (NOAA data 2017)" @on-closed="handleClose" height="450" width="400">
        <div class="wind-rose-box">
            <div class="select-box">
                <el-radio-group class="select" size="small" v-model="dataType" @change="handleSelect">
                    <el-radio :value="item.value" size="small" v-for="item in typeOptions">{{ item.label }}</el-radio>
                </el-radio-group>
            </div>

            <div id="windrose" style="width: 350px; height: 350px"></div>
        </div>
    </Dialog>
</template>
<script setup>
import * as echarts from 'echarts';
import { useMeteorologicalSite } from '@/store/meteorological-site';
const meteorologicalSite = useMeteorologicalSite();
let myChart;
const dataType = ref('annual');
const typeOptions = ref([
    {
        label: 'Annual',
        value: 'annual',
    },
    {
        label: 'Q1',
        value: 'spring',
    },
    {
        label: 'Q2',
        value: 'summer',
    },
    {
        label: 'Q3',
        value: 'autumn',
    },
    {
        label: 'Q4',
        value: 'winter',
    },
]);
const chartOptions = ref({
    textStyle: {
        fontWeight: 'bold',
        fontFamily: 'Calibri',
    },
    tooltip: {},
    title: {
        text: 'USW00005381',
        // subtext: 'USW00005381',
        left: 'center',
        bottom: '0%',
    },
    angleAxis: {
        type: 'category',
        data: [],
        boundaryGap: 0,
    },
    radiusAxis: {},
    polar: {
        radius: [0, '65%']
    },
    series: [
        {
            type: 'bar',
            data: [1, 2, 3, 4, 3, 5, 1, 2, 1, 2, 3, 4, 3, 5, 1, 2],
            coordinateSystem: 'polar',
            name: '0-3 m/s',
            color: '#0001F7',
            stack: 'windrose',
        },
        {
            type: 'bar',
            data: [2, 4, 6, 1, 3, 2, 1, 3, 1, 2, 3, 4, 3, 5, 1, 2],
            coordinateSystem: 'polar',
            name: '3-4 m/s',
            color: '#00FFFF',
            stack: 'windrose',
        },
        {
            type: 'bar',
            data: [1, 2, 3, 4, 1, 2, 5, 5, 1, 2, 3, 4, 3, 5, 1, 2],
            coordinateSystem: 'polar',
            name: '4-6 m/s',
            color: '#BEFE00',
            stack: 'windrose',
        },
        {
            type: 'bar',
            data: [1, 2, 3, 4, 1, 2, 5, 5, 1, 2, 3, 4, 3, 5, 1, 2],
            coordinateSystem: 'polar',
            name: '>6 m/s',
            color: '#FFA800',
            stack: 'windrose',
        },
    ],
    legend: {
        show: true,
        data: ['0-3 m/s', '3-4 m/s', '4-6 m/s', '>6 m/s'],
        top: '-1.5%',
    },
});
const handleClose = () => {
    myChart = null;
};
const labels = ref(['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']);
const handleSelect = () => {
    setChartOption();
};
const divideData = (arr) => {
    let type = dataType.value;
    if (type == 'spring') {
        return arr.filter((item) => item.month >= 3 && item.month <= 5);
    } else if (type == 'summer') {
        return arr.filter((item) => item.month >= 6 && item.month <= 8);
    } else if (type == 'autumn') {
        return arr.filter((item) => item.month >= 9 && item.month <= 11);
    } else if (type == 'winter') {
        return arr.filter((item) => (item.month >= 1 && item.month <= 2) || item.month == 12);
    } else {
        return arr;
    }
};
const resetData = () => {
    let data = meteorologicalSite.windRoseData;
    let array = [[], [], [], []];
    labels.value.forEach((key) => {
        let item = data[key];
        let lessThree = item.lessThree;
        let threeToFour = item.threeToFour;
        let fourToSix = item.fourToSix;
        let overSix = item.overSix;
        lessThree = divideData(lessThree);
        threeToFour = divideData(threeToFour);
        fourToSix = divideData(fourToSix);
        overSix = divideData(overSix);
        array[0].push(lessThree.length);
        array[1].push(threeToFour.length);
        array[2].push(fourToSix.length);
        array[3].push(overSix.length);
    });
    return array;
};
const setChartOption = () => {
    let array = resetData();
    if (array.length) {
        chartOptions.value.series[0].data = array[0];
        chartOptions.value.series[1].data = array[1];
        chartOptions.value.series[2].data = array[2];
        chartOptions.value.series[3].data = array[3];
    }
    chartOptions.value.angleAxis.data = labels.value;
    chartOptions.value.title.text = `${meteorologicalSite.stationName}`;
    chartOptions.value.title.subtext = meteorologicalSite.stationID;
    myChart.setOption(chartOptions.value);
};
onMounted(async () => {
    await nextTick();
    myChart = echarts.init(document.getElementById('windrose'));
    setChartOption();
});
</script>
<style scoped lang="scss">
.wind-rose-box {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 5px;
    display: flex;
    align-items: center;
    // justify-content: center;
    flex-direction: column;
    .select-box {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #000;
        box-sizing: border-box;
        padding: 3px;
        margin-bottom: 5px;
    }
}
</style>
