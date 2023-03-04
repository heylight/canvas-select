import Rect from './shape/Rect';
import Polygon from './shape/Polygon';
import Dot from './shape/Dot';
import EventBus from './EventBus';
import Line from './shape/Line';
import Circle from './shape/Circle';

type Point = [number, number]
type AllShape = Rect | Polygon | Dot | Line | Circle

export default class CanvasSelect extends EventBus {
    lock: boolean = false // 只读模式

    MIN_WIDTH = 10

    MIN_HEIGHT = 10

    MIN_RADIUS = 5

    strokeStyle = '#0f0'

    fillStyle = 'rgba(0, 0, 255,0.1)'

    activeStrokeStyle = '#f00'

    activeFillStyle = 'rgba(255, 0, 0,0.1)'

    ctrlStrokeStyle = '#000'

    ctrlFillStyle = '#fff'

    ctrlRadius = 3

    labelFillStyle = '#fff'

    labelFont = '10px sans-serif'

    textFillStyle = '#000'

    labelMaxLen = 10

    WIDTH = 0

    HEIGHT = 0

    canvas: HTMLCanvasElement

    ctx: CanvasRenderingContext2D

    dataset: Array<AllShape> = []

    offScreen: HTMLCanvasElement

    offScreenCtx: CanvasRenderingContext2D

    remmber: number[][] // 记录锚点距离

    mouse: Point // 记录鼠标位置

    remmberOrigin: number[] = [0, 0] // 记录背景图鼠标位移

    createType = 0 // 0 不创建，1 创建矩形，2 创建多边形，3 创建点

    ctrlIndex = -1

    cursor: string = 'auto'

    image: HTMLImageElement = new Image()

    IMAGE_ORIGIN_WIDTH: number;

    IMAGE_WIDTH = 0;

    IMAGE_ORIGIN_HEIGHT = 0;

    IMAGE_HEIGHT = 0;

    originX = 0; // 原点x

    originY = 0; // 原点y

    scaleStep = 0; // 缩放步长

    scrollZoom = true // 滚动缩放

    timer: NodeJS.Timer;

    alpha = true; // 这个选项可以帮助浏览器进行内部优化

    focusMode = false; // 专注模式
    /**
     * @param el Valid CSS selector string, or DOM
     * @param src image src
     */
    constructor(el: HTMLCanvasElement | string, src?: string) {
        super()
        this.handleLoad = this.handleLoad.bind(this)
        this.handleContextmenu = this.handleContextmenu.bind(this)
        this.handleMousewheel = this.handleMousewheel.bind(this)
        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handelMouseMove = this.handelMouseMove.bind(this)
        this.handelMouseUp = this.handelMouseUp.bind(this)
        this.handelDblclick = this.handelDblclick.bind(this)
        this.handelKeyup = this.handelKeyup.bind(this)
        const container = typeof el === 'string' ? document.querySelector(el) : el;
        if (container instanceof HTMLCanvasElement) {
            this.canvas = container;
            this.canvas.style.userSelect = 'none';
            this.initStage();
            src && this.setImage(src);
        } else {
            console.warn('HTMLCanvasElement is required!');
        }
    }

    get activeShape() {
        return this.dataset.find(x => x.active) || {} as any;
    }

    get scale() {
        if (this.IMAGE_ORIGIN_WIDTH && this.IMAGE_WIDTH) {
            return this.IMAGE_WIDTH / this.IMAGE_ORIGIN_WIDTH;
        }
        return 1;
    }

    get imageMin() {
        return Math.min(this.IMAGE_WIDTH, this.IMAGE_HEIGHT)
    }

    get imageOriginMax() {
        return Math.max(this.IMAGE_ORIGIN_WIDTH, this.IMAGE_ORIGIN_HEIGHT)
    }

