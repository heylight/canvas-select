export interface BaseShape {
    label?: string;
    type: number;
    active: boolean;
    creating?: boolean;
    dragging?: boolean;
    index: number;
    uuid: string;
}
export declare type Point = [number, number];
export interface Style {
    strokeStyle: string;
    fillStyle: string;
}
export interface Label {
    font: string;
    height: string;
    textMaxLen: number;
    fillStyle: string;
}
export interface Ctrl {
    strokeStyle: string;
    fillStyle: string;
    r: number;
}
