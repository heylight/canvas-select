import Shape from './Shape';
import Rect from './Rect'

export default class Grid extends Shape {
  public type = 6
  public row = 1
  public col = 1
  public selected: number[] = []
  public selectedFillStyle: string | undefined

  constructor(item: any, index: number, base: any) {
    super(item, index)
    this.row = item.row > 0 ? item.row : this.row
    this.col = item.col > 0 ? item.col : this.col
    this.selected = Array.isArray(item.selected) ? item.selected : []
    this.fillStyle = item.fillStyle ?? base.fillStyle
    this.strokeStyle = item.strokeStyle ?? base.strokeStyle
  }

  get ctrlsData() {
    const [[x0, y0], [x1, y1]] = this.coor;
    return [
      [x0, y0],
      [x0 + (x1 - x0) / 2, y0],
      [x1, y0],
      [x1, y0 + (y1 - y0) / 2],
      [x1, y1],
      [x0 + (x1 - x0) / 2, y1],
      [x0, y1],
      [x0, y0 + (y1 - y0) / 2],
    ];
  }

  get gridRects() {
    const [[x0, y0], [x1, y1]] = this.coor;
    const { row, col, strokeStyle, fillStyle, active, creating, lineWidth } = this;
    const w = (x1 - x0) / this.col;
    const h = (y1 - y0) / this.row;
    const list: Rect[] = []
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        const startPoint = [x0 + j * w, y0 + i * h];
        const index = i * col + j;
        const shape = new Rect({
          coor: [startPoint, [startPoint[0] + w, startPoint[1] + h]],
          strokeStyle, fillStyle, active, creating, lineWidth
        }, index, {});
        list.push(shape)
      }
    }
    return list;
  }
}
