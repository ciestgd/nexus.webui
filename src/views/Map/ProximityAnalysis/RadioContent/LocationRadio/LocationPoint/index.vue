<template>
    <div class="location-point">
        <div class="tips">Separate each location with semicolon</div>
        <el-input v-model="locationValue" placeholder="Please input" />
    </div>
</template>
<script setup>
import { fromLonLat } from 'ol/proj';
const locationValue = ref('30.01,-90.61; 30.26,-90.95; 30.51,-91.23');

const getSites = () => {
    let data = [];
    if (locationValue.value.trim()) {
        let locationList = [];
        let arr = locationValue.value.split(';');
        arr.forEach((local) => {
            let item = local.replace(' ', '');
            let itemArr = item.split(',');
            let obj = {
                id: item,
                name: item,
                lat: Number(itemArr[0]),
                lng: Number(itemArr[1]),
            };
            obj.center = fromLonLat([obj.lng, obj.lat]);
            locationList.push(obj);
        });
        data = data.concat(locationList);
    }
    return data;
};
defineExpose({
    getSites,
});
</script>
<style scoped lang="scss">
.location-point {
    margin-top: 10px;
    width: 100%;
    .tips {
        font-size: 12px;
        color: #6fa76f;
        // margin-left: 5px;
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 5px;
    }
}
</style>
