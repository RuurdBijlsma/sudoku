<template>
    <div class="create">
        <custom-expando name="Edit constraint" default-show v-if="editingConstraint">
            <edit-constraint :edit-constraint="editingConstraint"></edit-constraint>
        </custom-expando>

        <custom-expando name="Create constraints" default-show>
            <v-expansion-panels accordion>
                <v-expansion-panel v-if="constraint.global || selectionActive"
                                   v-for="(constraint, type) in constraintTypes">
                    <v-expansion-panel-header>{{constraintTypeNames[type]}}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <edit-constraint :set-type="type"></edit-constraint>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </custom-expando>
    </div>
</template>

<script>
    import CustomExpando from "@/components/CustomExpando";
    import {PuzzleConstraint} from "puzzle-solver";
    import {mapGetters, mapState} from "vuex";
    import EditConstraint from "@/components/EditConstraint";

    export default {
        name: "CreateControls",
        components: {EditConstraint, CustomExpando},
        data: () => ({}),
        mounted() {
            console.log(this.constraintTypes);
        },
        methods: {
            createPuzzleConstraint(type) {
                return new PuzzleConstraint({type});
            },
        },
        computed: {
            selectionActive() {
                return this.selectedCells.length > 0;
            },
            ...mapGetters(['constraintTypes', 'constraintTypeNames']),
            ...mapState({
                selectedCells: state => state.sudoku.selectedCells,
                puzzle: state => state.sudoku.puzzle,
                editingConstraint: state => state.sudoku.editingConstraint,
            }),
        },
    }
</script>

<style scoped>
    .create {
        min-width: 300px;
        width: 300px;
        display: flex;
        flex-direction: column;
    }

    .add-button {
        width: 100%;
    }
</style>