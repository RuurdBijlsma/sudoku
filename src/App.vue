<template>
    <v-app class="app">
        <v-app-bar app>Sudoku</v-app-bar>
        <v-navigation-drawer
                v-if="$store.getters.scale >= 2"
                v-model="drawer"
                :permanent="true"
                app
                absolute>
            <h1>Hello</h1>
            <v-list dense nav class="py-0">
                <v-list-item :to="link.to" exact v-for="link in navigation">
                    <v-list-item-icon>
                        <v-icon color="primary">{{link.icon}}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{link.name}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-main>
            <router-view></router-view>
        </v-main>
        <v-bottom-navigation
                v-if="$store.getters.scale < 2"
                color="primary"
                grow
                :shift="true"
                app>
            <v-btn :to="link.to" exact v-for="link in navigation">
                <span>{{link.name}}</span>
                <v-icon>{{link.icon}}</v-icon>
            </v-btn>
        </v-bottom-navigation>
    </v-app>
</template>

<script>
    export default {
        name: 'App',
        components: {},
        data: () => ({
            drawer: true,
            navigation: [
                {icon: 'mdi-play-circle', to: '/', name: 'Hello'},
                {icon: 'mdi-grid-large', to: '/about', name: 'About'},
            ]
        }),
        mounted() {
            window.addEventListener('resize', this.setWindowWidth);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.setWindowWidth);
        },
        methods: {
            setWindowWidth() {
                this.$store.commit('windowWidth', window.innerWidth)
            },
        },
    };
</script>
<style>
    @import url('https://fonts.googleapis.com/css?family=Roboto:400,400i,500,600,700,800,900&display=swap');
    @import url('https://cdn.materialdesignicons.com/5.0.45/css/materialdesignicons.min.css');

    .app {
        user-select: none;
        font-family: Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;
    }
</style>