    handleLoad() {
        this.emit('load', this.image.src);
        this.IMAGE_ORIGIN_WIDTH = this.IMAGE_WIDTH = this.image.width;
        this.IMAGE_ORIGIN_HEIGHT = this.IMAGE_HEIGHT = this.image.height;
        this.fitZoom();
    }
    handleContextmenu(e: MouseEvent) {
        if (this.lock) return;
        e.preventDefault();
    }
    handleMousewheel(e: WheelEvent) {
        if (this.lock || !this.scrollZoom) return;
        e.preventDefault();
        this.mouse = [e.offsetX, e.offsetY];
        this.setScale(e.deltaY < 0, true);
    }
    handleMouseDown(e: MouseEvent) {
        if (this.lock) return;
        const offsetX = Math.round(e.offsetX / this.scale);
        const offsetY = Math.round(e.offsetY / this.scale);
        this.mouse = [e.offsetX, e.offsetY];
        if (e.buttons === 2) { // 鼠标右键
            this.remmberOrigin = [e.offsetX - this.originX, e.offsetY - this.originY];
        } else if (e.buttons === 1) { // 鼠标左键
            const ctrls = this.activeShape.ctrlsData || [];
            this.ctrlIndex = ctrls.findIndex((coor: Point) => this.isPointInCircle(this.mouse, coor, this.ctrlRadius));
            if (this.ctrlIndex > -1) { // 点击到控制点
                const [x0, y0] = ctrls[this.ctrlIndex];
                this.remmber = [[offsetX - x0, offsetY - y0]];
            } else if (this.isInBackground(e)) {
                if (this.activeShape.creating) {// 创建中
                    if ([2, 4].includes(this.activeShape.type)) {
                        const [x, y] = this.activeShape.coor[this.activeShape.coor.length - 1];
                        if (x !== offsetX && y !== offsetY) {
                            const nx = Math.round(offsetX - this.originX / this.scale)
                            const ny = Math.round(offsetY - this.originY / this.scale)
                            this.activeShape.coor.push([nx, ny]);
                        }
                    }
                } else if (this.createType > 0) { // 开始创建
                    let newShape;
                    const nx = Math.round(offsetX - this.originX / this.scale)
                    const ny = Math.round(offsetY - this.originY / this.scale)
                    const curPoint: Point = [nx, ny];
                    switch (this.createType) {
                        case 1:
                            newShape = new Rect({ coor: [curPoint, curPoint] }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        case 2:
                            newShape = new Polygon({ coor: [curPoint] }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        case 3:
                            newShape = new Dot({ coor: curPoint }, this.dataset.length);
                            this.emit('add', newShape)
                            break;
                        case 4:
                            newShape = new Line({ coor: [curPoint] }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        case 5:
                            newShape = new Circle({ coor: curPoint }, this.dataset.length);
                            newShape.creating = true;
                            break;
                        default:
                            break;
                    }
                    this.dataset.forEach((sp) => { sp.active = false; });
                    newShape.active = true;
                    this.dataset.push(newShape);
                } else {
                    // 是否点击到形状
                    const [hitShapeIndex, hitShape] = this.hitOnShape(this.mouse);
                    if (hitShapeIndex > -1) {
                        this.dataset.forEach((item, i) => item.active = i === hitShapeIndex);
                        hitShape.dragging = true;
                        this.dataset.splice(hitShapeIndex, 1);
                        this.dataset.push(hitShape);
                        this.remmber = [];
                        if ([3, 5].includes(hitShape.type)) {
                            const [x, y] = hitShape.coor;
                            this.remmber = [[offsetX - x, offsetY - y]];
                        } else {
                            hitShape.coor.forEach((pt: any) => {
                                this.remmber.push([offsetX - pt[0], offsetY - pt[1]]);
                            });
                        }
                        this.emit('select', hitShape)
                    } else {
                        this.activeShape.active = false;
                    }
                }
                this.update();
            }
        }
    }
    handelMouseMove(e: MouseEvent) {
        if (this.lock) return;
        const offsetX = Math.round(e.offsetX / this.scale);
        const offsetY = Math.round(e.offsetY / this.scale);
        this.mouse = [e.offsetX, e.offsetY];
        if (e.buttons === 2 && e.which === 3) {
            // 拖动背景
            this.originX = Math.round(e.offsetX - this.remmberOrigin[0]);
            this.originY = Math.round(e.offsetY - this.remmberOrigin[1]);
            this.update();
        } else if (e.buttons === 1 && this.activeShape.type) {
            if (this.ctrlIndex > -1 && (this.isInBackground(e) || this.activeShape.type === 5)) {
                const [[x, y]] = this.remmber;
                // resize矩形
                if (this.activeShape.type === 1) {
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
                    const [[a0, b0], [a1, b1]] = coor;
                    if ((a1 - a0) >= this.MIN_WIDTH && (b1 - b0) >= this.MIN_HEIGHT) {
                        this.activeShape.coor = coor;
                    } else {
                        this.emit('warn', `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than${this.MIN_HEIGHT}。`);
                    }
                } else if ([2, 4].includes(this.activeShape.type)) {
                    const nx = Math.round(offsetX - this.originX / this.scale)
                    const ny = Math.round(offsetY - this.originY / this.scale)
                    const newPoint = [nx, ny]
                    this.activeShape.coor.splice(this.ctrlIndex, 1, newPoint);
                } else if (this.activeShape.type === 5) {
                    const nx = Math.round(offsetX - this.originX / this.scale)
                    const newRadius = nx - this.activeShape.coor[0]
                    if (newRadius >= this.MIN_RADIUS) this.activeShape.radius = newRadius;
                }
            } else if (this.activeShape.dragging) { // 拖拽
                let coor = [];
                let noLimit = true
                const w = this.IMAGE_ORIGIN_WIDTH || this.WIDTH;
                const h = this.IMAGE_ORIGIN_HEIGHT || this.HEIGHT;
                if ([3, 5].includes(this.activeShape.type)) {
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
                        if (x < 0 || x > w || y < 0 || y > h) noLimit = false
                        coor.push([x, y]);
                    }
                }
                if (noLimit) this.activeShape.coor = coor;
            } else if (this.activeShape.creating && this.isInBackground(e)) {
                const x = Math.round(offsetX - this.originX / this.scale);
                const y = Math.round(offsetY - this.originY / this.scale);
                // 创建矩形
                if (this.activeShape.type === 1) {
                    this.activeShape.coor.splice(1, 1, [x, y]);
                } else if (this.activeShape.type === 5) {
                    const [x0, y0] = this.activeShape.coor
                    const r = Math.sqrt((x0 - x) ** 2 + (y0 - y) ** 2);
                    this.activeShape.radius = r
                }
            }
            this.update();
        } else if ([2, 4].includes(this.activeShape.type) && this.activeShape.creating) {
            // 多边形添加点
            this.update();
        }

    }
    handelMouseUp(e: MouseEvent) {
        if (this.lock) return;
        this.remmber = [];
        if (this.activeShape.type) {
            this.activeShape.dragging = false;
            if (this.activeShape.creating) {
                if (this.activeShape.type === 1) {
                    const [[x0, y0], [x1, y1]] = this.activeShape.coor;
                    if (Math.abs(x0 - x1) < this.MIN_WIDTH || Math.abs(y0 - y1) < this.MIN_HEIGHT) {
                        this.dataset.pop();
                        this.emit('warn', `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than ${this.MIN_HEIGHT}`);
                    } else {
                        this.activeShape.coor = [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]];
                        this.activeShape.creating = false;
                        this.emit('add', this.activeShape);
                    }
                } else if (this.activeShape.type === 5) {
                    if (this.activeShape.radius < this.MIN_RADIUS) {
                        this.dataset.pop();
                        this.emit('warn', `Radius cannot be less than ${this.MIN_WIDTH}`);
                    } else {
                        this.activeShape.creating = false;
                        this.emit('add', this.activeShape);
                    }
                }
                this.update();
            }
        }
    }
    handelDblclick(e: MouseEvent) {
        if (this.lock) return;
        if ([2, 4].includes(this.activeShape.type)) {
            if ((this.activeShape.type === 2 && this.activeShape.coor.length > 2)
                || (this.activeShape.type === 4 && this.activeShape.coor.length > 1)
            ) {
                this.emit('add', this.activeShape);
                this.activeShape.creating = false;
                this.update();
            }
        }
    }
    handelKeyup(e: KeyboardEvent) {
        if (this.lock || document.activeElement !== document.body) return;
        if (this.activeShape.type) {
            if ([2, 4].includes(this.activeShape.type) && e.key === 'Escape') {
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
    /**
     * 初始化
     */
    initStage() {
        const dpr = window.devicePixelRatio || 1
        this.ctx = this.canvas.getContext('2d', { alpha: this.alpha });
        this.WIDTH = this.canvas.clientWidth;
        this.HEIGHT = this.canvas.clientHeight;
        this.canvas.width = this.WIDTH * dpr
        this.canvas.height = this.HEIGHT * dpr
        this.canvas.style.width = this.WIDTH + 'px'
        this.canvas.style.height = this.HEIGHT + 'px'
        this.offScreen = document.createElement('canvas');
        this.offScreen.width = this.WIDTH;
        this.offScreen.height = this.HEIGHT;
        this.offScreenCtx = this.offScreen.getContext('2d', { willReadFrequently: true });
        this.ctx.scale(dpr, dpr)
        this.image.addEventListener('load', this.handleLoad);
        this.canvas.addEventListener('contextmenu', this.handleContextmenu);
        this.canvas.addEventListener('mousewheel', this.handleMousewheel);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handelMouseMove);
        this.canvas.addEventListener('mouseup', this.handelMouseUp);
        this.canvas.addEventListener('dblclick', this.handelDblclick);
        document.body.addEventListener('keyup', this.handelKeyup);
    }
    /**
     * 添加/切换图片
     * @param url 图片链接
     */
    setImage(url: string) {
        this.image.src = url
    }
    /**
     * 设置数据
     * @param data Array
     */
    setData(data: AllShape[]) {
        setTimeout(() => {
            let initdata: AllShape[] = []
            data.forEach((item, index) => {
                if (Object.prototype.toString.call(item).indexOf('Object') > -1) {
                    let shape: AllShape
                    switch (item.type) {
                        case 1:
                            shape = new Rect(item, index);
                            break;
                        case 2:
                            shape = new Polygon(item, index);
                            break;
                        case 3:
                            shape = new Dot(item, index);
                            break;
                        case 4:
                            shape = new Line(item, index);
                            break;
                        case 5:
                            shape = new Circle(item, index);
                            break;
                        default:
                            console.warn('Invalid shape', item)
                            break;
                    }
                    [1, 2, 3, 4, 5].includes(item.type) && initdata.push(shape);
                } else {
                    console.warn('Shape must be an enumerable Object.', item)
                }
            });
            this.dataset = initdata
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
        let hitShape: AllShape;
        for (let i = this.dataset.length - 1; i > -1; i--) {
            const shape = this.dataset[i];
            if (
                (shape.type === 3 && this.isPointInCircle(mousePoint, shape.coor as Point, this.ctrlRadius))
                || (shape.type === 5 && this.isPointInCircle(mousePoint, shape.coor as Point, (shape as Circle).radius * this.scale))
                || (shape.type === 1 && this.isPointInRect(mousePoint, (shape as Rect).coor))
                || (shape.type === 2 && this.isPointInPolygon(mousePoint, (shape as Polygon).coor))
                || (shape.type === 4 && this.isPointInLine(mousePoint, (shape as Line).coor))
            ) {
                if (this.focusMode && !shape.active) continue;
                hitShapeIndex = i;
                hitShape = shape;
                break
            }
        }
        return [hitShapeIndex, hitShape];
    }

    /**
     * 判断鼠标是否在背景图内部
     * @param e MouseEvent
     * @returns 布尔值
     */
    isInBackground(e: MouseEvent): boolean {
        return e.offsetX >= this.originX
            && e.offsetY >= this.originY
            && e.offsetX <= this.originX + this.IMAGE_ORIGIN_WIDTH * this.scale
            && e.offsetY <= this.originY + this.IMAGE_ORIGIN_HEIGHT * this.scale;
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
        return x0 + this.originX <= x
            && x <= x1 + this.originX
            && y0 + this.originY <= y
            && y <= y1 + this.originY;
    }
    /**
     * 判断是否在多边形内
     * @param point 坐标
     * @param coor 区域坐标
     * @returns 布尔值
     */
    isPointInPolygon(point: Point, coor: Point[]): boolean {
        this.offScreenCtx.save();
        this.offScreenCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.offScreenCtx.translate(this.originX, this.originY);
        this.offScreenCtx.beginPath();
        coor.forEach((pt, i) => {
            const [x, y] = pt.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.offScreenCtx.moveTo(x, y);
            } else {
                this.offScreenCtx.lineTo(x, y);
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
        this.offScreenCtx.save();
        this.offScreenCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this.offScreenCtx.translate(this.originX, this.originY);
        this.offScreenCtx.lineWidth = 5;
        this.offScreenCtx.beginPath();
        coor.forEach((pt, i) => {
            const [x, y] = pt.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.offScreenCtx.moveTo(x, y);
            } else {
                this.offScreenCtx.lineTo(x, y);
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
    drawRect(shape: Rect) {
        if (shape.coor.length !== 2) return;
        const { labelFillStyle, textFillStyle, labelFont, strokeStyle, fillStyle, active, creating, coor, label } = shape
        const [[x0, y0], [x1, y1]] = coor.map((a: Point) => a.map((b) => Math.round(b * this.scale)));
        this.ctx.save();
        this.ctx.fillStyle = fillStyle || this.fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        const w = x1 - x0;
        const h = y1 - y0;
        this.ctx.strokeRect(x0, y0, w, h);
        if (!creating) this.ctx.fillRect(x0, y0, w, h);
        this.ctx.restore();
        this.drawLabel(coor[0], label, labelFillStyle, labelFont, textFillStyle);
    }
    /**
     * 绘制多边形
     * @param shape 标注实例
     */
    drawPolygon(shape: Polygon) {
        const { labelFillStyle, textFillStyle, labelFont, strokeStyle, fillStyle, active, creating, coor, label } = shape
        this.ctx.save();
        this.ctx.fillStyle = fillStyle || this.fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        coor.forEach((el: Point, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
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
        this.drawLabel(coor[0], label, labelFillStyle, labelFont, textFillStyle);
    }
    /**
     * 绘制点
     * @param shape 标注实例
     */
    drawDot(shape: Dot) {
        const { labelFillStyle, textFillStyle, labelFont, strokeStyle, fillStyle, active, coor, label } = shape
        const [x, y] = coor.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.fillStyle = fillStyle || this.ctrlFillStyle;
        this.ctx.strokeStyle = active ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor as Point, label, labelFillStyle, labelFont, textFillStyle);
    }
    /**
     * 绘制圆
     * @param shape 标注实例
     */
    drawCirle(shape: Circle) {
        const { labelFillStyle, textFillStyle, labelFont, strokeStyle, fillStyle, active, coor, label, creating, radius, ctrlsData } = shape
        const [x, y] = coor.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.fillStyle = fillStyle || this.fillStyle;
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
        this.ctx.fill();
        this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(ctrlsData[0] as Point, label, labelFillStyle, labelFont, textFillStyle);
    }
    /**
     * 绘制折线
     * @param shape 标注实例
     */
    drawLine(shape: Line) {
        const { labelFillStyle, textFillStyle, labelFont, strokeStyle, active, creating, coor, label } = shape
        this.ctx.save();
        this.ctx.strokeStyle = (active || creating) ? this.activeStrokeStyle : (strokeStyle || this.strokeStyle);
        this.ctx.beginPath();
        coor.forEach((el: Point, i) => {
            const [x, y] = el.map((a) => Math.round(a * this.scale));
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        if (creating) {
            const [x, y] = this.mouse || [];
            this.ctx.lineTo(x - this.originX, y - this.originY);
        }
        this.ctx.stroke();
        this.ctx.restore();
        this.drawLabel(coor[0], label, labelFillStyle, labelFont, textFillStyle);
    }
    /**
     * 绘制控制点
     * @param point 坐标
     */
    drawCtrl(point: Point) {
        const [x, y] = point.map((a) => a * this.scale);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.ctrlFillStyle;
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
            if (shape.type === 5) {
                if (i === 1) this.drawCtrl(point);
            } else {
                this.drawCtrl(point);
            }
        });
    }
    /**
     * 绘制label
     * @param point 位置
     * @param label 文本
     */
    drawLabel(point: Point, label = '', labelFillStyle = '', labelFont = '', textFillStyle = '') {
        if (label.length) {
            this.ctx.font = labelFont || this.labelFont;
            const textH = parseInt(this.ctx.font) + 6
            const newText = label.length < this.labelMaxLen + 1 ? label : `${label.slice(0, this.labelMaxLen)}...`;
            const text = this.ctx.measureText(newText);
            const [x, y] = point.map((a) => a * this.scale);
            const toleft = (this.IMAGE_ORIGIN_WIDTH - point[0]) < (text.width + 4) / this.scale;
            const toTop = (this.IMAGE_ORIGIN_HEIGHT - point[1]) < textH / this.scale;
            this.ctx.save();
            this.ctx.fillStyle = labelFillStyle || this.labelFillStyle;
            this.ctx.fillRect(toleft ? (x - text.width - 3) : (x + 1), toTop ? (y - textH + 3) : y + 1, text.width + 4, textH);
            this.ctx.fillStyle = textFillStyle || this.textFillStyle;
            this.ctx.fillText(newText, toleft ? (x - text.width - 2) : (x + 2), toTop ? (y - 3) : y + textH - 4, 180);
            this.ctx.restore();
        }
    }

    /**
     * 更新画布
     */
    update() {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
            this.ctx.translate(this.originX, this.originY);
            if (this.IMAGE_WIDTH && this.IMAGE_HEIGHT) {
                this.ctx.drawImage(this.image, 0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
            }
            let renderList = this.focusMode ? (this.activeShape.type ? [this.activeShape] : []) : this.dataset
            renderList.forEach((shape) => {
                switch (shape.type) {
                    case 1:
                        this.drawRect(shape as Rect);
                        break;
                    case 2:
                        this.drawPolygon(shape as Polygon);
                        break;
                    case 3:
                        this.drawDot(shape as Dot);
                        break;
                    case 4:
                        this.drawLine(shape as Line);
                        break;
                    case 5:
                        this.drawCirle(shape as Circle);
                        break;
                    default:
                        break;
                }
            });
            if ([1, 2, 4, 5].includes(this.activeShape.type)) {
                this.drawCtrlList(this.activeShape);
            }
            this.ctx.restore();
            this.emit('updated', this.dataset)
        });
    }

    /**
     * 删除指定矩形
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
     * @param byMouse 启用鼠标位置，可选
     * @param pure 不绘制
     */
    setScale(type: boolean, byMouse = false, pure = false) {
        if (this.lock) return;
        if ((!type && this.imageMin <= 50) || (type && this.IMAGE_WIDTH >= this.imageOriginMax * 10)) return;
        if (type) { this.scaleStep++; } else { this.scaleStep--; }
        let realToLeft = 0
        let realToRight = 0
        const [x, y] = this.mouse || []
        if (byMouse) {
            realToLeft = (x - this.originX) / this.scale
            realToRight = (y - this.originY) / this.scale
        }
        const abs = Math.abs(this.scaleStep);
        const width = this.IMAGE_WIDTH;
        this.IMAGE_WIDTH = Math.round(this.IMAGE_ORIGIN_WIDTH * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
        this.IMAGE_HEIGHT = Math.round(this.IMAGE_ORIGIN_HEIGHT * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
        if (byMouse) {
            this.originX = x - realToLeft * this.scale
            this.originY = y - realToRight * this.scale
        } else {
            const scale = this.IMAGE_WIDTH / width
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
        this.focusMode = type
        this.update()
    }

    destroy() {
        this.image.removeEventListener('load', this.handleLoad)
        this.canvas.removeEventListener('contextmenu', this.handleContextmenu)
        this.canvas.removeEventListener('mousewheel', this.handleMousewheel)
        this.canvas.removeEventListener('mousedown', this.handleMouseDown)
        this.canvas.removeEventListener('mousemove', this.handelMouseMove)
        this.canvas.removeEventListener('mouseup', this.handelMouseUp)
        this.canvas.removeEventListener('dblclick', this.handelDblclick)
        document.body.removeEventListener('keyup', this.handelKeyup)
        this.canvas.width = this.WIDTH
        this.canvas.height = this.HEIGHT
        this.canvas.style.width = null
        this.canvas.style.height = null
        this.canvas.style.userSelect = null
    }
}

