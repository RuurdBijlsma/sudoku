<template>
    <perfect-scrollbar class="nav-bar">
        <div class="nav-top">
            <logo></logo>
            <search-input class="search-input"></search-input>
        </div>

        <v-list dense nav class="py-0">
            <v-list-item :to="link.to" exact v-for="link in navigation">
                <v-list-item-icon>
                    <v-icon color="primary">{{link.icon}}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>{{link.name}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-subheader>Library</v-subheader>
            <v-list-item to="/library/artists">
                <v-list-item-icon>
                    <v-icon color="primary">mdi-microphone-variant</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title>Artists</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </perfect-scrollbar>
</template>

<script>
    import Logo from "./Logo";
    import SearchInput from "./SearchInput";

    export default {
        name: "NavContent",
        components: {SearchInput, Logo},
        props: {
            navigation: {
                type: Array,
                default: () => [],
            },
        },
        data: () => ({}),
        mounted() {
        },
        methods: {},
        watch: {},
    }
</script>

<style scoped>
    .nav-bar {
        height: 100%;
        width: 100%;
    }

    .search-input {
        margin: 15px !important;
        margin-bottom: 0 !important;
    }
</style>