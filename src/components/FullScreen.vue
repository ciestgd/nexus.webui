<template>
    <span>
        <el-tooltip effect="customized" :content="isFullscreen ? 'Minimize' : 'Windowed'" placement="bottom">
            <Icon class="icon-button" :name="isFullscreen ? 'fullscreen-shrink' : 'fullscreen-expand'" size="18" @click="handleScreenfull" />
        </el-tooltip>
    </span>
</template>

<script setup>
import screenfull from 'screenfull';

const isFullscreen = ref(false);
screenfull.on('change', () => {
    isFullscreen.value = screenfull.isFullscreen;
});

const handleScreenfull = () => {
    if (!screenfull.isEnabled) {
        ElMessage.warning('Your browser does not support full screen');
    } else {
        screenfull.toggle();
    }
};

onKeyStroke('F11', (e) => {
    e.preventDefault();
    handleScreenfull();
});
</script>
