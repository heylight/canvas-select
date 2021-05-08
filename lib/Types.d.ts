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
