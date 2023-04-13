import Shape from "./Shape";

export default class Connectivity extends Shape {
  public type = 6;
  constructor(item: any, index: number) {
    super(item, index);
  }
  get ctrlsData() {
    return this.coor.length > 1 ? this.coor : [];
  }
}
