import Shape from './Shape';

export default class Line extends Shape {
  public type = 4
  constructor(item: any, index: number, base: any) {
    super(item, index)
    // 只提取需要的属性，不持有base的引用
    this.strokeStyle = item.strokeStyle ?? base?.strokeStyle
    // 确保不会意外保存base引用
    if (item.base) {
      delete item.base;
    }
  }
  get ctrlsData() {
    return this.coor.length > 1 ? this.coor : [];
  }
}
