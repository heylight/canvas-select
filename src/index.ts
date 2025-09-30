import Rect from './shape/Rect';
import Polygon from './shape/Polygon';
import Dot from './shape/Dot';
import EventBus from './EventBus';
import Line from './shape/Line';
import Circle from './shape/Circle';
import Grid from './shape/Grid';
import pkg from '../package.json';
import Brush from './shape/Brush';
import Eraser from './shape/Eraser';

export type Point = [number, number];
export type AllShape = Rect | Polygon | Dot | Line | Circle | Grid | Brush | Eraser;
enum Shape {
    None,
    Rect,
    Polygon,
    Dot,
    Line,
    Circle,
    Grid,
    Brush,
    Eraser,
}
export default class CanvasSelect extends EventBus {
    /** 当前版本 */
    version = pkg.version;
    /** 只读模式，画布不允许任何交互 */
    lock: boolean = false;
    /** 只读模式，仅支持查看 */
    readonly: boolean = false;
    /** 最小矩形宽度 */
    MIN_WIDTH = 10;
    /** 最小矩形高度 */
    MIN_HEIGHT = 10;
    /** 最小圆形半径 */
    MIN_RADIUS = 5;
    /** 边线颜色 */
    strokeStyle = '#0f0';
    /** 填充颜色 */
    fillStyle = 'rgba(0, 0, 255, 0.1)';
    /** 边线宽度 */
    lineWidth = 1;
    /** 当前选中的标注边线颜色 */
    activeStrokeStyle = '#f00';
    /** 当前选中的标注填充颜色 */
    activeFillStyle = 'rgba(0, 0, 255, 0.1)';
    /** 控制点边线颜色 */
    ctrlStrokeStyle = '#000';
    /** 控制点填充颜色 */
    ctrlFillStyle = '#fff';
    /** 控制点半径 */
    ctrlRadius = 3;
    /** 是否隐藏标签 */
    hideLabel = false;
    /** 标签背景填充颜色 */
    labelFillStyle = '#fff';
    /** 标签字体 */
    labelFont = '10px sans-serif';
    /** 标签文字颜色 */
    textFillStyle = '#000';
    /** 标签字符最大长度，超出使用省略号 */
    labelMaxLen = 10;
    /** 画布宽度 */
    WIDTH = 0;
    /** 画布高度 */
    HEIGHT = 0;
    /** XY十字坐标 */
    crossX = new Line({}, 0, {});
    crossY = new Line({}, 1, {});
    crossStroke = '#ff0';
    /** 开启十字辅助 */
    showCross = false;
    /** 开启矩形旋转控制点 */
    showRotation = false;

    canvas: HTMLCanvasElement | undefined

    ctx: CanvasRenderingContext2D | null | undefined
    /** 所有标注数据 */
    dataset: AllShape[] = [];

    offScreen: HTMLCanvasElement | undefined

    offScreenCtx: CanvasRenderingContext2D | null | undefined

    // 放大镜相关配置 Start
    magnifierCanvas: HTMLCanvasElement | undefined
    magnifierCtx: CanvasRenderingContext2D | undefined
    // 默认展示放大镜
    isMagnifierVisible: boolean = false
    // 放大镜位置，默认跟随鼠标
    magnifierPosition: Point | 'auto' = 'auto'
    // 放大镜相关配置 End

    /** 记录锚点距离 */
    remmber: number[][] = [];
    /** 记录鼠标位置 */
    mouse: Point = [0, 0];
    /** 记录背景图鼠标位移 */
    remmberOrigin: number[] = [0, 0];
    /** 0 不创建，1 矩形，2 多边形，3 点，4 折线，5 圆，6 网格 */
    createType: Shape = Shape.None; //
    /** 控制点索引 */
    ctrlIndex = -1;
    /** 背景图片 */
    image: HTMLImageElement = new Image();
    /** 图片原始宽度 */
    IMAGE_ORIGIN_WIDTH: number = 0;
    /** 图片缩放宽度 */
    IMAGE_WIDTH = 0;
    /** 图片原始高度 */
    IMAGE_ORIGIN_HEIGHT = 0;
    /** 图片缩放高度 */
    IMAGE_HEIGHT = 0;
    /** 原点x */
    originX = 0;
    /** 原点y */
    originY = 0;
    /** 缩放步长 */
    scaleStep = 0;
    /** 滚动缩放 */
    scrollZoom = true;

    private timer: any = null;
    /** 最小touch双击时间 */
    dblTouch = 300;
    /** 记录touch双击开始时间 */
    dblTouchStore = 0; //
    /** 这个选项可以帮助浏览器进行内部优化 */
    alpha = true;
    /** 专注模式 */
    focusMode = false;
    /** 触控缩放时记录上一次两点距离 */
    scaleTouchStore = 0;
    /** 当前是否为双指触控 */
    isTouch2 = false;
    isMobile = navigator.userAgent.includes('Mobile');
    /** 向上展示label */
    labelUp = false;
    private isCtrlKey = false;
    /** 自定义ctrl快捷键 KeyboardEvent.code */
    ctrlCode = "ControlLeft";
    /** 网格右键菜单 */
    gridMenuEnable = true;
    /** 网格选中背景填充颜色 */
    gridSelectedFillStyle = 'rgba(255, 255, 0, 0.6)';
    /** 画笔大小 */
    brushSize = 20;
    /** 画笔颜色 */
    brushStokeStyle = '#f00';
    /** 橡皮擦大小 */
    eraserSize = 20;
    /** 标注坐标 (以背景图片左上角为原点) */
    position: number[] = [0, 0];
    /**
     * @param el Valid CSS selector string, or DOM
     * @param src image src
     */
    constructor(el: HTMLCanvasElement | string, src?: string | HTMLImageElement) {
        super();
        this.handleLoad = this.handleLoad.bind(this);
        this.handleContextmenu = this.handleContextmenu.bind(this);
        this.handleMousewheel = this.handleMousewheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleDblclick = this.handleDblclick.bind(this);
        this.handleKeyup = this.handleKeyup.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        const container = typeof el === 'string' ? document.querySelector(el) : el;
        if (container instanceof HTMLCanvasElement) {
            this.canvas = container;
            this.offScreen = document.createElement('canvas');
            this.initSetting();
            this.initEvents();
            src && this.setImage(src);
        } else {
            console.warn('HTMLCanvasElement is required!');
        }
        this.crossX.strokeStyle = this.crossStroke;
        this.crossY.strokeStyle = this.crossStroke;
    }

    /** 当前当前选中的标注 */
    get activeShape() {
        return this.dataset.find(x => x.active) || {} as any;
    }

    /** 当前缩放比例 */
    get scale() {
        if (this.IMAGE_ORIGIN_WIDTH && this.IMAGE_WIDTH) {
            return this.IMAGE_WIDTH / this.IMAGE_ORIGIN_WIDTH;
        }
        return 1;
    }

