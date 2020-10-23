<template>
    <div>
        <v-list-group
                v-if="group !== null && group !== ''"
                v-for="(value, key) in children"
                :key="key"
                no-action
                :sub-group="subGroup"
                prepend-icon="mdi-folder">
            <template v-slot:activator>
                <v-list-item-title>{{key}}</v-list-item-title>
            </template>
            <div>
                <constraint-group :editable="editable" sub-group :group="value"
                                  v-if="key !== 'constraints'"></constraint-group>
            </div>
        </v-list-group>
        <v-list-item :style="{
            cursor: constraint.variables.length > 1 ? 'pointer' : 'default',
        }" two-line v-for="constraint in constraints"
                     @mouseenter="visualizeConstraint(constraint)"
                     @mouseleave="stopVisualize()">
            <v-list-item-content>
                <v-list-item-title>{{constraint.name}}</v-list-item-title>
                <v-list-item-subtitle>{{constraint.type}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action v-if="editable">
                <v-btn :color="currentConstraint===constraint ? 'primary' : 'default'"
                       icon
                       @click="toggleEditConstraint(constraint)">
                    <v-icon>mdi-puzzle-edit-outline</v-icon>
                </v-btn>
            </v-list-item-action>
        </v-list-item>
    </div>
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex";

    export default {
        name: "ConstraintGroup",
        props: {
            group: {
                type: Object,
                default: null,
            },
            subGroup: {
                type: Boolean,
                default: false,
            },
            editable: {
                type: Boolean,
                default: false,
            },
        },
        mounted() {
            console.log("group", this.group);
        },
        methods: {
            toggleEditConstraint(constraint) {
                let cells = constraint.variables
                    .map(v => v.toString().split(',').map(n => +n))
                    .map(([x, y]) => this.grid[y][x]);
                this.$store.commit('editingConstraint', this.currentConstraint === constraint ? null : {
                    constraint,
                    cells,
                });
                this.$store.dispatch('updateRelevantConstraints');
            },
            stopVisualize() {
                this.$store.commit('selectedConstraint', null);
            },
            async visualizeConstraint(constraint) {
                if (constraint.variables) {
                    let cells = await this.getGridCells(constraint.variables);
                    this.$store.commit('selectedConstraint', {
                        directional: this.constraintTypes[constraint.type]?.directional,
                        cells
                    })
                }
            },
            ...mapActions(['getGridCells'])
        },
        computed: {
            currentConstraint() {
                return this.editingConstraint?.constraint;
            },
            constraints() {
                return this.group.constraints ?? [];
            },
            children() {
                let group = {...this.group};
                delete group.constraints;
                return group;
            },
            ...mapState({
                editingConstraint: state => state.sudoku.editingConstraint,
            }),
            ...mapGetters(['constraintTypes', 'grid'])
        },
    }
</script>

<style scoped>
</style>