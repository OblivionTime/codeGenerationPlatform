/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-05-17 12:45:40
 * @LastEditors: solid
 * @LastEditTime: 2022-12-02 11:02:00
 */
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'


/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [


  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
    meta: { title: '404' },
  },

  {
    path: '/',
    component: Layout,
    redirect: '/index',
    meta: { title: '管理平台', icon: 'table' },
    children: [
      {
        path: '/index',
        name: 'Index',
        component: () => import('@/views/Index/index'),
        meta: { title: '表格', icon: 'table' },
      },
      {
        path: '/api',
        name: 'API',
        component: () => import('@/views/Api/index'),
        meta: { title: 'API', icon: 'table' },
      },
      {
        path: '/form',
        name: 'FORM',
        component: () => import('@/views/Form/index'),
        meta: { title: '表单', icon: 'form' },
      },
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true, meta: { title: '404' }, }
]

const createRouter = () => new Router({
  mode: 'hash', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
