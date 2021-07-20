import { BaseShape, Point } from './Types';
export default class Polygon implements BaseShape {
    index: number;
    label: string;
    type: number;
    active: boolean;
    creating: boolean;
    dragging: boolean;
    coor: Point[];
    constructor(coor: Point[], index: number);
    uuid: string;
    get ctrlsData(): Point[];
}
