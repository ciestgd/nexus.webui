import { createPinia } from 'pinia';
import { nextTick } from 'vue';

export default (app) => {
    const pinia = createPinia();
    pinia.use(({ store }) => {
        if (typeof store.init === 'function') {
            nextTick(store.init);
        }
    });
    app.use(pinia);
};
