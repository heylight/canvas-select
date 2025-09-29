import Shape from './Shape';

export default class Polygon extends Shape {
  public type = 2
  constructor(item: any, index: number, base: any) {
    super(item, index)
    this.fillStyle = item.fillStyle ?? base.fillStyle
    this.strokeStyle = item.strokeStyle ?? base.strokeStyle
  }
  get ctrlsData() {
    return this.coor.length > 2 ? this.coor : [];
  }
}
