<template>
    <div>
        <v-switch hide-details="auto" label="Same" v-model="options.same"></v-switch>
        <v-switch hide-details="auto" label="Relevant" v-model="options.relevant"></v-switch>
        <v-switch hide-details="auto" label="Constraints" v-model="options.constrained"></v-switch>
        <div>
            <v-divider class="mt-5"></v-divider>
            <v-switch hide-details="auto" v-model="options.consistentDomains" label="Arc consistent domains"></v-switch>
            <v-switch v-if="solvable !== 'no'" hide-details="auto" v-model="options.solution"
                      label="Possible solution"></v-switch>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapState} from "vuex";

    export default {
        name: "VisualOptions",
        computed: {
            hasSolution() {
                return this.solvable?.result?.solutions?.length > 0
            },
            ...mapGetters(['solvable', 'isSolved']),
            ...mapState({
                options: state => state.sudoku.options,
            }),
        },
    }
</script>

<style scoped>

</style>