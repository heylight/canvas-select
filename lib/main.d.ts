import Rect from './Rect';
import Polygon from './Polygon';
import { Point } from './Types';
declare class CanvasSelect {
    MIN_WIDTH: number;
    MIN_HEIGHT: number;
    CTRL_R: number;
    activeStrokeStyle: string;
    activeFillStyle: string;
    strokeStyle: string;
    fillStyle: string;
    EventList: [];
    WIDTH: number;
    HEIGHT: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    dataset: Array<Rect | Polygon>;
    offlineCanvas: HTMLCanvasElement;
    offlineCtx: CanvasRenderingContext2D;
    remmber: number[][];
    movePoint: Point;
    createType: number;
    ctrlIndex: number;
    constructor(el: HTMLCanvasElement | string);
    setData(data: Array<Rect | Polygon>): void;
    get activeShape(): Rect | Polygon;
    get createShape(): Rect | Polygon;
    /**
     * 生成uuid
     * @returns
     */
    static createUuid(): string;
    init(): void;
    /**
    * 判断是否在矩形内
    * @param point 点击坐标
    * @param area 目标区域
    */
    isPointInArea(point: Point, shape: (Rect | Polygon)): boolean;
    /**
     * 判断是否在控制点内
     * @param point 点击坐标
     * @param area 目标区域
     */
    isPointInCtrl(point: number[], area: number[]): boolean;
    clear(): void;
    update(): void;
    drawRect(shape: Rect): void;
    drawPolygon(shape: Polygon): void;
    drawCtrls(point: Point): void;
    /**
     * 绘制label
     * @param point 位置
     * @param str 文本
     */
    drawLabel(point: Point, label: string): void;
    deleteByIndex(index: number): void;
    /**
     * 注册事件
     * @param eventName 事件名称
     * @param cb 回调方法
     */
    on(eventName: string, cb: Function): void;
    /**
     * 触发事件
     * @param eventName 事件名称
     * @param payload 传递参数
     */
    emit(eventName: string, ...payload: any): void;
    /**
     * 注销事件
     * @param eventName 事件名称
     * @param cb 传递参数
     */
    off(eventName: string, cb: Function): void;
}
export default CanvasSelect;
