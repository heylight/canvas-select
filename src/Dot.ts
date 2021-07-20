import { BaseShape, Point } from './Types';

export default class Dot implements BaseShape {
  index: number

  label: string = ''

  type: number = 3

  active: boolean = false

  dragging: boolean = false

  coor: Point

  constructor(coor: Point, index: number) {
    this.coor = coor;
    this.index = index;
  }

  uuid: string
}
