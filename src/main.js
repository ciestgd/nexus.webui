import { createApp } from 'vue';
import App from './App.vue';
import useElementPlus from './plugins/element';
import usePinia from './plugins/pinia';
import router from './router';

import { setupWatchers } from './libs/watchers';

import './plugins/moment';

import 'normalize.css';
import './assets/iconfont/iconfont';
import './assets/styles/common.scss';

const app = createApp(App);
usePinia(app);
useElementPlus(app);
app.use(router);
// 注册全局监听
setupWatchers();
app.mount('#app');

if (import.meta.env.DEV) {
    // 生成动态导入的 ElementPlus 组件 ts 语法提示
    import.meta.glob('./views/**/*.vue', { eager: true });
}
