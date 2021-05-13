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
    EventList: object;
    WIDTH: number;
    HEIGHT: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    dataset: Array<Rect | Polygon>;
    offlineCanvas: HTMLCanvasElement;
    offlineCtx: CanvasRenderingContext2D;
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
     * 生成uuid
     * @returns
     */
    static createUuid(): string;
    /**
     * 初始化
     */
    init(): void;
    /**
     * 设置数据
     * @param data Array
     */
    setData(data: Array<Rect | Polygon>): void;
    /**
     * 计算缩放步长
     * @param init 是否为init
     */
    calcStep(init?: boolean): void;
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
     * 保持缩放中心
     * @param scale nummer
     */
    stayPosition(scale: number): void;
    /**
     * 判断鼠标是否在背景图内部
     * @param e MouseEvent
     * @returns
     */
    isInBox(e: MouseEvent): boolean;
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
    /**
     * 绘制矩形
     * @param shape Rect
     */
    drawRect(shape: Rect): void;
    /**
     * 绘制多边形
     * @param shape Polygon
     */
    drawPolygon(shape: Polygon): void;
    /**
     * 绘制背景图片
     */
    paintImage(): void;
    /**
     * 绘制控制点
     * @param point Point
     */
    drawCtrls(point: Point): void;
    /**
     * 绘制label
     * @param point 位置
     * @param str 文本
     */
    drawLabel(point: Point, label: string): void;
    clear(): void;
    /**
     * 更新画布
     */
    update(): void;
    /**
     * 删除指定矩形
     * @param index number
     */
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
