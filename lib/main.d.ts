import Rect from './Rect';
import Polygon from './Polygon';
import { Point } from './Types';
declare class CanvasSelect {
    lock: boolean;
    MIN_WIDTH: number;
    MIN_HEIGHT: number;
    strokeStyle: string;
    fillStyle: string;
    activeStrokeStyle: string;
    activeFillStyle: string;
    ctrlStrokeStyle: string;
    ctrlFillStyle: string;
    ctrlRadius: number;
    labelFillStyle: string;
    labelFont: string;
    labelMaxLen: number;
    WIDTH: number;
    HEIGHT: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    dataset: Array<Rect | Polygon>;
    remmber: number[][];
    movePoint: Point;
    remmberOrigin: number[];
    createType: number;
    ctrlIndex: number;
    cursor: string;
    image: HTMLImageElement;
    IMAGE_ORIGIN_WIDTH: number;
    IMAGE_WIDTH: number;
    IMAGE_ORIGIN_HEIGHT: number;
    IMAGE_HEIGHT: number;
    originX: number;
    originY: number;
    scaleStep: number;
    constructor(el: HTMLCanvasElement | string, imgSrc?: string);
    get activeShape(): Rect | Polygon;
    get createShape(): Rect | Polygon;
    get scale(): number;
    /**
     * 设置数据
     * @param data Array
     */
    setData(data: Array<Rect | Polygon>): void;
    /**
     * 缩放
     * @param type true放大，false，缩小
     */
    setScale(type: boolean): void;
    /**
     * 适配背景图
     */
    fitZoom(): void;
    /**
     * 更新画布
     */
    update(): void;
    /**
     * 删除指定矩形
     * @param index number
     */
    deleteByIndex(index: number): void;
}
export default CanvasSelect;
