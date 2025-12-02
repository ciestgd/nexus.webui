import { createRouter, createWebHashHistory } from 'vue-router';
import nProgress from '../plugins/nprogress';
import Layout from '../layout/Index.vue';
import qs from 'qs';

const routes = [
    {
        path: '/',
        redirect: '/map',
        component: Layout,
        children: [
            {
                path: 'map',
                name: 'Map',
                component: () => import('../views/Map/index.vue'),
            },
            {
                path: '/version',
                component: () => import('../views/Map/Version/index.vue'),
            },
        ],
    },
    {
        path: '/403',
        component: () => import('../views/403.vue'),
    },
    {
        path: '/404',
        component: () => import('../views/404.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404',
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    parseQuery: qs.parse,
    stringifyQuery: qs.stringify,
});

router.beforeEach(() => {
    nProgress.start();
});

router.afterEach(() => {
    nProgress.done();
});

export default router;
