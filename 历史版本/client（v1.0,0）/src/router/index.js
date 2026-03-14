import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/sleep',
    name: 'sleep',
    component: () => import('../views/Sleep.vue')
  },
  {
    path: '/feeding',
    name: 'feeding',
    component: () => import('../views/Feeding.vue')
  },
  {
    path: '/solid-food',
    name: 'solidFood',
    component: () => import('../views/SolidFood.vue')
  },
  {
    path: '/diaper',
    name: 'diaper',
    component: () => import('../views/Diaper.vue')
  },
  {
    path: '/growth',
    name: 'growth',
    component: () => import('../views/Growth.vue')
  },
  {
    path: '/data',
    name: 'data',
    component: () => import('../views/DataManagement.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router