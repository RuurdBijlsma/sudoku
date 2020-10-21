<template>
    <v-list>
        <constraint-group :group="puzzle.constraintGroups"></constraint-group>
    </v-list>
</template>

<script>
    import ConstraintGroup from "@/components/ConstraintGroup";
    import {mapState} from "vuex";

    export default {
        name: "ConstraintsList",
        components: {ConstraintGroup},
        computed: {
            ...mapState({
                puzzle: state => state.sudoku.puzzle,
            })
        }
    }
</script>

<style scoped>

</style>