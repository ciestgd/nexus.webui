<template>
    <Dialog title="Boundaries and Base Maps" height="380" width="330" :isCollapse="true" :isContentDraggable="false">
        <BaseMap />
    </Dialog>
</template>
<script setup>
import BaseMap from './BaseMapContent.vue';
</script>
<style scoped lang="scss"></style>
