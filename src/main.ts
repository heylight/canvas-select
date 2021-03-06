type Coordinate = number[][]
interface ShapeData {
  label: string
  active?: boolean
  creating?: boolean
  dragging?: boolean
  coor: Coordinate
  index: number
  width: number
  height: number
}
interface Remmber {
  left: number
  top: number
  right?: number
  bottom?: number
}
class CanvasSelect {
  MIN_WIDTH = 20
  MIN_HEIGHT = 20
  CTRL_R = 3
  EventList: [] = []
  width: number
  height: number
  strokeStyle: string = '#000'
  activeStrokeStyle: string = '#f00'
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  container: HTMLElement
  dataset: ShapeData[]
  offlineCanvas: HTMLCanvasElement
  offlineCtx: CanvasRenderingContext2D
  remmber: Remmber = { left: 0, top: 0, right: 0, bottom: 0 }
  ctrlIndex: number = -1
  constructor(el: string) {
    this.container = document.querySelector(el)
    this.width = this.container.clientWidth
    this.height = this.container.clientHeight
    this.canvas = document.createElement('canvas')
    this.offlineCanvas = document.createElement('canvas')
    this.canvas.width = this.offlineCanvas.width = this.width
    this.canvas.height = this.offlineCanvas.height = this.height
    this.ctx = this.canvas.getContext('2d')
    this.offlineCtx = this.offlineCanvas.getContext('2d')
    document.querySelector(el).appendChild(this.canvas)
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.ctrlIndex = this.ctrlsData.findIndex(coor => this.isPointInCtrl([e.offsetX, e.offsetY], coor))
      // 点击控制点
      if (this.ctrlIndex > -1) {
        let [x0, y0] = this.ctrlsData[this.ctrlIndex]
        this.remmber.left = e.offsetX - x0
        this.remmber.top = e.offsetY - y0
        return
      }
      // 点击矩形,保证后加入的矩形先检测
      this.dataset.reverse()
      let targetRect = this.dataset.find(item => this.isPointInArea([e.offsetX, e.offsetY], item.coor))
      this.dataset.reverse()
      if (targetRect) {
        this.dataset.forEach(m => m.active = false)
        targetRect.active = true
        targetRect.dragging = true
        let targetRectIndex = this.dataset.findIndex(x => x === targetRect)
        this.dataset.splice(targetRectIndex, 1)
        this.dataset.push(targetRect)
        let [x0, y0] = targetRect.coor[0]
        let [x1, y1] = targetRect.coor[1]
        this.remmber.left = e.offsetX - x0
        this.remmber.top = e.offsetY - y0
        this.remmber.right = x1 - e.offsetX
        this.remmber.bottom = y1 - e.offsetY
        this.update()
        this.emit('select', targetRect, e)
        return
      }
      //点击空白区域
      this.dataset.forEach(m => m.active = false)
      this.remmber.left = e.offsetX
      this.remmber.top = e.offsetY
      this.dataset.push(this.parseData({
        label: '',
        coor: [[e.offsetX, e.offsetY], [e.offsetX, e.offsetY]],
        creating: true,
      }, this.dataset.length))
      this.update()

    })
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (e.buttons === 1) {
        let { left, top, right, bottom } = this.remmber
        if (this.ctrlIndex > -1) {
          // resize矩形
          let [[x0, y0], [x1, y1]] = this.activeShapeData.coor
          let coor: Coordinate = []
          switch (this.ctrlIndex) {
            case 0:
              coor = [[e.offsetX - left, e.offsetY - top], [x1, y1]]
              break;
            case 1:
              coor = [[x0, e.offsetY - top], [x1, y1]]
              break;
            case 2:
              coor = [[x0, e.offsetY - top], [e.offsetX - left, y1]]
              break;
            case 3:
              coor = [[x0, y0], [e.offsetX - left, y1]]
              break;
            case 4:
              coor = [[x0, y0], [e.offsetX - left, e.offsetY - top]]
              break;
            case 5:
              coor = [[x0, y0], [x1, e.offsetY - top]]
              break;
            case 6:
              coor = [[e.offsetX - left, y0], [x1, e.offsetY - top]]
              break;
            case 7:
              coor = [[e.offsetX - left, y0], [x1, y1]]
              break;
            default:
              break;
          }
          let [[a0, b0], [a1, b1]] = coor
          if ((a1 - a0) >= this.MIN_WIDTH && (b1 - b0) >= this.MIN_HEIGHT) {
            this.activeShapeData.coor = coor
          } else {
            this.emit('error', `宽不能小于${this.MIN_WIDTH},高不能小于${this.MIN_HEIGHT}`)
          }
        } else if (this.activeShapeData && this.activeShapeData.dragging) {
          // 拖动矩形
          if (e.offsetX - left >= 0 && e.offsetX + right <= this.width
            && e.offsetY - top >= 0 && e.offsetY + bottom <= this.height) {
            let newStart = [e.offsetX - left, e.offsetY - top]
            let newEnd = [e.offsetX + right, e.offsetY + bottom]
            this.activeShapeData.coor = [newStart, newEnd]
          }
        } else if (this.createShapeData) {
          // 创建矩形
          let newStart = [left, top]
          let newEnd = [e.offsetX, e.offsetY]
          this.createShapeData.coor = [newStart, newEnd]
        }
        this.update()
      }
    })
    this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      this.dataset.forEach(x => x.dragging = false)
      let creatorIndex = this.dataset.findIndex(x => x.creating)
      if (creatorIndex > -1) {
        let creator = this.dataset[creatorIndex]
        creator.creating = false
        let [[x0, y0], [x1, y1]] = creator.coor
        if (Math.abs(x0 - x1) < this.MIN_WIDTH || Math.abs(y0 - y1) < this.MIN_HEIGHT) {
          this.dataset.splice(creatorIndex, 1)
          this.emit('error', `宽不能小于${this.MIN_WIDTH},高不能小于${this.MIN_HEIGHT}`)
          this.update()
        }
        else {
          const [[x0, y0], [x1, y1]] = creator.coor
          creator.coor = [[Math.min(x0, x1), Math.min(y0, y1)], [Math.max(x0, x1), Math.max(y0, y1)]]
          this.emit('update', creator)
        }
      }
    })
    document.body.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.code === 'Backspace' && e.shiftKey) {
        let index = this.dataset.findIndex(x => x.active)
        let item = this.dataset.find(x => x.active)
        if (item) {
          this.dataset.splice(index, 1)
          this.update()
          this.emit('delete', item)
        }
      }
    })
    document.body.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.shiftKey) {
        if (this.activeShapeData) {
          let [x1, y1] = this.activeShapeData.coor[0]
          let [x2, y2] = this.activeShapeData.coor[1]
          switch (e.key) {
            case 'ArrowDown':
              this.activeShapeData.coor = [[x1, y1 + 1], [x2, y2 + 1]]
              break;
            case 'ArrowUp':
              this.activeShapeData.coor = [[x1, y1 - 1], [x2, y2 - 1]]
              break;
            case 'ArrowLeft':
              this.activeShapeData.coor = [[x1 - 1, y1], [x2 - 1, y2]]
              break;
            case 'ArrowRight':
              this.activeShapeData.coor = [[x1 + 1, y1], [x2 + 1, y2]]
              break;
            default:
              break;
          }
          this.update()
        }
      }
    })
  }
  get activeShapeData(): ShapeData {
    return this.dataset.find(x => x.active)
  }
  get createShapeData(): ShapeData {
    return this.dataset.find(x => x.creating)
  }
  get ctrlsData() {
    if (this.activeShapeData) {
      let [x0, y0] = this.activeShapeData.coor[0]
      return [
        [x0, y0],
        [x0 + this.activeShapeData.width / 2, y0],
        [x0 + this.activeShapeData.width, y0],
        [x0 + this.activeShapeData.width, y0 + this.activeShapeData.height / 2],
        [x0 + this.activeShapeData.width, y0 + this.activeShapeData.height],
        [x0 + this.activeShapeData.width / 2, y0 + this.activeShapeData.height],
        [x0, y0 + this.activeShapeData.height],
        [x0, y0 + this.activeShapeData.height / 2],
      ]
    }
    return []
  }
  get data() {
    return this.dataset.map(({ label, coor }) => ({ label, coor }))
  }
  /**
   * 判断是否在矩形内
   * @param point 点击坐标
   * @param area 目标区域
   */
  isPointInArea(point: number[], area: number[][]) {
    const [x1, y1] = area[0]
    const [x2, y2] = area[1]
    this.offlineCtx.clearRect(0, 0, this.width, this.height)
    this.offlineCtx.fillRect(x1, y1, x2 - x1, y2 - y1)
    let areaData = this.offlineCtx.getImageData(0, 0, this.width, this.height)
    let index = (point[1] - 1) * this.width * 4 + point[0] * 4;
    return areaData.data[index + 3] != 0;
  }
  /**
   * 判断是否在控制点内
   * @param point 点击坐标
   * @param area 目标区域
   */
  isPointInCtrl(point: number[], area: number[]) {
    const [x, y] = area
    this.offlineCtx.clearRect(0, 0, this.width, this.height)
    this.offlineCtx.beginPath()
    this.offlineCtx.arc(x, y, this.CTRL_R, 0, Math.PI * 2)
    this.offlineCtx.fill()
    let areaData = this.offlineCtx.getImageData(0, 0, this.width, this.height)
    let index = (point[1] - 1) * this.width * 4 + point[0] * 4;
    return areaData.data[index + 3] != 0;
  }
  /**
   * 设置初始画布
   * @param data 初始化数据
   */
  setData(data: object[]) {
    this.dataset = data.map((x, index) => this.parseData(x, index))
    this.update()
  }
  /**
   * 数据转换
   * @param item 要转化的数据
   */
  parseData(item: object, index: number): ShapeData {
    const { label, coor, creating } = this.deepCopy(item)
    return {
      label,
      index,
      active: false,
      creating: Boolean(creating),
      coor,
      get width() {
        return this.coor[1][0] - this.coor[0][0]
      },
      get height() {
        return this.coor[1][1] - this.coor[0][1]
      }
    }
  }
  /**
   * 深拷贝
   * @param obj 对象
   * @returns object
   */
  deepCopy(obj: object) {
    return JSON.parse(JSON.stringify(obj))
  }
  // 绘制矩形
  drawShape(item: ShapeData) {
    const [a, b] = item.coor
    this.ctx.save()
    this.ctx.strokeStyle = (item.active || item.creating) ? this.activeStrokeStyle : this.strokeStyle
    this.ctx.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1])
    this.ctx.restore()
    this.drawLabel(a, item.label)
  }
  // 绘制label
  drawLabel(point: number[], str: string) {
    if (str.length) {
      let newStr = str.length < 5 ? str : (str.substr(0, 4) + '...')
      let text = this.ctx.measureText(newStr)
      this.ctx.save()
      this.ctx.fillStyle = '#fff'
      this.ctx.fillRect(point[0] + 1, point[1] + 1, text.width + 4, 16)
      this.ctx.font = "12px serif #000"
      this.ctx.strokeText(newStr, point[0] + 2, point[1] + 12, 80);
      this.ctx.restore()
    }
  }
  // 绘制控制点
  drawCircle(item: number[]) {
    const [x, y] = item
    this.ctx.save()
    this.ctx.beginPath();
    this.ctx.fillStyle = '#fff'
    this.ctx.arc(x, y, this.CTRL_R, 0, 2 * Math.PI, true)
    this.ctx.fill();
    this.ctx.arc(x, y, this.CTRL_R, 0, 2 * Math.PI, true)
    this.ctx.stroke()
    this.ctx.restore()
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  // 更新画布
  update() {
    this.clear()
    this.dataset.forEach(item => this.drawShape(item))
    this.ctrlsData.forEach(item => this.drawCircle(item))
  }
  // 删除指定矩形
  deleteByIndex(index: number) {
    let num = this.dataset.findIndex(x => x.index === index)
    if (num > -1) {
      this.emit('delete', this.dataset[num])
      this.dataset.splice(num, 1)
      this.update()
    }
  }
  /**
   * 注册事件
   * @param eventName 事件名称
   * @param cb 回调方法
   */
  on(eventName: string, cb: Function) {
    let fns = this.EventList[eventName];
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
    let fns = this.EventList[eventName];
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
    let fns = this.EventList[eventName];
    let index = fns.find((fn: Function) => fn === cb)
    if (Array.isArray(fns) && index) {
      fns.splice(index, 1);
    }
  }
}

export default CanvasSelect