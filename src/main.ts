import Rect from './Rect';
import Polygon from './Polygon';
import Dot from './Dot';
import { Point } from './Types';

class CanvasSelect {
  lock: boolean = false // 只读模式

  MIN_WIDTH: number = 10

  MIN_HEIGHT: number = 10

  strokeStyle = 'rgb(0, 0, 255)'

  fillStyle = 'rgba(0, 0, 255,0.1)'

  activeStrokeStyle = '#f00'

  activeFillStyle = 'rgba(255, 0, 0,0.1)'

  ctrlStrokeStyle = '#000'

  ctrlFillStyle = '#fff'

  ctrlRadius = 3

  labelFillStyle = '#fff'

  labelFont = '12px serif #000'

  labelMaxLen = 5

  EventList: object = {}

  WIDTH: number

  HEIGHT: number

  canvas: HTMLCanvasElement

  ctx: CanvasRenderingContext2D

  dataset: Array<Rect | Polygon | Dot> = []

  offlineCanvas: HTMLCanvasElement

  offlineCtx: CanvasRenderingContext2D

  remmber: number[][] // 记录锚点距离

  movePoint: Point // 记录鼠标位置

  remmberOrigin: number[] = [0, 0] // 记录背景图鼠标位移

  createType: number = 0 // 0 不创建，1 创建矩形，2 创建多边形，3 创建点

  ctrlIndex: number = -1

  cursor: string = 'auto'

  image: HTMLImageElement = new Image()

  IMAGE_ORIGIN_WIDTH: number;

  IMAGE_WIDTH: number;

  IMAGE_ORIGIN_HEIGHT: number;

  IMAGE_HEIGHT: number;

  originX: number = 0; // 原点x

  originY: number = 0; // 原点y

  scaleStep: number = 0; // 缩放步长

  constructor(el: HTMLCanvasElement | string, imgSrc?: string) {
    const container = typeof el === 'string' ? document.querySelector(el) : el;
    if (Object.prototype.toString.call(container).includes('HTMLCanvasElement')) {
      this.canvas = container as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d');
      this.WIDTH = this.canvas.clientWidth;
      this.HEIGHT = this.canvas.clientHeight;
      this.offlineCanvas = document.createElement('canvas');
      this.offlineCanvas.width = this.WIDTH;
      this.offlineCanvas.height = this.HEIGHT;
      this.offlineCtx = this.offlineCanvas.getContext('2d');
      this.init();
      if (imgSrc) this.image.src = imgSrc;
    } else {
      // eslint-disable-next-line no-console
      console.warn('HTMLCanvasElement is required!');
    }
  }

  get activeShape() {
    return this.dataset.find((x: Rect | Polygon | Dot) => x.active);
  }

