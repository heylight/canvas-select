import Rect from './Rect';
import Polygon from './Polygon';
import { Point } from './Types';

class CanvasSelect {
  MIN_WIDTH: number = 10

  MIN_HEIGHT: number = 10

  CTRL_R: number = 5

  activeStrokeStyle = '#f00'

  activeFillStyle = 'rgba(255, 0, 0,0.1)'

  strokeStyle = 'rgba(0, 0, 255)'

  fillStyle = 'rgba(0, 0, 255,0.1)'

  EventList: [] = []

  WIDTH: number

  HEIGHT: number

  canvas: HTMLCanvasElement

  ctx: CanvasRenderingContext2D

  dataset: Array<Rect | Polygon> = []

  offlineCanvas: HTMLCanvasElement

  offlineCtx: CanvasRenderingContext2D

  remmber: number[][]

  movePoint: Point

  createType: number = 1 // 0 不创建，1 创建矩形，2 创建多边形

  ctrlIndex: number = -1

  constructor(el: HTMLCanvasElement | string) {
    const container = typeof el === 'string' ? document.querySelector(el) : el;
    if (Object.prototype.toString.call(container).includes('HTMLCanvasElement')) {
      this.canvas = container as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d');
      this.WIDTH = this.canvas.clientWidth;
      this.HEIGHT = this.canvas.clientWidth;
      this.offlineCanvas = document.createElement('canvas');
      this.offlineCanvas.width = this.WIDTH;
      this.offlineCanvas.height = this.HEIGHT;
      this.offlineCtx = this.offlineCanvas.getContext('2d');
      this.init();
    } else {
      this.emit('error', 'HTMLCanvasElement is required!');
    }
  }

  setData(data: Array<Rect | Polygon>) {
    data.forEach((item, index) => {
      const {
        label, type, coor, uuid,
      } = item;
      let shape: (Rect | Polygon);
      if (type > 0) {
        if (type === 1 && coor.length === 2) {
          shape = new Rect(coor, index);
        }
        if (type === 2 && coor.length > 2) {
          shape = new Polygon(coor, index);
        }
        shape.label = label;
        shape.uuid = uuid || CanvasSelect.createUuid();
        this.dataset.push(shape);
      }
    });
    this.update();
  }

  get activeShape() {
    return this.dataset.find((x) => x.active);
  }

