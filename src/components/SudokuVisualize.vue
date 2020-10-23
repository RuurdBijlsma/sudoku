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

    export default {
        name: "SudokuVisualize",
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
            resizeInterval: -1,
        }),
        mounted() {
            this.canvas = this.$refs.canvas;
            this.context = this.canvas.getContext('2d', {alpha: false});
            this.processPuzzle();
            this.render();
            this.resizeInterval = setInterval(() => this.setCanvasSize(), 1000);
        },
        beforeDestroy() {
            clearInterval(this.resizeInterval);
            cancelAnimationFrame(this.animationFrame);
        },
        methods: {
            render() {
                this.animationFrame = requestAnimationFrame(() => this.render());

                this.context.fillStyle = this.themeColors.primaryLight;
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

                if (this.puzzle === null || this.width === 0 || this.height === 0)
                    return;

                this.renderConstraints(this.box);

                if (this.options.relevant)
                    this.renderSpecialCells(this.box, this.relevantCells, this.themeColors.sudoku.relevant);
                if (this.options.same)
                    this.renderSpecialCells(this.box, this.sameCells, this.themeColors.sudoku.same);
                this.renderSpecialCells(this.box, this.selectedCells, this.themeColors.sudoku.selection);

                this.renderCells(this.box);

                if (this.options.solution)
                    this.renderSolution(this.box);
                else if (this.options.consistentDomains)
                    this.renderConsistentDomains(this.box);

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

                let visualConstraint = this.selectedConstraint !== null || this.editingConstraint !== null;
                if (this.options.constrained && !visualConstraint)
                    this.renderBorders(this.box, this.constrainedFromSelection, this.themeColors.sudoku.constrained, false);
                else if (this.editingConstraint) {
                    this.renderBorders(this.box, this.editingConstraint?.cells, this.themeColors.sudoku.constraint,
                        this.constraintTypes[this.editingConstraint.constraint.type].directional ?? false);
                } else if (this.selectedConstraint)
                    this.renderBorders(this.box, this.selectedConstraint?.cells, this.themeColors.sudoku.constraint, this.selectedConstraint.directional);
            },
            drawCage(coordinates, value, cellSize) {
                let padding = cellSize / 10;
                let paddedSize = cellSize - padding;
                let stringCoordinates = coordinates.map(n => n.toString());
                let getNeighbours = ([x, y]) => {
                    return [
                        [x, y - 1], // top
                        [x + 1, y], // right
                        [x, y + 1], // bottom
                        [x - 1, y], // left
                    ]
                }
                let cellEdges = coordinates.map(coordinate => {
                    let edges = [];
                    for (let neighbour of getNeighbours(coordinate))
                        edges.push(stringCoordinates.includes(neighbour.toString()));
                    let [top, right, bottom, left] = edges
                    return {coordinate, edges: {top, right, bottom, left}}
                });
                let getPoints = (x, y) => ({
                    top: [[x, y + padding], [x + cellSize, y + padding]],
                    right: [[x + paddedSize, y], [x + paddedSize, y + cellSize]],
                    bottom: [[x, y + paddedSize], [x + cellSize, y + paddedSize]],
                    left: [[x + padding, y], [x + padding, y + cellSize]],
                });
                this.context.setLineDash([cellSize / 20, cellSize / 10]);
                this.context.lineWidth = cellSize / 32;
                this.context.strokeStyle = this.themeColors.sudoku.cage;
                for (let cell of cellEdges) {
                    let [x, y] = cell.coordinate.map(n => n * cellSize);
                    let points = getPoints(x, y);
                    // Top left XY
                    this.context.beginPath();
                    for (let key in cell.edges) {
                        if (cell.edges[key])
                            continue;
                        let sidePoints = points[key];
                        this.context.moveTo(...sidePoints[0]);
                        for (let [pX, pY] of sidePoints.slice(1)) {
                            this.context.lineTo(pX, pY);
                        }
                    }
                    this.context.stroke();
                }
                this.context.setLineDash([]);

                let top = Infinity;
                let right = null;
                for (let [x, y] of coordinates) {
                    if (y < top) {
                        top = y;
                        right = x;
                    }
                    if (y === top && x > right)
                        right = x;
                }
                let height = cellSize / 4.5;
                this.context.font = `400 ${height}px Arial`;
                this.context.fillStyle = this.themeColors.sudoku.cage;
                let {width} = this.context.measureText(value);
                this.context.fillText(value, right * cellSize + paddedSize - width - padding / 2, top * cellSize + padding + height);
            },
            drawThermometer(coordinates, cellSize) {
                if (coordinates.length < 2)
                    return;

                this.context.strokeStyle = this.themeColors.sudoku.thermometer;
                this.context.fillStyle = this.themeColors.sudoku.thermometer;

                let [x, y] = coordinates[0].map(n => n * cellSize + cellSize / 2);

                this.context.beginPath();
                this.context.arc(x, y, cellSize / 3, 0, 2 * Math.PI);
                this.context.fill();

                this.context.lineWidth = cellSize / 3;
                this.context.lineCap = 'round';
                this.context.beginPath();
                this.context.moveTo(x, y);
                for (let [x, y] of coordinates.slice(1).map(c => c.map(n => n * cellSize + cellSize / 2)))
                    this.context.lineTo(x, y);
                this.context.stroke();
            },
            renderConstraints(box) {
                let cellSize = box.width / this.width;
                const getCoordinates = variables => variables.map(v => v.toString().split(',').map(n => +n));
                for (let constraint of this.puzzle.constraints) {
                    switch (constraint.type) {
                        case 'increasing':
                            this.drawThermometer(getCoordinates(constraint.variables), cellSize);
                            break;
                        case 'sumsTo':
                            this.drawCage(getCoordinates(constraint.variables), constraint.value, cellSize);
                            break;
                    }
                }
            },
            rotate(cx, cy, x, y, radians) {
                const cos = Math.cos(radians),
                    sin = Math.sin(radians),
                    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
                return [nx, ny];
            },
            drawArrow(x, y, height, width, angle) {
                this.context.lineCap = 'round';
                let left = x - width / 2;
                let points = [[left, y - height / 2], [x + width, y], [left, y + height / 2]]
                    .map(p => this.rotate(x, y, ...p, Math.PI / 2 + angle));
                this.context.beginPath();
                this.context.moveTo(...points[0]);
                for (let [x, y] of points)
                    this.context.lineTo(x, y);
                this.context.stroke();
            },
            renderArrows(box, cells, color) {
                this.context.fillStyle = this.opaqueThemeColors.sudoku.constraint;
                this.context.strokeStyle = this.opaqueThemeColors.sudoku.constraint;
                let cellSize = box.width / this.width;

                let angle = 0;
                for (let i = 0; i < cells.length; i++) {
                    let cell = cells[i];
                    if (i < cells.length - 1) {
                        let nextCell = cells[i + 1];
                        angle = Math.atan2(cell.x - nextCell.x, cell.y - nextCell.y)
                    }

                    this.drawArrow(
                        cell.x * cellSize + cellSize / 2,
                        cell.y * cellSize + cellSize / 2,
                        cellSize / 3,
                        cellSize / 8,
                        angle,
                    );
                }
            },
            renderBorders(box, cells, color, directional) {
                if (!cells)
                    return;

                let lineWidth = this.constraintLineWidth;
                this.context.strokeStyle = color;
                this.context.lineWidth = lineWidth;
                let cellSize = box.width / this.width;
                for (let cell of cells) {
                    this.context.strokeRect(
                        box.x + cell.x * cellSize + this.gridLineWidth * 2,
                        box.y + cell.y * cellSize + this.gridLineWidth * 2,
                        cellSize - this.gridLineWidth * 5, cellSize - this.gridLineWidth * 5,
                    );
                }
                if (directional)
                    this.renderArrows(box, cells, color);
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
            drawCellValue(x, y, text, color = 'black', box, cellSize) {
                this.context.fillStyle = color;
                let height = cellSize / 1.5;
                this.context.font = `${height}px Arial`;
                let {width} = this.context.measureText(text)
                this.context.fillText(
                    text,
                    box.x + x * cellSize + cellSize / 2 - width / 2,
                    box.y + y * cellSize + cellSize / 2 + height / 3,
                    cellSize
                );
            },
            drawCellDomain(x, y, domain, color, box, cellSize) {
                this.context.fillStyle = color;
                let height = cellSize / 4.5;
                this.context.font = `600 ${height}px Arial`;

                let text = domain.sort().join('');
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
                        box.x + x * cellSize + cellSize / 2 - width / 2,
                        box.y + y * cellSize + cellSize / 1.3 - (lines.length * height / 1.35) + (height * 1.4) * i,
                        cellSize,
                    );
                }
            },
            drawPencilMarks(x, y, pencilMarks, color, box, cellSize) {
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
                this.context.fillStyle = color;
                let height = cellSize / 4.5;
                this.context.font = `600 ${height}px Arial`;
                let marks = [...pencilMarks].sort();
                for (let i = 0; i < marks.length; i++) {
                    let [posX, posY] = positions[i % positions.length];
                    let {width} = this.context.measureText(marks[i]);
                    let pad = cellSize * 0.07;
                    this.context.fillText(
                        marks[i],
                        box.x + x * cellSize + pad + posX * (cellSize - pad * 2 - width),
                        box.y + y * cellSize + pad + height + posY * (cellSize - pad * 2 - height),
                        cellSize,
                    )
                }
            },
            renderSolution(box) {
                let solution = this.solvability.result?.solutions?.[0];
                if (solution) {
                    let cellSize = box.width / this.width;

                    for (let key in solution) {
                        let [x, y] = key.split(',').map(n => +n);
                        if (this.grid[y][x].hasValue)
                            continue;
                        let text = solution[key].toString();
                        let color = this.themeColors.primary;
                        this.drawCellValue(x, y, text, color, box, cellSize);
                    }
                }
            },
            renderConsistentDomains(box) {
                let domains = this.solvability?.consistentDomains;
                if (domains) {
                    let cellSize = box.width / this.width;

                    for (let key in domains) {
                        let [x, y] = key.split(',').map(n => +n);
                        let cell = this.grid[y][x];
                        if (cell.hasValue)
                            continue;
                        let domain = domains[key];
                        let color = this.themeColors.primary;
                        this.drawCellDomain(x, y, domain, color, box, cellSize);
                    }
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

                    // Domain value
                    if (cell.hasValue) {
                        let color = cell.hasSetValue ?
                            this.themeColors.softForeground :
                            this.themeColors.secondary;
                        let text = cell.hasSetValue ? cell.domain[0] : [...cell.user.domain][0];
                        this.drawCellValue(cell.x, cell.y, text, color, box, cellSize);
                    }

                    if (!this.options.solution && !this.options.consistentDomains) {
                        // Domain multiple options
                        if (!cell.hasValue && (cell.hasUserDomain || cell.hasSetDomain(this.maxDomainLength))) {
                            let domain = cell.hasUserDomain ? Array.from(cell.user.domain) : [...cell.domain];
                            let color = cell.hasUserDomain ?
                                this.themeColors.secondary :
                                this.themeColors.softForeground;
                            this.drawCellDomain(cell.x, cell.y, domain, color, box, cellSize);
                        }
                    }

                    // Pencil marks
                    if (cell.hasPencilMarks && !cell.hasValue) {
                        let color = cell.hasUserPencilMarks ?
                            this.themeColors.secondary :
                            this.themeColors.softForeground;
                        let marks = cell.hasUserPencilMarks ? [...cell.user.pencilMarks].sort() : [...cell.pencilMarks].sort();
                        this.drawPencilMarks(cell.x, cell.y, marks, color, box, cellSize);
                    }
                }
            },
            renderGrid(box) {
                let lineWidth = this.gridLineWidth;
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
                let lineWidth = this.boxLineWidth;
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
            '$store.state.miniDrawer'() {
                const animationDuration = 300;
                setTimeout(() => {
                    this.setCanvasSize();
                }, animationDuration);
            },
        },
        computed: {
            gridLineWidth() {
                return this.box.width / 400;
            },
            constraintLineWidth() {
                return this.box.width / 100;
            },
            boxLineWidth() {
                return this.box.width / 150;
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
                'blockSize',
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
    .canvas {
        width: 100%;
    }
</style>