  get scale() {
    if (this.IMAGE_ORIGIN_WIDTH && this.IMAGE_WIDTH) {
      return this.IMAGE_WIDTH / this.IMAGE_ORIGIN_WIDTH;
    }
    return 1;
  }
  /**
   * 初始化
   */
  init() {
    this.canvas.style.userSelect = 'none';
    this.image.addEventListener('load', () => {
      this.IMAGE_ORIGIN_WIDTH = this.IMAGE_WIDTH = this.image.width;
      this.IMAGE_ORIGIN_HEIGHT = this.IMAGE_HEIGHT = this.image.height;
      this.fitZoom();
      this.emit('load');
    });
    this.canvas.addEventListener('contextmenu', (e) => {
      if (this.lock) return;
      e.preventDefault();
    });
    this.canvas.addEventListener('mousewheel', (e: WheelEvent) => {
      if (this.lock) return;
      e.preventDefault();
      this.setScale(e.deltaY < 0);
    });
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      const offsetX = e.offsetX / this.scale;
      const offsetY = e.offsetY / this.scale;
      const mousePoint: Point = [e.offsetX, e.offsetY];
      if (this.lock) return;
      if (e.buttons === 2) { // 点击鼠标右键
        this.remmberOrigin = [e.offsetX - this.originX, e.offsetY - this.originY];
      } else if (e.buttons === 1) {
        // 点击到控制点
        const activeShape = this.activeShape as Rect | Polygon;
        const ctrls = activeShape?.ctrlsData || [];
        this.ctrlIndex = ctrls.findIndex((coor: Point) => this.isPointInCircle(mousePoint, coor, this.ctrlRadius));
        if (this.ctrlIndex > -1) {
          const [x0, y0] = ctrls[this.ctrlIndex];
          this.remmber = [[offsetX - x0, offsetY - y0]];
          return;
        }
        // 是否点击到形状
        const [targetShapeIndex, targetShape] = this.hoverOnShape(mousePoint);
        const oncreating = this.activeShape?.type === 2 && (this.activeShape as Polygon).creating;
        if (!oncreating && targetShapeIndex > -1) {
          this.emit('select', targetShape)
          this.dataset.forEach((item, i) => {
            item.active = i === targetShapeIndex;
          });
          targetShape.dragging = true;
          this.dataset.splice(targetShapeIndex, 1);
          this.dataset.push(targetShape);
          this.remmber = [];
          if (targetShape.type === 3) {
            const [x, y] = (targetShape as Dot).coor;
            this.remmber = [[offsetX - x, offsetY - y]];
          } else {
            targetShape.coor.forEach((pt: any) => {
              this.remmber.push([offsetX - pt[0], offsetY - pt[1]]);
            });
          }
          this.update();
        } else if (oncreating) {
          // 多边形新增点
          if (this.isInContent(e)) {
            const pShape = this.activeShape as Polygon;
            const [x, y] = pShape.coor[pShape.coor.length - 1];
            if (x !== offsetX && y !== offsetY) {
              pShape.coor.push([offsetX - this.originX / this.scale, offsetY - this.originY / this.scale]);
              this.update();
            }
          }
        } else if (this.createType && this.isInContent(e)) {
          // 创建矩形/多边形
          let newShape;
          const curPoint: Point = [offsetX - this.originX / this.scale, offsetY - this.originY / this.scale];
          if (this.createType === 1) {
            newShape = new Rect([curPoint, curPoint], this.dataset.length);
            newShape.creating = true;
          } else if (this.createType === 2) {
            newShape = new Polygon([curPoint], this.dataset.length);
            newShape.creating = true;
          } else if (this.createType === 3) {
            newShape = new Dot(curPoint, this.dataset.length);
            this.emit('add', newShape)
          }
          this.dataset.forEach((sp) => { sp.active = false; });
          newShape.active = true;
          newShape.uuid = CanvasSelect.createUuid();
          this.dataset.push(newShape);
          this.update();
        } else if (this.activeShape) {
          this.activeShape.active = false;
          this.update();
        }
      }
    });
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const offsetX = e.offsetX / this.scale;
      const offsetY = e.offsetY / this.scale;
      if (this.lock) return;
      // 记录鼠标位置
      this.movePoint = [offsetX, offsetY];
      if (e.buttons === 2 && e.which === 3) {
        // 拖动背景
        this.originX = e.offsetX - this.remmberOrigin[0];
        this.originY = e.offsetY - this.remmberOrigin[1];
        this.update();
      } else if (e.buttons === 1) {
        if (this.activeShape) {
          if (this.ctrlIndex > -1) {
            const [[x, y]] = this.remmber;
            this.emit('resize', this.activeShape);
            // resize矩形
            if (this.activeShape.type === 1) {
              const [[x0, y0], [x1, y1]] = (this.activeShape as Rect).coor;
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
                this.emit('error', `宽不能小于${this.MIN_WIDTH},高不能小于${this.MIN_HEIGHT}。`);
              }
            } else if (this.activeShape.type === 2) {
              this.activeShape.coor.splice(this.ctrlIndex, 1, [offsetX - this.originX / this.scale, offsetY - this.originY / this.scale]);
            }
            this.update();
          } else if (this.activeShape.dragging) {
            let coor = [];
            const w = this.IMAGE_ORIGIN_WIDTH || this.WIDTH;
            const h = this.IMAGE_ORIGIN_HEIGHT || this.HEIGHT;
            if (this.activeShape.type === 3) {
              const [t1, t2] = this.remmber[0];
              const x = offsetX - t1;
              const y = offsetY - t2;
              if (x < 0 || x > w || y < 0 || y > h) return;
              coor = [x, y];
            } else {
              for (let i = 0; i < this.activeShape.coor.length; i++) {
                const tar = this.remmber[i];
                const x = offsetX - tar[0];
                const y = offsetY - tar[1];
                if (x < 0 || x > w || y < 0 || y > h) return;
                coor.push([x, y]);
              }
            }
            (this.activeShape as any).coor = coor;
            this.update();
          } else if ((this.activeShape as Rect).creating && this.activeShape.type === 1 && this.isInContent(e)) {
            const x = offsetX - this.originX / this.scale;
            const y = offsetY - this.originY / this.scale;
            this.activeShape.coor.splice(1, 1, [x, y]);
          }
        }
        this.update();
      } else if (this.activeShape?.type === 2 && (this.activeShape as Polygon)?.creating) {
        this.update();
      }
    });
    this.canvas.addEventListener('mouseup', (e) => {
      if (this.lock) return;
      this.remmber = [];
      if (this.activeShape) {
        this.activeShape.dragging = false;
        if ((this.activeShape as Rect).creating && this.activeShape.type === 1) {
          const [[x0, y0], [x1, y1]] = (this.activeShape as Rect).coor;
          if (Math.abs(x0 - x1) < this.MIN_WIDTH || Math.abs(y0 - y1) < this.MIN_HEIGHT) {
            this.dataset.pop();
            this.emit('error', `宽不能小于${this.MIN_WIDTH},高不能小于${this.MIN_HEIGHT}`);
          } else {
            this.activeShape.coor = [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]];
            (this.activeShape as Rect).creating = false;
            this.emit('add', this.activeShape);
          }
          this.update();
        }
      }
    });
    this.canvas.addEventListener('dblclick', () => {
      if (this.lock) return;
      if (this.activeShape?.type === 2) {
        if (this.activeShape.coor.length > 2) {
          this.emit('add', this.activeShape);
          (this.activeShape as Polygon).creating = false;
          this.update();
        }
      }
    });
    document.body.addEventListener('keyup', (e: KeyboardEvent) => {
      if (this.lock) return;
      const activeShape = this.activeShape as Polygon;
      if (activeShape?.type === 2) {
        if (e.key === 'Escape') {
          this.dataset.pop();
        } else if (e.key === 'Backspace') {
          if (this.activeShape.coor.length > 1) {
            this.activeShape.coor.pop();
          } else {
            this.dataset.pop();
          }
        }
        this.update();
      }
      if (this.activeShape && e.key === 'Backspace') {
        this.deleteByIndex(this.activeShape.index);
      }
    });
  }

  /**
   * 生成uuid
   * @returns
   */
  static createUuid(): string {
    const s: any[] = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    const uuid = s.join('');
    return uuid;
  }

  /**
   * 设置数据
   * @param data Array
   */
  setData(data: any[]) {
    data.forEach((item, index) => {
      if (Object.prototype.toString.call(item).indexOf('Object') > -1) {
        const {
          label, type, coor, uuid,
        } = item;
        let shape: (Rect | Polygon | Dot);
        switch (type) {
          case 1:
            shape = new Rect(coor as Point[], index);
            break;
          case 2:
            shape = new Polygon(coor as Point[], index);
            break;
          case 3:
            shape = new Dot(coor as Point, index);
            break;
          default:
            break;
        }
        shape.label = (label || '').toString();
        shape.uuid = uuid || CanvasSelect.createUuid();
        this.dataset.push(shape);
      } else {
        this.emit('error', `${item} in data must be an enumerable Object.`);
      }
    });
    this.update();
  }
  /**
   * 判断是非在标注实例上
   * @param mousePoint 点击位置
   * @returns 
   */
  hoverOnShape(mousePoint: Point): [number, Rect | Polygon | Dot] {
    let targetShapeIndex = -1;
    const targetShape = this.dataset.reduceRight((target, shape, i) => {
      if (!target) {
        if (
          (shape.type === 3 && this.isPointInCircle(mousePoint, shape.coor as Point, 3))
          || (shape.type === 1 && this.isPointInRect(mousePoint, (shape as Rect).coor))
          || (shape.type === 2 && this.isPointInPolygon(mousePoint, (shape as Polygon).coor))
        ) {
          targetShapeIndex = i;
          target = shape;
        }
      }
      return target;
    }, null);
    return [targetShapeIndex, targetShape];
  }

  /**
   * 判断鼠标是否在背景图内部
   * @param e MouseEvent
   * @returns 布尔值
   */
  isInContent(e: MouseEvent): boolean {
    const offsetX = e.offsetX / this.scale;
    const offsetY = e.offsetY / this.scale;
    return offsetX >= this.originX / this.scale && offsetY >= this.originY / this.scale
      && offsetX <= this.originX / this.scale + this.IMAGE_ORIGIN_WIDTH && offsetY <= this.originY / this.scale + this.IMAGE_ORIGIN_HEIGHT;
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
    return x0 + this.originX <= x && x <= x1 + this.originX && y0 + this.originY <= y && y <= y1 + this.originY;
  }
  /**
   * 判断是否在多边形内
   * @param point 坐标
   * @param coor 区域坐标
   * @returns 布尔值
   */
  isPointInPolygon(point: Point, coor: Point[]): boolean {
    this.offlineCtx.save();
    this.offlineCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    this.offlineCtx.translate(this.originX, this.originY);
    this.offlineCtx.beginPath();
    coor.forEach((pt, i) => {
      const [x, y] = pt.map((a) => Math.round(a * this.scale));
      if (i === 0) {
        this.offlineCtx.moveTo(x, y);
      } else {
        this.offlineCtx.lineTo(x, y);
      }
    });
    this.offlineCtx.closePath();
    this.offlineCtx.fill();
    const areaData = this.offlineCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
    const index = (point[1] - 1) * this.WIDTH * 4 + point[0] * 4;
    this.offlineCtx.restore();
    return areaData.data[index + 3] !== 0;
  }
  /**
   * 判断是否在圆内
   * @param point 坐标
   * @param center 圆心
   * @param r 半径
   * @returns 布尔值
   */
  isPointInCircle(point: Point, center: Point, r: number): boolean {
    const [x, y] = point;
    const [x0, y0] = center.map((a) => a * this.scale);
    const distance = Math.sqrt((x0 + this.originX - x) ** 2 + (y0 + this.originY - y) ** 2);
    return distance <= r;
  }
  /**
   * 绘制矩形
   * @param shape 标注实例
   * @returns 
   */
  drawRect(shape: Rect) {
    if (shape.coor.length !== 2) return;
    const [[x0, y0], [x1, y1]] = shape.coor.map((a) => a.map((b) => Math.round(b * this.scale)));
    this.ctx.save();
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.strokeStyle = (shape.active || shape.creating) ? this.activeStrokeStyle : this.strokeStyle;
    const w = x1 - x0;
    const h = y1 - y0;
    this.ctx.strokeRect(x0, y0, w, h);
    if (!shape.creating) this.ctx.fillRect(x0, y0, w, h);
    this.ctx.restore();
    this.drawLabel(shape.coor[0], shape.label);
  }
  /**
   * 绘制多边形
   * @param shape 标注实例
   */
  drawPolygon(shape: Polygon) {
    this.ctx.save();
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.strokeStyle = (shape.active || shape.creating) ? this.activeStrokeStyle : this.strokeStyle;
    this.ctx.beginPath();
    shape.coor.forEach((el, i) => {
      const [x, y] = el.map((a) => Math.round(a * this.scale));
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    if (shape.creating) {
      const [x, y] = this.movePoint.map((a) => Math.round(a * this.scale));
      this.ctx.lineTo(x - this.originX, y - this.originY);
    } else if (shape.coor.length > 2) {
      this.ctx.closePath();
    }
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    this.drawLabel(shape.coor[0], shape.label);
  }
  /**
   * 绘制点
   * @param shape 标注实例
   */
  drawDot(shape: Dot) {
    const [x, y] = shape.coor.map((a) => a * this.scale);
    this.ctx.save();
    this.ctx.fillStyle = this.ctrlFillStyle;
    this.ctx.strokeStyle = shape.active ? this.activeStrokeStyle : this.strokeStyle;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
    this.ctx.fill();
    this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
    this.ctx.stroke();
    this.ctx.restore();
    this.drawLabel(shape.coor, shape.label);
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
  drawCtrlList(shape: Rect | Polygon) {
    shape.ctrlsData.forEach((point) => {
      this.drawCtrl(point);
    });
  }
  /**
   * 绘制label
   * @param point 位置
   * @param label 文本
   */
  drawLabel(point: Point, label: string = '') {
    if (label.length) {
      const newStr = label.length < this.labelMaxLen + 1 ? label : (`${label.substr(0, this.labelMaxLen)}...`);
      const text = this.ctx.measureText(newStr);
      const [x, y] = point.map((a) => a * this.scale);
      const toleft = (this.IMAGE_ORIGIN_WIDTH - point[0]) < (text.width + 4) / this.scale;
      const toTop = (this.IMAGE_ORIGIN_HEIGHT - point[1]) < 16 / this.scale;
      this.ctx.save();
      this.ctx.fillStyle = this.labelFillStyle;
      this.ctx.fillRect(toleft ? (x - text.width - 3) : (x + 1), toTop ? (y - 15) : y + 1, text.width + 4, 16);
      this.ctx.font = this.labelFont;
      this.ctx.strokeText(newStr, toleft ? (x - text.width - 2) : (x + 2), toTop ? (y - 4) : y + 12, 80);
      this.ctx.restore();
    }
  }

  /**
   * 绘制背景图片
   */
  paintImage() {
    this.ctx.drawImage(this.image, 0, 0, this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  /**
   * 更新画布
   */
  update() {
    this.ctx.save();
    this.clear();
    this.ctx.translate(this.originX, this.originY);
    this.paintImage();
    this.dataset.forEach((shape) => {
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
        default:
          break;
      }
    });
    if (this.activeShape && [1, 2].includes(this.activeShape.type)) {
      this.drawCtrlList(this.activeShape as Rect | Polygon);
    }
    this.ctx.restore();
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
   * @param init 是否为init
   */
  calcStep(init?: boolean) {
    if (init) {
      this.scaleStep = 100;
      this.setScale(false);
    }
    if (this.IMAGE_WIDTH > this.WIDTH || this.IMAGE_HEIGHT > this.HEIGHT) {
      this.setScale(false);
      this.calcStep();
    }
  }

  /**
   * 缩放
   * @param type true放大，false，缩小
   */
  setScale(type: boolean) {
    if (this.lock) return;
    if ((!type && this.IMAGE_WIDTH <= 20) || (type && this.IMAGE_WIDTH >= this.WIDTH * 100)) return;
    if (type) { this.scaleStep++; } else { this.scaleStep--; }
    const abs = Math.abs(this.scaleStep);
    const width = this.IMAGE_WIDTH;
    this.IMAGE_WIDTH = Math.round(this.IMAGE_ORIGIN_WIDTH * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
    this.IMAGE_HEIGHT = Math.round(this.IMAGE_ORIGIN_HEIGHT * (this.scaleStep >= 0 ? 1.05 : 0.95) ** abs);
    this.stayPosition(this.IMAGE_WIDTH / width);
    this.update();
  }

  /**
   * 适配背景图
   */
  fitZoom() {
    this.calcStep(true);
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
   * 保持缩放中心
   * @param scale nummer
   */
  stayPosition(scale: number) {
    this.originX = this.WIDTH / 2 - (this.WIDTH / 2 - this.originX) * scale;
    this.originY = this.HEIGHT / 2 - (this.HEIGHT / 2 - this.originY) * scale;
  }

  /**
   * 注册事件
   * @param eventName 事件名称
   * @param cb 回调方法
   */
  on(eventName: string, cb: Function) {
    const fns = this.EventList[eventName];
    if (Array.isArray(fns)) {
      fns.push(cb);
    } else {
      this.EventList[eventName] = [cb];
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param payload 传递参数
   */
  emit(eventName: string, ...payload: any) {
    const fns = this.EventList[eventName];
    if (Array.isArray(fns)) {
      fns.forEach((fn) => fn(...payload));
    }
  }

  /**
   * 注销事件
   * @param eventName 事件名称
   * @param cb 传递参数
   */
  off(eventName: string, cb: Function) {
    const fns = this.EventList[eventName];
    const index = fns.find((fn: Function) => fn === cb);
    if (Array.isArray(fns) && index) {
      fns.splice(index, 1);
    }
  }
}

export default CanvasSelect;
