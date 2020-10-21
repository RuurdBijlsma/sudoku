<template>
    <div class="create">
        <custom-expando name="Create constraints" :default-show="true">
            <v-expansion-panels accordion>
                <v-expansion-panel v-if="constraint.global || selectionActive"
                                   v-for="(constraint, type) in constraintTypes">
                    <v-expansion-panel-header>{{type}}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-form ref="form" @submit.prevent="addConstraint(type, constraint)">
                            <v-subheader>Optional</v-subheader>
                            <v-text-field
                                    class="mb-4"
                                    dense
                                    v-model="constraint.nameInput"
                                    outlined
                                    hide-details="auto"
                                    label="Name"></v-text-field>
                            <v-text-field
                                    class="mb-4"
                                    dense
                                    v-model="constraint.groupInput"
                                    placeholder="ex. Sudoku/Blocks"
                                    outlined
                                    hide-details="auto"
                                    label="Group"></v-text-field>
                            <v-subheader v-if="constraint.value || constraint.constraintFunction">Required</v-subheader>
                            <v-text-field
                                    class="mb-4"
                                    dense
                                    v-model="constraint.valueInput"
                                    outlined
                                    v-if="constraint.value"
                                    hide-details="auto"
                                    label="Value"></v-text-field>
                            <v-textarea dense
                                        class="mb-2"
                                        v-model="constraint.constraintInput"
                                        outlined
                                        v-if="constraint.constraintFunction"
                                        label="Constraint Function"
                                        hide-details="auto"
                                        placeholder="v => (a, b) => a > b && a > v"></v-textarea>
                            <v-btn class="add-button" type="submit" small text>
                                <v-icon color="primary">mdi-plus</v-icon>
                                Add constraint
                            </v-btn>
                        </v-form>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </custom-expando>
    </div>
</template>

<script>
    import CustomExpando from "@/components/CustomExpando";
    import {Puzzle, PuzzleConstraint} from "puzzle-solver";
    import {mapState} from "vuex";

    export default {
        name: "CreateControls",
        components: {CustomExpando},
        data: () => ({
            constraintTypes: Puzzle.constraintTypes,
        }),
        mounted() {
            console.log(Puzzle.constraintTypes);
        },
        methods: {
            addConstraint(type, constraint) {
                if (constraint.value && !constraint.valueInput) {
                    alert("You must input a value");
                    return;
                }
                if (constraint.constraintFunction) {
                    if (!constraint.constraintInput) {
                        alert("You must input a constraint function");
                        return;
                    }
                    if (!constraint.constraintInput.startsWith('v => ')) {
                        alert("Constraint function must start with 'v => '");
                        return;
                    }
                }
                if (constraint.groupInput && constraint.groupInput.split('/').length > 2) {
                    alert("Group's can't be more than 2 deep");
                    return;
                }
                let name = constraint.nameInput ?? type;
                let options = {name, type};
                if (constraint.value === Number)
                    options.value = +constraint.valueInput;
                else if (constraint.value)
                    options.value = constraint.valueInput;
                if (constraint.constraintFunction)
                    options.constraint = constraint.constraintInput;
                if (!constraint.global)
                    options.variables = this.selectedCells.map(c => [c.x, c.y].toString());
                if (constraint.groupInput)
                    options.group = constraint.groupInput;

                let puzzleConstraint = new PuzzleConstraint(options);
                console.log(puzzleConstraint);
            },
        },
        computed: {
            selectionActive() {
                return this.selectedCells.length > 0;
            },
            ...mapState({
                selectedCells: state => state.sudoku.selectedCells,
            }),
        },
    }
</script>

<style scoped>
    .create {
        min-width: 230px;
        width: 230px;
        display: flex;
        flex-direction: column;
    }

    .add-button {
        width: 100%;
    }
</style>