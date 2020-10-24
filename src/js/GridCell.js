export default class GridCell {
    constructor(x, y, domain = [1, 2, 3, 4, 5, 6, 7, 8, 9], pencilMarks = [], color = 'transparent') {
        this.x = x;
        this.y = y;
        this.domain = domain;
        this.pencilMarks = pencilMarks;
        this.color = color;
        this.user = {
            domain: [],
            pencilMarks: [],
            color: null,
        }
    }

    get hasColor() {
        return this.hasUserColor || this.hasSetColor;
    }

    get hasSetColor() {
        return this.color !== null;
    }

    get hasUserColor() {
        return this.user.color !== null;
    }

    get hasPencilMarks() {
        return this.hasUserPencilMarks || this.hasSetPencilMarks;
    }

    get hasSetPencilMarks() {
        return this.pencilMarks.length > 0;
    }

    get hasUserPencilMarks() {
        return this.user.pencilMarks.length > 0;
    }

    get hasValue() {
        return this.hasSetValue || this.hasUserValue;
    }

    get hasSetValue() {
        return this.domain.length === 1;
    }

    get hasUserValue() {
        return this.user.domain.length === 1;
    }

    hasDomain(maxDomainLength) {
        return this.hasSetDomain(maxDomainLength) || this.hasUserDomain;
    }

    hasSetDomain(maxDomainLength) {
        return this.domain.length > 1 && this.domain.length < maxDomainLength;
    }

    get hasUserDomain() {
        return this.user.domain.length > 1;
    }

    static get maxDomainSize() {
        return 10;
    }

    static get maxPencilMarksSize() {
        return 8;
    }
}