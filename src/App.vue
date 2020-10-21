<template>
    <v-app class="app">
        <tool-bar></tool-bar>
        <v-navigation-drawer
                v-if="$store.getters.scale >= 2"
                v-model="drawer"
                :permanent="true"
                :mini-variant="$store.state.miniDrawer"
                app
                absolute>
            <nav-content :mini-variant="$store.state.miniDrawer"
                         :navigation="navigation"></nav-content>
        </v-navigation-drawer>
        <v-main>
            <router-view class="router-view"></router-view>
        </v-main>

        <v-snackbar v-for="snack in $store.state.snackbars" app v-model="snack.open" :timeout="snack.timeout"
                    :outlined="!$vuetify.theme.dark" color="primary">
            {{ snack.text }}
            <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" :color="$vuetify.theme.dark ? 'default' : 'primary'"
                       @click="snack.open = false">
                    Dismiss
                </v-btn>
            </template>
        </v-snackbar>

        <v-bottom-navigation
                v-if="$store.getters.scale < 2"
                color="primary"
                grow
                :shift="true"
                app>
            <v-btn :key="link.to" :to="link.to" exact v-for="link in navigation">
                <span>{{link.name}}</span>
                <v-icon>{{link.icon}}</v-icon>
            </v-btn>
        </v-bottom-navigation>
    </v-app>
</template>

<script>
    import NavContent from "@/components/NavContent";
    import ToolBar from "@/components/ToolBar";

    export default {
        name: 'App',
        components: {ToolBar, NavContent},
        data: () => ({
            drawer: true,
            miniDrawer: false,
        }),
        mounted() {
            console.log(this.$store);
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
        computed: {
            navigation() {
                let search = this.$store.getters.scale < 2 ? [{
                    icon: 'mdi-magnify',
                    to: '/search',
                    name: 'Search'
                }] : [];
                return [
                    {icon: 'mdi-earth', to: '/', name: 'Browse'},
                    {icon: 'mdi-puzzle-plus-outline', to: '/create', name: 'Create Sudoku'},
                    ...search,
                ]
            },
        }
    };
</script>
<style>
    @import url('//fonts.googleapis.com/css?family=Roboto:400,400i,500,600,700,800,900&display=swap');
    @import url('//cdn.materialdesignicons.com/5.0.45/css/materialdesignicons.min.css');

    html, body {
        overflow-y: auto;
    }

    .app {
        user-select: none;
        font-family: Roboto, Helvetica Neue, Helvetica, Arial, sans-serif;
    }

    .router-view {
        width: 100%;
        height: 100%;
        position: absolute;
        overflow-y: auto;
    }
</style>
