declare type Coordinate = number[][];
interface ShapeData {
    label: string;
    active?: boolean;
    creating?: boolean;
    dragging?: boolean;
    coor: Coordinate;
    index: number;
    width: number;
    height: number;
}
interface Remmber {
    left: number;
    top: number;
    right?: number;
    bottom?: number;
}
declare class CanvasSelect {
    MIN_WIDTH: number;
    MIN_HEIGHT: number;
    CTRL_R: number;
    EventList: [];
    private width;
    private height;
    strokeStyle: string;
    activeStrokeStyle: string;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    container: HTMLElement;
    dataset: ShapeData[];
    offlineCanvas: HTMLCanvasElement;
    offlineCtx: CanvasRenderingContext2D;
    remmber: Remmber;
    ctrlIndex: number;
    constructor(el: string);
    get activeShapeData(): ShapeData;
    get createShapeData(): ShapeData;
    get ctrlsData(): number[][];
    get data(): {
        label: string;
        coor: Coordinate;
    }[];
    /**
     * 判断是否在矩形内
     * @param point 点击坐标
     * @param area 目标区域
     */
    isPointInArea(point: number[], area: number[][]): boolean;
    /**
     * 判断是否在控制点内
     * @param point 点击坐标
     * @param area 目标区域
     */
    isPointInCtrl(point: number[], area: number[]): boolean;
    /**
     * 设置初始画布
     * @param data 初始化数据
     */
    setData(data: object[]): void;
    /**
     * 数据转换
     * @param item 要转化的数据
     */
    parseData(item: object, index: number): ShapeData;
    /**
     * 深拷贝
     * @param obj 对象
     * @returns object
     */
    deepCopy(obj: object): any;
    drawShape(item: ShapeData): void;
    drawLabel(point: number[], str: string): void;
    drawCircle(item: number[]): void;
    clear(): void;
    update(): void;
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
