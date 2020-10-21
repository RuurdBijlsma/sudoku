<template>
    <div>
        <v-list-group
                v-if="group !== null"
                v-for="(value, key) in children"
                :key="key"
                no-action
                :sub-group="subGroup"
                prepend-icon="mdi-folder">
            <template v-slot:activator>
                <v-list-item-title>{{key}}</v-list-item-title>
            </template>
            <div>
                <constraint-group sub-group :group="value" v-if="key !== 'constraints'"></constraint-group>
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
        </v-list-item>
    </div>
</template>

<script>
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
        },
        mounted() {
            console.log("group", this.group);
        },
        methods: {
            stopVisualize() {
                this.$store.commit('constraintCells', []);
            },
            visualizeConstraint(constraint) {
                if (constraint.variables) {
                    let cells = constraint.variables
                        .map(k => k.toString().split(',')
                            .map(n => +n))
                        .map(([x, y]) => this.$store.getters.grid[y][x]);
                    this.$store.commit('constraintCells', cells)
                }
            },
        },
        computed: {
            constraints() {
                return this.group.constraints ?? [];
            },
            children() {
                let group = {...this.group};
                delete group.constraints;
                return group;
            }
        },
    }
</script>

<style scoped>
</style>