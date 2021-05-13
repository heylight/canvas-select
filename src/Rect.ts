import { BaseShape, Point } from './Types';

export default class Rect implements BaseShape {
  index: number

  label: string = ''

  type: number = 1

  active: boolean = false

  creating: boolean = false

  dragging: boolean = false

  coor: Point[]

  constructor(coor: Point[], index: number) {
    this.coor = coor;
    this.index = index;
  }

  uuid: string

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
}
