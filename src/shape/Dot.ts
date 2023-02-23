import Shape from './Shape';

export default class Dot extends Shape {
    public type = 3
    constructor(item: any, index: number) {
        super(item, index)
    }
}
