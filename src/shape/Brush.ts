import Shape from './Shape';
import { Point } from '../index';

export default class Brush extends Shape {
    public type = 7;
    public coor: Point[] = [];
    public brushSize: number | undefined;
    public brushStokeStyle: string | undefined;

    constructor(data: any, index: number, base: any) {
        super(data, index);
        // 只提取需要的属性，不持有base的引用
        this.brushSize = data.brushSize ?? base?.brushSize
        this.brushStokeStyle = data.brushStokeStyle ?? base?.brushStokeStyle
        this.coor = data.coor
        // 确保不会意外保存base引用
        if (data.base) {
            delete data.base;
        }
    }
}
