import Rect from "./shape/Rect";
import Polygon from "./shape/Polygon";
import Dot from "./shape/Dot";
import EventBus from "./EventBus";
import Line from "./shape/Line";
import Circle from "./shape/Circle";
import pkg from "../package.json";
import Shape from "./shape/Shape";
import Connectivity from "./shape/Connectivity";

type Point = [number, number];
export interface Point2 {
  x: number;
  y: number;
}
type AllShape = Rect | Polygon | Dot | Line | Circle | Connectivity;

export default class CanvasSelect extends EventBus {
  version = pkg.version;

  lock: boolean = false; // 只读模式

  MIN_WIDTH = 10;

  MIN_HEIGHT = 10;

  MIN_RADIUS = 5;

  strokeStyle = "#0f0";

  fillStyle = "rgba(0, 0, 255,0.1)";

  activeStrokeStyle = "#f00";

  activeFillStyle = "rgba(255, 0, 0,0.1)";

  ctrlStrokeStyle = "#000";

  ctrlFillStyle = "#fff";

  ctrlRadius = 3;

  hideLabel = false;

  labelFillStyle = "#fff";

  labelFont = "10px sans-serif";

  textFillStyle = "#000";

  labelMaxLen = 10;

  WIDTH = 0;

  HEIGHT = 0;

  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  dataset: Array<AllShape> = [];

  offScreen: HTMLCanvasElement;

  offScreenCtx: CanvasRenderingContext2D;

  remmber: number[][]; // 记录锚点距离

  mouse: Point; // 记录鼠标位置

  remmberOrigin: number[] = [0, 0]; // 记录背景图鼠标位移

  createType = 0; // 0 不创建，1 创建矩形，2 创建多边形，3 创建点

  ctrlIndex = -1;

  cursor: string = "auto";

  image: HTMLImageElement = new Image();

  IMAGE_ORIGIN_WIDTH: number;

  IMAGE_WIDTH = 0;

  IMAGE_ORIGIN_HEIGHT = 0;

  IMAGE_HEIGHT = 0;

  originX = 0; // 原点x

  originY = 0; // 原点y

  scaleStep = 0; // 缩放步长

  scrollZoom = true; // 滚动缩放

  timer: NodeJS.Timer;

  dblTouch = 300; // 最小touch双击时间

  dblTouchStore = 0; // touch双击时间

  alpha = true; // 这个选项可以帮助浏览器进行内部优化

  focusMode = false; // 专注模式

  evt: MouseEvent | TouchEvent | KeyboardEvent;

  scaleTouchStore = 0;

  isTouch2 = false;

  isDragging = false;

  dragStartX = 0;

  dragStartY = 0;

  allowPanning = false;

  RemoveSelectionOnKey: string = "Backspace";

  rectangleConnectivity: Point[] = [];

  parentRectangleConnectivity: Shape = null;

  childRectangleConnectivity: Shape = null;

  hideAnnotateLabels = false;

  LineWidth = 1.5;

  ZoomLevel = 100; // ZoomLevel 100 is min

  ScrollTop = 0;

  /**
   * @param el Valid CSS selector string, or DOM
   * @param src image src
   */
  constructor(el: HTMLCanvasElement | string, src?: string) {
    super();
    this.handleLoad = this.handleLoad.bind(this);
    this.handleContextmenu = this.handleContextmenu.bind(this);
    this.handleMousewheel = this.handleMousewheel.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handelMouseMove = this.handelMouseMove.bind(this);
    this.handelMouseUp = this.handelMouseUp.bind(this);
    this.handelLeave = this.handelLeave.bind(this);
    this.handelDblclick = this.handelDblclick.bind(this);
    this.handelKeyup = this.handelKeyup.bind(this);
    const container = typeof el === "string" ? document.querySelector(el) : el;
    if (container instanceof HTMLCanvasElement) {
      this.canvas = container;
      this.offScreen = document.createElement("canvas");
      this.initSetting();
      this.initEvents();
      src && this.setImage(src);
    } else {
      console.warn("HTMLCanvasElement is required!");
    }
  }

  set setDragging(value: boolean) {
    this.allowPanning = value;
  }

  get activeShape() {
    return this.dataset.find((x) => x.active) || ({} as any);
  }

  get scale() {
    if (this.IMAGE_ORIGIN_WIDTH && this.IMAGE_WIDTH) {
      return this.IMAGE_WIDTH / this.IMAGE_ORIGIN_WIDTH;
    }
    return 1;
  }

  get imageMin() {
    return Math.min(this.IMAGE_WIDTH, this.IMAGE_HEIGHT);
  }

  get imageOriginMax() {
    return Math.max(this.IMAGE_ORIGIN_WIDTH, this.IMAGE_ORIGIN_HEIGHT);
  }

  /**
   * 合成事件
   * @param e
   * @returns
   */
  mergeEvent(e: TouchEvent | MouseEvent) {
    let mouseX = 0;
    let mouseY = 0;
    let mouseCX = 0;
    let mouseCY = 0;
    let isMobile = false;
    if (window.TouchEvent && e instanceof TouchEvent) {
      let { clientX, clientY } = e.touches[0];
      let target = e.target as HTMLCanvasElement;
      const { left, top } = target.getBoundingClientRect();
      mouseX = Math.round(clientX - left);
      mouseY = Math.round(clientY - top);
      if (e.touches.length === 2) {
        let { clientX: clientX1 = 0, clientY: clientY1 = 0 } =
          e.touches[1] || {};
        mouseCX = Math.round(
          Math.abs((clientX1 - clientX) / 2 + clientX) - left
        );
        mouseCY = Math.round(
          Math.abs((clientY1 - clientY) / 2 + clientY) - top
        );
      }
      isMobile = true;
    } else {
      mouseX = (e as MouseEvent).offsetX;
      mouseY = (e as MouseEvent).offsetY;
    }
    return { ...e, mouseX, mouseY, mouseCX, mouseCY, isMobile };
  }

