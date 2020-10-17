<template>
    <div class="sudoku" v-if="puzzle !== null">
        <canvas ref="canvas" class="canvas"></canvas>
    </div>
</template>

<script>
    import {Puzzle} from "puzzle-solver";
    import GridCell from "@/js/GridCell";

    export default {
        name: "Sudoku",
        props: {
            puzzle: {
                type: Puzzle,
                default: null,
            },
            padding: {
                type: Object,
                default: () => ({topLeft: 210, bottomRight: 100}),
            },
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

                let boxWidth = this.canvas.width - (this.padding.topLeft + this.padding.bottomRight);
                let boxHeight = this.canvas.height - (this.padding.topLeft + this.padding.bottomRight);
                let box = {
                    x: 1 + this.padding.topLeft,
                    y: 1 + this.padding.topLeft,
                    width: boxWidth,
                    height: boxHeight,
                }
                this.renderCells(box);
                for (let layer of this.puzzle.backgroundLayers) {
                    switch (layer) {
                        case 'grid':
                            this.renderGrid(box);
                            break;
                        case 'sudokuBoxes':
                            this.renderBoxes(box);
                            break;
                        default:
                            this.renderImage(layer);
                            break;
                    }
                }
            },
            renderCells(box) {
                let cellSize = box.width / this.width;

                for (let cell of this.flatGrid) {
                    // Colors
                    if (cell.color !== null) {
                        this.context.fillStyle = cell.color;
                        this.context.fillRect(
                            box.x + cell.x * cellSize,
                            box.y + cell.y * cellSize,
                            cellSize, cellSize,
                        )
                    }

                    // Domain
                    if (cell.domain.length === 1) {
                        this.context.fillStyle = this.themeColors.foreground;
                        let height = cellSize / 1.5;
                        this.context.font = `${height}px Arial`;
                        let {width} = this.context.measureText(cell.domain[0])
                        this.context.fillText(
                            cell.domain[0],
                            box.x + cell.x * cellSize + cellSize / 2 - width / 2,
                            box.y + cell.y * cellSize + cellSize / 2 + height / 3,
                            cellSize
                        );
                    } else if (cell.domain.length < this.maxDomainLength) {
                        this.context.fillStyle = this.themeColors.secondary;
                        let height = cellSize / 5;
                        this.context.font = `600 ${height}px Arial`;
                        let text = cell.domain.join(' ');
                        // let text = [1, 2, 3, 4, 5].join(' ');
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
                                box.y + cell.y * cellSize + cellSize / 1.35 - (lines.length * height / 1.25) + (height * 1.4) * i,
                                cellSize,
                            );
                        }
                    }

                    let positions = [
                        [0, 0],
                        [1, 0],
                        [1, 1],
                        [0, 1],
                        [0.5, 0],
                        [1, 0.5],
                        [0.5, 1],
                        [0, 0.5],
                    ]
                    // Pencil marks
                    if (cell.pencilMarks.length > 0) {
                        this.context.fillStyle = this.themeColors.secondary;
                        let height = cellSize / 5;
                        this.context.font = `600 ${height}px Arial`;
                        let marks = [...cell.pencilMarks].sort();
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
                this.context.strokeStyle = this.themeColors.foreground;
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
                this.context.strokeStyle = this.themeColors.foreground;
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
                let puzzleWidth = width - this.padding.topLeft - this.padding.bottomRight;
                console.log({puzzleWidth})
                canvas.height = (this.height / this.width) * (puzzleWidth) + this.padding.topLeft + this.padding.bottomRight;
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
            maxDomainLength() {
                let max = 0;
                for (let cell of this.flatGrid)
                    if (cell.domain.length > max) max = cell.domain.length;
                return max;
            },
            blockSize() {
                let blockConstraint = this.puzzle.constraints.find(c => c.name.includes('Block'));
                return Math.sqrt(blockConstraint.cells.length);
            },
            hasBoxes() {
                return !!this.puzzle.constraints.find(c => c.name.includes('Block'));
            },
            width() {
                if (!this?.grid[0])
                    return;
                return this.grid[0].length;
            },
            height() {
                if (!this.grid)
                    return 0;
                return this.grid.length;
            },
            flatGrid() {
                if (!this.grid)
                    return [];
                console.log(this.grid);
                return this.grid.flat();
            },
            grid() {
                if (this.puzzle === null)
                    return [[]];
                let visibleCells = this.puzzle.visibleCells;
                if (visibleCells.length === 0)
                    return [[]];

                let cells = {};
                let maxX = 0, maxY = 0;
                for (let cell of visibleCells) {
                    let [x, y] = cell.split(',').map(n => +n);
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                    cells[cell] = new GridCell(
                        x, y,
                        this.puzzle.domains[cell],
                        this.puzzle.pencilMarks[cell],
                        this.puzzle.colors[cell],
                    );
                }

                let width = maxX + 1,
                    height = maxY + 1;
                return [...Array(height)].map((_, y) => [...Array(width)].map((_, x) => cells[[x, y]]));
            }
        }
    }
</script>

<style scoped>
    .sudoku {
        display: flex;
    }

    .canvas {
        width: 100%;
    }
</style>