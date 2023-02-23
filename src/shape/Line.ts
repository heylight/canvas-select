import Shape from './Shape';

export default class Line extends Shape {
  public type = 4
  constructor(item: any, index: number) {
    super(item, index)
  }
  get ctrlsData() {
    return this.coor.length > 1 ? this.coor : [];
  }
}
