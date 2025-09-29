import Shape from './Shape';

export default class Dot extends Shape {
    public type = 3
    constructor(item: any, index: number, base: any) {
        super(item, index)
        this.fillStyle = item.fillStyle ?? base.fillStyle
        this.strokeStyle = item.strokeStyle ?? base.strokeStyle
    }
}
