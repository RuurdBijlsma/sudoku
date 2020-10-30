<template>
    <div class="parent" ref="parent">
        <div class="cell-grid" ref="cellGrid">
            <div class="cell-container"
                 :style="{
                        backgroundColor:
                            options.same && sameCells.includes(cell) ? themeColors.sudoku.same :
                            options.relevant && relevantCells.includes(cell) ? themeColors.sudoku.relevant :
                            cell.user.color ? cell.user.color : cell.color ? cell.color : 'transparent',
                    }"
                 v-for="cell in flatGrid">
                <div class="domain-cell" :style="{
                    backgroundColor: selectedCells.includes(cell) ? themeColors.sudoku.selection : 'transparent',
                    boxShadow: `inset 0 0 0 ${parentBox.width / 80}px ` +
                        (
                            bordersCells.cells.includes(cell) ? bordersCells.color : 'transparent'
                        ),
                }">
                    <div class="cell value solution" v-if="options.solution && options.autoSolve && solvability.result">
                        {{getSolutionValue(cell.x, cell.y)}}
                    </div>
                    <div class="cell domain solution"
                         v-else-if="options.consistentDomains && solvability.consistentDomains">
                        {{getSolutionDomain(cell.x, cell.y).join('')}}
                    </div>
                    <div class="cell value" v-else-if="cell.hasSetValue">
                        {{cell.domain[0]}}
                    </div>
                    <div class="cell domain" v-else-if="cell.hasSetDomain(maxDomainLength)">
                        {{[...cell.domain].sort().join('')}}
                    </div>
                    <div class="cell user value" v-else-if="cell.hasUserValue">
                        {{cell.user.domain.values().next().value}}
                    </div>
                    <div class="cell user domain" v-else-if="cell.hasUserDomain">
                        {{[...cell.user.domain].sort().join('')}}
                    </div>
                </div>
                <div class="pencil-cell" v-if="!cell.hasValue">
                    <div class="cell pencil-marks" v-if="cell.hasUserPencilMarks">
                        <div class="pencil-mark user" v-for="value in [...cell.user.pencilMarks].sort()">
                            {{value}}
                        </div>
                    </div>
                    <div class="pencil-marks" v-else-if="cell.hasSetPencilMarks">
                        <div class="pencil-mark" v-for="value in [...cell.pencilMarks].sort()">{{value}}</div>
                    </div>
                </div>
            </div>
        </div>
        <canvas class="canvas" ref="canvas"></canvas>
        <div class="boxes" v-if="parentBox">
            <div class="box" v-for="_ in boxCount"></div>
        </div>
    </div>
</template>

