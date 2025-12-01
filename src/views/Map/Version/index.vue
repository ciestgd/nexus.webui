<template>
    <div class="version-content">
        <div class="breadcrumb-content">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">Map</el-breadcrumb-item>
                <el-breadcrumb-item>Version</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="returnBtn">
                <el-tooltip effect="customized" content="Back home" placement="bottom">
                    <el-button type="danger" @click="gotoHome">
                        <Icon class="icon-button icon" name="close" size="20" />
                    </el-button>
                </el-tooltip>
            </div>
        </div>
        <div class="version-main" ref="versionRef">
            <el-card class="box-card" v-for="item in versionList">
                <div class="version-title">Version {{ item.version }}</div>
                <div class="version-date">{{ item.date }}</div>
                <div class="version-content-item" v-if="item?.updates.length">
                    <div class="version-content-title">Updates</div>
                    <ul class="version-content-list">
                        <li v-for="_item in item.updates">{{ _item }}</li>
                    </ul>
                </div>
                <div class="version-content-item" v-if="item?.bugs.length">
                    <div class="version-content-title">Bug fixes</div>
                    <ul class="version-content-list">
                        <li v-for="_item in item.bugs">{{ _item }}</li>
                    </ul>
                </div>
            </el-card>
        </div>
    </div>
</template>
<script setup>
import { OverlayScrollbars } from 'overlayscrollbars';
import { versionList } from '../../../libs/version.js';
const versionRef = ref(null);
const router = useRouter();
onMounted(() => {
    OverlayScrollbars(versionRef.value, {
        overflow: {
            x: 'hidden',
            y: 'scroll',
        },
    });
});
const gotoHome = () => {
    router.push({
        path: '/map',
    });
};
</script>
<style scoped lang="scss">
.version-content {
    width: 100%;
    height: calc(100vh - var(--header-height));
    box-sizing: border-box;
    padding: 15px;
    display: flex;
    flex-direction: column;
    .breadcrumb-content {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .returnBtn {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    .version-main {
        width: 100%;
        flex: 1;
        margin-top: 15px;
        border: 1px solid #ccc;
        border-radius: 10px;
        box-sizing: border-box;
        padding: 15px;
        .box-card {
            width: 100%;
            .version-title {
                font-size: 20px;
                font-weight: bold;
            }
            .version-date {
                font-size: 16px;
                margin-top: 16px;
                margin-bottom: 24px;
            }
            .version-content-item {
                .version-content-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 16px;
                }
                .version-content-list {
                    margin: 0;
                    li {
                        font-size: 14px;
                    }
                    li + li {
                        margin-top: 5px;
                    }
                }
            }
            .version-content-item + .version-content-item {
                margin-top: 24px;
            }
        }
        .box-card + .box-card {
            margin-top: 24px;
        }
    }
}
</style>
