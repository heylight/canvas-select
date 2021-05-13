import { BaseShape, Point } from './Types';

export default class Polygon implements BaseShape {
  index: number

  label: string = ''

  type: number = 2

  active: boolean = false

  creating: boolean = false

  dragging: boolean = false

  finish?: boolean = true

  coor: Point[]

  constructor(coor: Point[], index: number) {
    this.coor = coor;
    this.index = index;
  }

  uuid: string

  get ctrlsData() {
    return this.coor.length > 2 ? this.coor : [];
  }
}
