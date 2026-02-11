import type { RouteRecordRaw } from 'vue-router'

const languageRoutes: RouteRecordRaw[] = [
  {
    path: '/languages',
    name: 'languages',
    component: () => import('../views/language/LanguageIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/languages/create',
    name: 'language-create',
    component: () => import('../views/language/LanguageCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/languages/:id/edit',
    name: 'language-edit',
    component: () => import('../views/language/LanguageEdit.vue'),
    meta: { requiresAuth: true }
  }
]

export default languageRoutes
