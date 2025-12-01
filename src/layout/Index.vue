<template>
    <el-container>
        <el-header :height="headerHeight">
            <Header />
        </el-header>
        <el-main>
            <router-view v-slot="{ Component }">
                <transition mode="out-in">
                    <keep-alive :include="includes">
                        <component :is="Component" />
                    </keep-alive>
                </transition>
            </router-view>
        </el-main>
        <!-- <el-footer height="16px">
            <Footer />
        </el-footer> -->
    </el-container>
</template>

<script setup>
import Header from './Header/index.vue';

const includes = ['Map', 'Charts', 'Data'];

const headerHeight = '80px';
</script>

<style scoped lang="scss">
.el-header {
    padding: 0;
    //box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
}
.el-main {
    padding: 0;
    --header-height: v-bind(headerHeight);
}
.el-footer {
    padding: 0;
}
</style>
<style lang="scss"></style>
