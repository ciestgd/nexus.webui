<template>
    <div class="transfer-content">
        <div class="tips">Select monitoring site(s) on map</div>
        <MyTransfer :props="{ key: 'id' }" :titles="['Monitoring Sites', 'Selected']" filterable v-model="mutiSelectValue" :data="mutiSelectList">
            <template #default="{ option }">
                <span @mouseover="(event) => handleMutiSelectHover(option, event)" style="color: #000">{{ option.label }}</span>
            </template>
        </MyTransfer>
    </div>
</template>
<script setup>
const emit = defineEmits(['handleHover']);
const mutiSelectValue = ref([]);
const mutiSelectList = ref([]);
const handleMutiSelectHover = (option, event) => {
    let data = `${option.label}`;
    emit('handleHover', data, event.currentTarget);
};
const setMultiSelect = (monitorSites, setValue = true) => {
    let monitorList = monitorSites.map((item) => {
        item.label = item.value + ' ' + item.siteName;
        return item;
    });
    let list = [].concat(monitorList);
    let idList = mutiSelectList.value.map((item) => item.id);
    let isNeetlist = list.filter((item) => idList.indexOf(item.id) === -1);

    mutiSelectList.value = mutiSelectList.value.concat(isNeetlist);
    if (setValue) {
        let mutiList = new Set(mutiSelectValue.value.concat(list.map((item) => item.id)));
        mutiSelectValue.value = [...mutiList];
        console.log('mutiSelectValue', mutiSelectValue.value);
    }
};
const getSites = () => {
    return mutiSelectList.value.filter((item) => mutiSelectValue.value.indexOf(item.id) !== -1);
};
const clearData = () => {
    mutiSelectValue.value = [];
};
defineExpose({
    setMultiSelect,
    clearData,
    getSites,
});
</script>
<style scoped lang="scss">
.transfer-content {
    min-width: 690px;
    margin-top: 15px;
    .tips {
        font-size: 12px;
        color: #6fa76f;
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 5px;
    }
    .el-transfer {
        :deep(.el-transfer-panel) {
            width: 280px;
        }
        :deep(.el-transfer__buttons) {
            padding: 0 12px;
        }
        :deep(.el-transfer-panel__filter) {
            width: 100%;
            margin: 0;
        }
        :deep(.el-transfer-panel__header) {
            height: 32px;
        }
    }
}
</style>
