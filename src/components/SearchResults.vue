<template>
    <div v-if="result" class="search-result">
        results for {{term}}
    </div>
</template>

<script>
    export default {
        name: "SearchResults",
        components: {},
        props: {
            result: {
                type: Object,
                default: null,
            }
        },
        data: () => ({
            id: Math.random(),
        }),
        methods: {},
        computed: {
            term() {
                return this.result.term;
            },
        },
        watch: {
            result() {
                console.log("Search result", this.result);
            },
        },
    }
</script>

<style scoped>
</style>