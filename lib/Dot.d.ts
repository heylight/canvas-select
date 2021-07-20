import { BaseShape, Point } from './Types';
export default class Dot implements BaseShape {
    index: number;
    label: string;
    type: number;
    active: boolean;
    dragging: boolean;
    coor: Point;
    constructor(coor: Point, index: number);
    uuid: string;
}
