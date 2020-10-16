import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Browse',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/About')
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('../views/Search')
    },
    {
        path: '/create',
        name: 'Choose puzzle preset',
        component: () => import('../views/ChoosePreset'),
    },
    {
        path: '/create/:preset',
        name: 'Create puzzle',
        component: () => import('../views/CreatePuzzle')
    },
    {
        path: '/play/:id',
        name: 'Play Sudoku',
        component: () => import('../views/PlaySudoku')
    },
]

const router = new VueRouter({
    routes
})

export default router
