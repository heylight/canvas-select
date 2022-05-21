import { Point } from '../Types';
import Shape from './Shape';

export default class Rect extends Shape {
  type: number = 1
  constructor(coor: Point[], index?: number, label?: string, style = {}, uuid?: string) {
    super(index, label, style, uuid)
    this.coor = coor;
  }
  get ctrlsData() {
    const [[x0, y0], [x1, y1]] = this.coor as Point[];
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
