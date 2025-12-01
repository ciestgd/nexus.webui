<template>
    <Dialog title="Set Opacity" width="330" ref="colorBarRef" height="100">
        <div class="opcity-box">
            <div class="opacity-content">Opacity: <el-slider class="slider-box" v-model="opacityValue" show-input @change="resetList" :min="0" :max="100" size="small" /></div>
        </div>
    </Dialog>
</template>
<script setup>
import { useMyLayerColorStore } from '@/store/my-layer-color';
import { ElMessageBox } from 'element-plus';
const myLayerColorStore = useMyLayerColorStore();
const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    type: {
        type: String,
        default: '',
    },
});

const opacityValue = ref(props.data.opacityValue || 100);

const resetList = () => {
    let id = props.data.id;
    let list = myLayerColorStore[props.type][0];
    list.children.forEach((item) => {
        if (item.id === id) {
            item.opacityValue = opacityValue.value;
        }
    });
    sessionStorage.setItem(props.type, JSON.stringify(myLayerColorStore[props.type]));
};
</script>
<style scoped lang="scss">
.opcity-box {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    .opacity-content {
        width: 100%;
        display: flex;
        align-items: center;
        // justify-content: center;
        flex-wrap: wrap;
        .slider-box {
            margin-top: 5px;
            margin-left: 10px;
        }
    }
}
</style>
