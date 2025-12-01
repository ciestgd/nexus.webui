<template>
    <Dialog title="Advanced Option" height="360" width="450" ref="advancedOptionRef">
        <div class="advanced-option">
            <div class="advanced-content">
                <p>
                    The advanced option of Nexus allows users to look at data for PM2.5, ozone, and heat risk as percentiles. The user may select to rank the percentiles nationally
                    or based on a selected region. The proximity analysis function, utilizing percentiles, is also viewable through the advanced option. 
                </p>
                <div class="radio-content">
                    Advanced Option:
                    <div>
                        <el-radio-group v-model="advancedMode">
                            <el-radio :value="false">OFF</el-radio>
                            <el-radio :value="true">ON</el-radio>
                        </el-radio-group>
                    </div>
                </div>
            </div>
            <div class="advanced-btn">
                <el-button type="primary" @click="handleSubmit">Submit</el-button>
                <el-button @click="handleClose">Cancel</el-button>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { useAdvancedOptionStore } from '@/store/advanced-option';
const advancedOptionStore = useAdvancedOptionStore();
const advancedOptionRef = ref();
const advancedMode = ref(false);
const handleSubmit = () => {
    localStorage.setItem('advancedMode', JSON.stringify(advancedMode.value));
    advancedOptionStore.advancedMode = advancedMode.value;
    handleClose();
};
const handleClose = () => {
    advancedOptionRef.value.handleClose();
};

onMounted(async () => {
    await nextTick();
    let model = localStorage.getItem('advancedMode');
    if (model) {
        advancedOptionStore.advancedMode = JSON.parse(model);
        advancedMode.value = advancedOptionStore.advancedMode;
    }
});
</script>
<style scoped lang="scss">
.advanced-option {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 15px;
    .advanced-content {
        width: 100%;
        flex: 1;
        font-size: 18px;
        p {
            margin: 0;
            line-height: 24px;
            // text-indent: 2em;
        }
        .radio-content {
            margin-top: 20px;
        }
    }
    .advanced-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 5px;
    }
}
</style>
