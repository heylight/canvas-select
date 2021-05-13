import { BaseShape, Point } from './Types';
export default class Polygon implements BaseShape {
    index: number;
    label: string;
    type: number;
    active: boolean;
    creating: boolean;
    dragging: boolean;
    finish?: boolean;
    coor: Point[];
    constructor(coor: Point[], index: number);
    uuid: string;
    get ctrlsData(): Point[];
}
