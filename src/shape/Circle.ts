import Shape from './Shape';

export default class Circle extends Shape {
    public type = 5
    public radius = 0
    constructor(item: any, index: number, base: any) {
        super(item, index)
        this.radius = item.radius || this.radius
        // 只提取需要的属性，不持有base的引用
        this.fillStyle = item.fillStyle ?? base?.fillStyle
        this.strokeStyle = item.strokeStyle ?? base?.strokeStyle
        // 确保不会意外保存base引用
        if (item.base) {
            delete item.base;
        }
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
