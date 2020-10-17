export default class GridCell {
    constructor(x, y, domain = [1, 2, 3, 4, 5, 6, 7, 8, 9], pencilMarks = [], color = 'transparent') {
        this.x = x;
        this.y = y;
        this.domain = domain;
        this.pencilMarks = pencilMarks;
        this.color = color;
    }
}