  get createShape() {
    return this.dataset.find((x) => x.creating);
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

  init() {
    this.canvas.style.userSelect = 'none';
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (this.activeShape) {
        const ctrls = this.activeShape.ctrlsData;
        this.ctrlIndex = ctrls.findIndex((coor) => this.isPointInCtrl([e.offsetX, e.offsetY], coor));
        if (this.ctrlIndex > -1) {
          const [x0, y0] = ctrls[this.ctrlIndex];
          this.remmber = [[e.offsetX - x0, e.offsetY - y0]];
          return;
        }
      }
      this.dataset.reverse();
      const targetShape = this.dataset.find((shape) => this.isPointInArea([e.offsetX, e.offsetY], shape));
      this.dataset.reverse();
      this.dataset.forEach((sp) => { sp.active = false; });
      if (this.createShape) {
        // 创建状态
        if (this.createShape.type === 2) {
          if (!(this.createShape as Polygon).finish) {
            const [x, y] = this.createShape.coor[this.createShape.coor.length - 1];
            if (x !== e.offsetX && y !== e.offsetY) {
              this.createShape.coor.push([e.offsetX, e.offsetY]);
            }
          }
        }
      } else if (targetShape) {
        this.emit('select', targetShape);
        // 选中shape
        targetShape.active = true;
        targetShape.dragging = true;
        const targetShapeIndex = this.dataset.findIndex((x) => x === targetShape);
        this.dataset.splice(targetShapeIndex, 1);
        this.dataset.push(targetShape);
        this.remmber = [];
        targetShape.coor.forEach((pt) => {
          this.remmber.push([e.offsetX - pt[0], e.offsetY - pt[1]]);
        });
      } else if (this.createType) {
        // 创建矩形/多边形
        let newShape;
        if (this.createType === 1) {
          newShape = new Rect([[e.offsetX, e.offsetY], [e.offsetX, e.offsetY]], this.dataset.length);
        } else if (this.createType === 2) {
          newShape = new Polygon([[e.offsetX, e.offsetY]], this.dataset.length);
          newShape.finish = false;
        }
        newShape.creating = true;
        newShape.uuid = CanvasSelect.createUuid();
        this.dataset.push(newShape);
      }
      this.update();
    });
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const hoverShape = this.dataset.find((shape) => this.isPointInArea([e.offsetX, e.offsetY], shape));
      this.canvas.style.cursor = hoverShape ? 'move' : 'auto';
      if (e.buttons === 1) {
        if (this.ctrlIndex > -1) {
          this.emit('resize', this.activeShape);
          const [[x, y]] = this.remmber;
          // resize矩形
          if (this.activeShape.type === 1) {
            const [[x0, y0], [x1, y1]] = this.activeShape.coor;
            let coor: Point[] = [];
            switch (this.ctrlIndex) {
              case 0:
                coor = [[e.offsetX - x, e.offsetY - y], [x1, y1]];
                break;
              case 1:
                coor = [[x0, e.offsetY - y], [x1, y1]];
                break;
              case 2:
                coor = [[x0, e.offsetY - y], [e.offsetX - x, y1]];
                break;
              case 3:
                coor = [[x0, y0], [e.offsetX - x, y1]];
                break;
              case 4:
                coor = [[x0, y0], [e.offsetX - x, e.offsetY - y]];
                break;
              case 5:
                coor = [[x0, y0], [x1, e.offsetY - y]];
                break;
              case 6:
                coor = [[e.offsetX - x, y0], [x1, e.offsetY - y]];
                break;
              case 7:
                coor = [[e.offsetX - x, y0], [x1, y1]];
                break;
              default:
                break;
            }
            const [[a0, b0], [a1, b1]] = coor;
            if ((a1 - a0) >= this.MIN_WIDTH && (b1 - b0) >= this.MIN_HEIGHT) {
              this.activeShape.coor = coor;
            } else {
              this.emit('error', `宽不能小于${this.MIN_WIDTH},高不能小于${this.MIN_HEIGHT}`);
            }
          } else if (this.activeShape.type === 2) {
            this.activeShape.coor.splice(this.ctrlIndex, 1, [e.offsetX, e.offsetY]);
          }
        } else if (this.activeShape && this.activeShape.dragging) {
          // 拖动
          const coor: Point[] = [];
          for (let i = 0; i < this.activeShape.coor.length; i++) {
            const x = e.offsetX - this.remmber[i][0];
            const y = e.offsetY - this.remmber[i][1];
            if (x < 0 || x > this.WIDTH || y < 0 || y > this.HEIGHT) return;
            coor.push([x, y]);
          }
          this.activeShape.coor = coor;
        } else if (this.createShape) {
          // 创建状态
          if (this.createShape.type === 1) {
            this.createShape.coor.splice(1, 1, [e.offsetX, e.offsetY]);
          }
        }
      }
      this.movePoint = [e.offsetX, e.offsetY];
      this.update();
    });
    this.canvas.addEventListener('mouseup', () => {
      if (this.createShape) {
        if (this.createShape.type === 1) {
          const [[x0, y0], [x1, y1]] = this.createShape.coor;
          if (Math.abs(x0 - x1) < this.MIN_WIDTH || Math.abs(y0 - y1) < this.MIN_HEIGHT) {
            this.dataset.pop();
            this.emit('error', `宽不能小于${this.MIN_WIDTH},高不能小于${this.MIN_HEIGHT}`);
          } else {
            this.createShape.coor = [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]];
            this.emit('add', this.createShape);
          }
          this.dataset.forEach((x) => { x.creating = false; });
        }
      }
      this.update();
    });
    this.canvas.addEventListener('dblclick', () => {
      if (this.createShape && this.createShape.type === 2) {
        if (this.createShape.coor.length > 2) {
          this.emit('add', this.createShape);
          (this.createShape as Polygon).finish = true;
          this.createShape.creating = false;
          this.update();
        }
      }
    });
    document.body.addEventListener('keyup', (e: KeyboardEvent) => {
      if (this.createShape && this.createShape.type === 2) {
        if (e.key === 'Escape') {
          this.dataset.pop();
        } else if (e.key === 'Backspace') {
          if (this.createShape.coor.length > 1) {
            this.createShape.coor.pop();
          } else {
            this.dataset.pop();
          }
        }
        this.update();
      }
    });
  }

  /**
  * 判断是否在矩形内
  * @param point 点击坐标
  * @param area 目标区域
  */
  isPointInArea(point: Point, shape: (Rect | Polygon)) {
    this.offlineCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    if (shape.type === 1) {
      const [[x0, y0], [x1, y1]] = shape.coor;
      this.offlineCtx.fillRect(x0, y0, x1 - x0, y1 - y0);
    } else if (shape.type === 2) {
      this.offlineCtx.beginPath();
      shape.coor.forEach((pt, i) => {
        if (i === 0) {
          this.offlineCtx.moveTo(pt[0], pt[1]);
        } else {
          this.offlineCtx.lineTo(pt[0], pt[1]);
        }
      });
      this.offlineCtx.closePath();
      this.offlineCtx.fill();
    }
    const areaData = this.offlineCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
    const index = (point[1] - 1) * this.WIDTH * 4 + point[0] * 4;
    return areaData.data[index + 3] !== 0;
  }

  /**
   * 判断是否在控制点内
   * @param point 点击坐标
   * @param area 目标区域
   */
  isPointInCtrl(point: number[], area: number[]) {
    const [x, y] = area;
    this.offlineCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    this.offlineCtx.beginPath();
    this.offlineCtx.arc(x, y, this.CTRL_R, 0, Math.PI * 2);
    this.offlineCtx.fill();
    const areaData = this.offlineCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
    const index = (point[1] - 1) * this.WIDTH * 4 + point[0] * 4;
    return areaData.data[index + 3] !== 0;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  // 更新画布
  update() {
    this.clear();
    this.dataset.forEach((shape) => {
      if (shape.type === 1) {
        this.drawRect(shape);
      } else if (shape.type === 2) {
        this.drawPolygon(shape as Polygon);
      }
    });
    if (this.activeShape) {
      this.activeShape.ctrlsData.forEach((el) => {
        this.drawCtrls(el);
      });
    }
  }

  drawRect(shape: Rect) {
    const [[x0, y0], [x1, y1]] = shape.coor;
    this.ctx.save();
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.strokeStyle = (shape.active || shape.creating) ? this.activeStrokeStyle : this.strokeStyle;
    this.ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    if (!shape.creating) {
      this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    this.ctx.restore();
    this.drawLabel(shape.coor[0], shape.label);
  }

  drawPolygon(shape: Polygon) {
    this.ctx.save();
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.strokeStyle = (shape.active || shape.creating) ? this.activeStrokeStyle : this.strokeStyle;
    this.ctx.beginPath();
    shape.coor.forEach((el, index) => {
      if (index === 0) {
        this.ctx.moveTo(el[0], el[1]);
      } else {
        this.ctx.lineTo(el[0], el[1]);
      }
    });
    if (shape.creating) {
      this.ctx.lineTo(this.movePoint[0], this.movePoint[1]);
    }
    if (shape.coor.length > 2 && shape.finish) {
      this.ctx.closePath();
    }
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    this.drawLabel(shape.coor[0], shape.label);
  }

  // 绘制控制点
  drawCtrls(point: Point) {
    const [x, y] = point;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = '#fff';
    this.ctx.arc(x, y, this.CTRL_R, 0, 2 * Math.PI, true);
    this.ctx.fill();
    this.ctx.arc(x, y, this.CTRL_R, 0, 2 * Math.PI, true);
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * 绘制label
   * @param point 位置
   * @param str 文本
   */
  drawLabel(point: Point, str: string) {
    if (str.length) {
      const newStr = str.length < 5 ? str : (`${str.substr(0, 4)}...`);
      const text = this.ctx.measureText(newStr);
      this.ctx.save();
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(point[0] + 1, point[1] + 1, text.width + 4, 16);
      this.ctx.font = '12px serif #000';
      this.ctx.strokeText(newStr, point[0] + 2, point[1] + 12, 80);
      this.ctx.restore();
    }
  }

  // 删除指定矩形
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
