import Shape from './Shape';
import { Point } from '../index';

export default class Eraser extends Shape {
    public type = 8;
    public coor: Point[] = [];
    public eraserSize: number | undefined;

    constructor(data: any, index: number, base: any) {
        super(data, index);
        // 只提取需要的属性，不持有base的引用
        this.eraserSize = data.eraserSize ?? base?.eraserSize;
        this.coor = data.coor;
        // 确保不会意外保存base引用
        if (data.base) {
            delete data.base;
        }
    }
}
