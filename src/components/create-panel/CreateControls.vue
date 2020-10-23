<template>
    <div class="create">
        <div class="solvability-status" v-if="isSolved || loading">
            <div v-if="loading" class="loading-text">
                <v-progress-circular class="mr-2" size="12" width="2" indeterminate></v-progress-circular>
                <div class="caption">
                    Solving puzzle...
                </div>
            </div>
            <div v-else class="caption">
                {{solvable === 'unique' ? 'Unique solution!' :
                solvable === 'yes' ? 'Solvable, not unique' :
                'Not solvable!'}}
                <v-icon class="ml-2" small v-if="solvable !== 'no'"
                        :color="solvable === 'unique' ? 'success' : 'default'">
                    mdi-check
                </v-icon>
                <v-icon class="ml-2" v-else color="error">mdi-alert-circle-outline</v-icon>
            </div>
        </div>

        <custom-expando name="Puzzle" default-show>
            <v-switch label="Auto solve" v-model="options.autoSolve"></v-switch>
        </custom-expando>

        <custom-expando name="Edit constraint" default-show v-if="editingConstraint">
            <edit-constraint :edit-constraint="editingConstraint.constraint"></edit-constraint>
        </custom-expando>

        <custom-expando name="Create constraints">
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
    import {mapActions, mapGetters, mapState} from "vuex";
    import EditConstraint from "@/components/EditConstraint";

    export default {
        name: "CreateControls",
        components: {EditConstraint, CustomExpando},
        data: () => ({}),
        mounted() {
            this.$store.commit('watchSolvability');
        },
        beforeDestroy() {
            this.$store.commit('unwatchSolvability');
        },
        methods: {
            ...mapActions(['updateSolvability', 'stopSolving', 'updateConsistentDomains', 'getGridCells'])
        },
        watch: {
            'editingConstraint.constraint.variables': {
                deep: true,
                async handler(v) {
                    console.log('change v', v);
                    if (v)
                        this.editingConstraint.cells = await this.getGridCells(v);
                }
            },
            'options.autoSolve'(value) {
                if (value)
                    this.updateSolvability();
                else
                    this.stopSolving();
            },
            'options.solution'(value) {
                if (value)
                    this.options.consistentDomains = false;
            },
            'options.consistentDomains'(value) {
                if (value) {
                    this.updateConsistentDomains();
                    this.options.solution = false;
                }
            },
        },
        computed: {
            loading() {
                return this.solvability.solveWorkers.length > 0;
            },
            selectionActive() {
                return this.selectedCells.length > 0;
            },
            ...mapGetters(['constraintTypes', 'constraintTypeNames', 'grid', 'solvable', 'isSolved']),
            ...mapState({
                solvability: state => state.sudoku.solvability,
                selectedCells: state => state.sudoku.selectedCells,
                puzzle: state => state.sudoku.puzzle,
                editingConstraint: state => state.sudoku.editingConstraint,
                options: state => state.sudoku.options,
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

    .solvability-status {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .loading-text {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>