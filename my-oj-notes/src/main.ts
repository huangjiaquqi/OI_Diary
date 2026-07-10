import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import HomeView from './views/HomeView.vue';
import SearchView from './views/SearchView.vue';

import './styles/main.css';
import './styles/sidebar.css';
import './styles/cards.css';
import './styles/tabs.css';
import './styles/modal.css';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/search', name: 'search', component: SearchView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');