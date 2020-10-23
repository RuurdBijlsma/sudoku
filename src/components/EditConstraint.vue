<template>
    <v-form ref="form">
        <v-text-field dense label="Name" outlined v-model="constraint.name"></v-text-field>
        <v-text-field :rules="[rules.group]" dense label="Group" outlined v-model="constraint.group"></v-text-field>
        <v-select :rules="[rules.required]" v-if="!setType" dense v-model="constraint.type"
                  :items="Object.keys(constraintTypes)" outlined
                  label="Constraint type">
            {{constraint.type}}
        </v-select>
        <v-text-field :rules="[rules.required]" outlined v-if="typeOptions.value" v-model="constraint.value"
                      :type="typeOptions.value"
                      label="Value"
                      dense></v-text-field>
        <div v-if="typeOptions.constraintFunction">
            <p class="caption">The constraint function should be a function wrapping another function,
                with the outer function accepting the value as a parameter,
                and the inner function accepting the selected cells as parameters.</p>
            <v-textarea :rules="[rules.required, rules.custom]" outlined v-model="constraint.constraint"
                        label="Constraint function"
                        placeholder="v => (a, b) => a>b && a>v"
                        dense></v-textarea>
        </div>
        <div class="buttons">
            <v-btn small
                   color="success"
                   v-if="existing && selectionActive && !typeOptions.global"
                   outlined
                   @click="setVarsToSelection">
                <v-icon small class="mr-2">mdi-update</v-icon>
                Update variables to selection
            </v-btn>
            <v-btn color="error" v-if="existing" outlined class="mt-2" small @click="deleteConstraint">
                <v-icon small class="mr-2">mdi-delete-outline</v-icon>
                Delete constraint
            </v-btn>
            <v-btn color="primary" v-if="existing" outlined class="mt-2" small
                   @click="$store.commit('editingConstraint', null)">
                <v-icon small class="mr-2" color="primary">mdi-check</v-icon>
                Done
            </v-btn>
            <v-btn text small @click="addConstraint" v-if="!existing">
                <v-icon small color="primary" class="mr-2">mdi-plus</v-icon>
                Add constraint
            </v-btn>
        </div>
    </v-form>
</template>

<script>
    import {PuzzleConstraint} from "puzzle-solver";
    import {mapActions, mapGetters, mapState} from "vuex";

    export default {
        name: "EditConstraint",
        props: {
            editConstraint: {
                type: PuzzleConstraint,
                default: null,
            },
            setType: {
                type: String,
                default: null,
            },
        },
        data: () => ({
            rules: {
                required: v => !!v || 'Required',
                custom: v => v && (v.startsWith('v =>') || v.startsWith('v=>')) || `Constraint function must start with 'v =>'`,
                group: v => (!v || v.split('/').length <= 2) || `Group can't be more than 2 deep`,
            },
            constraint: new PuzzleConstraint({}),
        }),
        mounted() {
            if (this.editConstraint !== null)
                this.constraint = this.editConstraint;
            else if (this.setType)
                this.constraint.type = this.setType;
            console.log(this.constraint);
        },
        methods: {
            deleteConstraint() {
                if (this.puzzle.removeConstraint(this.constraint)) {
                    this.addSnack({text: "Removed constraint from puzzle"});
                    this.updateRelevantConstraints();
                    this.$store.commit('editingConstraint', null);
                    this.updateAllSolvability();
                } else
                    this.addSnack({text: "Couldn't remove constraint from puzzle"});
            },
            setVarsToSelection() {
                if (!this.typeOptions.global)
                    this.constraint.variables = this.selectedCells.map(c => [c.x, c.y].toString());
            },
            addConstraint() {
                if (!this.$refs.form?.validate()) {
                    this.addSnack({text: `Can't add constraint`});
                    return;
                }
                this.setVarsToSelection();
                if (!this.constraint.name) {
                    let value = this.constraint.value ? ` (${this.constraint.value})` : '';
                    this.constraint.name = this.constraintTypeNames[this.constraint.type] + value;
                }


                this.puzzle.addConstraint(this.constraint);
                this.updateAllSolvability();

                this.addSnack({text: 'Constraint added!'});
                this.updateRelevantConstraints();
                this.$emit('added');

                this.constraint = new PuzzleConstraint({...this.constraint, name: ''});
            },
            updateAllSolvability() {
                console.log("Updagint all solvigil");
                if (this.options.autoSolve) {
                    this.updateSolvability();
                }
                if (this.options.consistentDomains) {
                    this.updateConsistentDomains()
                }
            },
            ...mapActions(['updateRelevantConstraints', 'addSnack', 'getGridCells', 'updateSolvability', 'updateConsistentDomains']),
        },
        watch: {
            'constraint.variables'() {
                this.updateAllSolvability();
            },
            'constraint.value'(v) {
                if (this.typeOptions.value === 'number' && typeof this.constraint.value !== 'number') {
                    this.constraint.value = +v;
                } else {
                    this.updateAllSolvability();
                }
            },
            'constraint.type'(type) {
                if (this.constraintTypes[type].global) {
                    this.constraint.variables = [];
                }
            },
            'constraint.group'() {
                if (this.constraint.group === '') {
                    this.constraint.group = null;
                }
            },
            editConstraint() {
                this.constraint = this.editConstraint;
            },
        },
        computed: {
            typeOptions() {
                return this.constraintTypes[this.constraint.type] ?? {};
            },
            selectionActive() {
                return this.selectedCells.length > 0;
            },
            ...mapGetters(['constraintTypes', 'constraintTypeNames', 'grid']),
            ...mapState({
                editingConstraint: state => state.sudoku.editingConstraint,
                selectedCells: state => state.sudoku.selectedCells,
                puzzle: state => state.sudoku.puzzle,
                options: state => state.sudoku.options,
            }),
            existing() {
                return this.puzzle.constraints.includes(this.constraint);
            },
        },
    }
</script>

<style scoped>
    .buttons {
        display: flex;
        flex-direction: column;
    }
</style>