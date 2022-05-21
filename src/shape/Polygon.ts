import { Point } from '../Types';
import Shape from './Shape';

export default class Polygon extends Shape {
  type: number = 2
  constructor(coor: Point[], index?: number, label?: string, style = {}, uuid?: string) {
    super(index, label, style, uuid)
    this.coor = coor;
  }
  get ctrlsData() {
    return this.coor.length > 2 ? this.coor : [];
  }
}
