import Shape from './Shape';
import { Point } from '../index';

export default class Brush extends Shape {
    public type = 7;
    public coor: Point[] = [];
    public brushSize: number | undefined;
    public brushStokeStyle: string | undefined;

    constructor(data: any, index: number, base: any) {
        super(data, index);
        this.brushSize = data.brushSize ?? base.brushSize
        this.brushStokeStyle = data.brushStokeStyle ?? base.brushStokeStyle
        this.coor = data.coor
    }
}
