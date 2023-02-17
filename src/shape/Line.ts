import { Point } from '../Types';
import Shape from './Shape';

export default class Line extends Shape {
  type: number = 4
  constructor(coor: Point[], index?: number, label?: string, style = {}, uuid?: string) {
    super(index, label, style, uuid)
    this.coor = coor;
  }
  get ctrlsData() {
    return this.coor.length > 1 ? this.coor : [];
  }
}
