import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Cookies from 'js-cookie'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Auth/Login.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'Sign Up',
      component: () => import('../views/Auth/signUp.vue'),
      meta: { requiresGuest: true },
    },
    // {
    //   path: '/verify-email',
    //   name: 'Verify Email',
    //   component: () => import('../views/Auth/verifyEmail.vue'),
    //   meta: { requiresAuth: true },
    // },
    {
      path: '/set-pin',
      name: 'Set Pin',
      component: () => import('../views/Auth/SetPin.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/complete-profile',
      name: 'CompleteProfile',
      component: () => import('../views/Auth/CompleteProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Dashboard/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: () => import('../views/Dashboard/Transactions.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/savings',
      name: 'Savings',
      component: () => import('../views/Dashboard/Savings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Dashboard/Settings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/cards',
      name: 'Cards',
      component: () => import('../views/Cards/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/deposit/success',
      name: 'DepositSuccess',
      component: () => import('../views/DepositSuccess.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = Cookies.get('authToken')
  const isAuthenticated = !!token
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
    return
  }
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }
  next()
})

export default router
