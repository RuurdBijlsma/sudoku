<template>
    <canvas
            v-if="puzzle !== null"
            ref="canvas"
            class="canvas"
            :style="{
                cursor,
            }"
    ></canvas>
</template>

<script>
    import {mapGetters, mapState} from "vuex";
    import colorString from 'color-string';

    export default {
        name: "SudokuBoard",
        props: {
            padding: {
                type: Object,
                default: () => ({top: 0, left: 0, bottom: 0, right: 0}),
            },
            cursor: {
                type: String,
                default: 'default',
            }
        },
        data: () => ({
            animationFrame: -1,
            canvas: null,
            context: null,
        }),
        mounted() {
            this.canvas = this.$refs.canvas;
            this.context = this.canvas.getContext('2d', {alpha: false});
            this.processPuzzle();
            this.render();
        },
        beforeDestroy() {
            cancelAnimationFrame(this.animationFrame);
        },
        methods: {
            render() {
                this.animationFrame = requestAnimationFrame(() => this.render());

                this.context.fillStyle = this.themeColors.primaryLight;
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

                if (this.puzzle === null || this.width === 0 || this.height === 0)
                    return;

                if (this.visualOptions.relevant)
                    this.renderSpecialCells(this.box, this.relevantCells, this.themeColors.sudoku.relevant);
                if (this.visualOptions.same)
                    this.renderSpecialCells(this.box, this.sameCells, this.themeColors.sudoku.same);

                this.renderSpecialCells(this.box, this.highlightedCells, this.themeColors.sudoku.highlight);
                this.renderCells(this.box);

                for (let layer of this.puzzle.backgroundLayers) {
                    switch (layer) {
                        case 'grid':
                            this.renderGrid(this.box);
                            break;
                        case 'sudokuBoxes':
                            this.renderBoxes(this.box);
                            break;
                        default:
                            this.renderImage(layer);
                            break;
                    }
                }
                if (this.visualOptions.constrained)
                    this.renderConstrained(this.box);
            },
            renderConstrained(box) {
                let lineWidth = 5;
                this.context.strokeStyle = this.themeColors.sudoku.constrained;
                this.context.lineWidth = lineWidth;
                let cellSize = box.width / this.width;
                for (let cell of this.constrainedCells) {
                    this.context.strokeRect(
                        box.x + cell.x * cellSize + 1,
                        box.y + cell.y * cellSize + 1,
                        cellSize - 3, cellSize - 3,
                    );
                }
            },
            renderSpecialCells(box, cells, color) {
                this.context.fillStyle = color;
                let cellSize = box.width / this.width;
                for (let cell of cells) {
                    this.context.fillRect(
                        box.x + cell.x * cellSize,
                        box.y + cell.y * cellSize,
                        cellSize, cellSize,
                    );
                }
            },
            renderCells(box) {
                let cellSize = box.width / this.width;

                for (let cell of this.flatGrid) {
                    // Colors
                    if (cell.hasColor) {
                        this.context.fillStyle = cell.hasUserColor ? cell.user.color : cell.color;
                        this.context.fillRect(
                            box.x + cell.x * cellSize,
                            box.y + cell.y * cellSize,
                            cellSize, cellSize,
                        )
                    }

                    // Domain
                    if (cell.hasValue) {
                        this.context.fillStyle = cell.hasSetValue ?
                            this.themeColors.softForeground :
                            this.themeColors.secondary;
                        let height = cellSize / 1.5;
                        this.context.font = `${height}px Arial`;
                        let text = cell.hasSetValue ? cell.domain[0] : [...cell.user.domain][0];
                        let {width} = this.context.measureText(text)
                        this.context.fillText(
                            text,
                            box.x + cell.x * cellSize + cellSize / 2 - width / 2,
                            box.y + cell.y * cellSize + cellSize / 2 + height / 3,
                            cellSize
                        );
                    }
                    // User Domain
                    if (!cell.hasValue && (cell.hasUserDomain || cell.hasSetDomain(this.maxDomainLength))) {
                        this.context.fillStyle = cell.hasUserDomain ?
                            this.themeColors.secondary :
                            this.themeColors.softForeground;
                        let height = cellSize / 4.5;
                        this.context.font = `600 ${height}px Arial`;
                        // let text = [1,2,3,4,5,6,7,8].join(' ');
                        let arr;
                        if (cell.hasUserDomain)
                            arr = Array.from(cell.user.domain);
                        else
                            arr = [...cell.domain];
                        let text = arr.sort().join('');
                        let {width} = this.context.measureText(text);
                        let lines = [text];
                        if (width > cellSize * 0.8) {
                            let halfLength = Math.floor(text.length / 2);
                            lines = [text.substring(0, halfLength).trim(), text.substring(halfLength).trim()];
                        }
                        for (let i = 0; i < lines.length; i++) {
                            let {width} = this.context.measureText(lines[i]);
                            this.context.fillText(
                                lines[i],
                                box.x + cell.x * cellSize + cellSize / 2 - width / 2,
                                box.y + cell.y * cellSize + cellSize / 1.3 - (lines.length * height / 1.35) + (height * 1.4) * i,
                                cellSize,
                            );
                        }
                    }

                    // Pencil marks
                    if (cell.hasPencilMarks && !cell.hasValue) {
                        let positions = [
                            [0, 0],
                            [1, 0],
                            [0, 1],
                            [1, 1],
                            [0.5, 0],
                            [0.5, 1],
                            [0, 0.5],
                            [1, 0.5],
                        ]
                        this.context.fillStyle = cell.hasUserPencilMarks ?
                            this.themeColors.secondary :
                            this.themeColors.softForeground;
                        let height = cellSize / 4.5;
                        this.context.font = `600 ${height}px Arial`;
                        let marks;
                        if (cell.hasUserPencilMarks) {
                            marks = [...cell.user.pencilMarks].sort();
                        } else {
                            marks = [...cell.pencilMarks].sort();
                        }
                        for (let i = 0; i < marks.length; i++) {
                            let [posX, posY] = positions[i % positions.length];
                            let {width} = this.context.measureText(marks[i]);
                            let pad = cellSize * 0.07;
                            this.context.fillText(
                                marks[i],
                                box.x + cell.x * cellSize + pad + posX * (cellSize - pad * 2 - width),
                                box.y + cell.y * cellSize + pad + height + posY * (cellSize - pad * 2 - height),
                                cellSize,
                            )
                        }
                    }
                }
            },
            renderGrid(box) {
                let lineWidth = box.width / 400;
                let cellSize = box.width / this.width;

                this.context.beginPath();
                this.context.strokeStyle = this.themeColors.softForeground;
                this.context.lineWidth = lineWidth;
                for (let x = 0; x <= this.width; x++) {
                    this.context.moveTo(box.x + x * cellSize - lineWidth / 2, box.y);
                    this.context.lineTo(box.x + x * cellSize - lineWidth / 2, box.y + box.height);
                }
                for (let y = 0; y <= this.height; y++) {
                    this.context.moveTo(box.x, box.y + y * cellSize - lineWidth / 2);
                    this.context.lineTo(box.x + box.width, box.y + y * cellSize - lineWidth / 2);
                }
                this.context.stroke();
            },
            renderBoxes(box) {
                if (!this.hasBoxes)
                    return false;
                let lineWidth = box.width / 150;
                let cellSize = box.width / this.width;
                let verticalLines = this.width / this.blockSize - 1;
                let horizontalLines = this.height / this.blockSize - 1;

                this.context.beginPath();
                this.context.strokeStyle = this.themeColors.softForeground;
                this.context.lineWidth = lineWidth;
                for (let x = 1; x <= verticalLines; x++) {
                    this.context.moveTo(box.x + x * this.blockSize * cellSize - lineWidth / 2, box.y);
                    this.context.lineTo(box.x + x * this.blockSize * cellSize - lineWidth / 2, box.y + box.height);
                }
                for (let y = 1; y <= horizontalLines; y++) {
                    this.context.moveTo(box.x, box.y + y * this.blockSize * cellSize - lineWidth / 2);
                    this.context.lineTo(box.x + box.width, box.y + y * this.blockSize * cellSize - lineWidth / 2);
                }
                this.context.stroke();
            },
            renderImage(layer) {
                if (!(layer instanceof Image))
                    return;
                this.context.drawImage(layer, 0, 0, this.canvas.width, this.canvas.height)
            },
            processPuzzle() {
                this.processBackgroundLayers();
                this.setCanvasSize();
            },
            setCanvasSize() {
                let canvas = this.canvas;
                let {width} = canvas.getBoundingClientRect();
                canvas.width = width;
                let puzzleWidth = width - this.padding.left - this.padding.right;
                let puzzleHeight = (this.height / this.width) * puzzleWidth
                canvas.height = puzzleHeight + this.padding.top + this.padding.bottom;

                let boxWidth = this.canvas.width - (this.padding.left + this.padding.right);
                let boxHeight = this.canvas.height - (this.padding.top + this.padding.bottom);
                this.$store.commit('box', {
                    x: 1 + this.padding.left,
                    y: 1 + this.padding.top,
                    width: boxWidth - 1,
                    height: boxHeight - 1,
                });
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
            padding() {
                this.setCanvasSize();
            },
            '$store.state.windowWidth'() {
                this.setCanvasSize();
            },
            puzzle() {
                this.processPuzzle();
            },
        },
        computed: {
            themeColors() {
                return this.$vuetify.theme.themes[this.$vuetify.theme.isDark ? 'dark' : 'light'];
            },
            ...mapState({
                box: state => state.sudoku.box,
                puzzle: state => state.sudoku.puzzle,
                highlightedCells: state => state.sudoku.highlightedCells,
                constrainedCells: state => state.sudoku.constrainedCells,
                relevantCells: state => state.sudoku.relevantCells,
                sameCells: state => state.sudoku.sameCells,
                mode: state => state.sudoku.mode,
                visualOptions: state => state.sudoku.visualOptions,
            }),
            ...mapGetters([
                'maxDomainLength',
                'blockSize',
                'hasBoxes',
                'width',
                'height',
                'flatGrid',
                'grid',
            ]),
        }
    }
</script>

<style scoped>
    .canvas {
        width: 100%;
    }
</style>