  handleLoad() {
    this.emit("load", this.image.src);
    this.IMAGE_ORIGIN_WIDTH = this.IMAGE_WIDTH = this.image.width;
    this.IMAGE_ORIGIN_HEIGHT = this.IMAGE_HEIGHT = this.image.height;
    this.fitZoom();
  }
  /**
  Handles the "leave" event triggered by a user action.
  @param {Event} e - The event object associated with the "leave" event.
  */
  handelLeave(e: any) {
    e.preventDefault();
    this.isDragging = false;
  }
  handleScroll(e: any) {
    this.originX = e.target.scrollLeft * -1;
    this.originY = e.target.scrollTop * -1;
  }
  handleContextmenu(e: MouseEvent) {
    e.preventDefault();
    this.evt = e;
    if (this.lock) return;
  }
  /**
   * Handles the mousewheel event and performs zooming functionality.
   * @param e The WheelEvent object representing the mousewheel event.
   * @returns void
   */
  handleMousewheel(e: WheelEvent) {
    // Check if the lock flag is true, scrollZoom is disabled, or the Ctrl key is not pressed, and return early
    if (this.lock || !this.scrollZoom || !e.ctrlKey) return;

    e.preventDefault();
    e.stopPropagation();

    // Retrieve the mouse coordinates relative to the component using the mergeEvent function
    const { mouseX, mouseY } = this.mergeEvent(e);

    // Update the mouse coordinates in the component's state
    this.mouse = [mouseX, mouseY];

    // Set the scale based on the direction of the mousewheel scroll
    this.setScale(e.deltaY < 0);
  }
  handleMouseDown(e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    if (this.allowPanning) {
      this.isDragging = true;
      this.dragStartX = (e as MouseEvent).clientX;
      this.dragStartY = (e as MouseEvent).clientY;
    }

    this.evt = e;
    if (this.lock) return;
    const { mouseX, mouseY, mouseCX, mouseCY } = this.mergeEvent(e);
    const isMobile = window.TouchEvent && e instanceof TouchEvent;
    const offsetX = Math.round(mouseX / this.scale) + this.originX / this.scale;
    const offsetY = Math.round(mouseY / this.scale) + this.originY / this.scale;
    this.mouse =
      isMobile && e.touches.length === 2
        ? [mouseCX, mouseCY]
        : [mouseX, mouseY];
    this.remmberOrigin = [mouseX - this.originX, mouseY - this.originY];
    if (
      (!isMobile && (e as MouseEvent).buttons === 1) ||
      (isMobile && e.touches.length === 1)
    ) {
      // 鼠标左键
      const ctrls = this.activeShape.ctrlsData || [];
      this.ctrlIndex = ctrls.findIndex((coor: Point) =>
        this.isPointInCircle(this.mouse, coor, this.ctrlRadius)
      );
      if (this.ctrlIndex > -1) {
        // 点击到控制点
        const [x0, y0] = ctrls[this.ctrlIndex];
        this.remmber = [[offsetX - x0, offsetY - y0]];
      } else if (this.isInBackground(e)) {
        if (this.activeShape.creating) {
          // 创建中
          if ([2, 4, 6].includes(this.activeShape.type)) {
            const [x, y] =
              this.activeShape.coor[this.activeShape.coor.length - 1];
            if (x !== offsetX && y !== offsetY) {
              const nx = Math.round(offsetX - this.originX / this.scale);
              const ny = Math.round(offsetY - this.originY / this.scale);
              this.activeShape.coor.push([nx, ny]);
              if (this.activeShape.type === 6) this.createConnectivity();
            }
          }
        } else if (this.createType > 0) {
          // 开始创建
          let newShape;
          const nx = Math.round(offsetX - this.originX / this.scale);
          const ny = Math.round(offsetY - this.originY / this.scale);
          const curPoint: Point = [nx, ny];
          switch (this.createType) {
            case 1:
              newShape = new Rect(
                { coor: [curPoint, curPoint] },
                this.dataset.length
              );
              newShape.creating = true;
              break;
            case 2:
              newShape = new Polygon({ coor: [curPoint] }, this.dataset.length);
              newShape.creating = true;
              break;
            case 3:
              newShape = new Dot({ coor: curPoint }, this.dataset.length);
              this.emit("add", newShape);
              break;
            case 4:
              newShape = new Line({ coor: [curPoint] }, this.dataset.length);
              newShape.creating = true;
              break;
            case 5:
              newShape = new Circle({ coor: curPoint }, this.dataset.length);
              newShape.creating = true;
              break;
            case 6:
              newShape = new Connectivity(
                { coor: [curPoint] },
                this.dataset.length
              );
              newShape.creating = true;
              this.parentRectangleConnectivity = this.findReactengle();
              break;
            default:
              break;
          }
          this.dataset.forEach((sp) => {
            sp.active = false;
          });
          newShape.active = true;
          this.dataset.push(newShape);
        } else {
          // 是否点击到形状
          const [hitShapeIndex, hitShape] = this.hitOnShape(this.mouse);
          if (hitShapeIndex > -1) {
            this.dataset.forEach(
              (item, i) => (item.active = i === hitShapeIndex)
            );
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
            this.emit("select", hitShape);
          } else {
            this.activeShape.active = false;
            this.dataset.sort((a, b) => a.index - b.index);
          }
        }
        this.update();
      }
    }
  }
  handelMouseMove(e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    if (this.isDragging && this.allowPanning) {
      this.originX += (e as MouseEvent).clientX - this.dragStartX;
      this.originY += (e as MouseEvent).clientY - this.dragStartY;
      this.dragStartX = (e as MouseEvent).clientX;
      this.dragStartY = (e as MouseEvent).clientY;
      this.update();
    } else {
      this.evt = e;
      if (this.lock) return;
      const { mouseX, mouseY, mouseCX, mouseCY } = this.mergeEvent(e);
      const isMobile = window.TouchEvent && e instanceof TouchEvent;
      const offsetX =
        Math.round(mouseX / this.scale) + this.originX / this.scale;
      const offsetY =
        Math.round(mouseY / this.scale) + this.originY / this.scale;
      this.mouse =
        isMobile && e.touches.length === 2
          ? [mouseCX, mouseCY]
          : [mouseX, mouseY];

      if (
        ((!isMobile && (e as MouseEvent).buttons === 1) ||
          (isMobile && e.touches.length === 1)) &&
        this.activeShape.type
      ) {
        if (
          this.ctrlIndex > -1 &&
          (this.isInBackground(e) || this.activeShape.type === 5)
        ) {
          const [[x, y]] = this.remmber;
          // resize矩形
          if (this.activeShape.type === 1) {
            const [[x0, y0], [x1, y1]] = this.activeShape.coor;
            let coor: Point[] = [];
            switch (this.ctrlIndex) {
              case 0:
                coor = [
                  [offsetX - x, offsetY - y],
                  [x1, y1],
                ];
                break;
              case 1:
                coor = [
                  [x0, offsetY - y],
                  [x1, y1],
                ];
                break;
              case 2:
                coor = [
                  [x0, offsetY - y],
                  [offsetX - x, y1],
                ];
                break;
              case 3:
                coor = [
                  [x0, y0],
                  [offsetX - x, y1],
                ];
                break;
              case 4:
                coor = [
                  [x0, y0],
                  [offsetX - x, offsetY - y],
                ];
                break;
              case 5:
                coor = [
                  [x0, y0],
                  [x1, offsetY - y],
                ];
                break;
              case 6:
                coor = [
                  [offsetX - x, y0],
                  [x1, offsetY - y],
                ];
                break;
              case 7:
                coor = [
                  [offsetX - x, y0],
                  [x1, y1],
                ];
                break;
              default:
                break;
            }
            const [[a0, b0], [a1, b1]] = coor;
            if (a1 - a0 >= this.MIN_WIDTH && b1 - b0 >= this.MIN_HEIGHT) {
              this.activeShape.coor = coor;
            } else {
              this.emit(
                "warn",
                `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than${this.MIN_HEIGHT}。`
              );
            }
          } else if ([2, 4, 6].includes(this.activeShape.type)) {
            const nx = Math.round(offsetX - this.originX / this.scale);
            const ny = Math.round(offsetY - this.originY / this.scale);
            const newPoint = [nx, ny];
            this.activeShape.coor.splice(this.ctrlIndex, 1, newPoint);
          } else if (this.activeShape.type === 5) {
            const nx = Math.round(offsetX - this.originX / this.scale);
            const newRadius = nx - this.activeShape.coor[0];
            if (newRadius >= this.MIN_RADIUS)
              this.activeShape.radius = newRadius;
          }
        } else if (this.activeShape.dragging) {
          // 拖拽
          let coor = [];
          let noLimit = true;
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
              if (x < 0 || x > w || y < 0 || y > h) noLimit = false;
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
            const [x0, y0] = this.activeShape.coor;
            const r = Math.sqrt((x0 - x) ** 2 + (y0 - y) ** 2);
            this.activeShape.radius = r;
          }
        }
        this.update();
      } else if (
        [2, 4, 6].includes(this.activeShape.type) &&
        this.activeShape.creating
      ) {
        // 多边形添加点
        this.update();
      } else if (
        (!isMobile && (e as MouseEvent).buttons === 2 && e.which === 3) ||
        (isMobile && e.touches.length === 1 && !this.isTouch2)
      ) {
        // 拖动背景
        // this.originX = Math.round(mouseX - this.remmberOrigin[0]);
        // this.originY = Math.round(mouseY - this.remmberOrigin[1]);
        // this.update();
      } else if (isMobile && e.touches.length === 2) {
        this.isTouch2 = true;
        const touch0 = e.touches[0];
        const touch1 = e.touches[1];
        const cur = this.scaleTouchStore;
        this.scaleTouchStore = Math.abs(
          (touch1.clientX - touch0.clientX) * (touch1.clientY - touch0.clientY)
        );
        this.setScale(this.scaleTouchStore > cur, true);
      }
    }
  }
  handelMouseUp(e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    // Temp Code
    if (this.allowPanning) {
      this.isDragging = false;
      this.originX += (e as MouseEvent).clientX - this.dragStartX;
      this.originY += (e as MouseEvent).clientY - this.dragStartY;
    }

    this.evt = e;
    if (this.lock) return;
    if (window.TouchEvent && e instanceof TouchEvent) {
      if (e.touches.length === 0) {
        this.isTouch2 = false;
      }
      if (Date.now() - this.dblTouchStore < this.dblTouch) {
        this.handelDblclick(e);
        return;
      }
      this.dblTouchStore = Date.now();
    }
    this.remmber = [];
    if (this.activeShape.type) {
      this.activeShape.dragging = false;
      if (this.activeShape.creating) {
        if (this.activeShape.type === 1) {
          const [[x0, y0], [x1, y1]] = this.activeShape.coor;
          if (
            Math.abs(x0 - x1) < this.MIN_WIDTH ||
            Math.abs(y0 - y1) < this.MIN_HEIGHT
          ) {
            this.dataset.pop();
            this.emit(
              "warn",
              `Width cannot be less than ${this.MIN_WIDTH},Height cannot be less than ${this.MIN_HEIGHT}`
            );
          } else {
            this.activeShape.coor = [
              [Math.min(x0, x1), Math.min(y0, y1)],
              [Math.max(x0, x1), Math.max(y0, y1)],
            ];
            this.activeShape.creating = false;
            this.emit("add", this.activeShape);
          }
        } else if (this.activeShape.type === 5) {
          if (this.activeShape.radius < this.MIN_RADIUS) {
            this.dataset.pop();
            this.emit("warn", `Radius cannot be less than ${this.MIN_WIDTH}`);
          } else {
            this.activeShape.creating = false;
            this.emit("add", this.activeShape);
          }
        }
        this.update();
      }
    }

    // END
  }
  handelDblclick(e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    this.evt = e;
    if (this.lock) return;
    if ([2, 4].includes(this.activeShape.type)) {
      if (
        (this.activeShape.type === 2 && this.activeShape.coor.length > 2) ||
        (this.activeShape.type === 4 && this.activeShape.coor.length > 1)
      ) {
        this.emit("add", this.activeShape);
        this.activeShape.creating = false;
        this.update();
      }
    }
  }
  handelKeyup(e: KeyboardEvent) {
    e.stopPropagation();
    this.evt = e;
    if (this.lock || document.activeElement !== document.body) return;
    if (this.activeShape.type) {
      if ([2, 4, 6].includes(this.activeShape.type) && e.key === "Escape") {
        if (this.activeShape.coor.length > 1 && this.activeShape.creating) {
          this.activeShape.coor.pop();
        } else {
          this.deleteByIndex(this.activeShape.index);
        }
        this.update();
      } else if (e.key === this.RemoveSelectionOnKey) {
        this.deleteByIndex(this.activeShape.index);
      }
    }
  }

  /**
   * Find reactangle for connectivity between the rectangle
   */
  private findReactengle(): Rect {
    for (let i = this.dataset.length - 1; i > -1; i--) {
      const shape = this.dataset[i];
      const [x, y] = this.mouse;
      if (shape.type === 1) {
        const [[x0, y0], [x1, y1]] = (shape as Rect).coor.map((a) =>
          a.map((b: any) => b * this.scale)
        );
        if (
          x0 + this.originX + this.canvas.parentElement.scrollLeft - 5 <= x &&
          x <= x1 + this.originX + this.canvas.parentElement.scrollLeft + 5 &&
          y0 + this.originY + this.canvas.parentElement.scrollTop - 5 <= y &&
          y <= y1 + this.originY + this.canvas.parentElement.scrollTop + 5
        ) {
          return shape as Rect;
        }
      }
    }
  }

  /**
  Creates connectivity between rectangles in a graphical application.
  The method is specific to the context of an object or class it belongs to.
  */
  private createConnectivity() {
    // Check if the active shape is not of type 6 (a specific type)
    if (this.activeShape.type !== 6) {
      this.update();
      return;
    }

    // Emit an "add" event with the active shape
    this.emit("add", this.activeShape);

    // Set the 'creating' flag of the active shape to false
    this.activeShape.creating = false;

    // Find the child rectangle connectivity by invoking 'findReactengle' method
    this.childRectangleConnectivity = this.findReactengle();

    // Check if both parent and child rectangle connectivity exist and have different indices
    if (
      this.parentRectangleConnectivity &&
      this.childRectangleConnectivity &&
      this.parentRectangleConnectivity.index !==
        this.childRectangleConnectivity.index
    ) {
      // Push the indices of parent and child rectangle connectivity to the rectangleConnectivity array
      this.rectangleConnectivity.push([
        this.parentRectangleConnectivity.index,
        this.childRectangleConnectivity.index,
      ]);

      // Check if the parent and child rectangle connectivity are not already present in the lineCoorIndex array
      if (
        !this.isArrayInArray(
          this.parentRectangleConnectivity.rectangleConnectivity,
          this.childRectangleConnectivity.rectangleConnectivity,
          this.rectangleConnectivity[0]
        )
      ) {
        // Push the active shape's index to the lineCoorIndex arrays of both parent and child rectangle connectivity
        this.parentRectangleConnectivity.lineCoorIndex.push(
          this.activeShape.index
        );
        this.childRectangleConnectivity.lineCoorIndex.push(
          this.activeShape.index
        );

        // Push the rectangle connectivity between parent and child to the rectangleConnectivity arrays of both rectangles
        this.activeShape.rectangleConnectivity.push([
          this.parentRectangleConnectivity.index,
          this.childRectangleConnectivity.index,
        ]);
        this.parentRectangleConnectivity.rectangleConnectivity.push([
          this.parentRectangleConnectivity.index,
          this.childRectangleConnectivity.index,
        ]);
        this.childRectangleConnectivity.rectangleConnectivity.push([
          this.parentRectangleConnectivity.index,
          this.childRectangleConnectivity.index,
        ]);
      } else {
        // If the connectivity already exists, find the index of the active shape in the dataset
        const num = this.dataset.findIndex(
          (x) => x.index === this.activeShape.index
        );
        if (num > -1) {
          // Emit a "delete" event for the corresponding dataset entry and remove it from the dataset
          this.emit("delete", this.dataset[num]);
          this.dataset.splice(num, 1);
        }
      }

      // Reset the rectangleConnectivity array
      this.rectangleConnectivity = [];
    } else {
      // If either the parent or child rectangle connectivity is missing or they have the same index
      const num = this.dataset.findIndex(
        (x) => x.index === this.activeShape.index
      );
      if (num > -1) {
        // Emit a "delete" event for the corresponding dataset entry and remove it from the dataset
        this.emit("delete", this.dataset[num]);
        this.dataset.splice(num, 1);
      }
    }

    // Perform an update
    this.update();
  }

  /**

  Checks if a given array is contained within another array, considering specific element comparisons.
  @param {any[]} parentArr - The parent array to be checked.
  @param {any[]} childArr - The child array to be checked.
  @param {any[]} comp - The array to be compared for existence within the parent and child arrays.
  @returns {boolean} Returns true if the comp array is found within either the parent or child arrays, false otherwise.
  */
  private isArrayInArray(parentArr: any, childArr: any, comp: any) {
    // Check if both parent and child arrays are empty
    if (!parentArr.length && !childArr.length) {
      return false;
    }

    // Extract the values from the comp array
    const [x1, y1] = comp;

    // Check if the comp array exists in the parent array
    const parentCheck = parentArr.some(
      ([e1, e2]: [number, number]) =>
        (e1 === x1 || e1 === y1) && (e2 === x1 || e2 === y1)
    );

    // Check if the comp array exists in the child array
    const childCheck = childArr.some(
      ([e1, e2]: [number, number]) =>
        (e1 === x1 || e1 === y1) && (e2 === x1 || e2 === y1)
    );

    // Return true if the comp array is found in either the parent or child arrays
    return parentCheck || childCheck;
  }

  private getDomRect(coor: Point[]) {
    const [x1, y1] = coor[0];
    const [x2, y2] = coor[1];
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  private drawShortestLine(
    rect1: DOMRect,
    rect2: DOMRect,
    shape: Line | Connectivity
  ) {
    const closestMidpoints = this.getClosestMidpoints(rect1, rect2);

    shape.coor[0] = [closestMidpoints[0].x, closestMidpoints[0].y];
    shape.coor[1] = [closestMidpoints[1].x, closestMidpoints[1].y];

    this.drawLine(shape as Line | Connectivity);

    // this.parentRectangleConnectivity = this.childRectangleConnectivity = null;
    // this.ctx.beginPath();
    // this.ctx.moveTo(
    //   closestMidpoints[0].x * this.scale,
    //   closestMidpoints[0].y * this.scale
    // );
    // this.ctx.lineTo(
    //   closestMidpoints[1].x * this.scale,
    //   closestMidpoints[1].y * this.scale
    // );
    // this.ctx.strokeStyle = "#ba3f3f";
    // this.ctx.stroke();
  }

  private getClosestMidpoints(rect1: DOMRect, rect2: DOMRect): Point2[] {
    const midpoints1 = this.getMidpoints(rect1);
    const midpoints2 = this.getMidpoints(rect2);
    let closestDistance = Infinity;
    let closestMidpoints: Point2[] = [];
    for (let i = 0; i < midpoints1.length; i++) {
      for (let j = 0; j < midpoints2.length; j++) {
        const distance = this.getDistance(midpoints1[i], midpoints2[j]);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestMidpoints = [midpoints1[i], midpoints2[j]];
        }
      }
    }
    return closestMidpoints;
  }

  private getMidpoints(rect: DOMRect): Point2[] {
    const { x, y, width, height } = rect;
    const midX = x + width / 2;
    const midY = y + height / 2;
    return [
      { x, y: midY },
      { x: x + width, y: midY },
      { x: midX, y },
      { x: midX, y: y + height },
    ];
  }

  private getDistance(point1: Point2, point2: Point2): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 初始化配置
   */
  initSetting() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.userSelect = "none";
    this.ctx = this.ctx || this.canvas.getContext("2d", { alpha: this.alpha });
    this.WIDTH = this.canvas.clientWidth;
    this.HEIGHT = this.canvas.clientHeight;
    this.canvas.width = this.WIDTH * dpr;
    this.canvas.height = this.HEIGHT * dpr;
    this.canvas.style.width = this.WIDTH + "px";
    this.canvas.style.height = this.HEIGHT + "px";
    this.offScreen.width = this.WIDTH;
    this.offScreen.height = this.HEIGHT;
    this.offScreenCtx =
      this.offScreenCtx ||
      this.offScreen.getContext("2d", { willReadFrequently: true });
    this.ctx.scale(dpr, dpr);
  }
  /**
   * 初始化事件
   */
  initEvents() {
    this.image.addEventListener("load", this.handleLoad);
    this.canvas.addEventListener("touchstart", this.handleMouseDown);
    this.canvas.addEventListener("touchmove", this.handelMouseMove);
    this.canvas.addEventListener("touchend", this.handelMouseUp);
    this.canvas.addEventListener("contextmenu", this.handleContextmenu);
    this.canvas.addEventListener("mousewheel", this.handleMousewheel);
    this.canvas.addEventListener("wheel", this.handleMousewheel);
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handelMouseMove);
    this.canvas.addEventListener("mouseup", this.handelMouseUp);
    this.canvas.addEventListener("mouseleave", this.handelLeave);
    this.canvas.addEventListener("dblclick", this.handelDblclick);
    document.body.addEventListener("keyup", this.handelKeyup);
    this.canvas.parentElement.addEventListener("scroll", this.handleScroll);
  }
  /**
   * 添加/切换图片
   * @param url 图片链接
   */
  setImage(url: string) {
    this.image.src = url;
  }
  /**
   * 设置数据
   * @param data Array
   */
  setData(data: AllShape[]) {
    setTimeout(() => {
      let initdata: AllShape[] = [];
      data.forEach((item, index) => {
        if (Object.prototype.toString.call(item).indexOf("Object") > -1) {
          let shape: AllShape;
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
            case 6:
              shape = new Connectivity(item, index);
              break;
            default:
              console.warn("Invalid shape", item);
              break;
          }
          [1, 2, 3, 4, 5, 6].includes(item.type) && initdata.push(shape);
        } else {
          console.warn("Shape must be an enumerable Object.", item);
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
    let hitShape: AllShape;
    for (let i = this.dataset.length - 1; i > -1; i--) {
      const shape = this.dataset[i];
      if (
        (shape.type === 3 &&
          this.isPointInCircle(
            mousePoint,
            shape.coor as Point,
            this.ctrlRadius
          )) ||
        (shape.type === 5 &&
          this.isPointInCircle(
            mousePoint,
            shape.coor as Point,
            (shape as Circle).radius * this.scale
          )) ||
        (shape.type === 1 &&
          this.isPointInRect(mousePoint, (shape as Rect).coor)) ||
        (shape.type === 2 &&
          this.isPointInPolygon(mousePoint, (shape as Polygon).coor)) ||
        ((shape.type === 4 || shape.type === 6) &&
          this.isPointInLine(mousePoint, (shape as Line | Connectivity).coor))
      ) {
        // if (this.focusMode && !shape.active) continue;
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

    return (
      mouseX >= this.originX + this.canvas.parentElement.scrollLeft &&
      mouseY >= this.originY + this.canvas.parentElement.scrollTop &&
      mouseX <=
        this.originX +
          this.IMAGE_ORIGIN_WIDTH * this.scale +
          this.canvas.parentElement.scrollLeft &&
      mouseY <=
        this.originY +
          this.IMAGE_ORIGIN_HEIGHT * this.scale +
          this.canvas.parentElement.scrollTop
    );
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
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
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
    const areaData = this.offScreenCtx.getImageData(
      0,
      0,
      this.WIDTH,
      this.HEIGHT
    );
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
    const distance = Math.sqrt(
      (x0 + (this.originX + this.canvas.parentElement.scrollLeft) - x) ** 2 +
        (y0 + (this.originY + this.canvas.parentElement.scrollTop) - y) ** 2
    );
    return distance <= r;
  }

  /**
   * 判断是否在折线内
   * @param point 坐标
   * @param coor 区域坐标
   * @returns 布尔值
   */
  isPointInLine(point: Point, coor: Point[]): boolean {
    if (coor.length === 2) {
      let [x1, y1] = coor[0];
      let [x2, y2] = coor[1];
      x1 *= this.scale;
      x2 *= this.scale;
      y1 *= this.scale;
      y2 *= this.scale;
      let [x, y] = point;
      return this.isPointOnLine(x, y, x1, y1, x2, y2);
    }
  }

  /**

Checks if a given point lies on a line segment defined by two points.
@param {number} x - The x-coordinate of the point to be checked.
@param {number} y - The y-coordinate of the point to be checked.
@param {number} x1 - The x-coordinate of the first point defining the line segment.
@param {number} y1 - The y-coordinate of the first point defining the line segment.
@param {number} x2 - The x-coordinate of the second point defining the line segment.
@param {number} y2 - The y-coordinate of the second point defining the line segment.
@returns {boolean} Returns true if the point lies on the line segment, false otherwise.
*/
  isPointOnLine(x: any, y: any, x1: any, y1: any, x2: any, y2: any) {
    // Calculate a buffer to add a small margin of error
    const buffer = 5 / Math.max(this.scale, 1);
    // Call the circleLineIntersect method to check if the point lies on the line segment
    return this.circleLineIntersect(x1, y1, x2, y2, x, y, buffer);
  }

  /**

Determines if a given circle intersects with a line segment defined by two points.
@param {number} x1 - The x-coordinate of the first point defining the line segment.
@param {number} y1 - The y-coordinate of the first point defining the line segment.
@param {number} x2 - The x-coordinate of the second point defining the line segment.
@param {number} y2 - The y-coordinate of the second point defining the line segment.
@param {number} cx - The x-coordinate of the center of the circle.
@param {number} cy - The y-coordinate of the center of the circle.
@param {number} r - The radius of the circle.
@returns {boolean} Returns true if the circle intersects with the line segment, false otherwise.
*/
  circleLineIntersect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    cx: number,
    cy: number,
    r: number
  ): boolean {
    // Calculate the vector components of the line segment
    const dx = x2 - x1;
    const dy = y2 - y1;
    // Calculate the squared length of the line segment
    const len2 = dx * dx + dy * dy;
    // Calculate the parameter 'u' to determine the closest point on the line segment to the circle's center
    const u = ((cx - x1) * dx + (cy - y1) * dy) / len2;

    // If 'u' is outside the range [0, 1], the closest point is outside the line segment
    if (u < 0 || u > 1) {
      return false;
    }

    // Calculate the coordinates of the closest point on the line segment to the circle's center
    const closestX = x1 + u * dx;
    const closestY = y1 + u * dy;
    // Calculate the squared distance between the closest point and the circle's center
    const dist = (closestX - cx) ** 2 + (closestY - cy) ** 2;
    // Check if the squared distance is less than or equal to the squared radius
    return dist <= r;
  }

  /**
   * 绘制矩形
   * @param shape 标注实例
   * @returns
   */
  drawRect(shape: Rect) {
    if (shape.coor.length !== 2) return;
    const { strokeStyle, fillStyle, active, creating, coor } = shape;
    const [[x0, y0], [x1, y1]] = coor.map((a: Point) =>
      a.map((b) => Math.round(b * this.scale))
    );
    this.ctx.save();
    this.ctx.fillStyle = fillStyle || this.fillStyle;
    this.ctx.strokeStyle =
      active || creating
        ? this.activeStrokeStyle
        : strokeStyle || this.strokeStyle;
    const w = x1 - x0;
    const h = y1 - y0;
    this.ctx.lineWidth = this.LineWidth;
    this.ctx.strokeRect(x0, y0, w, h);
    if (!creating) this.ctx.fillRect(x0, y0, w, h);
    this.ctx.restore();
    if (!this.hideAnnotateLabels) this.drawLabel(coor[0], shape);
  }
  /**
   * 绘制多边形
   * @param shape 标注实例
   */
  drawPolygon(shape: Polygon) {
    const { strokeStyle, fillStyle, active, creating, coor } = shape;
    this.ctx.save();
    this.ctx.fillStyle = fillStyle || this.fillStyle;
    this.ctx.strokeStyle =
      active || creating
        ? this.activeStrokeStyle
        : strokeStyle || this.strokeStyle;
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
    if (!this.hideAnnotateLabels) this.drawLabel(coor[0], shape);
  }
  /**
   * 绘制点
   * @param shape 标注实例
   */
  drawDot(shape: Dot) {
    const { strokeStyle, fillStyle, active, coor } = shape;
    const [x, y] = coor.map((a) => a * this.scale);
    this.ctx.save();
    this.ctx.fillStyle = fillStyle || this.ctrlFillStyle;
    this.ctx.strokeStyle = active
      ? this.activeStrokeStyle
      : strokeStyle || this.strokeStyle;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
    this.ctx.fill();
    this.ctx.arc(x, y, this.ctrlRadius, 0, 2 * Math.PI, true);
    this.ctx.stroke();
    this.ctx.restore();
    if (!this.hideAnnotateLabels) this.drawLabel(coor as Point, shape);
  }
  /**
   * 绘制圆
   * @param shape 标注实例
   */
  drawCirle(shape: Circle) {
    const {
      strokeStyle,
      fillStyle,
      active,
      coor,
      label,
      creating,
      radius,
      ctrlsData,
    } = shape;
    const [x, y] = coor.map((a) => a * this.scale);
    this.ctx.save();
    this.ctx.fillStyle = fillStyle || this.fillStyle;
    this.ctx.strokeStyle =
      active || creating
        ? this.activeStrokeStyle
        : strokeStyle || this.strokeStyle;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
    this.ctx.fill();
    this.ctx.arc(x, y, radius * this.scale, 0, 2 * Math.PI, true);
    this.ctx.stroke();
    this.ctx.restore();
    if (!this.hideAnnotateLabels) this.drawLabel(ctrlsData[0] as Point, shape);
  }
  /**
   * 绘制折线
   * @param shape 标注实例
   */
  drawLine(shape: Line | Connectivity) {
    const { strokeStyle, active, creating, coor } = shape;
    this.ctx.save();
    this.ctx.lineWidth = this.LineWidth;
    this.ctx.strokeStyle =
      active || creating
        ? this.activeStrokeStyle
        : strokeStyle || this.strokeStyle;
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
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    this.ctx.restore();
    if (!this.hideAnnotateLabels) this.drawLabel(coor[0], shape);
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
  drawCtrlList(shape: Rect | Polygon | Line | Connectivity) {
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
  drawLabel(point: Point, shape: AllShape) {
    const {
      label = "",
      labelFillStyle = "",
      labelFont = "",
      textFillStyle = "",
      hideLabel = false,
    } = shape;
    if (label.length && !(hideLabel || this.hideLabel)) {
      this.ctx.font = labelFont || this.labelFont;
      const textH = parseInt(this.ctx.font) + 6;
      const newText =
        label.length < this.labelMaxLen + 1
          ? label
          : `${label.slice(0, this.labelMaxLen)}...`;
      const text = this.ctx.measureText(newText);
      const [x, y] = point.map((a) => a * this.scale);
      const toleft =
        this.IMAGE_ORIGIN_WIDTH - point[0] < (text.width + 4) / this.scale;
      const toTop = this.IMAGE_ORIGIN_HEIGHT - point[1] < textH / this.scale;
      this.ctx.save();
      this.ctx.fillStyle = labelFillStyle || this.labelFillStyle;
      this.ctx.fillRect(
        toleft ? x - text.width - 3 : x + 1,
        toTop ? y - textH + 3 : y + 1,
        text.width + 4,
        textH
      );
      this.ctx.fillStyle = textFillStyle || this.textFillStyle;
      this.ctx.fillText(
        newText,
        toleft ? x - text.width - 2 : x + 2,
        toTop ? y - 3 : y + textH - 4,
        180
      );
      this.ctx.restore();
    }
  }

  /**
   * 更新画布
   */
  update() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.ctx.save();
      this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
      this.ctx.translate(this.originX, this.originY);
      if (this.IMAGE_WIDTH && this.IMAGE_HEIGHT) {
        this.canvas.style.width = this.IMAGE_WIDTH + "px";
        this.canvas.style.height = this.IMAGE_HEIGHT + "px";
        this.canvas.width = this.IMAGE_WIDTH;
        this.canvas.height = this.IMAGE_HEIGHT;
        this.canvas.parentElement.scrollLeft = this.originX * -1;
        this.canvas.parentElement.scrollTop = this.originY * -1;
        this.ctx.drawImage(
          this.image,
          0,
          0,
          this.IMAGE_WIDTH,
          this.IMAGE_HEIGHT
        );
      }
      let renderList = this.focusMode
        ? this.activeShape.type
          ? [this.activeShape]
          : []
        : this.dataset;
      for (let i = 0; i < renderList.length; i++) {
        const shape = renderList[i];
        if (shape.hide) continue;
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
          case 6:
            if (
              !this.activeShape.creating &&
              shape.rectangleConnectivity.length > 0
            ) {
              this.parentRectangleConnectivity = this.dataset.find(
                (i) => i.index === shape.rectangleConnectivity[0][0]
              );
              this.childRectangleConnectivity = this.dataset.find(
                (i) => i.index === shape.rectangleConnectivity[0][1]
              );

              let rect1: any = this.getDomRect(
                this.parentRectangleConnectivity.coor
              );
              let rect2: any = this.getDomRect(
                this.childRectangleConnectivity.coor
              );
              this.drawShortestLine(rect1, rect2, shape);
            } else {
              this.drawLine(shape as Line | Connectivity);
            }
            // if (
            //   !this.activeShape.creating &&
            //   this.parentRectangleConnectivity?.lineCoorIndex === shape.index &&
            //   this.childRectangleConnectivity?.lineCoorIndex === shape.index
            // ) {
            //   let rect1: any = this.getDomRect(
            //     this.parentRectangleConnectivity.coor
            //   );
            //   let rect2: any = this.getDomRect(
            //     this.childRectangleConnectivity.coor
            //   );
            //   this.drawShortestLine(rect1, rect2, shape);
            // } else {
            //   this.drawLine(shape as Line | Connectivity);
            // }
            break;
          case 5:
            this.drawCirle(shape as Circle);
            break;
          default:
            break;
        }
      }
      if (
        [1, 2, 4, 5, 6].includes(this.activeShape.type) &&
        !this.activeShape.hide
      ) {
        this.drawCtrlList(this.activeShape);
      }
      this.ctx.restore();
      this.emit("updated", this.dataset);
    });
  }

  /**
   * 删除指定矩形
   * @param index number
   */
  deleteByIndex(index: number) {
    const num = this.dataset.findIndex((x) => x.index === index);
    const removedDatasetsIndex = [num];
    const connectivityArray =
      this.dataset[num].rectangleConnectivity.length > 0
        ? this.dataset[num].rectangleConnectivity
        : [];

    // Remove all the connectivity relative to the delete doc.
    if (connectivityArray.length > 0) {
      for (let i = 0; i < connectivityArray.length; i++) {
        const [x, y] = connectivityArray[i].map((el: Point) => el);
        if (this.dataset[num].type === 6) {
          const parentEl = this.dataset.find(
            (el) => el.index === x
          ).rectangleConnectivity;
          const childEl = this.dataset.find(
            (el) => el.index === y
          ).rectangleConnectivity;
          parentEl.forEach((element: Point, i: number) => {
            if (element[0] === x && element[1] === y) {
              parentEl.splice(i, 1);
            }
          });
          childEl.forEach((element: Point, i: number) => {
            if (element[0] === x && element[1] === y) {
              childEl.splice(i, 1);
            }
          });
        } else {
          this.dataset.forEach((item, dataIndex) => {
            if ((item.rectangleConnectivity?.length > 0, dataIndex !== num)) {
              item.rectangleConnectivity.forEach((rec: Point, i: number) => {
                if (rec[0] === x && rec[1] === y) {
                  item.rectangleConnectivity.splice(i, 1);
                }
              });
            }
          });

          if (this.dataset[num]?.lineCoorIndex.length > 0) {
            const listofLineIndex = this.dataset[num].lineCoorIndex;

            listofLineIndex.forEach((el: number, i: number) => {
              removedDatasetsIndex.push(
                this.dataset.findIndex((item) => item.index === el)
              );
              this.dataset.forEach((item, $i) => {
                if (item.lineCoorIndex?.length > 0 && $i !== num) {
                  if (item.lineCoorIndex.findIndex((e) => e === el) !== -1)
                    item.lineCoorIndex.splice(
                      item.lineCoorIndex.findIndex((e) => e === el),
                      1
                    );
                }
              });
            });
          }
        }
      }
    }

    // END
    if (num > -1) {
      this.emit("delete", this.dataset[num]);
      const newArray = this.dataset.filter(
        (item, index) => !removedDatasetsIndex.includes(index)
      );
      newArray.forEach((item, i) => {
        let oldIndex = item.index;
        let newIndex = i;
        const isLine = item.lineCoorIndex.length === 0;
        newArray.forEach((item$, i$) => {
          if (item$.rectangleConnectivity?.length > 0) {
            item$.rectangleConnectivity = item$.rectangleConnectivity.map(
              (conn: Point) => {
                let [x, y] = conn.map((el) => el);
                if (x === oldIndex) {
                  x = newIndex;
                }
                if (y === oldIndex) {
                  y = newIndex;
                }
                conn = [x, y];
                return conn;
              }
            );
          }
          if (item$.lineCoorIndex?.length > 0 && isLine) {
            item$.lineCoorIndex = item$.lineCoorIndex.map((elm: number) => {
              if (elm === oldIndex) elm = newIndex;
              return elm;
            });
          }
        });
        item.index = i;
      });
      this.dataset = newArray;
      this.update();
    }
  }

  /**
   * 计算缩放步长
   */
  calcStep(flag = "") {
    if (this.IMAGE_WIDTH < this.WIDTH && this.IMAGE_HEIGHT < this.HEIGHT) {
      if (flag === "" || flag === "b") {
        this.setScale(true, false, true);
        this.calcStep("b");
      }
    }
    // if (this.IMAGE_WIDTH > this.WIDTH || this.IMAGE_HEIGHT > this.HEIGHT) {
    //   if (flag === "" || flag === "s") {
    //     this.setScale(false, false, true);
    //     this.calcStep("s");
    //   }
    // }
  }

  /**
   * 缩放
   * @param type true放大5%，false缩小5%
   * @param center 缩放中心 center|mouse
   * @param pure 不绘制
   */
  setScaleOld(type: boolean, byMouse = false, pure = false) {
    if (this.lock) return;
    if (
      (!type &&
        ((this.IMAGE_WIDTH <= this.WIDTH && this.IMAGE_HEIGHT <= this.HEIGHT) ||
          this.scaleStep < 0)) ||
      (type && this.IMAGE_WIDTH >= this.imageOriginMax * 10)
    )
      return;

    if (type) {
      this.scaleStep++;
    } else {
      this.scaleStep--;
    }
    let realToLeft = 0;
    let realToRight = 0;
    const [x, y] = this.mouse || [];
    if (byMouse) {
      realToLeft = (x - this.originX) / this.scale;
      realToRight = (y - this.originY) / this.scale;
    }
    const abs = Math.abs(this.scaleStep);
    const width = this.IMAGE_WIDTH;
    this.IMAGE_WIDTH = Math.round(
      this.IMAGE_ORIGIN_WIDTH * (this.scaleStep >= 0 ? 1.05 : 0.95)
    );
    this.IMAGE_HEIGHT = Math.round(
      this.IMAGE_ORIGIN_HEIGHT * (this.scaleStep >= 0 ? 1.05 : 0.95)
    );
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

  setScale(type: boolean, byMouse = false, pure = false) {
    if (this.lock) return;
    if (
      (!type &&
        ((this.IMAGE_WIDTH <= this.WIDTH && this.IMAGE_HEIGHT <= this.HEIGHT) ||
          this.scaleStep < 0)) ||
      (type && this.IMAGE_WIDTH >= this.imageOriginMax * 10)
    )
      return;

    let currentZoomLevel = this.ZoomLevel;
    let zoomStep = 10;
    let newZoomLevel = currentZoomLevel;
    let zoomResetScale = 100 / currentZoomLevel;
    if (type) {
      newZoomLevel += zoomStep;
      if (newZoomLevel > 400) newZoomLevel = 400;
      // this.scaleStep++;
    } else {
      newZoomLevel -= zoomStep;
      if (newZoomLevel < 100) newZoomLevel = 100;
      // this.scaleStep--;
    }
    let realToLeft = 0;
    let realToRight = 0;
    const [x, y] = this.mouse || [];
    if (byMouse) {
      realToLeft = (x - this.originX) / this.scale;
      realToRight = (y - this.originY) / this.scale;
    }
    const abs = Math.abs(this.scaleStep);
    const width = this.IMAGE_WIDTH;
    let originalImageWidth = this.IMAGE_WIDTH * zoomResetScale;
    let originalImageHeight = this.IMAGE_HEIGHT * zoomResetScale;
    this.IMAGE_WIDTH = Math.round(originalImageWidth * (newZoomLevel / 100));
    this.IMAGE_HEIGHT = Math.round(originalImageHeight * (newZoomLevel / 100));
    this.ZoomLevel = newZoomLevel;
    if (byMouse) {
      this.originX -= x / (this.scale * newZoomLevel) - x / this.scale;
      this.originY -= y / (this.scale * newZoomLevel) - y / this.scale;
    } else {
      const scale = this.IMAGE_WIDTH / width;
      this.originX = this.WIDTH / 2 - (this.WIDTH / 2 - this.originX) * scale;
      this.originY = this.HEIGHT / 2 - (this.HEIGHT / 2 - this.originY) * scale;
    }
    if (!pure && currentZoomLevel !== newZoomLevel) {
      this.update();
    }
  }

  /**
   * 适配背景图
   */
  fitZoom() {
    this.calcStep();
    if (this.IMAGE_HEIGHT / this.IMAGE_WIDTH >= this.HEIGHT / this.WIDTH) {
      this.IMAGE_WIDTH =
        this.IMAGE_ORIGIN_WIDTH / (this.IMAGE_ORIGIN_HEIGHT / this.HEIGHT);
      this.IMAGE_HEIGHT = this.HEIGHT;
    } else {
      this.IMAGE_WIDTH = this.WIDTH;
      this.IMAGE_HEIGHT =
        this.IMAGE_ORIGIN_HEIGHT / (this.IMAGE_ORIGIN_WIDTH / this.WIDTH);
    }
    this.originX = 0;
    this.originY = 0;
    this.ZoomLevel = 100;
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
    this.image.removeEventListener("load", this.handleLoad);
    this.canvas.removeEventListener("contextmenu", this.handleContextmenu);
    this.canvas.removeEventListener("mousewheel", this.handleMousewheel);
    this.canvas.removeEventListener("wheel", this.handleMousewheel);
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("touchend", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handelMouseMove);
    this.canvas.removeEventListener("touchmove", this.handelMouseMove);
    this.canvas.removeEventListener("mouseup", this.handelMouseUp);
    this.canvas.removeEventListener("mouseleave", this.handelLeave);
    this.canvas.removeEventListener("touchend", this.handelMouseUp);
    this.canvas.removeEventListener("dblclick", this.handelDblclick);
    document.body.removeEventListener("keyup", this.handelKeyup);
    this.canvas.parentElement.removeEventListener("scroll", this.handleScroll);
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.canvas.style.width = null;
    this.canvas.style.height = null;
    this.canvas.style.userSelect = null;
  }
  /**
   * 重新设置画布大小
   */
  resize() {
    this.canvas.width = null;
    this.canvas.height = null;
    this.canvas.style.width = null;
    this.canvas.style.height = null;
    this.initSetting();
    this.update();
  }
}
