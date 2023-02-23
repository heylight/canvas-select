import Shape from './Shape';

export default class Circle extends Shape {
    public type = 5
    public radius = 0
    constructor(item: any, index: number) {
        super(item, index)
        this.radius = item.radius || this.radius
    }
    get ctrlsData() {
        const [x, y] = this.coor
        return [
            [x, y - this.radius],
            [x + this.radius, y],
            [x, y + this.radius],
            [x - this.radius, y]
        ]
    }
}
