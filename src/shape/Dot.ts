import { Point } from '../Types';
import Shape from './Shape';

export default class Dot extends Shape {
    type: number = 3
    constructor(coor: Point, index?: number, label?: string, style = {}, uuid?: string) {
        super(index, label, style, uuid)
        this.coor = coor;
    }
}
