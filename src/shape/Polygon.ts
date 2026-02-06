import Shape from './Shape';

export default class Polygon extends Shape {
  public type = 2
  constructor(item: any, index: number, base: any) {
    super(item, index)
    // 只提取需要的属性，不持有base的引用
    this.fillStyle = item.fillStyle ?? base?.fillStyle
    this.strokeStyle = item.strokeStyle ?? base?.strokeStyle
    // 确保不会意外保存base引用
    if (item.base) {
      delete item.base;
    }
  }
  get ctrlsData() {
    return this.coor.length > 2 ? this.coor : [];
  }
}
