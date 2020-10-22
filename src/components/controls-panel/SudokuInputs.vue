<template>
    <div>
        <v-chip-group class="mb-3" color="primary" v-model="$store.state.sudoku.mode" mandatory>
            <v-chip value="pencilMarks">Pencil</v-chip>
            <v-chip value="domain">Domain</v-chip>
            <v-chip value="color">Colour</v-chip>
        </v-chip-group>
        <div class="control-grid numbers" v-if="mode !== 'color'">
            <v-btn
                    @click="setCellsValue({type: mode, value: i})"
                    :color="selected[mode] && selected[mode].includes(i.toString()) ? 'secondary' : 'default'"
                    class="number-button"
                    large fab
                    v-for="i in 9" :key="i">{{i}}
            </v-btn>
        </div>
        <div class="colors" v-else>
            <v-color-picker
                    @click.native="applyColor"
                    v-model="selected.color"
                    width="230"
                    dot-size="15"
                    show-swatches
                    mode="rgba"
                    :swatches="colorOptions"
                    swatches-max-height="150"
                    hide-inputs
            ></v-color-picker>
        </div>
        <v-btn class="clear-button" @click="clearCells">
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
</template>

<script>
    import {mapActions, mapGetters, mapState} from "vuex";
    import colorString from "color-string";

    export default {
        name: "SudokuInputs",
        methods: {
            applyColor() {
                let [r, g, b, a] = colorString.get.rgb(this.selected.color);
                a = a / 3;
                this.selectedCells.forEach(c => c.user.color = colorString.to.hex([r, g, b, a]));
            },
            ...mapActions(['clearCells', 'setCellsValue']),
        },
        watch: {
            'selected.color'() {
                if (this.dontChange) {
                    this.$store.commit('dontChange', false);
                } else {
                    this.applyColor();
                }
            },
        },
        computed: {
            sudokuBoard() {
                return this.$refs.sudokuBoard;
            },
            ...mapGetters([]),
            ...mapState({
                selectedCells: state => state.sudoku.selectedCells,
                selected: state => state.sudoku.selected,
                mode: state => state.sudoku.mode,
                colorOptions: state => state.sudoku.colorOptions,
                dontChange: state => state.sudoku.dontChange,
            }),
        },
    }
</script>

<style scoped>
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

    .colors {
        gap: 5px 5px;
    }

    .number-button {
        font-size: 20px !important
    }

    .clear-button {
        margin: 10px 0;
        width: 100%;
    }

    .control-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px 5px;
        grid-template-areas:
            ". ."
            ". .";
        justify-items: stretch;
        align-items: stretch;
    }
</style>