<script>
    import {mapGetters, mapState} from "vuex";
    // TODO FOR THIS
    // visualize thermometer / cage
    // show direction of constraint cells
    // test responsiveness/speed/performance of new html version
    // render 3x3 boxes
    // show arc consistent constraints
    // show solution

    export default {
        name: "HtmlVisualize",
        props: {
            padding: {
                type: Object,
                default: () => ({top: 0, left: 0, bottom: 0, right: 0}),
            },
        },
        data: () => ({
            parentBox: null,
            canvas: null,
            context: null,
        }),
        mounted() {
            this.canvas = this.$refs.canvas;
            this.context = this.canvas.getContext('2d');
            window.addEventListener('resize', this.windowResize, false);
            this.windowResize();
            this.updateCanvas();
        },
        beforeDestroy() {
            window.addEventListener('resize', this.windowResize, false);
        },
        methods: {
            updateCanvas() {

            },
            getSolutionDomain(x, y) {
                return this.solvability?.consistentDomains?.[[x, y]];
            },
            getSolutionValue(x, y) {
                return this.solvability?.result?.solutions?.[0]?.[[x, y]];
            },
            windowResize() {
                let parent = this.$refs.parent;
                this.parentBox = parent.getBoundingClientRect();
                let ratio = this.width / this.height;
                let height = this.parentBox.width / ratio;
                this.canvas.width = this.parentBox.width;
                this.canvas.height = height;
                parent.style.setProperty('--parent-width', this.parentBox.width + 'px');
                parent.style.setProperty('--parent-height', height + 'px');
                parent.style.setProperty('--cell-size', this.parentBox.width / this.width + 'px');
                this.$store.commit('box', this.$refs.cellGrid.getBoundingClientRect());
            },
            async processBackgroundLayers() {
                for (let i = 0; i < this.puzzle.backgroundLayers.length; i++) {
                    let layer = this.puzzle.backgroundLayers[i];
                    if (typeof layer === 'string')
                        this.puzzle.backgroundLayers[i] = layer.startsWith('data:image') ?
                            await this.getImage(layer) :
                            layer;
                }
            },
            async getImage(url) {
                return new Promise((resolve => {
                    let image = new Image();
                    image.src = url;
                    image.onload = () => resolve(image);
                }))
            },
        },
        watch: {
            puzzle() {
                this.processBackgroundLayers();
                this.windowResize();
                this.grid?.[1]?.[0]?.user?.domain?.push?.(5);
                this.grid?.[1]?.[0]?.user?.domain?.push?.(4);
                this.grid?.[0]?.[0]?.user?.domain?.push?.(5);
                this.grid?.[0]?.[3]?.user?.pencilMarks?.push?.(1);
                this.grid?.[0]?.[3]?.user?.pencilMarks?.push?.(2);
                this.grid?.[0]?.[3]?.user?.pencilMarks?.push?.(3);
                this.grid?.[0]?.[3]?.user?.pencilMarks?.push?.(4);
            },
        },
        computed: {
            bordersCells() {
                return this.editingConstraint !== null ? {
                    cells: this.editingConstraint.cells,
                    color: this.themeColors.sudoku.constraint
                } : this.selectedConstraint !== null ? {
                    cells: this.selectedConstraint.cells,
                    color: this.themeColors.sudoku.constraint
                } : this.options.constrained ? {
                    cells: this.constrainedFromSelection,
                    color: this.themeColors.sudoku.constrained
                } : {cells: [], color: null}
            },
            boxCount() {
                let xBoxes = Math.floor(this.width / this.boxSize);
                let yBoxes = Math.floor(this.height / this.boxSize);
                return xBoxes * yBoxes;
            },
            ...mapState({
                box: state => state.sudoku.box,
                puzzle: state => state.sudoku.puzzle,
                selectedCells: state => state.sudoku.selectedCells,
                constrainedFromSelection: state => state.sudoku.constrainedFromSelection,
                selectedConstraint: state => state.sudoku.selectedConstraint,
                relevantCells: state => state.sudoku.relevantCells,
                sameCells: state => state.sudoku.sameCells,
                mode: state => state.sudoku.mode,
                options: state => state.sudoku.options,
                editingConstraint: state => state.sudoku.editingConstraint,
                solvability: state => state.sudoku.solvability,
            }),
            ...mapGetters([
                'constraintTypes',
                'maxDomainLength',
                'boxSize',
                'hasBoxes',
                'width',
                'height',
                'flatGrid',
                'grid',
                'themeColors',
                'opaqueThemeColors',
            ]),
        }
    }
</script>

<style scoped>
    .parent {
        --parent-width: 0px;
        --parent-height: 0px;
        --cell-size: 0px;
        width: 100%;
        height: var(--parent-height);
        background-color: var(--primary-light);
    }

    .canvas {
        margin-top: -100%;
        display: flex;
    }

    .boxes {
        pointer-events: none;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        margin-top: -100%;
    }

    .box {
        width: 100%;
        height: 100%;
        box-shadow: inset 0 0 0 calc(var(--parent-width) / 200) var(--soft-foreground);
    }

    .cell-grid {
        z-index: 1;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        grid-template-rows: repeat(9, 1fr);
        cursor: pointer;
    }

    .cell-container {
        box-shadow: inset 0 0 0 calc(var(--parent-width) / 700) var(--soft-foreground);
    }

    .domain-cell {
        width: 100%;
        height: 100%;
    }

    .pencil-cell {
        width: 100%;
        height: 100%;
        margin-top: -100%;
    }

    .cell {
        width: var(--cell-size);
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        text-align: center;
        word-break: break-all;
    }

    .user {
        color: var(--secondary);
    }

    .solution {
        color: var(--primary);
    }

    .value {
        font-size: calc(var(--parent-width) / 15);
    }

    .domain {
        font-size: calc(var(--parent-width) / 35);
    }

    .pencil-marks {
        width: 100%;
        height: 100%;
        padding: calc(var(--parent-width) / 200);
        display: grid;
        grid-template-columns: repeat(3, calc(100% / 3));
        grid-template-rows: repeat(3, calc(100% / 3));
        justify-content: center;
        align-content: center;
    }

    .pencil-mark {
        position: relative;
        text-align: center;
        font-size: calc(var(--parent-width) / 40);
    }

    .pencil-mark:nth-child(1) {
        grid-column: 1;
        grid-row: 1;
    }

    .pencil-mark:nth-child(2) {
        grid-column: 3;
        grid-row: 1;
    }

    .pencil-mark:nth-child(3) {
        grid-column: 3;
        grid-row: 3;
    }

    .pencil-mark:nth-child(4) {
        grid-column: 1;
        grid-row: 3;
    }

    .pencil-mark:nth-child(5) {
        grid-column: 2;
        grid-row: 1;
    }

    .pencil-mark:nth-child(6) {
        grid-column: 2;
        grid-row: 3;
    }

    .pencil-mark:nth-child(7) {
        grid-column: 1;
        grid-row: 2;
    }

    .pencil-mark:nth-child(8) {
        grid-column: 3;
        grid-row: 2;
    }
</style>