import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('../pages/IndexPage.vue'),
      },
    ],
  },

  // Catch-all 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/IndexPage.vue'),
  },
]

export default routes
