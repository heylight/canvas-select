import Shape from './Shape';
import { Point } from '../index';

export default class Eraser extends Shape {
    public type = 8;
    public coor: Point[] = [];
    public eraserSize: number | undefined;

    constructor(data: any, index: number, base: any) {
        super(data, index);
        this.eraserSize = data.eraserSize ?? base.eraserSize;
        this.coor = data.coor;
    }
}
