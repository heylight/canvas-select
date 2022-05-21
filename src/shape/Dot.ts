import { Point } from '../Types';
import Shape from './Shape';

export default class Dot extends Shape {
    type: number = 3
    constructor(coor: Point, index?: number, label?: string, strokeStyle?: string, fillStyle?: string, uuid?: string) {
        super(index, label, strokeStyle, fillStyle, uuid)
        this.coor = coor;
    }
}