    /** 图片最小边尺寸 */
    get imageMin() {
        return Math.min(this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
    }

    /** 图片原始最大边尺寸 */
    get imageOriginMax() {
        return Math.max(this.IMAGE_ORIGIN_WIDTH, this.IMAGE_ORIGIN_HEIGHT);
    }


    /** 创建放大镜容器 */
    createMagnifierCanvas() {
        if (this.isMagnifierVisible) {
            this.magnifierCanvas = this.magnifierCanvas || document.createElement('canvas')
            this.magnifierCtx = this.magnifierCanvas && this.magnifierCanvas.getContext('2d', {
                willReadFrequently: true,
            }) as CanvasRenderingContext2D
            this.magnifierCanvas.style.position = 'fixed'
            this.magnifierCanvas.style.pointerEvents = 'none'
            this.magnifierCanvas.style.zIndex = '1000'
            this.magnifierCanvas.style.border = '1px solid black'
            this.magnifierCanvas.style.borderRadius = '50%'
            this.magnifierCanvas.style.width = '100px'
            this.magnifierCanvas.style.height = '100px'
            document.body.appendChild(this.magnifierCanvas)
        }

    }

    /** 创建放大镜 */
    createMagnifier(x: number, y: number) {
        if (!this.magnifierCanvas) {
            this.createMagnifierCanvas()
        } else {
            this.updateMagnifier(x, y)
        }
    }
    /** 更新放大镜 */
    updateMagnifier(x: number, y: number) {
        if (this.canvas && this.magnifierCanvas && this.magnifierCtx) {
            const magnifierSize = 100;
            const dpr = window.devicePixelRatio || 1
            this.magnifierCanvas.width = magnifierSize;
            this.magnifierCanvas.height = magnifierSize;
            this.magnifierCtx.clearRect(0, 0, magnifierSize, magnifierSize);

            // 放大镜位置
            if (this.magnifierPosition && this.magnifierPosition.length === 2) {
                const [mx, my] = this.magnifierPosition
                this.magnifierCanvas.style.left = `${mx}px`;
                this.magnifierCanvas.style.top = `${my}px`;
            } else {
                this.magnifierCanvas.style.left = `${x + 10}px`;
                this.magnifierCanvas.style.top = `${y + 10}px`;
            }

            const originImageData = this.getImageDataFromCanvas(this.canvas, [
                x * dpr - magnifierSize / 2,
                y * dpr - magnifierSize / 2,
                magnifierSize,
                magnifierSize,
            ]);
            // 新的像素信息对象
            const areaImageData = this.magnifierCanvas.getContext('2d', { willReadFrequently: true })
                ?.createImageData(this.magnifierCanvas.width, this.magnifierCanvas.height);

            if (areaImageData && originImageData) {
                let count = 0;
                for (let j = 0; j < magnifierSize; j += 1) {
                    for (let i = 0; i < magnifierSize; i += 1) {
                        for (let k = j; k < j + 1; k++) {
                            for (let m = i; m < i + 1; m++) {
                                const index = (k * magnifierSize + m) * 4;
                                areaImageData.data[index] = originImageData.data[count];
                                areaImageData.data[index + 1] =
                                    originImageData.data[count + 1];
                                areaImageData.data[index + 2] =
                                    originImageData.data[count + 2];
                                areaImageData.data[index + 3] =
                                    originImageData.data[count + 3];
                            }
                        }
                        count += 4;
                    }
                }
                this.magnifierCanvas.getContext('2d', { willReadFrequently: true })
                    ?.putImageData(areaImageData, 0, 0);

                // 十字线 有需要可以加
                // this.magnifierCtx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                // this.magnifierCtx.lineWidth = 1;
                // this.magnifierCtx.beginPath();
                // this.magnifierCtx.moveTo(magnifierSize / 2, 0);
                // this.magnifierCtx.lineTo(magnifierSize / 2, magnifierSize);
                // this.magnifierCtx.moveTo(0, magnifierSize / 2);
                // this.magnifierCtx.lineTo(magnifierSize, magnifierSize / 2);
                // this.magnifierCtx.stroke();

                // // 绘制放大镜边框
                this.magnifierCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                this.magnifierCtx.lineWidth = 2;
                this.magnifierCtx.strokeRect(0, 0, magnifierSize, magnifierSize);
            }
        }
    }

    /** 销毁放大镜 */
    private destroyMagnifier() {
        if (this.magnifierCanvas) {
            this.magnifierCanvas.remove()
            this.magnifierCanvas = undefined
            this.magnifierCtx = undefined
        }
    }

    /* 提取像素信息 */
    getImageDataFromCanvas(canvas: HTMLCanvasElement, [x, y, width, height]: [number, number, number, number]) {
        const context = canvas.getContext('2d', { willReadFrequently: true });
        return context?.getImageData(x, y, width, height);
    }

    /** 合成事件 */
    public mergeEvent(e: TouchEvent | MouseEvent) {
        let mouseX = 0;
        let mouseY = 0;
        let mouseCX = 0;
        let mouseCY = 0;
        if (this.isMobile && (e as TouchEvent).touches) {
            const { clientX, clientY } = (e as TouchEvent).touches[0];
            const target = e.target as HTMLCanvasElement;
            const { left, top } = target.getBoundingClientRect();
            mouseX = Math.round(clientX - left);
            mouseY = Math.round(clientY - top);
            if ((e as TouchEvent).touches?.length === 2) {
                const { clientX: clientX1 = 0, clientY: clientY1 = 0 } = (e as TouchEvent).touches[1] || {};
                mouseCX = Math.round(Math.abs((clientX1 - clientX) / 2 + clientX) - left);
                mouseCY = Math.round(Math.abs((clientY1 - clientY) / 2 + clientY) - top);
            } else if ((e as TouchEvent).touches?.length === 1) {
                mouseCX = Math.round(clientX - left);
                mouseCY = Math.round(clientY - top);
            }
        } else {
            mouseX = (e as MouseEvent).offsetX;
            mouseY = (e as MouseEvent).offsetY;
        }
        return { ...e, mouseX, mouseY, mouseCX, mouseCY };
    }

    private handleLoad() {
        this.emit('load', this.image.src);
        this.IMAGE_ORIGIN_WIDTH = this.IMAGE_WIDTH = this.image.width;
        this.IMAGE_ORIGIN_HEIGHT = this.IMAGE_HEIGHT = this.image.height;
        this.fitZoom();
    }

    private handleContextmenu(e: MouseEvent) {
        e.preventDefault();
        if (this.lock) return;
    }

    private handleMousewheel(e: WheelEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (this.lock || !this.scrollZoom) return;
        const { mouseX, mouseY } = this.mergeEvent(e);
        this.mouse = [mouseX, mouseY];
        this.setScale(e.deltaY < 0, true);
    }

    private handleMouseDown(e: MouseEvent | TouchEvent) {
        e.stopPropagation();
        if (this.lock) return;
        const { mouseX, mouseY, mouseCX, mouseCY } = this.mergeEvent(e);
        const offsetX = Math.round(mouseX / this.scale);
        const offsetY = Math.round(mouseY / this.scale);
        this.mouse = this.isMobile && (e as TouchEvent).touches?.length === 2 ? [mouseCX, mouseCY] : [mouseX, mouseY];
        this.remmberOrigin = [mouseX - this.originX, mouseY - this.originY];
        if ((!this.isMobile && (e as MouseEvent).buttons === 1) || (this.isMobile && (e as TouchEvent).touches?.length === 1)) { // 鼠标左键
            const ctrls = this.activeShape.ctrlsData || [];
            this.ctrlIndex = ctrls.findIndex((coor: Point) => this.isPointInCircle(this.mouse, coor, this.ctrlRadius));
            if (this.ctrlIndex > -1 && !this.readonly) { // 点击到控制点
                const [x0, y0] = ctrls[this.ctrlIndex];
                if (this.activeShape.type === Shape.Polygon && this.activeShape.coor.length > 2 && this.ctrlIndex === 0) {
                    this.handleDblclick(e)
                }
                this.remmber = [[offsetX - x0, offsetY - y0]];
            } else if (this.isInBackground(e)) {
                const nx = Math.round(offsetX - this.originX / this.scale);
                const ny = Math.round(offsetY - this.originY / this.scale);
                if (this.activeShape.creating && !this.readonly) { // 创建中
                    if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type)) {
                        const [x, y] = this.activeShape.coor[this.activeShape.coor.length - 1];
                        if (x !== offsetX && y !== offsetY) {
                            this.activeShape.coor.push([nx, ny]);
                        }
                    }
                } else if (this.createType !== Shape.None && !this.readonly && !this.isCtrlKey) { // 开始创建
                    let newShape;
                    const curPoint: Point = [nx, ny];
                    switch (this.createType) {
                        case Shape.Rect:
                            newShape = new Rect({ coor: [curPoint, curPoint] }, this.dataset.length, this);
                            newShape.creating = true;
                            break;
                        case Shape.Polygon:
                            newShape = new Polygon({ coor: [curPoint] }, this.dataset.length, this);
                            newShape.creating = true;
                            break;
                        case Shape.Dot:
                            newShape = new Dot({ coor: curPoint }, this.dataset.length, this);
                            this.emit('add', newShape);
                            break;
                        case Shape.Line:
                            newShape = new Line({ coor: [curPoint] }, this.dataset.length, this);
                            newShape.creating = true;
                            break;
                        case Shape.Circle:
                            newShape = new Circle({ coor: curPoint }, this.dataset.length, this);
                            console.log(newShape);
                            newShape.creating = true;
                            break;
                        case Shape.Grid:
                            newShape = new Grid({ coor: [curPoint, curPoint] }, this.dataset.length, this);
                            newShape.creating = true;
                            break;
                        case Shape.Brush:
                            newShape = new Brush({ coor: [curPoint] }, this.dataset.length, this);
                            newShape.creating = true;
                            break
                        case Shape.Eraser:
                            newShape = new Eraser({ coor: [curPoint] }, this.dataset.length, this);
                            newShape.creating = true;
                            break
                        default:
                            break;
                    }
                    if (newShape) {
                        this.dataset.forEach((sp) => { sp.active = false; });
                        newShape.active = true;
                        this.dataset.push(newShape);
                    }
                } else {
                    // 是否点击到形状
                    const [hitShapeIndex, hitShape] = this.hitOnShape(this.mouse);
                    if (hitShapeIndex > -1 && hitShape) {
                        hitShape.dragging = true;
                        this.dataset.forEach((item, i) => item.active = i === hitShapeIndex);
                        this.dataset.splice(hitShapeIndex, 1);
                        this.dataset.push(hitShape);
                        if (!this.readonly) {
                            this.remmber = [];
                            if ([Shape.Dot, Shape.Circle].includes(hitShape.type)) {
                                const [x, y] = hitShape.coor;
                                this.remmber = [[offsetX - x, offsetY - y]];
                            } else {
                                hitShape.coor.forEach((pt: any) => {
                                    this.remmber.push([offsetX - pt[0], offsetY - pt[1]]);
                                });
                            }
                        }
                        this.emit('select', hitShape);
                    } else {
                        this.activeShape.active = false;
                        this.dataset.sort((a, b) => a.index - b.index);
                        this.emit('select', null);
                    }
                }
                this.update();
            }
        } else if ((!this.isMobile && (e as MouseEvent).buttons === 2) || (this.isMobile && (e as TouchEvent).touches?.length === 3) && !this.readonly) { // 鼠标右键
            if ([Shape.Grid].includes(this.activeShape.type) && this.gridMenuEnable) {
                const rowCol = prompt('x 行 y 列 x,y', [this.activeShape.row, this.activeShape.col].join(','));
                if (typeof rowCol === 'string') {
                    const [row, col] = rowCol.split(',');
                    if (/^[1-9]\d*$/.test(row) && /^[1-9]\d*$/.test(col)) {
                        this.activeShape.row = Number(row);
                        this.activeShape.col = Number(col);
                        this.update();
                    }
                }

            }
            this.emit('contextmenu', e);
        }
    }

    private handleMouseMove(e: MouseEvent | TouchEvent) {
        e.stopPropagation();
        if (this.lock) return;
        const { mouseX, mouseY, mouseCX, mouseCY } = this.mergeEvent(e);
        const offsetX = Math.round(mouseX / this.scale);
        const offsetY = Math.round(mouseY / this.scale);
        if (!this.isCtrlKey && this.isInBackground(e)) {
            this.crossX.coor = [
                [offsetX - this.originX / this.scale, 0],
                [offsetX - this.originX / this.scale, this.image.height],
            ];
            this.crossY.coor = [
                [0, offsetY - this.originY / this.scale],
                [this.image.width, offsetY - this.originY / this.scale],
            ];
        } else {
            this.crossX.coor = []
            this.crossY.coor = []
        }
        this.mouse = this.isMobile && (e as TouchEvent).touches?.length === 2 ? [mouseCX, mouseCY] : [mouseX, mouseY];
        const nx = Math.round(offsetX - this.originX / this.scale);
        const ny = Math.round(offsetY - this.originY / this.scale);
        this.position = [nx, ny]
        if (((!this.isMobile && (e as MouseEvent).buttons === 1) || (this.isMobile && (e as TouchEvent).touches?.length === 1)) && this.activeShape.type) {
            if (this.ctrlIndex > -1 && this.remmber.length && (this.isInBackground(e) || this.activeShape.type === Shape.Circle)) {
                const [[x, y]] = this.remmber;
                // resize矩形或旋转
                if ([Shape.Rect, Shape.Grid].includes(this.activeShape.type)) {
                    // 处理旋转控制点（索引8）
                    if (this.ctrlIndex === 8) {
                        const [centerX, centerY] = this.activeShape.center;
                        const mouseX = offsetX - x;
                        const mouseY = offsetY - y;
                        const dx = mouseX - centerX;
                        const dy = mouseY - centerY;
                        this.activeShape.rotation = Math.atan2(dy, dx) + Math.PI / 2;
                    } else {
                        // 处理resize控制点
                        const [[x0, y0], [x1, y1]] = this.activeShape.coor;
                        let coor: Point[] = [];
                        switch (this.ctrlIndex) {
                            case 0:
                                coor = [[offsetX - x, offsetY - y], [x1, y1]];
                                break;
                            case 1:
                                coor = [[x0, offsetY - y], [x1, y1]];
                                break;
                            case 2:
                                coor = [[x0, offsetY - y], [offsetX - x, y1]];
                                break;
                            case 3:
                                coor = [[x0, y0], [offsetX - x, y1]];
                                break;
                            case 4:
                                coor = [[x0, y0], [offsetX - x, offsetY - y]];
                                break;
                            case 5:
                                coor = [[x0, y0], [x1, offsetY - y]];
                                break;
                            case 6:
                                coor = [[offsetX - x, y0], [x1, offsetY - y]];
                                break;
                            case 7:
                                coor = [[offsetX - x, y0], [x1, y1]];
                                break;
                            default:
                                break;
                        }
                        let [[a0, b0], [a1, b1]] = coor;
                        if (
                            a0 < 0 ||
                            a1 < 0 ||
                            b0 < 0 ||
                            b1 < 0 ||
                            a1 > this.IMAGE_ORIGIN_WIDTH ||
                            b1 > this.IMAGE_ORIGIN_HEIGHT
                        ) {
                            // 偶然触发 超出边界处理
                            a0 < 0 && (a0 = 0);
                            a1 < 0 && (a1 = 0);
                            b0 < 0 && (b0 = 0);
                            b1 < 0 && (b1 = 0);
                            if (a1 > this.IMAGE_ORIGIN_WIDTH) {
                                a1 = this.IMAGE_ORIGIN_WIDTH;
                            }
                            if (b1 > this.IMAGE_ORIGIN_HEIGHT) {
                                b1 = this.IMAGE_ORIGIN_HEIGHT;
                            }
                        }

                        if (a1 - a0 >= this.MIN_WIDTH && b1 - b0 >= this.MIN_HEIGHT) {
                            this.activeShape.coor = [[a0, b0], [a1, b1]];
                        } else {
                            this.emit('warn', `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than${this.MIN_HEIGHT}。`);
                        }
                    }
                } else if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type)) {
                    const newPoint = [nx, ny];
                    this.activeShape.coor.splice(this.ctrlIndex, 1, newPoint);
                } else if (this.activeShape.type === Shape.Circle) {
                    const nx = Math.round(offsetX - this.originX / this.scale);
                    const newRadius = nx - this.activeShape.coor[0];
                    if (newRadius >= this.MIN_RADIUS) this.activeShape.radius = newRadius;
                }
                if (this.isMagnifierVisible) {
                    const [ux, uy] = this.isMobile ? [mouseCX, mouseCY] : [mouseX, mouseY]
                    this.createMagnifier(ux, uy)
                }


            } else if (this.activeShape.dragging && !this.readonly) { // 拖拽
                // 拖拽点的时候，也需要触发放大镜
                if (this.isMagnifierVisible && this.activeShape.type === 3) {
                    const [ux, uy] = this.isMobile ? [mouseCX, mouseCY] : [mouseX, mouseY]
                    this.createMagnifier(ux, uy)
                }
                let coor = [];
                let noLimit = true;
                const w = this.IMAGE_ORIGIN_WIDTH || this.WIDTH;
                const h = this.IMAGE_ORIGIN_HEIGHT || this.HEIGHT;
                if ([Shape.Dot, Shape.Circle].includes(this.activeShape.type)) {
                    const [t1, t2] = this.remmber[0];
                    const x = offsetX - t1;
                    const y = offsetY - t2;
                    if (x < 0 || x > w || y < 0 || y > h) noLimit = false;
                    coor = [x, y];
                } else {
                    for (let i = 0; i < this.activeShape.coor.length; i++) {
                        const tar = this.remmber[i];
                        const x = offsetX - tar[0];
                        const y = offsetY - tar[1];
                        if (x < 0 || x > w || y < 0 || y > h) noLimit = false;
                        coor.push([x, y]);
                    }
                }
                if (noLimit) this.activeShape.coor = coor;
            } else if (this.activeShape.creating && this.isInBackground(e)) {
                // const x = Math.round(offsetX - this.originX / this.scale);
                // const y = Math.round(offsetY - this.originY / this.scale);
                // 创建矩形
                if ([Shape.Rect, Shape.Grid].includes(this.activeShape.type)) {
                    this.activeShape.coor.splice(1, 1, [nx, ny]);
                } else if (this.activeShape.type === Shape.Circle) {
                    const [x0, y0] = this.activeShape.coor;
                    const r = Math.sqrt((x0 - nx) ** 2 + (y0 - ny) ** 2);
                    this.activeShape.radius = r;
                } else if ([Shape.Brush, Shape.Eraser].includes(this.activeShape.type)) {
                    this.activeShape.coor.push([nx, ny]);
                }
            }
            this.update();
        } else if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type) && this.activeShape.creating) {
            // 多边形添加点
            this.update();
        } else if ((!this.isMobile && (e as MouseEvent).buttons === 2 && (e as MouseEvent).which === 3) || (this.isMobile && (e as TouchEvent).touches?.length === 1 && !this.isTouch2)) {
            // 拖动背景
            this.originX = Math.round(mouseX - this.remmberOrigin[0]);
            this.originY = Math.round(mouseY - this.remmberOrigin[1]);
            this.update();
        } else if (this.isMobile && (e as TouchEvent).touches?.length === 2) {
            this.isTouch2 = true;
            const touch0 = (e as TouchEvent).touches[0];
            const touch1 = (e as TouchEvent).touches[1];
            const cur = this.scaleTouchStore;
            this.scaleTouchStore = Math.abs((touch1.clientX - touch0.clientX) * (touch1.clientY - touch0.clientY));
            this.setScale(this.scaleTouchStore > cur, true);
        } else {
            if (!this.isCtrlKey) {
                this.update();
            }
        }
    }

    private handleMouseUp(e: MouseEvent | TouchEvent) {
        e.stopPropagation();
        if (this.lock) return;
        // 鼠标抬起则卸载放大器
        this.destroyMagnifier()
        if (this.isMobile) {
            if ((e as TouchEvent).touches?.length === 0) {
                this.isTouch2 = false;
            }
            if ((Date.now() - this.dblTouchStore) < this.dblTouch) {
                this.handleDblclick(e);
                return;
            }
            this.dblTouchStore = Date.now();
        }
        this.remmber = [];
        if (this.activeShape.type !== Shape.None && !this.isCtrlKey) {
            this.activeShape.dragging = false;
            if (this.activeShape.creating) {
                if ([Shape.Rect, Shape.Grid].includes(this.activeShape.type)) {
                    const [[x0, y0], [x1, y1]] = this.activeShape.coor;
                    if (Math.abs(x0 - x1) < this.MIN_WIDTH || Math.abs(y0 - y1) < this.MIN_HEIGHT) {
                        this.dataset.pop();
                        this.emit('warn', `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than ${this.MIN_HEIGHT}`);
                    } else {
                        this.activeShape.coor = [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]];
                        this.activeShape.creating = false;
                        this.emit('add', this.activeShape);
                    }
                } else if (this.activeShape.type === Shape.Circle) {
                    if (this.activeShape.radius < this.MIN_RADIUS) {
                        this.dataset.pop();
                        this.emit('warn', `Radius cannot be less than ${this.MIN_WIDTH}`);
                    } else {
                        this.activeShape.creating = false;
                        this.emit('add', this.activeShape);
                    }
                } else if ([Shape.Brush, Shape.Eraser].includes(this.activeShape.type)) {
                    this.activeShape.creating = false;
                    this.emit('add', this.activeShape);
                }
                this.update();
            }
        }
    }

    private handleDblclick(e: MouseEvent | TouchEvent) {
        e.stopPropagation();
        if (this.lock) return;
        if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type)) {
            const canPolygon = this.activeShape.type === Shape.Polygon && this.activeShape.coor.length > 2
            const canLine = this.activeShape.type === Shape.Line && this.activeShape.coor.length > 1
            if (canPolygon || canLine) {
                this.emit('add', this.activeShape);
                this.activeShape.creating = false;
                this.update();
            }
        } else if ([Shape.Grid].includes(this.activeShape.type)) { // 双击切换网格分区选中状态
            if (this.activeShape.active) {
                this.activeShape.gridRects.forEach((rect: { coor: Point[]; index: number; }) => {
                    if (this.isPointInRect(this.mouse, rect.coor)) {
                        const thisIndex = this.activeShape.selected.findIndex((x: number) => rect.index === x)
                        if (thisIndex > -1) {
                            this.activeShape.selected.splice(thisIndex, 1);
                        } else {
                            this.activeShape.selected.push(rect.index);
                        }
                    }
                });
                this.update();
            }
        }
    }
    private handleKeydown(e: KeyboardEvent) {
        if (e.code === this.ctrlCode) {
            this.isCtrlKey = true;
        }
    }

    private handleKeyup(e: KeyboardEvent) {
        if (e.code === this.ctrlCode) {
            this.isCtrlKey = false;
        }
        if (this.lock || document.activeElement !== document.body || this.readonly) return;
        if (this.activeShape.type) {
            if ([Shape.Polygon, Shape.Line].includes(this.activeShape.type) && e.key === 'Escape') {
                if (this.activeShape.coor.length > 1 && this.activeShape.creating) {
                    this.activeShape.coor.pop();
                } else {
                    this.deleteByIndex(this.activeShape.index);
                }
                this.update();
            } else if (e.key === 'Backspace') {
                this.deleteByIndex(this.activeShape.index);
            }
        }
    }

    /** 初始化配置 */
    initSetting() {
        if (!this.canvas || !this.offScreen) return;
        const dpr = window.devicePixelRatio || 1;
        // 处理图片跨域问题
        this.image.crossOrigin = 'anonymous';
        this.canvas.style.userSelect = 'none';
        this.ctx = this.ctx || this.canvas.getContext('2d', { alpha: this.alpha });
        this.WIDTH = Math.round(this.canvas.clientWidth);
        this.HEIGHT = Math.round(this.canvas.clientHeight);
        this.canvas.width = this.WIDTH * dpr;
        this.canvas.height = this.HEIGHT * dpr;
        this.canvas.style.width = this.WIDTH + 'px';
        this.canvas.style.height = this.HEIGHT + 'px';
        this.offScreen.width = this.WIDTH;
        this.offScreen.height = this.HEIGHT;
        this.offScreenCtx = this.offScreenCtx || this.offScreen.getContext('2d', { willReadFrequently: true });
        this.ctx?.scale(dpr, dpr);
    }

    /** 初始化事件 */
    initEvents() {
        if (!this.canvas) return;
        this.image.addEventListener('load', this.handleLoad);
        this.canvas.addEventListener('touchstart', this.handleMouseDown);
        this.canvas.addEventListener('touchmove', this.handleMouseMove);
        this.canvas.addEventListener('touchend', this.handleMouseUp);
        this.canvas.addEventListener('contextmenu', this.handleContextmenu);
        // @ts-ignore
        this.canvas.addEventListener('mousewheel', this.handleMousewheel);
        this.canvas.addEventListener('wheel', this.handleMousewheel);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('dblclick', this.handleDblclick);
        document.body.addEventListener('keydown', this.handleKeydown, true);
        document.body.addEventListener('keyup', this.handleKeyup, true);
    }

    /**
     * 添加/切换图片
     * @param source 图片链接或图片对象
     */
    setImage(source: string | HTMLImageElement) {
        if (typeof source === 'string') {
            this.image.src = source;
        } else {
            this.image = source;
            this.image.crossOrigin = 'anonymous';
            if (this.image.complete) {
                this.handleLoad();
            } else {
                this.image.addEventListener('load', this.handleLoad);
            }
        }
    }

    /**
     * 设置数据
     * @param data Array
     */
    setData(data: AllShape[]) {
        setTimeout(() => {
            const initdata: AllShape[] = [];
            data.forEach((item: any, index) => {
                if (Object.prototype.toString.call(item).includes('Object')) {
                    let shape: any;
                    switch (item.type) {
                        case Shape.Rect:
                            shape = new Rect(item, index, this);
                            break;
                        case Shape.Polygon:
                            shape = new Polygon(item, index, this);
                            break;
                        case Shape.Dot:
                            shape = new Dot(item, index, this);
                            break;
                        case Shape.Line:
                            shape = new Line(item, index, this);
                            break;
                        case Shape.Circle:
                            shape = new Circle(item, index, this);
                            break;
                        case Shape.Grid:
                            shape = new Grid(item, index, this);
                            break;
                        case Shape.Brush:
                            shape = new Brush(item, index, this);
                            break;
                        case Shape.Eraser:
                            shape = new Eraser(item, index, this);
                            break;
                        default:
                            console.warn('Invalid shape', item);
                            break;
                    }
                    [Shape.Rect, Shape.Polygon, Shape.Dot, Shape.Line, Shape.Circle, Shape.Grid, Shape.Brush, Shape.Eraser].includes(item.type) && shape && initdata.push(shape);
                } else {
                    console.warn('Shape must be an enumerable Object.', item);
                }
            });
            this.dataset = initdata;
            this.update();
        });
    }

    /**
     * 判断是否在标注实例上
     * @param mousePoint 点击位置
     * @returns
     */
    hitOnShape(mousePoint: Point): [number, AllShape] {
        let hitShapeIndex = -1;
        let hitShape: any;
        for (let i = this.dataset.length - 1; i > -1; i--) {
            const shape = this.dataset[i];
            if (shape.hide) continue;
            if (
                (shape.type === Shape.Dot && this.isPointInCircle(mousePoint, shape.coor as Point, this.ctrlRadius)) ||
                (shape.type === Shape.Circle && this.isPointInCircle(mousePoint, shape.coor as Point, (shape as Circle).radius * this.scale)) ||
                (shape.type === Shape.Rect && this.isPointInRect(mousePoint, (shape as Rect).coor)) ||
                (shape.type === Shape.Polygon && this.isPointInPolygon(mousePoint, (shape as Polygon).coor)) ||
                (shape.type === Shape.Line && this.isPointInLine(mousePoint, (shape as Line).coor)) ||
                (shape.type === Shape.Grid && this.isPointInRect(mousePoint, (shape as Grid).coor))
            ) {
                if (this.focusMode && !shape.active) continue;
                hitShapeIndex = i;
                hitShape = shape;
                break;
            }
        }
        return [hitShapeIndex, hitShape];
    }

    /**
     * 判断鼠标是否在背景图内部
     * @param e MouseEvent
     * @returns 布尔值
     */
    isInBackground(e: MouseEvent | TouchEvent): boolean {
        const { mouseX, mouseY } = this.mergeEvent(e);
        return mouseX >= this.originX &&
            mouseY >= this.originY &&
            mouseX <= this.originX + this.IMAGE_ORIGIN_WIDTH * this.scale &&
            mouseY <= this.originY + this.IMAGE_ORIGIN_HEIGHT * this.scale;
    }

    /**
     * 判断是否在矩形内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInRect(point: Point, coor: Point[]): boolean {
        const [x, y] = point;
        const [[x0, y0], [x1, y1]] = coor.map((a) => a.map((b) => b * this.scale));
        return x0 + this.originX <= x &&
            x <= x1 + this.originX &&
            y0 + this.originY <= y &&
            y <= y1 + this.originY;
    }

    /**
     * 判断是否在多边形内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInPolygon(point: Point, coor: Point[]): boolean {
        if (!this.offScreenCtx) return false;
        this.offScreenCtx.save();
        this.offScreenCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.offScreenCtx.translate(this.originX, this.originY);
        this.offScreenCtx.beginPath();
        coor.forEach((pt, i) => {
            const [x, y] = pt.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.offScreenCtx?.moveTo(x, y);
            } else {
                this.offScreenCtx?.lineTo(x, y);
            }
        });
        this.offScreenCtx.closePath();
        this.offScreenCtx.fill();
        const areaData = this.offScreenCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
        const index = (point[1] - 1) * this.WIDTH * 4 + point[0] * 4;
        this.offScreenCtx.restore();
        return areaData.data[index + 3] !== 0;
    }

    /**
     * 判断是否在圆内
     * @param point 坐标
     * @param center 圆心
     * @param r 半径
     * @param needScale 是否为圆形点击检测
     * @returns 布尔值
     */
    isPointInCircle(point: Point, center: Point, r: number): boolean {
        const [x, y] = point;
        const [x0, y0] = center.map((a) => a * this.scale);
        const distance = Math.sqrt((x0 + this.originX - x) ** 2 + (y0 + this.originY - y) ** 2);
        return distance <= r;
    }

    /**
     * 判断是否在折线内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInLine(point: Point, coor: Point[]): boolean {
        if (!this.offScreenCtx) return false;
        this.offScreenCtx.save();
        this.offScreenCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.offScreenCtx.translate(this.originX, this.originY);
        this.offScreenCtx.lineWidth = this.lineWidth > 5 ? this.lineWidth : 5;
        this.offScreenCtx.beginPath();
        coor.forEach((pt, i) => {
            const [x, y] = pt.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.offScreenCtx?.moveTo(x, y);
            } else {
                this.offScreenCtx?.lineTo(x, y);
            }
        });
        this.offScreenCtx.stroke();
        const areaData = this.offScreenCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
        const index = (point[1] - 1) * this.WIDTH * 4 + point[0] * 4;
        this.offScreenCtx.restore();
        return areaData.data[index + 3] !== 0;
    }

    /**
     * 绘制矩形
     * @param shape 标注实例
     * @returns
     */
    drawRect(shape: Rect, sub?: Record<string, any>) {
        if (!this.ctx || shape.coor.length !== 2) return;
        const { strokeStyle = '', fillStyle = '', active, creating, coor, lineWidth, rotation } = shape;
        const [[x0, y0], [x1, y1]] = coor.map((a: Point) => a.map((b) => Math.round(b * this.scale)));
        const centerX = (x0 + x1) / 2;
        const centerY = (y0 + y1) / 2;
        const w = x1 - x0;
        const h = y1 - y0;

        this.ctx.save();
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        if (sub?.isSelected) {
            this.ctx.fillStyle = sub?.selectedFillStyle || fillStyle
        } else {
            this.ctx.fillStyle = (active || creating) ? this.activeFillStyle : fillStyle;
        }
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : strokeStyle;

        // 应用旋转
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);
        this.ctx.translate(-centerX, -centerY);

        if (!creating) this.ctx.fillRect(x0, y0, w, h);
        this.ctx.strokeRect(x0, y0, w, h);
        this.ctx.restore();
        this.drawLabel(coor[0], shape);
    }

    /**
     * 绘制多边形
     * @param shape 标注实例
     */
    drawPolygon(shape: Polygon) {
        if (!this.ctx) return;
        const { strokeStyle = '', fillStyle = '', active, creating, coor, lineWidth } = shape;
        this.ctx.save();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = (active || creating) ? this.activeFillStyle : fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : strokeStyle;
        this.ctx.beginPath();
        coor.forEach((el: Point, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx?.moveTo(x, y);
            } else {
                this.ctx?.lineTo(x, y);
            }
        });
        if (creating) {
            const [x, y] = this.mouse || [];
            this.ctx.lineTo(x - this.originX, y - this.originY);
        } else if (coor.length > 2) {
            this.ctx.closePath();
        }
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor[0], shape);
    }

    /**
     * 绘制点
     * @param shape 标注实例
     */
    drawDot(shape: Dot) {
        if (!this.ctx) return;
        const { strokeStyle = '', creating, fillStyle = '', active, coor, lineWidth } = shape;
        const [x, y] = coor.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = (active || creating) ? this.activeFillStyle : fillStyle;
        this.ctx.strokeStyle = active ? this.activeStrokeStyle : strokeStyle;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor as Point, shape);
    }

    /**
     * 绘制圆
     * @param shape 标注实例
     */
    drawCirle(shape: Circle) {
        if (!this.ctx) return;
        const { strokeStyle = '', fillStyle = '', active, coor, creating, radius, ctrlsData, lineWidth } = shape;
        const [x, y] = coor.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = (active || creating) ? this.activeFillStyle : fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : strokeStyle;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(ctrlsData[0] as Point, shape);
    }

    /**
     * 绘制折线
     * @param shape 标注实例
     */
    drawLine(shape: Line) {
        if (!this.ctx) return;
        const { strokeStyle = '', active, creating, coor, lineWidth } = shape;
        this.ctx.save();
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : strokeStyle;
        this.ctx.beginPath();
        coor.forEach((el: Point, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx?.moveTo(x, y);
            } else {
                this.ctx?.lineTo(x, y);
            }
        });
        if (creating) {
            const [x, y] = this.mouse || [];
            this.ctx.lineTo(x - this.originX, y - this.originY);
        }
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor[0], shape);
    }

    /**
     * 绘制网格
     * @param shape 标注实例
     * @returns
     */
    drawGrid(shape: Grid) {
        if (!this.ctx) return;
        if (shape.coor.length !== 2) return;
        const { strokeStyle = '', fillStyle = '', active, creating, coor, lineWidth } = shape;
        const [[x0, y0], [x1, y1]] = coor.map((a: Point) => a.map((b) => Math.round(b * this.scale)));
        this.ctx.save();
        this.ctx.lineWidth = lineWidth || this.lineWidth;
        this.ctx.fillStyle = (active || creating) ? this.activeFillStyle : fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : strokeStyle;
        shape.gridRects.forEach((rect: Rect, m) => {
            this.drawRect(rect, {
                selectedFillStyle: shape.selectedFillStyle || this.gridSelectedFillStyle,
                isSelected: shape.selected?.includes(m)
            })
        });
        const w = x1 - x0;
        const h = y1 - y0;
        if (!creating) this.ctx.fillRect(x0, y0, w, h);
        this.ctx.strokeRect(x0, y0, w, h);
        this.ctx.restore();
        this.drawLabel(coor[0], shape);
    }
    /**
     * 绘制画笔路径
     * @param shape 形状
     */
    drawBrushPath(shape: Brush) {
        if (!this.ctx) return;
        const { coor, brushSize = 1, brushStokeStyle = '' } = shape;
        this.ctx.save()
        this.ctx.globalCompositeOperation = 'source-over'; // 正常绘制模式
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = Math.round((brushSize) * this.scale);
        this.ctx.strokeStyle = brushStokeStyle;
        this.ctx.beginPath();
        coor.forEach((el: Point, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx?.moveTo(x, y);
            } else {
                this.ctx?.lineTo(x, y);
            }
        });
        this.ctx.stroke();
        this.ctx.restore();
    }
    /**
     * 绘制橡皮擦路径
     * @param coor 折线坐标
     * @param shape 形状
     */
    drawEraserPath(shape: Eraser) {
        if (!this.ctx) return;
        const { coor, eraserSize = 1 } = shape;
        this.ctx.save()
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = Math.round(eraserSize * this.scale);
        this.ctx.beginPath();
        coor.forEach((el: Point, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx?.moveTo(x, y);
            } else {
                this.ctx?.lineTo(x, y);
            }
        });
        this.ctx.stroke();
        this.ctx.restore();
    }
    /** 清除画布 */
    clearBrush() {
        const newDateset = this.dataset.filter((el) => ![Shape.Brush, Shape.Eraser].includes(el.type));
        this.setData(newDateset);
    }

    /**
     * 绘制控制点
     * @param point 坐标
     */
    drawCtrl(point: Point, color?: string) {
        if (!this.ctx) return;
        const [x, y] = point.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = color || this.ctrlFillStyle;
        this.ctx.strokeStyle = this.ctrlStrokeStyle;
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * 绘制控制点列表
     * @param shape 标注实例
     */
    drawCtrlList(shape: Rect | Polygon | Line) {
        shape.ctrlsData.forEach((point, i) => {
            if (shape.type === Shape.Circle) {
                if (i === 1) this.drawCtrl(point);
            } else {
                this.drawCtrl(point, (shape.type === Shape.Rect && i === 8) ? 'yellow' : undefined);
            }
        });
    }

    /**
     * 绘制label
     * @param point 位置
     * @param label 文本
     */
    drawLabel(point: Point, shape: AllShape) {
        const { label = '', labelFillStyle = '', labelFont = '', textFillStyle = '', hideLabel, labelUp, lineWidth } = shape;
        const isHideLabel = typeof hideLabel === 'boolean' ? hideLabel : this.hideLabel;
        const isLabelUp = typeof labelUp === 'boolean' ? labelUp : this.labelUp;
        const currLineWidth = lineWidth || this.lineWidth;

        if (this.ctx && label.length && !isHideLabel) {
            this.ctx.font = labelFont || this.labelFont;
            const textPaddingLeft = 4;
            const textPaddingTop = 4;
            const newText = label.length < this.labelMaxLen + 1 ? label : `${label.slice(0, this.labelMaxLen)}...`;
            const text = this.ctx.measureText(newText);
            const font = parseInt(this.ctx.font) - 4;
            const labelWidth = text.width + textPaddingLeft * 2;
            const labelHeight = font + textPaddingTop * 2;

            let [x, y] = point.map((a) => a * this.scale);

            // 对于矩形，如果存在旋转角度，需要调整label位置
            if (shape.type === Shape.Rect && (shape as Rect).rotation !== 0) {
                const rect = shape as Rect;
                const [[x0, y0], [x1, y1]] = rect.coor;
                const centerX = (x0 + x1) / 2 * this.scale;
                const centerY = (y0 + y1) / 2 * this.scale;

                // 将左上角点转换为相对于中心点的坐标
                const dx = x - centerX;
                const dy = y - centerY;

                // 应用旋转
                const rotatedX = dx * Math.cos(rect.rotation) - dy * Math.sin(rect.rotation);
                const rotatedY = dx * Math.sin(rect.rotation) + dy * Math.cos(rect.rotation);

                // 转换回绝对坐标
                x = rotatedX + centerX;
                y = rotatedY + centerY;
            }

            const toleft = (this.IMAGE_ORIGIN_WIDTH - point[0]) < labelWidth / this.scale;
            const toTop = (this.IMAGE_ORIGIN_HEIGHT - point[1]) < labelHeight / this.scale;
            const toTop2 = point[1] > labelHeight / this.scale;
            const isup = isLabelUp ? toTop2 : toTop;
            this.ctx.save();
            this.ctx.fillStyle = labelFillStyle || this.labelFillStyle;
            this.ctx.fillRect(toleft ? (x - text.width - textPaddingLeft - currLineWidth / 2) : (x + currLineWidth / 2), isup ? (y - labelHeight - currLineWidth / 2) : (y + currLineWidth / 2), labelWidth, labelHeight);
            this.ctx.fillStyle = textFillStyle || this.textFillStyle;
            this.ctx.fillText(newText, toleft ? (x - text.width) : (x + textPaddingLeft + currLineWidth / 2), isup ? (y - labelHeight + font + textPaddingTop) : (y + font + textPaddingTop + currLineWidth / 2), 180);
            this.ctx.restore();
        }
    }

    /**
     * 更新画布
     */
    update() {
        window.cancelAnimationFrame(this.timer);
        this.timer = window.requestAnimationFrame(() => {
            if (!this.ctx) return;
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
            this.ctx.translate(this.originX, this.originY);

            const renderList = this.focusMode ? (this.activeShape.type ? [this.activeShape] : []) : this.dataset;
            const BrushAndErasers = renderList.filter(item => item.type === Shape.Brush || item.type === Shape.Eraser);
            for (let i = 0; i < BrushAndErasers.length; i++) {
                const shape = BrushAndErasers[i];
                if (shape.hide) continue;
                switch (shape.type) {
                    case Shape.Brush:
                        shape.brushSize = shape.brushSize ?? this.brushSize;
                        shape.brushStokeStyle = shape.brushStokeStyle ?? this.brushStokeStyle;
                        this.drawBrushPath(shape as Brush);
                        break;
                    case Shape.Eraser:
                        shape.eraserSize = shape.eraserSize ?? this.eraserSize;
                        this.drawEraserPath(shape as Eraser);
                        break;
                    default:
                        break;
                }
            }
            const NormalShapes = renderList.filter(item => item.type !== Shape.Brush && item.type !== Shape.Eraser);
            for (let i = 0; i < NormalShapes.length; i++) {
                const shape = NormalShapes[i];
                if (shape.hide) continue;
                switch (shape.type) {
                    case Shape.Rect:
                        this.drawRect(shape as Rect);
                        break;
                    case Shape.Polygon:
                        this.drawPolygon(shape as Polygon);
                        break;
                    case Shape.Dot:
                        this.drawDot(shape as Dot);
                        break;
                    case Shape.Line:
                        this.drawLine(shape as Line);
                        break;
                    case Shape.Circle:
                        this.drawCirle(shape as Circle);
                        break;
                    case Shape.Grid:
                        this.drawGrid(shape as Grid);
                        break;
                    default:
                        break;
                }
            }
            if (!this.isCtrlKey && this.showCross) {
                this.drawLine(this.crossX);
                this.drawLine(this.crossY);
            }
            if ([Shape.Rect, Shape.Polygon, Shape.Line, Shape.Circle, Shape.Grid].includes(this.activeShape.type) && !this.activeShape.hide) {
                this.drawCtrlList(this.activeShape);
            }
            this.ctx.globalCompositeOperation = 'destination-over';
            if (this.IMAGE_WIDTH && this.IMAGE_HEIGHT) {
                this.ctx.drawImage(this.image, 0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
            }
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.restore();
            this.emit('updated', this.dataset);
        });
    }

    /**
     * 通过索引删除指定形状
     * @param index number
     */
    deleteByIndex(index: number) {
        const num = this.dataset.findIndex((x) => x.index === index);
        if (num > -1) {
            this.emit('delete', this.dataset[num]);
            this.dataset.splice(num, 1);
            this.dataset.forEach((item, i) => { item.index = i; });
            this.update();
        }
    }

    /**
     * 通过uuid删除指定形状
     * @param index string
     */
    deleteByUuid(uuid: string) {
        const target = this.dataset.find((x) => x.uuid === uuid);
        if (target) {
            this.emit('delete', target);
            this.dataset = this.dataset.filter((x) => x.uuid !== uuid);
            this.update();
        }
    }

    /**
     * 计算缩放步长
     */
    calcStep(flag = '') {
        if (this.IMAGE_WIDTH < this.WIDTH && this.IMAGE_HEIGHT < this.HEIGHT) {
            if (flag === '' || flag === 'b') {
                this.setScale(true, false, true);
                this.calcStep('b');
            }
        }
        if (this.IMAGE_WIDTH > this.WIDTH || this.IMAGE_HEIGHT > this.HEIGHT) {
            if (flag === '' || flag === 's') {
                this.setScale(false, false, true);
                this.calcStep('s');
            }
        }
    }

    /**
     * 缩放
     * @param type true放大5%，false缩小5%
     * @param center 缩放中心 center|mouse
     * @param pure 不绘制
     */
    setScale(type: boolean, byMouse = false, pure = false) {
        if (this.lock) return;
        if ((!type && this.imageMin < 20) || (type && this.IMAGE_WIDTH > this.imageOriginMax * 100)) return;
        if (type) { this.scaleStep++; } else { this.scaleStep--; }
        let realToLeft = 0;
        let realToRight = 0;
        const [x, y] = this.mouse || [];
        if (byMouse) {
            realToLeft = (x - this.originX) / this.scale;
            realToRight = (y - this.originY) / this.scale;
        }
        const abs = Math.abs(this.scaleStep);
        const width = this.IMAGE_WIDTH;
        this.IMAGE_WIDTH = Math.round(this.IMAGE_ORIGIN_WIDTH * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
        this.IMAGE_HEIGHT = Math.round(this.IMAGE_ORIGIN_HEIGHT * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
        if (byMouse) {
            this.originX = x - realToLeft * this.scale;
            this.originY = y - realToRight * this.scale;
        } else {
            const scale = this.IMAGE_WIDTH / width;
            this.originX = this.WIDTH / 2 - (this.WIDTH / 2 - this.originX) * scale;
            this.originY = this.HEIGHT / 2 - (this.HEIGHT / 2 - this.originY) * scale;
        }
        if (!pure) {
            this.update();
        }
    }

    /**
     * 适配背景图
     */
    fitZoom() {
        this.calcStep();
        if (this.IMAGE_HEIGHT / this.IMAGE_WIDTH >= this.HEIGHT / this.WIDTH) {
            this.IMAGE_WIDTH = this.IMAGE_ORIGIN_WIDTH / (this.IMAGE_ORIGIN_HEIGHT / this.HEIGHT);
            this.IMAGE_HEIGHT = this.HEIGHT;
        } else {
            this.IMAGE_WIDTH = this.WIDTH;
            this.IMAGE_HEIGHT = this.IMAGE_ORIGIN_HEIGHT / (this.IMAGE_ORIGIN_WIDTH / this.WIDTH);
        }
        this.originX = (this.WIDTH - this.IMAGE_WIDTH) / 2;
        this.originY = (this.HEIGHT - this.IMAGE_HEIGHT) / 2;
        this.update();
    }

    /**
     * 设置专注模式
     * @param type {boolean}
     */
    setFocusMode(type: boolean) {
        this.focusMode = type;
        this.update();
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this.canvas) return
        this.image.removeEventListener('load', this.handleLoad);
        this.canvas.removeEventListener('contextmenu', this.handleContextmenu);
        // @ts-ignore
        this.canvas.removeEventListener('mousewheel', this.handleMousewheel);
        this.canvas.removeEventListener('wheel', this.handleMousewheel);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('touchend', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('touchmove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('touchend', this.handleMouseUp);
        this.canvas.removeEventListener('dblclick', this.handleDblclick);
        document.body.removeEventListener('keydown', this.handleKeydown, true);
        document.body.removeEventListener('keyup', this.handleKeyup, true);
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.canvas.style.width = '';
        this.canvas.style.height = '';
        this.canvas.style.userSelect = '';
    }

    /**
     * 重新设置画布大小
     */
    resize() {
        if (!this.canvas) return
        this.canvas.removeAttribute('width');
        this.canvas.removeAttribute('height');
        this.canvas.style.width = '';
        this.canvas.style.height = '';
        this.initSetting();
        this.update();
    }
}
