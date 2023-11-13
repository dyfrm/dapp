import { createRouter, createWebHistory } from 'vue-router'
import AppPage from "../views/AppPage.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: AppPage,
  },
  {
    path: '/frame', 
    name: 'Frame', 
    component: AppPage,
  },  
  {
    path: '/frame/:id', 
    name: 'FrameID', 
    component: AppPage,
  },
  {
    path: '/collection', 
    name: 'Collection', 
    component: AppPage,
  },
  {
    path: '/collection/:id',
    name: 'CollectionID',
    component: AppPage,
  },
  {
    path: '/add',
    name: 'Add',
    component: AppPage,
  },
  {
    path: '/add/:id',
    name: 'AddID',
    component: AppPage,
  },
  {
    path: '/donate',
    name: 'Donate',
    component: AppPage,
  },  
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
