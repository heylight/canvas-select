import Shape from './Shape';

export default class Polygon extends Shape {
  public type = 2
  constructor(item: any, index: number) {
    super(item, index)
  }
  get ctrlsData() {
    return this.coor.length > 2 ? this.coor : [];
  }
}
