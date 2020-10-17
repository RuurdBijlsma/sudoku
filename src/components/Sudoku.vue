<template>
    <div class="sudoku" v-if="puzzle !== null">
        <div class="create panel">
            <h2>Create</h2>
        </div>
        <draggable-divider></draggable-divider>
        <div class="sudoku-panel">
            <sudoku-board :puzzle="puzzle"></sudoku-board>
        </div>
        <draggable-divider></draggable-divider>
        <div class="controls panel">
            <v-chip-group class="mb-3" color="primary" v-model="mode" mandatory>
                <v-chip value="domain">Domain</v-chip>
                <v-chip value="pencil">Pencil</v-chip>
                <v-chip value="colour">Colour</v-chip>
            </v-chip-group>
            <div class="control-grid numbers" v-if="mode !== 'colour'">
                <v-btn class="number-button" large fab v-for="i in 9">{{i}}</v-btn>
            </div>
            <div class="colours" v-else>
                <v-color-picker
                        width="230"
                        dot-size="15"
                        show-swatches
                        mode="rgba"
                        :swatches="colourOptions"
                        swatches-max-height="150"
                        hide-inputs
                ></v-color-picker>
            </div>
            <v-btn class="clear-button">
                Clear {{mode}}
            </v-btn>
            <div class="control-buttons">
                <v-btn>
                    <v-icon>mdi-undo</v-icon>
                    Undo
                </v-btn>
                <v-btn>
                    <v-icon>mdi-redo</v-icon>
                    Redo
                </v-btn>
                <v-btn>
                    <v-icon color="error">mdi-restart</v-icon>
                    Restart
                </v-btn>
                <v-btn>
                    <v-icon color="success">mdi-check</v-icon>
                    Check
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
    import {Puzzle} from "puzzle-solver";
    import SudokuBoard from "@/components/SudokuBoard";
    import DraggableDivider from "@/components/DraggableDivider";

    // TODO
    // SELECT CELLS
    // SHOW ALL CONSTRAINTS THAT APPLY TO ALL SELECTED CONSTRAINTS BY HIGHLIGHTING CELLS
    // HIGHLIGHT ON MOUSE HOVER
    // Highlight inputted values in cell on controls pane to the right

    export default {
        name: "Sudoku",
        components: {DraggableDivider, SudokuBoard},
        props: {
            puzzle: {
                type: Puzzle,
                default: null,
            },
        },
        data: () => ({
            mode: 'colour',
            colourOptions: [
                [
                    '#000000',
                    '#686868',
                    '#ffffff',
                ],
                [
                    '#ff0000',
                    '#ff7700',
                    '#ffe900',
                ],
                [
                    '#00ff04',
                    '#dd2fff',
                    '#00b7ff',
                ],
            ],
        }),
        mounted() {
        },
        beforeDestroy() {
        },
        methods: {},
        watch: {},
        computed: {}
    }
</script>

<style scoped>
    .sudoku {
        display: flex;
        height: 100%;
    }

    .panel {
        display: inline-flex;
        min-width: 150px;
        height: 300px;
    }

    .create {
    }

    .sudoku-panel {
        flex-grow: 1;
    }

    .controls {
        display: flex;
        flex-direction: column;
        width: 230px;
    }

    .control-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 15px 5px;
        grid-template-areas:
            ". . ."
            ". . ."
            ". . .";
        justify-items: center;
    }

    .colours {
        gap: 5px 5px;
    }

    .colours >>> .v-color-picker__alpha {
        display: none;
    }

    .colours >>> .v-color-picker__hue {
        margin-bottom: 0 !important;
    }

    .number-button {
        font-size: 20px !important
    }

    .clear-button {
        margin: 10px 0;
    }

    .control-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px 5px;
        grid-template-areas:
            ". ."
            ". .";
        justify-items: center;
    }

    .control-buttons > * {
        width: 100%;
    }
</style>